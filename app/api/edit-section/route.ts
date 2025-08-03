// app/api/edit-section/route.ts
import { NextResponse } from "next/server";
import { editPlanSection } from "@/app/actions/edit-section";

export async function POST(req: Request) {
  try {
    const {
      sectionKey,
      currentContent,
      instruction,
      businessName,
      industry,
    } = await req.json();

    // call your server‑side edit action with all five args
    const { success, content, error } = await editPlanSection(
      sectionKey,
      currentContent,
      instruction,
      businessName,
      industry
    );

    if (!success) {
      return NextResponse.json({ success: false, error }, { status: 500 });
    }
    return NextResponse.json({ success: true, content });
  } catch (err: any) {
    console.error("📋 edit-section error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
