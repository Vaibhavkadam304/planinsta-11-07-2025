// app/utils/exportBusinessPlanDocx.ts
import {
  Table,
  TableRow,
  TableCell,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  ShadingType,
  WidthType,
  Footer,
  TableOfContents,
  SimpleField,
  HeadingLevel,
} from "docx";
import { saveAs } from "file-saver";
import type { BusinessPlanData, GeneratedPlan } from "@/components/plan-builder/PlanBuilderClient";

const coercePlan = (input: any) => {
  try {
    if (!input) return {};
    if (typeof input === "string") return JSON.parse(input);
    if (input?.plan_json) {
      try {
        return JSON.parse(input.plan_json);
      } catch {}
    }
    return input || {};
  } catch {
    return {};
  }
};

const makeSafe = (obj: any) => {
  const ARRAY_KEYS = new Set([
    "revenueForecast",
    "cogs",
    "opEx",
    "projectedPnl",
    "cashFlowRunwayAnalysis",
    // NEW: ensure funding.usageOfFunds is always an array
    "usageOfFunds",
  ]);
  const SECTION_KEYS = new Set([
    "executiveSummary",
    "companyOverview",
    "products",
    "marketAnalysis",
    "marketingSalesStrategies",
    "operationsPlan",
    "managementOrganization",
    "financialPlan",
    "riskAnalysisMitigation",
    "appendices",
    // NEW: treat nested funding as a sub-section
    "funding",
  ]);

  const wrap = (v: any): any => {
    if (Array.isArray(v)) return v;
    if (v && typeof v === "object") {
      return new Proxy(v, {
        get(target, prop: string) {
          const val = (target as any)[prop];
          if (val === undefined || val === null) {
            if (ARRAY_KEYS.has(prop)) return [];
            if (SECTION_KEYS.has(prop)) return wrap({});
            return "";
          }
          if (Array.isArray(val)) return val;
          if (typeof val === "object") return wrap(val);
          return typeof val === "string" ? val : String(val);
        },
      });
    }
    return v ?? "";
  };

  return wrap(obj || {});
};

// ──────────────────────────────────────────────────────────────
// Markdown helpers (bold + hyphen bullets; strip emojis)
// ──────────────────────────────────────────────────────────────
function stripEmojis(s: string) {
  try {
    return (s || "").replace(/[\p{Extended_Pictographic}]/gu, "");
  } catch {
    return s || "";
  }
}

// Convert inline **bold** segments to TextRun[] (very small markdown subset)
function runsFromInlineMarkdown(text: string): TextRun[] {
  const t = stripEmojis(text ?? "");
  const parts = t.split(/\*\*([^*]+)\*\*/g); // split on **bold**
  const runs: TextRun[] = [];
  parts.forEach((part, idx) => {
    if (!part) return;
    if (idx % 2 === 1) {
      runs.push(new TextRun({ text: part, bold: true }));
    } else {
      runs.push(new TextRun({ text: part }));
    }
  });
  return runs.length ? runs : [new TextRun({ text: t })];
}

// Render a block of markdown-ish text into Paragraph[]
// Supports:
// - blank line = spacer
// - line "**Heading**" = bold line (BodyText style)
// - line "- item" = bullet
// - everything else = normal paragraph
function md(text: string, opts?: { bodyStyle?: string }): Paragraph[] {
  const style = opts?.bodyStyle ?? "BodyText";
  const lines = (stripEmojis(text ?? "") || "").replace(/\r\n/g, "\n").split("\n");
  const out: Paragraph[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      out.push(new Paragraph({ text: "", style }));
      continue;
    }

    // Bold subhead if the whole line is **...**
    const mBoldLine = line.match(/^\*\*(.+)\*\*$/);
    if (mBoldLine) {
      out.push(
        new Paragraph({
          children: [new TextRun({ text: mBoldLine[1].trim(), bold: true })],
          style,
        })
      );
      continue;
    }

    // Bullet line "- ..."
    if (/^- /.test(line)) {
      const t = line.replace(/^- +/, "");
      out.push(
        new Paragraph({
          children: runsFromInlineMarkdown(t),
          style: "BulletText",
          bullet: {
            level: 0,
            reference: "SmallCircle",
          },
        })
      );
      continue;
    }

    // Default paragraph with inline bold
    out.push(new Paragraph({ children: runsFromInlineMarkdown(line), style }));
  }

  return out;
}

