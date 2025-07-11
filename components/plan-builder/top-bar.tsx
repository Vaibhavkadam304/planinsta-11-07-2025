"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Download, FileText, Wand2 } from "lucide-react"

interface PlanBuilderTopBarProps {
  planTitle: string
  onTitleChange: (title: string) => void
  stage: "quiz" | "generating" | "output"
  onDownload?: () => void
  onBackToDashboard: () => void
}

export function PlanBuilderTopBar({
  planTitle,
  onTitleChange,
  stage,
  onDownload,
  onBackToDashboard,
}: PlanBuilderTopBarProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [tempTitle, setTempTitle] = useState(planTitle)

  const handleTitleSubmit = () => {
    onTitleChange(tempTitle)
    setIsEditingTitle(false)
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSubmit()
    } else if (e.key === "Escape") {
      setTempTitle(planTitle)
      setIsEditingTitle(false)
    }
  }

  const getStageInfo = () => {
    switch (stage) {
      case "quiz":
        return { icon: FileText, text: "Building Plan", color: "text-blue-600" }
      case "generating":
        return { icon: Wand2, text: "Generating Plan", color: "text-orange-600" }
      case "output":
        return { icon: FileText, text: "Plan Ready", color: "text-green-600" }
    }
  }

  const stageInfo = getStageInfo()
  const StageIcon = stageInfo.icon

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-6">
          <Image src="/images/planinsta-logo.png" alt="PlanInsta" width={120} height={32} className="h-8 w-auto" />

          {/* Editable Plan Title */}
          <div className="flex items-center space-x-3">
            {isEditingTitle ? (
              <Input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={handleTitleKeyDown}
                className="text-xl font-bold border-0 bg-transparent p-0 focus:ring-2 focus:ring-orange-500 rounded-2xl"
                autoFocus
              />
            ) : (
              <h1
                onClick={() => setIsEditingTitle(true)}
                className="text-xl font-bold text-gray-900 cursor-pointer hover:text-orange-600 transition-colors duration-200 px-2 py-1 rounded-2xl hover:bg-gray-50"
              >
                {planTitle}
              </h1>
            )}
          </div>
        </div>

        {/* Center Section - Stage Status */}
        <div className="flex items-center space-x-2">
          <StageIcon className={`h-5 w-5 ${stageInfo.color}`} />
          <span className={`text-sm font-medium ${stageInfo.color}`}>{stageInfo.text}</span>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {stage === "output" && onDownload && (
            <Button
              onClick={onDownload}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl px-6 py-2 font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <Download className="h-4 w-4 mr-2" />
              Download DOCX
            </Button>
          )}

          <Button
            onClick={onBackToDashboard}
            variant="outline"
            className="rounded-2xl px-6 py-2 font-semibold border-2 hover:border-orange-500 hover:text-orange-600 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </header>
  )
}
