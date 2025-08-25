import { NextResponse } from "next/server"
import Razorpay from "razorpay"

// Initialize Razorpay client
const client = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: Request) {
  try {
    const { amount } = await request.json()
    const order = await client.orders.create({
      amount: 1000,           // ← ₹10 in paise
      currency: "INR",
      receipt: `plan_receipt_${Date.now()}`,
      payment_capture: 1,
    })
    return NextResponse.json(order)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}