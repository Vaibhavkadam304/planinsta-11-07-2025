"use client"

import React, { useState } from "react"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
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
} from "lucide-react"
import Link from "next/link"
// ✅ use types from PlanBuilderClient
import type { BusinessPlanData, GeneratedPlan } from "@/components/plan-builder/PlanBuilderClient"
import { TypewriterHTML } from "@/components/ui/TypewriterHTML"

/* -------------------------------------------------------------------------- */
/*                                       Helpers                              */
/* -------------------------------------------------------------------------- */

const LEGAL_LABELS: Record<string, string> = {
  "sole proprietorship": "Sole Proprietorship",
  "sole-proprietorship": "Sole Proprietorship",
  partnership: "Partnership",
  llp: "LLP",
  "private limited": "Private Limited",
  "pvt-ltd": "Private Limited",
  llc: "LLC",
  corporation: "Corporation",
  other: "Other",
}
const labelize = (v?: string) =>
  (v ? LEGAL_LABELS[v.trim().toLowerCase()] : "") || (v || "Not specified")

const formatAmount = (v?: string, locale: string = "en-IN") => {
  const s = String(v ?? "").trim()
  const n = Number(s.replace(/[^\d.-]/g, ""))
  return Number.isFinite(n) ? new Intl.NumberFormat(locale).format(n) : s
}

const esc = (s?: string) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

// Force “two paragraphs” for Business Overview
const twoParasSmart = (input?: string): [string, string] => {
  const raw = String(input ?? "")
  if (!raw.trim()) return ["", ""]
  const byBlank = raw.split(/\r?\n\s*\n/)
  if (byBlank.length > 1) return [byBlank[0].trim(), byBlank.slice(1).join(" ").trim()]
  const t = raw.replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim()
  const sentences = t.match(/[^.!?]+[.!?]+(?=\s|$)/g) ?? []
  if (sentences.length) {
    const breakAfter = sentences.length >= 16 ? 8 : Math.ceil(sentences.length / 2)
    const p1 = sentences.slice(0, breakAfter).join(" ").trim()
    const p2 = sentences.slice(breakAfter).join(" ").trim()
    if (p1 && p2) return [p1, p2]
  }
  const words = t.split(/\s+/)
  const mid = Math.ceil(words.length / 2)
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")]
}

/* -------------------------------------------------------------------------- */
/*                        Small blocks you already had                        */
/* -------------------------------------------------------------------------- */

function LegalOwnershipBlock({ data }: { data: BusinessPlanData }) {
  const owners = Array.isArray(data.ownership) ? data.ownership : []
  return (
    <div>
      <ul className="list-disc ml-6 space-y-1">
        <li><strong>Legal Structure:</strong> {labelize(data.legalStructure)}</li>
        <li>
          <strong>Country/State of Incorporation:</strong>{" "}
          {data.incorporationCountry || "Not specified"} / {data.incorporationState || "Not specified"}
        </li>
        <li>
          <strong>Ownership &amp; Founders:</strong>
          <ul className="list-disc ml-6 mt-1 space-y-1">
            {owners.length ? owners
              .filter(o => o?.name || o?.role || o?.ownershipPercent != null)
              .map((o, i) => (
                <li key={i}>
                  {o.name || "Owner"} — {o.role || "Role"}
                  {o.ownershipPercent != null ? ` — ${o.ownershipPercent}%` : ""}
                </li>
              ))
              : <li>Not specified</li>}
          </ul>
        </li>
      </ul>
    </div>
  )
}

