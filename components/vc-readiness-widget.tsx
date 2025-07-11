"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, ArrowRight, CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import Link from "next/link"

export function VCReadinessWidget() {
  return (
    <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <Card className="border-0 shadow-xl rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
          <CardContent className="p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Left Content */}
              <div>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>

                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Are You VC Ready?</h3>

                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Take our comprehensive 6-step quiz and find out how close you are to landing investor funding. Get
                  personalized feedback on market opportunity, traction, team strength, and more.
                </p>

                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Based on VC criteria
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Actionable insights
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    7-minute assessment
                  </div>
                </div>

                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Link href="/vc-readiness-quiz">
                    Take the VC Readiness Quiz
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              {/* Right Visual */}
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl p-8 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-600">VC Readiness Score</div>
                        <div className="text-sm font-bold text-blue-600">78%</div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Market Opportunity</span>
                          <div className="flex items-center">
                            <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                              <div className="w-14 h-2 bg-green-500 rounded-full"></div>
                            </div>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Team Strength</span>
                          <div className="flex items-center">
                            <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                              <div className="w-10 h-2 bg-yellow-500 rounded-full"></div>
                            </div>
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Financial Readiness</span>
                          <div className="flex items-center">
                            <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                              <div className="w-6 h-2 bg-red-500 rounded-full"></div>
                            </div>
                            <XCircle className="h-4 w-4 text-red-500" />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Traction</span>
                          <div className="flex items-center">
                            <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                              <div className="w-12 h-2 bg-blue-500 rounded-full"></div>
                            </div>
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-500 text-center">
                          "Emerging - Gain traction and sharpen strategy"
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-blue-500 text-white rounded-2xl px-4 py-2 text-sm font-semibold shadow-lg animate-bounce">
                  VC Insights
                </div>
                <div className="absolute -bottom-4 -left-4 bg-indigo-500 text-white rounded-2xl px-4 py-2 text-sm font-semibold shadow-lg animate-pulse">
                  Investor Ready?
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
