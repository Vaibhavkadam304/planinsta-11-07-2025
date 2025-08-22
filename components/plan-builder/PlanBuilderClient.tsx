"use client"

import { useState, useEffect, useRef } from "react"
import { PlanBuilderTopBar } from "@/components/plan-builder/top-bar"
import { QuizInterface } from "@/components/plan-builder/quiz-interface"
import { GenerationScreen } from "@/components/plan-builder/generation-screen"
import { PlanOutput } from "@/components/plan-builder/plan-output"
import { EditSectionModal } from "@/components/plan-builder/edit-section-modal"
import { UnsavedChangesModal } from "@/components/plan-builder/unsaved-changes-modal"
import { useToast } from "@/hooks/use-toast"
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

  // Product/Service (legacy single-product fields still kept for compatibility)
  productName: string
  keyFeatures: string[]
  uniqueSellingPoint: string

  // NEW — multi-product input
  products: {
    name: string
    features: string[]
    uniqueSellingPoint: string
  }[]

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

  // Company Legal & Ownership (new)
  incorporationCountry: string
  incorporationState: string
  ownership: Array<{ name: string; role: string; ownershipPercent?: number }>
  founders: Array<{ name: string; title: string; bio?: string; linkedinUrl?: string }>

  // SWOT (quiz answers that seed AI)
  successDrivers?: string[]
  weaknesses?: string[]
}

// New row type for the Usage of Funds table
export interface UsageOfFundsRow {
  department: string
  allocationPercent: number
  amount: string
  howUsed: string
}

