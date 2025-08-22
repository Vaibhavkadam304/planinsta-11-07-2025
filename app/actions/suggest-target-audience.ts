// app/actions/suggest-target-audience.ts
"use server"

import OpenAI from "openai"
import type { BusinessPlanData } from "@/components/plan-builder/PlanBuilderClient"

const client = new OpenAI()

export async function suggestAudience(data: Partial<BusinessPlanData>, count = 6) {
  // Pull the most useful signals to guess audience
  const oneLiner = data.description ?? ""
  const model = data.businessModel ?? ""
  const stage = data.businessStage ?? ""
  const location = data.location ?? ""
  const products = (data.products || []).map(p => p?.name).filter(Boolean).join(", ")
  const channels = (data.marketingChannels || []).join(", ")
  const price = data.customerPricingStructure ?? ""
  const industry = data.industryOverviewSize ?? ""

  // Lightweight heuristics (good defaults without burning tokens)
  const suggestions: string[] = []

  const isSaaS = /saas|subscription/i.test(model)
  const isSMB = /small|smb|sme/i.test(oneLiner) || /smb|sme/i.test(industry)
  const isConsumer = /consumer|b2c|d2c/i.test(model)
  const isB2B = /b2b|enterprise|business/i.test(model) || isSaaS

  // Seed by model
  if (isSaaS || isB2B) {
    suggestions.push(
      "Owners and operations managers at small–mid sized businesses",
      "Heads of Finance/HR at growing SMBs (10–200 employees)",
      "Founders and GTM leads at early-stage startups"
    )
  }
  if (isConsumer || /retail|d2c/i.test(model)) {
    suggestions.push(
      "Urban millennials shopping online for value and convenience",
      "Young families in Tier-1 & Tier-2 cities discovering brands on social",
      "College students seeking affordable, trendy options"
    )
  }
  if (/marketplace|logistics|fintech/i.test(model+oneLiner+industry)) {
    suggestions.push(
      "Small merchants and resellers seeking reliable supply & payouts",
      "Independent retailers needing credit, payments and inventory tools"
    )
  }

  // Location hint
  if (location) {
    suggestions.unshift(
      `Customers in ${location} with smartphone-first behavior`,
      `SMBs in ${location} adopting digital tools to grow`
    )
  }

  // Product/price hints
  if (products) suggestions.push(`Early adopters interested in: ${products}`)
  if (price) suggestions.push(`Price-sensitive users comparing ${price}`)

  // Deduplicate + trim + cap
  const unique = Array.from(new Set(suggestions.map(s => s.trim()))).filter(Boolean)
  if (unique.length >= count) return unique.slice(0, count)

  // If still thin, ask the model briefly for a few crisp personas
  const prompt = `Business one-liner: ${oneLiner}
Model: ${model} | Stage: ${stage} | Location: ${location}
Products: ${products}
Channels: ${channels}

Give ${count} concise target audience lines. Each line is a clear, specific segment (no sentences).`
  try {
    const res = await client.chat.completions.create({
      model: "gpt-4o-mini", // small + fast works fine here
      messages: [
        { role: "system", content: "Return a bullet list; each bullet a compact audience segment (<=16 words)." },
        { role: "user", content: prompt }
      ],
      temperature: 0.4,
    })
    const text = res.choices[0]?.message?.content ?? ""
    const extra = text.split(/\r?\n/).map(s => s.replace(/^[-*•]\s*/, "").trim()).filter(Boolean)
    return Array.from(new Set([...unique, ...extra])).slice(0, count)
  } catch {
    return unique.slice(0, count)
  }
}
