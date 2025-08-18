// app/actions/suggest-choices.ts
"use server";

import OpenAI from "openai";

type TargetField = "longTermVision" | "next12moGoal" | "midTermGoal";

export async function suggestChoices(params: {
  oneLiner: string;
  businessModel: string;
  stage: string;
  target?: TargetField;
  count?: number;
}) {
  const {
    oneLiner = "",
    businessModel = "",
    stage = "",
    target = "longTermVision",
    count = 4,
  } = params || {};

  const limit = Math.max(1, Math.min(6, count));
  const fallback = heuristicSuggestions({ oneLiner, businessModel, stage, target, limit });

  try {
    if (!process.env.OPENAI_API_KEY) {
      return { success: true, suggestions: fallback, source: "heuristic" as const };
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const ruleByTarget =
      target === "longTermVision"
        ? "Suggest 5–10 year vision statements (outcome-oriented)."
        : target === "midTermGoal"
        ? "Suggest 3–5 year goals with clear scale/expansion milestones."
        : "Suggest concrete 6–12 month goals with measurable targets.";

    const system = `You suggest concise, business-appropriate options for a form.
Return ONLY JSON:
{"suggestions": ["opt1","opt2","opt3","opt4"]}

Rules:
- ${ruleByTarget}
- 8–18 words each. No emojis. No quotes. No extra text.`;

    const user = `One-liner: ${oneLiner || "-"}
Business model: ${businessModel || "-"}
Stage: ${stage || "-"}
Target field: ${target}
Count: ${limit}`;

    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    const content = res.choices?.[0]?.message?.content ?? "";
    let parsed: any = {};
    try { parsed = JSON.parse(content); } catch {}
    let suggestions: string[] = Array.isArray(parsed?.suggestions) ? parsed.suggestions : [];

    suggestions = suggestions.map(s => String(s || "").trim()).filter(Boolean).slice(0, limit);
    if (suggestions.length === 0) {
      return { success: true, suggestions: fallback, source: "heuristic" as const };
    }
    return { success: true, suggestions, source: "openai" as const };
  } catch {
    return { success: true, suggestions: fallback, source: "heuristic" as const };
  }
}

// -------------------- Heuristic fallback --------------------
function heuristicSuggestions(opts: {
  oneLiner: string;
  businessModel: string;
  stage: string;
  target: TargetField;
  limit: number;
}) {
  const { businessModel, stage, target, limit } = opts;

  const bm = (businessModel || "").toLowerCase();
  const sg = (stage || "").toLowerCase();

  const isSaaS = /saas|subscription|software/.test(bm);
  const isMarketplace = /marketplace|platform/.test(bm);
  const isD2C = /d2c|direct[-\s]?to[-\s]?consumer|e[-\s]?commerce|retail/.test(bm);
  const isServices = /services|agency|consult/.test(bm);

  const lt: string[] = [];
  const mt: string[] = [];
  const nt: string[] = [];

  // 5–10 year vision
  if (target === "longTermVision") {
    if (isSaaS) {
      lt.push(
        "Become the go-to automation suite for small businesses across key global markets",
        "Exceed strong ARR with industry-leading retention and product-led growth",
        "Power thousands of SMEs via deep finance, payroll and messaging integrations"
      );
    }
    if (isMarketplace) {
      lt.push(
        "Build the most trusted B2B marketplace with verified supply and nationwide reach",
        "Lead category GMV while sustaining high fulfillment quality and repeat purchase",
        "Operate multi-category trade with embedded payments, credit and logistics"
      );
    }
    if (isD2C) {
      lt.push(
        "Create a nationally loved brand with omnichannel presence and loyal communities",
        "Sustain profitable growth while expanding into adjacent product categories",
        "Be recognized for superior quality, service and sustainability"
      );
    }
    if (isServices) {
      lt.push(
        "Be the most trusted partner for SMB digital transformation in our region",
        "Run a scalable, process-driven practice with robust recurring retainers",
        "Build proprietary accelerators to deliver faster, consistent outcomes"
      );
    }
    if (lt.length === 0) {
      lt.push(
        "Establish a category-leading solution adopted by small businesses at scale",
        "Expand internationally through partnerships and a strong reputation",
        "Maintain profitable growth with outstanding customer retention"
      );
    }
  }

  // 3–5 year mid-term goals
  if (target === "midTermGoal") {
    if (isSaaS) {
      mt.push(
        "Reach seven-figure ARR with churn under 3% and strong CAC to LTV",
        "Launch enterprise tier, SOC 2 compliance and three strategic integrations",
        "Build a repeatable sales engine and expand into two new regions"
      );
    }
    if (isMarketplace) {
      mt.push(
        "Achieve sustainable unit economics with high monthly GMV and fulfillment success",
        "Expand across priority categories while strengthening trust and dispute resolution",
        "Diversify monetization across commissions, ads and seller subscriptions"
      );
    }
    if (isD2C) {
      mt.push(
        "Scale to meaningful annual revenue with profitable contribution margins",
        "Open marketplace plus retail channels and lift repeat purchase above 30%",
        "Launch new product lines while maintaining quality and brand love"
      );
    }
    if (isServices) {
      mt.push(
        "Productize offerings with 40% recurring retainers and documented playbooks",
        "Hire senior leads, achieve high client NPS and build referral motion",
        "Develop reusable accelerators to reduce delivery time and risk"
      );
    }
    if (mt.length === 0) {
      mt.push(
        "Validate multi-channel growth and achieve consistent profitable unit economics",
        "Expand into two new markets with localized partnerships and support",
        "Strengthen operations, analytics and compliance to enterprise standards"
      );
    }
  }

  // 6–12 month near-term goals
  if (target === "next12moGoal") {
    if (isSaaS) {
      if (/idea|pre|mvp/.test(sg)) {
        nt.push(
          "Ship MVP and onboard first 50–100 paying customers",
          "Integrate core systems and reduce setup time below ten minutes",
          "Validate pricing and hit initial MRR with strong retention"
        );
      } else {
        nt.push(
          "Scale monthly recurring revenue with double-digit growth",
          "Launch analytics module and two high-impact integrations",
          "Cut churn using improved onboarding and customer success"
        );
      }
    }
    if (isMarketplace) {
      nt.push(
        "Onboard verified sellers and active buyers with escrow payments",
        "Reach healthy monthly GMV while maintaining fulfillment quality",
        "Launch ratings and dispute workflows to boost repeat usage"
      );
    }
    if (isD2C) {
      nt.push(
        "Achieve steady monthly revenue with strong CAC to LTV ratio",
        "Launch two new SKUs and stabilize supply chain margins",
        "Open marketplace and website channels with subscriptions"
      );
    }
    if (isServices) {
      nt.push(
        "Close recurring retainers and document delivery playbooks",
        "Hire two senior leads and implement QA with NPS tracking",
        "Package signature offerings with clear outcomes and timelines"
      );
    }
    if (nt.length === 0) {
      nt.push(
        "Validate core offering with first 100 paying customers",
        "Establish reliable acquisition channels and measure unit economics",
        "Secure two partnerships that unlock distribution and credibility"
      );
    }
  }

  const pool = target === "longTermVision" ? lt : target === "midTermGoal" ? mt : nt;
  return pool.slice(0, limit);
}
