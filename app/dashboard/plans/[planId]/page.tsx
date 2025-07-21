// app/dashboard/plans/[planId]/page.tsx
import { cookies, headers } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import PlanBuilderClient from "@/app/plan-builder/page"

interface Props { params: { planId: string } }

export default async function PlanDetailPage({ params }: Props) {
  const { planId } = params
  const supabase = createServerComponentClient({ cookies, headers })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <p className="p-8 text-center">Please sign in.</p>

  const { data, error } = await supabase
    .from("business_plans")
    .select("plan_data")
    .eq("id", planId)
    .eq("user_id", user.id)
    .single()

  if (error || !data) {
    return <p className="p-8 text-center">Plan not found.</p>
  }

  return <PlanBuilderClient initialPlanData={data.plan_data} />
}
