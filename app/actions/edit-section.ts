// app/actions/edit-section.ts
"use server";

import OpenAI from "openai";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

// helper to drop any ```json fences```
function stripFences(text: string): string {
  if (!text) return "";
  let t = text.trim();
  if (t.startsWith("```")) {
    // remove leading ``` or ```json line
    t = t.replace(/^```(?:json)?\r?\n/, "");
  }
  if (t.endsWith("```")) {
    // remove trailing ```
    t = t.replace(/\r?\n```$/, "");
  }
  return t.trim();
}

function safeJsonParse(input: unknown): any {
  try {
    if (typeof input === "string") return JSON.parse(input);
    if (input && typeof input === "object") return input;
    return {};
  } catch {
    return {};
  }
}

export async function editPlanSection(
  sectionName: string,
  currentContent: string,
  userInstruction: string,
  businessName: string,
  industry = "technology"
): Promise<{ success: true; content: string } | { success: false; error: string }> {
  try {
    // OpenAI v4 client (no Configuration/OpenAIApi classes in v4)
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Missing OPENAI_API_KEY");
    }
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // build messages
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: `You are an expert business-plan editor. Improve a single section based on user feedback and return the _entire_ section as JSON.

CURRENT SECTION: ${sectionName}

CURRENT CONTENT:
${currentContent}

CONTEXT: Part of a business plan for ${businessName} (${industry}).

Requirements:
• Keep professional tone
• Preserve structure & length
• Incorporate feedback: "${userInstruction}"
• Don’t invent or remove factual data unless asked
• Return only the edited section as a JSON object, with no extra text or markdown fences.

For example, if the section is \`managementOrganization\`, respond exactly:

\`\`\`json
{
  "overview": "...edited overview…",
  "organizationalChart": "...existing or edited…",
  "hiringPlanKeyRoles": "...existing or edited…"
}
\`\`\`
`
      },
      {
        role: "user",
        content: `Please rewrite the above section according to the instruction: "${userInstruction}"`
      }
    ];

    // Chat Completions (v4) — force JSON shape
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    // extract, strip fences (just in case), and parse AI JSON
    const raw = completion.choices?.[0]?.message?.content;
    if (!raw) throw new Error("OpenAI returned no content");
    const clean = stripFences(raw);
    const updatedSectionObj = safeJsonParse(clean);

    if (!updatedSectionObj || typeof updatedSectionObj !== "object") {
      throw new Error("Model did not return a valid JSON object for the section");
    }

    // merge with original so untouched keys survive
    const originalSection = safeJsonParse(currentContent);
    const merged = { ...originalSection, ...updatedSectionObj };

    // return a stringified JSON for the front end
    return { success: true, content: JSON.stringify(merged, null, 2) };
  } catch (err: any) {
    console.error("Error editing section:", err);
    return { success: false, error: err?.message || "Edit failed" };
  }
}
