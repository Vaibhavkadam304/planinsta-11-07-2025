"use client"

import { useState } from "react"
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
import { Loader2, Wand2 } from "lucide-react"

interface EditSectionModalProps {
  isOpen: boolean
  onClose: () => void
  sectionName: string
  currentContent: string
  /** now tells parent *which* section to update */
  onSave: (sectionKey: string, newContent: string) => void
}

export function EditSectionModal({
  isOpen,
  onClose,
  sectionName,
  currentContent,
  onSave,
}: EditSectionModalProps) {
  const [instruction, setInstruction] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    // don't do anything if no instruction
    if (!instruction.trim()) return;

    setIsGenerating(true);
    try {
      // 1) send edit request to server
      const res = await fetch("/api/edit-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionKey: sectionName,
          currentContent,
          instruction,
          
        }),
      });

      // 2) parse response
      const { success, content, error } = await res.json();

      if (!success) {
        console.error("Edit failed:", error);
        return;
      }

      // 3) notify parent of the new section content
      onSave(sectionName, content);

      // 4) reset and close
      setInstruction("");
      onClose();
    } catch (err) {
      console.error("Error editing section:", err);
    } finally {
      setIsGenerating(false);
    }
  };


  const handleClose = () => {
    setInstruction("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white sm:max-w-2xl rounded-3xl p-6 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center">
            <Wand2 className="h-5 w-5 mr-2 text-orange-500" />
            Edit Section: {sectionName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 1) Instruction box (always blank at open) */}
          <div className="space-y-2">
            <Label htmlFor="instruction">
              How would you like to modify this section?
            </Label>
            <Textarea
              id="instruction"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="…"
              rows={4}
              className="bg-white w-full rounded-2xl resize-y overflow-y-auto min-h-[100px] max-h-[40vh]"
              autoFocus
            />
          </div>

          {/* 2) Preview of *only* the current section */}
          <div className="bg-white rounded-2xl p-4 max-h-80 overflow-y-auto border">
            <Label className="text-sm font-medium text-gray-700">
              Current Content Preview:
            </Label>
            <pre className="whitespace-pre-wrap text-sm text-gray-600 mt-2">
              {currentContent ||
                "No content yet for this section. Type instructions above and click Apply."}
            </pre>
          </div>
        </div>

        <DialogFooter className="flex justify-between mt-4">
          <Button variant="outline" onClick={handleClose} className="rounded-2xl">
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!instruction.trim() || isGenerating}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Apply Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
