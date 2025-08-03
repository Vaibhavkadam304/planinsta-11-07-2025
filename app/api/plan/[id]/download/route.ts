// app/api/plan/[id]/download/route.ts
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(
  _req: Request,
  route: { params: Promise<{ id: string }> }
) {
  const { id } = await route.params
  const cookieStore = await cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const { data: plan, error } = await supabase
    .from("business_plans")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !plan) {
    return NextResponse.json(
      { error: error?.message || "Not found" },
      { status: 404 }
    )
  }

  const { PDFDocument, StandardFonts } = await import("pdf-lib")

  // Build sections from JSON
  const raw: Record<string, any> = plan.plan_json ?? plan
  const sections = Object.entries(raw)
   // remove id / created_at / updated_at / user_id
   .filter(
     ([key]) =>
       !["id", "created_at", "updated_at", "user_id"].includes(key)
   )
   .map(([key, val]) => ({
    key,
    title: prettifyKey(key),
    body: stringify(val),
  }))

  // Create PDF + embed fonts
  const pdf = await PDFDocument.create()
  const fontReg = await pdf.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold)

  type WC = {
    pdf: any
    page: any
    y: number
    margin: number
    lineH: number
    fonts: { reg: any; bold: any }
  }
  const wc: WC = {
    pdf,
    page: null as any,
    y: 0,
    margin: 50,
    lineH: 16,
    fonts: { reg: fontReg, bold: fontBold },
  }

  // helpers
  function newPage() {
    wc.page = wc.pdf.addPage()
    wc.y = wc.page.getSize().height - wc.margin
  }
  function writeText(
    text: string,
    size: number,
    opts: { bold?: boolean; indent?: number } = {}
  ) {
    const { bold = false, indent = 0 } = opts
    const font = bold ? wc.fonts.bold : wc.fonts.reg
    const maxW =
      wc.page.getSize().width - wc.margin * 2 - indent

    for (const line of splitLines(text, font, size, maxW)) {
      if (wc.y - wc.lineH < wc.margin) newPage()
      wc.page.drawText(line, {
        x: wc.margin + indent,
        y: wc.y,
        size,
        font,
      })
      wc.y -= wc.lineH
    }
  }

  // 1) COVER
  newPage()
  writeText(plan.plan_name || "Business Plan", 28, { bold: true })
  wc.y -= 120

  // 2) SECTION PAGES
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i]
    newPage()

    // extra top‑space before heading
    wc.y -= 20

    writeText(`${i + 1}. ${s.title}`, 18, { bold: true })
    wc.y -= 10

    // body (handle bullets/paragraphs)
    const lines = s.body.split("\n")
    for (const line of lines) {
      if (line.trim().startsWith("•")) {
        writeText(line.trim(), 12, { indent: 15 })
      } else {
        writeText(line, 12)
      }
    }

    // extra space after section
    wc.y -= 120
  }

  const pdfBytes = await pdf.save()
  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${slugify(
        plan.plan_name || "business-plan"
      )}.pdf"`,
    },
  })
}

/* ── helpers ── */

function prettifyKey(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (m) => m.toUpperCase())
}

function stringify(v: any): string {
  if (typeof v === "string") return v
  if (Array.isArray(v))
    return v.map((i) => (typeof i === "string" ? `• ${i}` : stringify(i))).join("\n")
  if (typeof v === "object" && v)
    return Object.entries(v)
      .map(([k, val]) => `${prettifyKey(k)}:\n${stringify(val)}`)
      .join("\n\n")
  return String(v ?? "")
}

function splitLines(text: string, font: any, size: number, maxWidth: number) {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ""
  for (const w of words) {
    const test = line ? line + " " + w : w
    if (font.widthOfTextAtSize(test, size) > maxWidth) {
      lines.push(line)
      line = w
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}
