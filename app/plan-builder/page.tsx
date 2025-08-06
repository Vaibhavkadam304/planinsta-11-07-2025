"use client"

import { useState, useEffect } from "react"
import { PlanBuilderTopBar } from "@/components/plan-builder/top-bar"
import { QuizInterface } from "@/components/plan-builder/quiz-interface"
import { GenerationScreen } from "@/components/plan-builder/generation-screen"
import { PlanOutput } from "@/components/plan-builder/plan-output"
import { EditSectionModal } from "@/components/plan-builder/edit-section-modal"
import { UnsavedChangesModal } from "@/components/plan-builder/unsaved-changes-modal"
import { useToast } from "@/hooks/use-toast"
import { generateBusinessPlan, GenerateBusinessPlanResult } from "@/app/actions/generate-plan"
import { useSession } from "@supabase/auth-helpers-react"
import { useRouter, useSearchParams } from "next/navigation"
import * as htmlDocx from "html-docx-js/dist/html-docx"
import { exportBusinessPlanDocx } from "@/app/utils/exportDocx"
import { saveAs } from "file-saver";
import Link from "next/link"
import { ManualEditModal } from "@/components/plan-builder/manual-edit-modal"

import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
} from "docx"

import ReactMarkdown from "react-markdown"


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

// export interface GeneratedPlan {
//   executiveSummary: string
//   marketAnalysis: string
//   productStrategy: string
//   marketingStrategy: string
//   operationsStrategy: string
//   financialProjections: string
//   milestonesAndTraction: string
//   additionalNotes: string
// }
// after
export interface GeneratedPlan {
  coverPage: {
    logo: string
  }
  executiveSummary: {
    businessOverview: string
    fundingRequirementsUsageOfFunds: string
    pastMilestones: string
    problemStatementSolution: string
  }
  companyOverview: {
    visionStatement: string
    missionStatement: string
    companyHistoryBackground: string
    foundingTeam: string
    legalStructureOwnership: string
    coreValuesCulture: string
    companyObjectives: string
  }
  products: {
    overview: string
    product1: string
    product2: string
    product3: string
    product4: string
    product5: string
    product6: string
    product7: string
    product8: string
    product9: string
    product10: string
    uniqueSellingPropositions: string
    developmentRoadmap: string
    intellectualPropertyRegulatoryStatus: string
  }
  marketAnalysis: {
    industryOverviewSize: string
    growthTrendsDrivers: string
    underlyingBusinessDrivers: string
    targetMarketSegmentation: string
    customerPersonasNeeds: string
    competitiveLandscapePositioning: string
    productsDifferentiation: string
    barriersToEntry: string
  }
  marketingSalesStrategies: {
    distributionChannels: string
    technologyCostStructure: string
    customerPricingStructure: string
    retentionStrategies: string
    integratedFunnelFinancialImpact: string
  }
  operationsPlan: {
    overview: string
    organizationalStructureTeamResponsibilities: string
    infrastructure: string
    customerOnboardingToRenewalWorkflow: string
    crossFunctionalCommunicationDecisionMaking: string
    keyPerformanceMetricsGoals: string
  }
  managementOrganization: {
    overview: string
    organizationalChart: string
    hiringPlanKeyRoles: string
  }
  financialPlan: {
    overview: string
    keyAssumptions: string

    // <-- changed these from `string` to arrays of objects:
    revenueForecast: Array<{
      period: string
      amount: string
    }>
    cogs: Array<{
      period: string
      amount: string
    }>
    opEx: Array<{
      period: string
      amount: string
    }>
    projectedPnl: Array<{
      period: string
      grossProfit: string
      ebitda: string
      netIncome: string
    }>
    cashFlowRunwayAnalysis: Array<{
      period: string
      beginningCash: string
      inflows: string
      outflows: string
      endingCash: string
      runwayMonths: string
    }>

    keyFinancialMetricsRatios: string
    useOfFundsRunway: string
    keySensitivityRiskScenarios: string
    summaryOutlook: string
  }
  riskAnalysisMitigation: {
    overview: string
    marketRisks: string
    operationalRisks: string
    regulatoryLegalRisks: string
    financialRisks: string
    contingencyPlans: string
  }
  appendices: {
    glossary: string
    managementTeamsResources: string
    projectedFinancesTables: string
  }
}



type PlanBuilderStage = "quiz" | "generating" | "output"

/* -------------------------------------------------------------------------- */
/*                                Component                                   */
/* -------------------------------------------------------------------------- */

