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

/** Toggle legacy Financial Plan tables (Revenue Forecast, COGS, OpEx, P&L, Cash Flow) */
const SHOW_LEGACY_FINANCIAL_TABLES = true;

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
    // ensure funding.usageOfFunds is always an array
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
    // nested funding as a sub-section
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
    if (idx % 2 === 1) runs.push(new TextRun({ text: part, bold: true }));
    else runs.push(new TextRun({ text: part }));
  });
  return runs.length ? runs : [new TextRun({ text: t })];
}

// Render a block of markdown-ish text into Paragraph[]
// keepTogether: when true, apply keep-with-next chaining AND keepLines to avoid page splits
function md(text: string, opts?: { bodyStyle?: string; keepTogether?: boolean }): Paragraph[] {
  const baseStyle = opts?.bodyStyle ?? "BodyText";
  const block = !!opts?.keepTogether;
  const lines = (stripEmojis(text ?? "") || "").replace(/\r\n/g, "\n").split("\n");
  const out: Paragraph[] = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const isLast = i === lines.length - 1;
    const line = raw.trim();
    const styleForThisLine = block && !isLast
      ? (baseStyle === "BulletText" ? "BulletBlock" : "BodyBlock")
      : baseStyle;

    if (!line) {
      out.push(new Paragraph({ text: "", style: styleForThisLine, keepLines: block }));
      continue;
    }

    // Bold subhead if the whole line is **...**
    const mBoldLine = line.match(/^\*\*(.+)\*\*$/);
    if (mBoldLine) {
      out.push(
        new Paragraph({
          children: [new TextRun({ text: mBoldLine[1].trim(), bold: true })],
          style: styleForThisLine,
          keepLines: block,
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
          style: styleForThisLine === "BodyBlock" ? "BulletBlock" : (styleForThisLine as any),
          bullet: { level: 0, reference: "SmallCircle" },
          keepLines: block,
        })
      );
      continue;
    }

    // Default paragraph with inline bold
    out.push(new Paragraph({ children: runsFromInlineMarkdown(line), style: styleForThisLine, keepLines: block }));
  }

  return out;
}

// 👉 Small helpers to create bullet paragraphs
const bullet = (text: string) =>
  new Paragraph({
    children: runsFromInlineMarkdown(stripEmojis(text || "")),
    style: "BulletText",
    bullet: { level: 0, reference: "SmallCircle" },
  });

