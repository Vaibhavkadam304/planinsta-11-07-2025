// app/dashboard/plans/layout.tsx
import { cookies, headers } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import DashboardLayout from "@/components/dashboard-layout"

export default async function PlansLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const headerList = await headers()
  const supabase = createServerComponentClient({ cookies: () => cookieStore, headers: () => headerList })

  const { data: { user } } = await supabase.auth.getUser()
  // You can redirect/notFound here if you want

  return (
    <DashboardLayout currentPage="plans" userName={user?.user_metadata.full_name || user?.email || ""}>
      {children}
    </DashboardLayout>
  )
}
