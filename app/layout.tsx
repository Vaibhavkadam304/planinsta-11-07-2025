// app/layout.tsx
import React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ClientProviders } from "@/components/ClientProviders"
import { Toaster } from "@/components/ui/toaster" // ✅ Add this

export const metadata: Metadata = {
  title: "PlanInsta Dashboard - AI Business Plan Builder",
  description: "Manage your AI-generated business plans with PlanInsta",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* ✅ Wrap toaster inside provider to enable toast globally */}
        <ClientProviders>
          {children}
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  )
}
