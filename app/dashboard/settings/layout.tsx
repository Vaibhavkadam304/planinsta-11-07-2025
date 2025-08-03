// app/dashboard/settings/layout.tsx
import { cookies, headers } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import DashboardLayout from "@/components/dashboard-layout"

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const headerList = await headers()
  const supabase = createServerComponentClient({ cookies: () => cookieStore, headers: () => headerList })

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <DashboardLayout currentPage="settings" userName={user?.user_metadata.full_name || user?.email || ""}>
      {children}
    </DashboardLayout>
  )
}
