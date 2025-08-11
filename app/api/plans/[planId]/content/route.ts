import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export async function GET(
  req: Request,
  { params }: { params: { planId: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data, error } = await supabase
    .from("business_plans")
    .select("id, plan_name, plan_data, plan_json")
    .eq("id", params.planId)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Not found" }, { status: 404 })
  }
  return NextResponse.json(data)
}