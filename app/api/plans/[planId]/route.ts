// app/api/plans/[planId]/route.ts
import { NextResponse } from "next/server";
import { updatePlan } from "@/app/actions/update-plan";

export async function PATCH(
  req: Request,
  { params }: { params: { planId: string } }
) {
  const body = await req.json();
  const result = await updatePlan(params.planId, body as BusinessPlanData);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
