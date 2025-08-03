// app/components/PlanDetail.tsx  (adjust path if different)
"use client"

import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Download, Pencil, ArrowLeft } from "lucide-react"
import { ConfirmDelete } from "@/components/ConfirmDelete"
import { useRouter } from "next/navigation"

type Plan = {
  id: string
  plan_name: string
  created_at: string
  plan_data: Record<string, any>
}

export default function PlanDetail({ plan }: { plan: Plan }) {
  const { toast } = useToast()
  const router = useRouter()

  const handleDelete = async () => {
    const res = await fetch(`/api/plans/${plan.id}`, { method: "DELETE" })
    if (res.ok) {
      toast({ title: "Deleted", description: "Plan removed successfully." })
      router.push("/dashboard/plans")
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete the plan.",
      })
    }
  }

  return (
    <>
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => router.back()}
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {plan.plan_name}
          </h1>
        </div>

        <div className="flex gap-2">
          <Link href={`/dashboard/plans/${plan.id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>

          <a
            href={`/api/plan/${plan.id}/download`}
            className="inline-flex items-center rounded-md border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-accent/50 transition"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </a>

          <ConfirmDelete
            trigger={
              <Button size="sm" variant="destructive">
                Delete
              </Button>
            }
            title="Delete this plan?"
            description={`"${plan.plan_name}" will be permanently removed.`}
            onConfirm={handleDelete}
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Created on {formatDMY(plan.created_at)}
      </p>

      {/* Sections */}
      <div className="space-y-6">
        {Object.entries(plan.plan_data || {}).map(([key, value]) => (
          <Section key={key} title={toTitle(key)} body={value} />
        ))}
      </div>
    </>
  )
}

/* ---------- Helpers ---------- */

function Section({ title, body }: { title: string; body: any }) {
  if (!body) return null

  // string leaf
  if (typeof body === "string") {
    return (
      <Card className="border border-border bg-card">
        <CardContent className="p-6 space-y-3">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <p className="text-sm leading-6 text-muted-foreground whitespace-pre-line">
            {body}
          </p>
        </CardContent>
      </Card>
    )
  }

  // object: recurse
  return (
    <Card className="border border-border bg-card">
      <CardContent className="p-6 space-y-4">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <div className="space-y-4">
          {Object.entries(body).map(([k, v]) => (
            <Section key={k} title={toTitle(k)} body={v} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

const toTitle = (s: string) =>
  s
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())

const formatDMY = (d: string | Date) => {
  const date = new Date(d)
  const dd = String(date.getUTCDate()).padStart(2, "0")
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0")
  const yyyy = date.getUTCFullYear()
  return `${dd}/${mm}/${yyyy}`
}
