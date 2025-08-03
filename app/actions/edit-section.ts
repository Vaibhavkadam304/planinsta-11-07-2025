// app/actions/edit-section.ts
"use server";

import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";

// helper to drop any ```json fences```
function stripFences(text: string): string {
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

export async function editPlanSection(
  sectionName: string,
  currentContent: string,
  userInstruction: string,
  businessName: string,
  industry = "technology"
): Promise<
  | { success: true; content: string }
  | { success: false; error: string }
> {
  try {
    // 1) init v3 client
    const config = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const client = new OpenAIApi(config);

    // 2) build your messages
    const messages: ChatCompletionRequestMessage[] = [
      {
        role: "system",
        content: `You are an expert business‑plan editor. Improve a single section based on user feedback and return the _entire_ section as JSON.

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

    // 3) call Chat Completion
    const completion = await client.createChatCompletion({
      model: "gpt-4o",
      messages,
      temperature: 0.7,
    });

    // 4) extract, strip fences, and parse AI JSON
    const raw = completion.data.choices?.[0]?.message?.content;
    if (!raw) throw new Error("OpenAI returned no content");
    const clean = stripFences(raw);
    const updatedSectionObj = JSON.parse(clean);

    // 5) merge with original so untouched keys survive
    const originalSection =
      typeof currentContent === "string"
        ? JSON.parse(currentContent)
        : currentContent;
    const merged = { ...originalSection, ...updatedSectionObj };

    // 6) return a stringified JSON for the front end
    return { success: true, content: JSON.stringify(merged, null, 2) };
  } catch (err: any) {
    console.error("Error editing section:", err);
    return { success: false, error: err.message || "Edit failed" };
  }
}
