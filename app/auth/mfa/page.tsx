"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthLayout } from "@/components/auth-layout"
import { Shield, Smartphone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function MFAPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState("")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const { toast } = useToast()

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus()
  }, [])

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return // Prevent multiple characters

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError("")

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, 6)
    const newOtp = [...otp]

    for (let i = 0; i < pastedData.length && i < 6; i++) {
      if (/^\d$/.test(pastedData[i])) {
        newOtp[i] = pastedData[i]
      }
    }

    setOtp(newOtp)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const otpString = otp.join("")
    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit code")
      return
    }

    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Verification successful!",
      description: "You have been successfully authenticated.",
    })

    setIsLoading(false)
  }

  const handleResendCode = async () => {
    setIsResending(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Code sent!",
      description: "A new verification code has been sent to your device.",
    })

    setIsResending(false)
  }

  return (
    <AuthLayout>
      <Card className="border-0 shadow-2xl rounded-3xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-8">
          <div className="mb-6 lg:hidden">
            <Image
              src="/images/planinsta-logo.png"
              alt="PlanInsta"
              width={150}
              height={40}
              className="h-8 w-auto mx-auto"
            />
          </div>

          {/* Icon */}
          <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Shield className="w-10 h-10 text-white" />
          </div>

          <CardTitle className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Two-Factor Authentication</CardTitle>

          <p className="text-gray-600 leading-relaxed">
            Enter the 6-digit code sent to your phone or email to complete the authentication process.
          </p>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div className="space-y-4">
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={`w-12 h-12 text-center text-xl font-bold rounded-2xl input-focus ${
                      error ? "border-red-500 focus:border-red-500" : ""
                    }`}
                  />
                ))}
              </div>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || otp.join("").length !== 6}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl h-12 font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </Button>

            {/* Resend Code */}
            <div className="text-center space-y-4">
              <p className="text-gray-600 text-sm">Didn't receive the code?</p>
              <Button
                type="button"
                onClick={handleResendCode}
                disabled={isResending}
                variant="ghost"
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                {isResending ? "Sending..." : "Resend Code"}
              </Button>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-8 p-4 bg-gray-50 rounded-2xl flex items-start space-x-3">
            <Smartphone className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600">
              The verification code is valid for 10 minutes. If you don't receive it, check your spam folder or request
              a new code.
            </p>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
