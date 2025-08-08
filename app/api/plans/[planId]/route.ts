import { updatePlan } from "@/app/actions/update-plan"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies as getCookies } from "next/headers"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  context: { params: { planId?: string } }
) {
  const { planId } = await context.params  // ✅ await params
  const body = await req.json()
  const result = await updatePlan(planId!, body as BusinessPlanData)

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(
  req: Request,
  context: { params: { planId?: string } }
) {
  const cookieStore = await getCookies() // ✅ await cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { planId } = await context.params // ✅ await the params object

  const { error } = await supabase
    .from("business_plans")
    .delete()
    .eq("id", planId!)
    .eq("user_id", user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}


export async function GET(
  req: Request,
  context: { params: { planId?: string } }
) {
  // await the async params getter
  const { planId } = await context.params!
  const cookieStore = await getCookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  // fetch exactly the JSON column you write in updatePlan
  const { data, error } = await supabase
    .from("business_plans")
    .select("plan_data")
    .eq("id", planId!)
    .single()

  if (error || !data) {
    console.error("Supabase GET error:", error?.message)
    return NextResponse.json(
      { error: error?.message || "Plan not found" },
      { status: 404 }
    )
  }

  // return just the JSON payload
  return NextResponse.json(data.plan_data)
}