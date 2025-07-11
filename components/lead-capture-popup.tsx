"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"
import { saveLead } from "@/app/actions/save-lead"

interface LeadCapturePopupProps {
  source: string // which page the user is on
  delay?: number // delay in milliseconds before showing popup
}

export function LeadCapturePopup({ source, delay = 5000 }: LeadCapturePopupProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasShown, setHasShown] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Check if popup has already been shown in this session
    const popupShown = sessionStorage.getItem(`lead-popup-${source}`)

    if (!popupShown && !hasShown) {
      const timer = setTimeout(() => {
        setIsOpen(true)
        setHasShown(true)
        sessionStorage.setItem(`lead-popup-${source}`, "true")
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [source, delay, hasShown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await saveLead({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        source: source,
      })

      if (result.success) {
        toast({
          title: "Thank you for your interest!",
          description: "Our team will reach out to you soon to provide personalized help.",
        })
        setFormData({ name: "", email: "", phone: "" })
        setIsOpen(false)
      } else {
        toast({
          title: "Something went wrong",
          description: "Please try again or contact us directly.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md rounded-3xl bg-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Want personalized help from PlanInsta team?
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-2xl hover:bg-gray-100">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-gray-600 mt-2">
            Get tailored guidance for your business planning needs. Our experts are here to help!
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
              className="rounded-2xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
              className="rounded-2xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              required
              className="rounded-2xl"
            />
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 rounded-2xl border-2 hover:border-orange-500 hover:text-orange-600"
            >
              Maybe Later
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold transition-all duration-300 transform hover:scale-105"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Get Help"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
