"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import OpenAI from "openai"
import { z } from "zod"
import type { BusinessPlanData, GeneratedPlan } from "@/components/plan-builder/PlanBuilderClient"

// ──────────────────────────────────────────────────────────────
// Helpers (balanced expansion/compression)
// ──────────────────────────────────────────────────────────────

type OpenAIClient = InstanceType<typeof OpenAI>

function stripFences(text: string): string {
  let t = (text ?? "").trim()
  if (t.startsWith("```")) t = t.replace(/^```(?:json)?\r?\n/, "")
  if (t.endsWith("```")) t = t.replace(/\r?\n```$/, "")
  return t.trim()
}
const ensure = (s?: string, fallback = "") =>
  typeof s === "string" && s.trim().length > 0 ? s : fallback

const getByPath = (obj: any, path: string) =>
  path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj)

const setByPath = (obj: any, path: string, value: string) => {
  const parts = path.split(".")
  const last = parts.pop() as string
  const parent = parts.reduce((o, k) => (o[k] ??= {}), obj)
  parent[last] = value
}

const wc = (s: string) => (s || "").trim().split(/\s+/).filter(Boolean).length

function takeFirstWords(s: string, maxWords: number) {
  const words = s.trim().split(/\s+/)
  if (words.length <= maxWords) return s.trim()
  return words.slice(0, maxWords).join(" ").replace(/[.,;:!?-]*$/, "") + "…"
}

function stripEmojis(s: string) {
  try {
    return (s || "").replace(/[\p{Extended_Pictographic}]/gu, "")
  } catch {
    return s || ""
  }
}

// ── Amount helpers ──
function parseAmount(s?: string): number {
  if (!s) return 0
  const clean = String(s).replace(/[^0-9.]/g, "")
  const n = Number(clean || 0)
  return Number.isFinite(n) ? n : 0
}
function toAmountString(n: number): string {
  return Math.round(n).toLocaleString("en-US")
}

// ──────────────────────────────────────────────────────────────
// NEW: Usage of Funds types + validation
// ──────────────────────────────────────────────────────────────
type UsageOfFundsRow = {
  department: string
  allocationPercent: number // must sum to 100
  amount: string            // digits/commas only; UI can prefix ₹
  howUsed: string
}

function validateUsageOfFunds(rows: UsageOfFundsRow[]) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { ok: false, error: "usage_of_funds_missing_or_empty", total: 0 }
  }
  const total = rows.reduce((a, r) => a + (Number(r?.allocationPercent) || 0), 0)
  if (Math.round(total) !== 100) {
    return { ok: false, error: "usage_of_funds_percent_total_must_equal_100", total }
  }
  return { ok: true, total }
}

// Balance targets
const BALANCE_TARGETS: Record<string, { min: number; max: number }> = {
  // Company Overview (trimmed to 4 fields)
  "companyOverview.visionStatement": { min: 50, max: 80 },
  "companyOverview.missionStatement": { min: 50, max: 80 },
  "companyOverview.foundingTeam": { min: 50, max: 80 },
  "companyOverview.legalStructureOwnership": { min: 45, max: 75 },

  // Products
  "products.overview": { min: 60, max: 90 },
  "products.uniqueSellingPropositions": { min: 50, max: 80 },
  "products.developmentRoadmap": { min: 50, max: 80 },
  "products.intellectualPropertyRegulatoryStatus": { min: 45, max: 75 },

  // Market Analysis
  "marketAnalysis.industryOverviewSize": { min: 60, max: 90 },
  "marketAnalysis.growthTrendsDrivers": { min: 60, max: 90 },
  "marketAnalysis.underlyingBusinessDrivers": { min: 55, max: 85 },
  "marketAnalysis.targetMarketSegmentation": { min: 55, max: 85 },
  "marketAnalysis.customerPersonasNeeds": { min: 55, max: 85 },
  "marketAnalysis.competitiveLandscapePositioning": { min: 55, max: 85 },
  "marketAnalysis.productsDifferentiation": { min: 50, max: 80 },
  "marketAnalysis.barriersToEntry": { min: 50, max: 80 },

  // Marketing & Sales
  "marketingSalesStrategies.distributionChannels": { min: 60, max: 90 },
  "marketingSalesStrategies.retentionStrategies": { min: 60, max: 90 },
  "marketingSalesStrategies.technologyCostStructure": { min: 50, max: 80 },
  "marketingSalesStrategies.customerPricingStructure": { min: 50, max: 80 },
  "marketingSalesStrategies.integratedFunnelFinancialImpact": { min: 55, max: 85 },

  // Operations Plan
  "operationsPlan.overview": { min: 55, max: 85 },
  "operationsPlan.organizationalStructureTeamResponsibilities": { min: 55, max: 85 },
  "operationsPlan.infrastructure": { min: 55, max: 85 },
  "operationsPlan.customerOnboardingToRenewalWorkflow": { min: 55, max: 85 },
  "operationsPlan.crossFunctionalCommunicationDecisionMaking": { min: 55, max: 85 },
  "operationsPlan.keyPerformanceMetricsGoals": { min: 55, max: 85 },

  // Management & Organization
  "managementOrganization.overview": { min: 50, max: 80 },
  "managementOrganization.organizationalChart": { min: 50, max: 80 },
  "managementOrganization.hiringPlanKeyRoles": { min: 50, max: 80 },

  // Financial Plan
  "financialPlan.overview": { min: 55, max: 85 },
  "financialPlan.keyAssumptions": { min: 55, max: 85 },
  "financialPlan.keyFinancialMetricsRatios": { min: 55, max: 85 },
  "financialPlan.useOfFundsRunway": { min: 55, max: 85 },
  "financialPlan.keySensitivityRiskScenarios": { min: 60, max: 90 },
  "financialPlan.summaryOutlook": { min: 60, max: 90 },

  // Risk
  "riskAnalysisMitigation.overview": { min: 60, max: 90 },
  "riskAnalysisMitigation.marketRisks": { min: 60, max: 90 },
  "riskAnalysisMitigation.operationalRisks": { min: 60, max: 90 },
  "riskAnalysisMitigation.regulatoryLegalRisks": { min: 60, max: 90 },
  "riskAnalysisMitigation.financialRisks": { min: 60, max: 90 },
  "riskAnalysisMitigation.contingencyPlans": { min: 60, max: 90 },

  // Appendices
  "appendices.glossary": { min: 40, max: 60 },
  "appendices.managementTeamsResources": { min: 40, max: 60 },
  "appendices.projectedFinancesTables": { min: 40, max: 60 },
}
for (let i = 1; i <= 10; i++) {
  BALANCE_TARGETS[`products.product${i}`] = { min: 35, max: 55 }
}

