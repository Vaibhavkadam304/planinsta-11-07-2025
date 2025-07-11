"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, TrendingUp, Users, DollarSign, Target, Rocket, ArrowRight } from "lucide-react"
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

interface CategoryResult {
  category: string
  score: number
  maxScore: number
  level: "weak" | "developing" | "strong" | "excellent"
  feedback: string
}

const quizQuestions: QuizQuestion[] = [
  // Market Opportunity
  {
    id: "market-size",
    category: "Market Opportunity",
    question: "How large is your total addressable market (TAM)?",
    options: [
      { text: "Less than $10M", points: 0 },
      { text: "$10M - $100M", points: 1 },
      { text: "$100M - $1B", points: 2 },
      { text: "$1B+", points: 3 },
      { text: "Not sure", points: 0 },
    ],
  },
  {
    id: "market-validation",
    category: "Market Opportunity",
    question: "Have you validated that people want your product?",
    options: [
      { text: "Conducted customer interviews and surveys", points: 1 },
      { text: "Have pilot users actively using the product", points: 2 },
      { text: "Have paying customers", points: 3 },
      { text: "Not yet validated", points: 0 },
    ],
  },
  // Traction & Business Stage
  {
    id: "traction-stage",
    category: "Traction & Business Stage",
    question: "What best describes your current traction?",
    options: [
      { text: "Just an idea or concept", points: 0 },
      { text: "MVP with some users", points: 1 },
      { text: "Growing user base", points: 2 },
      { text: "Revenue-generating with growth", points: 3 },
    ],
  },
  {
    id: "customer-count",
    category: "Traction & Business Stage",
    question: "How many paying customers do you currently have?",
    options: [
      { text: "0 customers", points: 0 },
      { text: "1-10 customers", points: 1 },
      { text: "11-100 customers", points: 2 },
      { text: "100+ customers", points: 3 },
    ],
  },
  // Founding Team
  {
    id: "team-size",
    category: "Founding Team",
    question: "How many full-time co-founders do you have?",
    options: [
      { text: "Solo founder", points: 1 },
      { text: "2 co-founders", points: 3 },
      { text: "3+ co-founders", points: 2 },
    ],
  },
  {
    id: "team-experience",
    category: "Founding Team",
    question: "What's your team's prior experience?",
    options: [
      { text: "Both startup and domain experience", points: 3 },
      { text: "Either startup or domain experience", points: 2 },
      { text: "Limited relevant experience", points: 1 },
      { text: "No prior startup or domain experience", points: 0 },
    ],
  },
  // Business Model & Scalability
  {
    id: "business-model",
    category: "Business Model & Scalability",
    question: "Do you have a clearly defined business model?",
    options: [
      { text: "Yes, clearly defined and tested", points: 3 },
      { text: "Defined but still testing", points: 2 },
      { text: "Basic model, needs refinement", points: 1 },
      { text: "Not yet defined", points: 0 },
    ],
  },
  {
    id: "scalability",
    category: "Business Model & Scalability",
    question: "How scalable is your business model?",
    options: [
      { text: "Fully scalable with minimal marginal costs", points: 3 },
      { text: "Partially scalable", points: 2 },
      { text: "Limited scalability", points: 1 },
      { text: "Not sure about scalability", points: 0 },
    ],
  },
  // Financial Preparedness
  {
    id: "burn-rate",
    category: "Financial Preparedness",
    question: "Do you know your monthly burn rate?",
    options: [
      { text: "Yes, I track it closely", points: 3 },
      { text: "Somewhat - I have estimates", points: 2 },
      { text: "Basic understanding", points: 1 },
      { text: "No, I don't track it", points: 0 },
    ],
  },
  {
    id: "runway",
    category: "Financial Preparedness",
    question: "How much runway do you currently have?",
    options: [
      { text: "Less than 3 months", points: 0 },
      { text: "3-6 months", points: 1 },
      { text: "6-12 months", points: 2 },
      { text: "12+ months", points: 3 },
      { text: "Not sure", points: 0 },
    ],
  },
  // Investor Readiness
  {
    id: "pitch-materials",
    category: "Investor Readiness",
    question: "Do you have a pitch deck and executive summary?",
    options: [
      { text: "Yes, polished and investor-ready", points: 3 },
      { text: "Draft versions that need refinement", points: 2 },
      { text: "Basic materials", points: 1 },
      { text: "None prepared", points: 0 },
    ],
  },
  {
    id: "pitch-experience",
    category: "Investor Readiness",
    question: "Have you pitched to investors before?",
    options: [
      { text: "Multiple VCs and angel investors", points: 3 },
      { text: "Pitch events or competitions", points: 2 },
      { text: "Informal pitches to mentors", points: 1 },
      { text: "Not yet", points: 0 },
    ],
  },
]

