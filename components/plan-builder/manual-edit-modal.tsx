"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface ManualEditModalProps {
  isOpen: boolean
  sectionName: string
  currentContent: unknown
  onClose: () => void
  onSave: (sectionKey: string, newContent: string) => void
}

export function ManualEditModal({
  isOpen,
  sectionName,
  currentContent,
  onClose,
  onSave,
}: ManualEditModalProps) {
  const [content, setContent] = useState("")

  // whenever we open–reset textarea
  useEffect(() => {
    if (isOpen) {
      setContent(typeof currentContent === "string"
        ? currentContent
        : JSON.stringify(currentContent, null, 2))
    }
  }, [isOpen, currentContent])

  const handleSave = () => {
    onSave(sectionName, content)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white sm:max-w-2xl rounded-3xl p-6 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Manual Edit: {sectionName}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 my-4">
          <Label>Raw JSON / Text</Label>
          <Textarea
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <DialogFooter className="space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
