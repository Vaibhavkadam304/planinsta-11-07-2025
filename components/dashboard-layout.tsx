// components/dashboard-layout.tsx
"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSupabaseClient } from "@supabase/auth-helpers-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

import {
  LayoutDashboard,
  FileText,
  Trash2,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  CreditCard,
} from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  currentPage: string
  userName: string
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { id: "plans", label: "My Plans", icon: FileText, href: "/dashboard/plans" },
  { id: "settings", label: "Account Settings", icon: Settings, href: "/dashboard/settings" },
  { id: "payments", label: "Payment History", icon: CreditCard, href: "/payment-history" },
  { id: "trash", label: "Trash", icon: Trash2, href: "/dashboard/trash" },
]

export default function DashboardLayout({
  children,
  currentPage,
  userName,
}: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const supabase = useSupabaseClient()
  const router = useRouter()

  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/signin")
  }

  const currentPageTitle =
    navigationItems.find((item) => item.id === currentPage)?.label || currentPage

  const isDashboard = currentPage === "dashboard"

  return (
    <div className="min-h-screen bg-neutral-50 text-gray-900">
      <div className="mx-auto grid grid-cols-1 lg:grid-cols-[260px_1fr] max-w-[1400px]">
        {/* SIDEBAR */}
        <aside className="hidden lg:flex flex-col sticky top-0 h-screen border-r border-neutral-400/30 bg-white/40 backdrop-blur-sm">
          <div className="px-6 pt-7 pb-5 border-b border-neutral-200/60">
            <Image
              src="/images/planinsta-logo.png"
              alt="PlanInsta"
              width={160}
              height={40}
              className="h-6 w-auto"
              priority
            />
          </div>

          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const active = currentPage === item.id
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition",
                      active
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm"
                        : "text-gray-700 hover:bg-gray-100",
                    ].join(" ")}
                  >
                    {/* active indicator bar */}
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-white/90" />
                    )}

                    <span
                      className={[
                        "grid place-items-center rounded-lg border h-9 w-9",
                        active
                          ? "border-white/30 bg-white/10"
                          : "border-neutral-200/60 bg-white",
                      ].join(" ")}
                    >
                      <item.icon className="h-5 w-5" />
                    </span>

                    <span className="font-small">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </nav>
        </aside>

        {/* MAIN */}
        <div className="min-h-screen flex flex-col">
          {/* Sticky Header */}
          <header className="sticky top-0 z-20 bg-white/75 backdrop-blur-md border-b border-neutral-200/60">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileMenuOpen((o) => !o)}
                  className="lg:hidden text-gray-700 hover:text-gray-900"
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
                <h2 className="text-2xl font-semibold tracking-tight">{currentPageTitle}</h2>
              </div>

              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 px-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:inline-block">{userName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-2xl bg-white">
                    <DropdownMenuItem asChild className="rounded-xl">
                      <Link href="/dashboard/settings" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600 rounded-xl cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Actions bar */}
            <div className="px-4 sm:px-6 pb-4">
              <div className="rounded-2xl bg-white ring-1 ring-neutral-200/60 shadow-sm px-4 sm:px-6 py-4 flex items-center justify-between">
                <p className="text-gray-600 text-sm sm:text-base">
                  {currentPage === "dashboard" && "Overview of your business plans and activity"}
                  {currentPage === "plans" && "Manage and organize your business plans"}
                  {currentPage === "trash" && "Recover or permanently delete plans"}
                  {currentPage === "settings" && "Manage your account preferences and security"}
                </p>

                {(currentPage === "dashboard" || currentPage === "plans") && (
                  <Button
                    onClick={() => router.push("/plan-builder")}
                    className="rounded-2xl px-5 py-2.5 font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Create New Plan
                  </Button>
                )}
              </div>
            </div>
          </header>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-b border-neutral-200/60 bg-white">
              <nav className="px-4 py-3 space-y-1">
                {navigationItems.map((item) => {
                  const active = currentPage === item.id
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={[
                        "flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition",
                        active
                          ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm"
                          : "text-gray-700 hover:bg-gray-100",
                      ].join(" ")}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
                <div className="pt-2 mt-2 border-t border-neutral-200/60">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-gray-700 hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut className="h-5 w-5" /> <span>Logout</span>
                  </button>
                </div>
              </nav>
            </div>
          )}

          {/* Main content with dashboard-only background */}
          <main className="relative flex-1 px-4 sm:px-6 pb-10">
          {isDashboard && (
            <>
              {/* BG image */}
              <Image
                src="/images/bg7-img.png"
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover z-0"     // ← keep it in the same stacking context
              />

              {/* Soft overlay for readability (optional) */}
              <div className="absolute inset-0 z-0 bg-white/10" />
            </>
          )}

          {/* Content ABOVE the bg/overlay */}
          <div className="relative z-10 mx-auto max-w-6xl">
            {children}
          </div>
        </main>
        </div>
      </div>
    </div>
  )
}
