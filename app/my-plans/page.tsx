// app/my-plans/page.tsx
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

type Plan = Database["public"]["Tables"]["business_plans"]["Row"]

export default function MyPlansPage() {
  const supabase = createClientComponentClient<Database>()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setPlans([])
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("business_plans")
        .select("id, plan_name, created_at")
        .eq("user_id", user.id)
        .is("trashed_at", null) // <<< only active ones
        .order("created_at", { ascending: false })

      if (!error && data) setPlans(data as Plan[])
      setLoading(false)
    })()
  }, [supabase])

  async function moveToTrash(id: string) {
    await supabase
      .from("business_plans")
      .update({ trashed_at: new Date().toISOString() })
      .eq("id", id)

    // optimistic update
    setPlans(prev => prev.filter(p => p.id !== id))
  }

  if (loading) return <div className="p-8">Loading…</div>

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Plans</h1>
        <Link
          href="/trash"
          className="text-sm text-gray-600 hover:underline"
        >
          View Trash →
        </Link>
      </div>

      {plans.length ? (
        <ul className="space-y-4">
          {plans.map(plan => (
            <li
              key={plan.id}
              className="p-4 border rounded hover:shadow transition flex items-center justify-between"
            >
              <div>
                <Link
                  href={`/plan-builder/${plan.id}`}
                  className="block font-semibold text-lg hover:underline"
                >
                  {plan.plan_name}
                </Link>
                <small className="text-gray-500">
                  Created on {new Date(plan.created_at!).toLocaleDateString()}
                </small>
              </div>

              <button
                onClick={() => moveToTrash(plan.id)}
                className="text-red-600 text-sm hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>You haven’t generated any plans yet.</p>
      )}
    </div>
  )
}