export interface GeneratedPlan {
  coverPage: {
    logo: string
  }
  executiveSummary: {
    businessOverview: string
    ourMission: string
    funding: {
      p1: string
      usageOfFunds: UsageOfFundsRow[]
      p2: string
    }
    problemStatement: string
    solution: string
  }
  companyOverview: {
    visionStatement: string
    missionStatement: string
    legalStructureOwnership: string
    foundingTeam: string
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

  // NEW: full SWOT block produced by AI
  swot?: {
    strengths: Array<string | { Item: string }>
    weaknesses: Array<string | { Item: string }>
    opportunities: string[]
    threats: string[]
  }
}

type PlanBuilderStage = "quiz" | "generating" | "output"

type GenerateBusinessPlanResult = {
  success: boolean;
  planId?: string;
  plan?: GeneratedPlan;
  error?: string;
};

/* -------------------------------------------------------------------------- */
/*                                Component                                   */
/* -------------------------------------------------------------------------- */

export default function PlanBuilderClient() {

  const session = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const inflightRef = useRef(false)
  const autoRetriedRef = useRef(false)

  const [hasRedirectedForPayment, setHasRedirectedForPayment] = useState(false)
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

    // NEW — multi-product default
    products: [
      { name: "", features: [""], uniqueSellingPoint: "" }
    ],

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
    incorporationCountry: "",
    incorporationState: "",
    ownership: [{ name: "", role: "", ownershipPercent: undefined }],
    founders: [{ name: "", title: "", bio: "", linkedinUrl: "" }],

    // NEW: SWOT defaults (one slot each; UI can add more)
    successDrivers: [""],
    weaknesses: [""],
  })
  const [generatedPlan,      setGeneratedPlan]     = useState<GeneratedPlan | null>(null)
  const [editingSection,     setEditingSection]    = useState<string | null>(null)
  const [manualEditingSection, setManualEditingSection] = useState<string | null>(null)
  const [manualEditingSubsection, setManualEditingSubsection] = useState<string | null>(null)
  const [manualEditedContent, setManualEditedContent] = useState<string>("")
  const [showUnsavedModal,   setShowUnsavedModal]  = useState(false)
  const [hasUnsavedChanges,  setHasUnsavedChanges] = useState(false)

  // NEW: defer generation until session is hydrated after payment return
  const [shouldAutoGenerate, setShouldAutoGenerate] = useState(false)
  const postPayDataRef = useRef<BusinessPlanData | null>(null)

  // ───── PAYMENT‐RETURN EFFECT ─────
  useEffect(() => {
    if (searchParams.get("paid") === "true" && !hasRedirectedForPayment) {
      setHasRedirectedForPayment(true);

      const raw = sessionStorage.getItem("planData");
      if (!raw) return;

      const restored = JSON.parse(raw) as Partial<BusinessPlanData>;

      const normalized: BusinessPlanData = {
        ...planData,
        ...(restored as any),
        products:
          Array.isArray(restored.products) && restored.products.length
            ? restored.products
            : [{ name: "", features: [""], uniqueSellingPoint: "" }],
      };

      setPlanData(normalized);
      postPayDataRef.current = normalized;
      setShouldAutoGenerate(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, hasRedirectedForPayment]);

  // After we know the session is hydrated, kick off generation once
  useEffect(() => {
    if (!shouldAutoGenerate) return
    const uid = (session as any)?.user?.id
    if (!uid) return

    _reallyGeneratePlan(postPayDataRef.current ?? planData)
    setShouldAutoGenerate(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldAutoGenerate, session])

  // ─── SESSION GUARD EFFECT ───
  useEffect(() => {
    if (session === null) router.replace("/auth/signin")
  }, [session, router])

  if (session === undefined || session === null) return null

  // ─────── HELPERS & HANDLERS ───────
  async function _reallyGeneratePlan(overrideData?: BusinessPlanData) {
    if (inflightRef.current) return;
    inflightRef.current = true;
    const dataToUse = overrideData ?? planData;

    setStage("generating");
    try {
      const userId = (session as any)?.user?.id ?? "";
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(userId ? { "x-user-id": userId } : {}),
        },
        body: JSON.stringify(dataToUse),
      });

      if (!res.ok) {
        if (res.status === 429) {
          const retry = parseInt(res.headers.get("Retry-After") || "19", 10);
          const secondsLeft = Number.isFinite(retry)
            ? Math.max(0, Math.min(60, retry))
            : 19;

          toast({
            variant: "destructive",
            title: "Slow down a bit",
            description: `You’re generating too quickly — retrying automatically in ~${secondsLeft}s.`,
          });

          if (!autoRetriedRef.current) {
            autoRetriedRef.current = true;
            setTimeout(() => {
              inflightRef.current = false;
              _reallyGeneratePlan(dataToUse);
            }, secondsLeft * 1000);
          } else {
            inflightRef.current = false;
          }
          return;
        } else {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error || `Request failed (${res.status})`);
        }
      }

      const result: GenerateBusinessPlanResult = await res.json();
      if (!result.success) throw new Error(result.error || "Failed to generate plan");

      setPlanId(result.planId!);
      setGeneratedPlan(result.plan!);
      setStage("output");
      setHasUnsavedChanges(false);
      inflightRef.current = false;

      toast({
        title: "Plan Generated Successfully!",
        description: "Your business plan is ready for review and download.",
      });
    } catch (err: any) {
      console.error("❌ generate plan failed:", err);
      inflightRef.current = false;
      setStage("quiz");
      toast({
        variant: "destructive",
        title: "Plan Generation Failed",
        description: err.message,
      });
    }
  }

  console.log("🔧 PlanBuilderPage mounted, initial planData:", planData)

  async function handleGeneratePlan() {
    sessionStorage.setItem("planData", JSON.stringify(planData))
    router.replace("/plan-builder/payment-info")
  }

  async function handleSavePlan() {
    if (!planId) return
    const res = await fetch(`/api/plans/${planId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(planData),
    });
    const { success } = await res.json();
    if (!success) return
    setHasUnsavedChanges(false);
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

    const rawSection = (generatedPlan as any)[sectionKey];
    let updatedSectionValue: any;
    if (typeof rawSection === "object") {
      let text = (newContent as string).trim();
      if (text.startsWith("```")) {
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

    const res = await fetch(`/api/plans/${planId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedPlan),
    })
    const { success } = await res.json()
    if (!success) return
  }

  function capitalizeWords(str: string): string {
    return str.replace(/\b\w/g, (char) => char.toUpperCase())
  }

  async function handleManualSave(sectionKey: string, newText: string) {
    if (!planId || !generatedPlan) return
    const updatedPlan = { ...generatedPlan, [sectionKey]: newText }
    setGeneratedPlan(updatedPlan)
    setManualEditingSection(null)
    setManualEditedContent("")
    await fetch(`/api/plans/${planId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedPlan),
    })
  }

  const handleDownload = () => {
    if (generatedPlan) {
      exportBusinessPlanDocx(planData, generatedPlan)
    }
  }

  function handleStartManualEdit(sectionKey: string, subKey: string) {
    setManualEditingSection(sectionKey)
    setManualEditingSubsection(subKey)
    const raw = (generatedPlan as any)[sectionKey][subKey]
    setManualEditedContent(typeof raw === "string" ? raw : JSON.stringify(raw, null, 2))
  }

  async function handleSaveSubsection(
    sectionKey: string,
    subKey: string,
    newContent: string
  ) {
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
    await fetch(`/api/plans/${planId}`, {
      method: "PATCH",
      credentials: "include",
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
    setManualEditingSection(null)
    setManualEditingSubsection(null)
    setManualEditedContent("")
  }

  const handleBackToDashboard = () => {
    if (hasUnsavedChanges && stage === "quiz") {
      setShowUnsavedModal(true)
    } else {
      router.push("/dashboard")
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
            <PlanOutput
              planData={planData}
              generatedPlan={generatedPlan}
              onEditSection={setEditingSection}

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
