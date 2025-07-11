"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"
import { LeadCaptureModal } from "./lead-capture-modal"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export function HeroSection() {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false)
  const { user } = useAuth()
  const router = useRouter()


  return (
    <>
      <section className="pt-20 lg:pt-32 pb-16 lg:pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6 animate-fade-in-up">
                Build your business plan in{" "}
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  minutes, not weeks
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 mb-8 leading-relaxed animate-fade-in-up animate-delay-100">
                PlanInsta is your AI partner to generate professional, investor-ready business plans effortlessly.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up animate-delay-200">
                <Button
                    onClick={() => {
                      if (!user) {
                        // not signed in → go to login
                        router.push("/auth/signin")
                      } else {
                        // signed in → open the lead modal
                        setIsLeadModalOpen(true)
                      }
                    }}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Create Your Plan
                </Button>
                <Button
                  variant="outline"
                  className="bg-white text-gray-700 border-2 border-gray-300 hover:border-orange-500 hover:text-orange-600 rounded-2xl px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Explore Demo
                </Button>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative animate-fade-in-up animate-delay-300">
              <div className="bg-white rounded-3xl shadow-2xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl h-64 lg:h-80 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Business Plan Builder</h3>
                    <p className="text-gray-600">AI-powered plan generation in real-time</p>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-orange-500 text-white rounded-2xl px-4 py-2 text-sm font-semibold shadow-lg animate-bounce">
                15 min setup
              </div>
              <div className="absolute -bottom-4 -left-4 bg-green-500 text-white rounded-2xl px-4 py-2 text-sm font-semibold shadow-lg animate-pulse">
                Investor-ready
              </div>
            </div>
          </div>
        </div>
      </section>

      <LeadCaptureModal isOpen={isLeadModalOpen} onClose={() => setIsLeadModalOpen(false)} />
    </>
  )
}
