// app/dashboard/plans/PlansList.tsx
"use client"

import { useMemo, useState, useTransition } from "react"
import PlanCard from "@/components/PlanCard"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Plan = {
  id: string
  plan_name: string
  created_at: string
  // add other fields you render in PlanCard if needed
}

export default function PlansList({
  initialPlans,
  moveToTrash, // ← NEW
}: {
  initialPlans: Plan[]
  moveToTrash: (id: string) => Promise<void> // ← NEW
}) {
  const [plans, setPlans] = useState(initialPlans)
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<"newest" | "oldest" | "az" | "za">("newest")
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const removePlanLocally = (id: string) =>
    setPlans(prev => prev.filter(p => p.id !== id))

  const handleDelete = (id: string) => {
    setDeletingId(id)
    startTransition(async () => {
      await moveToTrash(id)            // <-- server action
      removePlanLocally(id)            // <-- optimistic UI
      setDeletingId(null)
    })
  }

  const filtered = useMemo(() => {
    let temp = plans.filter(p =>
      p.plan_name.toLowerCase().includes(query.toLowerCase())
    )
    switch (sort) {
      case "oldest":
        temp = temp.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
        break
      case "az":
        temp = temp.sort((a, b) => a.plan_name.localeCompare(b.plan_name))
        break
      case "za":
        temp = temp.sort((a, b) => b.plan_name.localeCompare(a.plan_name))
        break
      default:
        temp = temp.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
    }
    return temp
  }, [plans, query, sort])

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <Input
          placeholder="Search plans..."
          className="w-full sm:w-72"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />

        <Select value={sort} onValueChange={v => setSort(v as any)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="az">Name A–Z</SelectItem>
            <SelectItem value="za">Name Z–A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(p => (
          <PlanCard
            key={p.id}
            plan={p}
            onDeleted={() => handleDelete(p.id)}       // ← changed
            deleting={deletingId === p.id} // optional prop if PlanCard supports it
          />
        ))}
      </div>

      {!filtered.length && (
        <p className="text-center text-sm text-muted-foreground py-12">
          Nothing matches your search.
        </p>
      )}
    </div>
  )
}
