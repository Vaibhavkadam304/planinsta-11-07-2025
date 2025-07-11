// app/layout.tsx
import React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ClientProviders } from "@/components/ClientProviders"

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
        {/* client-only providers */}
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
