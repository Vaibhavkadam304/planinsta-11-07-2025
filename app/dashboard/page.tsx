// app/dashboard/page.tsx
// server component

import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import DashboardLayout from "@/components/dashboard-layout"

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const headerList = await headers()

  const supabase = createServerComponentClient({
    cookies: () => cookieStore,
    headers: () => headerList,
  })

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/signin")
  }

  const userName =
    (user.user_metadata as { full_name?: string; name?: string })?.full_name ||
    (user.user_metadata as { name?: string })?.name ||
    user.email ||
    "User"

  return (
    <DashboardLayout currentPage="dashboard" userName={userName}>
      <div>
        {/* your dashboard content */}
      </div>
    </DashboardLayout>
  )
}
