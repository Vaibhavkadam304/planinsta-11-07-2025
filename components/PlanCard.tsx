// app/components/PlanCard.tsx (or wherever it lives)
"use client"

import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Trash2, Loader2, Download } from "lucide-react"
import Link from "next/link"
import { ConfirmDelete } from "@/components/ConfirmDelete"
import { exportBusinessPlanDocx } from "@/app/utils/exportDocx"

export default function PlanCard({
  plan,
  onDeleted,          // this now triggers the moveToTrash flow via parent
  deleting = false,    // optional: parent can pass a flag
}: {
  plan: any
  onDeleted?: () => Promise<void> | void
  deleting?: boolean
}) {
  const { toast } = useToast()
  const [downloading, setDownloading] = useState(false)

  const doDelete = async () => {
    try {
      await onDeleted?.() // parent handles supabase update + local removal
      toast({
        title: "Moved to trash",
        description: `"${plan.plan_name}" was moved to trash.`,
      })
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to move the plan to trash.",
      })
    }
  }

  return (
  <Card className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition">
    {/* Gradient accent bar */}
    {/* <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#FF7A00] to-[#F0435C]" /> */}

    <CardContent className="p-5 flex flex-col justify-between h-full">
      {/* Title + date */}
      <div className="space-y-1">
        <CardTitle
        className="text-base font-semibold leading-snug line-clamp-2 text-gray-900 dark:text-gray-100"
      >
        {plan.plan_name}
      </CardTitle>

        <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
          {new Date(plan.created_at).toISOString().slice(0, 10)}
        </span>
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-between gap-3">

        {/* minimal: hit your server download route */}
        <Button
          size="sm"
          variant="outline"
          disabled={downloading}
          className="inline-flex items-center gap-1"
          onClick={async () => {
            try {
              setDownloading(true)

              let generated = plan.plan_data
              if (!generated) {
                const res = await fetch(`/api/plans/${plan.id}/content`)
                const full = await res.json()
                generated = full.plan_data || full.plan_json
              }

              await exportBusinessPlanDocx(
                { businessName: plan.plan_name ?? "Business Plan" },
                generated
              )

              toast({
                title: "Download ready",
                description: `Exported “${plan.plan_name}”.`,
              })
            } catch (err: any) {
              console.error(err)
              toast({
                title: "Download failed",
                description: err?.message ?? "Something went wrong while exporting.",
                variant: "destructive",
              })
            } finally {
              setDownloading(false)
            }
          }}
        >
          {downloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Preparing…
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download
            </>
          )}
      </Button>

        <ConfirmDelete
          trigger={
            <Button
              size="sm"
              variant="destructive"
              disabled={deleting}
              className="flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          }
          onConfirm={doDelete}
          title="Move this plan to trash?"
          description={`"${plan.plan_name}" will be moved to trash. You can restore it from there or delete forever.`}
        />
      </div>
    </CardContent>

    {/* Subtle hover overlay */}
    <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-5 transition bg-black" />
  </Card>
)
}
