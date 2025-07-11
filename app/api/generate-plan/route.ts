import { NextRequest, NextResponse } from "next/server"
import { generateBusinessPlan }         from "@/app/actions/generate-plan"
import type { BusinessPlanData }        from "@/app/plan-builder/page"

export async function POST(req: NextRequest) {
  try {
    const formData = (await req.json()) as BusinessPlanData
    const result   = await generateBusinessPlan(formData)
    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    })
  } catch (err: any) {
    console.error("API error:", err)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}
