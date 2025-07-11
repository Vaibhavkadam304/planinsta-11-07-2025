"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Wand2 } from "lucide-react"

interface EditSectionModalProps {
  isOpen: boolean
  onClose: () => void
  sectionName: string
  currentContent: string
  onSave: (newContent: string) => void
}

export function EditSectionModal({ isOpen, onClose, sectionName, currentContent, onSave }: EditSectionModalProps) {
  const [instruction, setInstruction] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!instruction.trim()) return

    setIsGenerating(true)

    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // In a real implementation, this would call your AI service
    const generatedContent = `Updated content for ${sectionName} based on: "${instruction}"`

    setIsGenerating(false)
    onSave(generatedContent)
    setInstruction("")
  }

  const handleClose = () => {
    setInstruction("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center">
            <Wand2 className="h-5 w-5 mr-2 text-orange-500" />
            Edit Section: {sectionName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instruction">How would you like to modify this section?</Label>
            <Textarea
              id="instruction"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g., Make this more formal, Add more details about market size, Focus on competitive advantages..."
              className="rounded-2xl min-h-[100px]"
              rows={4}
            />
          </div>

          <div className="bg-gray-50 rounded-2xl p-4">
            <Label className="text-sm font-medium text-gray-700">Current Content Preview:</Label>
            <p className="text-sm text-gray-600 mt-2">
              {currentContent ||
                "This section will be generated based on your form inputs and any modifications you specify above."}
            </p>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
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