// Keep a WHOLE list of bullets together
const bulletsBlock = (items: string[]) => {
  const ps: Paragraph[] = [];
  items.forEach((t, i) => {
    const isLast = i === items.length - 1;
    ps.push(
      new Paragraph({
        children: runsFromInlineMarkdown(stripEmojis(t || "")),
        style: isLast ? "BulletText" : "BulletBlock",
        bullet: { level: 0, reference: "SmallCircle" },
        keepLines: true,
      })
    );
  });
  return ps;
};

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
    llp: "Limited Liability Partnership (LLP)",
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
  // Keep H2 with next content to avoid orphan headings
  const H2 = (text: string) =>
    new Paragraph({ text, heading: HeadingLevel.HEADING_2, keepNext: true });

  // Visual spacer between a main section (H1) and its first H2
  const Spacer = () => new Paragraph({ text: "", spacing: { after: 200 } });
  // Visual spacer for tables (adds gap above and below)
  const TableGap = (size = 240) =>
  new Paragraph({ text: "", style: "BodyText", spacing: { before: size, after: size } });

  // Compose Mission text with optional upcoming milestone (from quiz)
  const missionWithMilestone =
    (companyOverview.missionStatement || "") +
    (planData?.upcomingMilestone ? `\n\nUpcoming milestone: ${planData.upcomingMilestone}` : "");

  // Build Usage of Funds table rows from exec summary funding
  const usageRows: Array<{
    department: string;
    allocationPercent: string;
    amount: string;
    howUsed: string;
  }> = Array.isArray(executiveSummary?.funding?.usageOfFunds)
    ? executiveSummary.funding.usageOfFunds.map((r: any) => ({
        department: String(r?.department ?? ""),
        allocationPercent: `${Number(r?.allocationPercent ?? 0)}%`,
        amount: String(r?.amount ?? ""),
        howUsed: String(r?.howUsed ?? ""),
      }))
    : [];

  // Sum of allocation for a total row (optional)
  const totalPct = usageRows.reduce(
    (a, r) => a + (parseFloat(String(r.allocationPercent).replace("%", "")) || 0),
    0
  );

  // ──────────────────────────────────────────────────────────────
  // Helpers for Revenue Statement (show raw strings, compute totals without symbols)
  // ──────────────────────────────────────────────────────────────
  const raw = (v: any) => String(v ?? "").trim();
  const parseN = (v: any) => Number(String(v ?? "").replace(/[^\d.-]/g, ""));
  const fmtNum = (n: number) =>
    Number.isFinite(n) ? new Intl.NumberFormat("en-US").format(Math.round(n)) : "";

  // Pull values (prefer quiz planData; fall back to plan if needed)
  const companyName =
    planData?.businessName || planBusinessName || planCompanyName || "";

  const monthlyRevenueStr =
    raw((planData as any)?.monthlyRevenue) || raw(safePlan?.monthlyRevenue);

  // Fallback to safePlan for monthly expenses
  const monthlyExpensesStr =
    raw((planData as any)?.monthlyExpenses) || raw(safePlan?.monthlyExpenses);

  const mRevN = parseN(monthlyRevenueStr);
  const mExpN = parseN(monthlyExpensesStr);

  const projectedAnnualRevenue = mRevN ? fmtNum(mRevN * 12) : "";
  const projectedAnnualExpenses = mExpN ? fmtNum(mExpN * 12) : "";

  const netMonthly = Number.isFinite(mRevN - mExpN) ? fmtNum(mRevN - mExpN) : "";
  const netAnnual = Number.isFinite((mRevN - mExpN) * 12) ? fmtNum((mRevN - mExpN) * 12) : "";

  const initialInvestmentStr =
    raw((planData as any)?.initialInvestment) || raw(safePlan?.initialInvestment);
  const fundingReceivedStr =
    raw((planData as any)?.fundingReceived) || raw(safePlan?.fundingReceived) || "—";
  const fundingNeededStr =
    raw((planData as any)?.fundingNeeded) || raw(safePlan?.fundingNeeded) || "—";

  const expenseBreakdown = Array.isArray((planData as any)?.fundingUseBreakdown)
    ? (planData as any).fundingUseBreakdown
    : [];

  const initUtilBreakdown = Array.isArray((planData as any)?.investmentUtilization)
    ? (planData as any).investmentUtilization
    : [];

  // Show a nice placeholder when a cell would otherwise be empty
  const show = (s: string) => {
    const t = String(s ?? "").trim();
    return t ? t : "—";
  };

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
          next: "BodyText",
          quickFormat: true,
          run: { size: 24, bold: true, font: "Calibri", color: "000000" },
          // keepNext ensures the H2 line stays with the first content paragraph
          paragraph: { spacing: { before: 200, after: 120 }, keepNext: true },
        },

        {
          id: "BodyText",
          name: "Body Text",
          basedOn: "Normal",
          next: "BodyText",
          quickFormat: true,
          run: { size: 22, font: "Calibri", color: "000000" },
          paragraph: { spacing: { line: 276, after: 100 }, alignment: AlignmentType.JUSTIFIED },
        },

        // Bullet paragraph style (used by md() & bullet())
        {
          id: "BulletText",
          name: "Bullet Text",
          basedOn: "BodyText",
          next: "BodyText",
          quickFormat: true,
          paragraph: { indent: { left: 720 }, spacing: { after: 60 } },
        },

        // NEW: block styles that chain keep-with-next within a subsection
        {
          id: "BodyBlock",
          name: "Body Block (keepNext)",
          basedOn: "BodyText",
          next: "BodyText",
          quickFormat: false,
          paragraph: { keepNext: true, keepLines: true },
        },
        {
          id: "BulletBlock",
          name: "Bullet Block (keepNext)",
          basedOn: "BulletText",
          next: "BodyText",
          quickFormat: false,
          paragraph: { keepNext: true, keepLines: true },
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
              style: { run: { size: 18 }, paragraph: { indent: { left: 720 } } },
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
          new TableOfContents("", { headingStyleRange: "1-2" }),

          // 1. Executive Summary
          H1("Executive Summary"),
          Spacer(),
          H2("Business Overview"),
          ...md(executiveSummary.businessOverview, { bodyStyle: "BodyText", keepTogether: true }),

          H2("Our Mission"),
          ...md(executiveSummary.ourMission, { bodyStyle: "BodyText", keepTogether: true }),

          H2("Funding Requirements & Usage of Funds"),
          ...md(executiveSummary.funding?.p1 || "", { bodyStyle: "BodyText", keepTogether: true }),
          TableGap(),
          // Table: Usage of Funds
          new Table({
            style: "BusinessPlanTable",
            alignment: AlignmentType.CENTER,
            rows: [
              new TableRow({
                cantSplit: true,
                children: [
                  new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    shading: { type: ShadingType.CLEAR, color: "auto", fill: "EEEEEE" },
                    children: [new Paragraph({ text: "Department", style: "BodyText" })],
                  }),
                  new TableCell({
                    width: { size: 2000, type: WidthType.DXA },
                    shading: { type: ShadingType.CLEAR, color: "auto", fill: "EEEEEE" },
                    children: [new Paragraph({ text: "Allocation %", style: "BodyText" })],
                  }),
                  new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    shading: { type: ShadingType.CLEAR, color: "auto", fill: "EEEEEE" },
                    children: [new Paragraph({ text: "Amount", style: "BodyText" })],
                  }),
                  new TableCell({
                    width: { size: 4000, type: WidthType.DXA },
                    shading: { type: ShadingType.CLEAR, color: "auto", fill: "EEEEEE" },
                    children: [new Paragraph({ text: "How it will be used", style: "BodyText" })],
                  }),
                ],
              }),
              ...usageRows.map(
                (r) =>
                  new TableRow({
                    cantSplit: true,
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
                      cantSplit: true,
                      children: [
                        new TableCell({ children: [new Paragraph({ text: "Total", style: "BodyText" })] }),
                        new TableCell({
                          children: [new Paragraph({ text: `${Math.round(totalPct)}%`, style: "BodyText" })],
                        }),
                        new TableCell({ children: [new Paragraph({ text: "", style: "BodyText" })] }),
                        new TableCell({ children: [new Paragraph({ text: "", style: "BodyText" })] }),
                      ],
                    }),
                  ]
                : []),
            ],
          }),
          
          TableGap(),
          ...md(executiveSummary.funding?.p2 || "", { bodyStyle: "BodyText", keepTogether: true }),

          H2("Problem Statement"),
          ...md(executiveSummary.problemStatement, { bodyStyle: "BodyText", keepTogether: true }),

          H2("Solution"),
          ...md(executiveSummary.solution, { bodyStyle: "BodyText", keepTogether: true }),

          // 2. Company Overview
          H1("Company Overview"),
          Spacer(),
          H2("Vision Statement"),
          ...md(companyOverview.visionStatement, { bodyStyle: "BodyText", keepTogether: true }),
          H2("Mission Statement"),
          ...md(missionWithMilestone, { bodyStyle: "BodyText", keepTogether: true }),

          // Deterministic sections from planData
          H2("Legal Structure & Ownership"),
          ...md(
            (() => {
              const owners = Array.isArray(planData.ownership) ? planData.ownership : [];
              const ownershipLines = owners
                .filter((o) => o && (o.name || o.role || o.ownershipPercent != null))
                .map(
                  (o) =>
                    `- ${o.name || "Owner"} — ${o.role || "Role"}` +
                    `${o.ownershipPercent != null ? ` — ${o.ownershipPercent}%` : ""}`
                )
                .join("\n");

              const legalMd = [
                `- **Legal Structure:** ${labelizeLegal((planData as any).legalStructure) || "Not specified"}`,
                `- **Country/State of Incorporation:** ${planData.incorporationCountry || "Not specified"} / ${
                  planData.incorporationState || "Not specified"
                }`,
                ownershipLines ? "- **Ownership & Founders:**" : "",
                ownershipLines,
              ]
                .filter(Boolean)
                .join("\n");

              return legalMd;
            })(),
            { bodyStyle: "BodyText", keepTogether: true }
          ),

          H2("Founding Team"),
          ...md(
            (() => {
              const foundersArr = Array.isArray(planData.founders) ? planData.founders : [];
              return foundersArr.length > 0
                ? foundersArr
                    .filter((f) => f && (f.name || f.title || f.linkedinUrl || f.bio))
                    .map((f) => {
                      const line = `- ${f.name || "Founder"} — ${f.title || "Title"}` +
                        `${f.linkedinUrl ? ` — ${f.linkedinUrl}` : ""}`;
                      return f.bio ? `${line}\n${f.bio}` : line;
                    })
                    .join("\n")
                : "- Not specified";
            })(),
            { bodyStyle: "BodyText", keepTogether: true }
          ),

          // 3. SWOT Analysis
          H1("SWOT Analysis"),
          Spacer(),
          H2("Strengths / Success Drivers"),
          ...bulletsBlock((safePlan?.swot?.strengths || []).map((r: any) => r?.Item || String(r))),
          H2("Weaknesses"),
          ...bulletsBlock((safePlan?.swot?.weaknesses || []).map((r: any) => r?.Item || String(r))),
          H2("Opportunities"),
          ...bulletsBlock((safePlan?.swot?.opportunities || []).map((r: any) => String(r))),
          H2("Threats"),
          ...bulletsBlock((safePlan?.swot?.threats || []).map((r: any) => String(r))),

          // 4. Products
          H1("Products"),
          Spacer(),
          H2("Overview"),
          ...md(products.overview, { bodyStyle: "BodyText", keepTogether: true }),

          ...Array.from({ length: productCount }, (_, idx) => {
            const i = idx + 1;
            const name = planData.products?.[idx]?.name;
            const content = (products as any)[`product${i}`] as string | undefined;
            return [
              H2(`Product ${i}${name ? `: ${name}` : ""}`),
              ...(content
                ? md(content, { bodyStyle: "BodyText", keepTogether: true })
                : [new Paragraph({ text: "", style: "BodyText" })]),
            ];
          }).flat(),

          H2("Unique Selling Propositions (USPs)"),
          ...md(products.uniqueSellingPropositions, { bodyStyle: "BodyText", keepTogether: true }),

          H2("Development Roadmap"),
          ...md(products.developmentRoadmap, { bodyStyle: "BodyText", keepTogether: true }),

          H2("Intellectual Property & Regulatory Status"),
          ...md(products.intellectualPropertyRegulatoryStatus, { bodyStyle: "BodyText", keepTogether: true }),

          // 5. Market Analysis
          H1("Market Analysis"),
          Spacer(),
          H2("Industry Overview & Size"),
          ...md(marketAnalysis.industryOverviewSize, { bodyStyle: "BodyText", keepTogether: true }),
          H2("Growth Trends & Drivers"),
          ...md(marketAnalysis.growthTrendsDrivers, { bodyStyle: "BodyText", keepTogether: true }),
          H2("Underlying Business Drivers"),
          ...md(marketAnalysis.underlyingBusinessDrivers, { bodyStyle: "BodyText", keepTogether: true }),
          H2("Target Market Segmentation"),
          ...md(marketAnalysis.targetMarketSegmentation, { bodyStyle: "BodyText", keepTogether: true }),
          H2("Customer Personas & Their Needs"),
          ...md(marketAnalysis.customerPersonasNeeds, { bodyStyle: "BodyText", keepTogether: true }),
          H2("Competitive Landscape & Positioning"),
          ...md(marketAnalysis.competitiveLandscapePositioning, { bodyStyle: "BodyText", keepTogether: true }),
          H2("Products’ Differentiation"),
          ...md(marketAnalysis.productsDifferentiation, { bodyStyle: "BodyText", keepTogether: true }),
          H2("Barriers to Entry"),
          ...md(marketAnalysis.barriersToEntry, { bodyStyle: "BodyText", keepTogether: true }),

          // 6. Marketing & Sales Strategies
          H1("Marketing & Sales Strategies"),
          Spacer(),
          H2("Distribution Channels"),
          ...md(marketingSalesStrategies.distributionChannels, { bodyStyle: "BodyText", keepTogether: true }),
          H2("Technology Cost Structure"),
          ...md(marketingSalesStrategies.technologyCostStructure, { bodyStyle: "BodyText", keepTogether: true }),
          H2("Customer Pricing Structure"),
          ...md(marketingSalesStrategies.customerPricingStructure, { bodyStyle: "BodyText", keepTogether: true }),
          H2("Retention Strategies"),
          ...md(marketingSalesStrategies.retentionStrategies, { bodyStyle: "BodyText", keepTogether: true }),
          H2("Integrated Funnel & Financial Impact"),
          ...md(marketingSalesStrategies.integratedFunnelFinancialImpact, { bodyStyle: "BodyText", keepTogether: true }),

          // 7. Operations Plan
          H1("Operations Plan"),
          Spacer(),
          H2("Overview"),
          ...md(operationsPlan.overview, { bodyStyle: "BodyText", keepTogether: true }),
          H2("Organizational Structure & Team Responsibilities"),
          ...md(operationsPlan.organizationalStructureTeamResponsibilities, { bodyStyle: "BodyText", keepTogether: true }),
          H2("Infrastructure"),
          ...md(operationsPlan.infrastructure, { bodyStyle: "BodyText", keepTogether: true }),
          H2("Customer Onboarding to Renewal Workflow"),
          ...md(operationsPlan.customerOnboardingToRenewalWorkflow, { bodyStyle: "BodyText", keepTogether: true }),
          H2("Cross-Functional Communication & Decision-Making"),
          ...md(operationsPlan.crossFunctionalCommunicationDecisionMaking, { bodyStyle: "BodyText", keepTogether: true }),
          H2("Key Performance Metrics & Goals"),
          ...md(operationsPlan.keyPerformanceMetricsGoals, { bodyStyle: "BodyText", keepTogether: true }),

          // 8. Management & Organization
          H1("Management & Organization"),
          Spacer(),
          H2("Overview"),
          ...md(managementOrganization.overview, { bodyStyle: "BodyText", keepTogether: true }),
          H2("Organizational Chart"),
          ...md(managementOrganization.organizationalChart, { bodyStyle: "BodyText", keepTogether: true }),
          H2("Hiring Plan & Key Roles"),
          ...md(managementOrganization.hiringPlanKeyRoles, { bodyStyle: "BodyText", keepTogether: true }),

          // 9. Financial Plan
          H1("Financial Plan"),
          Spacer(),
          H2("Overview"),
          ...md(financialPlan.overview, { bodyStyle: "BodyText", keepTogether: true }),
          H2("Key Assumptions"),
          ...md(financialPlan.keyAssumptions, { bodyStyle: "BodyText", keepTogether: true }),

          // ▶️ Startup Revenue Statement (table rows set cantSplit)
          H2("Startup Revenue Statement"),
          new Table({
            style: "BusinessPlanTable",
            alignment: AlignmentType.CENTER,
            columnWidths: [5000, 5000],
            rows: [
              new TableRow({
                cantSplit: true,
                children: [
                  new TableCell({
                    width: { size: 5000, type: WidthType.DXA },
                    shading: { type: ShadingType.CLEAR, color: "auto", fill: "EEEEEE" },
                    children: [new Paragraph({ text: "Metric", style: "BodyText" })],
                  }),
                  new TableCell({
                    width: { size: 5000, type: WidthType.DXA },
                    shading: { type: ShadingType.CLEAR, color: "auto", fill: "EEEEEE" },
                    children: [new Paragraph({ text: "Value", style: "BodyText" })],
                  }),
                ],
              }),

              new TableRow({
                cantSplit: true,
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Company Name", style: "BodyText" })] }),
                  new TableCell({ children: [new Paragraph({ text: show(companyName), style: "BodyText" })] }),
                ],
              }),
              new TableRow({
                cantSplit: true,
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Current Monthly Revenue", style: "BodyText" })] }),
                  new TableCell({ children: [new Paragraph({ text: show(monthlyRevenueStr), style: "BodyText" })] }),
                ],
              }),
              new TableRow({
                cantSplit: true,
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Projected Annual Revenue (×12)", style: "BodyText" })] }),
                  new TableCell({ children: [new Paragraph({ text: show(projectedAnnualRevenue), style: "BodyText" })] }),
                ],
              }),
              new TableRow({
                cantSplit: true,
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Current Monthly Expenses", style: "BodyText" })] }),
                  new TableCell({ children: [new Paragraph({ text: show(monthlyExpensesStr), style: "BodyText" })] }),
                ],
              }),
              new TableRow({
                cantSplit: true,
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Projected Annual Expenses (×12)", style: "BodyText" })] }),
                  new TableCell({ children: [new Paragraph({ text: show(projectedAnnualExpenses), style: "BodyText" })] }),
                ],
              }),

              ...(expenseBreakdown.length
                ? [
                    new TableRow({
                      cantSplit: true,
                      children: [
                        new TableCell({
                          shading: { type: ShadingType.CLEAR, color: "auto", fill: "F5F5F5" },
                          children: [
                            new Paragraph({
                              children: [new TextRun({ text: "Breakdown of Expenses (planned use)", bold: true })],
                              style: "BodyText",
                            }),
                          ],
                        }),
                        new TableCell({
                          shading: { type: ShadingType.CLEAR, color: "auto", fill: "F5F5F5" },
                          children: [new Paragraph({ text: "", style: "BodyText" })],
                        }),
                      ],
                    }),
                    ...expenseBreakdown.map(
                      (r: any) =>
                        new TableRow({
                          cantSplit: true,
                          children: [
                            new TableCell({
                              children: [
                                new Paragraph({
                                  text: `• ${raw(r?.item ?? r?.category ?? r?.use)}`,
                                  style: "BodyText",
                                }),
                              ],
                            }),
                            new TableCell({
                              children: [new Paragraph({ text: show(raw(r?.amount)), style: "BodyText" })],
                            }),
                          ],
                        })
                    ),
                  ]
                : []),

              new TableRow({
                cantSplit: true,
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Net Profit / (Loss) – Monthly", style: "BodyText" })] }),
                  new TableCell({ children: [new Paragraph({ text: show(netMonthly), style: "BodyText" })] }),
                ],
              }),
              new TableRow({
                cantSplit: true,
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Net Profit / (Loss) – Annual", style: "BodyText" })] }),
                  new TableCell({ children: [new Paragraph({ text: show(netAnnual), style: "BodyText" })] }),
                ],
              }),

              new TableRow({
                cantSplit: true,
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Initial Investment", style: "BodyText" })] }),
                  new TableCell({ children: [new Paragraph({ text: show(initialInvestmentStr), style: "BodyText" })] }),
                ],
              }),

              ...(initUtilBreakdown.length
                ? [
                    new TableRow({
                      cantSplit: true,
                      children: [
                        new TableCell({
                          shading: { type: ShadingType.CLEAR, color: "auto", fill: "F5F5F5" },
                          children: [
                            new Paragraph({
                              children: [new TextRun({ text: "Breakdown of Initial Investment", bold: true })],
                              style: "BodyText",
                            }),
                          ],
                        }),
                        new TableCell({
                          shading: { type: ShadingType.CLEAR, color: "auto", fill: "F5F5F5" },
                          children: [new Paragraph({ text: "", style: "BodyText" })],
                        }),
                      ],
                    }),
                    ...initUtilBreakdown.map(
                      (r: any) =>
                        new TableRow({
                          cantSplit: true,
                          children: [
                            new TableCell({
                              children: [
                                new Paragraph({
                                  text: `• ${raw(r?.item ?? r?.category ?? r?.use)}`,
                                  style: "BodyText",
                                }),
                              ],
                            }),
                            new TableCell({
                              children: [new Paragraph({ text: show(raw(r?.amount)), style: "BodyText" })],
                            }),
                          ],
                        })
                    ),
                  ]
                : []),

              new TableRow({
                cantSplit: true,
                children: [
                  new TableCell({ children: [new Paragraph({ text: "External Funding Received", style: "BodyText" })] }),
                  new TableCell({ children: [new Paragraph({ text: show(fundingReceivedStr), style: "BodyText" })] }),
                ],
              }),
              new TableRow({
                cantSplit: true,
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Funding Requirement", style: "BodyText" })] }),
                  new TableCell({ children: [new Paragraph({ text: show(fundingNeededStr), style: "BodyText" })] }),
                ],
              }),
            ],
          }),

          // Narrative parts
          H2("Key Financial Metrics & Ratios"),
          ...md(financialPlan.keyFinancialMetricsRatios, { bodyStyle: "BodyText", keepTogether: true }),

          H2("Use of Funds & Runway"),
          ...md(financialPlan.useOfFundsRunway, { bodyStyle: "BodyText", keepTogether: true }),

          H2("Key Sensitivity & Risk Scenarios"),
          ...md(financialPlan.keySensitivityRiskScenarios, { bodyStyle: "BodyText", keepTogether: true }),
          H2("Summary & Outlook"),
          ...md(financialPlan.summaryOutlook, { bodyStyle: "BodyText", keepTogether: true }),

          // 10. Risk Analysis & Mitigation
          H1("Risk Analysis & Mitigation"),
          Spacer(),
          H2("Overview"),
          ...md(riskAnalysisMitigation.overview, { bodyStyle: "BodyText", keepTogether: true }),
          H2("Market Risks"),
          ...md(riskAnalysisMitigation.marketRisks, { bodyStyle: "BodyText", keepTogether: true }),
          H2("Operational Risks"),
          ...md(riskAnalysisMitigation.operationalRisks, { bodyStyle: "BodyText", keepTogether: true }),
          H2("Regulatory & Legal Risks"),
          ...md(riskAnalysisMitigation.regulatoryLegalRisks, { bodyStyle: "BodyText", keepTogether: true }),
          H2("Financial Risks"),
          ...md(riskAnalysisMitigation.financialRisks, { bodyStyle: "BodyText", keepTogether: true }),
          H2("Contingency Plans"),
          ...md(riskAnalysisMitigation.contingencyPlans, { bodyStyle: "BodyText", keepTogether: true }),

          // 11. Appendices
          H1("Appendices"),
          Spacer(),
          H2("Glossary"),
          ...md(appendices.glossary, { bodyStyle: "BodyText", keepTogether: true }),
          H2("Management Teams’ Resources"),
          ...md(appendices.managementTeamsResources, { bodyStyle: "BodyText", keepTogether: true }),
          H2("Projected Finances Tables"),
          ...md(appendices.projectedFinancesTables, { bodyStyle: "BodyText", keepTogether: true }),
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
