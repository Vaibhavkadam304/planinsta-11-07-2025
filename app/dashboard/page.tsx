"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { useAuth } from "@/contexts/auth-context"

export default function DashboardPage() {
  const { user } = useAuth()
  const userName = user?.user_metadata?.full_name || user?.email || "John Doe"

  return (
    <ProtectedRoute>
      <DashboardLayout currentPage="dashboard" userName={userName}>
        <div>
          <h1>Dashboard</h1>
          <p>Welcome to your dashboard!</p>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
