"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

interface DashboardLayoutProps {
  children: React.ReactNode
  currentPage: string
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { id: "plans", label: "My Plans", icon: FileText, href: "/dashboard/plans" },
  { id: "folders", label: "Folders", icon: FolderOpen, href: "/dashboard/folders" },
  { id: "trash", label: "Trash", icon: Trash2, href: "/dashboard/trash" },
  { id: "settings", label: "Account Settings", icon: Settings, href: "/dashboard/settings" },
  { id: "help", label: "Help & Support", icon: HelpCircle, href: "/dashboard/help" },
]

export function DashboardLayout({ children, currentPage }: { children: React.ReactNode; currentPage: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const router = useRouter()

  const userName = user?.user_metadata?.full_name || user?.email || "John Doe"
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const handleLogout = async () => {
    await signOut()
  }

  const currentPageTitle = navigationItems.find((item) => item.id === currentPage)?.label || "Dashboard"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Image
                src="/images/planinsta-logo.png"
                alt="PlanInsta"
                width={150}
                height={40}
                className="h-8 w-auto lg:h-10"
              />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
                    currentPage === item.id
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100 hover:text-orange-600"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Right Side - Notifications & User Menu */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative hidden sm:flex">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-100 rounded-2xl">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block font-medium text-gray-700">{userName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl bg-white">
                  <DropdownMenuItem className="flex items-center space-x-2 rounded-xl">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center space-x-2 rounded-xl">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
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

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-4 animate-fade-in">
              <nav className="flex flex-col space-y-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-2xl text-left transition-all duration-200 ${
                      currentPage === item.id
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                        : "text-gray-700 hover:bg-gray-100 hover:text-orange-600"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Page Title Bar */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{currentPageTitle}</h1>
            <p className="text-gray-600 mt-1">
              {currentPage === "dashboard" && "Overview of your business plans and activity"}
              {currentPage === "plans" && "Manage and organize your business plans"}
              {currentPage === "folders" && "Organize your plans into folders"}
              {currentPage === "trash" && "Recover or permanently delete plans"}
              {currentPage === "settings" && "Manage your account preferences and security"}
              {currentPage === "help" && "Get help and support"}
            </p>
          </div>

          {/* Page-specific actions can be added here */}
            {(currentPage === "dashboard" || currentPage === "plans") && (
              <Button
                onClick={() => {
                  if (!user) {
                    router.push("/auth/signin");
                  } else {
                    router.push("/plan-builder");
                  }
                }}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl px-6 py-3 font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <FileText className="h-5 w-5 mr-2" />
                Create New Plan
              </Button>
            )}

        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 lg:px-8 py-8 bg-gray-50 min-h-screen">{children}</main>
    </div>
  )
}
