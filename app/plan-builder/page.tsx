"use client"

import { useState, useEffect } from "react"
import { PlanBuilderTopBar } from "@/components/plan-builder/top-bar"
import { QuizInterface } from "@/components/plan-builder/quiz-interface"
import { GenerationScreen } from "@/components/plan-builder/generation-screen"
import { PlanOutput } from "@/components/plan-builder/plan-output"
import { ChatEditModal } from "@/components/plan-builder/chat-edit-modal"
import { UnsavedChangesModal } from "@/components/plan-builder/unsaved-changes-modal"
import { useToast } from "@/hooks/use-toast"
import { generateBusinessPlan } from "@/app/actions/generate-plan"
import { useSession } from "@supabase/auth-helpers-react"
import { useRouter } from "next/navigation"


/* -------------------------------------------------------------------------- */
/*                               Local Types                                  */
/* -------------------------------------------------------------------------- */

export interface BusinessPlanData {
  // Business Basics
  businessName: string
  description: string
  businessModel: string
  businessStage: string

  // Vision & Goals
  visionStatement: string
  shortTermGoal: string
  longTermGoal: string

  // Target Market
  targetAudience: string
  location: string
  marketSize: string

  // Product/Service
  productName: string
  keyFeatures: string[]
  uniqueSellingPoint: string

  // Marketing & Sales
  marketingChannels: string[]
  pricingStrategy: string
  hasSalesTeam: boolean

  // Operations & Team
  operationLocation: string
  legalStructure: string
  teamSize: string
  founderRole: string

  // Financial Info
  initialInvestment: string
  investmentUtilization: Array<{ item: string; amount: string }>
  fundingReceived: string
  fundingNeeded: string
  fundingUseBreakdown: Array<{ item: string; amount: string }>
  monthlyRevenue: string
  monthlyExpenses: string

  // Traction & Milestones
  achievements: string[]
  upcomingMilestone: string

  // Extras
  notes: string
}

export interface GeneratedPlan {
  executiveSummary: string
  marketAnalysis: string
  productStrategy: string
  marketingStrategy: string
  operationsStrategy: string
  financialProjections: string
  milestonesAndTraction: string
  additionalNotes: string
}

type PlanBuilderStage = "quiz" | "generating" | "output"

/* -------------------------------------------------------------------------- */
/*                                Component                                   */
/* -------------------------------------------------------------------------- */

