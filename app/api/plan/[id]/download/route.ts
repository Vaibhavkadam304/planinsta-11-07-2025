// app/api/plan/[id]/download/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import PDFDocument from 'pdfkit'
import { PassThrough } from 'stream'

// Utility: draw a footer with page numbers
function addFooter(doc: PDFKit.PDFDocument, pageNum: number, totalPages: number) {
  const bottom = doc.page.height - 30
  doc.fontSize(8)
     .fillColor('#666')
     .text(`Page ${pageNum} of ${totalPages}`, 50, bottom, {
       width: doc.page.width - 100,
       align: 'center'
     })
}

// Generate Table of Contents array
function generateTOC(doc: PDFKit.PDFDocument, toc: { title: string; page: number }[]) {
  doc.addPage()
  doc.fontSize(20).fillColor('#000').text('Table of Contents', { align: 'center' }).moveDown(1)

  doc.fontSize(12).fillColor('#000')
  toc.forEach(({ title, page }) => {
    doc.text(title, { continued: true })
       .text(` ..................................... ${page}`, { align: 'right' })
  })
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: plan, error } = await supabase
    .from('business_plans')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !plan) {
    return NextResponse.json({ error: error?.message || 'Not found' }, { status: 404 })
  }

  // Prepare sections
  const sections: { title: string; content: string }[] = [
    ['Executive Summary', plan.executive_summary],
    ['Market Analysis',    plan.market_analysis],
    ['Product Strategy',   plan.product_strategy],
    ['Marketing Strategy', plan.marketing_strategy],
    ['Operations Strategy',plan.operations_strategy],
    ['Financial Projections', plan.financial_projections],
    ['Milestones & Traction', plan.milestones_and_traction],
    ['Additional Notes',   plan.additional_notes],
  ].map(([t, c]) => ({ title: t, content: c }))

  // Create PDF
  const doc = new PDFDocument({ size: 'A4', margin: 50, autoFirstPage: false })
  const stream = new PassThrough()
  doc.pipe(stream)

  // 1. Cover Page
  doc.addPage()
  doc.font('Helvetica-Bold').fontSize(28).fillColor('#003366')
     .text(plan.business_name || 'Business Plan', { align: 'center', underline: true })
  doc.moveDown(1.5)
  doc.font('Helvetica').fontSize(16).fillColor('#444')
     .text('Comprehensive Business Plan', { align: 'center' })
  doc.moveDown(3)
  doc.fontSize(12).text(`Prepared for: ${user.email}`, { align: 'center' })
  doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'center' })
  // thin divider
  doc.moveTo(80, doc.y + 30).lineTo(doc.page.width - 80, doc.y + 30).strokeColor('#ccc').stroke()

  // 2. Table of Contents placeholder
  const toc: { title: string; page: number }[] = []
  let currentPage = doc.bufferedPageRange().count + 1  // cover is page 1
  sections.forEach((s, i) => {
    toc.push({ title: s.title, page: currentPage + i + 1 }) // +1 for TOC page itself
  })
  generateTOC(doc, toc)

  // 3. Section pages
  sections.forEach((section) => {
    doc.addPage()
    doc.font('Helvetica-Bold').fontSize(18).fillColor('#000')
       .text(section.title, { underline: true })
    doc.moveDown(0.5)
    doc.font('Helvetica').fontSize(12).fillColor('#333')
       .text(section.content, { align: 'justify', lineGap: 4 })
  })

  // 4. Add footers after pages are generated
  const range = doc.bufferedPageRange()
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(i)
    addFooter(doc, i + 1, range.count)
  }

  doc.end()

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="business-plan.pdf"`,
    },
  })
}
