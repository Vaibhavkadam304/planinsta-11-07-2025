"use client"

import type React from "react"

import Image from "next/image"
import { Check, FileText } from "lucide-react"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md animate-fade-in-up">{children}</div>
      </div>

      {/* Right Side - Info Panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-gray-900 to-gray-800 items-center justify-center p-8 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-orange-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-red-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-white max-w-lg animate-slide-in-right">
          {/* Logo */}
          <div className="mb-8">
            <Image
              src="/images/planinsta-logo.png"
              alt="PlanInsta"
              width={180}
              height={48}
              className="h-12 w-auto filter brightness-0 invert"
            />
          </div>

          {/* Main Content */}
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
            PlanInsta: Your AI Business Plan Partner
          </h2>

          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Build structured, investor-ready business plans in minutes using AI. No design or financial background
            needed.
          </p>

          {/* Feature List */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-gray-300">Multilingual exports (.docx)</span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-gray-300">Real-time preview & edits</span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-gray-300">Lifetime access, one-time pricing</span>
            </div>
          </div>

          {/* Visual Mockup */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold">AI Business Plan Builder</h4>
                <p className="text-sm text-gray-400">Generate plans in 15 minutes</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="h-2 bg-white/20 rounded-full"></div>
              <div className="h-2 bg-white/20 rounded-full"></div>
              <div className="h-2 bg-orange-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
