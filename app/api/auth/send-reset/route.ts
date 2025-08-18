// app/api/auth/send-reset/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 })
    }

    // ✅ Use canonical site URL; only fall back to request origin for localhost
    const url = new URL(req.url)
    const base =
      process.env.NEXT_PUBLIC_SITE_URL ??
      (url.hostname === "localhost" ? `${url.protocol}//${url.host}` : undefined)

    if (!base) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_SITE_URL must be set in production" },
        { status: 500 }
      )
    }

    // Server-only Supabase client (service role)
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data, error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo: `${base}/auth/reset-password` },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Return link (you can also email it via SMTP here if you want)
    return NextResponse.json({ ok: true, action_link: data?.action_link })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unexpected error" },
      { status: 500 }
    )
  }
}