// ── keep exec summary plain; allow markdown for products & some lists ──
const STRUCTURED_MARKDOWN_FIELDS = new Set<string>([
  ...Array.from({ length: 10 }, (_, i) => `products.product${i + 1}`),
  "products.uniqueSellingPropositions",
  "products.developmentRoadmap",
  "products.intellectualPropertyRegulatoryStatus",
  "financialPlan.useOfFundsRunway",
  "appendices.projectedFinancesTables",
])

function structuredMarkdownGuidance(_path: string) {
  return ""
}

// ──────────────────────────────────────────────────────────────
// Retry wrapper
// ──────────────────────────────────────────────────────────────
async function withRetries<T>(fn: () => Promise<T>) {
  let attempt = 0
  const maxRetries = 5
  while (true) {
    try {
      return await fn()
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status
      const code = err?.code
      const headers = err?.headers ?? err?.response?.headers
      const transient =
        status === 429 || (status && status >= 500) ||
        code === "ENOTFOUND" || code === "ECONNRESET" || code === "ETIMEDOUT"
      if (!transient || attempt >= maxRetries) throw err
      const ra = Number(headers?.["retry-after"])
      const base = 800 + attempt * 600
      const jitter = Math.random() * 250
      await new Promise(r => setTimeout(r, Number.isFinite(ra) ? ra * 1000 : base + jitter))
      attempt++
    }
  }
}

// ──────────────────────────────────────────────────────────────
// Expansion / Compression
// ──────────────────────────────────────────────────────────────
async function expandToRange({
  client, model, original, min, max, formData, path, allowMarkdown = false,
}: {
  client: OpenAIClient
  model: string
  original: string
  min: number
  max: number
  formData: any
  path: string
  allowMarkdown?: boolean
}) {
  let text = original.trim()

  for (let i = 0; i < 3 && wc(text) < min; i++) {
    const formattingRule = allowMarkdown
      ? `Use MARKDOWN only where appropriate. No emojis.`
      : `Return PLAIN TEXT (no headings/markdown).`

    const sys = `You expand business-plan prose.
Rules:
- Target ${min}–${max} words.
- Keep meaning; add specifics/examples; avoid fluff.
- ${formattingRule}`
    const usr = `COMPANY CONTEXT:
${JSON.stringify({
  businessName: formData.businessName,
  model: formData.businessModel,
  location: formData.location,
  audience: formData.targetAudience,
  pricing: formData.pricingStrategy,
  channels: formData.marketingChannels,
}, null, 2)}

SECTION (${path}) — CURRENT TEXT:
${text}

TASK: Rewrite to ${min}–${max} words. Return only the text.`
    const res = await withRetries(() =>
      client.chat.completions.create({
        model,
        temperature: 0.3,
        max_tokens: 1100,
        messages: [
          { role: "system", content: sys },
          { role: "user", content: usr },
        ],
      })
    )
    text = stripFences(res.choices?.[0]?.message?.content ?? "").trim()
  }

  if (wc(text) < min) {
    const addSys = allowMarkdown
      ? `Add 1–3 concise sentences to reach at least ${min} words but not exceed ${max}. Keep any existing structure; no emojis.`
      : `Add 1–3 concise sentences to reach at least ${min} words but not exceed ${max}. Plain text only.`
    const addUsr = `SECTION (${path}) — CURRENT TEXT:\n${text}\n\nAdditions (not a rewrite):`
    const add = await withRetries(() =>
      client.chat.completions.create({
        model,
        temperature: 0.4,
        max_tokens: 180,
        messages: [
          { role: "system", content: addSys },
          { role: "user", content: addUsr },
        ],
      })
    )
    text = (text + " " + stripFences(add.choices?.[0]?.message?.content ?? "").trim()).trim()
    if (wc(text) > max) text = takeFirstWords(text, max)
  }

  return text
}

