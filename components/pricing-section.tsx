"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Star } from "lucide-react"
import { LeadCaptureModal } from "./lead-capture-modal"

const plans = [
  {
    name: "Starter Plan",
    price: "₹2,999",
    tax: "+ tax",
    description: "Perfect for entrepreneurs getting started",
    features: [
      "Up to 3 complete business plans",
      "GPT-3.5 Turbo AI model",
      "1 AI interaction per section",
      "Multilingual support",
      "Microsoft Word (.docx) export",
      "Plan storage & editing",
      "Folder organization",
      "Trash & recovery",
      "Lifetime access",
    ],
    popular: false,
  },
  {
    name: "Professional Plan",
    price: "₹3,999",
    tax: "+ tax",
    description: "For serious entrepreneurs and businesses",
    features: [
      "Up to 10 complete business plans",
      "GPT-4o AI model (Advanced)",
      "Unlimited AI interactions per section",
      "Multilingual support",
      "Microsoft Word (.docx) export",
      "Plan storage & editing",
      "Folder organization",
      "Trash & recovery",
      "Lifetime access",
      "Priority support",
    ],
    popular: true,
  },
]

export function PricingSection() {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState("")

  const handlePlanSelect = (planName: string) => {
    setSelectedPlan(planName)
    setIsLeadModalOpen(true)
  }

  return (
    <>
      <section id="pricing" className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-orange-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent{" "}
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">pricing</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that fits your needs. All plans include lifetime access to your generated business plans.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative rounded-3xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                  plan.popular
                    ? "border-2 border-orange-500 shadow-xl bg-gradient-to-br from-white to-orange-50"
                    : "border-0 shadow-lg bg-white hover:shadow-xl"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-2xl text-sm font-semibold flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </div>
                  </div>
                )}

                <CardHeader className="text-center pb-8 pt-8">
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl lg:text-5xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-2">{plan.tax}</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handlePlanSelect(plan.name)}
                    className={`w-full rounded-2xl py-3 font-semibold transition-all duration-300 transform hover:scale-105 ${
                      plan.popular
                        ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl"
                        : "bg-white text-gray-900 border-2 border-gray-300 hover:border-orange-500 hover:text-orange-600"
                    }`}
                  >
                    Get Started with {plan.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600">
              All plans include downloadable .docx files, folder organization, and lifetime access to your plans.
            </p>
          </div>
        </div>
      </section>

      <LeadCaptureModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        title={selectedPlan ? `Get Started with ${selectedPlan}` : "Get Started with PlanInsta"}
      />
    </>
  )
}
