"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface UnsavedChangesModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  onDiscard: () => void
}

export function UnsavedChangesModal({ isOpen, onClose, onSave, onDiscard }: UnsavedChangesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center text-amber-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Unsaved Changes
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            You have unsaved changes to your business plan. What would you like to do?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-between space-x-2">
          <Button variant="outline" onClick={onDiscard} className="rounded-2xl">
            Discard Changes
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} className="rounded-2xl">
              Continue Editing
            </Button>
            <Button
              onClick={onSave}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl"
            >
              Save & Exit
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