async function compressToMaxStrict({
  client, model, original, max, formData, path, passes = 3, allowMarkdown = false,
}: {
  client: OpenAIClient
  model: string
  original: string
  max: number
  formData: any
  path: string
  passes?: number
  allowMarkdown?: boolean
}) {
  let text = original.trim()
  for (let i = 0; i < passes && wc(text) > max; i++) {
    const formattingRule = allowMarkdown
      ? `Keep any existing structure. No emojis.`
      : `Return PLAIN TEXT (no headings/markdown).`

    const sys = `You condense business-plan prose.
Rules:
- HARD LIMIT: ≤ ${max} words.
- Preserve key facts and structure; keep it cohesive and specific.
- ${formattingRule}`
    const usr = `COMPANY CONTEXT:
${JSON.stringify({
  businessName: formData.businessName,
  model: formData.businessModel,
  location: formData.location,
  audience: formData.targetAudience,
}, null, 2)}

SECTION (${path}) — CURRENT TEXT:
${text}

TASK: Rewrite to ≤ ${max} words. Return only the rewritten text.`
    const res = await withRetries(() =>
      client.chat.completions.create({
        model,
        temperature: 0.2,
        max_tokens: 500,
        messages: [
          { role: "system", content: sys },
          { role: "user", content: usr },
        ],
      })
    )
    text = stripFences(res.choices?.[0]?.message?.content ?? "").trim()
  }
  if (wc(text) > max) text = takeFirstWords(text, max)
  return text
}

async function balancePlanSections({
  client, model, plan, formData, enable = true,
}: {
  client: OpenAIClient
  model: string
  plan: any
  formData: any
  enable?: boolean
}) {
  if (!enable) return
  const LOG = (process.env.BALANCE_LOG ?? "0") === "1"

  for (const [path, { min, max }] of Object.entries(BALANCE_TARGETS)) {
    const cur = String(getByPath(plan, path) ?? "")
    if (!cur.trim()) continue
    const words = wc(cur)
    const allowMarkdown = STRUCTURED_MARKDOWN_FIELDS.has(path)

    try {
      if (words < min) {
        if (LOG) console.log(`[balance] EXPAND ${path}: ${words} → target ${min}-${max}`)
        const expanded = await expandToRange({ client, model, original: cur, min, max, formData, path, allowMarkdown })
        if (expanded && wc(expanded) >= min) setByPath(plan, path, expanded)
      } else if (words > max) {
        if (LOG) console.log(`[balance] COMPRESS ${path}: ${words} → max ${max}`)
        const compressed = await compressToMaxStrict({ client, model, original: cur, max, formData, path, allowMarkdown })
        if (compressed) setByPath(plan, path, compressed)
      } else {
        if (LOG) console.log(`[balance] OK ${path}: ${words} within ${min}-${max}`)
      }
    } catch (e) {
      if (LOG) console.warn(`balancePlanSections(${path}) skipped:`, e)
    }
  }
}

// ──────────────────────────────────────────────────────────────
// Financial normalizer
// ──────────────────────────────────────────────────────────────
function normalizeFinancials(plan: any, formData: any) {
  const fundingNeededN =
    parseAmount(plan.fundingNeeded) || parseAmount(formData?.fundingNeeded)

  const rawFub = Array.isArray(formData?.fundingUseBreakdown) ? formData.fundingUseBreakdown : []
  const breakdown: Array<{ item: string; amountN: number }> = []
  for (const r of rawFub) {
    const item = stripEmojis((r?.item ?? "").trim())
    const amtN = parseAmount(r?.amount)
    if (item && amtN > 0) breakdown.push({ item, amountN: amtN })
  }

  if (!breakdown.length && Array.isArray(formData?.investmentUtilization)) {
    for (const r of formData.investmentUtilization) {
      const item = stripEmojis((r?.item ?? "").trim())
      const amtN = parseAmount(r?.amount)
      if (item && amtN > 0) breakdown.push({ item, amountN: amtN })
    }
  }

  if (!breakdown.length && fundingNeededN > 0) {
    breakdown.push({ item: "Working capital and contingency", amountN: fundingNeededN })
  }

  if (fundingNeededN > 0 && breakdown.length) {
    let sum = breakdown.reduce((a, b) => a + b.amountN, 0)
    if (sum < fundingNeededN) {
      breakdown.push({
        item: "Working capital and contingency",
        amountN: fundingNeededN - sum,
      })
    } else if (sum > fundingNeededN) {
      const excess = sum - fundingNeededN
      const last = breakdown[breakdown.length - 1]
      last.amountN = Math.max(0, last.amountN - excess)
      if (last.amountN === 0) breakdown.pop()
    }
  }

  const monthlyExpN = parseAmount(formData?.monthlyExpenses)
  if (monthlyExpN > 0 && Array.isArray(plan.financialPlan?.opEx)) {
    for (const row of plan.financialPlan.opEx) {
      if (row && typeof row === "object") {
        row.amount = toAmountString(monthlyExpN)
      }
    }
  }

  const initCashN =
    parseAmount(plan.initialInvestment) || parseAmount(formData?.initialInvestment)
  if (initCashN > 0 && Array.isArray(plan.financialPlan?.cashFlowRunwayAnalysis) && plan.financialPlan.cashFlowRunwayAnalysis[0]) {
    plan.financialPlan.cashFlowRunwayAnalysis[0].beginningCash = toAmountString(initCashN)
  }

  if (fundingNeededN > 0 && breakdown.length) {
    const mdList = breakdown
      .map(b => `- ${stripEmojis(b.item)} — ${toAmountString(b.amountN)}`)
      .join("\n")

    plan.financialPlan.useOfFundsRunway = [
      `Planned use of funds totals ${toAmountString(fundingNeededN)} and is allocated to:`,
      mdList,
    ].join("\n")
  }
}

