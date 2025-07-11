"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, ArrowRight } from "lucide-react"
import Link from "next/link"

export function DiagnosticQuizWidget() {
  return (
    <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-orange-50">
      <div className="max-w-7xl mx-auto">
        <Card className="border-0 shadow-xl rounded-3xl bg-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
          <CardContent className="p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Left Content */}
              <div>
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6">
                  <Search className="h-8 w-8 text-white" />
                </div>

                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                  Not sure if your business idea is ready?
                </h3>

                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Take our quick diagnostic quiz and uncover blind spots in your startup strategy. Get personalized
                  recommendations to strengthen your business foundation before you pitch investors.
                </p>

                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Free assessment
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    No login required
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    5-minute quiz
                  </div>
                </div>

                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Link href="/whats-missing">
                    Find Out What's Missing
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              {/* Right Visual */}
              <div className="relative">
                <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-3xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-600">Business Idea Health</div>
                        <div className="text-sm font-bold text-orange-600">72%</div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Problem & Solution</span>
                          <div className="flex items-center">
                            <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                              <div className="w-12 h-2 bg-green-500 rounded-full"></div>
                            </div>
                            <span className="text-xs text-green-600">Strong</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Market Research</span>
                          <div className="flex items-center">
                            <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                              <div className="w-8 h-2 bg-yellow-500 rounded-full"></div>
                            </div>
                            <span className="text-xs text-yellow-600">Needs Work</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Financial Plan</span>
                          <div className="flex items-center">
                            <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                              <div className="w-4 h-2 bg-red-500 rounded-full"></div>
                            </div>
                            <span className="text-xs text-red-600">Missing</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-orange-500 text-white rounded-2xl px-4 py-2 text-sm font-semibold shadow-lg animate-bounce">
                  Free Quiz
                </div>
                <div className="absolute -bottom-4 -left-4 bg-green-500 text-white rounded-2xl px-4 py-2 text-sm font-semibold shadow-lg animate-pulse">
                  Instant Results
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
