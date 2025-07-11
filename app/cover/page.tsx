"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Sparkles, Clock, FileText, Users, Target, Zap } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function CoverPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <Image
              src="/images/planinsta-logo.png"
              alt="PlanInsta Logo"
              width={120}
              height={120}
              className="rounded-2xl shadow-lg"
            />
          </div>

          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Plan<span className="text-orange-600">Insta</span>
          </h1>

          <p className="text-2xl text-gray-600 mb-4 max-w-3xl mx-auto">AI-Powered Business Plan Generator</p>

          <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
            Transform your business idea into a professional, investor-ready plan in minutes, not weeks.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/plan-builder">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg">
                Start Building Your Plan
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/vc-readiness-quiz">
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg border-orange-600 text-orange-600 hover:bg-orange-50"
              >
                Take VC Readiness Quiz
              </Button>
            </Link>
          </div>
        </div>

        {/* Key Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="hover-lift">
            <CardContent className="p-8 text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered Generation</h3>
              <p className="text-gray-600">
                Advanced GPT-4o technology creates comprehensive, professional business plans tailored to your industry.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-8 text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Minutes, Not Weeks</h3>
              <p className="text-gray-600">
                Generate complete 10-20 page business plans in under 15 minutes with our guided quiz interface.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-8 text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Professional Format</h3>
              <p className="text-gray-600">
                Export investor-ready documents in Microsoft Word format, ready for banks, VCs, and stakeholders.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">15 Min</div>
              <div className="text-gray-600">Average Plan Creation Time</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">20 Pages</div>
              <div className="text-gray-600">Professional Plan Length</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">9 Sections</div>
              <div className="text-gray-600">Comprehensive Coverage</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">4 Languages</div>
              <div className="text-gray-600">Multi-lingual Support</div>
            </div>
          </div>
        </div>

        {/* Target Audience */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Perfect For</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center">
              <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Entrepreneurs</h3>
              <p className="text-gray-600 text-sm">First-time founders and startup teams</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold mb-2">Small Business Owners</h3>
              <p className="text-gray-600 text-sm">Local businesses seeking funding</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Students & Consultants</h3>
              <p className="text-gray-600 text-sm">Academic projects and client work</p>
            </div>
          </div>
        </div>

        {/* Pricing Preview */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl text-white p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Simple, One-Time Pricing</h2>
          <p className="text-xl mb-6 opacity-90">No subscriptions. No hidden fees. Lifetime access to your plans.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="bg-white/20 rounded-lg p-4">
              <div className="text-2xl font-bold">₹2,999</div>
              <div className="text-sm opacity-90">Starter Plan • 3 Plans • GPT-3.5</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <div className="text-2xl font-bold">₹3,999</div>
              <div className="text-sm opacity-90">Professional • 10 Plans • GPT-4o</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-gray-600 mb-4">
            A product by <span className="font-semibold">Wytmode Cloud Private Limited</span>
          </p>
          <p className="text-sm text-gray-500">Launching June 26, 2025 • Built with AI • Made in India 🇮🇳</p>
        </div>
      </div>
    </div>
  )
}