// ──────────────────────────────────────────────────────────────
function includeIfMissing(haystack: string, needle: string) {
  const h = (haystack || "").trim()
  if (!needle || h.includes(needle)) return h
  const sep = h.endsWith(".") ? " " : (h ? ". " : "")
  return (h + sep + needle).trim()
}

function enforceInclusions(plan: any, formData: any) {
  const opLoc = (formData as any)?.operationLocation?.trim?.()
  if (opLoc) {
    const sentence = `Operations are based in ${opLoc}.`
    plan.operationsPlan.overview =
      includeIfMissing(plan.operationsPlan.overview, sentence)
  }

  const founderRole = (formData?.founderRole || "").trim()
  if (founderRole) {
    const sentence = `Founder's role: ${founderRole}.`
    plan.companyOverview.foundingTeam =
      includeIfMissing(plan.companyOverview.foundingTeam, sentence)
  }

   // 1) Team size → Management & Organization → overview
  const teamSize = (formData?.teamSize || "").trim()
  if (teamSize) {
    const sentence = `Current team size: ${teamSize}.`
    plan.managementOrganization.overview =
      includeIfMissing(plan.managementOrganization.overview, sentence)
  }

  // 2) Funding received → Executive Summary → Funding (P1) AND Financial Plan → overview
  const fundingReceived = (formData?.fundingReceived || "").trim()
  if (fundingReceived) {
    const sentence = `Funding received: ${fundingReceived}.`
    if (plan?.executiveSummary?.funding) {
      plan.executiveSummary.funding.p1 =
        includeIfMissing(plan.executiveSummary.funding.p1, sentence)
    }
    plan.financialPlan.overview =
      includeIfMissing(plan.financialPlan.overview, sentence)
  }

  // 3) Investment utilization → Financial Plan → overview (one clean sentence)
  const iu = Array.isArray(formData?.investmentUtilization)
    ? formData.investmentUtilization.filter(r => (r?.item || r?.amount))
    : []
  if (iu.length) {
    const sumText = iu
      .map((r: { item?: string; amount?: string }) =>
        `${String(r.item || "").trim()} ${
          String(r.amount || "").trim().replace(/[^0-9,.-]/g, "")
        }`
      )
      .join("; ")
    const sentence = `Initial investment utilization: ${sumText}.`
    plan.financialPlan.overview =
      includeIfMissing(plan.financialPlan.overview, sentence)
  }

  // 4) Notes → Appendices → Management Teams’ Resources (last sentence style)
  const notes = (formData?.notes || "").trim()
  if (notes) {
    const sentence = `Note: ${notes}.`
    plan.appendices.managementTeamsResources =
      includeIfMissing(plan.appendices.managementTeamsResources, sentence)
  }

  const uspRoot = (formData as any)?.uniqueSellingPoint?.trim?.() || ""
  const keyFeatures = Array.isArray((formData as any)?.keyFeatures)
    ? (formData as any).keyFeatures.map((x: string) => String(x || "").trim()).filter(Boolean)
    : []

  if (uspRoot || keyFeatures.length) {
    let uspText = String(plan.products.uniqueSellingPropositions || "")
    if (uspRoot) {
      uspText = includeIfMissing(uspText, `Unique selling point: ${uspRoot}.`)
    }
    if (keyFeatures.length) {
      const featuresSentence = `Key features: ${keyFeatures.join(", ")}.`
      uspText = includeIfMissing(uspText, featuresSentence)
    }
    plan.products.uniqueSellingPropositions = uspText
  }


}

// ──────────────────────────────────────────────────────────────
// Schema (robust defaults + tolerant products)
// ──────────────────────────────────────────────────────────────

// Loose string: coerce anything to string, default "".
const S = () =>
  z.preprocess(
    (v) => {
      if (v === undefined || v === null) return ""
      if (typeof v === "string") return v
      if (typeof v === "number" || typeof v === "boolean") return String(v)
      try { return JSON.stringify(v) } catch { return String(v) }
    },
    z.string()
  ).default("")

// Accept string/object/array for product entries; we coerce later.
const productEntrySchema = z.union([
  z.string(),
  z.object({}).passthrough(),
  z.array(z.any()),
])

const usageRowSchema = z.object({
  department: S(),
  allocationPercent: z.number(),
  amount: S(),
  howUsed: S(),
})

