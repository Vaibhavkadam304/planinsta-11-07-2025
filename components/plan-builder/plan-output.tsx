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

// ✅ Recharts (for the pie)
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

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

// number parser + currency formatter for our Revenue Statement
const num = (x: any) => {
  const n = Number(String(x ?? "").replace(/[^0-9.-]/g, ""))
  return Number.isFinite(n) ? n : 0
}
const fmtINR = (n: number) =>
  n === 0 && !Number.isFinite(n) ? "—" : `₹${new Intl.NumberFormat("en-IN").format(Math.round(n))}`

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
/*                  Use of Funds Pie (Financial Plan section)                 */
/* -------------------------------------------------------------------------- */

function computeUseOfFunds(planData: BusinessPlanData, generatedPlan: GeneratedPlan | null) {
  const aiRows = (generatedPlan as any)?.executiveSummary?.funding?.usageOfFunds
  if (Array.isArray(aiRows) && aiRows.length) {
    const hasPct = aiRows.some((r: any) => Number(r?.allocationPercent) > 0)
    if (hasPct) {
      return aiRows
        .map((r: any) => ({
          name: String(r?.department || r?.category || "Other"),
          value: Number(r?.allocationPercent || 0),
        }))
        .filter(d => d.value > 0)
    }
    const amounts = aiRows.map((r: any) => Number(String(r?.amount ?? "").replace(/[^\d.-]/g, "")) || 0)
    const total = amounts.reduce((a: number, b: number) => a + b, 0)
    if (total > 0) {
      return aiRows.map((r: any, i: number) => ({
        name: String(r?.department || r?.category || "Other"),
        value: (amounts[i] / total) * 100,
      }))
    }
  }

  const rows = Array.isArray((planData as any).fundingUseBreakdown)
    ? (planData as any).fundingUseBreakdown
    : []
  const amounts = rows.map((r: any) => Number(String(r?.amount ?? "").replace(/[^\d.-]/g, "")) || 0)
  const total = amounts.reduce((a: number, b: number) => a + b, 0)
  if (total <= 0) return []
  return rows.map((r: any, i: number) => ({
    name: String(r?.item || r?.category || "Other"),
    value: (amounts[i] / total) * 100,
  }))
}

const PIE_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981", "#14b8a6",
  "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#ec4899", "#f43f5e",
]
const colorAt = (i: number) => PIE_COLORS[i % PIE_COLORS.length]

