// components/SuggestedAudience.tsx
"use client"

import { useEffect, useState } from "react"
import type { BusinessPlanData } from "@/components/plan-builder/PlanBuilderClient"
import { suggestAudience } from "@/app/actions/suggest-target-audience"

type Props = {
  data: Partial<BusinessPlanData>
  onPick: (text: string) => void
  className?: string
  active?: boolean   // fetch once when textarea gains focus
}

export default function SuggestedAudience({ data, onPick, className, active }: Props) {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<string[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!active || items) return
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const result = await suggestAudience(data, 8)
        if (!cancelled) setItems(result)
      } catch (e: any) {
        if (!cancelled) setError("Could not fetch suggestions")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [active, items, data])

  if (!active) return null

  return (
    <div className={className}>
      <div className="text-sm text-gray-500 mb-1">Suggestions</div>
      {loading && <div className="text-sm text-gray-500">Thinking…</div>}
      {error && <div className="text-sm text-red-500">{error}</div>}
      {items && items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((s, i) => (
            <button
              key={i}
              onClick={() => onPick(s)}
              className="text-lg leading-7 px-5 py-3 rounded-full border hover:bg-gray-50 text-left"
              title="Click to use this"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
