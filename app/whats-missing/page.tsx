"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, XCircle, ArrowRight } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { LeadCapturePopup } from "@/components/lead-capture-popup"

interface QuizQuestion {
  id: string
  category: string
  question: string
  options: Array<{
    text: string
    points: number
  }>
}

interface QuizResult {
  category: string
  score: number
  maxScore: number
  status: "strong" | "needs-work" | "missing"
  recommendations: string[]
}

const quizQuestions: QuizQuestion[] = [
  {
    id: "problem-solution",
    category: "Problem & Solution Fit",
    question: "How well have you identified and validated your customer problem?",
    options: [
      { text: "I have a clearly defined problem with customer validation", points: 2 },
      { text: "I have identified a problem but limited validation", points: 1 },
      { text: "I have a general idea but no specific problem identified", points: 0 },
    ],
  },
  {
    id: "solution-clarity",
    category: "Problem & Solution Fit",
    question: "Can you explain your solution in one clear sentence?",
    options: [
      { text: "Yes, I have a clear, concise solution statement", points: 2 },
      { text: "I can explain it but it takes several sentences", points: 1 },
      { text: "I struggle to articulate my solution clearly", points: 0 },
    ],
  },
  {
    id: "target-customer",
    category: "Target Market",
    question: "How well do you know your ideal customer?",
    options: [
      { text: "I have detailed customer personas with demographics and pain points", points: 2 },
      { text: "I have a general idea of my target customer", points: 1 },
      { text: "I'm not sure who my ideal customer is", points: 0 },
    ],
  },
  {
    id: "market-validation",
    category: "Target Market",
    question: "Have you validated market demand for your solution?",
    options: [
      { text: "Yes, through surveys, interviews, and/or MVP testing", points: 2 },
      { text: "Some validation through informal conversations", points: 1 },
      { text: "No validation yet", points: 0 },
    ],
  },
  {
    id: "revenue-model",
    category: "Revenue Model",
    question: "Do you have a clear monetization strategy?",
    options: [
      { text: "Yes, with detailed pricing and revenue projections", points: 2 },
      { text: "I have a basic pricing idea", points: 1 },
      { text: "I haven't figured out how to make money yet", points: 0 },
    ],
  },
  {
    id: "competitive-pricing",
    category: "Revenue Model",
    question: "Have you researched similar products and their pricing?",
    options: [
      { text: "Yes, I understand the competitive pricing landscape", points: 2 },
      { text: "I've done some basic research", points: 1 },
      { text: "I haven't researched competitor pricing", points: 0 },
    ],
  },
  {
    id: "product-stage",
    category: "Product Readiness",
    question: "What stage is your product currently in?",
    options: [
      { text: "Launched with paying customers", points: 2 },
      { text: "MVP or prototype ready for testing", points: 1 },
      { text: "Still in idea or early concept stage", points: 0 },
    ],
  },
  {
    id: "team-structure",
    category: "Operations & Team",
    question: "Do you have the right team in place?",
    options: [
      { text: "Yes, I have co-founders/team with complementary skills", points: 2 },
      { text: "I have some team members but gaps remain", points: 1 },
      { text: "I'm working alone or don't have the right team", points: 0 },
    ],
  },
  {
    id: "competition-research",
    category: "Market & Competition",
    question: "How well do you understand your competition?",
    options: [
      { text: "I've researched 3+ competitors and understand their strengths/weaknesses", points: 2 },
      { text: "I know of some competitors but limited research", points: 1 },
      { text: "I haven't researched competitors thoroughly", points: 0 },
    ],
  },
  {
    id: "differentiation",
    category: "Market & Competition",
    question: "Do you have clear competitive advantages?",
    options: [
      { text: "Yes, I have unique differentiators that are hard to copy", points: 2 },
      { text: "I have some advantages but they could be copied", points: 1 },
      { text: "I'm not sure what makes me different", points: 0 },
    ],
  },
  {
    id: "financial-planning",
    category: "Financial Preparedness",
    question: "Do you understand your financial needs and runway?",
    options: [
      { text: "Yes, I have detailed financial projections and burn rate", points: 2 },
      { text: "I have basic financial estimates", points: 1 },
      { text: "I haven't done financial planning yet", points: 0 },
    ],
  },
  {
    id: "funding-strategy",
    category: "Financial Preparedness",
    question: "Do you have a clear funding or growth strategy?",
    options: [
      { text: "Yes, I have a detailed funding plan with target investors", points: 2 },
      { text: "I have a general idea of funding needs", points: 1 },
      { text: "I haven't thought about funding strategy", points: 0 },
    ],
  },
]

