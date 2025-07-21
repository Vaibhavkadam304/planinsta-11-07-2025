// app/dashboard/plans/page.tsx
import Link from "next/link"
import { cookies, headers } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardTitle } from "@/components/ui/card"

export default async function MyPlansPage() {
  const supabase = createServerComponentClient({ cookies, headers })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <p className="p-8 text-center">Please sign in.</p>

  const { data: plans } = await supabase
    .from("business_plans")
    .select("id, plan_name, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">My Plans</h1>
      {plans && plans.length > 0 ? (
        plans.map((plan) => (
          <Card key={plan.id} className="border">
            <CardContent className="flex justify-between items-center">
              <div>
                <CardTitle>{plan.plan_name}</CardTitle>
                <p className="text-sm text-gray-500">
                  Created on {new Date(plan.created_at).toLocaleDateString()}
                </p>
              </div>
              <Link
                href={`/dashboard/plans/${plan.id}`}
                className="text-blue-600 hover:underline"
              >
                Open
              </Link>
            </CardContent>
          </Card>
        ))
      ) : (
        <p>No plans yet. Create one first!</p>
      )}
    </div>
  )
}
