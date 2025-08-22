// components/plan-builder/quiz-interface.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Plus, Minus, Wand2, Loader2 } from "lucide-react"

import type { BusinessPlanData } from "@/components/plan-builder/PlanBuilderClient"
import SuggestedChoices from "@/components/SuggestedChoices"
import { suggestSwot } from "@/app/actions/suggest-swot"   // ← NEW
import SuggestedAudience from "@/components/SuggestedAudience"

interface QuizInterfaceProps {
  data: BusinessPlanData
  onChange: (data: Partial<BusinessPlanData>) => void
  onGeneratePlan: () => void
}

interface Question {
  id: string
  title: string
  description?: string
  type: "text" | "textarea" | "select" | "multiselect" | "switch" | "list" | "keyvalue" | "products" | "owners" | "founders"
  field: keyof BusinessPlanData
  options?: string[]
  required?: boolean
  placeholder?: string
}

interface Section {
  id: string
  title: string
  description: string
  questions: Question[]
}

const sections: Section[] = [
  {
    id: "business-basics",
    title: "Business Basics",
    description: "Let's start with the fundamentals of your business",
    questions: [
      {
        id: "business-name",
        title: "What's your business name?",
        description: "Enter the official name of your business or startup",
        type: "text",
        field: "businessName",
        required: true,
        placeholder: "e.g., TechFlow Solutions",
      },
      {
        id: "business-description",
        title: "Describe your business in one sentence",
        description: "A compelling one-liner that explains what your business does",
        type: "textarea",
        field: "description",
        required: true,
        placeholder:
          "e.g., We help small businesses automate their workflow processes through AI-powered solutions",
      },
      {
        id: "business-model",
        title: "What's your business model?",
        description: "Select the model that best describes how your business operates",
        type: "select",
        field: "businessModel",
        required: true,
        options: ["SaaS", "D2C", "Services", "Marketplace", "Other"],
      },
      {
        id: "business-stage",
        title: "What stage is your business currently in?",
        description: "This helps us tailor the plan to your current situation",
        type: "select",
        field: "businessStage",
        required: true,
        options: ["Idea", "MVP", "Early Revenue", "Growth"],
      },
    ],
  },
  {
    id: "vision-goals",
    title: "Vision & Goals",
    description: "Define your business vision and strategic objectives",
    questions: [
      {
        id: "vision-statement",
        title: "What's your long-term vision?",
        description: "Describe where you see your business in 5-10 years",
        type: "textarea",
        field: "visionStatement",
        required: true,
        placeholder: "e.g., To become the leading AI automation platform for small businesses globally",
      },
      {
        id: "short-term-goal",
        title: "What's your main goal for the next 6-12 months?",
        description: "Your immediate priority or milestone",
        type: "textarea",
        field: "shortTermGoal",
        placeholder: "e.g., Launch our MVP and acquire 100 paying customers",
      },
      {
        id: "long-term-goal",
        title: "What's your goal for the next 3-5 years?",
        description: "Your medium-term strategic objective",
        type: "textarea",
        field: "longTermGoal",
        placeholder: "e.g., Expand to 10,000 customers and raise Series A funding",
      },
    ],
  },
  {
    id: "target-market",
    title: "Target Market",
    description: "Identify and describe your ideal customers",
    questions: [
      {
        id: "target-audience",
        title: "Who is your target audience?",
        description: "Describe your ideal customers in detail",
        type: "textarea",
        field: "targetAudience",
        required: true,
        placeholder: "e.g., Small business owners with 10-50 employees who struggle with manual processes",
      },
      {
        id: "location",
        title: "What's your target geographic market?",
        description: "Where are your customers located?",
        type: "text",
        field: "location",
        placeholder: "e.g., United States, Global, India, Europe",
      },
      {
        id: "market-size",
        title: "What's your estimated market size?",
        description: "If known, provide market size information",
        type: "text",
        field: "marketSize",
        placeholder: "e.g., $10B TAM, 1M potential customers",
      },
    ],
  },
  {
    id: "product-service",
    title: "Product / Service",
    description: "Add one or more products. Use the button to add another.",
    questions: [
      {
        id: "products",
        title: "Products",
        description: "Add each product’s name, features, and what makes it unique.",
        type: "products",
        field: "products",
        required: true,
      },
    ],
  },
  {
    id: "marketing-sales",
    title: "Marketing & Sales",
    description: "Define your customer acquisition and sales strategy",
    questions: [
      {
        id: "marketing-channels",
        title: "Which marketing channels will you use?",
        description: "Select all channels you plan to use for customer acquisition",
        type: "multiselect",
        field: "marketingChannels",
        options: ["SEO", "Ads", "Social Media", "Email Marketing", "Referrals", "Content Marketing", "Partnerships"],
      },
      {
        id: "pricing-strategy",
        title: "What's your pricing strategy?",
        description: "How do you plan to charge customers?",
        type: "select",
        field: "pricingStrategy",
        options: ["Free", "Subscription", "One-time Payment", "Freemium"],
      },
      {
        id: "sales-team",
        title: "Do you have a dedicated sales team?",
        description: "Will you have people focused specifically on sales?",
        type: "switch",
        field: "hasSalesTeam",
      },
    ],
  },
  {
    id: "operations-team",
    title: "Operations & Team",
    description: "Outline your business operations and team structure",
    questions: [
      {
        id: "operation-location",
        title: "Where is your business located?",
        description: "Your main business operation location",
        type: "text",
        field: "operationLocation",
        placeholder: "e.g., San Francisco, CA",
      },
      {
        id: "legal-structure",
        title: "What's your legal business structure?",
        description: "The legal entity type for your business",
        type: "select",
        field: "legalStructure",
        options: ["Sole Proprietorship", "Partnership", "LLP", "Private Limited", "Other"],
      },
      {
        id: "team-size",
        title: "What's your current team size?",
        description: "How many people are working on this business?",
        type: "text",
        field: "teamSize",
        placeholder: "e.g., 5 people, Just me, 10-20 employees",
      },
      {
        id: "founder-role",
        title: "What's your role in the business?",
        description: "Your primary responsibility or title",
        type: "text",
        field: "founderRole",
        placeholder: "e.g., CEO, CTO, Founder",
      },
    ],
  },
  {
    id: "company-legal-ownership",
    title: "Legal Structure & Ownership",
    description: "Capture your registration details, owners, and founders",
    questions: [
      {
        id: "legal-structure-new",
        title: "What’s your legal structure?",
        description: "Select the legal entity type",
        type: "select",
        field: "legalStructure",
        options: ["Sole Proprietorship", "Partnership", "LLP", "Private Limited", "Other"],
        required: true,
      },
      {
        id: "incorporation-country",
        title: "Country of Incorporation",
        description: "Where is the company legally registered?",
        type: "text",
        field: "incorporationCountry",
        placeholder: "e.g., India",
        required: true,
      },
      {
        id: "incorporation-state",
        title: "State/Province of Incorporation",
        description: "The state or province of registration",
        type: "text",
        field: "incorporationState",
        placeholder: "e.g., Maharashtra",
        required: true,
      },
      {
        id: "ownership-table",
        title: "Ownership",
        description: "Add owners with their role and (optionally) equity %",
        type: "owners",
        field: "ownership",
      },
      {
        id: "founding-team-list",
        title: "Founding Team",
        description: "Add founders (Name, Title, optional Bio, optional LinkedIn URL)",
        type: "founders",
        field: "founders",
      },
    ],
  },

  // ✅ SWOT section (after Legal Structure & Ownership)
  {
    id: "swot-analysis",
    title: "Success Drivers",
    description: "Success Drivers are the most important things that contribute to the success of a business.",
    questions: [
      {
        id: "success-drivers",
        title: "Success Driver 1 (required)",
        description: "Success Drivers are the most important things that contribute to the success of a business.",
        type: "list",
        field: "successDrivers",
        required: true,
        placeholder: "Success Driver",
      },
      {
        id: "weaknesses",
        title: "Weakness",
        description: "",
        type: "list",
        field: "weaknesses",
        required: true,
        placeholder: "Weakness",
      },
    ],
  },

  {
    id: "financial-info",
    title: "Financial Information",
    description: "Provide details about your financial situation and projections",
    questions: [
      {
        id: "initial-investment",
        title: "How much initial investment have you made?",
        description: "The amount you've invested to start the business",
        type: "text",
        field: "initialInvestment",
        placeholder: "e.g., $50,000",
      },
      {
        id: "investment-utilization",
        title: "How did you use your initial investment?",
        description: "Break down how you spent your startup capital",
        type: "keyvalue",
        field: "investmentUtilization",
        placeholder: "e.g., Marketing, Development",
      },
      {
        id: "funding-received",
        title: "Have you received any external funding?",
        description: "Any investment from outside sources",
        type: "select",
        field: "fundingReceived",
        options: ["None", "Bootstrapped", "Angel Investment", "VC Funding"],
      },
      {
        id: "funding-needed",
        title: "How much funding do you need?",
        description: "Amount of additional funding required",
        type: "text",
        field: "fundingNeeded",
        placeholder: "e.g., $100,000",
      },
      {
        id: "funding-use-breakdown",
        title: "How will you use the new funding?",
        description: "Break down how you'll spend the additional funding",
        type: "keyvalue",
        field: "fundingUseBreakdown",
        placeholder: "e.g., Product Development, Marketing",
      },
      {
        id: "monthly-revenue",
        title: "What's your current monthly revenue?",
        description: "Your current monthly income from the business",
        type: "text",
        field: "monthlyRevenue",
        placeholder: "e.g., $10,000",
      },
      {
        id: "monthly-expenses",
        title: "What are your current monthly expenses?",
        description: "Your current monthly business costs",
        type: "text",
        field: "monthlyExpenses",
        placeholder: "e.g., $5,000",
      },
    ],
  },
  {
    id: "traction-milestones",
    title: "Traction & Milestones",
    description: "Share your achievements and upcoming goals",
    questions: [
      {
        id: "achievements",
        title: "What are your key achievements so far?",
        description: "Major milestones or accomplishments you've reached",
        type: "list",
        field: "achievements",
        placeholder: "e.g., Launched MVP with 50 beta users",
      },
      {
        id: "upcoming-milestone",
        title: "What's your next major milestone?",
        description: "The next big goal you're working towards",
        type: "textarea",
        field: "upcomingMilestone",
        placeholder: "e.g., Reach $10K MRR by end of quarter",
      },
    ],
  },
  {
    id: "extras",
    title: "Additional Information",
    description: "Any other important details for your business plan",
    questions: [
      {
        id: "notes",
        title: "Any additional notes or special considerations?",
        description: "Anything else you'd like to include in your business plan",
        type: "textarea",
        field: "notes",
        placeholder: "e.g., Special partnerships, unique challenges, regulatory considerations",
      },
    ],
  },
]