export default function WhatsMissingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [showResults, setShowResults] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string>("")

  const totalSteps = quizQuestions.length
  const progress = ((currentStep + 1) / totalSteps) * 100

  const handleNext = () => {
    if (selectedOption !== "") {
      const currentQuestion = quizQuestions[currentStep]
      const points = currentQuestion.options.find((opt) => opt.text === selectedOption)?.points || 0

      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: points,
      }))

      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1)
        setSelectedOption("")
      } else {
        setShowResults(true)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setSelectedOption("")
    }
  }

  const calculateResults = (): QuizResult[] => {
    const categories = [
      "Problem & Solution Fit",
      "Target Market",
      "Revenue Model",
      "Product Readiness",
      "Operations & Team",
      "Market & Competition",
      "Financial Preparedness",
    ]

    return categories.map((category) => {
      const categoryQuestions = quizQuestions.filter((q) => q.category === category)
      const categoryScore = categoryQuestions.reduce((sum, q) => sum + (answers[q.id] || 0), 0)
      const maxScore = categoryQuestions.length * 2

      let status: "strong" | "needs-work" | "missing"
      let recommendations: string[]

      if (categoryScore >= maxScore * 0.8) {
        status = "strong"
        recommendations = [`Great work on ${category.toLowerCase()}! Keep building on this strength.`]
      } else if (categoryScore >= maxScore * 0.4) {
        status = "needs-work"
        recommendations = getRecommendations(category, "needs-work")
      } else {
        status = "missing"
        recommendations = getRecommendations(category, "missing")
      }

      return {
        category,
        score: categoryScore,
        maxScore,
        status,
        recommendations,
      }
    })
  }

  const getRecommendations = (category: string, status: "needs-work" | "missing"): string[] => {
    const recommendations: Record<string, Record<string, string[]>> = {
      "Problem & Solution Fit": {
        "needs-work": [
          "Conduct customer interviews to validate your problem",
          "Create a clear problem statement with specific pain points",
          "Test your solution with potential customers",
        ],
        missing: [
          "Start with customer discovery interviews",
          "Define the specific problem you're solving",
          "Validate that customers actually have this problem",
        ],
      },
      "Target Market": {
        "needs-work": [
          "Create detailed customer personas",
          "Conduct market research and surveys",
          "Analyze your target market size and segments",
        ],
        missing: [
          "Identify your ideal customer profile",
          "Research market demographics and psychographics",
          "Validate market demand through customer interviews",
        ],
      },
      "Revenue Model": {
        "needs-work": [
          "Research competitor pricing strategies",
          "Test different pricing models with customers",
          "Create detailed revenue projections",
        ],
        missing: [
          "Define how you'll make money",
          "Research industry pricing standards",
          "Choose a sustainable monetization strategy",
        ],
      },
      "Product Readiness": {
        "needs-work": [
          "Build and test an MVP with real users",
          "Gather user feedback and iterate",
          "Plan your product development roadmap",
        ],
        missing: [
          "Create a minimum viable product (MVP)",
          "Define core product features",
          "Start building or prototyping your solution",
        ],
      },
      "Operations & Team": {
        "needs-work": [
          "Identify key roles and responsibilities",
          "Find co-founders or team members with complementary skills",
          "Create operational processes and workflows",
        ],
        missing: [
          "Assess what skills you need on your team",
          "Consider finding co-founders or advisors",
          "Plan your organizational structure",
        ],
      },
      "Market & Competition": {
        "needs-work": [
          "Conduct thorough competitive analysis",
          "Identify your unique value proposition",
          "Monitor competitor strategies and pricing",
        ],
        missing: [
          "Research direct and indirect competitors",
          "Analyze competitor strengths and weaknesses",
          "Define what makes you different and better",
        ],
      },
      "Financial Preparedness": {
        "needs-work": [
          "Create detailed financial projections",
          "Calculate your burn rate and runway",
          "Develop a comprehensive funding strategy",
        ],
        missing: [
          "Learn basic financial planning for startups",
          "Estimate your startup costs and ongoing expenses",
          "Research funding options (bootstrapping, investors, loans)",
        ],
      },
    }

    return recommendations[category]?.[status] || []
  }

  const results = showResults ? calculateResults() : []
  const overallScore = results.reduce((sum, r) => sum + r.score, 0)
  const maxOverallScore = results.reduce((sum, r) => sum + r.maxScore, 0)
  const overallPercentage = maxOverallScore > 0 ? Math.round((overallScore / maxOverallScore) * 100) : 0

  if (showResults) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />

        <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Results Header */}
            <div className="text-center mb-12 animate-fade-in-up">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Your Business Idea Diagnostic Results
              </h1>
              <div className="mb-6">
                <div className="text-6xl font-bold text-orange-600 mb-2">{overallPercentage}%</div>
                <p className="text-xl text-gray-600">Overall Readiness Score</p>
              </div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Here's what we found about your business idea and specific recommendations to strengthen each area.
              </p>
            </div>

            {/* Results Grid */}
            <div className="grid gap-6 mb-12">
              {results.map((result, index) => (
                <Card
                  key={result.category}
                  className="border-0 shadow-lg rounded-3xl animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
                        {result.status === "strong" && <CheckCircle className="h-5 w-5 text-green-500 mr-2" />}
                        {result.status === "needs-work" && <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />}
                        {result.status === "missing" && <XCircle className="h-5 w-5 text-red-500 mr-2" />}
                        {result.category}
                      </CardTitle>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {result.score}/{result.maxScore}
                        </div>
                        <div
                          className={`text-sm font-medium ${
                            result.status === "strong"
                              ? "text-green-600"
                              : result.status === "needs-work"
                                ? "text-yellow-600"
                                : "text-red-600"
                          }`}
                        >
                          {result.status === "strong"
                            ? "Strong"
                            : result.status === "needs-work"
                              ? "Needs Work"
                              : "Missing"}
                        </div>
                      </div>
                    </div>
                    <Progress value={(result.score / result.maxScore) * 100} className="h-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {result.recommendations.map((rec, recIndex) => (
                        <div key={recIndex} className="flex items-start">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <p className="text-gray-700">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* CTA Section */}
            <Card className="border-0 shadow-xl rounded-3xl bg-gradient-to-r from-orange-50 to-red-50 animate-fade-in-up">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Build a Winning Business Plan?</h3>
                <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                  Use PlanInsta's AI-powered platform to address these gaps and create a professional, investor-ready
                  business plan in just 15 minutes.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    Start Building Your Plan
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-2xl px-8 py-4 text-lg font-semibold border-2 hover:border-orange-500 hover:text-orange-600"
                  >
                    Retake Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Footer />
        <LeadCapturePopup source="whats-missing" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          {currentStep === 0 && (
            <div className="text-center mb-12 animate-fade-in-up">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                What's Missing in Your Business Idea?
              </h1>
              <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
                Uncover the gaps in your business strategy before you pitch investors.
              </p>
              <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
                Take our free, no-login diagnostic quiz to instantly evaluate the strengths and blind spots in your
                startup's foundation — from product-market fit to financial readiness.
              </p>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">
                Question {currentStep + 1} of {totalSteps}
              </span>
              <span className="text-sm font-medium text-gray-600">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Quiz Card */}
          <Card className="border-0 shadow-xl rounded-3xl mb-8 animate-fade-in-up">
            <CardHeader className="pb-6">
              <div className="text-sm font-medium text-orange-600 mb-2">{quizQuestions[currentStep].category}</div>
              <CardTitle className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                {quizQuestions[currentStep].question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                {quizQuestions[currentStep].options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-4 rounded-2xl border-2 border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all duration-200 cursor-pointer"
                    onClick={() => setSelectedOption(option.text)}
                  >
                    <RadioGroupItem value={option.text} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 text-gray-700 cursor-pointer font-medium">
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="rounded-2xl px-6 py-3 font-semibold border-2 hover:border-orange-500 hover:text-orange-600 disabled:opacity-50"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={selectedOption === ""}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl px-6 py-3 font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            >
              {currentStep === totalSteps - 1 ? "See Results" : "Next"}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Footer />
      <LeadCapturePopup source="whats-missing" />
    </div>
  )
}
