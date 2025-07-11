import type { BusinessPlanData } from "@/app/plan-builder/page"

export function extractBusinessContext(data: BusinessPlanData) {
  return {
    businessName: data.businessName || "Your Business",
    industry: data.businessModel || "technology",
    stage: data.businessStage || "startup",
    description: data.description || "",
    targetAudience: data.targetAudience || "",
    location: data.location || "",
  }
}

export function formatBusinessDataForAI(data: BusinessPlanData): string {
  const context = extractBusinessContext(data)

  return `
Business Name: ${context.businessName}
Industry/Model: ${context.industry}
Stage: ${context.stage}
Description: ${context.description}
Target Audience: ${context.targetAudience}
Location: ${context.location}

Additional Details:
- Vision: ${data.visionStatement || "Not specified"}
- Product: ${data.productName || "Not specified"}
- Key Features: ${Array.isArray(data.keyFeatures) ? data.keyFeatures.join(", ") : "Not specified"}
- Marketing Channels: ${Array.isArray(data.marketingChannels) ? data.marketingChannels.join(", ") : "Not specified"}
- Team Size: ${data.teamSize || "Not specified"}
- Monthly Revenue: ${data.monthlyRevenue || "Not specified"}
- Monthly Expenses: ${data.monthlyExpenses || "Not specified"}
- Funding Needed: ${data.fundingNeeded || "Not specified"}
  `.trim()
}
