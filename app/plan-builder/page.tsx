// app/plan-builder/page.tsx
import React, { Suspense } from "react"
import PlanBuilderClient from "@/components/plan-builder/PlanBuilderClient"

export default function PlanBuilderPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        Loading plan builder…
      </div>
    }>
      <PlanBuilderClient />
    </Suspense>
  )
}