export function QuizInterface({ data, onChange, onGeneratePlan }: QuizInterfaceProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const currentSection = sections[currentSectionIndex]
  const progress = ((currentSectionIndex + 1) / sections.length) * 100

  // For long-text suggestion widget
  const [activeSuggestionField, setActiveSuggestionField] =
     useState<null | "visionStatement" | "shortTermGoal" | "longTermGoal" | "targetAudience">(null)

  // ✅ NEW: SWOT suggestions state
  const [swotSugg, setSwotSugg] = useState<{ strengths: string[]; weaknesses: string[] }>({
    strengths: [],
    weaknesses: [],
  })
  const [swotLoading, setSwotLoading] = useState(false)

  const handleNext = () => {
    if (currentSectionIndex < sections.length - 1) setCurrentSectionIndex(currentSectionIndex + 1)
  }
  const handlePrevious = () => {
    if (currentSectionIndex > 0) setCurrentSectionIndex(currentSectionIndex - 1)
  }
  const handleInputChange = (field: keyof BusinessPlanData, value: any) => onChange({ [field]: value })

  const addListItem = (field: keyof BusinessPlanData) => {
    const currentValue = (data[field] as string[]) || []
    onChange({ [field]: [...currentValue, ""] })
  }
  const removeListItem = (field: keyof BusinessPlanData, index: number) => {
    const currentValue = (data[field] as string[]) || []
    const newValue = currentValue.filter((_, i) => i !== index)
    onChange({ [field]: newValue })
  }
  const updateListItem = (field: keyof BusinessPlanData, index: number, value: string) => {
    const currentValue = (data[field] as string[]) || []
    const newValue = [...currentValue]
    newValue[index] = value
    onChange({ [field]: newValue })
  }
  const addKeyValueItem = (field: keyof BusinessPlanData) => {
    const currentValue = (data[field] as Array<{ item: string; amount: string }>) || []
    onChange({ [field]: [...currentValue, { item: "", amount: "" }] })
  }
  const removeKeyValueItem = (field: keyof BusinessPlanData, index: number) => {
    const currentValue = (data[field] as Array<{ item: string; amount: string }>) || []
    const newValue = currentValue.filter((_, i) => i !== index)
    onChange({ [field]: newValue })
  }
  const updateKeyValueItem = (
    field: keyof BusinessPlanData,
    index: number,
    itemField: "item" | "amount",
    value: string,
  ) => {
    const currentValue = (data[field] as Array<{ item: string; amount: string }>) || []
    const newValue = [...currentValue]
    newValue[index][itemField] = value
    onChange({ [field]: newValue })
  }

  // Owners & Founders helpers
  const addOwnerRow = () => {
    const owners = (data.ownership || []) as Array<{ name: string; role: string; ownershipPercent?: number }>
    onChange({ ownership: [...owners, { name: "", role: "", ownershipPercent: undefined }] })
  }
  const removeOwnerRow = (index: number) => {
    const owners = (data.ownership || []) as Array<{ name: string; role: string; ownershipPercent?: number }>
    onChange({ ownership: owners.filter((_, i) => i !== index) })
  }
  const updateOwnerRow = (index: number, field: "name" | "role" | "ownershipPercent", value: string) => {
    const owners = (data.ownership || []) as Array<{ name: string; role: string; ownershipPercent?: number }>
    const newOwners = [...owners]
    newOwners[index] = {
      ...newOwners[index],
      [field]: field === "ownershipPercent" ? (value === "" ? undefined : Number(value)) : value,
    }
    onChange({ ownership: newOwners })
  }

  const addFounderRow = () => {
    const founders = (data.founders || []) as Array<{ name: string; title: string; bio?: string; linkedinUrl?: string }>
    onChange({ founders: [...founders, { name: "", title: "", bio: "", linkedinUrl: "" }] })
  }
  const removeFounderRow = (index: number) => {
    const founders = (data.founders || []) as Array<{ name: string; title: string; bio?: string; linkedinUrl?: string }>
    onChange({ founders: founders.filter((_, i) => i !== index) })
  }
  const updateFounderRow = (
    index: number,
    field: "name" | "title" | "bio" | "linkedinUrl",
    value: string
  ) => {
    const founders = (data.founders || []) as Array<{ name: string; title: string; bio?: string; linkedinUrl?: string }>
    const newFounders = [...founders]
    newFounders[index] = { ...newFounders[index], [field]: value }
    onChange({ founders: newFounders })
  }

  const toggleMultiSelectOption = (field: keyof BusinessPlanData, option: string) => {
    const currentValue = (data[field] as string[]) || []
    const newValue = currentValue.includes(option)
      ? currentValue.filter((item) => item !== option)
      : [...currentValue, option]
    onChange({ [field]: newValue })
  }

  const isLastSection = currentSectionIndex === sections.length - 1
  const requiredQuestions = currentSection.questions.filter((q) => q.required)
  const canProceed = requiredQuestions.every((q) => {
    if (q.type === "products") {
      const prods = data.products || []
      return prods.length > 0 && prods.every((p) => (p.name || "").trim().length > 0)
    }
    // ✅ Require the first entry non-empty for SWOT lists
    if (q.field === "successDrivers" || q.field === "weaknesses") {
      const arr = ((data as any)[q.field] as string[] | undefined) || []
      return (arr[0] ?? "").trim().length > 0
    }
    const value = data[q.field]
    return typeof value === "string"
      ? value.trim().length > 0
      : Array.isArray(value)
        ? value.length > 0
        : true
  })

  // ────────────────────────────────────────────────────────────
  // Auto-load SWOT suggestions on entering the SWOT section
  // ────────────────────────────────────────────────────────────
  async function loadSwotSuggestions() {
    // Don’t hammer the server; keep it simple.
    if (swotLoading) return
    setSwotLoading(true)
    try {
      const res = await suggestSwot({ data })
      setSwotSugg({
        strengths: Array.isArray(res?.strengths) ? res.strengths.slice(0, 5) : [],
        weaknesses: Array.isArray(res?.weaknesses) ? res.weaknesses.slice(0, 5) : [],
      })
    } catch {
      // ignore — keep UI usable
    } finally {
      setSwotLoading(false)
    }
  }

  // Fire once when user navigates into the SWOT section (or on first render if we start there)
  useEffect(() => {
    if (currentSection.id === "swot-analysis" && swotSugg.strengths.length === 0 && swotSugg.weaknesses.length === 0) {
      loadSwotSuggestions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSectionIndex, currentSection.id])

  const renderQuestionInput = (question: Question) => {
    const currentValue = data[question.field]

    switch (question.type) {
      case "text":
        return (
          <Input
            value={currentValue as string}
            onChange={(e) => handleInputChange(question.field, e.target.value)}
            placeholder={question.placeholder}
            className="rounded-2xl text-base p-4 h-12"
          />
        )

      case "textarea": {
      const isVision   = question.field === "visionStatement"
      const isShort    = question.field === "shortTermGoal"
      const isMid      = question.field === "longTermGoal"
      const isAudience = question.field === "targetAudience"
      return (
        <>
          <Textarea
            value={currentValue as string}
            onChange={(e) => handleInputChange(question.field, e.target.value)}
            onFocus={() => {
              if (isVision || isShort || isMid || isAudience) {
                setActiveSuggestionField(question.field as any)
              }
            }}
            placeholder={question.placeholder}
            className="rounded-2xl text-base p-4 min-h-[100px]"
            rows={3}
          />

          {(isVision || isShort || isMid) && (
            <SuggestedChoices
              oneLiner={String(data.description || "")}
              businessModel={String(data.businessModel || "")}
              stage={String(data.businessStage || "")}
              target={
                isVision ? "longTermVision" :
                isMid    ? "midTermGoal"   :
                            "next12moGoal"
              }
              active={activeSuggestionField === question.field}
              onPick={(text) => handleInputChange(question.field, text)}
              className="mt-2"
            />
          )}

          {isAudience && (
            <SuggestedAudience
              data={data}
              active={activeSuggestionField === "targetAudience"}
              onPick={(text) => handleInputChange("targetAudience", text)}
              className="mt-2"
            />
          )}
        </>
      )
    }


      case "select":
        return (
          <Select value={currentValue as string} onValueChange={(value) => handleInputChange(question.field, value)}>
            <SelectTrigger className="rounded-2xl text-base p-4 h-12 bg-white">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl bg-white border shadow-lg">
              {question.options?.map((option) => (
                <SelectItem key={option} value={option.toLowerCase()} className="bg-white hover:bg-gray-50">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "multiselect":
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {question.options?.map((option) => (
                <Badge
                  key={option}
                  variant={(currentValue as string[]).includes(option) ? "default" : "outline"}
                  className={`cursor-pointer rounded-2xl px-4 py-2 text-sm transition-all duration-200 ${
                    (currentValue as string[]).includes(option)
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                      : "hover:border-orange-500 hover:text-orange-600"
                  }`}
                  onClick={() => toggleMultiSelectOption(question.field, option)}
                >
                  {option}
                </Badge>
              ))}
            </div>
          </div>
        )

      case "switch":
        return (
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
            <Switch
              checked={currentValue as boolean}
              onCheckedChange={(value) => handleInputChange(question.field, value)}
              className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-400"
            />
            <Label className="text-base">{currentValue ? "Yes" : "No"}</Label>
          </div>
        )

      case "list":
        return (
          <div className="space-y-4">
            {(currentValue as string[]).map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Input
                  value={item}
                  onChange={(e) => updateListItem(question.field, index, e.target.value)}
                  placeholder={`${question.placeholder} ${index + 1}`}
                  className="rounded-2xl text-base p-4 h-12"
                />
                {(currentValue as string[]).length > 1 && (
                  <Button
                    onClick={() => removeListItem(question.field, index)}
                    size="sm"
                    variant="outline"
                    className="rounded-xl h-12 w-12"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            <Button onClick={() => addListItem(question.field)} size="sm" variant="outline" className="rounded-xl">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>

            {/* ✅ Centered chips for SWOT suggestions (auto-loaded) */}
            {(question.field === "successDrivers" || question.field === "weaknesses") && (
              <div className="space-y-3 pt-2">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {(
                    question.field === "successDrivers"
                      ? swotSugg.strengths
                      : swotSugg.weaknesses
                  ).map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      className="rounded-full border px-4 py-2 text-sm shadow-sm hover:bg-gray-50 transition"
                      onClick={() => {
                        const arr = [...((data[question.field] as string[]) || [])]
                        const idx = arr.findIndex(v => !v?.trim())
                        if (idx >= 0) arr[idx] = s
                        else arr[0] = s
                        onChange({ [question.field]: arr })
                      }}
                      title="Use suggestion"
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-center pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl"
                    onClick={loadSwotSuggestions}
                    disabled={swotLoading}
                  >
                    {swotLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Regenerating…</> : "Regenerate Suggestions"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )

      case "keyvalue":
        return (
          <div className="space-y-3">
            {(currentValue as Array<{ item: string; amount: string }>).map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Input
                  value={item.item}
                  onChange={(e) => updateKeyValueItem(question.field, index, "item", e.target.value)}
                  placeholder={question.placeholder}
                  className="rounded-2xl text-base p-4 h-12 flex-1"
                />
                <Input
                  value={item.amount}
                  onChange={(e) => updateKeyValueItem(question.field, index, "amount", e.target.value)}
                  placeholder="Amount"
                  className="rounded-2xl text-base p-4 h-12 w-32"
                />
                {(currentValue as Array<{ item: string; amount: string }>).length > 1 && (
                  <Button
                    onClick={() => removeKeyValueItem(question.field, index)}
                    size="sm"
                    variant="outline"
                    className="rounded-xl h-12 w-12"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button onClick={() => addKeyValueItem(question.field)} size="sm" variant="outline" className="rounded-xl">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        )

      case "products": {
        const products = Array.isArray(data.products) ? data.products : []
        const updateProducts = (next: typeof products) => onChange({ products: next })
        const addProduct = () => updateProducts([...products, { name: "", features: [""], uniqueSellingPoint: "" }])
        const removeProduct = (idx: number) => {
          const next = [...products]; next.splice(idx, 1); updateProducts(next)
        }
        const updateProductField = (idx: number, key: "name" | "uniqueSellingPoint", value: string) => {
          const next = [...products]; next[idx] = { ...next[idx], [key]: value }; updateProducts(next)
        }
        const updateFeature = (pIdx: number, fIdx: number, value: string) => {
          const next = [...products]; next[pIdx].features[fIdx] = value; updateProducts(next)
        }
        const addFeature = (pIdx: number) => {
          const next = [...products]; next[pIdx].features = [...(next[pIdx].features || []), ""]; updateProducts(next)
        }
        const removeFeature = (pIdx: number, fIdx: number) => {
          const next = [...products]; next[pIdx].features.splice(fIdx, 1); if ((next[pIdx].features.length) === 0) next[pIdx].features = [""]; updateProducts(next)
        }

        return (
          <div className="space-y-6">
            {products.map((p, idx) => (
              <div key={idx} className="rounded-2xl border p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Product {idx + 1}</h4>
                  {products.length > 1 && (
                    <Button type="button" variant="link" className="px-0" onClick={() => removeProduct(idx)}>
                      Remove
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="font-medium">What’s your product called?</Label>
                  <Input
                    className="w-full rounded border px-3 py-2"
                    placeholder="WorkflowAI Platform"
                    value={p.name}
                    onChange={(e) => updateProductField(idx, "name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-medium">Key features</Label>
                  <div className="space-y-2">
                    {(p.features || [""]).map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2">
                        <Input
                          className="flex-1 rounded border px-3 py-2"
                          placeholder="e.g., Automated task scheduling"
                          value={feat}
                          onChange={(e) => updateFeature(idx, fIdx, e.target.value)}
                        />
                        {(p.features?.length ?? 0) > 1 && (
                          <Button type="button" variant="outline" size="sm" onClick={() => removeFeature(idx, fIdx)}>
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => addFeature(idx)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add feature
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="font-medium">What makes it unique?</Label>
                  <Textarea
                    className="w-full rounded border px-3 py-2"
                    rows={3}
                    placeholder="Learns from user behaviour…"
                    value={p.uniqueSellingPoint}
                    onChange={(e) => updateProductField(idx, "uniqueSellingPoint", e.target.value)}
                  />
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addProduct} className="rounded-xl">
              <Plus className="h-4 w-4 mr-2" />
              Add another product
            </Button>
          </div>
        )
      }

      case "owners": {
        const owners = (data.ownership || []) as Array<{ name: string; role: string; ownershipPercent?: number }>
        const totalPct = owners.reduce((s, o) => s + (Number(o.ownershipPercent) || 0), 0)
        const showSumError = owners.some(o => typeof o.ownershipPercent === "number") && Math.abs(totalPct - 100) > 0.5

        return (
          <div className="space-y-3">
            {owners.map((o, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <Input
                  className="md:col-span-4 rounded-2xl h-12"
                  placeholder="Owner name"
                  value={o.name}
                  onChange={(e) => updateOwnerRow(idx, "name", e.target.value)}
                />
                <Input
                  className="md:col-span-5 rounded-2xl h-12"
                  placeholder="Role / Title"
                  value={o.role}
                  onChange={(e) => updateOwnerRow(idx, "role", e.target.value)}
                />
                <Input
                  className="md:col-span-2 rounded-2xl h-12"
                  placeholder="%"
                  value={o.ownershipPercent ?? ""}
                  onChange={(e) => updateOwnerRow(idx, "ownershipPercent", e.target.value)}
                />
                {owners.length > 1 && (
                  <Button variant="outline" size="sm" className="md:col-span-1 h-12 rounded-xl" onClick={() => removeOwnerRow(idx)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="rounded-xl" onClick={addOwnerRow}>
                <Plus className="h-4 w-4 mr-1" /> Add Owner
              </Button>
              <div className={`text-sm ${showSumError ? "text-red-600" : "text-gray-500"}`}>
                {showSumError ? `Ownership percentages must total 100%. Current total: ${totalPct}%` :
                  `If you provide equity %, the total must equal 100%. Current total: ${totalPct || 0}%`}
              </div>
            </div>
          </div>
        )
      }

      case "founders": {
        const founders = (data.founders || []) as Array<{ name: string; title: string; bio?: string; linkedinUrl?: string }>
        return (
          <div className="space-y-3">
            {founders.map((f, idx) => (
              <div key={idx} className="space-y-2 p-3 border rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <Input
                    className="md:col-span-4 rounded-2xl h-12"
                    placeholder="Founder name"
                    value={f.name}
                    onChange={(e) => updateFounderRow(idx, "name", e.target.value)}
                  />
                  <Input
                    className="md:col-span-4 rounded-2xl h-12"
                    placeholder="Title (e.g., Co-Founder & CTO)"
                    value={f.title}
                    onChange={(e) => updateFounderRow(idx, "title", e.target.value)}
                  />
                  <Input
                    className="md:col-span-4 rounded-2xl h-12"
                    placeholder="LinkedIn URL (optional)"
                    value={f.linkedinUrl || ""}
                    onChange={(e) => updateFounderRow(idx, "linkedinUrl", e.target.value)}
                  />
                </div>
                <Textarea
                  className="w-full rounded-2xl"
                  placeholder="Short bio (optional)"
                  value={f.bio || ""}
                  onChange={(e) => updateFounderRow(idx, "bio", e.target.value)}
                />
                {founders.length > 1 && (
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => removeFounderRow(idx)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" className="rounded-xl" onClick={addFounderRow}>
              <Plus className="h-4 w-4 mr-1" /> Add Founder
            </Button>
          </div>
        )
      }

      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Section {currentSectionIndex + 1} of {sections.length}
            </span>
            <span className="text-sm font-medium text-gray-600">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Section Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-xl rounded-3xl bg-white">
            <CardHeader className="text-center pb-6">
              <div className="mb-4">
                <Badge variant="outline" className="rounded-2xl px-4 py-2 text-sm font-medium">
                  {currentSection.title}
                </Badge>
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 leading-tight">{currentSection.title}</CardTitle>
              <p className="text-gray-600 mt-2 text-lg">{currentSection.description}</p>
            </CardHeader>
            <CardContent className="space-y-8">
              {currentSection.questions.map((question) => (
                <div key={question.id} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Label className="text-lg font-semibold text-gray-900">
                        {question.title}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {question.description && <p className="text-gray-600 mt-1 text-sm">{question.description}</p>}
                    </div>
                  </div>
                  <div className="mt-3">{renderQuestionInput(question)}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Button
            onClick={handlePrevious}
            disabled={currentSectionIndex === 0}
            variant="outline"
            className="rounded-2xl px-6 py-3 font-semibold"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous Section
          </Button>

          {isLastSection ? (
            <Button
              onClick={onGeneratePlan}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl px-8 py-3 font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Generate My Plan
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl px-6 py-3 font-semibold"
            >
              Next Section
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
