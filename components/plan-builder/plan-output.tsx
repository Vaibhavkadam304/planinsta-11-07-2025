"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Download,
  Edit3,
  FileText,
  TrendingUp,
  Target,
  Users,
  DollarSign,
  Lightbulb,
  CheckCircle,
  Clock,
} from "lucide-react"
import type { BusinessPlanData, GeneratedPlan } from "@/app/plan-builder/page"

interface PlanOutputProps {
  planData: BusinessPlanData
  generatedPlan: GeneratedPlan
  onEditSection: (sectionKey: string) => void
  onDownload: () => void
}

const sections = [
  {
    key: "executiveSummary",
    title: "Executive Summary",
    description: "Overview of your business and key highlights",
    icon: FileText,
  },
  {
    key: "marketAnalysis",
    title: "Market Analysis",
    description: "Target market research and competitive landscape",
    icon: Target,
  },
  {
    key: "productStrategy",
    title: "Product Strategy",
    description: "Product positioning and development roadmap",
    icon: Lightbulb,
  },
  {
    key: "marketingStrategy",
    title: "Marketing Strategy",
    description: "Customer acquisition and marketing channels",
    icon: Users,
  },
  {
    key: "operationsStrategy",
    title: "Operations Strategy",
    description: "Business operations and organizational structure",
    icon: TrendingUp,
  },
  {
    key: "financialProjections",
    title: "Financial Projections",
    description: "Revenue forecasts and financial planning",
    icon: DollarSign,
  },
  {
    key: "milestonesAndTraction",
    title: "Milestones & Traction",
    description: "Key achievements and upcoming goals",
    icon: CheckCircle,
  },
  {
    key: "additionalNotes",
    title: "Additional Notes",
    description: "Special considerations and extra information",
    icon: Clock,
  },
]

export function PlanOutput({ planData, generatedPlan, onEditSection, onDownload }: PlanOutputProps) {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null)

  const businessName = planData.businessName || "Your Business"
  const completedSections = sections.filter(
    (section) => generatedPlan[section.key as keyof GeneratedPlan]?.trim().length > 0,
  ).length

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{businessName} - Business Plan</h1>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="rounded-2xl px-3 py-1">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  {completedSections}/{sections.length} Sections Complete
                </Badge>
                <Badge variant="outline" className="rounded-2xl px-3 py-1">
                  <FileText className="h-4 w-4 mr-2 text-blue-500" />
                  Ready for Download
                </Badge>
              </div>
            </div>
            <Button
              onClick={onDownload}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl px-6 py-3 font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <Download className="h-4 w-4 mr-2" />
              Download DOCX
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {sections.map((section) => {
            const Icon = section.icon
            const content = generatedPlan[section.key as keyof GeneratedPlan]
            const isHovered = hoveredSection === section.key

            return (
              <Card
                key={section.key}
                className={`border-0 shadow-lg rounded-3xl bg-white transition-all duration-300 ${
                  isHovered ? "shadow-xl transform scale-[1.02]" : ""
                }`}
                onMouseEnter={() => setHoveredSection(section.key)}
                onMouseLeave={() => setHoveredSection(null)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl">
                        <Icon className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">{section.title}</CardTitle>
                        <p className="text-gray-600 text-sm mt-1">{section.description}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => onEditSection(section.key)}
                      variant="outline"
                      size="sm"
                      className={`rounded-2xl transition-all duration-300 ${
                        isHovered
                          ? "opacity-100 transform scale-105 border-orange-300 text-orange-600 hover:bg-orange-50"
                          : "opacity-0"
                      }`}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Section
                    </Button>
                  </div>
                </CardHeader>
                <Separator className="mx-6" />
                <CardContent className="pt-6">
                  <div className="prose prose-gray max-w-none">
                    {content ? (
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {content.split("\n").map((paragraph, index) => {
                          if (paragraph.trim().startsWith("**") && paragraph.trim().endsWith("**")) {
                            // Handle bold headings
                            return (
                              <h3 key={index} className="font-bold text-lg text-gray-900 mt-6 mb-3">
                                {paragraph.replace(/\*\*/g, "")}
                              </h3>
                            )
                          } else if (paragraph.trim().startsWith("•")) {
                            // Handle bullet points
                            return (
                              <div key={index} className="flex items-start space-x-2 mb-2">
                                <span className="text-orange-500 mt-2">•</span>
                                <span>{paragraph.replace("•", "").trim()}</span>
                              </div>
                            )
                          } else if (paragraph.trim()) {
                            // Handle regular paragraphs
                            return (
                              <p key={index} className="mb-4">
                                {paragraph}
                              </p>
                            )
                          }
                          return null
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-400 mb-2">
                          <FileText className="h-12 w-12 mx-auto mb-3" />
                        </div>
                        <p className="text-gray-500">No content generated for this section</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-6">
              <span>
                Plan generated for: <strong>{businessName}</strong>
              </span>
              <span>
                Sections:{" "}
                <strong>
                  {completedSections}/{sections.length}
                </strong>
              </span>
              <span>
                Status: <strong className="text-green-600">Ready</strong>
              </span>
            </div>
            <div className="text-xs text-gray-500">Generated on {new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
