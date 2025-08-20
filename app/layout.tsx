// app/layout.tsx
import React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ClientProviders } from "@/components/ClientProviders"
import { Toaster } from "@/components/ui/toaster"
import { NetworkStatusToaster } from "@/components/network-status-toaster" // ✅ NEW

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
        <ClientProviders>
          {/* ✅ One-time network status toasts (offline/online) */}
          <NetworkStatusToaster />
          {children}
          {/* ✅ Global toast portal */}
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  )
}