export default function PlanBuilderClient() {
  
  const session = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()


  const [hasRedirectedForPayment, setHasRedirectedForPayment] = useState(false)
  // const [planTitle,          setPlanTitle]         = useState("Untitled Business Plan")
  const [planId,             setPlanId]            = useState<string | null>(null)
  const [stage,              setStage]             = useState<PlanBuilderStage>("quiz")
  const [planData,           setPlanData]          = useState<BusinessPlanData>({
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
  const [generatedPlan,      setGeneratedPlan]     = useState<GeneratedPlan | null>(null)
  const [editingSection,     setEditingSection]    = useState<string | null>(null)
  const [manualEditingSection, setManualEditingSection] = useState<string | null>(null)
  const [manualEditingSubsection, setManualEditingSubsection] = useState<string | null>(null)
  const [manualEditedContent, setManualEditedContent] = useState<string>("")
  const [showUnsavedModal,   setShowUnsavedModal]  = useState(false)
  const [hasUnsavedChanges,  setHasUnsavedChanges] = useState(false)

  // ───── PAYMENT‐RETURN EFFECT ─────
  useEffect(() => {
    if (searchParams.get("paid") === "true" && !hasRedirectedForPayment) {
      setHasRedirectedForPayment(true);

      const raw = sessionStorage.getItem("planData");
      if (!raw) return;

      const restored = JSON.parse(raw) as BusinessPlanData;

      // 1) Restore UI state
      setPlanData(restored);
      // 2) Kick off generation with the right businessName
      _reallyGeneratePlan(restored);
    }
  }, [searchParams, hasRedirectedForPayment]);



  // ─── SESSION GUARD EFFECT ───
  useEffect(() => {
    if (session === null) router.replace("/auth/signin")
  }, [session, router])

  // ─────── EARLY RETURN ───────
  if (session === undefined || session === null) return null

  // ─────── HELPERS & HANDLERS ───────
  async function _reallyGeneratePlan(overrideData?: BusinessPlanData) {
    // If overrideData is passed, use it; otherwise fall back to current state + title
    const dataToUse = overrideData ?? planData

    setStage("generating")
    try {
      console.log("▶️ Sending planData to server action:", dataToUse)
      const result = await generateBusinessPlan(dataToUse)

      if (!result.success) {
        throw new Error(result.error)
      }

      // At this point TS knows result.success === true, so planId must exist
      setPlanId(result.planId)
      setGeneratedPlan(result.plan)
      console.log("📝 GeneratedPlan JSON:", JSON.stringify(result.plan, null, 2))

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


  /* ------------------------------ Handlers -------------------------------- */
  console.log("🔧 PlanBuilderPage mounted, initial planData:", planData)
  async function handleGeneratePlan() {
      // 1️⃣ stash quiz answers so we can restore after payment
      sessionStorage.setItem("planData", JSON.stringify(planData))

      // 2️⃣ always redirect to payment
      router.replace("/plan-builder/payment-info")
    }




  // ←────────────────── ADD YOUR SAVE HANDLER ───────────────────
  async function handleSavePlan() {
    if (!planId) return toast({ variant: "destructive", title: "No plan to save." });

    const res = await fetch(`/api/plans/${planId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(planData),
    });

    const { success, error } = await res.json();
    if (success) {
      toast({ title: "Plan updated!" });
      setHasUnsavedChanges(false);
    } else {
      toast({ variant: "destructive", title: "Save failed", description: error });
    }
  }


 function handleDataChange(newData: Partial<BusinessPlanData>) {
    setPlanData(prev => {
      const updated = { ...prev, ...newData }
      sessionStorage.setItem("planData", JSON.stringify(updated))
      return updated
    })
  }



  const handleSectionEdit = async (sectionKey: string, newContent: string) => {
    if (!planId || !generatedPlan) return

    // 1) update local state
    // const updatedPlan = { ...generatedPlan, [sectionKey]: newContent }
    const rawSection = (generatedPlan as any)[sectionKey];
    let updatedSectionValue: any;
    if (typeof rawSection === "object") {
      // Remove ```json and ``` fences if OpenAI wrapped the JSON
      let text = (newContent as string).trim();
      if (text.startsWith("```")) {
        // drop first ```json line, drop trailing ```
        text = text
          .replace(/^```(?:json)?\n/, "")
          .replace(/\n```$/, "")
          .trim();
      }
      updatedSectionValue = JSON.parse(text);
    } else {
      updatedSectionValue = newContent;
    }
    const updatedPlan = {
      ...generatedPlan,
      [sectionKey]: updatedSectionValue,
    };

    setGeneratedPlan(updatedPlan)
    setEditingSection(null)

    // 2) fire off the PATCH to /api/plans/[planId]
    const res = await fetch(`/api/plans/${planId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedPlan),
    })
    const { success, error } = await res.json()

    // 3) show feedback
    if (!success) {
      toast({
        variant: "destructive",
        title: "Save failed",
        description: error || "Unable to persist your changes.",
      })
    } else {
      toast({
        title: "Section Updated",
        description: "Your edits have been saved to the database.",
      })
    }
  }

  // Helper to Upper-case the first letter of each word
  function capitalizeWords(str: string): string {
    return str.replace(/\b\w/g, (char) => char.toUpperCase())
  }
// ← under your other handlers in PlanBuilderClient()
  async function handleManualSave(sectionKey: string, newText: string) {
    if (!planId || !generatedPlan) return
    // 1) merge into state
    const updatedPlan = { ...generatedPlan, [sectionKey]: newText }
    setGeneratedPlan(updatedPlan)
    setManualEditingSection(null)
    setManualEditedContent("")
    // 2) persist to API
    await fetch(`/api/plans/${planId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedPlan),
    })
  }


const handleDownload = () => {
  if (generatedPlan) {
    exportBusinessPlanDocx(planData, generatedPlan)
  }
}

// 2️⃣ Next, add two helper handlers:
function handleStartManualEdit(sectionKey: string, subKey: string) {
  setManualEditingSection(sectionKey)
  setManualEditingSubsection(subKey)
  // pull in the current content for that one sub‐section
  const raw = (generatedPlan as any)[sectionKey][subKey]
  setManualEditedContent(typeof raw === "string" ? raw : JSON.stringify(raw, null, 2))
}

async function handleSaveSubsection(
  sectionKey: string,
  subKey: string,
  newContent: string
) {
  // 1) Optimistically update UI
  setGeneratedPlan((p) => ({
    ...p!,
    [sectionKey]: {
      ...(p! as any)[sectionKey],
      [subKey]:
        typeof (p! as any)[sectionKey][subKey] === "object"
          ? JSON.parse(newContent)
          : newContent,
    },
  }))
  // 2) Persist to your API
  await fetch(`/api/plans/${planId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      [sectionKey]: {
        ...((generatedPlan as any)[sectionKey]),
        [subKey]:
          typeof (generatedPlan as any)[sectionKey][subKey] === "object"
            ? JSON.parse(newContent)
            : newContent,
      },
    }),
  })
  // 3) Clear edit state
  setManualEditingSection(null)
  setManualEditingSubsection(null)
  setManualEditedContent("")
}




const handleBackToDashboard = () => {
  if (hasUnsavedChanges && stage === "quiz") {
    setShowUnsavedModal(true)
  } else {
    router.push("/dashboard")    // or whatever your real dashboard path is
  }
}

const rawValue =
  editingSection && generatedPlan
    ? (generatedPlan as any)[editingSection]
    : ""
const sectionText =
  typeof rawValue === "object"
    ? JSON.stringify(rawValue, null, 2)
    : (rawValue as string)

  /* ----------------------------------------------------------------------- */

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Top Bar */}
     

      <div className="flex-1 overflow-y-auto">
        {/* Quiz Stage */}
        {stage === "quiz" && (
          <QuizInterface
            data={planData}
            onChange={handleDataChange}
            onGeneratePlan={handleGeneratePlan}
          />
        )}

        {/* Generating Stage */}
        {stage === "generating" && (
          <GenerationScreen
            businessName={planData.businessName || "Your Business"}
          />
        )}

        {/* Output Stage */}
        {stage === "output" && generatedPlan && (
          <div id="plan-container">
            {/* <h1>{planData.businessName} — Business Plan</h1> */}
             <PlanOutput
                planData={planData}
                generatedPlan={generatedPlan}
                onEditSection={setEditingSection}       // your AI‐edit button

                // 🔥 inline edit props
                manualEditingSection={manualEditingSection}
                manualEditingSubsection={manualEditingSubsection}
                manualEditedContent={manualEditedContent}
                onManualStartEdit={handleStartManualEdit}
                onManualEditedContentChange={setManualEditedContent}
                onManualSaveSubsection={handleSaveSubsection}
                onManualCancel={() => {
                  setManualEditingSection(null)
                  setManualEditingSubsection(null)
                  setManualEditedContent("")
                }}

                onDownload={handleDownload}
              />
          </div>
        )}
      </div>

      {/* Chat Edit Modal */}
      <EditSectionModal
        isOpen={!!editingSection}
        onClose={() => setEditingSection(null)}
        sectionName={editingSection || ""}
        currentContent={
          editingSection && typeof (generatedPlan as any)[editingSection] === "object"
            ? JSON.stringify((generatedPlan as any)[editingSection], null, 2)
            : (sectionText as string)
        }
        onSave={(sectionKey, newContent) => void handleSectionEdit(sectionKey, newContent)}
      />

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onClose={() => setShowUnsavedModal(false)}
        onSave={() => {
          setHasUnsavedChanges(false);
          setShowUnsavedModal(false);
          window.history.back();
        }}
        onDiscard={() => {
          setShowUnsavedModal(false);
          window.history.back();
        }}
      />
    </div>
  );
}
