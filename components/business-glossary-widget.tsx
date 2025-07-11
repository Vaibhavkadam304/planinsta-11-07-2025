"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, ArrowRight } from "lucide-react"
import Link from "next/link"

export function BusinessGlossaryWidget() {
  return (
    <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-7xl mx-auto">
        <Card className="border-0 shadow-xl rounded-3xl bg-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
          <CardContent className="p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Left Content */}
              <div>
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>

                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Confused by business jargon?</h3>

                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Access our comprehensive business glossary with 100+ essential terms. From startup lingo to financial
                  metrics, get clear definitions that help you speak the language of business confidently.
                </p>

                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    100+ business terms
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>7 key categories
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Searchable & organized
                  </div>
                </div>

                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Link href="/glossary">
                    Explore Business Glossary
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              {/* Right Visual */}
              <div className="relative">
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-600">Business Terms</div>
                        <div className="text-sm font-bold text-green-600">100+</div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">MVP</span>
                          <div className="flex items-center">
                            <div className="text-xs text-gray-500 max-w-32 truncate">Minimum Viable Product</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">CAC</span>
                          <div className="flex items-center">
                            <div className="text-xs text-gray-500 max-w-32 truncate">Customer Acquisition Cost</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">LTV</span>
                          <div className="flex items-center">
                            <div className="text-xs text-gray-500 max-w-32 truncate">Lifetime Value</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">B2B</span>
                          <div className="flex items-center">
                            <div className="text-xs text-gray-500 max-w-32 truncate">Business to Business</div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-500 text-center">
                          "Finance • Legal • Marketing • Strategy"
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-green-500 text-white rounded-2xl px-4 py-2 text-sm font-semibold shadow-lg animate-bounce">
                  Free Access
                </div>
                <div className="absolute -bottom-4 -left-4 bg-emerald-500 text-white rounded-2xl px-4 py-2 text-sm font-semibold shadow-lg animate-pulse">
                  Quick Reference
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