function FoundingTeamBlock({ data }: { data: BusinessPlanData }) {
  const founders = Array.isArray(data.founders) ? data.founders : []
  return (
    <div>
      <ul className="list-disc ml-6 space-y-3">
        {founders.length ? founders
          .filter(f => f?.name || f?.title || f?.linkedinUrl || f?.bio)
          .map((f, i) => (
            <li key={i}>
              <div>
                {f.name || "Founder"} — {f.title || "Title"}
                {f.linkedinUrl ? <> — <a className="underline" href={f.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a></> : null}
              </div>
              {f.bio ? (
                <p className="mt-1 text-sm text-gray-700 whitespace-pre-line">{f.bio}</p>
              ) : null}
            </li>
          ))
          : <li>Not specified</li>}
      </ul>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   Component                                */
/* -------------------------------------------------------------------------- */

interface PlanOutputProps {
  planData: BusinessPlanData
  generatedPlan: GeneratedPlan
  onEditSection: (sectionKey: string) => void
  manualEditingSection: string | null
  manualEditingSubsection: string | null
  manualEditedContent: string
  onManualStartEdit: (sectionKey: string, subKey: string) => void
  onManualSaveSubsection: (sectionKey: string, subKey: string, newContent: string) => void
  onManualEditedContentChange: (value: string) => void
  onManualCancel: () => void
  onDownload: () => void
}

export function PlanOutput(props: PlanOutputProps) {
  const {
    planData,
    generatedPlan,
    onEditSection,
    onDownload,
    onManualStartEdit,
    onManualSaveSubsection,
    manualEditingSection,
    manualEditingSubsection,
    manualEditedContent,
    onManualEditedContentChange,
    onManualCancel,
  } = props

  const [hoveredSection, setHoveredSection] = useState<string | null>(null)
  const [openSection, setOpenSection] = useState<string | null>(null)
  const toggleSection = (key: string) => setOpenSection(openSection === key ? null : key)

  const productCount = Array.isArray(planData.products) ? planData.products.length : 0

  const sections = [
    {
      key: "executiveSummary",
      title: "Executive Summary",
      description: "Business overview, mission, funding, problem & solution",
      icon: FileText,
      subsections: [
        { key: "businessOverview", title: "Business Overview" },
        { key: "ourMission", title: "Our Mission" },
        { key: "funding", title: "Funding Requirements" },
        { key: "problemStatement", title: "Problem Statement" },
        { key: "solution", title: "Solution" },
      ],
    },
    {
      key: "companyOverview",
      title: "Company Overview",
      description: "Vision, mission, legal & founding team",
      icon: Package,
      subsections: [
        { key: "visionStatement", title: "Vision Statement" },
        { key: "missionStatement", title: "Mission Statement" },
        { key: "legalStructureOwnership", title: "Legal Structure & Ownership" },
        { key: "foundingTeam", title: "Founding Team" },
      ],
    },
    {
      key: "products",
      title: "Products",
      description: "Overview, details, USPs, roadmap & IP status",
      icon: Target,
      subsections: [
        { key: "overview", title: "Overview" },
        ...Array.from({ length: productCount }, (_, i) => ({
          key: `product${i + 1}`,
          title: `Product ${i + 1}${planData.products?.[i]?.name ? `: ${planData.products[i].name}` : ""}`,
        })),
        { key: "uniqueSellingPropositions", title: "Unique Selling Propositions (USPs)" },
        { key: "developmentRoadmap", title: "Development Roadmap" },
        { key: "intellectualPropertyRegulatoryStatus", title: "Intellectual Property & Regulatory Status" },
      ],
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
    },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
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
            <div />
            <div className="flex items-center space-x-2">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="rounded-2xl px-4 py-2">
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
                      hoveredSection === section.key ? "shadow-xl transform scale-[1.02]" : ""
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
                              <p className="text-gray-600 text-sm mt-1">{section.description}</p>
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
                      {/* ───────────────────────────── Executive Summary (static) ───────────────────────────── */}
                      {section.key === "executiveSummary" ? (
                        <>
                          {/* Business Overview */}
                          <div className="group space-y-2">
                            <div className="flex justify-between items-center">
                              <h4 className="font-bold">Business Overview</h4>
                              {!(manualEditingSection === "executiveSummary" && manualEditingSubsection === "businessOverview") && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => onManualStartEdit("executiveSummary", "businessOverview")}
                                  aria-label="Edit Business Overview"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>

                            {manualEditingSection === "executiveSummary" && manualEditingSubsection === "businessOverview" ? (
                              <>
                                <textarea
                                  rows={6}
                                  className="w-full border rounded p-2 font-mono text-sm"
                                  value={manualEditedContent}
                                  onChange={(e) => onManualEditedContentChange(e.target.value)}
                                />
                                <div className="flex gap-2 mt-2">
                                  <Button size="sm" onClick={() => onManualSaveSubsection("executiveSummary", "businessOverview", manualEditedContent)}>Save</Button>
                                  <Button size="sm" variant="outline" onClick={onManualCancel}>Cancel</Button>
                                </div>
                              </>
                            ) : (
                              (() => {
                                const [p1, p2] = twoParasSmart(generatedPlan.executiveSummary.businessOverview)
                                const content = [p1, p2].filter(Boolean).join("\n\n")
                                return (
                                  <ReactMarkdown components={{ p: ({ node, ...props }) => <p className="mb-4 leading-7" {...props} /> }}>
                                    {content}
                                  </ReactMarkdown>
                                )
                              })()
                            )}
                          </div>

                          {/* Our Mission */}
                          <div className="group space-y-2">
                            <div className="flex justify-between items-center">
                              <h4 className="font-bold">Our Mission</h4>
                              {!(manualEditingSection === "executiveSummary" && manualEditingSubsection === "ourMission") && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => onManualStartEdit("executiveSummary", "ourMission")}
                                  aria-label="Edit Our Mission"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            {manualEditingSection === "executiveSummary" && manualEditingSubsection === "ourMission" ? (
                              <>
                                <textarea
                                  rows={4}
                                  className="w-full border rounded p-2 font-mono text-sm"
                                  value={manualEditedContent}
                                  onChange={(e) => onManualEditedContentChange(e.target.value)}
                                />
                                <div className="flex gap-2 mt-2">
                                  <Button size="sm" onClick={() => onManualSaveSubsection("executiveSummary", "ourMission", manualEditedContent)}>Save</Button>
                                  <Button size="sm" variant="outline" onClick={onManualCancel}>Cancel</Button>
                                </div>
                              </>
                            ) : (
                              <ReactMarkdown>{generatedPlan.executiveSummary.ourMission}</ReactMarkdown>
                            )}
                          </div>

                          {/* Funding Requirements (P1 + Table + P2) */}
                          <div className="group space-y-2">
                            <div className="flex justify-between items-center">
                              <h4 className="font-bold">Funding Requirements</h4>
                              {!(manualEditingSection === "executiveSummary" && manualEditingSubsection === "funding") && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => onManualStartEdit("executiveSummary", "funding")}
                                  aria-label="Edit Funding (JSON)"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>

                            {/* P1 */}
                            <ReactMarkdown>{generatedPlan.executiveSummary.funding.p1}</ReactMarkdown>

                            {/* Usage of Funds table */}
                            <h5 className="font-semibold mt-2">Usage of Funds (must sum to 100%)</h5>
                            {(() => {
                              const ufRows = Array.isArray(generatedPlan?.executiveSummary?.funding?.usageOfFunds)
                                ? generatedPlan.executiveSummary.funding.usageOfFunds
                                : []

                              if (!ufRows.length) {
                                return (
                                  <p className="text-sm text-gray-500">
                                    No usage-of-funds rows yet. (This section will populate after generation or edit.)
                                  </p>
                                )
                              }

                              const totalPct = ufRows.reduce((a, r) => a + (Number(r?.allocationPercent) || 0), 0)

                              return (
                                <table className="w-full table-auto border-collapse border">
                                  <thead>
                                    <tr>
                                      <th className="border px-2 py-1 text-left">Department</th>
                                      <th className="border px-2 py-1 text-left">Allocation %</th>
                                      <th className="border px-2 py-1 text-left">Amount (INR)</th>
                                      <th className="border px-2 py-1 text-left">How it will be used</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {ufRows.map((r, i) => (
                                      <tr key={i}>
                                        <td className="border px-2 py-1">{r?.department ?? ""}</td>
                                        <td className="border px-2 py-1">{`${Number(r?.allocationPercent || 0)}%`}</td>
                                        <td className="border px-2 py-1">₹{formatAmount(r?.amount)}</td>
                                        <td className="border px-2 py-1">{r?.howUsed ?? ""}</td>
                                      </tr>
                                    ))}
                                    <tr>
                                      <td className="border px-2 py-1 font-semibold">Total</td>
                                      <td className="border px-2 py-1 font-semibold">{totalPct}%</td>
                                      <td className="border px-2 py-1"></td>
                                      <td className="border px-2 py-1"></td>
                                    </tr>
                                  </tbody>
                                </table>
                              )
                            })()}

                            {/* P2 */}
                            <div className="mt-2">
                              <ReactMarkdown>
                                {generatedPlan.executiveSummary.funding.p2}
                              </ReactMarkdown>
                            </div>
                          </div>

                          {/* Problem Statement */}
                          <div className="group space-y-2">
                            <div className="flex justify-between items-center">
                              <h4 className="font-bold">Problem Statement</h4>
                              {!(manualEditingSection === "executiveSummary" && manualEditingSubsection === "problemStatement") && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => onManualStartEdit("executiveSummary", "problemStatement")}
                                  aria-label="Edit Problem Statement"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            {manualEditingSection === "executiveSummary" && manualEditingSubsection === "problemStatement" ? (
                              <>
                                <textarea
                                  rows={5}
                                  className="w-full border rounded p-2 font-mono text-sm"
                                  value={manualEditedContent}
                                  onChange={(e) => onManualEditedContentChange(e.target.value)}
                                />
                                <div className="flex gap-2 mt-2">
                                  <Button size="sm" onClick={() => onManualSaveSubsection("executiveSummary", "problemStatement", manualEditedContent)}>Save</Button>
                                  <Button size="sm" variant="outline" onClick={onManualCancel}>Cancel</Button>
                                </div>
                              </>
                            ) : (
                              <ReactMarkdown>{generatedPlan.executiveSummary.problemStatement}</ReactMarkdown>
                            )}
                          </div>

                          {/* Solution */}
                          <div className="group space-y-2">
                            <div className="flex justify-between items-center">
                              <h4 className="font-bold">Solution</h4>
                              {!(manualEditingSection === "executiveSummary" && manualEditingSubsection === "solution") && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => onManualStartEdit("executiveSummary", "solution")}
                                  aria-label="Edit Solution"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            {manualEditingSection === "executiveSummary" && manualEditingSubsection === "solution" ? (
                              <>
                                <textarea
                                  rows={5}
                                  className="w-full border rounded p-2 font-mono text-sm"
                                  value={manualEditedContent}
                                  onChange={(e) => onManualEditedContentChange(e.target.value)}
                                />
                                <div className="flex gap-2 mt-2">
                                  <Button size="sm" onClick={() => onManualSaveSubsection("executiveSummary", "solution", manualEditedContent)}>Save</Button>
                                  <Button size="sm" variant="outline" onClick={onManualCancel}>Cancel</Button>
                                </div>
                              </>
                            ) : (
                              <ReactMarkdown>{generatedPlan.executiveSummary.solution}</ReactMarkdown>
                            )}
                          </div>
                        </>
                      ) : (
                        /* ───────────────────────────── Generic renderer for all other sections ───────────────────────────── */
                        section.subsections.map(({ key: subKey, title }) => {
                          // Deterministic JSX for legal/ownership + founding team
                          if (section.key === "companyOverview" && subKey === "legalStructureOwnership") {
                            return (
                              <div key={subKey} className="group space-y-2">
                                <div className="flex justify-between items-center">
                                  <h4 className="font-bold">{title}</h4>
                                </div>
                                <LegalOwnershipBlock data={planData} />
                              </div>
                            )
                          }
                          if (section.key === "companyOverview" && subKey === "foundingTeam") {
                            return (
                              <div key={subKey} className="group space-y-2">
                                <div className="flex justify-between items-center">
                                  <h4 className="font-bold">{title}</h4>
                                </div>
                                <FoundingTeamBlock data={planData} />
                              </div>
                            )
                          }

                          // Generic renderer: arrays => table, strings/objects => markdown + inline edit
                          const raw = (generatedPlan as any)[section.key][subKey]

                          if (Array.isArray(raw)) {
                            return (
                              <div key={subKey} className="space-y-2">
                                <h4 className="font-bold">{title}</h4>
                                <table className="w-full table-auto border-collapse border">
                                  <thead>
                                    <tr>
                                      {Object.keys(raw[0] || {}).map((col) => (
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
                                            {val as any}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )
                          }

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
                                        onManualSaveSubsection(section.key, subKey, manualEditedContent)
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
                        })
                      )}
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