// ──────────────────────────────────────────────────────────────
// Deterministic label helpers (for legal structure text, etc.)
// ──────────────────────────────────────────────────────────────
const titleCase = (s: string) =>
  (s || "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");

const labelizeLegal = (s?: string) => {
  const t = (s || "").trim().toLowerCase();
  const map: Record<string, string> = {
    "sole proprietorship": "Sole Proprietorship",
    "private limited": "Private Limited Company",
    "pvt ltd": "Private Limited Company",
    "llp": "Limited Liability Partnership (LLP)",
  };
  return map[t] || titleCase(t);
};

export async function exportBusinessPlanDocx(
  planData: Partial<BusinessPlanData> = {},
  generatedPlan: GeneratedPlan | string | Record<string, any>
) {
  const rawPlan = coercePlan(generatedPlan);
  const safePlan = makeSafe(rawPlan) as any;
  const capFirst = (s: string) =>
    s ? s.trim().charAt(0).toUpperCase() + s.trim().slice(1) : "";

  const {
    executiveSummary,
    companyOverview,
    products,
    marketAnalysis,
    marketingSalesStrategies,
    operationsPlan,
    managementOrganization,
    financialPlan,
    riskAnalysisMitigation,
    appendices,
    businessName: planBusinessName,
    companyName: planCompanyName,
  } = safePlan;

  const docTitle =
    planData?.businessName || planBusinessName || planCompanyName || "Business Plan";

  const productCount = Array.isArray(planData.products) ? planData.products.length : 0;

  // Footer with page numbers
  const pageFooter = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun("Page "),
          new SimpleField("PAGE"),
          new TextRun(" of "),
          new SimpleField("NUMPAGES"),
        ],
      }),
    ],
  });

  // Headings helpers (real built-in heading levels for TOC)
  const H1 = (text: string) =>
    new Paragraph({ text, heading: HeadingLevel.HEADING_1, pageBreakBefore: true });
  const H2 = (text: string) =>
    new Paragraph({ text, heading: HeadingLevel.HEADING_2 });

  // Visual spacer between a main section (H1) and its first H2
  const Spacer = () =>
    new Paragraph({ text: "", spacing: { after: 200 } });

  // Compose Mission text with optional upcoming milestone (from quiz)
  const missionWithMilestone =
    (companyOverview.missionStatement || "") +
    (planData?.upcomingMilestone
      ? `\n\nUpcoming milestone: ${planData.upcomingMilestone}`
      : "");

  // Build Usage of Funds table rows from exec summary funding
  const usageRows: Array<{ department: string; allocationPercent: string; amount: string; howUsed: string }> =
    Array.isArray(executiveSummary?.funding?.usageOfFunds)
      ? executiveSummary.funding.usageOfFunds.map((r: any) => ({
          department: String(r?.department ?? ""),
          allocationPercent: `${Number(r?.allocationPercent ?? 0)}%`,
          amount: String(r?.amount ?? ""),
          howUsed: String(r?.howUsed ?? ""),
        }))
      : [];

  // Sum of allocation for a total row (optional)
  const totalPct = usageRows.reduce((a, r) => a + (parseFloat(String(r.allocationPercent).replace("%", "")) || 0), 0);

  // ──────────────────────────────────────────────────────────────
  // NEW: Deterministic content for Legal & Founding Team from planData
  // ──────────────────────────────────────────────────────────────
  const owners = Array.isArray(planData.ownership) ? planData.ownership : [];
  const ownershipLines = owners
    .filter((o) => o && (o.name || o.role || o.ownershipPercent != null))
    .map(
      (o) =>
        `- ${o.name || "Owner"} — ${o.role || "Role"}${
          o.ownershipPercent != null ? ` — ${o.ownershipPercent}%` : ""
        }`
    )
    .join("\n");

  const legalMd = [
    `- **Legal Structure:** ${labelizeLegal((planData as any).legalStructure) || "Not specified"}`,
    `- **Country/State of Incorporation:** ${planData.incorporationCountry || "Not specified"} / ${planData.incorporationState || "Not specified"}`,
    ownershipLines ? "- **Ownership & Founders:**" : "",
    ownershipLines,
  ]
    .filter(Boolean)
    .join("\n");

  const foundersArr = Array.isArray(planData.founders) ? planData.founders : [];
  const foundingMd =
    foundersArr.length > 0
      ? foundersArr
          .filter((f) => f && (f.name || f.title || f.linkedinUrl || f.bio))
          .map((f) => {
            const line = `- ${f.name || "Founder"} — ${f.title || "Title"}${
              f.linkedinUrl ? ` — ${f.linkedinUrl}` : ""
            }`;
            return f.bio ? `${line}\n${f.bio}` : line;
          })
          .join("\n")
      : "- Not specified";

  const doc = new Document({
    styles: {
      paragraphStyles: [
        {
          id: "TitleStyle",
          name: "Custom Title",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 48, bold: true, font: "Calibri Light", color: "000000" },
          paragraph: { spacing: { after: 300 }, alignment: AlignmentType.CENTER },
        },
        {
          id: "CoverTitle",
          name: "Cover Title",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 48, bold: true, font: "Microsoft YaHei UI", color: "000000" },
          paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 3600, after: 120 } },
        },
        {
          id: "CoverSubtitle",
          name: "Cover Subtitle",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 56, bold: true, font: "Microsoft YaHei UI", color: "000000" },
          paragraph: { alignment: AlignmentType.CENTER, spacing: { after: 300 } },
        },

        // Force built-in Heading 1/2 to be black and add spacing
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 32, bold: true, font: "Calibri", color: "000000" },
          paragraph: { spacing: { before: 300, after: 240 } },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 24, bold: true, font: "Calibri", color: "000000" },
          paragraph: { spacing: { before: 200, after: 120 } },
        },

        {
          id: "BodyText",
          name: "Body Text",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 22, font: "Calibri", color: "000000" },
          paragraph: { spacing: { line: 276, after: 100 }, alignment: AlignmentType.JUSTIFIED },
        },

        // Bullet paragraph style (used by md() for "- ..." lines)
        {
          id: "BulletText",
          name: "Bullet Text",
          basedOn: "BodyText",
          next: "BodyText",
          quickFormat: true,
          paragraph: {
            indent: { left: 720 },
            spacing: { after: 60 },
          },
        },
      ],
      // @ts-ignore
      tableStyles: [
        {
          id: "BusinessPlanTable",
          name: "Business Plan Table",
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
            left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
            right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "EEEEEE" },
            insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "EEEEEE" },
          },
          cellMargin: { top: 100, bottom: 100, left: 100, right: 100 },
        },
      ],
    },

    numbering: {
      config: [
        {
          reference: "SmallCircle",
          levels: [
            {
              level: 0,
              format: "bullet",
              text: "◦",
              alignment: AlignmentType.LEFT,
              style: {
                run: { size: 18 },
                paragraph: { indent: { left: 720 } },
              },
            },
          ],
        },
      ],
    },

    sections: [
      {
        properties: {
          page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
        },
        footers: { default: pageFooter },
        children: [
          // Cover
          new Paragraph({ text: capFirst(docTitle), style: "CoverTitle" }),
          new Paragraph({ text: "Business Plan", style: "CoverSubtitle" }),

          // TOC (own page)
          new Paragraph({ text: "Table of Contents", style: "TitleStyle", pageBreakBefore: true }),
          new TableOfContents("", {
            headingStyleRange: "1-2",
          }),

          // 1. Executive Summary
          H1("Executive Summary"),
          Spacer(),
          H2("Business Overview"),
          ...md(executiveSummary.businessOverview, { bodyStyle: "BodyText" }),

          H2("Our Mission"),
          ...md(executiveSummary.ourMission, { bodyStyle: "BodyText" }),

          H2("Funding Requirements & Usage of Funds"),
          ...md(executiveSummary.funding?.p1 || "", { bodyStyle: "BodyText" }),
          // Table: Usage of Funds
          new Table({
            style: "BusinessPlanTable",
            alignment: AlignmentType.CENTER,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [new Paragraph({ text: "Department", style: "BodyText" })],
                  }),
                  new TableCell({
                    width: { size: 2000, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [new Paragraph({ text: "Allocation %", style: "BodyText" })],
                  }),
                  new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [new Paragraph({ text: "Amount", style: "BodyText" })],
                  }),
                  new TableCell({
                    width: { size: 4000, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [new Paragraph({ text: "How it will be used", style: "BodyText" })],
                  }),
                ],
              }),
              ...usageRows.map((r) =>
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: r.department, style: "BodyText" })] }),
                    new TableCell({ children: [new Paragraph({ text: r.allocationPercent, style: "BodyText" })] }),
                    new TableCell({ children: [new Paragraph({ text: r.amount, style: "BodyText" })] }),
                    new TableCell({ children: [new Paragraph({ text: r.howUsed, style: "BodyText" })] }),
                  ],
                })
              ),
              ...(usageRows.length
                ? [
                    new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph({ text: "Total", style: "BodyText" })] }),
                        new TableCell({ children: [new Paragraph({ text: `${Math.round(totalPct)}%`, style: "BodyText" })] }),
                        new TableCell({ children: [new Paragraph({ text: "", style: "BodyText" })] }),
                        new TableCell({ children: [new Paragraph({ text: "", style: "BodyText" })] }),
                      ],
                    }),
                  ]
                : []),
            ],
          }),
          ...md(executiveSummary.funding?.p2 || "", { bodyStyle: "BodyText" }),

          H2("Problem Statement"),
          ...md(executiveSummary.problemStatement, { bodyStyle: "BodyText" }),

          H2("Solution"),
          ...md(executiveSummary.solution, { bodyStyle: "BodyText" }),

          // 2. Company Overview
          H1("Company Overview"),
          Spacer(),
          H2("Vision Statement"),
          new Paragraph({ text: companyOverview.visionStatement, style: "BodyText" }),
          H2("Mission Statement"),
          ...md(missionWithMilestone, { bodyStyle: "BodyText" }),

          // ⬇️ UPDATED: Use deterministic sections from planData ⬇️
          H2("Legal Structure & Ownership"),
          ...md(legalMd, { bodyStyle: "BodyText" }),
          H2("Founding Team"),
          ...md(foundingMd, { bodyStyle: "BodyText" }),
          // ⬆️ UPDATED ⬆️

          // 3. Products
          H1("Products"),
          Spacer(),
          H2("Overview"),
          new Paragraph({ text: products.overview, style: "BodyText" }),

          ...Array.from({ length: productCount }, (_, idx) => {
            const i = idx + 1;
            const name = planData.products?.[idx]?.name;
            const content = (products as any)[`product${i}`] as string | undefined;
            return [
              H2(`Product ${i}${name ? `: ${name}` : ""}`),
              ...(content ? md(content, { bodyStyle: "BodyText" }) : [new Paragraph({ text: "", style: "BodyText" })]),
            ];
          }).flat(),

          H2("Unique Selling Propositions (USPs)"),
          ...md(products.uniqueSellingPropositions, { bodyStyle: "BodyText" }),

          H2("Development Roadmap"),
          ...md(products.developmentRoadmap, { bodyStyle: "BodyText" }),

          H2("Intellectual Property & Regulatory Status"),
          new Paragraph({ text: products.intellectualPropertyRegulatoryStatus, style: "BodyText" }),

          // 4. Market Analysis
          H1("Market Analysis"),
          Spacer(),
          H2("Industry Overview & Size"),
          new Paragraph({ text: marketAnalysis.industryOverviewSize, style: "BodyText" }),
          H2("Growth Trends & Drivers"),
          new Paragraph({ text: marketAnalysis.growthTrendsDrivers, style: "BodyText" }),
          H2("Underlying Business Drivers"),
          new Paragraph({ text: marketAnalysis.underlyingBusinessDrivers, style: "BodyText" }),
          H2("Target Market Segmentation"),
          new Paragraph({ text: marketAnalysis.targetMarketSegmentation, style: "BodyText" }),
          H2("Customer Personas & Their Needs"),
          new Paragraph({ text: marketAnalysis.customerPersonasNeeds, style: "BodyText" }),
          H2("Competitive Landscape & Positioning"),
          new Paragraph({ text: marketAnalysis.competitiveLandscapePositioning, style: "BodyText" }),
          H2("Products’ Differentiation"),
          new Paragraph({ text: marketAnalysis.productsDifferentiation, style: "BodyText" }),
          H2("Barriers to Entry"),
          new Paragraph({ text: marketAnalysis.barriersToEntry, style: "BodyText" }),

          // 5. Marketing & Sales Strategies
          H1("Marketing & Sales Strategies"),
          Spacer(),
          H2("Distribution Channels"),
          new Paragraph({ text: marketingSalesStrategies.distributionChannels, style: "BodyText" }),
          H2("Technology Cost Structure"),
          new Paragraph({ text: marketingSalesStrategies.technologyCostStructure, style: "BodyText" }),
          H2("Customer Pricing Structure"),
          new Paragraph({ text: marketingSalesStrategies.customerPricingStructure, style: "BodyText" }),
          H2("Retention Strategies"),
          new Paragraph({ text: marketingSalesStrategies.retentionStrategies, style: "BodyText" }),
          H2("Integrated Funnel & Financial Impact"),
          new Paragraph({ text: marketingSalesStrategies.integratedFunnelFinancialImpact, style: "BodyText" }),

          // 6. Operations Plan
          H1("Operations Plan"),
          Spacer(),
          H2("Overview"),
          new Paragraph({ text: operationsPlan.overview, style: "BodyText" }),
          H2("Organizational Structure & Team Responsibilities"),
          new Paragraph({ text: operationsPlan.organizationalStructureTeamResponsibilities, style: "BodyText" }),
          H2("Infrastructure"),
          new Paragraph({ text: operationsPlan.infrastructure, style: "BodyText" }),
          H2("Customer Onboarding to Renewal Workflow"),
          new Paragraph({ text: operationsPlan.customerOnboardingToRenewalWorkflow, style: "BodyText" }),
          H2("Cross-Functional Communication & Decision-Making"),
          new Paragraph({ text: operationsPlan.crossFunctionalCommunicationDecisionMaking, style: "BodyText" }),
          H2("Key Performance Metrics & Goals"),
          new Paragraph({ text: operationsPlan.keyPerformanceMetricsGoals, style: "BodyText" }),

          // 7. Management & Organization
          H1("Management & Organization"),
          Spacer(),
          H2("Overview"),
          new Paragraph({ text: managementOrganization.overview, style: "BodyText" }),
          H2("Organizational Chart"),
          new Paragraph({ text: managementOrganization.organizationalChart, style: "BodyText" }),
          H2("Hiring Plan & Key Roles"),
          new Paragraph({ text: managementOrganization.hiringPlanKeyRoles, style: "BodyText" }),

          // 8. Financial Plan
          H1("Financial Plan"),
          Spacer(),
          H2("Overview"),
          new Paragraph({ text: financialPlan.overview, style: "BodyText" }),
          H2("Key Assumptions"),
          new Paragraph({ text: financialPlan.keyAssumptions, style: "BodyText" }),

          H2("Revenue Forecast"),
          new Table({
            style: "BusinessPlanTable",
            alignment: AlignmentType.CENTER,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [new Paragraph({ text: "Period", style: "BodyText" })],
                  }),
                  new TableCell({
                    width: { size: 6000, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [new Paragraph({ text: "Amount", style: "BodyText" })],
                  }),
                ],
              }),
              ...financialPlan.revenueForecast.map((r: any) =>
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: r.period, style: "BodyText" })] }),
                    new TableCell({ children: [new Paragraph({ text: r.amount, style: "BodyText" })] }),
                  ],
                })
              ),
            ],
          }),

          H2("Cost of Goods Sold (COGS)"),
          new Table({
            style: "BusinessPlanTable",
            alignment: AlignmentType.CENTER,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [new Paragraph({ text: "Period", style: "BodyText" })],
                  }),
                  new TableCell({
                    width: { size: 6000, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [new Paragraph({ text: "COGS", style: "BodyText" })],
                  }),
                ],
              }),
              ...financialPlan.cogs.map((r: any) =>
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: r.period, style: "BodyText" })] }),
                    new TableCell({ children: [new Paragraph({ text: r.amount, style: "BodyText" })] }),
                  ],
                })
              ),
            ],
          }),

          H2("Operating Expenses (OpEx)"),
          new Table({
            style: "BusinessPlanTable",
            alignment: AlignmentType.CENTER,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [new Paragraph({ text: "Period", style: "BodyText" })],
                  }),
                  new TableCell({
                    width: { size: 6000, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [new Paragraph({ text: "OpEx", style: "BodyText" })],
                  }),
                ],
              }),
              ...financialPlan.opEx.map((r: any) =>
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: r.period, style: "BodyText" })] }),
                    new TableCell({ children: [new Paragraph({ text: r.amount, style: "BodyText" })] }),
                  ],
                })
              ),
            ],
          }),

          H2("Projected Profit & Loss Statement (P&L)"),
          new Table({
            style: "BusinessPlanTable",
            alignment: AlignmentType.CENTER,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [new Paragraph({ text: "Period", style: "BodyText" })],
                  }),
                  new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [new Paragraph({ text: "Gross Profit", style: "BodyText" })],
                  }),
                  new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [new Paragraph({ text: "EBITDA", style: "BodyText" })],
                  }),
                  new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [new Paragraph({ text: "Net Income", style: "BodyText" })],
                  }),
                ],
              }),
              ...financialPlan.projectedPnl.map((r: any) =>
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: r.period, style: "BodyText" })] }),
                    new TableCell({ children: [new Paragraph({ text: r.grossProfit, style: "BodyText" })] }),
                    new TableCell({ children: [new Paragraph({ text: r.ebitda, style: "BodyText" })] }),
                    new TableCell({ children: [new Paragraph({ text: r.netIncome, style: "BodyText" })] }),
                  ],
                })
              ),
            ],
          }),

          H2("Cash Flow & Runway Analysis"),
          new Table({
            style: "BusinessPlanTable",
            alignment: AlignmentType.CENTER,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [new Paragraph({ text: "Period", style: "BodyText" })],
                  }),
                  new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [new Paragraph({ text: "Begin Cash", style: "BodyText" })],
                  }),
                  new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [new Paragraph({ text: "Inflows", style: "BodyText" })],
                  }),
                  new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [new Paragraph({ text: "Outflows", style: "BodyText" })],
                  }),
                  new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [new Paragraph({ text: "End Cash", style: "BodyText" })],
                  }),
                  new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [new Paragraph({ text: "Runway (mo)", style: "BodyText" })],
                  }),
                ],
              }),
              ...financialPlan.cashFlowRunwayAnalysis.map((r: any) =>
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: r.period, style: "BodyText" })] }),
                    new TableCell({ children: [new Paragraph({ text: r.beginningCash, style: "BodyText" })] }),
                    new TableCell({ children: [new Paragraph({ text: r.inflows, style: "BodyText" })] }),
                    new TableCell({ children: [new Paragraph({ text: r.outflows, style: "BodyText" })] }),
                    new TableCell({ children: [new Paragraph({ text: r.endingCash, style: "BodyText" })] }),
                    new TableCell({ children: [new Paragraph({ text: r.runwayMonths, style: "BodyText" })] }),
                  ],
                })
              ),
            ],
          }),

          H2("Key Financial Metrics & Ratios"),
          new Paragraph({ text: financialPlan.keyFinancialMetricsRatios, style: "BodyText" }),

          H2("Use of Funds & Runway"),
          ...md(financialPlan.useOfFundsRunway, { bodyStyle: "BodyText" }),

          H2("Key Sensitivity & Risk Scenarios"),
          new Paragraph({ text: financialPlan.keySensitivityRiskScenarios, style: "BodyText" }),
          H2("Summary & Outlook"),
          new Paragraph({ text: financialPlan.summaryOutlook, style: "BodyText" }),

          // 9. Risk Analysis & Mitigation
          H1("Risk Analysis & Mitigation"),
          Spacer(),
          H2("Overview"),
          new Paragraph({ text: riskAnalysisMitigation.overview, style: "BodyText" }),
          H2("Market Risks"),
          new Paragraph({ text: riskAnalysisMitigation.marketRisks, style: "BodyText" }),
          H2("Operational Risks"),
          new Paragraph({ text: riskAnalysisMitigation.operationalRisks, style: "BodyText" }),
          H2("Regulatory & Legal Risks"),
          new Paragraph({ text: riskAnalysisMitigation.regulatoryLegalRisks, style: "BodyText" }),
          H2("Financial Risks"),
          new Paragraph({ text: riskAnalysisMitigation.financialRisks, style: "BodyText" }),
          H2("Contingency Plans"),
          new Paragraph({ text: riskAnalysisMitigation.contingencyPlans, style: "BodyText" }),

          // 10. Appendices
          H1("Appendices"),
          Spacer(),
          H2("Glossary"),
          new Paragraph({ text: appendices.glossary, style: "BodyText" }),
          H2("Management Teams’ Resources"),
          new Paragraph({ text: appendices.managementTeamsResources, style: "BodyText" }),
          H2("Projected Finances Tables"),
          new Paragraph({ text: appendices.projectedFinancesTables, style: "BodyText" }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  const safeName = (docTitle || "Business Plan")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .concat(".docx");
  saveAs(blob, safeName);
}
