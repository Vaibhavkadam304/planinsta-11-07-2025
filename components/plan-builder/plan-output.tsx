"use client"

import React, { useState } from "react"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Download,
  Edit3,
  FileText,
  Target,
  Package,
  Users,
  TrendingUp,
  DollarSign,
  Shield,
  FileText as AppendixIcon,
  CheckCircle,
  Zap,
} from "lucide-react"
import Link from "next/link"
import type { BusinessPlanData, GeneratedPlan } from "@/app/plan-builder/page"

interface PlanOutputProps {
  planData: BusinessPlanData
  generatedPlan: GeneratedPlan

  // your AI‐trigger
  onEditSection: (sectionKey: string) => void

  // manually editing a specific subsection
  manualEditingSection: string | null
  manualEditingSubsection: string | null
  manualEditedContent: string

  // fire when you click “Edit” on a subsection
  onManualStartEdit: (sectionKey: string, subKey: string) => void

  // fire when you click “Save” in a subsection’s textarea
  onManualSaveSubsection: (
    sectionKey: string,
    subKey: string,
    newContent: string
  ) => void

  onManualEditedContentChange: (value: string) => void
  onManualCancel: () => void

  onDownload: () => void
}

export function PlanOutput({
  planData,
  generatedPlan,
  onEditSection,
  onDownload,

  // these two must match exactly what you just put in the interface:
  onManualStartEdit,
  onManualSaveSubsection,

  manualEditingSection,
  manualEditingSubsection,
  manualEditedContent,
  onManualEditedContentChange,
  onManualCancel,
}: PlanOutputProps) {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null)
  const businessName = planData.businessName || "Your Business"
  const [openSection, setOpenSection] = useState<string | null>(null)
  const toggleSection = (key: string) => {
    setOpenSection(openSection === key ? null : key)
  }

  const sections = [
    {
      key: "executiveSummary",
      title: "Executive Summary",
      description: "Business overview, funding, milestones, problem & solution",
      icon: FileText,
      subsections: [
        { key: "businessOverview", title: "Business Overview" },
        { key: "fundingRequirementsUsageOfFunds", title: "Funding Requirements & Usage" },
        { key: "pastMilestones", title: "Past Milestones" },
        { key: "problemStatementSolution",       title: "Problem Statement & Solution" },
      ],
      render: () => (
        <>
          <h3 id="executiveSummary" className="font-bold">Business Overview</h3>
          <ReactMarkdown>
            {generatedPlan.executiveSummary.businessOverview}
          </ReactMarkdown>
          <h3 className="font-bold">Funding Requirements &amp; Usage of Funds</h3>
          <ReactMarkdown>
            {generatedPlan.executiveSummary.fundingRequirementsUsageOfFunds}
          </ReactMarkdown>
          <h3 className="font-bold">Past Milestones</h3>
          <ReactMarkdown>
            {generatedPlan.executiveSummary.pastMilestones}
          </ReactMarkdown>
          <h3 className="font-bold">Problem Statement &amp; Solution</h3>
          <ReactMarkdown>
            {generatedPlan.executiveSummary.problemStatementSolution}
          </ReactMarkdown>
        </>
      ),
    },
    {
      key: "companyOverview",
      title: "Company Overview",
      description: "Vision, mission, background, team, values & objectives",
      icon: Package,
      subsections: [
        { key: "visionStatement", title: "Vision Statement" },
        { key: "missionStatement", title: "Mission Statement" },
        { key: "companyHistoryBackground", title: "Company History & Background" },
        { key: "foundingTeam", title: "Founding Team" },
        { key: "legalStructureOwnership", title: "Legal Structure & Ownership" },
        { key: "coreValuesCulture", title: "Core Values & Culture" },
        { key: "companyObjectives", title: "Company Objectives" },
      ],
      render: () => (
        <>
           <h3 id="companyOverview" className="font-bold">Vision Statement</h3>
          <ReactMarkdown>
            {generatedPlan.companyOverview.visionStatement}
          </ReactMarkdown>
          <h3 className="font-bold">Mission Statement</h3>
          <ReactMarkdown>
            {generatedPlan.companyOverview.missionStatement}
          </ReactMarkdown>
          <h3 className="font-bold">Company History &amp; Background</h3>
          <ReactMarkdown>
            {generatedPlan.companyOverview.companyHistoryBackground}
          </ReactMarkdown>
          <h3 className="font-bold">Founding Team</h3>
          <ReactMarkdown>
            {generatedPlan.companyOverview.foundingTeam}
          </ReactMarkdown>
          <h3 className="font-bold">Legal Structure &amp; Ownership</h3>
          <ReactMarkdown>
            {generatedPlan.companyOverview.legalStructureOwnership}
          </ReactMarkdown>
          <h3 className="font-bold">Core Values &amp; Culture</h3>
          <ReactMarkdown>
            {generatedPlan.companyOverview.coreValuesCulture}
          </ReactMarkdown>
          <h3 className="font-bold">Company Objectives</h3>
          <ReactMarkdown>
            {generatedPlan.companyOverview.companyObjectives}
          </ReactMarkdown>
        </>
      ),
    },
    {
      key: "products",
      title: "Products",
      description: "Overview, details, USPs, roadmap & IP status",
      icon: Target,
      subsections: [
        { key: "overview", title: "Overview" },
        // dynamically generate Product 1–10
        ...Array.from({ length: 10 }, (_, i) => ({
          key: `product${i + 1}`,
          title: `Product ${i + 1}`,
        })),
        { key: "uniqueSellingPropositions", title: "Unique Selling Propositions (USPs)" },
        { key: "developmentRoadmap", title: "Development Roadmap" },
        { key: "intellectualPropertyRegulatoryStatus", title: "Intellectual Property & Regulatory Status" },
      ],
      render: () => (
        <>
          <h3 id="products" className="font-bold">Overview</h3>
          <ReactMarkdown>{generatedPlan.products.overview}</ReactMarkdown>
          {Array.from({ length: 10 }, (_, i) => (
            <React.Fragment key={i}>
              <h3 className="font-bold">Product {i + 1}</h3>
              <ReactMarkdown>
                {(generatedPlan.products as any)[`product${i + 1}`]}
              </ReactMarkdown>
            </React.Fragment>
          ))}
          <h3 className="font-bold">Unique Selling Propositions (USPs)</h3>
          <ReactMarkdown>
            {generatedPlan.products.uniqueSellingPropositions}
          </ReactMarkdown>
          <h3 className="font-bold">Development Roadmap</h3>
          <ReactMarkdown>
            {generatedPlan.products.developmentRoadmap}
          </ReactMarkdown>
          <h3 className="font-bold">Intellectual Property &amp; Regulatory Status</h3>
          <ReactMarkdown>
            {generatedPlan.products.intellectualPropertyRegulatoryStatus}
          </ReactMarkdown>
        </>
      ),
    },
    {
      key: "marketAnalysis",
      title: "Market Analysis",
      description: "Industry overview, trends, segmentation & competition",
      icon: Target,
      subsections: [
        { key: "industryOverviewSize", title: "Industry Overview & Size" },
        { key: "growthTrendsDrivers", title: "Growth Trends & Drivers" },
        { key: "underlyingBusinessDrivers", title: "Underlying Business Drivers" },
        { key: "targetMarketSegmentation", title: "Target Market Segmentation" },
        { key: "customerPersonasNeeds", title: "Customer Personas & Their Needs" },
        { key: "competitiveLandscapePositioning", title: "Competitive Landscape & Positioning" },
        { key: "productsDifferentiation", title: "Products’ Differentiation" },
        { key: "barriersToEntry", title: "Barriers to Entry" },
      ],
      
      render: () => (
        <>
          <h3 id="marketAnalysis" className="font-bold">Industry Overview &amp; Size</h3>
          <ReactMarkdown>
            {generatedPlan.marketAnalysis.industryOverviewSize}
          </ReactMarkdown>
          <h3 className="font-bold">Growth Trends &amp; Drivers</h3>
          <ReactMarkdown>
            {generatedPlan.marketAnalysis.growthTrendsDrivers}
          </ReactMarkdown>
          <h3 className="font-bold">Underlying Business Drivers</h3>
          <ReactMarkdown>
            {generatedPlan.marketAnalysis.underlyingBusinessDrivers}
          </ReactMarkdown>
          <h3 className="font-bold">Target Market Segmentation</h3>
          <ReactMarkdown>
            {generatedPlan.marketAnalysis.targetMarketSegmentation}
          </ReactMarkdown>
          <h3 className="font-bold">Customer Personas &amp; Their Needs</h3>
          <ReactMarkdown>
            {generatedPlan.marketAnalysis.customerPersonasNeeds}
          </ReactMarkdown>
          <h3 className="font-bold">Competitive Landscape &amp; Positioning</h3>
          <ReactMarkdown>
            {generatedPlan.marketAnalysis.competitiveLandscapePositioning}
          </ReactMarkdown>
          <h3 className="font-bold">Products’ Differentiation</h3>
          <ReactMarkdown>
            {generatedPlan.marketAnalysis.productsDifferentiation}
          </ReactMarkdown>
          <h3 className="font-bold">Barriers to Entry</h3>
          <ReactMarkdown>
            {generatedPlan.marketAnalysis.barriersToEntry}
          </ReactMarkdown>
        </>
      ),
    },
    {
      key: "marketingSalesStrategies",
      title: "Marketing & Sales Strategies",
      description: "Channels, cost structure, pricing & retention",
      icon: Users,
      subsections: [
        { key: "distributionChannels", title: "Distribution Channels" },
        { key: "technologyCostStructure", title: "Technology Cost Structure" },
        { key: "customerPricingStructure", title: "Customer Pricing Structure" },
        { key: "retentionStrategies", title: "Retention Strategies" },
        { key: "integratedFunnelFinancialImpact", title: "Integrated Funnel & Financial Impact" },
      ],
      render: () => (
        <>
          <h3 id="marketingSalesStrategies" className="font-bold">Distribution Channels</h3>
          <ReactMarkdown>
            {generatedPlan.marketingSalesStrategies.distributionChannels}
          </ReactMarkdown>
          <h3 className="font-bold">Technology Cost Structure</h3>
          <ReactMarkdown>
            {generatedPlan.marketingSalesStrategies.technologyCostStructure}
          </ReactMarkdown>
          <h3 className="font-bold">Customer Pricing Structure</h3>
          <ReactMarkdown>
            {generatedPlan.marketingSalesStrategies.customerPricingStructure}
          </ReactMarkdown>
          <h3 className="font-bold">Retention Strategies</h3>
          <ReactMarkdown>
            {generatedPlan.marketingSalesStrategies.retentionStrategies}
          </ReactMarkdown>
          <h3 className="font-bold">Integrated Funnel &amp; Financial Impact</h3>
          <ReactMarkdown>
            {generatedPlan.marketingSalesStrategies.integratedFunnelFinancialImpact}
          </ReactMarkdown>
        </>
      ),
    },
    {
      key: "operationsPlan",
      title: "Operations Plan",
      description: "Structure, workflow & KPIs",
      icon: TrendingUp,
      subsections: [
        { key: "overview", title: "Overview" },
        { key: "organizationalStructureTeamResponsibilities", title: "Organizational Structure & Team Responsibilities" },
        { key: "infrastructure", title: "Infrastructure" },
        { key: "customerOnboardingToRenewalWorkflow", title: "Customer Onboarding-to-Renewal Workflow" },
        { key: "crossFunctionalCommunicationDecisionMaking", title: "Cross-Functional Communication & Decision-Making" },
        { key: "keyPerformanceMetricsGoals", title: "Key Performance Metrics & Goals" },
      ],
      render: () => (
        <>
          <h3 id="operationsPlan" className="font-bold">Overview</h3>
          <ReactMarkdown>{generatedPlan.operationsPlan.overview}</ReactMarkdown>
          <h3 className="font-bold">Organizational Structure &amp; Team Responsibilities</h3>
          <ReactMarkdown>
            {generatedPlan.operationsPlan.organizationalStructureTeamResponsibilities}
          </ReactMarkdown>
          <h3 className="font-bold">Infrastructure</h3>
          <ReactMarkdown>{generatedPlan.operationsPlan.infrastructure}</ReactMarkdown>
          <h3 className="font-bold">Customer Onboarding‑to‑Renewal Workflow</h3>
          <ReactMarkdown>
            {generatedPlan.operationsPlan.customerOnboardingToRenewalWorkflow}
          </ReactMarkdown>
          <h3 className="font-bold">Cross‑Functional Communication &amp; Decision‑Making</h3>
          <ReactMarkdown>
            {generatedPlan.operationsPlan.crossFunctionalCommunicationDecisionMaking}
          </ReactMarkdown>
          <h3 className="font-bold">Key Performance Metrics &amp; Goals</h3>
          <ReactMarkdown>
            {generatedPlan.operationsPlan.keyPerformanceMetricsGoals}
          </ReactMarkdown>
        </>
      ),
    },
    {
      key: "managementOrganization",
      title: "Management & Organization",
      description: "Chart, roles & hiring plan",
      icon: Users,
      subsections: [
        { key: "overview", title: "Overview" },
        { key: "organizationalChart", title: "Organizational Chart" },
        { key: "hiringPlanKeyRoles", title: "Hiring Plan & Key Roles" },
      ],
      render: () => (
        <>
          <h3 className="font-bold">Overview</h3>
          <ReactMarkdown>
            {generatedPlan.managementOrganization.overview}
          </ReactMarkdown>
          <h3 className="font-bold">Organizational Chart</h3>
          <ReactMarkdown>
            {generatedPlan.managementOrganization.organizationalChart}
          </ReactMarkdown>
          <h3 className="font-bold">Hiring Plan &amp; Key Roles</h3>
          <ReactMarkdown>
            {generatedPlan.managementOrganization.hiringPlanKeyRoles}
          </ReactMarkdown>
        </>
      ),
    },
   {
      key: "financialPlan",
      title: "Financial Plan",
      description: "Assumptions, forecasts, P&L, cash flow & metrics",
      icon: DollarSign,
      subsections: [
        { key: "overview", title: "Overview" },
        { key: "keyAssumptions", title: "Key Assumptions" },
        { key: "revenueForecast", title: "Revenue Forecast" },
        { key: "cogs", title: "Cost of Goods Sold (COGS)" },
        { key: "opEx", title: "Operating Expenses (OpEx)" },
        { key: "projectedPnl", title: "Projected Profit & Loss Statement (P&L)" },
        { key: "cashFlowRunwayAnalysis", title: "Cash Flow & Runway Analysis" },
        { key: "keyFinancialMetricsRatios", title: "Key Financial Metrics & Ratios" },
        { key: "useOfFundsRunway", title: "Use of Funds & Runway" },
        { key: "keySensitivityRiskScenarios", title: "Key Sensitivity & Risk Scenarios" },
        { key: "summaryOutlook", title: "Summary & Outlook" },
      ],
      render: () => (
        <>
          <h3 id="financialPlan" className="font-bold">Overview</h3>
          <ReactMarkdown>{generatedPlan.financialPlan.overview}</ReactMarkdown>

          <h3 className="font-bold">Key Assumptions</h3>
          <ReactMarkdown>{generatedPlan.financialPlan.keyAssumptions}</ReactMarkdown>

          <h3 className="font-bold">Revenue Forecast</h3>
          <table className="w-full table-auto border-collapse border">
            <thead>
              <tr>
                <th className="border px-2 py-1 text-left">Period</th>
                <th className="border px-2 py-1 text-left">Amount</th>
              </tr>
            </thead>
            <tbody>
              {generatedPlan.financialPlan.revenueForecast.map((row, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{row.period}</td>
                  <td className="border px-2 py-1">{row.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="font-bold">Cost of Goods Sold (COGS)</h3>
          <table className="w-full table-auto border-collapse border">
            <thead>
              <tr>
                <th className="border px-2 py-1 text-left">Period</th>
                <th className="border px-2 py-1 text-left">COGS</th>
              </tr>
            </thead>
            <tbody>
              {generatedPlan.financialPlan.cogs.map((row, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{row.period}</td>
                  <td className="border px-2 py-1">{row.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="font-bold">Operating Expenses (OpEx)</h3>
          <table className="w-full table-auto border-collapse border">
            <thead>
              <tr>
                <th className="border px-2 py-1 text-left">Period</th>
                <th className="border px-2 py-1 text-left">OpEx</th>
              </tr>
            </thead>
            <tbody>
              {generatedPlan.financialPlan.opEx.map((row, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{row.period}</td>
                  <td className="border px-2 py-1">{row.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="font-bold">Projected Profit &amp; Loss Statement (P&L)</h3>
          <table className="w-full table-auto border-collapse border">
            <thead>
              <tr>
                <th className="border px-2 py-1 text-left">Period</th>
                <th className="border px-2 py-1 text-left">Gross Profit</th>
                <th className="border px-2 py-1 text-left">EBITDA</th>
                <th className="border px-2 py-1 text-left">Net Income</th>
              </tr>
            </thead>
            <tbody>
              {generatedPlan.financialPlan.projectedPnl.map((row, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{row.period}</td>
                  <td className="border px-2 py-1">{row.grossProfit}</td>
                  <td className="border px-2 py-1">{row.ebitda}</td>
                  <td className="border px-2 py-1">{row.netIncome}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="font-bold">Cash Flow &amp; Runway Analysis</h3>
          <table className="w-full table-auto border-collapse border">
            <thead>
              <tr>
                <th className="border px-2 py-1 text-left">Period</th>
                <th className="border px-2 py-1 text-left">Begin Cash</th>
                <th className="border px-2 py-1 text-left">Inflows</th>
                <th className="border px-2 py-1 text-left">Outflows</th>
                <th className="border px-2 py-1 text-left">End Cash</th>
                <th className="border px-2 py-1 text-left">Runway (mo)</th>
              </tr>
            </thead>
            <tbody>
              {generatedPlan.financialPlan.cashFlowRunwayAnalysis.map((row, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{row.period}</td>
                  <td className="border px-2 py-1">{row.beginningCash}</td>
                  <td className="border px-2 py-1">{row.inflows}</td>
                  <td className="border px-2 py-1">{row.outflows}</td>
                  <td className="border px-2 py-1">{row.endingCash}</td>
                  <td className="border px-2 py-1">{row.runwayMonths}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="font-bold">Key Financial Metrics &amp; Ratios</h3>
          <ReactMarkdown>
            {generatedPlan.financialPlan.keyFinancialMetricsRatios}
          </ReactMarkdown>

          <h3 className="font-bold">Use of Funds &amp; Runway</h3>
          <ReactMarkdown>
            {generatedPlan.financialPlan.useOfFundsRunway}
          </ReactMarkdown>

          <h3 className="font-bold">Key Sensitivity &amp; Risk Scenarios</h3>
          <ReactMarkdown>
            {generatedPlan.financialPlan.keySensitivityRiskScenarios}
          </ReactMarkdown>

          <h3 className="font-bold">Summary &amp; Outlook</h3>
          <ReactMarkdown>
            {generatedPlan.financialPlan.summaryOutlook}
          </ReactMarkdown>
        </>
      ),
    },
    {
      key: "riskAnalysisMitigation",
      title: "Risk Analysis & Mitigation",
      description: "All categories of risk and contingencies",
      icon: Shield,
      subsections: [
        { key: "overview", title: "Overview" },
        { key: "marketRisks", title: "Market Risks" },
        { key: "operationalRisks", title: "Operational Risks" },
        { key: "regulatoryLegalRisks", title: "Regulatory & Legal Risks" },
        { key: "financialRisks", title: "Financial Risks" },
        { key: "contingencyPlans", title: "Contingency Plans" },
      ],
      render: () => (
        <>
          <h3 id="riskAnalysisMitigation" className="font-bold">Overview</h3>
          <ReactMarkdown>
            {generatedPlan.riskAnalysisMitigation.overview}
          </ReactMarkdown>
          <h3 className="font-bold">Market Risks</h3>
          <ReactMarkdown>
            {generatedPlan.riskAnalysisMitigation.marketRisks}
          </ReactMarkdown>
          <h3 className="font-bold">Operational Risks</h3>
          <ReactMarkdown>
            {generatedPlan.riskAnalysisMitigation.operationalRisks}
          </ReactMarkdown>
          <h3 className="font-bold">Regulatory &amp; Legal Risks</h3>
          <ReactMarkdown>
            {generatedPlan.riskAnalysisMitigation.regulatoryLegalRisks}
          </ReactMarkdown>
          <h3 className="font-bold">Financial Risks</h3>
          <ReactMarkdown>
            {generatedPlan.riskAnalysisMitigation.financialRisks}
          </ReactMarkdown>
          <h3 className="font-bold">Contingency Plans</h3>
          <ReactMarkdown>
            {generatedPlan.riskAnalysisMitigation.contingencyPlans}
          </ReactMarkdown>
        </>
      ),
    },
    {
      key: "appendices",
      title: "Appendices",
      description: "Glossary, resources & financial tables",
      icon: AppendixIcon,
      subsections: [
        { key: "glossary", title: "Glossary" },
        { key: "managementTeamsResources", title: "Management Teams’ Resources" },
        { key: "projectedFinancesTables", title: "Projected Finances Tables" },
      ],
      render: () => (
        <>
          <h3 id="appendices" className="font-bold">Glossary</h3>
          <ReactMarkdown>{generatedPlan.appendices.glossary}</ReactMarkdown>
          <h3 className="font-bold">Management Teams’ Resources</h3>
          <ReactMarkdown>
            {generatedPlan.appendices.managementTeamsResources}
          </ReactMarkdown>
          <h3 className="font-bold">Projected Finances Tables</h3>
          <ReactMarkdown>
            {generatedPlan.appendices.projectedFinancesTables}
          </ReactMarkdown>
        </>
      ),
    },
  ] as const

  const completedSections = sections.filter((s) => {
    const content = (generatedPlan as any)[s.key]
    if (typeof content === "string") {
      return content.trim().length > 0
    }
    if (typeof content === "object") {
      return Object.values(content).some(
        (v) => typeof v === "string" && v.trim().length > 0
      )
    }
    return false
  }).length

  return (
    <div className="flex h-screen bg-gray-50">         {/* use exact viewport height */}
      {/* Sidebar */}
       <nav className="sticky top-0 h-[calc(100vh-2rem)] overflow-y-auto w-56 px-4 py-12 bg-white no-scrollbar">
        <ul className="space-y-2 text-sm">
          {sections.map((s) => (
            <li key={s.key}>
              <button
                onClick={() => toggleSection(s.key)}
                className="w-full text-left font-medium hover:text-blue-600"
              >
                {s.title}
              </button>

              {s.subsections && openSection === s.key && (
                <ul className="mt-1 ml-4 space-y-1 text-xs text-gray-600">
                  {s.subsections.map((sub) => (
                    <li key={sub.key}>
                      <a
                        href={`#${s.key}`}
                        onClick={() => setOpenSection(s.key)}
                        className="block hover:text-blue-500"
                      >
                        {sub.title}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Header Bar */}
        <div className="px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div /> {/* placeholder to keep title area empty */}
            <div className="flex items-center space-x-2">
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-2xl px-4 py-2"
                >
                  Back to Dashboard
                </Button>
              </Link>
              <Button
                onClick={onDownload}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl px-6 py-3 font-semibold transition-all duration-300 transform hover:scale-105"
              >
                <Download className="h-4 w-4 mr-2" />
                Download DOCX
              </Button>
            </div>
          </div>
        </div>


        {/* Sections */}
        <div className="px-6 pt-2 pb-0">
          <div className="max-w-3xl mx-auto space-y-6">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <section id={section.key} key={section.key} className="scroll-mt-20">
                  <Card
                    className={`border-0 shadow-lg bg-white transition-all duration-300 ${
                      hoveredSection === section.key
                        ? "shadow-xl transform scale-[1.02]"
                        : ""
                    }`}
                    onMouseEnter={() => setHoveredSection(section.key)}
                    onMouseLeave={() => setHoveredSection(null)}
                  >
                    <CardHeader className="pb-4 px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl">
                            <Icon className="h-6 w-6 text-orange-600" />
                          </div>
                          <div>
                            <CardTitle className="text-xl font-bold text-gray-900">
                              {section.title}
                            </CardTitle>
                            {section.description && (
                              <p className="text-gray-600 text-sm mt-1">
                                {section.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => onEditSection(section.key)}
                          variant="outline"
                          size="sm"
                          className={`rounded-2xl transition-all duration-300 ${
                            hoveredSection === section.key
                              ? "opacity-100 transform scale-105 border-orange-300 text-orange-600 hover:bg-orange-50"
                              : "opacity-0"
                          }`}
                        >
                          <Edit3 className="h-4 w-2 mr-2" />
                          Ask to AI
                        </Button>
                      </div>
                    </CardHeader>


                    <Separator className="mx-6" />
                    <CardContent className="pt-6 px-6 space-y-6">
                      {section.subsections.map(({ key: subKey, title }) => {
                        const raw = (generatedPlan as any)[section.key][subKey]

                        // 1) If this subsection is an array, skip all the manual-edit
                        //    <textarea> / pencil icon logic and render a native table instead:
                        if (Array.isArray(raw)) {
                          return (
                            <div key={subKey} className="space-y-2">
                              <h4 className="font-bold">{title}</h4>
                              <table className="w-full table-auto border-collapse border">
                                <thead>
                                  {/** you can switch on subKey if you need different headers **/}
                                  <tr>
                                    {Object.keys(raw[0]).map((col) => (
                                      <th key={col} className="border px-2 py-1 text-left">
                                        {col}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {raw.map((row: any, i: number) => (
                                    <tr key={i}>
                                      {Object.values(row).map((val, j) => (
                                        <td key={j} className="border px-2 py-1">
                                          {val}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )
                        }

                        // 2) Otherwise, it’s just a string, so you still get your
                        //    inline‐edit pencil + textarea logic:

                        const text = typeof raw === "string" ? raw : JSON.stringify(raw, null, 2)
                        const isEditing =
                          manualEditingSection === section.key &&
                          manualEditingSubsection === subKey

                        return (
                          <div key={subKey} className="group space-y-2">
                            <div className="flex justify-between items-center">
                              <h4 className="font-bold">{title}</h4>
                              {!isEditing && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => onManualStartEdit(section.key, subKey)}
                                  aria-label={`Edit ${title}`}
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>

                            {isEditing ? (
                              <>
                                <textarea
                                  rows={4}
                                  className="w-full border rounded p-2 font-mono text-sm"
                                  value={manualEditedContent}
                                  onChange={(e) => onManualEditedContentChange(e.target.value)}
                                />
                                <div className="flex gap-2 mt-2">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      onManualSaveSubsection(
                                        section.key,
                                        subKey,
                                        manualEditedContent
                                      )
                                    }
                                  >
                                    Save
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={onManualCancel}>
                                    Cancel
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <ReactMarkdown>{text}</ReactMarkdown>
                            )}
                          </div>
                        )
                      })}
                    </CardContent>

                  </Card>
                </section>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
