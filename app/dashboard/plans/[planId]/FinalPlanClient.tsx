// app/dashboard/plans/[planId]/FinalPlanClient.tsx
"use client"

import { exportBusinessPlanDocx } from "@/app/utils/exportDocx"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { ConfirmDelete } from "@/components/ConfirmDelete"

type PlanData = Record<string, any>

export default function FinalPlanClient({
  id,
  planName,
  createdAt,
  planData,
}: {
  id: string
  planName: string
  createdAt: string
  planData: PlanData
}) {
  const router = useRouter()
  const { toast } = useToast()

  const handleDelete = async () => {
    const res = await fetch(`/api/plans/${id}`, { method: "DELETE" })
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
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-8">
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
            {planName || "Business Plan"}
          </h1>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
            exportBusinessPlanDocx({ businessName: planName, ...planData })
          }
            className="inline-flex items-center rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-accent/50 transition"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-8">
        Created on {formatDMY(createdAt)}
      </p>

      {/* Sections */}
      <div className="space-y-6">{renderSections(planData)}</div>
    </>
  )
}

/* ---------- Helpers ---------- */

function renderSections(obj: PlanData) {
  return Object.entries(obj || {}).map(([key, value]) => {
    // skip non-content keys if any
    if (["id", "user_id", "created_at", "updated_at"].includes(key)) return null

    return <Section key={key} title={prettifyKey(key)} body={value} />
  })
}

function Section({ title, body }: { title: string; body: any }) {
  if (!body) return null

  // simple string leaf
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

  // array of strings
  if (Array.isArray(body)) {
    return (
      <Card className="border border-border bg-card">
        <CardContent className="p-6 space-y-3">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <ul className="list-disc pl-5 text-sm leading-6 text-muted-foreground space-y-1">
            {body.map((item, i) =>
              typeof item === "string" ? <li key={i}>{item}</li> : null
            )}
          </ul>
        </CardContent>
      </Card>
    )
  }

  // nested object → recurse
  return (
    <Card className="border border-border bg-card">
      <CardContent className="p-6 space-y-4">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <div className="space-y-4">
          {Object.entries(body).map(([k, v]) => (
            <Section key={k} title={prettifyKey(k)} body={v} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function prettifyKey(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (m) => m.toUpperCase())
}

function formatDMY(d: string | Date) {
  const date = new Date(d)
  const dd = String(date.getUTCDate()).padStart(2, "0")
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0")
  const yyyy = date.getUTCFullYear()
  return `${dd}/${mm}/${yyyy}`
}
