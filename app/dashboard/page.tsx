// app/dashboard/page.tsx
// (no "use client" at the top – this is a server component)

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import DashboardLayout from "@/components/dashboard-layout"

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/signin")
  }

  const userName =
    (user.user_metadata as { full_name?: string }).full_name ||
    user.email ||
    "User"

  return (
    <DashboardLayout currentPage="dashboard" userName={userName}>
      <div>
        
      </div>
    </DashboardLayout>
  )
}