const businessPlanSchema = z.object({
  coverPage: z.object({
    logo: S(),
  }).default({}),

  executiveSummary: z.object({
    businessOverview: S(),
    ourMission: S(),
    funding: z.object({
      p1: S(),
      usageOfFunds: z.array(usageRowSchema), // keep strict; we validate after
      p2: S(),
    }).default({}),
    problemStatement: S(),
    solution: S(),
  }).default({}),

  companyOverview: z.object({
    visionStatement: S(),
    missionStatement: S(),
    legalStructureOwnership: S(),
    foundingTeam: S(),
  }).default({}),

  products: z.object({
    overview: S(),
    product1: productEntrySchema,
    product2: productEntrySchema,
    product3: productEntrySchema,
    product4: productEntrySchema,
    product5: productEntrySchema,
    product6: productEntrySchema,
    product7: productEntrySchema,
    product8: productEntrySchema,
    product9: productEntrySchema,
    product10: productEntrySchema,
    uniqueSellingPropositions: S(),
    developmentRoadmap: S(),
    intellectualPropertyRegulatoryStatus: S(),
  }).default({}),

  marketAnalysis: z.object({
    industryOverviewSize: S(),
    growthTrendsDrivers: S(),
    underlyingBusinessDrivers: S(),
    targetMarketSegmentation: S(),
    customerPersonasNeeds: S(),
    competitiveLandscapePositioning: S(),
    productsDifferentiation: S(),
    barriersToEntry: S(),
  }).default({}),

  marketingSalesStrategies: z.object({
    distributionChannels: S(),
    technologyCostStructure: S(),
    customerPricingStructure: S(),
    retentionStrategies: S(),
    integratedFunnelFinancialImpact: S(),
  }).default({}),

  operationsPlan: z.object({
    overview: S(),
    organizationalStructureTeamResponsibilities: S(),
    infrastructure: S(),
    customerOnboardingToRenewalWorkflow: S(),
    crossFunctionalCommunicationDecisionMaking: S(),
    keyPerformanceMetricsGoals: S(),
  }).default({}),

  managementOrganization: z.object({
    overview: S(),
    organizationalChart: S(),
    hiringPlanKeyRoles: S(),
  }).default({}),

  financialPlan: z.object({
    overview: S(),
    keyAssumptions: S(),
    revenueForecast: z.array(z.object({ period: S(), amount: S() })).default([]),
    cogs: z.array(z.object({ period: S(), amount: S() })).default([]),
    opEx: z.array(z.object({ period: S(), amount: S() })).default([]),
    projectedPnl: z.array(
      z.object({ period: S(), grossProfit: S(), ebitda: S(), netIncome: S() })
    ).default([]),
    cashFlowRunwayAnalysis: z.array(z.object({
      period: S(),
      beginningCash: S(),
      inflows: S(),
      outflows: S(),
      endingCash: S(),
      runwayMonths: S(),
    })).default([]),
    keyFinancialMetricsRatios: S(),
    useOfFundsRunway: S(),
    keySensitivityRiskScenarios: S(),
    summaryOutlook: S(),
  }).default({}),

  riskAnalysisMitigation: z.object({
    overview: S(),
    marketRisks: S(),
    operationalRisks: S(),
    regulatoryLegalRisks: S(),
    financialRisks: S(),
    contingencyPlans: S(),
  }).default({}),

  appendices: z.object({
    glossary: S(),
    managementTeamsResources: S(),
    projectedFinancesTables: S(),
  }).default({}),

  // Root-level fields
  initialInvestment: S(),
  fundingNeeded: S(),
  fundingReceived: S(),
  monthlyRevenue: S(),
  investmentUtilization: z.array(z.object({ item: S(), amount: S() })).default([]),

  // Root extras
  notes: S(),
  upcomingMilestone: S(),
})

export type GenerateBusinessPlanResult =
  | { success: true; plan: GeneratedPlan; planId: string }
  | { success: false; error: string }

// ──────────────────────────────────────────────────────────────
// Coercion helpers (products)
// ──────────────────────────────────────────────────────────────
function coerceProductToString(x: any): string {
  if (typeof x === "string") return x.trim()
  if (Array.isArray(x)) {
    const lines = x
      .map((v) => (typeof v === "string" ? v.trim() : JSON.stringify(v)))
      .filter(Boolean)
      .slice(0, 4)
      .map((v) => `- ${stripEmojis(v)}`)
    return lines.join("\n")
  }
  if (x && typeof x === "object") {
    if (Array.isArray((x as any).bullets)) {
      const lines = (x as any).bullets
        .map((v: any) => (typeof v === "string" ? v.trim() : JSON.stringify(v)))
        .filter(Boolean)
        .slice(0, 4)
        .map((v: string) => `- ${stripEmojis(v)}`)
      if (lines.length) return lines.join("\n")
    }
    const entries = Object.entries(x as Record<string, any>)
      .filter(([_, v]) => v != null && String(v).trim() !== "")
      .slice(0, 4)
      .map(([k, v]) => {
        const val = Array.isArray(v) ? v.join(", ") : String(v)
        return `- ${stripEmojis(`${k}: ${val}`)}`
      })
    if (entries.length) return entries.join("\n")
  }
  return String(x ?? "").trim()
}

