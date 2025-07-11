"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "Founder, TechStart Solutions",
    image: "/placeholder.svg?height=60&width=60",
    quote:
      "PlanInsta helped me create a professional business plan in just 20 minutes. The AI suggestions were spot-on!",
  },
  {
    name: "Priya Sharma",
    role: "CEO, EcoFriendly Products",
    image: "/placeholder.svg?height=60&width=60",
    quote: "The multilingual support was a game-changer for our international expansion plans. Highly recommended!",
  },
  {
    name: "Michael Chen",
    role: "Startup Consultant",
    image: "/placeholder.svg?height=60&width=60",
    quote: "I use PlanInsta for all my client projects. The quality and speed of plan generation is unmatched.",
  },
  {
    name: "Sarah Johnson",
    role: "Small Business Owner",
    image: "/placeholder.svg?height=60&width=60",
    quote:
      "Finally, a tool that makes business planning accessible. Got my bank loan approved with the plan I created!",
  },
  {
    name: "Amit Patel",
    role: "MBA Student, IIM",
    image: "/placeholder.svg?height=60&width=60",
    quote: "Perfect for academic projects and competitions. The industry templates saved me hours of research.",
  },
  {
    name: "Lisa Rodriguez",
    role: "Restaurant Owner",
    image: "/placeholder.svg?height=60&width=60",
    quote: "The financial projections feature helped me secure funding for my second restaurant location.",
  },
]

export function TestimonialsSection() {
  const [visibleCards, setVisibleCards] = useState<boolean[]>(new Array(testimonials.length).fill(false))
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observers = cardRefs.current.map((ref, index) => {
      if (!ref) return null

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleCards((prev) => {
              const newVisible = [...prev]
              newVisible[index] = true
              return newVisible
            })
          }
        },
        { threshold: 0.1 },
      )

      observer.observe(ref)
      return observer
    })

    return () => {
      observers.forEach((observer) => observer?.disconnect())
    }
  }, [])

  return (
    <section id="testimonials" className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Trusted by{" "}
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              entrepreneurs worldwide
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See what our customers have to say about their experience with PlanInsta.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              ref={(el) => (cardRefs.current[index] = el)}
              className={`transform transition-all duration-700 ${
                visibleCards[index] ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-3xl border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-8">
                  {/* Stars */}
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-gray-700 mb-6 leading-relaxed italic">"{testimonial.quote}"</p>

                  {/* Author */}
                  <div className="flex items-center">
                    <img
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4 object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
