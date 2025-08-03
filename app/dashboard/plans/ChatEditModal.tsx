// components/plan-builder/ChatEditModal.tsx

import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface ChatEditModalProps {
  isOpen: boolean
  onClose: () => void
  initialContent: string | string[] | object
  onSave: (newContent: string) => Promise<void>
}

export function ChatEditModal({
  isOpen,
  onClose,
  initialContent,
  onSave,
}: ChatEditModalProps) {
  const [draftContent, setDraftContent] = useState<string>("")
  const [previewContent, setPreviewContent] = useState<
    string | string[] | object
  >("")
  const [loadingPreview, setLoadingPreview] = useState(false)

  useEffect(() => {
    setDraftContent(
      typeof initialContent === "string"
        ? initialContent
        : Array.isArray(initialContent)
        ? initialContent.join("\n\n")
        : String(initialContent)
    )
  }, [initialContent])

  const handleGeneratePreview = async () => {
    setLoadingPreview(true)
    const result = await fetch("/api/preview", {
      method: "POST",
      body: JSON.stringify({ text: draftContent }),
      headers: { "Content-Type": "application/json" },
    }).then((r) => r.json())
    setPreviewContent(result.preview)
    setLoadingPreview(false)
  }

  const handleSave = async () => {
    await onSave(draftContent)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Content</DialogTitle>
        </DialogHeader>

        {/* Editor */}
        <div className="mt-4">
          <Textarea
            className="h-40"
            value={draftContent}
            onChange={(e) => setDraftContent(e.target.value)}
          />
        </div>

        <div className="flex gap-2 mt-2">
          <Button onClick={() => void handleGeneratePreview()} disabled={loadingPreview}>
            {loadingPreview ? "Loading..." : "Preview"}
          </Button>
          <Button onClick={() => void handleSave()}>Save</Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>

        {/* Preview */}
        <div className="mt-6 border-t pt-4">
          <h3 className="text-lg font-semibold mb-2">Preview</h3>
          <div className="prose prose-gray max-w-none">
            <div className="text-gray-700 leading-relaxed space-y-4">
              {(() => {
                const previewText = Array.isArray(previewContent)
                  ? previewContent.join("\n\n")
                  : typeof previewContent === "string"
                  ? previewContent
                  : String(previewContent)

                return previewText.split("\n\n").map((paragraph, idx) => {
                  if (
                    paragraph.trim().startsWith("**") &&
                    paragraph.trim().endsWith("**")
                  ) {
                    return (
                      <h4
                        key={idx}
                        className="font-bold text-lg text-gray-900 mt-6 mb-3"
                      >
                        {paragraph.replace(/\*\*/g, "")}
                      </h4>
                    )
                  }
                  return <p key={idx}>{paragraph}</p>
                })
              })()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