export default function PlanBuilderClient() {
  
  const session = useSession();
  const router = useRouter();

  // Redirect to sign-in if there’s no active session
  useEffect(() => {
    if (session === null) {
      router.replace("/auth/signin");
    }
  }, [session, router]);

  // While session is loading (undefined), or if signed out (null), render nothing
  if (session === undefined || session === null) return null;

  const [planTitle, setPlanTitle] = useState("Untitled Business Plan")
  const [stage, setStage] = useState<PlanBuilderStage>("quiz")
  const [planData, setPlanData] = useState<BusinessPlanData>({
    businessName: "",
    description: "",
    businessModel: "",
    businessStage: "",
    visionStatement: "",
    shortTermGoal: "",
    longTermGoal: "",
    targetAudience: "",
    location: "",
    marketSize: "",
    productName: "",
    keyFeatures: [""],
    uniqueSellingPoint: "",
    marketingChannels: [],
    pricingStrategy: "",
    hasSalesTeam: false,
    operationLocation: "",
    legalStructure: "",
    teamSize: "",
    founderRole: "",
    initialInvestment: "",
    investmentUtilization: [{ item: "", amount: "" }],
    fundingReceived: "",
    fundingNeeded: "",
    fundingUseBreakdown: [{ item: "", amount: "" }],
    monthlyRevenue: "",
    monthlyExpenses: "",
    achievements: ["", ""],
    upcomingMilestone: "",
    notes: "",
  })

  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [showUnsavedModal, setShowUnsavedModal] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const { toast } = useToast()

  /* ------------------------------ Handlers -------------------------------- */
  console.log("🔧 PlanBuilderPage mounted, initial planData:", planData)
  const handleDataChange = (newData: Partial<BusinessPlanData>) => {
    console.log("✏️ User updated:", newData)
    setPlanData((prev) => ({ ...prev, ...newData }))
    setHasUnsavedChanges(true)
  }

  const handleGeneratePlan = async () => {
  // 1️⃣ Kick off loading state
    console.log("⏳ Stage → generating")
    setStage("generating")

    try {
      // 2️⃣ Log the payload
      console.log("▶️ Sending planData to server action:", planData)

      // 3️⃣ Call your Server Action
      const result = await generateBusinessPlan(planData)

      // 4️⃣ Inspect the result
      console.log("◀️ Server action result:", result)
      if (!result.success) throw new Error(result.error)

      // 5️⃣ Push into state & UI
      setGeneratedPlan(result.plan)
      console.log("✅ Stage → output")
      setStage("output")
      setHasUnsavedChanges(false)

      toast({
        title: "Plan Generated Successfully!",
        description: "Your business plan is ready for review and download.",
      })
    } catch (err: any) {
      console.error("❌ generateBusinessPlan failed:", err)
      setStage("quiz")
      toast({
        variant: "destructive",
        title: "Plan Generation Failed",
        description: err.message,
      })
    }
  }


  const handleSectionEdit = (sectionKey: string, newContent: string) => {
    if (generatedPlan) {
      setGeneratedPlan((prev) =>
        prev
          ? {
              ...prev,
              [sectionKey]: newContent,
            }
          : null,
      )
      setEditingSection(null)
      toast({
        title: "Section Updated",
        description: "Your changes have been applied to the plan.",
      })
    }
  }

  const handleDownload = () => {
    toast({
      title: "Downloading Plan...",
      description: "Your business plan is being prepared as a DOCX file.",
    })
    // TODO: Implement DOCX download logic
  }

  const handleBackToDashboard = () => {
    if (hasUnsavedChanges && stage === "quiz") {
      setShowUnsavedModal(true)
    } else {
      window.history.back()
    }
  }

  /* ----------------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-gray-50">
      <PlanBuilderTopBar
        planTitle={planTitle}
        onTitleChange={setPlanTitle}
        stage={stage}
        onDownload={stage === "output" ? handleDownload : undefined}
        onBackToDashboard={handleBackToDashboard}
      />

      <div className="h-[calc(100vh-80px)]">
        {stage === "quiz" && (
          <QuizInterface data={planData} onChange={handleDataChange} onGeneratePlan={handleGeneratePlan} />
        )}

        {stage === "generating" && <GenerationScreen businessName={planData.businessName || "Your Business"} />}

        {stage === "output" && generatedPlan && (
          <PlanOutput
            planData={planData}
            generatedPlan={generatedPlan}
            onEditSection={setEditingSection}
            onDownload={handleDownload}
          />
        )}
      </div>

      {/* Chat Edit Modal */}
      <ChatEditModal
        isOpen={!!editingSection}
        onClose={() => setEditingSection(null)}
        sectionName={editingSection || ""}
        currentContent={editingSection && generatedPlan ? generatedPlan[editingSection as keyof GeneratedPlan] : ""}
        onSave={(newContent) => editingSection && handleSectionEdit(editingSection, newContent)}
      />

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onClose={() => setShowUnsavedModal(false)}
        onSave={() => {
          setHasUnsavedChanges(false)
          setShowUnsavedModal(false)
          window.history.back()
        }}
        onDiscard={() => {
          setShowUnsavedModal(false)
          window.history.back()
        }}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                       Helper functions (local mock AI)                      */
/* -------------------------------------------------------------------------- */

function generateExecutiveSummary(data: BusinessPlanData): string {
  const businessName = data.businessName || "Your Business"
  const businessModel = data.businessModel || "business"
  const description = data.description || "innovative solution"
  const location = data.location || "target market"
  const teamSize = data.teamSize || "dedicated team"
  const revenue = data.monthlyRevenue || "projected revenue"

  return `${businessName} is ${
    businessModel === "saas"
      ? "a Software-as-a-Service (SaaS)"
      : businessModel === "d2c"
        ? "a Direct-to-Consumer (D2C)"
        : businessModel === "services"
          ? "a professional services"
          : businessModel === "marketplace"
            ? "a marketplace"
            : "an innovative"
  } business focused on ${description.toLowerCase()}. ${
    location ? `Operating primarily in ${location}, ` : ""
  }we are positioned to capture significant market share through our unique value proposition and strategic approach.

Our business is currently in the ${data.businessStage || "development"} stage, with ${
    teamSize ? `a ${teamSize}` : "a dedicated team"
  } committed to delivering exceptional value to our customers. ${
    data.visionStatement
      ? `Our vision is to ${data.visionStatement.toLowerCase()}`
      : "We are driven by a clear vision for growth and market leadership."
  } 

${
  data.uniqueSellingPoint
    ? `What sets us apart is ${data.uniqueSellingPoint.toLowerCase()}.`
    : "Our competitive advantage lies in our innovative approach and customer-centric focus."
} ${
    revenue ? `With current monthly revenue of ${formatCurrency(revenue)}, ` : ""
  }we are well-positioned for sustainable growth and expansion.`
}

