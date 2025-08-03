// app/api/razorpay/record-payment/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies, headers } from "next/headers";

function supa() {
  return createRouteHandlerClient({
    cookies: () => cookies(),
    headers: () => headers(),
  });
}

// ---------- GET: check if user has any payments ----------
export async function GET() {
  const supabase = supa();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user?.id) {
    return NextResponse.json({ paid: false });
  }

  const { count, error: countError } = await supabase
    .from("payments")
    .select("id", { head: true, count: "exact" })
    .eq("user_id", user.id);

  if (countError) {
    console.error("Counting payments failed:", countError);
    return NextResponse.json({ paid: false });
  }

  return NextResponse.json({ paid: (count ?? 0) > 0 });
}

// ---------- POST: record a payment ----------
export async function POST(req: NextRequest) {
  const supabase = supa();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const {
    razorpay_order_id,
    razorpay_payment_id,
    amount,
    currency,
    status,
    paid_at,
    plan_id, // optional
  } = body;

  const { error: insertError } = await supabase.from("payments").insert({
    user_id: user.id,                     // ✅ important
    razorpay_order: razorpay_order_id,
    razorpay_payment: razorpay_payment_id,
    amount,
    currency,
    status,
    paid_at: paid_at ?? new Date().toISOString(),
    plan_id: plan_id ?? null,
  });

  if (insertError) {
    console.error("Error recording payment:", insertError);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
