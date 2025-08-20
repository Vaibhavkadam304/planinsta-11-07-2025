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

  const ownershipLines = Array.isArray(data.ownership) && data.ownership.length
    ? data.ownership
        .filter(o => (o?.name?.trim?.() || o?.role?.trim?.() || typeof o?.ownershipPercent === "number"))
        .map(o => `- ${o.name?.trim() || "Owner"} — ${o.role?.trim() || "Role"}${typeof o.ownershipPercent === "number" ? ` — ${o.ownershipPercent}%` : ""}`)
        .join("\n")
    : "- Not specified"

  const foundersLines = Array.isArray(data.founders) && data.founders.length
    ? data.founders
        .filter(f => (f?.name?.trim?.() || f?.title?.trim?.()))
        .map(f => `- ${f.name?.trim() || "Founder"} — ${f.title?.trim() || "Title"}${f.linkedinUrl ? ` — ${f.linkedinUrl}` : ""}`)
        .join("\n")
    : "- Not specified"

  return `
Business Name: ${context.businessName}
Industry: ${context.industry}
Stage: ${context.stage}
One-liner: ${context.description}
Target Audience: ${context.targetAudience}
Location: ${context.location}

Legal:
- Legal Structure: ${data.legalStructure || "Not specified"}
- Incorporation: ${data.incorporationCountry || "Not specified"} / ${data.incorporationState || "Not specified"}

Ownership:
${ownershipLines}

Founding Team:
${foundersLines}

Additional Details:
- Vision: ${data.visionStatement || "Not specified"}
- Marketing Channels: ${Array.isArray(data.marketingChannels) && data.marketingChannels.length ? data.marketingChannels.join(", ") : "Not specified"}
- Team Size: ${data.teamSize || "Not specified"}
- Monthly Revenue: ${data.monthlyRevenue || "Not specified"}
- Monthly Expenses: ${data.monthlyExpenses || "Not specified"}
- Funding Needed: ${data.fundingNeeded || "Not specified"}
  `.trim()
}
