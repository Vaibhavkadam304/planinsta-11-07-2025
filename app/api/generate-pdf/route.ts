// app/api/generate-pdf/route.ts

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // 1) Parse incoming JSON (your front-end sends { planData, generatedPlan })
  let body: any;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { planData, generatedPlan } = body;
  if (!planData || !generatedPlan) {
    return NextResponse.json(
      { error: "Missing planData or generatedPlan in request body" },
      { status: 400 }
    );
  }

  // 2) Build a short-lived JWT for PDF Generator API v4
  const jwtToken = jwt.sign(
    {
      iss: process.env.PDF_API_KEY,
      sub: process.env.PDF_WORKSPACE,
      exp: Math.floor(Date.now() / 1000) + 30, // token valid for 30s
    },
    process.env.PDF_API_SECRET!,
    { algorithm: "HS256" }
  );

  // 3) Prepare the v4 “generate document” payload
  const generatePayload = {
    template: {
      id: Number(process.env.PDF_TEMPLATE_ID),
      data: {
      // spread planData & any other pieces you need
      ...planData,
      ...generatedPlan,
    },
    },
    format: "pdf",
    output: "base64",
    name: `${planData.businessName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "")}.pdf`,
    testing: false,
  };

  // 4) Call the PDF Generator API v4 endpoint
  const apiUrl = `https://us1.pdfgeneratorapi.com/api/v4/documents/generate`;
  const apiRes = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
    },
    body: JSON.stringify(generatePayload),
  });

  // 5) Handle errors from PDF Generator API
  if (!apiRes.ok) {
    const text = await apiRes.text();
    return NextResponse.json({ error: text || "Unknown PDF API error" }, { status: apiRes.status });
  }

  // 6) Extract base64 PDF and return as application/pdf
  const json = await apiRes.json();
  const base64Pdf = json.response;
  console.log("[generate-pdf] base64 length:", base64Pdf.length);
  const buffer = Buffer.from(base64Pdf, "base64");

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${generatePayload.name}"`,
    },
  });
}
