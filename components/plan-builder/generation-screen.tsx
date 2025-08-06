"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Brain, FileText, TrendingUp, Target, Users, DollarSign, Lightbulb, Sparkles } from "lucide-react"

interface GenerationScreenProps {
  businessName: string
}

const generationSteps = [
  {
    id: 1,
    title: "Analyzing Business Model",
    description: "Understanding your business structure and approach",
    icon: Brain,
    duration: 1500,
  },
  {
    id: 2,
    title: "Researching Market Opportunities",
    description: "Identifying target market and competitive landscape",
    icon: Target,
    duration: 1500,
  },
  {
    id: 3,
    title: "Developing Product Strategy",
    description: "Creating comprehensive product positioning",
    icon: Lightbulb,
    duration: 1500,
  },
  {
    id: 4,
    title: "Building Marketing Framework",
    description: "Designing customer acquisition strategies",
    icon: Users,
    duration: 1500,
  },
  {
    id: 5,
    title: "Creating Financial Projections",
    description: "Generating revenue and growth forecasts",
    icon: DollarSign,
    duration: 1500,
  },
  {
    id: 6,
    title: "Optimizing Operations Plan",
    description: "Structuring business operations and processes",
    icon: TrendingUp,
    duration: 1000,
  },
  {
    id: 7,
    title: "Finalizing Business Plan",
    description: "Compiling comprehensive business documentation",
    icon: FileText,
    duration: 1000,
  },
]

export function GenerationScreen({ businessName }: GenerationScreenProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let stepIndex = 0
    let progressValue = 0

    const runSteps = () => {
      if (stepIndex < generationSteps.length) {
        setCurrentStep(stepIndex)

        const step = generationSteps[stepIndex]
        const progressIncrement = 100 / generationSteps.length
        const startProgress = progressValue
        const endProgress = progressValue + progressIncrement

        // Animate progress for this step
        const duration = step.duration
        const interval = 50
        const steps = duration / interval
        const progressStep = progressIncrement / steps

        let currentProgress = startProgress
        const progressInterval = setInterval(() => {
          currentProgress += progressStep
          setProgress(Math.min(currentProgress, endProgress))

          if (currentProgress >= endProgress) {
            clearInterval(progressInterval)
            progressValue = endProgress
            stepIndex++
            setTimeout(runSteps, 200)
          }
        }, interval)
      }
    }

    runSteps()
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-6">
      {/* Floating particles animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            <Sparkles className="h-4 w-4 text-orange-300 opacity-60" />
          </div>
        ))}
      </div>

      <Card className="w-full max-w-2xl border-0 shadow-2xl rounded-3xl bg-white/80 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-6 animate-pulse">
              <Brain className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Generating Your Business Plan</h1>
            <p className="text-lg text-gray-600">
              Creating a comprehensive plan for <span className="font-semibold text-orange-600">{businessName}</span>
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">Overall Progress</span>
              <span className="text-sm font-medium text-gray-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3 bg-gray-200" />
          </div>

          {/* Current Step */}
          <div className="mb-8">
            {generationSteps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isCompleted = index < currentStep

              return (
                <div
                  key={step.id}
                  className={`flex items-center p-4 rounded-2xl mb-3 transition-all duration-500 ${
                    isActive
                      ? "bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-200 scale-105"
                      : isCompleted
                        ? "bg-green-50 border border-green-200"
                        : "bg-gray-50 border border-gray-200 opacity-50"
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full mr-4 ${
                      isActive
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white animate-pulse"
                        : isCompleted
                          ? "bg-green-500 text-white"
                          : "bg-gray-300 text-gray-500"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-left flex-1">
                    <h3
                      className={`font-semibold ${isActive ? "text-orange-700" : isCompleted ? "text-green-700" : "text-gray-500"}`}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={`text-sm ${isActive ? "text-orange-600" : isCompleted ? "text-green-600" : "text-gray-400"}`}
                    >
                      {step.description}
                    </p>
                  </div>
                  {isActive && (
                    <div className="ml-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500 border-t-transparent"></div>
                    </div>
                  )}
                  {isCompleted && (
                    <div className="ml-4">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Footer Message */}
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Generating your plan may take a moment—hang tight while we finish up.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
