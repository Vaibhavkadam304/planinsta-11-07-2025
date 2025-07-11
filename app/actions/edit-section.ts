"use server"

import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function editPlanSection(
  sectionName: string,
  currentContent: string,
  userInstruction: string,
  businessName: string,
  industry = "technology",
) {
  try {
    const systemPrompt = `You are an expert business plan editor. Your job is to improve specific sections of business plans based on user feedback.

CURRENT SECTION: ${sectionName}
CURRENT CONTENT: ${currentContent}

USER REQUEST: ${userInstruction}

CONTEXT: This is part of a larger business plan for ${businessName} in the ${industry} industry.

REQUIREMENTS:
1. Maintain professional business language
2. Keep the same general structure and length
3. Incorporate the user's specific feedback
4. Ensure consistency with the overall business plan
5. Make it more compelling and investor-ready
6. Don't change factual data unless specifically requested

EXAMPLES OF GOOD EDITS:
- "Make this more investor-friendly" → Add ROI projections, market size data, competitive advantages
- "Add more detail about our technology" → Expand technical specifications, development timeline, IP protection
- "Make it sound more confident" → Use stronger language, add specific achievements, quantify benefits

OUTPUT: Return only the improved section content, maintaining the same format as the original.`

    const userPrompt = `Rewrite the section based on the user's request: "${userInstruction}"`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: userPrompt,
    })

    return { success: true, content: text }
  } catch (error) {
    console.error("Error editing section:", error)
    return { success: false, error: "Failed to edit section" }
  }
}
