"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import nodemailer from "nodemailer"
// import { openai } from "@ai-sdk/openai"
// import { generateObject } from "ai"
import { Configuration, OpenAIApi } from "openai"
import { z } from "zod"
import type { BusinessPlanData, GeneratedPlan } from "@/app/plan-builder/PlanBuilderClient"
// …above your generateBusinessPlan function…
function stripFences(text: string): string {
  let t = text.trim()
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\r?\n/, "")
  }
  if (t.endsWith("```")) {
    t = t.replace(/\r?\n```$/, "")
  }
  return t.trim()
}


export type GenerateBusinessPlanResult =
  | { success: true; plan: GeneratedPlan; planId: string }
  | { success: false; error: string }

const businessPlanSchema = z.object({
  coverPage: z.object({
    logo: z.string(),
  }),
  executiveSummary: z.object({
    businessOverview: z.string(),
    fundingRequirementsUsageOfFunds: z.string(),
    pastMilestones: z.string(),
    problemStatementSolution: z.string(),
  }),
  companyOverview: z.object({
    visionStatement: z.string(),
    missionStatement: z.string(),
    companyHistoryBackground: z.string(),
    foundingTeam: z.string(),
    legalStructureOwnership: z.string(),
    coreValuesCulture: z.string(),
    companyObjectives: z.string(),
  }),
  products: z.object({
    overview: z.string(),
    product1: z.string(),
    product2: z.string(),
    product3: z.string(),
    product4: z.string(),
    product5: z.string(),
    product6: z.string(),
    product7: z.string(),
    product8: z.string(),
    product9: z.string(),
    product10: z.string(),
    uniqueSellingPropositions: z.string(),
    developmentRoadmap: z.string(),
    intellectualPropertyRegulatoryStatus: z.string(),
  }),
  marketAnalysis: z.object({
    industryOverviewSize: z.string(),
    growthTrendsDrivers: z.string(),
    underlyingBusinessDrivers: z.string(),
    targetMarketSegmentation: z.string(),
    customerPersonasNeeds: z.string(),
    competitiveLandscapePositioning: z.string(),
    productsDifferentiation: z.string(),
    barriersToEntry: z.string(),
  }),
  marketingSalesStrategies: z.object({
    distributionChannels: z.string(),
    technologyCostStructure: z.string(),
    customerPricingStructure: z.string(),
    retentionStrategies: z.string(),
    integratedFunnelFinancialImpact: z.string(),
  }),
  operationsPlan: z.object({
    overview: z.string(),
    organizationalStructureTeamResponsibilities: z.string(),
    infrastructure: z.string(),
    customerOnboardingToRenewalWorkflow: z.string(),
    crossFunctionalCommunicationDecisionMaking: z.string(),
    keyPerformanceMetricsGoals: z.string(),
  }),
  managementOrganization: z.object({
    overview: z.string(),
    organizationalChart: z.string(),
    hiringPlanKeyRoles: z.string(),
  }),
  financialPlan: z.object({
    overview: z.string(),
    keyAssumptions: z.string(),

    revenueForecast: z.array(z.object({
      period: z.string(),
      amount: z.string(),
    })),
    cogs: z.array(z.object({
      period: z.string(),
      amount: z.string(),
    })),
    opEx: z.array(z.object({
      period: z.string(),
      amount: z.string(),
    })),
    projectedPnl: z.array(z.object({
      period: z.string(),
      grossProfit: z.string(),
      ebitda: z.string(),
      netIncome: z.string(),
    })),
    cashFlowRunwayAnalysis: z.array(z.object({
      period: z.string(),
      beginningCash: z.string(),
      inflows: z.string(),
      outflows: z.string(),
      endingCash: z.string(),
      runwayMonths: z.string(),
    })),

    keyFinancialMetricsRatios: z.string(),
    useOfFundsRunway: z.string(),
    keySensitivityRiskScenarios: z.string(),
    summaryOutlook: z.string(),
  }),
  riskAnalysisMitigation: z.object({
    overview: z.string(),
    marketRisks: z.string(),
    operationalRisks: z.string(),
    regulatoryLegalRisks: z.string(),
    financialRisks: z.string(),
    contingencyPlans: z.string(),
  }),
  appendices: z.object({
    glossary: z.string(),
    managementTeamsResources: z.string(),
    projectedFinancesTables: z.string(),
  }),
})

export async function generateBusinessPlan(
  formData: BusinessPlanData
): Promise<GenerateBusinessPlanResult> {
  try {
    // initialize Supabase client
     const supabase = createServerComponentClient({
        cookies: () => cookies()
      })

    // 1) Generate the plan JSON via OpenAI
    const systemPrompt = `You are an expert business-plan writer who produces polished, investor-ready documents.

    TASK: Generate a JSON object that matches exactly this shape (no extra keys or markdown):
    {
      "coverPage": { "logo": string },
      "executiveSummary": {
        "businessOverview": string,
        "fundingRequirementsUsageOfFunds": string,
        "pastMilestones": string,
        "problemStatementSolution": string
      },
      "companyOverview": {
        "visionStatement": string,
        "missionStatement": string,
        "companyHistoryBackground": string,
        "foundingTeam": string,
        "legalStructureOwnership": string,
        "coreValuesCulture": string,
        "companyObjectives": string
      },
      "products": {
        "overview": string,
        "product1": string,
        "product2": string,
        "product3": string,
        "product4": string,
        "product5": string,
        "product6": string,
        "product7": string,
        "product8": string,
        "product9": string,
        "product10": string,
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
        "projectedPnl": [
          { "period": string, "grossProfit": string, "ebitda": string, "netIncome": string }
        ],
        "cashFlowRunwayAnalysis": [
          { "period": string, "beginningCash": string, "inflows": string, "outflows": string, "endingCash": string, "runwayMonths": string }
        ],
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

    REQUIREMENTS:
    1. Return ONLY the JSON object.
    2. Populate each field with 4–6 well-developed paragraphs of professional, formal business language—include data-driven detail, examples, and clear explanations.
    3. Use only the provided form data; do not invent numbers.
    4. Keep each top-level section roughly 400–600 words for full depth.`

    const userPrompt = `Generate a comprehensive business plan using this form input:\n\n${JSON.stringify(
      formData,
      null,
      2
    )}

Be sure to include the full 'products' section with overview, ten product entries, USPs, development roadmap, and IP/regulatory status.`

   const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const client = new OpenAIApi(config)

// ── call the chat endpoint ──
    // ── retry up to 3 times with jittered back‑off ──
let completion;
const maxRetries = 3;
let attempt = 0;

while (true) {
  try {
    // ← your real OpenAI call with system + user prompts
    completion = await client.createChatCompletion({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt },
      ],
    });
    break; // success! exit the loop
  } catch (err: any) {
    const status = err?.response?.status;
    // if we hit rate‑limit and still have retries left:
    if (status === 429 && attempt < maxRetries) {
      // exponential base: 1s, 2s, 4s…
      const base = Math.pow(2, attempt) * 1000;
      // jitter ±20%
      const jitter = Math.random() * base * 0.2;
      const delayMs = base + (Math.random() < 0.5 ? -jitter : jitter);
      console.warn(`Rate limit, retrying in ${delayMs.toFixed(0)}ms…`);
      await new Promise((r) => setTimeout(r, delayMs));
      attempt++;
      continue; // retry
    }
    // otherwise bubble up the error
    throw err;
  }
}


    // ── grab the raw string and strip any ```json fences ──
    let raw = completion.data.choices?.[0]?.message?.content!
    if (!raw) throw new Error("OpenAI returned no content")
    raw = stripFences(raw)
      if (
      (raw.startsWith('"') && raw.endsWith('"')) ||
      (raw.startsWith("'") && raw.endsWith("'"))
      ) {
        raw = raw.slice(1, -1).trim()
      }


    // ── now safe to parse + validate ──
    const planObject = businessPlanSchema.parse(
      JSON.parse(raw)
    )
    // 2) Authenticate user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user?.id) {
      return { success: false, error: "Not authenticated" }
    }

    // 3) Upsert user record
    const { error: upsertUserErr } = await supabase
      .from("users")
      .upsert(
        {
          id: user.id,
          email: user.email,
          full_name: (user.user_metadata as any)?.full_name,
        },
        { onConflict: "email" }
      )

    if (upsertUserErr) {
      return { success: false, error: upsertUserErr.message }
    }

    const planName = formData.businessName

    // 4) Insert or update the business plan
    const { data: existing } = await supabase
      .from("business_plans")
      .select("id")
      .eq("user_id", user.id)
      .eq("plan_name", planName)
      .maybeSingle()

    let planId = existing?.id
    if (planId) {
      const { error: updateErr } = await supabase
        .from("business_plans")
        .update({ plan_data: planObject, updated_at: new Date().toISOString() })
        .eq("id", planId)
      if (updateErr) {
        return { success: false, error: updateErr.message }
      }
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from("business_plans")
        .insert({
          user_id: user.id,
          plan_name: planName,
          plan_data: planObject,
        })
        .select("id")
        .single()
      if (insertErr || !inserted?.id) {
        return { success: false, error: insertErr?.message ?? "Insert failed" }
      }
      planId = inserted.id
    }

    // 5) Link any unmatched payment
    const { data: latestPayment } = await supabase
      .from("payments")
      .select("id")
      .eq("user_id", user.id)
      .is("plan_id", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (latestPayment?.id) {
      await supabase
        .from("payments")
        .update({ plan_id: planId })
        .eq("id", latestPayment.id)
    }
    try {
      const transporter = nodemailer.createTransport({
        host:   process.env.SMTP_HOST,
        port:   Number(process.env.SMTP_PORT),
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      try {
          await transporter.verify();  
          console.log("✅  SMTP credentials are valid!");
        } catch (err) {
          console.error("❌  SMTP credentials failed:", err);
        }

      const info = await transporter.sendMail({
        from:    process.env.EMAIL_FROM,
        to:      process.env.NOTIFY_EMAIL,
        subject: `🚀 New Business Plan: ${formData.businessName}`,
        text:    `A new plan titled "${formData.businessName}" was just generated.`,
      });
      console.log("✉️ Email sent:", info.messageId);
    } catch (e) {
      console.error("❌ Email failed:", e);
    }
    // ↑↑↑ end email notification ↑↑↑

    return { success: true, plan: planObject as GeneratedPlan, planId: planId! }
  } catch (err: any) {
    console.error("Error generating business plan:", err)
    return { success: false, error: err?.message ?? "Unknown error" }
  }
}
