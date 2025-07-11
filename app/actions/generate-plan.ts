// import { openai } from "@ai-sdk/openai"
// import { generateObject } from "ai"
// import { z } from "zod"
// import type { BusinessPlanData } from "@/app/plan-builder/page"

// const businessPlanSchema = z.object({
//   executiveSummary: z.string(),
//   marketAnalysis: z.string(),
//   productStrategy: z.string(),
//   marketingStrategy: z.string(),
//   operationsStrategy: z.string(),
//   financialProjections: z.string(),
//   milestonesAndTraction: z.string(),
//   additionalNotes: z.string(),
// })

// export async function generateBusinessPlan(formData: BusinessPlanData) {
//   "use server"

//   try {
//     const systemPrompt = `You are an expert business plan writer with 20+ years of experience helping entrepreneurs create professional, investor-ready business plans.

// TASK: Generate a comprehensive business plan based on the user's form inputs.

// PLAN TYPE: professional (comprehensive business plan)

// REQUIREMENTS:
// 1. Write in professional, formal business language
// 2. Use specific data from user inputs - don't make up numbers
// 3. Structure according to professional standards
// 4. Include realistic projections based on provided data
// 5. Make it investor-ready and actionable
// 6. Use proper business terminology and formatting
// 7. Each section should be 200-400 words
// 8. Focus on the specific business model and industry provided

// LANGUAGE: English

// Generate a comprehensive business plan with the following sections:
// - executiveSummary: Overview of the business and key highlights
// - marketAnalysis: Target market research and competitive landscape  
// - productStrategy: Product positioning and development roadmap
// - marketingStrategy: Customer acquisition and marketing channels
// - operationsStrategy: Business operations and organizational structure
// - financialProjections: Revenue forecasts and financial planning
// - milestonesAndTraction: Key achievements and upcoming goals
// - additionalNotes: Special considerations and extra information

// Use the provided business data to create specific, actionable content for each section.`

//     const userPrompt = `Generate a business plan for the following business:

// BUSINESS DATA:
// ${JSON.stringify(formData, null, 2)}

// Create a professional, comprehensive business plan that addresses all aspects of this business based on the provided information.`

//     const { object } = await generateObject({
//       model: openai("gpt-4o"),
//       schema: businessPlanSchema,
//       system: systemPrompt,
//       prompt: userPrompt,
//     })

//     return { success: true, plan: object }
//   } catch (error) {
//     console.error("Error generating business plan:", error)
//     return { success: false, error: "Failed to generate business plan" }
//   }
// }
// app/actions/generate-plan.ts
"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import type { BusinessPlanData, GeneratedPlan } from "@/app/plan-builder/PlanBuilderClient"

export type GenerateBusinessPlanResult =
  | { success: true; plan: GeneratedPlan }
  | { success: false; error: string }

const businessPlanSchema = z.object({
  executiveSummary:      z.string(),
  marketAnalysis:        z.string(),
  productStrategy:       z.string(),
  marketingStrategy:     z.string(),
  operationsStrategy:    z.string(),
  financialProjections:  z.string(),
  milestonesAndTraction: z.string(),
  additionalNotes:       z.string(),
})

export async function generateBusinessPlan(
  formData: BusinessPlanData
): Promise<GenerateBusinessPlanResult> {
  try {
    // 1️⃣ Initialize Supabase client with auth cookies
    const cookieStore = await cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    console.log("🔷 [Action] formData:", formData)
    console.log("🔷 [Env] OPENAI_API_KEY:", Boolean(process.env.OPENAI_API_KEY))

    // 2️⃣ Generate the plan via OpenAI
    // 2️⃣ Generate the plan via OpenAI
      const systemPrompt = `You are an expert business-plan writer with 20+ years of experience crafting professional, investor-ready plans. 
      Write in formal business language, use the user’s exact data (don’t make up numbers), and produce 200–400 words per section.`

      const userPrompt = `Generate a comprehensive business plan using this form input:

      ${JSON.stringify(formData, null, 2)}`

    const { object: planObject } = await generateObject({
      model:  openai("gpt-4o"),
      schema: businessPlanSchema,
      system: systemPrompt,
      prompt:  userPrompt,
    })

    console.log("🔷 [Action] planObject received:", planObject)

    // 3️⃣ Check Supabase auth
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      console.error("🔷 [Action] Not authenticated – aborting insert")
      return { success: false, error: "Not authenticated" }
    }

    console.log("🔷 [Action] ensuring user exists in public.users:", user.id)

    // 4️⃣ Upsert into your `users` table so FK will always pass
    const { error: upsertError } = await supabase
      .from("users")
      .upsert(
        {
          id:        user.id,
          email:     user.email,
          full_name: (user.user_metadata as any).full_name,
        },
        { onConflict: "id" }
      )

    if (upsertError) {
      console.error("🔷 [Action] Failed to upsert user row:", upsertError)
      return { success: false, error: upsertError.message }
    }

    console.log("🔷 [Action] inserting into business_plans for user:", user.id)

    // 5️⃣ Insert the new business plan
    const { error: insertError } = await supabase
      .from("business_plans")
      .insert({
        user_id:   user.id,
        plan_name: formData.businessName,
        plan_data: planObject,
      })

    if (insertError) {
      console.error("🔷 [Action] insertError:", insertError)
      return { success: false, error: insertError.message }
    }

    console.log("🔷 [Action] generation & persist successful")
    return { success: true, plan: planObject }

  } catch (error: any) {
    console.error("Error generating business plan:", error)
    return { success: false, error: error.message }
  }
}
