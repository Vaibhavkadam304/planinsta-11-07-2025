// app/layout.tsx
import React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ClientProviders } from "@/components/ClientProviders"
import { Toaster } from "@/components/ui/toaster"
import { NetworkStatusToaster } from "@/components/network-status-toaster"

// ⬇️ NEW: pick a clean sans
import { Inter } from "next/font/google"
const inter = Inter({ subsets: ["latin"], display: "swap" })

export const metadata: Metadata = {
  title: "PlanInsta Dashboard - AI Business Plan Builder",
  description: "Manage your AI-generated business plans with PlanInsta",
  generator: "v0.dev",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // ⬇️ Apply font on the root element
    <html lang="en" className={inter.className}>
      {/* ⬇️ Optional: smoother text rendering */}
      <body className="antialiased">
        <ClientProviders>
          <NetworkStatusToaster />
          {children}
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  )
}
