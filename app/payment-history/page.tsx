// app/payment-history/page.tsx
import React from "react"
import Link from "next/link"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import DashboardLayout from "@/components/dashboard-layout"

export default async function PaymentHistoryPage() {
  // Initialize Supabase client with auth cookies
  const supabase = createServerComponentClient({ cookies })

  // Fetch current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const userName = (user?.user_metadata as any)?.full_name || "User"

  // Fetch payment records
  const { data: payments } = await supabase
    .from("payments")
    .select("id, razorpay_order, razorpay_payment, amount, currency, paid_at")
    .order("paid_at", { ascending: false })

  return (
    <DashboardLayout currentPage="payments" userName={userName}>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Payment History</h1>
        {payments && payments.length > 0 ? (
          <ul className="space-y-3">
            {payments.map((p) => (
              <li key={p.id} className="p-4 border rounded-lg bg-white shadow-sm">
                <p>
                  <strong>Date:</strong> {new Date(p.paid_at).toLocaleString()}
                </p>
                <p>
                  <strong>Amount:</strong> {p.currency} {p.amount / 100}
                </p>
                <p>
                  <strong>Order ID:</strong> {p.razorpay_order}
                </p>
                <p>
                  <strong>Payment ID:</strong> {p.razorpay_payment}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No payments found.</p>
        )}
      </div>
    </DashboardLayout>
  )
}
