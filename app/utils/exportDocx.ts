// app/utils/exportBusinessPlanDocx.ts

import {
  Header,
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
} from "docx";

import { saveAs } from "file-saver";
// ✅ import types from PlanBuilderClient in components
import type { BusinessPlanData, GeneratedPlan } from "@/components/plan-builder/PlanBuilderClient";

const coercePlan = (input: any) => {
  try {
    if (!input) return {};
    if (typeof input === "string") return JSON.parse(input);
    if (input?.plan_json) {
      try { return JSON.parse(input.plan_json); } catch {}
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
  ]);

  // treat these as nested objects if missing
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

  // ✅ how many products to export
  const productCount = Array.isArray(planData.products) ? planData.products.length : 0;

  const pageHeader = new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        shading: {
          type: ShadingType.CLEAR,
          fill: "F2F2F2",
        },
        spacing: { after: 150 },
        border: {
          bottom: {
            style: BorderStyle.SINGLE,
            size: 6,
            color: "CCCCCC",
          },
        },
        children: [
          new TextRun({
            text: docTitle.toUpperCase(),
            bold: true,
            size: 32,
            font: "Calibri Light",
          }),
        ],
      }),
    ],
  });

  // ✅ helper: start each main section on a new page
  const H1 = (text: string) =>
    new Paragraph({ text, style: "Heading1", pageBreakBefore: true });

  const doc = new Document({
    styles: {
      paragraphStyles: [
        {
          id: "TitleStyle",
          name: "Custom Title",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 48, bold: true, font: "Calibri Light" },
          paragraph: { spacing: { after: 300 }, alignment: AlignmentType.CENTER },
        },
        {
          id: "CoverTitle",
          name: "Cover Title",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 48, bold: true, font: "Microsoft YaHei UI" },
          // ~3600 twips ≈ 2.5 inches; pushes the title near vertical center
          paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 3600, after: 120 } },
        },
        {
          id: "CoverSubtitle",
          name: "Cover Subtitle",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 56, bold: true, font: "Microsoft YaHei UI" },
          paragraph: { alignment: AlignmentType.CENTER, spacing: { after: 300 } },
        },
        {
          id: "Heading1",
          name: "Custom Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 32, bold: true, font: "Calibri" },
          paragraph: {
            // pageBreakBefore moved to paragraph-level via H1() helper
            spacing: { before: 300, after: 150 },
          },
        },
        {
          id: "Heading2",
          name: "Custom Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 24, bold: true, font: "Calibri" },
          paragraph: { spacing: { before: 200, after: 100 } },
        },
        {
          id: "BodyText",
          name: "Body Text",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 22, font: "Calibri" },
          paragraph: {
            spacing: { line: 276, after: 100 },
            alignment: AlignmentType.JUSTIFIED,
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

    sections: [
      {
        headers: {
          default: pageHeader,
        },
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: [
          // Cover / Title (centered & vertically pushed)
          new Paragraph({ text: capFirst(docTitle), style: "CoverTitle" }),
          new Paragraph({ text: "Business Plan", style: "CoverSubtitle" }),

          // 1. Executive Summary
          H1("Executive Summary"),
          new Paragraph({ text: "Business Overview", style: "Heading2" }),
          new Paragraph({ text: executiveSummary.businessOverview, style: "BodyText" }),
          new Paragraph({ text: "Funding Requirements & Usage of Funds", style: "Heading2" }),
          new Paragraph({ text: executiveSummary.fundingRequirementsUsageOfFunds, style: "BodyText" }),
          new Paragraph({ text: "Past Milestones", style: "Heading2" }),
          new Paragraph({ text: executiveSummary.pastMilestones, style: "BodyText" }),
          new Paragraph({ text: "Problem Statement & Solution", style: "Heading2" }),
          new Paragraph({ text: executiveSummary.problemStatementSolution, style: "BodyText" }),

          // 2. Company Overview
          H1("Company Overview"),
          new Paragraph({ text: "Vision Statement", style: "Heading2" }),
          new Paragraph({ text: companyOverview.visionStatement, style: "BodyText" }),
          new Paragraph({ text: "Mission Statement", style: "Heading2" }),
          new Paragraph({ text: companyOverview.missionStatement, style: "BodyText" }),
          new Paragraph({ text: "History & Background", style: "Heading2" }),
          new Paragraph({ text: companyOverview.companyHistoryBackground, style: "BodyText" }),
          new Paragraph({ text: "Founding Team", style: "Heading2" }),
          new Paragraph({ text: companyOverview.foundingTeam, style: "BodyText" }),
          new Paragraph({ text: "Legal Structure & Ownership", style: "Heading2" }),
          new Paragraph({ text: companyOverview.legalStructureOwnership, style: "BodyText" }),
          new Paragraph({ text: "Core Values & Culture", style: "Heading2" }),
          new Paragraph({ text: companyOverview.coreValuesCulture, style: "BodyText" }),
          new Paragraph({ text: "Company Objectives", style: "Heading2" }),
          new Paragraph({ text: companyOverview.companyObjectives, style: "BodyText" }),

          // 3. Products
          H1("Products"),
          new Paragraph({ text: "Overview", style: "Heading2" }),
          new Paragraph({ text: products.overview, style: "BodyText" }),

          // ✅ Only export the products the user entered, with names
          ...Array.from({ length: productCount }, (_, idx) => {
            const i = idx + 1;
            const name = planData.products?.[idx]?.name;
            const content = (products as any)[`product${i}`] as string | undefined;
            return [
              new Paragraph({ text: `Product ${i}${name ? `: ${name}` : ""}`, style: "Heading2" }),
              new Paragraph({ text: content || "", style: "BodyText" }),
            ];
          }).flat(),

          new Paragraph({ text: "Unique Selling Propositions (USPs)", style: "Heading2" }),
          new Paragraph({ text: products.uniqueSellingPropositions, style: "BodyText" }),
          new Paragraph({ text: "Development Roadmap", style: "Heading2" }),
          new Paragraph({ text: products.developmentRoadmap, style: "BodyText" }),
          new Paragraph({ text: "Intellectual Property & Regulatory Status", style: "Heading2" }),
          new Paragraph({ text: products.intellectualPropertyRegulatoryStatus, style: "BodyText" }),

          // 4. Market Analysis
          H1("Market Analysis"),
          new Paragraph({ text: "Industry Overview & Size", style: "Heading2" }),
          new Paragraph({ text: marketAnalysis.industryOverviewSize, style: "BodyText" }),
          new Paragraph({ text: "Growth Trends & Drivers", style: "Heading2" }),
          new Paragraph({ text: marketAnalysis.growthTrendsDrivers, style: "BodyText" }),
          new Paragraph({ text: "Underlying Business Drivers", style: "Heading2" }),
          new Paragraph({ text: marketAnalysis.underlyingBusinessDrivers, style: "BodyText" }),
          new Paragraph({ text: "Target Market Segmentation", style: "Heading2" }),
          new Paragraph({ text: marketAnalysis.targetMarketSegmentation, style: "BodyText" }),
          new Paragraph({ text: "Customer Personas & Their Needs", style: "Heading2" }),
          new Paragraph({ text: marketAnalysis.customerPersonasNeeds, style: "BodyText" }),
          new Paragraph({ text: "Competitive Landscape & Positioning", style: "Heading2" }),
          new Paragraph({ text: marketAnalysis.competitiveLandscapePositioning, style: "BodyText" }),
          new Paragraph({ text: "Products’ Differentiation", style: "Heading2" }),
          new Paragraph({ text: marketAnalysis.productsDifferentiation, style: "BodyText" }),
          new Paragraph({ text: "Barriers to Entry", style: "Heading2" }),
          new Paragraph({ text: marketAnalysis.barriersToEntry, style: "BodyText" }),

          // 5. Marketing & Sales Strategies
          H1("Marketing & Sales Strategies"),
          new Paragraph({ text: "Distribution Channels", style: "Heading2" }),
          new Paragraph({ text: marketingSalesStrategies.distributionChannels, style: "BodyText" }),
          new Paragraph({ text: "Technology Cost Structure", style: "Heading2" }),
          new Paragraph({ text: marketingSalesStrategies.technologyCostStructure, style: "BodyText" }),
          new Paragraph({ text: "Customer Pricing Structure", style: "Heading2" }),
          new Paragraph({ text: marketingSalesStrategies.customerPricingStructure, style: "BodyText" }),
          new Paragraph({ text: "Retention Strategies", style: "Heading2" }),
          new Paragraph({ text: marketingSalesStrategies.retentionStrategies, style: "BodyText" }),
          new Paragraph({ text: "Integrated Funnel & Financial Impact", style: "Heading2" }),
          new Paragraph({ text: marketingSalesStrategies.integratedFunnelFinancialImpact, style: "BodyText" }),

          // 6. Operations Plan
          H1("Operations Plan"),
          new Paragraph({ text: "Overview", style: "Heading2" }),
          new Paragraph({ text: operationsPlan.overview, style: "BodyText" }),
          new Paragraph({ text: "Organizational Structure & Team Responsibilities", style: "Heading2" }),
          new Paragraph({ text: operationsPlan.organizationalStructureTeamResponsibilities, style: "BodyText" }),
          new Paragraph({ text: "Infrastructure", style: "Heading2" }),
          new Paragraph({ text: operationsPlan.infrastructure, style: "BodyText" }),
          new Paragraph({ text: "Customer Onboarding to Renewal Workflow", style: "Heading2" }),
          new Paragraph({ text: operationsPlan.customerOnboardingToRenewalWorkflow, style: "BodyText" }),
          new Paragraph({ text: "Cross-Functional Communication & Decision-Making", style: "Heading2" }),
          new Paragraph({ text: operationsPlan.crossFunctionalCommunicationDecisionMaking, style: "BodyText" }),
          new Paragraph({ text: "Key Performance Metrics & Goals", style: "Heading2" }),
          new Paragraph({ text: operationsPlan.keyPerformanceMetricsGoals, style: "BodyText" }),

          // 7. Management & Organization
          H1("Management & Organization"),
          new Paragraph({ text: "Overview", style: "Heading2" }),
          new Paragraph({ text: managementOrganization.overview, style: "BodyText" }),
          new Paragraph({ text: "Organizational Chart", style: "Heading2" }),
          new Paragraph({ text: managementOrganization.organizationalChart, style: "BodyText" }),
          new Paragraph({ text: "Hiring Plan & Key Roles", style: "Heading2" }),
          new Paragraph({ text: managementOrganization.hiringPlanKeyRoles, style: "BodyText" }),

          // 8. Financial Plan
          H1("Financial Plan"),
          new Paragraph({ text: "Overview", style: "Heading2" }),
          new Paragraph({ text: financialPlan.overview, style: "BodyText" }),
          new Paragraph({ text: "Key Assumptions", style: "Heading2" }),
          new Paragraph({ text: financialPlan.keyAssumptions, style: "BodyText" }),

          new Paragraph({ text: "Revenue Forecast", style: "Heading2" }),
          new Table({
            style: "BusinessPlanTable",
            alignment: AlignmentType.CENTER,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [ new Paragraph({ text: "Period", style: "BodyText" }) ]
                  }),
                  new TableCell({
                    width: { size: 6000, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [ new Paragraph({ text: "Amount", style: "BodyText" }) ]
                  }),
                ],
              }),
              ...financialPlan.revenueForecast.map((r: any) =>
                new TableRow({
                  children: [
                    new TableCell({ children: [ new Paragraph({ text: r.period, style: "BodyText" }) ] }),
                    new TableCell({ children: [ new Paragraph({ text: r.amount, style: "BodyText" }) ] }),
                  ],
                })
              ),
            ],
          }),

          new Paragraph({ text: "Cost of Goods Sold (COGS)", style: "Heading2" }),
          new Table({
            style: "BusinessPlanTable",
            alignment: AlignmentType.CENTER,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [ new Paragraph({ text: "Period", style: "BodyText" }) ]
                  }),
                  new TableCell({
                    width: { size: 6000, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [ new Paragraph({ text: "COGS", style: "BodyText" }) ]
                  }),
                ],
              }),
              ...financialPlan.cogs.map((r: any) =>
                new TableRow({
                  children: [
                    new TableCell({ children: [ new Paragraph({ text: r.period, style: "BodyText" }) ] }),
                    new TableCell({ children: [ new Paragraph({ text: r.amount, style: "BodyText" }) ] }),
                  ],
                })
              ),
            ],
          }),

          new Paragraph({ text: "Operating Expenses (OpEx)", style: "Heading2" }),
          new Table({
            style: "BusinessPlanTable",
            alignment: AlignmentType.CENTER,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [ new Paragraph({ text: "Period", style: "BodyText" }) ]
                  }),
                  new TableCell({
                    width: { size: 6000, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [ new Paragraph({ text: "OpEx", style: "BodyText" }) ]
                  }),
                ],
              }),
              ...financialPlan.opEx.map((r: any) =>
                new TableRow({
                  children: [
                    new TableCell({ children: [ new Paragraph({ text: r.period, style: "BodyText" }) ] }),
                    new TableCell({ children: [ new Paragraph({ text: r.amount, style: "BodyText" }) ] }),
                  ],
                })
              ),
            ],
          }),

          new Paragraph({ text: "Projected Profit & Loss Statement (P&L)", style: "Heading2" }),
          new Table({
            style: "BusinessPlanTable",
            alignment: AlignmentType.CENTER,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [ new Paragraph({ text: "Period", style: "BodyText" }) ]
                  }),
                  new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [ new Paragraph({ text: "Gross Profit", style: "BodyText" }) ]
                  }),
                  new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [ new Paragraph({ text: "EBITDA", style: "BodyText" }) ]
                  }),
                  new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [ new Paragraph({ text: "Net Income", style: "BodyText" }) ]
                  }),
                ],
              }),
              ...financialPlan.projectedPnl.map((r: any) =>
                new TableRow({
                  children: [
                    new TableCell({ children: [ new Paragraph({ text: r.period, style: "BodyText" }) ] }),
                    new TableCell({ children: [ new Paragraph({ text: r.grossProfit, style: "BodyText" }) ] }),
                    new TableCell({ children: [ new Paragraph({ text: r.ebitda, style: "BodyText" }) ] }),
                    new TableCell({ children: [ new Paragraph({ text: r.netIncome, style: "BodyText" }) ] }),
                  ],
                })
              ),
            ],
          }),

          new Paragraph({ text: "Cash Flow & Runway Analysis", style: "Heading2" }),
          new Table({
            style: "BusinessPlanTable",
            alignment: AlignmentType.CENTER,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [ new Paragraph({ text: "Period", style: "BodyText" }) ]
                  }),
                  new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [ new Paragraph({ text: "Begin Cash", style: "BodyText" }) ]
                  }),
                  new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [ new Paragraph({ text: "Inflows", style: "BodyText" }) ]
                  }),
                  new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [ new Paragraph({ text: "Outflows", style: "BodyText" }) ]
                  }),
                  new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [ new Paragraph({ text: "End Cash", style: "BodyText" }) ]
                  }),
                  new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    shading: { fill: "EEEEEE" },
                    children: [ new Paragraph({ text: "Runway (mo)", style: "BodyText" }) ]
                  }),
                ],
              }),
              ...financialPlan.cashFlowRunwayAnalysis.map((r: any) =>
                new TableRow({
                  children: [
                    new TableCell({ children: [ new Paragraph({ text: r.period, style: "BodyText" }) ] }),
                    new TableCell({ children: [ new Paragraph({ text: r.beginningCash, style: "BodyText" }) ] }),
                    new TableCell({ children: [ new Paragraph({ text: r.inflows, style: "BodyText" }) ] }),
                    new TableCell({ children: [ new Paragraph({ text: r.outflows, style: "BodyText" }) ] }),
                    new TableCell({ children: [ new Paragraph({ text: r.endingCash, style: "BodyText" }) ] }),
                    new TableCell({ children: [ new Paragraph({ text: r.runwayMonths, style: "BodyText" }) ] }),
                  ],
                })
              ),
            ],
          }),

          new Paragraph({ text: "Key Financial Metrics & Ratios", style: "Heading2" }),
          new Paragraph({ text: financialPlan.keyFinancialMetricsRatios, style: "BodyText" }),

          new Paragraph({ text: "Use of Funds & Runway", style: "Heading2" }),
          new Paragraph({ text: financialPlan.useOfFundsRunway, style: "BodyText" }),

          new Paragraph({ text: "Key Sensitivity & Risk Scenarios", style: "Heading2" }),
          new Paragraph({ text: financialPlan.keySensitivityRiskScenarios, style: "BodyText" }),

          new Paragraph({ text: "Summary & Outlook", style: "Heading2" }),
          new Paragraph({ text: financialPlan.summaryOutlook, style: "BodyText" }),

          // 9. Risk Analysis & Mitigation
          H1("Risk Analysis & Mitigation"),
          new Paragraph({ text: "Overview", style: "Heading2" }),
          new Paragraph({ text: riskAnalysisMitigation.overview, style: "BodyText" }),
          new Paragraph({ text: "Market Risks", style: "Heading2" }),
          new Paragraph({ text: riskAnalysisMitigation.marketRisks, style: "BodyText" }),
          new Paragraph({ text: "Operational Risks", style: "Heading2" }),
          new Paragraph({ text: riskAnalysisMitigation.operationalRisks, style: "BodyText" }),
          new Paragraph({ text: "Regulatory & Legal Risks", style: "Heading2" }),
          new Paragraph({ text: riskAnalysisMitigation.regulatoryLegalRisks, style: "BodyText" }),
          new Paragraph({ text: "Financial Risks", style: "Heading2" }),
          new Paragraph({ text: riskAnalysisMitigation.financialRisks, style: "BodyText" }),
          new Paragraph({ text: "Contingency Plans", style: "Heading2" }),
          new Paragraph({ text: riskAnalysisMitigation.contingencyPlans, style: "BodyText" }),

          // 10. Appendices
          H1("Appendices"),
          new Paragraph({ text: "Glossary", style: "Heading2" }),
          new Paragraph({ text: appendices.glossary, style: "BodyText" }),
          new Paragraph({ text: "Management Teams’ Resources", style: "Heading2" }),
          new Paragraph({ text: appendices.managementTeamsResources, style: "BodyText" }),
          new Paragraph({ text: "Projected Finances Tables", style: "Heading2" }),
          new Paragraph({ text: appendices.projectedFinancesTables, style: "BodyText" }),
        ],
      },
    ],
  });

  // Generate and download .docx
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
