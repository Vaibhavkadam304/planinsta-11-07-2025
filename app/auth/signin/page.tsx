"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthLayout } from "@/components/auth-layout"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react"

export default function SignInPage() {
  const supabase = useSupabaseClient()
  const session = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Redirect if already signed in
  useEffect(() => {
    if (session) {
      router.replace("/dashboard")
    }
  }, [session, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }
    if (!formData.password) {
      newErrors.password = "Password is required"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    // If offline, show a single toast and stop here.
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      toast({
        variant: "destructive",
        title: "No internet connection",
        description: "Please reconnect and try again.",
      })
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      // Don’t let this block sign-in if it fails while offline
      try {
        await supabase.auth.signOut()
      } catch {
        /* ignore */
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      })

      if (error) {
        toast({
          title: "Error signing in",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Welcome back!",
        description: "You have been successfully signed in.",
      })
      router.replace("/dashboard")
    } catch (err: any) {
      const msg = (err?.message || "").toLowerCase()
      const looksNetwork =
        msg.includes("failed to fetch") ||
        msg.includes("enotfound") ||
        msg.includes("network") ||
        msg.includes("timeout")

      toast({
        variant: "destructive",
        title: looksNetwork ? "Network error" : "Unexpected error",
        description: looksNetwork
          ? "Can’t reach the server. Please check your connection and try again."
          : err?.message || "Something went wrong.",
      })
    } finally {
      setIsLoading(false)
    }
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
          <CardTitle className="text-2xl lg:text-3xl font-bold text-gray-900">
            Welcome back
          </CardTitle>
          <p className="text-gray-600 mt-2">Sign in to your PlanInsta account</p>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`pl-10 rounded-2xl input-focus h-12 ${
                    errors.email ? "border-red-500 focus:border-red-500" : ""
                  }`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`pl-10 pr-10 rounded-2xl input-focus h-12 ${
                    errors.password ? "border-red-500 focus:border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link
                href="/auth/forgot-password"
                className="text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl h-12 font-semibold transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            {/* Sign Up Link */}
            <div className="text-center pt-4">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
