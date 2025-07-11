"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit3, FileText, Target, TrendingUp, Settings, Rocket, StickyNote, Users, DollarSign } from "lucide-react"
import type { BusinessPlanData } from "@/app/plan-builder/page"

interface PlanPreviewProps {
  data: BusinessPlanData
  onEditSection: (sectionName: string) => void
}

export function PlanPreview({ data, onEditSection }: PlanPreviewProps) {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null)

  const formatCurrency = (value: string) => {
    if (!value) return "Not specified"
    return value.startsWith("$") ? value : `$${value}`
  }

  const generateExecutiveSummary = () => {
    const businessName = data.businessName || "Your Business"
    const businessModel = data.businessModel || "business"
    const description = data.description || "innovative solution"
    const location = data.location || "target market"
    const teamSize = data.teamSize || "dedicated team"
    const revenue = data.monthlyRevenue || "projected revenue"

    return `${businessName} is ${businessModel === "saas" ? "a Software-as-a-Service (SaaS)" : businessModel === "d2c" ? "a Direct-to-Consumer (D2C)" : businessModel === "services" ? "a professional services" : businessModel === "marketplace" ? "a marketplace" : "an innovative"} business focused on ${description.toLowerCase()}. ${location ? `Operating primarily in ${location}, ` : ""}we are positioned to capture significant market share through our unique value proposition and strategic approach.

Our business is currently in the ${data.businessStage || "development"} stage, with ${teamSize ? `a ${teamSize}` : "a dedicated team"} committed to delivering exceptional value to our customers. ${data.visionStatement ? `Our vision is to ${data.visionStatement.toLowerCase()}` : "We are driven by a clear vision for growth and market leadership."} 

${data.uniqueSellingPoint ? `What sets us apart is ${data.uniqueSellingPoint.toLowerCase()}.` : "Our competitive advantage lies in our innovative approach and customer-centric focus."} ${revenue ? `With current monthly revenue of ${formatCurrency(revenue)}, ` : ""}we are well-positioned for sustainable growth and expansion.`
  }

  const generateMarketAnalysis = () => {
    const targetAudience = data.targetAudience || "target customers"
    const location = data.location || "our target market"
    const marketSize = data.marketSize || "significant market opportunity"

    return `Our target market consists of ${targetAudience.toLowerCase()}${location ? ` primarily located in ${location}` : ""}. ${marketSize ? `The market size is estimated at ${marketSize}, ` : ""}representing a substantial opportunity for growth and market penetration.

Market research indicates strong demand for ${data.productName || "our solution"}, particularly among ${targetAudience.toLowerCase()}. Key market trends supporting our business include the increasing adoption of ${data.businessModel === "saas" ? "cloud-based solutions" : data.businessModel === "d2c" ? "direct-to-consumer purchasing" : data.businessModel === "services" ? "professional services" : "innovative business models"} and the growing need for ${data.description || "our type of solution"}.

The competitive landscape presents both challenges and opportunities. While there are established players in the market, our unique positioning and ${data.uniqueSellingPoint || "innovative approach"} provide significant competitive advantages that will enable us to capture market share effectively.`
  }

  const generateProductStrategy = () => {
    const productName = data.productName || "Our Solution"
    const features =
      data.keyFeatures.filter((f) => f.trim()).length > 0
        ? data.keyFeatures.filter((f) => f.trim())
        : ["Core functionality", "User-friendly interface", "Scalable architecture"]
    const usp = data.uniqueSellingPoint || "innovative approach to solving customer problems"

    return `${productName} is designed to ${data.description || "deliver exceptional value to our customers"}. Our solution addresses key market needs through a comprehensive approach that combines functionality, usability, and innovation.

**Key Features:**
${features.map((feature) => `• ${feature}`).join("\n")}

**Product Differentiation:**
${usp}. This unique positioning allows us to stand out in a competitive market and provide superior value to our customers.

**Development Roadmap:**
Our product development strategy focuses on continuous improvement and feature enhancement based on customer feedback and market demands. We plan to ${data.shortTermGoal ? `achieve ${data.shortTermGoal.toLowerCase()} in the short term` : "expand our feature set significantly"} while maintaining our core value proposition.`
  }

  const generateMarketingStrategy = () => {
    const channels =
      data.marketingChannels.length > 0
        ? data.marketingChannels
        : ["Digital Marketing", "Content Marketing", "Social Media"]
    const pricing = data.pricingStrategy || "competitive pricing"
    const salesTeam = data.hasSalesTeam

    return `Our marketing strategy is built around a multi-channel approach designed to reach ${data.targetAudience || "our target customers"} effectively and efficiently.

**Marketing Channels:**
${channels.map((channel) => `• ${channel}: Targeted campaigns to reach potential customers through ${channel.toLowerCase()}`).join("\n")}

**Pricing Strategy:**
We have adopted a ${pricing} model that provides excellent value while ensuring sustainable profitability. Our pricing is competitive within the market while reflecting the premium value we deliver.

**Sales Approach:**
${salesTeam ? "Our dedicated sales team will focus on building relationships with key prospects and converting leads into customers." : "We will leverage a self-service sales model complemented by strong marketing automation and customer success initiatives."} This approach ensures efficient customer acquisition while maintaining high conversion rates.

**Customer Acquisition:**
Our customer acquisition strategy focuses on ${data.marketingChannels.includes("SEO") ? "organic search visibility, " : ""}${data.marketingChannels.includes("Ads") ? "targeted advertising, " : ""}${data.marketingChannels.includes("Social Media") ? "social media engagement, " : ""}and ${data.marketingChannels.includes("Referrals") ? "referral programs" : "content marketing"} to build a sustainable pipeline of qualified prospects.`
  }

  const generateOperationsStrategy = () => {
    const location = data.operationLocation || "strategic location"
    const legalStructure = data.legalStructure || "appropriate legal structure"
    const teamSize = data.teamSize || "right-sized team"
    const founderRole = data.founderRole || "leadership role"

    return `Our operations strategy is designed to ensure efficient delivery of our products/services while maintaining high quality standards and customer satisfaction.

**Operational Structure:**
We operate from ${location} under a ${legalStructure} legal structure. Our ${teamSize} is strategically organized to maximize efficiency and expertise across all business functions.

**Key Operational Areas:**
• **Leadership:** ${founderRole ? `Led by our ${founderRole}, ` : ""}our management team brings extensive experience and expertise to drive business success
• **Quality Control:** Rigorous quality assurance processes ensure consistent delivery of high-quality products/services
• **Technology Infrastructure:** Robust systems and processes support scalable operations and efficient service delivery
• **Customer Support:** Dedicated customer success initiatives ensure high satisfaction and retention rates

**Operational Efficiency:**
We focus on continuous improvement and optimization of our operational processes. This includes regular performance monitoring, process refinement, and technology upgrades to maintain competitive advantage and operational excellence.`
  }

  const generateFinancialProjections = () => {
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
Based on market analysis and operational capacity, we project ${data.businessStage === "growth" ? "25-35%" : data.businessStage === "early-revenue" ? "50-75%" : "100-200%"} annual growth over the next 3 years, driven by market expansion and operational scaling.`
  }

  const generateMilestonesAndTraction = () => {
    const achievements =
      data.achievements.filter((a) => a.trim()).length > 0 ? data.achievements.filter((a) => a.trim()) : []
    const upcomingMilestone = data.upcomingMilestone || "key business objectives"

    return `${achievements.length > 0 ? "Our track record demonstrates consistent progress and achievement of key business milestones." : "We are focused on achieving key milestones that will drive business growth and market success."}

${
  achievements.length > 0
    ? `**Key Achievements:**
${achievements.map((achievement) => `• ${achievement}`).join("\n")}

These achievements validate our business model and demonstrate our ability to execute on our strategic vision.`
    : ""
}

**Upcoming Milestones:**
${upcomingMilestone ? upcomingMilestone : "Our immediate focus is on achieving product-market fit, scaling our customer base, and establishing sustainable revenue growth. Key milestones include customer acquisition targets, product development goals, and operational efficiency improvements."}

**Success Metrics:**
We track key performance indicators including customer acquisition cost, lifetime value, monthly recurring revenue${data.businessModel === "saas" ? ", churn rate" : ""}, and customer satisfaction scores to ensure we are meeting our growth objectives and maintaining operational excellence.`
  }

  const PreviewSection = ({
    id,
    title,
    icon: Icon,
    children,
  }: {
    id: string
    title: string
    icon: any
    children: React.ReactNode
  }) => (
    <div
      className={`relative group transition-all duration-200 ${
        hoveredSection === id ? "bg-orange-50 rounded-2xl p-4 -m-4" : ""
      }`}
      onMouseEnter={() => setHoveredSection(id)}
      onMouseLeave={() => setHoveredSection(null)}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Icon className="h-5 w-5 mr-2 text-orange-500" />
          {title}
        </h2>
        {hoveredSection === id && (
          <Button
            onClick={() => onEditSection(id)}
            size="sm"
            variant="outline"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl"
          >
            <Edit3 className="h-4 w-4 mr-1" />
            Edit Section
          </Button>
        )}
      </div>
      {children}
    </div>
  )

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{data.businessName || "Business Plan"}</h1>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="rounded-2xl">
              <FileText className="h-3 w-3 mr-1" />
              Live Preview
            </Badge>
          </div>
        </div>
        {data.description && <p className="text-lg text-gray-600 leading-relaxed italic">"{data.description}"</p>}
      </div>

      <div className="space-y-8">
        {/* Executive Summary */}
        <PreviewSection id="executive-summary" title="Executive Summary" icon={FileText}>
          <div className="prose prose-gray max-w-none">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border-l-4 border-orange-500">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{generateExecutiveSummary()}</p>
            </div>
          </div>
        </PreviewSection>

        {/* Market Analysis */}
        <PreviewSection id="market-analysis" title="Market Analysis" icon={Target}>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{generateMarketAnalysis()}</p>
          </div>
        </PreviewSection>

        {/* Product/Service Strategy */}
        <PreviewSection id="product-strategy" title="Product/Service Strategy" icon={Settings}>
          <div className="prose prose-gray max-w-none">
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">{generateProductStrategy()}</div>
          </div>
        </PreviewSection>

        {/* Marketing & Sales Strategy */}
        <PreviewSection id="marketing-strategy" title="Marketing & Sales Strategy" icon={TrendingUp}>
          <div className="prose prose-gray max-w-none">
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">{generateMarketingStrategy()}</div>
          </div>
        </PreviewSection>

        {/* Operations Strategy */}
        <PreviewSection id="operations-strategy" title="Operations Strategy" icon={Users}>
          <div className="prose prose-gray max-w-none">
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">{generateOperationsStrategy()}</div>
          </div>
        </PreviewSection>

        {/* Financial Projections */}
        <PreviewSection id="financial-projections" title="Financial Projections" icon={DollarSign}>
          <div className="prose prose-gray max-w-none">
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">{generateFinancialProjections()}</div>
            </div>
          </div>
        </PreviewSection>

        {/* Milestones & Traction */}
        <PreviewSection id="milestones-traction" title="Milestones & Traction" icon={Rocket}>
          <div className="prose prose-gray max-w-none">
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">{generateMilestonesAndTraction()}</div>
          </div>
        </PreviewSection>

        {/* Additional Notes */}
        {data.notes && (
          <PreviewSection id="additional-notes" title="Additional Notes" icon={StickyNote}>
            <div className="bg-blue-50 rounded-2xl p-6 border-l-4 border-blue-500">
              <p className="text-gray-700 whitespace-pre-wrap">{data.notes}</p>
            </div>
          </PreviewSection>
        )}
      </div>

      {/* Plan Statistics */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Completion Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white rounded-2xl p-4 shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(
                (Object.values(data).filter((value) =>
                  typeof value === "string"
                    ? value.trim()
                    : Array.isArray(value)
                      ? value.some((item) =>
                          typeof item === "string"
                            ? item.trim()
                            : typeof item === "object" && item !== null
                              ? Object.values(item).some((v) => typeof v === "string" && v.trim())
                              : false,
                        )
                      : false,
                ).length /
                  Object.keys(data).length) *
                  100,
              )}
              %
            </div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">{Math.round(JSON.stringify(data).length / 100)}</div>
            <div className="text-sm text-gray-600">Content Score</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">{data.keyFeatures.filter((f) => f.trim()).length}</div>
            <div className="text-sm text-gray-600">Key Features</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">{data.marketingChannels.length}</div>
            <div className="text-sm text-gray-600">Marketing Channels</div>
          </div>
        </div>
      </div>
    </div>
  )
}