function generateMarketAnalysis(data: BusinessPlanData): string {
  const targetAudience = data.targetAudience || "target customers"
  const location = data.location || "our target market"
  const marketSize = data.marketSize || "significant market opportunity"

  return `Our target market consists of ${targetAudience.toLowerCase()}${
    location ? ` primarily located in ${location}` : ""
  }. ${
    marketSize ? `The market size is estimated at ${marketSize}, ` : ""
  }representing a substantial opportunity for growth and market penetration.

Market research indicates strong demand for ${
    data.productName || "our solution"
  }, particularly among ${targetAudience.toLowerCase()}. Key market trends supporting our business include the increasing adoption of ${
    data.businessModel === "saas"
      ? "cloud-based solutions"
      : data.businessModel === "d2c"
        ? "direct-to-consumer purchasing"
        : data.businessModel === "services"
          ? "professional services"
          : "innovative business models"
  } and the growing need for ${data.description || "our type of solution"}.

The competitive landscape presents both challenges and opportunities. While there are established players in the market, our unique positioning and ${
    data.uniqueSellingPoint || "innovative approach"
  } provide significant competitive advantages that will enable us to capture market share effectively.`
}

function generateProductStrategy(data: BusinessPlanData): string {
  const productName = data.productName || "Our Solution"
  const features =
    data.keyFeatures.filter((f) => f.trim()).length > 0
      ? data.keyFeatures.filter((f) => f.trim())
      : ["Core functionality", "User-friendly interface", "Scalable architecture"]
  const usp = data.uniqueSellingPoint || "innovative approach to solving customer problems"

  return `${productName} is designed to ${
    data.description || "deliver exceptional value to our customers"
  }. Our solution addresses key market needs through a comprehensive approach that combines functionality, usability, and innovation.

**Key Features:**
${features.map((feature) => `• ${feature}`).join("\n")}

**Product Differentiation:**
${usp}. This unique positioning allows us to stand out in a competitive market and provide superior value to our customers.

**Development Roadmap:**
Our product development strategy focuses on continuous improvement and feature enhancement based on customer feedback and market demands. We plan to ${
    data.shortTermGoal
      ? `achieve ${data.shortTermGoal.toLowerCase()} in the short term`
      : "expand our feature set significantly"
  } while maintaining our core value proposition.`
}

function generateMarketingStrategy(data: BusinessPlanData): string {
  const channels =
    data.marketingChannels.length > 0
      ? data.marketingChannels
      : ["Digital Marketing", "Content Marketing", "Social Media"]
  const pricing = data.pricingStrategy || "competitive pricing"
  const salesTeam = data.hasSalesTeam

  return `Our marketing strategy is built around a multi-channel approach designed to reach ${
    data.targetAudience || "our target customers"
  } effectively and efficiently.

**Marketing Channels:**
${channels
  .map((channel) => `• ${channel}: Targeted campaigns to reach potential customers through ${channel.toLowerCase()}`)
  .join("\n")}

**Pricing Strategy:**
We have adopted a ${pricing} model that provides excellent value while ensuring sustainable profitability. Our pricing is competitive within the market while reflecting the premium value we deliver.

**Sales Approach:**
${
  salesTeam
    ? "Our dedicated sales team will focus on building relationships with key prospects and converting leads into customers."
    : "We will leverage a self-service sales model complemented by strong marketing automation and customer success initiatives."
} This approach ensures efficient customer acquisition while maintaining high conversion rates.

**Customer Acquisition:**
Our customer acquisition strategy focuses on ${
    data.marketingChannels.includes("SEO") ? "organic search visibility, " : ""
  }${data.marketingChannels.includes("Ads") ? "targeted advertising, " : ""}${
    data.marketingChannels.includes("Social Media") ? "social media engagement, " : ""
  }${
    data.marketingChannels.includes("Referrals") ? "referral programs" : "content marketing"
  } to build a sustainable pipeline of qualified prospects.`
}

