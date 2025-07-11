import { ProtectedRoute } from "@/components/auth/protected-route"
import DashboardLayout from "@/components/layouts/dashboard-layout"

export default function PlansPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout currentPage="plans">
        <div>
          <h1>Plans Page</h1>
          <p>This is the plans page content.</p>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
