// app/actions/suggest-swot.ts
"use server"

import OpenAI from "openai"
import type { BusinessPlanData } from "@/components/plan-builder/PlanBuilderClient"

const client = new OpenAI()

export async function suggestSwot({ data }: { data: Partial<BusinessPlanData> }) {
  const fields = [
    `Business: ${data.businessName}`,
    `One-liner: ${data.description}`,
    `Model: ${data.businessModel}`,
    `Stage: ${data.businessStage}`,
    `Target: ${data.targetAudience} @ ${data.location}`,
    `Vision: ${data.visionStatement}`,
    `Products: ${(data.products || []).map(p => p?.name).filter(Boolean).join(", ")}`,
    `Marketing: ${(data.marketingChannels || []).join(", ")}`,
    `Team size: ${data.teamSize}`,
    `Funding need: ${data.fundingNeeded}`,
    `Monthly revenue: ${data.monthlyRevenue} | expenses: ${data.monthlyExpenses}`,
  ].filter(Boolean).join("\n")

  const sys = `You are a concise business analyst. From the user's prior answers, output 1–3 strengths (success drivers) and 1–3 weaknesses. Keep each item short (<= 15 words). Return strict JSON: {"strengths": [], "weaknesses": []}.`
  const user = `Context:\n${fields}`

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user },
    ],
  })

  let parsed = { strengths: [] as string[], weaknesses: [] as string[] }
  try {
    parsed = JSON.parse(res.choices?.[0]?.message?.content || "{}")
  } catch { /* noop */ }

  // Fallbacks if the AI returns nothing
  if (!Array.isArray(parsed.strengths) || parsed.strengths.length === 0) {
    parsed.strengths = ["Strong domain expertise", "Clear product-market focus", "Lean, agile operations"]
  }
  if (!Array.isArray(parsed.weaknesses) || parsed.weaknesses.length === 0) {
    parsed.weaknesses = ["Limited working capital", "Low brand awareness", "Small team capacity"]
  }
  return parsed
}
