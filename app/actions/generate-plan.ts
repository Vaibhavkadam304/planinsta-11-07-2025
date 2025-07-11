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

"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import type { BusinessPlanData, GeneratedPlan } from "@/app/plan-builder/PlanBuilderClient"

// Explicit return type for server-action
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
    // Initialize Supabase client with auth cookies
    const cookieStore = await cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    console.log("🔷 [Action] formData:", formData)

    const systemPrompt = `You are an expert business plan writer with 20+ years of experience helping entrepreneurs create professional, investor-ready business plans.

TASK: Generate a comprehensive business plan based on the user's form inputs.

PLAN TYPE: professional (comprehensive business plan)

REQUIREMENTS:
1. Write in professional, formal business language
2. Use specific data from user inputs - don't make up numbers
3. Structure according to professional standards
4. Include realistic projections based on provided data
5. Make it investor-ready and actionable
6. Use proper business terminology and formatting
7. Each section should be 200-400 words
8. Focus on the specific business model and industry provided

LANGUAGE: English

Generate a comprehensive business plan with the following sections:
- executiveSummary: Overview of the business and key highlights
- marketAnalysis: Target market research and competitive landscape  
- productStrategy: Product positioning and development roadmap
- marketingStrategy: Customer acquisition and marketing channels
- operationsStrategy: Business operations and organizational structure
- financialProjections: Revenue forecasts and financial planning
- milestonesAndTraction: Key achievements and upcoming goals
- additionalNotes: Special considerations and extra information

Use the provided business data to create specific, actionable content for each section.`

    console.log("🔷 [Action] systemPrompt length:", systemPrompt.length)

    const userPrompt = `Generate a business plan for the following business:

BUSINESS DATA:
${JSON.stringify(formData, null, 2)}

Create a professional, comprehensive business plan that addresses all aspects of this business based on the provided information.`

    console.log("🔷 [Action] calling generateObject…")
    const { object: planObject } = await generateObject({
      model:  openai("gpt-4o"),
      schema: businessPlanSchema,
      system: systemPrompt,
      prompt:  userPrompt,
    })

    console.log("🔷 [Action] planObject received:", planObject)

    console.log("🔷 [Action] checking Supabase auth…")
    const {
      data: { user },
    } = await supabase.auth.getUser()
    console.log("🔷 [Action] supabase.auth.getUser() →", user)

    if (!user?.id) {
      console.error("🔷 [Action] Not authenticated – aborting insert")
      throw new Error("Not authenticated")
    }

    console.log("🔷 [Action] inserting into business_plans for user:", user.id)
    const { error: insertError } = await supabase
      .from("business_plans")
      .insert({ user_id: user.id, plan_name: formData.businessName, plan_data: planObject })

    console.log("🔷 [Action] insertError:", insertError)
    if (insertError) throw insertError

    console.log("🔷 [Action] generation & persist successful")
    return { success: true, plan: planObject }
  } catch (error: any) {
    console.error("Error generating business plan:", error)
    return { success: false, error: error.message }
  }
}
