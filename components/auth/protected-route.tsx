// components/auth/protected-route.tsx
"use client"

import React, { ReactNode, useEffect } from "react"
import { useSession } from "@supabase/auth-helpers-react"
import { useRouter } from "next/navigation"

interface ProtectedRouteProps {
  children: ReactNode
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  redirectTo = "/auth/signin",
}: ProtectedRouteProps) {
  const session = useSession()
  const router = useRouter()

  // As soon as we know there is no session, redirect
  useEffect(() => {
    if (session === null) {
      router.replace(redirectTo)
    }
  }, [session, redirectTo, router])

  // While loading (undefined), show a spinner
  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If signed out, render nothing (we already redirected)
  if (session === null) {
    return null
  }

  // If we have a session, render the protected content
  return <>{children}</>
}
