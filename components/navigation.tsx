"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { LeadCaptureModal } from "./lead-capture-modal"

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Image
                src="/images/planinsta-logo.png"
                alt="PlanInsta"
                width={150}
                height={40}
                className="h-8 w-auto lg:h-10"
              />
              <div className="ml-3 hidden sm:block">
                <span className="text-lg font-bold text-gray-900">PlanInsta</span>
                <span className="text-sm text-gray-500 ml-1">by Wytmode</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection("features")}
                className="text-gray-700 hover:text-orange-600 transition-colors duration-200 font-medium"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-gray-700 hover:text-orange-600 transition-colors duration-200 font-medium"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection("testimonials")}
                className="text-gray-700 hover:text-orange-600 transition-colors duration-200 font-medium"
              >
                Testimonials
              </button>
              <Link href="/auth/signin" passHref>
                <Button variant="ghost" className="text-gray-700 hover:text-orange-600 hover:bg-transparent font-medium">
                  Login
                </Button>
              </Link>
              <Button
                onClick={() => setIsLeadModalOpen(true)}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl px-6 py-2 font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden bg-white border-t border-gray-200 py-4 animate-fade-in">
              <div className="flex flex-col space-y-4">
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-left text-gray-700 hover:text-orange-600 transition-colors duration-200 font-medium px-4 py-2"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="text-left text-gray-700 hover:text-orange-600 transition-colors duration-200 font-medium px-4 py-2"
                >
                  Pricing
                </button>
                <button
                  onClick={() => scrollToSection("testimonials")}
                  className="text-left text-gray-700 hover:text-orange-600 transition-colors duration-200 font-medium px-4 py-2"
                >
                  Testimonials
                </button>
                <Link href="/auth/signin" passHref>
                  <Button
                    variant="ghost"
                    className="justify-start text-gray-700 hover:text-orange-600 hover:bg-transparent font-medium"
                  >
                    Login
                  </Button>
                </Link>
                <div className="px-4">
                  <Button
                    onClick={() => setIsLeadModalOpen(true)}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl py-2 font-semibold"
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <LeadCaptureModal isOpen={isLeadModalOpen} onClose={() => setIsLeadModalOpen(false)} />
    </>
  )
}