export default function VCReadinessQuizPage() {
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

  const calculateResults = (): { categories: CategoryResult[]; totalScore: number; maxTotalScore: number } => {
    const categories = [
      "Market Opportunity",
      "Traction & Business Stage",
      "Founding Team",
      "Business Model & Scalability",
      "Financial Preparedness",
      "Investor Readiness",
    ]

    const categoryResults = categories.map((category) => {
      const categoryQuestions = quizQuestions.filter((q) => q.category === category)
      const categoryScore = categoryQuestions.reduce((sum, q) => sum + (answers[q.id] || 0), 0)
      const maxScore = categoryQuestions.reduce((sum, q) => sum + Math.max(...q.options.map((opt) => opt.points)), 0)

      let level: "weak" | "developing" | "strong" | "excellent"
      let feedback: string

      const percentage = (categoryScore / maxScore) * 100

      if (percentage >= 85) {
        level = "excellent"
        feedback = getCategoryFeedback(category, "excellent")
      } else if (percentage >= 65) {
        level = "strong"
        feedback = getCategoryFeedback(category, "strong")
      } else if (percentage >= 40) {
        level = "developing"
        feedback = getCategoryFeedback(category, "developing")
      } else {
        level = "weak"
        feedback = getCategoryFeedback(category, "weak")
      }

      return {
        category,
        score: categoryScore,
        maxScore,
        level,
        feedback,
      }
    })

    const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0)
    const maxTotalScore = quizQuestions.reduce((sum, q) => sum + Math.max(...q.options.map((opt) => opt.points)), 0)

    return { categories: categoryResults, totalScore, maxTotalScore }
  }

  const getCategoryFeedback = (category: string, level: string): string => {
    const feedback: Record<string, Record<string, string>> = {
      "Market Opportunity": {
        excellent:
          "Outstanding market opportunity with validated demand. VCs will be excited about your market size and validation.",
        strong:
          "Good market opportunity with solid validation. Consider strengthening market research for VC presentations.",
        developing:
          "Market opportunity exists but needs more validation. Focus on customer interviews and market sizing.",
        weak: "Market opportunity unclear. Conduct thorough market research and customer validation before approaching VCs.",
      },
      "Traction & Business Stage": {
        excellent:
          "Impressive traction that demonstrates product-market fit. VCs love to see paying customers and growth.",
        strong: "Good traction with clear progress. Continue focusing on customer acquisition and retention.",
        developing: "Early traction showing promise. Build more users and ideally convert some to paying customers.",
        weak: "Limited traction. Focus on building an MVP and acquiring your first users before seeking VC funding.",
      },
      "Founding Team": {
        excellent:
          "Strong founding team with complementary skills and relevant experience. This is a major VC strength.",
        strong: "Good team foundation. Consider if you need additional co-founders with specific expertise.",
        developing: "Team has potential but may benefit from additional experience or co-founders.",
        weak: "Team needs strengthening. Consider finding co-founders with relevant experience or domain expertise.",
      },
      "Business Model & Scalability": {
        excellent: "Clear, scalable business model that VCs can understand and get excited about.",
        strong: "Good business model with scalability potential. Refine unit economics for VC presentations.",
        developing: "Business model needs refinement. Focus on proving scalability and unit economics.",
        weak: "Business model unclear. Define how you'll make money and scale before approaching VCs.",
      },
      "Financial Preparedness": {
        excellent:
          "Excellent financial planning and runway management. VCs appreciate founders who understand their finances.",
        strong: "Good financial awareness. Ensure you have detailed projections for VC meetings.",
        developing: "Basic financial planning in place. Improve tracking and forecasting capabilities.",
        weak: "Financial planning needs immediate attention. Learn to track burn rate and create projections.",
      },
      "Investor Readiness": {
        excellent: "Fully prepared for VC meetings with polished materials and pitch experience.",
        strong: "Well-prepared with good materials. Practice your pitch and refine based on feedback.",
        developing: "Basic preparation in place. Invest time in creating compelling pitch materials.",
        weak: "Not ready for VC meetings. Create a pitch deck and practice presenting before reaching out.",
      },
    }

    return feedback[category]?.[level] || "Continue working on this area to improve your VC readiness."
  }

  const getOverallReadiness = (totalScore: number, maxScore: number) => {
    const percentage = (totalScore / maxScore) * 100

    if (percentage >= 80) {
      return {
        level: "VC-Ready",
        description: "You're well-prepared to pitch investors",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      }
    } else if (percentage >= 55) {
      return {
        level: "Emerging",
        description: "Gain traction and sharpen strategy",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
      }
    } else {
      return {
        level: "Early Stage",
        description: "Focus on foundation first",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
      }
    }
  }

  const results = showResults ? calculateResults() : { categories: [], totalScore: 0, maxTotalScore: 0 }
  const overallReadiness = showResults ? getOverallReadiness(results.totalScore, results.maxTotalScore) : null

  if (showResults) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />

        <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Results Header */}
            <div className="text-center mb-12 animate-fade-in-up">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Your VC Readiness Results</h1>
              <div className="mb-6">
                <div
                  className={`inline-flex items-center px-6 py-3 rounded-2xl ${overallReadiness?.bgColor} ${overallReadiness?.borderColor} border-2 mb-4`}
                >
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${overallReadiness?.color} mb-1`}>
                      {Math.round((results.totalScore / results.maxTotalScore) * 100)}%
                    </div>
                    <div className={`text-lg font-semibold ${overallReadiness?.color}`}>{overallReadiness?.level}</div>
                  </div>
                </div>
                <p className="text-xl text-gray-600">{overallReadiness?.description}</p>
              </div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Here's your detailed breakdown across the key areas VCs evaluate when considering investments.
              </p>
            </div>

            {/* Category Results */}
            <div className="grid gap-6 mb-12">
              {results.categories.map((result, index) => {
                const percentage = (result.score / result.maxScore) * 100
                const levelColors = {
                  excellent: "text-green-600 bg-green-50 border-green-200",
                  strong: "text-blue-600 bg-blue-50 border-blue-200",
                  developing: "text-yellow-600 bg-yellow-50 border-yellow-200",
                  weak: "text-red-600 bg-red-50 border-red-200",
                }

                const icons = {
                  "Market Opportunity": Target,
                  "Traction & Business Stage": TrendingUp,
                  "Founding Team": Users,
                  "Business Model & Scalability": Rocket,
                  "Financial Preparedness": DollarSign,
                  "Investor Readiness": TrendingUp,
                }

                const IconComponent = icons[result.category as keyof typeof icons] || Target

                return (
                  <Card
                    key={result.category}
                    className="border-0 shadow-lg rounded-3xl animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
                          <IconComponent className="h-5 w-5 mr-2 text-orange-500" />
                          {result.category}
                        </CardTitle>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            {result.score}/{result.maxScore}
                          </div>
                          <Badge className={`${levelColors[result.level]} border rounded-2xl`}>
                            {result.level.charAt(0).toUpperCase() + result.level.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-3" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">{result.feedback}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Action Items */}
            <Card className="border-0 shadow-lg rounded-3xl mb-8 animate-fade-in-up">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.categories
                    .filter((cat) => cat.level === "weak" || cat.level === "developing")
                    .slice(0, 3)
                    .map((cat, index) => (
                      <div key={index} className="flex items-start">
                        <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Strengthen {cat.category}</h4>
                          <p className="text-gray-600 text-sm">{cat.feedback}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* CTA Section */}
            <Card className="border-0 shadow-xl rounded-3xl bg-gradient-to-r from-orange-50 to-red-50 animate-fade-in-up">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Build a VC-Ready Business Plan?</h3>
                <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                  Use PlanInsta's AI-powered platform to create a professional, investor-ready business plan that
                  addresses these areas and impresses VCs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    Create Your VC-Ready Plan
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-2xl px-8 py-4 text-lg font-semibold border-2 hover:border-orange-500 hover:text-orange-600"
                    onClick={() => window.location.reload()}
                  >
                    Retake Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Footer />
        <LeadCapturePopup source="vc-readiness-quiz" />
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
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Are You Ready to Pitch to VCs?</h1>
              <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
                Evaluate your startup's readiness for venture capital with our no-login quiz.
              </p>
              <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
                From traction to team, market size to financials — this 6-step VC Readiness Quiz gives you a clear
                picture of your strengths and gaps. Based on investor logic. Built to guide.
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
      <LeadCapturePopup source="vc-readiness-quiz" />
    </div>
  )
}
