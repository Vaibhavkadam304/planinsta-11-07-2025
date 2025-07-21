// app/plan-builder/payment/page.tsx
"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Script from "next/script"

export default function PaymentPage() {
  const router = useRouter()
  const [orderId, setOrderId] = useState<string | null>(null)

  async function onRazorpaySuccess(response: any) {
    try {
      await fetch("/api/razorpay/record-payment", {
        method:      "POST",
        credentials: "include",           // ⚠️ send cookies
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify({
          razorpay_order_id:   response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          amount:              response.razorpay_amount || 100,
          currency:            "INR",
          status:              "captured",
        }),
      })
    } catch (err) {
      console.error("⚠️ Failed to record payment:", err)
    }
    router.replace("/plan-builder?paid=true")
  }

  // ───── EARLY GATE: SKIP PAYMENT IF ALREADY PAID ─────
  // useEffect(() => {
  //   fetch("/api/razorpay/record-payment", {
  //     method:      "GET",
  //     credentials: "include",           // ⚠️ send cookies
  //   })
  //     .then(res => res.json())
  //     .then(({ paid }) => {
  //       if (paid) {
  //         router.replace("/plan-builder?paid=true")
  //       }
  //     })
  //     .catch(() => {})
  // }, [router])

  // ───── CREATE ORDER ─────
  
  useEffect(() => {
    fetch("/api/razorpay/create-order", {
      method:      "POST",
      credentials: "include",           // ⚠️ (optional but safe)
      headers:     { "Content-Type": "application/json" },
      body:        JSON.stringify({ amount: 100 }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.id) setOrderId(data.id)
      })
      .catch(err => console.error("Order creation failed", err))
  }, [])

  // ───── RAZORPAY CHECKOUT ─────
  useEffect(() => {
    if (!orderId) return

    const options: any = {
      key:      process.env.NEXT_PUBLIC_RAZORPAY_KEY!,
      amount:   100,
      currency: "INR",
      name:     "Your App Name",
      order_id: orderId,
      handler:  onRazorpaySuccess,
      prefill:  { name: "", email: "" },
      theme:    { color: "#0C4A6E" },
    }

    const rzp = new (window as any).Razorpay(options)
    rzp.open()
  }, [orderId, router])

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="h-screen flex items-center justify-center bg-gray-100">
        {!orderId
          ? <p className="text-lg">Preparing payment...</p>
          : <p className="text-lg">Opening checkout...</p>
        }
      </div>
    </>
  )
}