function UseOfFundsPie({
  planData,
  generatedPlan,
}: { planData: BusinessPlanData; generatedPlan: GeneratedPlan | null }) {
  const data = computeUseOfFunds(planData, generatedPlan)
  if (!data.length) {
    return <p className="text-sm text-gray-500">No Use-of-Funds data available.</p>
  }

  return (
    <div className="w-full h-80 rounded-xl p-3 bg-white">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="70%"
            labelLine
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={colorAt(i)} stroke="#ffffff" strokeWidth={1} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*             Revenue Statement (computed from quiz/planData)                */
/* -------------------------------------------------------------------------- */

function RevenueStatementTable({ planData }: { planData: BusinessPlanData }) {
  const company = String(planData.businessName ?? "").trim() || "—"
  const mRev = num(planData.monthlyRevenue)
  const mExp = num(planData.monthlyExpenses)
  const yRev = mRev * 12
  const yExp = mExp * 12
  const netM = mRev - mExp
  const netY = netM * 12

  const invest = num((planData as any).initialInvestment)
  const fundingReceived = num((planData as any).fundingReceived)
  const fundingNeeded = num((planData as any).fundingNeeded)

  const useRows = Array.isArray((planData as any).fundingUseBreakdown)
    ? (planData as any).fundingUseBreakdown
    : []

  const utilRows = Array.isArray((planData as any).investmentUtilization)
    ? (planData as any).investmentUtilization
    : []

  return (
    <div className="space-y-2">
      <h4 className="font-bold">Startup Revenue Statement</h4>
      <table className="w-full table-auto border-collapse border">
        <thead>
          <tr>
            <th className="border px-2 py-1 text-left bg-gray-50">Metric</th>
            <th className="border px-2 py-1 text-left bg-gray-50">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="border px-2 py-1">Company Name</td><td className="border px-2 py-1">{company}</td></tr>

          <tr><td className="border px-2 py-1">Current Monthly Revenue</td><td className="border px-2 py-1">{mRev ? fmtINR(mRev) : "—"}</td></tr>
          <tr><td className="border px-2 py-1">Projected Annual Revenue (×12)</td><td className="border px-2 py-1">{mRev ? fmtINR(yRev) : "—"}</td></tr>

          <tr><td className="border px-2 py-1">Current Monthly Expenses</td><td className="border px-2 py-1">{mExp ? fmtINR(mExp) : "—"}</td></tr>
          <tr><td className="border px-2 py-1">Projected Annual Expenses (×12)</td><td className="border px-2 py-1">{mExp ? fmtINR(yExp) : "—"}</td></tr>

          {useRows?.length ? (
            <>
              <tr><td className="border px-2 py-1 font-semibold" colSpan={2}>Breakdown of Expenses (planned use)</td></tr>
              {useRows.map((r: any, i: number) => (
                <tr key={`use-${i}`}>
                  <td className="border px-2 py-1">• {r?.item ?? r?.category ?? r?.use ?? "—"}</td>
                  <td className="border px-2 py-1">{r?.amount ? fmtINR(num(r.amount)) : "—"}</td>
                </tr>
              ))}
            </>
          ) : null}

          <tr><td className="border px-2 py-1">Net Profit / (Loss) – Monthly</td><td className="border px-2 py-1">{(mRev || mExp) ? fmtINR(netM) : "—"}</td></tr>
          <tr><td className="border px-2 py-1">Net Profit / (Loss) – Annual</td><td className="border px-2 py-1">{(mRev || mExp) ? fmtINR(netY) : "—"}</td></tr>

          <tr><td className="border px-2 py-1">Initial Investment</td><td className="border px-2 py-1">{invest ? fmtINR(invest) : "—"}</td></tr>
          {utilRows?.length ? (
            <>
              <tr><td className="border px-2 py-1 font-semibold" colSpan={2}>Breakdown of Initial Investment</td></tr>
              {utilRows.map((r: any, i: number) => (
                <tr key={`util-${i}`}>
                  <td className="border px-2 py-1">• {r?.item ?? r?.category ?? r?.use ?? "—"}</td>
                  <td className="border px-2 py-1">{r?.amount ? fmtINR(num(r.amount)) : "—"}</td>
                </tr>
              ))}
            </>
          ) : null}

          <tr><td className="border px-2 py-1">External Funding Received</td><td className="border px-2 py-1">{fundingReceived ? fmtINR(fundingReceived) : "—"}</td></tr>
          <tr><td className="border px-2 py-1">Funding Requirement</td><td className="border px-2 py-1">{fundingNeeded ? fmtINR(fundingNeeded) : "—"}</td></tr>
        </tbody>
      </table>
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

  const [mode, setMode] = useState<"preview" | "edit">("preview")
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
      key: "swot",
      title: "SWOT Analysis",
      description:
        "Strengths (Success Drivers) and Weaknesses generated from your inputs, plus Opportunities and Threats.",
      icon: Shield,
      subsections: [
        { key: "strengths", title: "Strengths / Success Drivers" },
        { key: "weaknesses", title: "Weaknesses" },
        { key: "opportunities", title: "Opportunities" },
        { key: "threats", title: "Threats" },
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
      description: "Assumptions, revenue statement & metrics",
      icon: DollarSign,
      subsections: [
        { key: "overview", title: "Overview" },
        { key: "keyAssumptions", title: "Key Assumptions" },
        { key: "revenueStatement", title: "Startup Revenue Statement" },
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

  const buildFullPlanHTML = () => {
    const joinParas = (txt: any) => {
      const s = String(txt ?? "").trim()
      if (!s) return ""
      if (s.includes("\n\n")) {
        return s.split(/\n\n+/).map(p => `<p>${esc(p)}</p>`).join("")
      }
      const sentences = s.split(/(?<=[.!?])\s+/)
      if (sentences.length < 2) return `<p>${esc(s)}</p>`
      const mid = Math.ceil(sentences.length / 2)
      return `<p>${esc(sentences.slice(0, mid).join(" "))}</p><p>${esc(sentences.slice(mid).join(" "))}</p>`
    }

    const listBlock = (title: string, items: any[]) => {
      const li = (items || []).map(x => {
        const t = typeof x === "string" ? x : (x && typeof x === "object" && ("Item" in x || "item" in x) ? (x.Item ?? x.item) : JSON.stringify(x))
        return `<li>${esc(t)}</li>`
      }).join("")
      return `<div class="mb-3"><h3 class="font-semibold text-lg mb-2">${esc(title)}</h3><ul class="list-disc ml-6 space-y-1">${li}</ul></div>`
    }

    const tableFromArray = (title: string, rows: any[]) => {
      if (!Array.isArray(rows) || rows.length === 0) {
        return `<div class="mb-3"><h3 class="font-semibold text-lg mb-2">${esc(title)}</h3><p class="text-sm text-gray-500">No data.</p></div>`
      }
      const keysSet = new Set<string>()
      rows.forEach(r => Object.keys(r || {}).forEach(k => keysSet.add(k)))
      const keys = Array.from(keysSet)
      const head = keys.map(k => `<th class="border px-2 py-1 text-left">${esc(k)}</th>`).join("")
      const body = rows.map(r => `<tr>${
        keys.map(k => `<td class="border px-2 py-1">${esc((r || {})[k])}</td>`).join("")
      }</tr>`).join("")
      return `<div class="mb-3">
        <h3 class="font-semibold text-lg mb-2">${esc(title)}</h3>
        <table class="w-full table-auto border-collapse border">
          <thead><tr>${head}</tr></thead>
          <tbody>${body}</tbody>
        </table>
      </div>`
    }

    const revenueStatementHTML = () => {
      const company = String(planData.businessName ?? "").trim() || "—"
      const mRev = num((planData as any).monthlyRevenue)
      const mExp = num((planData as any).monthlyExpenses)
      const yRev = mRev * 12
      const yExp = mExp * 12
      const netM = mRev - mExp
      const netY = netM * 12

      const invest = num((planData as any).initialInvestment)
      const fundingReceived = num((planData as any).fundingReceived)
      const fundingNeeded = num((planData as any).fundingNeeded)

      const useRows = Array.isArray((planData as any).fundingUseBreakdown)
        ? (planData as any).fundingUseBreakdown
        : []

      const utilRows = Array.isArray((planData as any).investmentUtilization)
        ? (planData as any).investmentUtilization
        : []

      const row = (k: string, v: string) => `<tr><td class="border px-2 py-1">${esc(k)}</td><td class="border px-2 py-1">${esc(v)}</td></tr>`
      const money = (n: number) => (n || n === 0) ? `₹${new Intl.NumberFormat("en-IN").format(Math.round(n))}` : "—"

      let rows = ""
      rows += row("Company Name", company)
      rows += row("Current Monthly Revenue", mRev ? money(mRev) : "—")
      rows += row("Projected Annual Revenue (×12)", mRev ? money(yRev) : "—")
      rows += row("Current Monthly Expenses", mExp ? money(mExp) : "—")
      rows += row("Projected Annual Expenses (×12)", mExp ? money(yExp) : "—")

      if (useRows?.length) {
        rows += `<tr><td class="border px-2 py-1 font-semibold" colspan="2">Breakdown of Expenses (planned use)</td></tr>`
        for (const r of useRows) {
          rows += row(`• ${String(r?.item ?? r?.category ?? r?.use ?? "—")}`, r?.amount ? money(num(r.amount)) : "—")
        }
      }

      rows += row("Net Profit / (Loss) – Monthly", (mRev || mExp) ? money(netM) : "—")
      rows += row("Net Profit / (Loss) – Annual", (mRev || mExp) ? money(netY) : "—")

      rows += row("Initial Investment", invest ? money(invest) : "—")
      if (utilRows?.length) {
        rows += `<tr><td class="border px-2 py-1 font-semibold" colspan="2">Breakdown of Initial Investment</td></tr>`
        for (const r of utilRows) {
          rows += row(`• ${String(r?.item ?? r?.category ?? r?.use ?? "—")}`, r?.amount ? money(num(r.amount)) : "—")
        }
      }
      rows += row("External Funding Received", fundingReceived ? money(fundingReceived) : "—")
      rows += row("Funding Requirement", fundingNeeded ? money(fundingNeeded) : "—")

      return `<div class="mb-3">
        <h3 class="font-semibold text-lg mb-2">Startup Revenue Statement</h3>
        <table class="w-full table-auto border-collapse border">
          <thead>
            <tr>
              <th class="border px-2 py-1 text-left bg-gray-50">Metric</th>
              <th class="border px-2 py-1 text-left bg-gray-50">Value</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`
    }

    const sectionHTML: string[] = []

    for (const section of sections) {
      const gpSec: any = (generatedPlan as any)[section.key] || {}
      const parts: string[] = []

      if (section.key === "executiveSummary") {
        if (gpSec?.businessOverview) {
          parts.push(`<h3 class="font-semibold text-lg mb-2">Business Overview</h3>` + joinParas(gpSec.businessOverview))
        }
        if (gpSec?.ourMission) {
          parts.push(`<h3 class="font-semibold text-lg mb-2">Our Mission</h3><p>${esc(gpSec.ourMission)}</p>`)
        }
        if (gpSec?.funding) {
          const f = gpSec.funding || {}
          if (f.p1) parts.push(`<h3 class="font-semibold text-lg mb-2">Funding Requirements</h3><p>${esc(f.p1)}</p>`)
          if (Array.isArray(f.usageOfFunds) && f.usageOfFunds.length) {
            parts.push(tableFromArray("Usage of Funds", f.usageOfFunds))
          }
          if (f.p2) parts.push(`<p>${esc(f.p2)}</p>`)
        }
        if (gpSec?.problemStatement) {
          parts.push(`<h3 class="font-semibold text-lg mb-2">Problem Statement</h3><p>${esc(gpSec.problemStatement)}</p>`)
        }
        if (gpSec?.solution) {
          parts.push(`<h3 class="font-semibold text-lg mb-2">Solution</h3><p>${esc(gpSec.solution)}</p>`)
        }
      } else if (section.key === "swot") {
        const norm = (list: any): string[] =>
          Array.isArray(list)
            ? list
                .map((x) => (typeof x === "string" ? x : (x?.Item ?? x?.item ?? "")))
                .map((s) => String(s).trim())
                .filter(Boolean)
            : []

        const strengths =
          norm(gpSec?.strengths).length > 0 ? norm(gpSec?.strengths) : norm(planData.successDrivers)
        const weaknesses =
          norm(gpSec?.weaknesses).length > 0 ? norm(gpSec?.weaknesses) : norm(planData.weaknesses)
        const opportunities = norm(gpSec?.opportunities)
        const threats = norm(gpSec?.threats)

        const blocks: Array<[string, string[]]> = [
          ["Strengths / Success Drivers", strengths],
          ["Weaknesses", weaknesses],
          ["Opportunities", opportunities],
          ["Threats", threats],
        ]

        for (const [title, arr] of blocks) {
          if (arr.length) parts.push(listBlock(String(title), arr))
        }
      } else if (section.key === "financialPlan") {
        for (const sub of section.subsections || []) {
          if (sub.key === "revenueStatement") {
            parts.push(revenueStatementHTML())
            continue
          }
          const raw = gpSec?.[sub.key]
          if (raw == null || raw === "") {
            if (sub.key === "useOfFundsRunway") {
              parts.push(`<div></div>`)
            }
            continue
          }

          if (typeof raw === "string") {
            parts.push(`<h3 class="font-semibold text-lg mb-2">${esc(sub.title)}</h3><p>${esc(raw)}</p>`)
            continue
          }
          if (Array.isArray(raw)) {
            parts.push(tableFromArray(sub.title, raw))
            continue
          }
          if (typeof raw === "object") {
            const rows = Object.entries(raw).map(([k, v]) => ({ Field: k, Value: (typeof v === "string" ? v : JSON.stringify(v)) }))
            parts.push(tableFromArray(sub.title, rows))
            continue
          }
        }
      } else {
        for (const sub of section.subsections || []) {
          const raw = gpSec?.[sub.key]
          if (raw == null || raw === "") continue

          if (typeof raw === "string") {
            parts.push(`<h3 class="font-semibold text-lg mb-2">${esc(sub.title)}</h3><p>${esc(raw)}</p>`)
            continue
          }

          if (Array.isArray(raw)) {
            const allSimple = raw.every((v: any) => typeof v === "string" || (v && typeof v === "object" && ("Item" in v || "item" in v)))
            if (allSimple) {
              parts.push(listBlock(sub.title, raw))
            } else {
              parts.push(tableFromArray(sub.title, raw))
            }
            continue
          }

          if (typeof raw === "object") {
            const rows = Object.entries(raw).map(([k, v]) => ({ Field: k, Value: (typeof v === "string" ? v : JSON.stringify(v)) }))
            parts.push(tableFromArray(sub.title, rows))
            continue
          }
        }
      }

      if (parts.length) {
        sectionHTML.push(
          `<section id="${esc(section.key)}" class="mb-8">` +
            `<h2 class="text-2xl font-bold mb-3">${esc(section.title)}</h2>` +
            parts.join("") +
          `</section>`
        )
      }
    }
    return sectionHTML.join("")
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <nav className="sticky top-0 h-[calc(100vh-2rem)] overflow-y-auto w-56 px-4 py-12 bg-white no-scrollbar">
        <ul className="space-y-1 text-sm font-normal">
          {sections.map((s) => (
            <li key={s.key}>
              <button
                onClick={() => toggleSection(s.key)}
                className="w-full text-left text-[14px] leading-tight py-0.5
                           font-[460] tracking-[0.01em] text-slate-700
                           hover:text-slate-900 hover:font-[500] transition-colors"
              >
                {s.title}
              </button>

              {s.subsections && openSection === s.key && (
                <ul className="mt-0.5 ml-4 space-y-0.5 text-xs text-gray-600">
                  {s.subsections.map((sub) => (
                    <li key={sub.key}>
                      <a
                        href={`#${s.key}`}
                        onClick={() => setOpenSection(s.key)}
                        className="block hover:text-blue-500 leading-tight py-0.5"
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
              <Button
                variant={mode === "preview" ? "default" : "outline"}
                size="sm"
                className="rounded-2xl px-4 py-2"
                onClick={() => setMode("preview")}
              >
                Preview
              </Button>
              <Button
                variant={mode === "edit" ? "default" : "outline"}
                size="sm"
                className="rounded-2xl px-4 py-2"
                onClick={() => setMode("edit")}
              >
                Edit Mode
              </Button>

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
            {mode === "preview" ? (
              <div className="prose max-w-none">
                <TypewriterHTML
                  html={buildFullPlanHTML()}
                  durationMs={16000}
                  targetSegments={80}
                  startDelayMs={200}
                  cursor
                />
              </div>
            ) : null}

            {mode === "edit" && sections.map((section) => {
              const Icon = section.icon
              return (
                <section id={section.key} key={section.key} className="scroll-mt-20">
                  <Card
                    className={`border border-slate-200/70 shadow-lg rounded-2xl overflow-hidden
                      bg-zinc-50
                      transition-all duration-300 ${hoveredSection === section.key ? "shadow-xl transform scale-[1.02]" : ""}`}
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
                          <Edit3 className="h-4 w-4 mr-2" />
                          Ask to AI
                        </Button>
                      </div>
                    </CardHeader>

                    <Separator className="mx-6" />
                    <CardContent className="pt-6 px-6 space-y-6">
                      {section.key === "executiveSummary" ? (
                        <>
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

                            <ReactMarkdown>{generatedPlan.executiveSummary.funding.p1}</ReactMarkdown>

                            <h5 className="font-semibold mt-2">Usage of Funds (must sum to 100%)</h5>
                            <UseOfFundsPie planData={planData} generatedPlan={generatedPlan} />
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
                            
                            <div className="mt-2">
                              <ReactMarkdown>
                                {generatedPlan.executiveSummary.funding.p2}
                              </ReactMarkdown>
                            </div>
                          </div>

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
                        section.subsections.map(({ key: subKey, title }) => {
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

                          if (section.key === "financialPlan" && subKey === "revenueStatement") {
                            return <RevenueStatementTable key={subKey} planData={planData} />
                          }

                          if (section.key === "financialPlan" && subKey === "useOfFundsRunway") {
                            return (
                              <div key={subKey} className="space-y-3">
                                <h4 className="font-bold">{title}</h4>
                                {(() => {
                                  const raw = (generatedPlan as any)?.financialPlan?.[subKey]
                                  if (!raw) return null
                                  const text = typeof raw === "string" ? raw : JSON.stringify(raw, null, 2)
                                  return <ReactMarkdown>{text}</ReactMarkdown>
                                })()}
                              </div>
                            )
                          }

                          if (section.key === "swot") {
                            const sw = (generatedPlan as any)?.swot ?? {}
                            const norm = (list: any): string[] =>
                              Array.isArray(list)
                                ? list
                                    .map((x) => (typeof x === "string" ? x : (x?.Item ?? x?.item ?? "")))
                                    .map((s) => String(s).trim())
                                    .filter(Boolean)
                                : []

                            const strengths =
                              norm(sw.strengths).length > 0 ? norm(sw.strengths) : norm(planData.successDrivers)
                            const weaknesses =
                              norm(sw.weaknesses).length > 0 ? norm(sw.weaknesses) : norm(planData.weaknesses)
                            const opportunities = norm(sw.opportunities)
                            const threats = norm(sw.threats)

                            const map: Record<string, string[]> = {
                              strengths,
                              weaknesses,
                              opportunities,
                              threats,
                            }

                            const list = map[subKey] ?? []

                            return (
                              <div key={subKey} className="space-y-2">
                                <h4 className="font-bold">{title}</h4>

                                {list.length ? (
                                  <div className="space-y-3">
                                    {list.map((t, i) => (
                                      <div key={i} className="pl-6 relative">
                                        <span aria-hidden className="absolute left-0 top-1.5">•</span>
                                        <div className="prose prose-sm max-w-none">
                                          <ReactMarkdown
                                            components={{
                                              p: ({ node, ...props }) => (
                                                <p className="m-0 leading-7" {...props} />
                                              ),
                                            }}
                                          >
                                            {t}
                                          </ReactMarkdown>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500">No items available.</p>
                                )}
                              </div>
                            )
                          }

                          const raw = (generatedPlan as any)[section.key]?.[subKey]
                          if (Array.isArray(raw)) {
                            return (
                              <div key={subKey} className="space-y-2">
                                <h4 className="font-bold">{title}</h4>
                                {raw.length === 0 ? (
                                  <p className="text-sm text-gray-500">No data available.</p>
                                ) : (
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
                                              {String(val)}
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
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