// ──────────────────────────────────────────────────────────────
// Main action
// ──────────────────────────────────────────────────────────────
export async function generateBusinessPlan(
  formData: BusinessPlanData
): Promise<GenerateBusinessPlanResult> {
  try {
    const cookiesStore = await cookies()
    const supabase = createServerComponentClient({ cookies: () => cookiesStore })

    const selectedChannels = Array.isArray(formData.marketingChannels)
      ? formData.marketingChannels.filter(Boolean)
      : []
    const pricingHint = (formData.pricingStrategy || "").trim()
    const salesTeamHint = formData.hasSalesTeam ? "Yes" : "No"

    const marketingUserHints = `
    USER HINTS FOR MARKETING & SALES (weave into one subsection only):
    • Selected marketing channels: ${selectedChannels.length ? selectedChannels.join(", ") : "not specified"}
    ${pricingHint ? `• Pricing: ${pricingHint}` : "" }
    • Sales team: ${salesTeamHint}
    IMPORTANT: Incorporate the hints above naturally into the **Distribution Channels** subsection (its first paragraph). Do not create extra subsections or separate bullet groups for these hints.
    `

    const achievements = (formData.achievements ?? []).map(a => a?.trim()).filter(Boolean)
    const achievementsWeaveHint = achievements.length
      ? `USER HINTS FOR EXECUTIVE SUMMARY → Business Overview:
• If relevant, mention these achievements neutrally in the narrative (no bullets, no subheads): ${achievements.join(", ")}.`
      : ""

    const financeFacts = (() => {
      const lines: string[] = []
      const fd: any = formData as any

      if (fd.initialInvestment) lines.push(`- Initial investment: ${fd.initialInvestment}`)
      if (fd.fundingReceived)   lines.push(`- Funding received: ${fd.fundingReceived}`)
      if (fd.fundingNeeded)     lines.push(`- Funding needed: ${fd.fundingNeeded}`)
      if (fd.monthlyRevenue)    lines.push(`- Monthly revenue: ${fd.monthlyRevenue}`)
      if (fd.monthlyExpenses)   lines.push(`- Monthly expenses: ${fd.monthlyExpenses}`)

      const iu = Array.isArray(fd.investmentUtilization) ? fd.investmentUtilization : []
      if (iu.length) {
        lines.push(`- Investment utilization:`)
        for (const r of iu) {
          if (r?.item || r?.amount) lines.push(`  - ${r?.item ?? ""}: ${r?.amount ?? ""}`)
        }
      }

      const fub = Array.isArray(fd.fundingUseBreakdown) ? fd.fundingUseBreakdown : []
      if (fub.length) {
        lines.push(`- Use of funds (user-specified):`)
        for (const r of fub) {
          if (r?.item || r?.amount) lines.push(`  - ${r?.item ?? ""}: ${r?.amount ?? ""}`)
        }
      }

      if (!lines.length) return ""

      return `
FINANCE FACTS (use these exact numbers):
${lines.join("\n")}

STRICT INSTRUCTIONS (enforce consistency):
- "Executive Summary → Funding Requirements" MUST include:
  P1 paragraph (4 sentences), "Usage of Funds" table with rows { Department | Allocation % | Amount | How it will be used } that sum to 100%, and P2 paragraph (4–6 sentences). No bullets.
- "Financial Plan → Use of Funds & Runway" should mirror the same totals in list form.
- If user line items total < fundingNeeded, add a remainder bucket "Working capital and contingency" to reach the total; if they exceed, reduce the last item.
- Currency strings must be digits/commas only (no symbols); UI may add symbols.
- Align "Financial Plan → OpEx" with Monthly expenses when provided.`
    })()

    const milestoneHint = (formData as any).upcomingMilestone?.trim()
      ? `MISSION HINT:
Append this exact sentence to **Company Overview → Mission Statement** (verbatim):
"Upcoming milestone: ${(formData as any).upcomingMilestone}".`
      : ""

    const notesHint = (formData as any).notes?.trim()
      ? `APPENDICES HINT:
Append this note verbatim as the LAST sentence of **Appendices → Management Teams’ Resources**:
"${(formData as any).notes}".`
      : ""

    const systemPrompt = `You are an expert business-plan writer who produces polished, investor-ready documents.

TASK: Generate a JSON object that matches exactly this shape (no extra keys or markdown in keys not stated as markdown-capable):
{
  "initialInvestment": string,
  "fundingNeeded": string,
  "fundingReceived": string,
  "monthlyRevenue": string,
  "investmentUtilization": [ { "item": string, "amount": string } ],

  "notes": string,
  "upcomingMilestone": string,

  "coverPage": { "logo": string },
  "executiveSummary": {
    "businessOverview": string,
    "ourMission": string,
    "funding": {
      "p1": string,
      "usageOfFunds": [ { "department": string, "allocationPercent": number, "amount": string, "howUsed": string } ],
      "p2": string
    },
    "problemStatement": string,
    "solution": string
  },
  "companyOverview": {
    "visionStatement": string,
    "missionStatement": string,
    "legalStructureOwnership": string,
    "foundingTeam": string
  },
  "products": {
    "overview": string,
    "product1": string, "product2": string, "product3": string, "product4": string, "product5": string,
    "product6": string, "product7": string, "product8": string, "product9": string, "product10": string,
    "uniqueSellingPropositions": string,
    "developmentRoadmap": string,
    "intellectualPropertyRegulatoryStatus": string
  },
  "marketAnalysis": {
    "industryOverviewSize": string,
    "growthTrendsDrivers": string,
    "underlyingBusinessDrivers": string,
    "targetMarketSegmentation": string,
    "customerPersonasNeeds": string,
    "competitiveLandscapePositioning": string,
    "productsDifferentiation": string,
    "barriersToEntry": string
  },
  "marketingSalesStrategies": {
    "distributionChannels": string,
    "technologyCostStructure": string,
    "customerPricingStructure": string,
    "retentionStrategies": string,
    "integratedFunnelFinancialImpact": string
  },
  "operationsPlan": {
    "overview": string,
    "organizationalStructureTeamResponsibilities": string,
    "infrastructure": string,
    "customerOnboardingToRenewalWorkflow": string,
    "crossFunctionalCommunicationDecisionMaking": string,
    "keyPerformanceMetricsGoals": string
  },
  "managementOrganization": {
    "overview": string,
    "organizationalChart": string,
    "hiringPlanKeyRoles": string
  },
  "financialPlan": {
    "overview": string,
    "keyAssumptions": string,
    "revenueForecast": [ { "period": string, "amount": string } ],
    "cogs": [ { "period": string, "amount": string } ],
    "opEx": [ { "period": string, "amount": string } ],
    "projectedPnl": [ { "period": string, "grossProfit": string, "ebitda": string, "netIncome": string } ],
    "cashFlowRunwayAnalysis": [ { "period": string, "beginningCash": string, "inflows": string, "outflows": string, "endingCash": string, "runwayMonths": string } ],
    "keyFinancialMetricsRatios": string,
    "useOfFundsRunway": string,
    "keySensitivityRiskScenarios": string,
    "summaryOutlook": string
  },
  "riskAnalysisMitigation": {
    "overview": string,
    "marketRisks": string,
    "operationalRisks": string,
    "regulatoryLegalRisks": string,
    "financialRisks": string,
    "contingencyPlans": string
  },
  "appendices": {
    "glossary": string,
    "managementTeamsResources": string,
    "projectedFinancesTables": string
  }
}

RULES:
1) Return STRICT JSON only (no markdown, no comments).
2) Populate each string field at ~50–80 words (tight, specific; no fluff). Never leave any field blank.
3) Executive Summary (STRICT):
   - Business Overview: exactly 2 paragraphs, 8 sentences each. No bullet lists. No markdown.
   - Our Mission: exactly 1 paragraph, 2 sentences. No bullets. No markdown.
   - Funding Requirements:
     • P1: 4 sentences (ask + purpose). No bullets. No markdown.
     • Table "Usage of Funds": rows with Department | Allocation % | Amount | How it will be used. Allocation % MUST sum to 100 exactly.
     • P2: 4–6 sentences (growth narrative). No bullets. No markdown.
   - Problem Statement: 1 paragraph, 8 sentences. No bullets. No markdown.
   - Solution: 1 paragraph, 8 sentences. No bullets. No markdown.
   - NEVER render “Key Highlights” or “Past Milestones” anywhere.
   - If inputs are thin, expand neutrally (no fabricated metrics).
4) Products:
   - "overview": ~60–90 words.
   - For each product (product1..product10): ~35–55 words total with 3–4 markdown bullets covering:
     • Core features • Integrations • Target users/industries • Primary use case OR quantified benefit
5) Currency/amount strings must be digits/commas only (no symbols). UI may add currency symbols.
6) No emojis anywhere.`

    const userPrompt = `Generate a comprehensive business plan using this form input.

Make sure you populate the Executive Summary with the STRICT format above (no bullets/markdown in Exec Summary).
${marketingUserHints}
${achievementsWeaveHint}
${financeFacts}
${mileageHintPlaceholder() /* keeps TS happy if removed later */}${milestoneHint}
${notesHint}

FORM DATA:
${JSON.stringify(formData, null, 2)}

Be sure to include the full 'products' section with overview, ten product entries, USPs, development roadmap, and IP/regulatory status.`

    const MODEL = (process.env.OPENAI_MODEL ?? "gpt-4o-mini").trim()
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 120_000 })

    let completion: Awaited<ReturnType<typeof client.chat.completions.create>>
    const maxRetries = 5
    let attempt = 0
    while (true) {
      try {
        completion = await client.chat.completions.create({
          model: MODEL,
          response_format: { type: "json_object" },
          temperature: 0.2,
          max_tokens: 4500,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        })
        break
      } catch (err: any) {
        const status = err?.status ?? err?.response?.status
        const code = err?.code
        const headers = err?.headers ?? err?.response?.headers ?? {}
        const transient =
          status === 429 || (status && status >= 500) ||
          code === "ENOTFOUND" || code === "ECONNRESET" || code === "ETIMEDOUT"

        if (transient && attempt < maxRetries) {
          const ra = Number(headers["retry-after"])
          const base = Math.pow(2, attempt) * 1000
          const jitter = Math.random() * base * 0.2
          const delayMs = Number.isFinite(ra) ? ra * 1000 : base + jitter
          console.warn(`Retrying after ${Math.round(delayMs)}ms (attempt ${attempt + 1}/${maxRetries})`, {
            status,
            code,
            retryAfter: ra,
            remainReq: headers["x-ratelimit-remaining-requests"],
            remainTok: headers["x-ratelimit-remaining-tokens"],
          })
          await new Promise(r => setTimeout(r, delayMs))
          attempt++
          continue
        }
        throw err
      }
    }

    // Parse JSON
    let raw = completion.choices?.[0]?.message?.content!
    if (!raw) throw new Error("OpenAI returned no content")
    raw = stripFences(raw)
    {
      const start = raw.indexOf("{")
      const end = raw.lastIndexOf("}")
      if (start !== -1 && end !== -1 && end > start) raw = raw.slice(start, end + 1)
    }

    let parsed: any
    try {
      parsed = JSON.parse(raw)
    } catch (firstErr) {
      const start = raw.indexOf("{")
      const end = raw.lastIndexOf("}")
      if (start === -1 || end === -1) throw firstErr
      parsed = JSON.parse(raw.slice(start, end + 1))
    }

    // Validate (robust defaults prevent "missing/undefined" crashes)
    const planObject = businessPlanSchema.parse(parsed) as any

    // Coerce products.product1..product10 to strings (markdown bullets if needed)
    for (let i = 1; i <= 10; i++) {
      const key = `product${i}`
      planObject.products[key] = coerceProductToString(planObject.products[key])
    }

    // Ensure finance fields exist even if model skipped them
    planObject.initialInvestment ||= (formData as any).initialInvestment ?? ""
    planObject.fundingNeeded     ||= (formData as any).fundingNeeded ?? ""
    planObject.fundingReceived   ||= (formData as any).fundingReceived ?? ""
    planObject.monthlyRevenue    ||= (formData as any).monthlyRevenue ?? ""
    if (!Array.isArray(planObject.investmentUtilization)) {
      planObject.investmentUtilization = Array.isArray((formData as any).investmentUtilization)
        ? (formData as any).investmentUtilization
        : []
    }

    // Persist notes + upcomingMilestone from formData
    planObject.notes ||= (formData as any).notes ?? ""
    planObject.upcomingMilestone ||= (formData as any).upcomingMilestone ?? ""

    // Safety net: never leave Appendices blank
    planObject.appendices.glossary = ensure(
      planObject.appendices.glossary,
      "Glossary: concise definitions of key terms used throughout the plan, including core product, market, financial, and operational terminology."
    )
    planObject.appendices.managementTeamsResources = ensure(
      planObject.appendices.managementTeamsResources,
      "Summary of management team resources: leadership bios, advisory support, hiring roadmap, and external specialist partnerships."
    )
    planObject.appendices.projectedFinancesTables = ensure(
      planObject.appendices.projectedFinancesTables,
      "Projected finances overview: revenue, COGS, OpEx, EBITDA and cash-flow summaries for the next 12–24 months."
    )

    // Logo guard
    if (!planObject.coverPage.logo || !/^https?:\/\//i.test(planObject.coverPage.logo)) {
      planObject.coverPage.logo = "/logo-placeholder.png"
    }

    // Normalize financials to enforce totals & alignment (before balancing)
    normalizeFinancials(planObject, formData)

    // 🚦 Validate Usage of Funds % total = 100 (hard requirement)
    const ufRows: UsageOfFundsRow[] = planObject?.executiveSummary?.funding?.usageOfFunds || []
    const v = validateUsageOfFunds(ufRows)
    if (!v.ok) {
      return { success: false, error: `Funding table invalid: ${v.error} (total=${v.total}%)` }
    }

    // Pick model for balancing (Exec Summary excluded to keep sentence counts)
    const BALANCE = (process.env.BALANCE_SECTIONS ?? "1") === "1"
    let BALANCER_MODEL = ((process.env.OPENAI_HEAVY_MODEL ?? "").trim()) || MODEL
    if (BALANCER_MODEL !== MODEL) {
      try {
        await client.chat.completions.create({
          model: BALANCER_MODEL,
          messages: [{ role: "user", content: "ping" }],
          max_tokens: 1,
          temperature: 0,
        })
      } catch {
        console.warn(`Heavy model '${BALANCER_MODEL}' unavailable; falling back to '${MODEL}' for balancing.`)
        BALANCER_MODEL = MODEL
      }
    }

    await balancePlanSections({
      client,
      model: BALANCER_MODEL,
      plan: planObject,
      formData,
      enable: BALANCE,
    })

    // Required insertions AFTER balancing
    enforceInclusions(planObject, formData)

    // Auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return { success: false, error: "Not authenticated" }

    // Upsert user
    const { error: upsertUserErr } = await supabase
      .from("users")
      .upsert(
        { id: user.id, email: user.email, full_name: (user.user_metadata as any)?.full_name },
        { onConflict: "email" }
      )
    if (upsertUserErr) return { success: false, error: upsertUserErr.message }

    const planName = (formData.businessName ?? "").trim()

    // Insert or update the plan
    const { data: existing } = await supabase
      .from("business_plans")
      .select("id")
      .eq("user_id", user.id)
      .eq("plan_name", planName)
      .maybeSingle()

    let planId = existing?.id as string | undefined

    if (planId) {
      const { error: updateErr } = await supabase
        .from("business_plans")
        .update({ plan_data: planObject, updated_at: new Date().toISOString() })
        .eq("id", planId)
      if (updateErr) return { success: false, error: updateErr.message }
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from("business_plans")
        .insert({ user_id: user.id, plan_name: planName, plan_data: planObject })
        .select("id")
        .single()
      if (insertErr || !inserted?.id) {
        return { success: false, error: insertErr?.message ?? "Insert failed" }
      }
      planId = inserted.id
    }

    // Link any unmatched payment
    const { data: latestPayment } = await supabase
      .from("payments")
      .select("id")
      .eq("user_id", user.id)
      .is("plan_id", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (latestPayment?.id) {
      await supabase.from("payments").update({ plan_id: planId }).eq("id", latestPayment.id)
    }

    return { success: true, plan: planObject as GeneratedPlan, planId: planId! }
  } catch (err: any) {
    console.error("Error generating business plan:", err)
    return { success: false, error: err?.message ?? "Unknown error" }
  }
}

// Helper to keep TS happy if we strip out the milestoneHint interpolation
function mileageHintPlaceholder() { return "" }
