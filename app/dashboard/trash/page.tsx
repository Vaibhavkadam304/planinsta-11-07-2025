// app/dashboard/plans/trash/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

type Plan = Database["public"]["Tables"]["business_plans"]["Row"]

export default function TrashPage() {
  const supabase = createClientComponentClient<Database>()
  const router = useRouter()
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
        .select("id, plan_name, trashed_at")
        .eq("user_id", user.id)
        .not("trashed_at", "is", null)
        .order("trashed_at", { ascending: false })

      if (!error && data) setPlans(data as Plan[])
      setLoading(false)
    })()
  }, [supabase])

  async function restore(id: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase
      .from("business_plans")
      .update({ trashed_at: null })
      .eq("id", id)
      .eq("user_id", user.id)
    setPlans(p => p.filter(plan => plan.id !== id))
  }

  async function deleteForever(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1) Detach any payments that reference this plan
    const { error: detachErr } = await supabase
      .from("payments")
      // choose one:
      .update({ plan_id: null })    // OR: .delete()
      .eq("plan_id", id)
      .eq("user_id", user.id);

    if (detachErr) {
      console.error("Unable to clear payments for plan:", detachErr.message);
      return;
    }

  // 2) Now delete the plan itself
  const { error: deleteErr } = await supabase
    .from("business_plans")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (deleteErr) {
    console.error("Unable to delete plan permanently:", deleteErr.message);
    return;
  }

  // 3) Update UI
  setPlans(p => p.filter(plan => plan.id !== id));
}


  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
          Trash
        </h1>

        <Link href="/dashboard/plans">
          <Button variant="outline" size="sm" className="space-x-1">
            <ArrowUpRight className="w-4 h-4" />
            <span>Back to Plans</span>
          </Button>
        </Link>
      </div>

      {/* Empty state */}
      {plans.length === 0 && (
        <Card className="bg-white shadow-sm">
          <CardContent className="py-14 text-center">
            <p className="text-gray-500">Nothing in your trash.</p>
            <Link href="/dashboard/plans">
              <Button className="mt-4">Go to My Plans</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* List of trashed plans */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map(plan => (
          <Card key={plan.id} className="bg-white shadow-sm hover:shadow-md transition">
            <CardHeader className="pb-0">
              <CardTitle className="text-base font-medium">{plan.plan_name}</CardTitle>
              <Badge variant="destructive" className="mt-2">
                Trashed on {new Date(plan.trashed_at!).toLocaleDateString()}
              </Badge>
            </CardHeader>
            <CardContent className="pt-4 flex justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => restore(plan.id)}
                className="text-blue-600 hover:text-blue-800"
              >
                Restore
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteForever(plan.id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete Forever
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
