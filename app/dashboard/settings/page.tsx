import { ProtectedRoute } from "@/components/auth/protected-route"
import DashboardLayout from "@/components/layouts/dashboard-layout"

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout currentPage="settings">
        <div>
          <h1>Settings</h1>
          <p>This is the settings page.</p>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
