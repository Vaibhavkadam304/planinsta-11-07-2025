// components/PaymentFormClient.tsx
"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Script from "next/script"

export default function PaymentFormClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const amount = Number(searchParams.get("amount") || 199900) // paise (₹1,999)
  const [orderId, setOrderId] = useState<string | null>(null)

  async function onRazorpaySuccess(response: any) {
    try {
      await fetch("/api/razorpay/record-payment", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id:   response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          amount,
          currency: "INR",
          status:   "captured",
        }),
      })
    } catch (err) {
      console.error("⚠️ Failed to record payment:", err)
    }
    router.replace("/plan-builder?paid=true")
  }

  // ───── CREATE ORDER ─────
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch("/api/razorpay/create-order", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount }),
        })
        const data = await res.json()
        if (data.id) setOrderId(data.id)
        else throw new Error("No order id returned")
      } catch (err) {
        console.error("Order creation failed", err)
      }
    })()
  }, [amount])

  // ───── RAZORPAY CHECKOUT ─────
  useEffect(() => {
    if (!orderId) return
    const options: any = {
      key:      process.env.NEXT_PUBLIC_RAZORPAY_KEY!,
      amount,
      currency: "INR",
      name:     "Your App Name",
      order_id: orderId,
      handler:  onRazorpaySuccess,
      prefill:  { name: "", email: "" },
      theme:    { color: "#0C4A6E" },
    }
    const rzp = new (window as any).Razorpay(options)
    rzp.open()
  }, [orderId])

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="h-screen flex items-center justify-center bg-gray-100">
        {!orderId
          ? <p className="text-lg">Preparing payment...</p>
          : <p className="text-lg">Opening checkout...</p>}
      </div>
    </>
  )
}
