// app/dashboard/plans/page.tsx
import Link from "next/link"
import { cookies, headers } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import PlansList from "./PlansList"

export default async function MyPlansPage() {
  // ✅ Top-level usage already correct
  const cookieStore = await cookies()
  const headerList = await headers()
  const supabase = createServerComponentClient({
    cookies: () => cookieStore,
    headers: () => headerList,
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return <p className="p-8 text-center">Please sign in.</p>

  const { data: plans = [] } = await supabase
    .from("business_plans")
    .select("id, plan_name, created_at, plan_data") // ← include plan_data
    .eq("user_id", user.id)
    .is("trashed_at", null)
    .order("created_at", { ascending: false })

  // Server action
  async function moveToTrash(id: string) {
    "use server"
    // ⬇️ FIX: await dynamic APIs before passing to client
    const cookieStore = await cookies()
    const headerList = await headers()

    const sb = createServerComponentClient({
      cookies: () => cookieStore,
      headers: () => headerList,
    })

    const {
      data: { user },
    } = await sb.auth.getUser()
    if (!user) return

    await sb
      .from("business_plans")
      .update({ trashed_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id)
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* <h1 className="text-3xl font-bold tracking-tight">My Plans</h1> */}

        <div className="flex gap-3">
          {/* <Link
            href="/dashboard/trash"
            className="inline-flex h-10 items-center justify-center rounded-md border px-5 text-sm font-medium hover:bg-gray-50 transition"
          >
            Trash
          </Link> */}

          {/* <a
            href="/plan-builder"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition"
          >
            + New Plan
          </a> */}
        </div>
      </div>

      {plans.length ? (
        <PlansList initialPlans={plans} moveToTrash={moveToTrash} />
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 border border-dashed rounded-lg">
      <p className="text-lg font-medium">No plans yet</p>
      <p className="text-sm text-muted-foreground max-w-sm">
        Create your first AI-generated business plan and manage it here.
      </p>
      <a
        href="/dashboard/new"
        className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition"
      >
        Create a Plan
      </a>
    </div>
  )
}
