import { NextResponse } from "next/server";
import { generateBusinessPlan } from "@/app/actions/generate-plan";
import type { BusinessPlanData } from "@/components/plan-builder/PlanBuilderClient";

export async function POST(req: Request) {
  try {
    const formData = (await req.json()) as BusinessPlanData;

    const result = await generateBusinessPlan(formData);

    // Handled/expected failures → 4xx; success → 200
    const status = result?.success ? 200 : 400;
    return NextResponse.json(result, { status });
  } catch (err: any) {
    console.error("API error:", err);
    return NextResponse.json(
      { success: false, error: err?.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
