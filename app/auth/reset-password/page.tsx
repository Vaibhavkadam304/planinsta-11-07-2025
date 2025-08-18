"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthLayout } from "@/components/auth-layout"
import { Eye, EyeOff, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSupabaseClient } from "@supabase/auth-helpers-react"

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [ready, setReady] = useState(false)

  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useSupabaseClient()

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const run = async () => {
      // 1) PKCE: handle ?code= exchange
      const code = searchParams.get("code")
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          toast({
            title: "Invalid or expired link",
            description: error.message || "Please request a new password reset link.",
            variant: "destructive",
          })
          router.replace("/auth/forgot-password")
          return
        }
        setReady(true)
        // Clean the URL so refreshes don’t re-run the exchange
        router.replace("/auth/reset-password")
        return
      }

      // 2) If the link used the legacy hash flow (#access_token), your
      // ClientProviders with detectSessionInUrl:true will process it automatically.
      // We just wait for a session if not present yet.
      const { data: sessionData } = await supabase.auth.getSession()
      if (sessionData?.session) {
        setReady(true)
        return
      }

      const { data } = supabase.auth.onAuthStateChange((_e, session) => {
        if (session) setReady(true)
      })
      unsubscribe = () => data.subscription.unsubscribe()
    }

    run()
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [searchParams, supabase, router, toast])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.password) newErrors.password = "Password is required"
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters"

    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password"
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)

    const { error } = await supabase.auth.updateUser({ password: formData.password })
    setIsLoading(false)

    if (error) {
      toast({
        title: "Error updating password",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Password updated",
      description: "You can now sign in with your new password.",
    })
    router.push("/auth/signin")
  }

  if (!ready) return null // or a spinner

  return (
    <AuthLayout>
      <Card className="border-0 shadow-2xl rounded-3xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-2xl lg:text-3xl font-bold text-gray-900">Reset Password</CardTitle>
          <p className="text-gray-600 mt-2">Enter your new password</p>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`pl-10 pr-10 rounded-2xl input-focus h-12 ${errors.password ? "border-red-500 focus:border-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className={`pl-10 pr-10 rounded-2xl input-focus h-12 ${errors.confirmPassword ? "border-red-500 focus:border-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl h-12 font-semibold transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? "Updating Password..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
