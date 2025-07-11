"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthLayout } from "@/components/auth-layout"
import { Mail, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { toast } = useToast()

  const handleResendEmail = async () => {
    setIsResending(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setEmailSent(true)
    toast({
      title: "Verification email sent!",
      description: "Please check your inbox and spam folder.",
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
            {emailSent ? <CheckCircle className="w-10 h-10 text-white" /> : <Mail className="w-10 h-10 text-white" />}
          </div>

          <CardTitle className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
            {emailSent ? "Email Sent!" : "Check your email"}
          </CardTitle>

          <p className="text-gray-600 leading-relaxed">
            {emailSent
              ? "We've sent another verification link to your email address. Please check your inbox and spam folder."
              : "We've sent a verification link to your email address. Please click the link to verify your account and complete the registration process."}
          </p>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <div className="space-y-4">
            {/* Resend Button */}
            <Button
              onClick={handleResendEmail}
              disabled={isResending}
              variant="outline"
              className="w-full border-2 border-gray-300 hover:border-orange-500 hover:text-orange-600 rounded-2xl h-12 font-semibold transition-all duration-300"
            >
              {isResending ? "Sending..." : "Resend Email"}
            </Button>

            {/* Back to Sign In */}
            <div className="text-center pt-4">
              <Link href="/auth/signin" className="text-orange-600 hover:text-orange-700 font-medium transition-colors">
                Back to Sign In
              </Link>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-8 p-4 bg-gray-50 rounded-2xl">
            <p className="text-sm text-gray-600 text-center">
              <strong>Didn't receive the email?</strong>
              <br />
              Check your spam folder or try resending the verification email.
            </p>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
