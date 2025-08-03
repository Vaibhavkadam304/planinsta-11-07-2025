// components/dashboard-layout.tsx

"use client"

import React, { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  FolderOpen,
  Trash2,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  CreditCard,          // ← add this
} from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  currentPage: string
  userName: string
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { id: "plans",     label: "My Plans",  icon: FileText,        href: "/dashboard/plans" },
  // { id: "folders",   label: "Folders",   icon: FolderOpen,     href: "/dashboard/folders" },
  { id: "trash",     label: "Trash",     icon: Trash2,          href: "/dashboard/trash" },
  { id: "settings",  label: "Account Settings", icon: Settings, href: "/dashboard/settings" },
  {
    id: "payments",
    label: "Payment History",
    icon: CreditCard,               // ← switch icon
    href: "/payment-history",       // ← point to your new page
  },
]

export default function DashboardLayout({
  children,
  currentPage,
  userName,
}: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const supabase = useSupabaseClient()
  const router = useRouter()

  // Derive initials from the passed-in name:
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/signin")
  }

  // Find the pretty page title
  const currentPageTitle =
    navigationItems.find((item) => item.id === currentPage)?.label || currentPage

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* ─── SIDEBAR (desktop) ───────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="px-6 py-8">
          <Image
            src="/images/planinsta-logo.png"
            alt="PlanInsta"
            width={150}
            height={40}
            className="h-10 w-auto"
          />
        </div>
        <nav className="flex-1 px-6 space-y-1">
          {navigationItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                currentPage === item.id
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
      </aside>

      {/* ─── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
            <h2 className="text-xl font-semibold text-gray-800 capitalize">
              {currentPageTitle}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-900">
              <Bell className="h-6 w-6" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    {/* remove this line entirely */}
                    {/* <AvatarImage src="/placeholder.svg?width=32&height=32" /> */}
                    <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span>{userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl bg-white">
                <DropdownMenuItem asChild className="flex items-center space-x-2 rounded-xl">
                  <Link href="/dashboard/settings">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-red-600 rounded-xl cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Mobile Navigation Panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4 animate-fade-in">
            <nav className="flex flex-col space-y-2 px-4">
              {navigationItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-2xl text-left transition-all duration-200 ${
                    currentPage === item.id
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100 hover:text-orange-600"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </a>
              ))}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                >
                  <LogOut className="h-5 w-5" /> <span>Logout</span>
                </button>
              </div>
            </nav>
          </div>
        )}

        {/* Page Actions Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-gray-600">
              {currentPage === "dashboard" && "Overview of your business plans and activity"}
              {currentPage === "plans" && "Manage and organize your business plans"}
              {/* {currentPage === "folders" && "Organize your plans into folders"} */}
              {currentPage === "trash" && "Recover or permanently delete plans"}
              {currentPage === "settings" && "Manage your account preferences and security"}
              {currentPage === "help" && "Get help and support"}
            </p>
          </div>

          {(currentPage === "dashboard" || currentPage === "plans") && (
            <Button
              onClick={() => router.push("/plan-builder")}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl px-6 py-3 font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <FileText className="h-5 w-5 mr-2" />
              Create New Plan
            </Button>
          )}
        </div>

        {/* Main Content */}
        <main className="px-6 py-8 bg-gray-100 flex-1">{children}</main>
      </div>
    </div>
  )
}
