"use client"
import { useEffect } from "react"

export default function PlanBuilderError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  useEffect(() => {
    console.error("PlanBuilderPage error:", error)
  }, [error])

  return (
    <div style={{ padding: 20, color: "red" }}>
      <h1>Something went wrong in Plan Builder</h1>
      <pre>{error.message}</pre>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