function generateOperationsStrategy(data: BusinessPlanData): string {
  const location = data.operationLocation || "strategic location"
  const legalStructure = data.legalStructure || "appropriate legal structure"
  const teamSize = data.teamSize || "right-sized team"
  const founderRole = data.founderRole || "leadership role"

  return `Our operations strategy is designed to ensure efficient delivery of our products/services while maintaining high quality standards and customer satisfaction.

**Operational Structure:**
We operate from ${location} under a ${legalStructure} legal structure. Our ${teamSize} is strategically organized to maximize efficiency and expertise across all business functions.

**Key Operational Areas:**
• **Leadership:** ${
    founderRole ? `Led by our ${founderRole}, ` : ""
  }our management team brings extensive experience and expertise to drive business success  
• **Quality Control:** Rigorous quality assurance processes ensure consistent delivery of high-quality products/services  
• **Technology Infrastructure:** Robust systems and processes support scalable operations and efficient service delivery  
• **Customer Support:** Dedicated customer success initiatives ensure high satisfaction and retention rates

**Operational Efficiency:**
We focus on continuous improvement and optimization of our operational processes. This includes regular performance monitoring, process refinement, and technology upgrades to maintain competitive advantage and operational excellence.`
}

function generateFinancialProjections(data: BusinessPlanData): string {
  const initialInvestment = data.initialInvestment || "startup capital"
  const monthlyRevenue = data.monthlyRevenue || "0"
  const monthlyExpenses = data.monthlyExpenses || "0"
  const fundingNeeded = data.fundingNeeded || "additional funding"

  const revenue = Number.parseFloat(monthlyRevenue.replace(/[$,]/g, "")) || 0
  const expenses = Number.parseFloat(monthlyExpenses.replace(/[$,]/g, "")) || 0
  const annualRevenue = revenue * 12
  const annualExpenses = expenses * 12
  const grossMargin = revenue > 0 ? (((revenue - expenses) / revenue) * 100).toFixed(1) : "0"

  return `Our financial projections demonstrate strong growth potential and path to profitability based on conservative market assumptions and operational efficiency.

**Current Financial Position:**
• Monthly Revenue: ${formatCurrency(monthlyRevenue)}  
• Monthly Expenses: ${formatCurrency(monthlyExpenses)}  
• Gross Margin: ${grossMargin}%  
• Annual Revenue Projection: ${formatCurrency(annualRevenue.toString())}

**Investment Requirements:**
• Initial Investment: ${formatCurrency(initialInvestment)}  
${data.fundingNeeded ? `• Additional Funding Needed: ${formatCurrency(fundingNeeded)}` : ""}

**Investment Utilization:**
${
  data.investmentUtilization.filter((item) => item.item.trim()).length > 0
    ? data.investmentUtilization
        .filter((item) => item.item.trim())
        .map((item) => `• ${item.item}: ${formatCurrency(item.amount)}`)
        .join("\n")
    : "• Product Development: 40%\n• Marketing & Sales: 30%\n• Operations: 20%\n• Working Capital: 10%"
}

**Growth Projections:**
Based on market analysis and operational capacity, we project ${
    data.businessStage === "growth" ? "25-35%" : data.businessStage === "early-revenue" ? "50-75%" : "100-200%"
  } annual growth over the next 3 years, driven by market expansion and operational scaling.`
}

function generateMilestonesAndTraction(data: BusinessPlanData): string {
  const achievements =
    data.achievements.filter((a) => a.trim()).length > 0 ? data.achievements.filter((a) => a.trim()) : []
  const upcomingMilestone = data.upcomingMilestone || "key business objectives"

  return `${
    achievements.length > 0
      ? "Our track record demonstrates consistent progress and achievement of key business milestones."
      : "We are focused on achieving key milestones that will drive business growth and market success."
  }

${
  achievements.length > 0
    ? `**Key Achievements:**\n${achievements
        .map((achievement) => `• ${achievement}`)
        .join(
          "\n",
        )}\n\nThese achievements validate our business model and demonstrate our ability to execute on our strategic vision.`
    : ""
}

**Upcoming Milestones:**  
${
  upcomingMilestone
    ? upcomingMilestone
    : "Our immediate focus is on achieving product-market fit, scaling our customer base, and establishing sustainable revenue growth. Key milestones include customer acquisition targets, product development goals, and operational efficiency improvements."
}

**Success Metrics:**  
We track key performance indicators including customer acquisition cost, lifetime value, monthly recurring revenue${
    data.businessModel === "saas" ? ", churn rate" : ""
  }, and customer satisfaction scores to ensure we are meeting our growth objectives and maintaining operational excellence.`
}

function formatCurrency(value: string): string {
  if (!value) return "Not specified"
  return value.startsWith("$") ? value : `$${value}`
}
