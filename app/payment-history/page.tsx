// app/payment-history/page.tsx
import React from "react"
import { cookies } from "next/headers"
import Link from "next/link"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, CreditCard, IndianRupee } from "lucide-react"

function formatAmount(paise: number, currency = "INR") {
  if (currency === "INR") return `₹${(paise / 100).toLocaleString("en-IN")}`
  return `${currency} ${(paise / 100).toLocaleString()}`
}

export default async function PaymentHistoryPage() {
  const cookieStore = await cookies()
  const supabase = createServerComponentClient({
    cookies: () => cookieStore,
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const userName = (user?.user_metadata as any)?.full_name || "User"

  const { data: payments = [] } = await supabase
    .from("payments")
    .select("id, razorpay_order, razorpay_payment, amount, currency, paid_at")
    .order("paid_at", { ascending: false })

  return (
    <DashboardLayout currentPage="payments" userName={userName}>
      <div className="p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold bg-gradient-to-r from-[#FF7A00] to-[#F0435C] bg-clip-text text-transparent inline-flex items-center gap-2">
            <CreditCard className="w-7 h-7" />
            Payment History
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            All your completed payments are listed below.
          </p>
        </div>

        {payments.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {payments.map((p) => (
              <Card key={p.id} className="bg-white shadow-sm hover:shadow-md transition">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <IndianRupee className="w-4 h-4" />
                    {formatAmount(p.amount, p.currency)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    {p.paid_at ? new Date(p.paid_at).toLocaleString() : "—"}
                  </p>
                  <p className="break-all">
                    <span className="font-medium">Order ID:</span> {p.razorpay_order}
                  </p>
                  <p className="break-all">
                    <span className="font-medium">Payment ID:</span> {p.razorpay_payment}
                  </p>
                  <div className="pt-2">
                    <Badge variant="secondary" className="rounded-full">
                      Paid
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white shadow-sm">
            <CardContent className="py-14 text-center space-y-3">
              <p className="text-sm text-muted-foreground">No payments found.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
