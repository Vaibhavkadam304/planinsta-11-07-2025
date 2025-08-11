"use client"

import React, { useState } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
})

export default function ForgotPasswordPage() {
  const supabase = useSupabaseClient()
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  })

  const [formData, setFormData] = useState({ email: "" })

  const validateForm = () => {
    form.trigger()
    try {
      formSchema.parse(formData)
      return true
    } catch {
      return false
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ email: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)

    // ✅ Fix: redirect to your reset page (dev+prod safe)
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin

    const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
      redirectTo: `${baseUrl}/auth/reset-password`,
    })

    if (error) {
      toast({
        title: "Error sending reset email",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Reset email sent!",
        description: "Please check your inbox for instructions.",
      })
      setEmailSent(true)
    }

    setIsLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="w-full max-w-md p-6 bg-white rounded-md shadow-md">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          Forgot Password
        </h1>

        {emailSent ? (
          <div className="text-green-500 text-center">
            Password reset email sent! Please check your inbox.
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          handleChange(e)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button disabled={isLoading} type="submit" className="w-full">
                {isLoading ? "Sending..." : "Reset Password"}
              </Button>
            </form>
          </Form>
        )}

        <p className="mt-4 text-center text-sm text-gray-600">
          Remembered your password?{" "}
          <Link href="/auth/signin" className="text-orange-600 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
