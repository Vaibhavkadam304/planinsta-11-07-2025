export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
// ⬇️ alias to avoid name clash and make it clear we're awaiting them
import { cookies as getCookies, headers as getHeaders } from "next/headers";
import nodemailer from "nodemailer";

// ⬇️ make this async and await the dynamic APIs
async function supa() {
  const cookieStore = await getCookies();
  const headerList = await getHeaders();
  return createRouteHandlerClient({
    cookies: () => cookieStore,
    headers: () => headerList,
  });
}

const successStatuses = new Set(["captured", "paid", "success"]);

// ---------- GET ----------
export async function GET() {
  const supabase = await supa(); // ⬅️ await

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
    .eq("user_id", user.id)
    .in("status", Array.from(successStatuses));

  if (countError) {
    console.error("Counting payments failed:", countError);
    return NextResponse.json({ paid: false });
  }

  return NextResponse.json({ paid: (count ?? 0) > 0 });
}

// ---------- POST ----------
export async function POST(req: NextRequest) {
  const supabase = await supa(); // ⬅️ await

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
    plan_id,
  } = body;

  const statusNorm = String(status ?? "").trim().toLowerCase();

  // idempotency guard
  if (razorpay_payment_id) {
    const { data: existing, error: existingErr } = await supabase
      .from("payments")
      .select("id")
      .eq("razorpay_payment", razorpay_payment_id)
      .maybeSingle();

    if (!existingErr && existing?.id) {
      return NextResponse.json({
        success: true,
        message: "Payment already recorded.",
        emailed: false,
        duplicate: true,
      });
    }
  }

  const { error: insertError } = await supabase.from("payments").insert({
    user_id: user.id,
    razorpay_order: razorpay_order_id ?? null,
    razorpay_payment: razorpay_payment_id ?? null,
    amount,
    currency,
    status: statusNorm,
    paid_at: paid_at ?? new Date().toISOString(),
    plan_id: plan_id ?? null,
  });

  if (insertError) {
    console.error("Error recording payment:", insertError);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // email (unchanged)
  const shouldEmail = successStatuses.has(statusNorm);
  let emailed = false;

  if (shouldEmail) {
    try {
      const userEmail = user.email ?? "";
      const displayName =
        (user.user_metadata?.full_name as string) ||
        (user.user_metadata?.name as string) ||
        (user.user_metadata?.username as string) ||
        (user.user_metadata?.user_name as string) ||
        "";
      const paidAt = paid_at ?? new Date().toISOString();
      const curr = String(currency ?? "").toUpperCase();
      const shortPid = (razorpay_payment_id ?? "").toString().slice(-6);

      const smtpPort = Number(process.env.SMTP_PORT ?? 465);
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST!,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: process.env.SMTP_USER!,
          pass: process.env.SMTP_PASS!,
        },
      });

      const toAddress =
        process.env.NOTIFY_EMAIL || process.env.EMAIL_FROM || "";

      if (!toAddress) {
        console.warn(
          "Payment email skipped: NOTIFY_EMAIL or EMAIL_FROM not configured."
        );
      } else {
        const html = `
          <h2>New purchase captured on PlanInsta</h2>
          <p><strong>User:</strong> ${displayName ? `${displayName} — ` : ""}${userEmail}</p>
          <p><strong>User ID:</strong> ${user.id}</p>
          <hr />
          <p><strong>Status:</strong> ${statusNorm}</p>
          <p><strong>Amount:</strong> ${amount} ${curr}</p>
          ${razorpay_order_id ? `<p><strong>Order ID:</strong> ${razorpay_order_id}</p>` : ""}
          ${razorpay_payment_id ? `<p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>` : ""}
          <p><strong>Paid at:</strong> ${paidAt}</p>
        `;

        const text = [
          "PlanInsta new purchase captured",
          `User: ${displayName ? `${displayName} — ` : ""}${userEmail}`,
          `User ID: ${user.id}`,
          `Status: ${statusNorm}`,
          `Amount: ${amount} ${curr}`,
          razorpay_order_id ? `Order ID: ${razorpay_order_id}` : "",
          razorpay_payment_id ? `Payment ID: ${razorpay_payment_id}` : "",
          `Paid at: ${paidAt}`,
        ]
          .filter(Boolean)
          .join("\n");

        await transporter.sendMail({
          from: process.env.EMAIL_FROM!,
          to: toAddress,
          subject: `PlanInsta New payment (${statusNorm})${shortPid ? ` — #${shortPid}` : ""} — ${userEmail}`,
          html,
          text,
        });

        emailed = true;
      }
    } catch (e) {
      console.error("Email send (internal payment notification) failed:", e);
    }
  }

  return NextResponse.json({
    success: true,
    message: shouldEmail
      ? emailed
        ? "Payment recorded and internal email sent."
        : "Payment recorded (internal email failed or skipped)."
      : "Payment recorded.",
    emailed,
  });
}
