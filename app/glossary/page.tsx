"use client"

import { useState, useMemo } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, BookOpen, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LeadCapturePopup } from "@/components/lead-capture-popup"

interface GlossaryTerm {
  category: string
  term: string
  definition: string
  formula?: string
}

const glossaryData: GlossaryTerm[] = [
  // Business & Strategy
  {
    category: "Business & Strategy",
    term: "Business Model",
    definition: "A company's plan for making a profit by specifying products/services, target markets, and costs.",
  },
  {
    category: "Business & Strategy",
    term: "Value Proposition",
    definition: "The unique benefit a product or service provides to customers.",
  },
  {
    category: "Business & Strategy",
    term: "Revenue Stream",
    definition: "Sources from which a business earns money from its customers.",
  },
  {
    category: "Business & Strategy",
    term: "Competitive Advantage",
    definition: "A condition that puts a company in a superior position over its competitors.",
  },
  {
    category: "Business & Strategy",
    term: "Business Plan",
    definition: "A written document outlining a company's goals and the strategy to achieve them.",
  },
  {
    category: "Business & Strategy",
    term: "Go-to-Market Strategy",
    definition: "The plan used to deliver a product to end customers and gain competitive advantage.",
  },
  {
    category: "Business & Strategy",
    term: "Market Segmentation",
    definition: "Dividing a market into distinct groups with common needs or characteristics.",
  },
  {
    category: "Business & Strategy",
    term: "Pivot",
    definition: "A significant change in business direction based on market feedback.",
  },
  {
    category: "Business & Strategy",
    term: "Minimum Viable Product (MVP)",
    definition: "A basic version of a product used to validate core ideas with early adopters.",
  },
  {
    category: "Business & Strategy",
    term: "Product-Market Fit",
    definition: "When a product satisfies a strong market demand.",
  },
  {
    category: "Business & Strategy",
    term: "Elevator Pitch",
    definition: "A brief, persuasive speech to spark interest in your business.",
  },
  {
    category: "Business & Strategy",
    term: "Strategic Alliance",
    definition: "An agreement between businesses to pursue mutual goals.",
  },
  {
    category: "Business & Strategy",
    term: "Bootstrapping",
    definition: "Starting a business with little to no external funding.",
  },
  {
    category: "Business & Strategy",
    term: "Unique Selling Proposition (USP)",
    definition: "A factor that differentiates a product from its competitors.",
  },
  {
    category: "Business & Strategy",
    term: "B2B (Business to Business)",
    definition: "A business model selling products/services to other businesses.",
  },

  // Finance & Metrics
  {
    category: "Finance & Metrics",
    term: "ARPU (Average Revenue Per User)",
    definition: "Total revenue divided by the number of users in a period.",
  },
  {
    category: "Finance & Metrics",
    term: "LTV (Lifetime Value)",
    definition: "Average revenue a customer generates during their engagement.",
  },
  {
    category: "Finance & Metrics",
    term: "CAC (Customer Acquisition Cost)",
    definition: "Cost to acquire a new customer.",
    formula: "Total Marketing/Sales Spend ÷ New Customers Acquired",
  },
  {
    category: "Finance & Metrics",
    term: "Burn Rate",
    definition: "Monthly rate at which a company spends capital.",
  },
  {
    category: "Finance & Metrics",
    term: "Runway",
    definition: "Time until a startup runs out of money.",
    formula: "Cash ÷ Monthly Burn Rate",
  },
  {
    category: "Finance & Metrics",
    term: "EBITDA",
    definition: "Earnings Before Interest, Taxes, Depreciation, and Amortization.",
  },
  {
    category: "Finance & Metrics",
    term: "Gross Margin",
    definition: "Revenue minus cost of goods sold.",
    formula: "(Revenue - COGS) ÷ Revenue",
  },
  {
    category: "Finance & Metrics",
    term: "Operating Margin",
    definition: "Operating income divided by revenue.",
  },
  {
    category: "Finance & Metrics",
    term: "Churn Rate",
    definition: "Percentage of customers who stop doing business over a period.",
  },
  {
    category: "Finance & Metrics",
    term: "MRR (Monthly Recurring Revenue)",
    definition: "Predictable revenue a business expects each month.",
  },
  {
    category: "Finance & Metrics",
    term: "Break-Even Point",
    definition: "The point where total revenue equals total costs.",
  },
  {
    category: "Finance & Metrics",
    term: "Cash Flow",
    definition: "Net amount of cash being transferred in and out of a business.",
  },
  {
    category: "Finance & Metrics",
    term: "Working Capital",
    definition: "Current assets minus current liabilities.",
  },
  {
    category: "Finance & Metrics",
    term: "Deferred Revenue",
    definition: "Advance payments a business receives for products or services to be delivered in the future.",
  },
  {
    category: "Finance & Metrics",
    term: "Accounts Receivable",
    definition: "Money owed by customers for goods/services delivered.",
  },

  // Legal & Regulatory
  {
    category: "Legal & Regulatory",
    term: "LLC (Limited Liability Company)",
    definition: "A corporate structure that protects its owners from personal liability.",
  },
  {
    category: "Legal & Regulatory",
    term: "Private Limited Company",
    definition: "A privately held small business entity.",
  },
  {
    category: "Legal & Regulatory",
    term: "GST (Goods and Services Tax)",
    definition: "Indirect tax levied on supply of goods and services in India.",
  },
  {
    category: "Legal & Regulatory",
    term: "Compliance",
    definition: "Following applicable laws and regulations.",
  },
  {
    category: "Legal & Regulatory",
    term: "IPR (Intellectual Property Rights)",
    definition: "Legal rights given to creators for their inventions and artistic works.",
  },
  {
    category: "Legal & Regulatory",
    term: "Trademark",
    definition: "A recognizable sign/design identifying a product or service.",
  },
  {
    category: "Legal & Regulatory",
    term: "Copyright",
    definition: "Legal right that grants the creator of original work exclusive rights.",
  },
  {
    category: "Legal & Regulatory",
    term: "Patent",
    definition: "Exclusive right granted for an invention.",
  },
  {
    category: "Legal & Regulatory",
    term: "FSSAI License",
    definition: "License required for food businesses in India.",
  },
  {
    category: "Legal & Regulatory",
    term: "DSC (Digital Signature Certificate)",
    definition: "A secure digital key used for electronic document authentication.",
  },
  {
    category: "Legal & Regulatory",
    term: "Non-Disclosure Agreement (NDA)",
    definition: "A legal contract protecting confidential information.",
  },
  {
    category: "Legal & Regulatory",
    term: "Articles of Incorporation",
    definition: "Document filed to legally document a company's creation.",
  },
  {
    category: "Legal & Regulatory",
    term: "Business License",
    definition: "Legal authorization to operate a business.",
  },
  {
    category: "Legal & Regulatory",
    term: "Shareholders Agreement",
    definition: "Contract outlining shareholder rights and obligations.",
  },
  {
    category: "Legal & Regulatory",
    term: "MoA (Memorandum of Association)",
    definition: "Defines a company's relationship with the external world.",
  },

  // Marketing & Sales
  {
    category: "Marketing & Sales",
    term: "Conversion Rate",
    definition: "Percentage of users who complete a desired action.",
    formula: "Conversions ÷ Total Visitors",
  },
  {
    category: "Marketing & Sales",
    term: "Bounce Rate",
    definition: "Percentage of visitors who leave after viewing only one page.",
  },
  {
    category: "Marketing & Sales",
    term: "CPL (Cost per Lead)",
    definition: "Marketing cost to acquire a lead.",
    formula: "Marketing Spend ÷ Number of Leads",
  },
  {
    category: "Marketing & Sales",
    term: "Lead",
    definition: "A potential customer who has shown interest in your product/service.",
  },
  {
    category: "Marketing & Sales",
    term: "Lead-to-Customer Rate",
    definition: "Leads that convert to paying customers.",
  },
  {
    category: "Marketing & Sales",
    term: "Retention Rate",
    definition: "Percentage of customers who continue to use the product over time.",
  },
  {
    category: "Marketing & Sales",
    term: "CLV (Customer Lifetime Value)",
    definition: "Same as LTV.",
  },
  {
    category: "Marketing & Sales",
    term: "Email Open Rate",
    definition: "Percentage of sent emails that are opened.",
  },
  {
    category: "Marketing & Sales",
    term: "Upselling",
    definition: "Encouraging customers to purchase a more expensive item.",
  },
  {
    category: "Marketing & Sales",
    term: "Cross-selling",
    definition: "Encouraging customers to buy related or complementary items.",
  },
  {
    category: "Marketing & Sales",
    term: "Brand Positioning",
    definition: "How a brand is perceived in the minds of the target market.",
  },
  {
    category: "Marketing & Sales",
    term: "Marketing Funnel",
    definition: "The journey customers go through from awareness to purchase.",
  },
  {
    category: "Marketing & Sales",
    term: "Customer Persona",
    definition: "A detailed description of a typical target customer.",
  },
  {
    category: "Marketing & Sales",
    term: "Net Promoter Score (NPS)",
    definition: "A measure of customer loyalty and satisfaction.",
  },
  {
    category: "Marketing & Sales",
    term: "Referral Rate",
    definition: "Percentage of new customers acquired via existing customers.",
  },

  // Operations & HR
  {
    category: "Operations & HR",
    term: "KPI (Key Performance Indicator)",
    definition: "A measurable value that indicates how well an objective is being achieved.",
  },
  {
    category: "Operations & HR",
    term: "OKR (Objectives and Key Results)",
    definition: "A goal-setting framework used to define measurable goals.",
  },
  {
    category: "Operations & HR",
    term: "SOP (Standard Operating Procedure)",
    definition: "Set of step-by-step instructions for operations.",
  },
  {
    category: "Operations & HR",
    term: "Onboarding",
    definition: "Process of integrating new employees.",
  },
  {
    category: "Operations & HR",
    term: "Turnover Rate",
    definition: "Rate at which employees leave a company.",
  },
  {
    category: "Operations & HR",
    term: "Employee Engagement",
    definition: "Emotional commitment of employees to the company.",
  },
  {
    category: "Operations & HR",
    term: "Time to Hire",
    definition: "Time taken to fill a job position.",
  },
  {
    category: "Operations & HR",
    term: "Offer Acceptance Rate",
    definition: "Percentage of job offers accepted.",
  },
  {
    category: "Operations & HR",
    term: "Remote Work Policy",
    definition: "Guidelines for employees working remotely.",
  },
  {
    category: "Operations & HR",
    term: "Freelancer Agreement",
    definition: "Contract for temporary, project-based workers.",
  },
  {
    category: "Operations & HR",
    term: "Procurement",
    definition: "Process of acquiring goods and services.",
  },
  {
    category: "Operations & HR",
    term: "Shift Planning",
    definition: "Scheduling employee work shifts.",
  },
  {
    category: "Operations & HR",
    term: "Exit Interview",
    definition: "Final interview to understand reasons for an employee's departure.",
  },
  {
    category: "Operations & HR",
    term: "HRIS (Human Resources Information System)",
    definition: "A system used to collect and manage HR data.",
  },
  {
    category: "Operations & HR",
    term: "360-Degree Feedback",
    definition: "A performance review system involving feedback from all directions.",
  },

  // Startup & Investment
  {
    category: "Startup & Investment",
    term: "Angel Investor",
    definition: "An individual who invests early-stage capital in startups.",
  },
  {
    category: "Startup & Investment",
    term: "Venture Capital",
    definition: "Financing provided to startups with high growth potential.",
  },
  {
    category: "Startup & Investment",
    term: "Seed Funding",
    definition: "Initial capital used to start a business.",
  },
  {
    category: "Startup & Investment",
    term: "Series A/B/C Funding",
    definition: "Stages of venture capital fundraising.",
  },
  {
    category: "Startup & Investment",
    term: "Equity Dilution",
    definition: "Reduction in ownership percentage due to new shares issued.",
  },
  {
    category: "Startup & Investment",
    term: "Cap Table",
    definition: "Table showing company ownership, equity dilution, and value.",
  },
  {
    category: "Startup & Investment",
    term: "SAFE Note",
    definition: "Simple Agreement for Future Equity.",
  },
  {
    category: "Startup & Investment",
    term: "Term Sheet",
    definition: "Non-binding agreement outlining the terms of an investment.",
  },
  {
    category: "Startup & Investment",
    term: "Valuation",
    definition: "The estimated worth of a company.",
  },
  {
    category: "Startup & Investment",
    term: "Exit Strategy",
    definition: "A plan for the founders/investors to sell their stake or exit the business.",
  },
  {
    category: "Startup & Investment",
    term: "Incubator",
    definition: "Organization that helps startups grow by offering resources.",
  },
  {
    category: "Startup & Investment",
    term: "Accelerator",
    definition: "A program that fast-tracks startups through mentoring and funding.",
  },
  {
    category: "Startup & Investment",
    term: "Bridge Round",
    definition: "Funding between two formal investment rounds.",
  },
  {
    category: "Startup & Investment",
    term: "Convertible Note",
    definition: "A loan that converts into equity at a later stage.",
  },
  {
    category: "Startup & Investment",
    term: "Due Diligence",
    definition: "The investigation of a business before an investment or acquisition.",
  },

  // Technology & Product
  {
    category: "Technology & Product",
    term: "API (Application Programming Interface)",
    definition: "A set of rules that allows software to interact.",
  },
  {
    category: "Technology & Product",
    term: "SaaS (Software as a Service)",
    definition: "Software hosted on the cloud and delivered via the internet.",
  },
  {
    category: "Technology & Product",
    term: "MVP (Minimum Viable Product)",
    definition: "Basic product with core features used for early testing.",
  },
  {
    category: "Technology & Product",
    term: "Uptime",
    definition: "Percentage of time a system is operational.",
  },
  {
    category: "Technology & Product",
    term: "Downtime",
    definition: "Time when a system is unavailable.",
  },
  {
    category: "Technology & Product",
    term: "Deployment Frequency",
    definition: "Rate at which software updates are released.",
  },
  {
    category: "Technology & Product",
    term: "MTTR (Mean Time to Recovery)",
    definition: "Average time to restore service after failure.",
  },
  {
    category: "Technology & Product",
    term: "Bug Rate",
    definition: "Frequency of software bugs reported over a period.",
  },
  {
    category: "Technology & Product",
    term: "Version Control",
    definition: "System that records code changes (e.g., Git).",
  },
  {
    category: "Technology & Product",
    term: "Feature Adoption Rate",
    definition: "Percentage of users using a new product feature.",
  },
]

const categories = [
  "All Terms",
  "Business & Strategy",
  "Finance & Metrics",
  "Legal & Regulatory",
  "Marketing & Sales",
  "Operations & HR",
  "Startup & Investment",
  "Technology & Product",
]

export default function GlossaryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState("All Terms")
  const { toast } = useToast()

  // Filter terms based on search and category
  const filteredTerms = useMemo(() => {
    let filtered = glossaryData

    // Filter by category
    if (activeCategory !== "All Terms") {
      filtered = filtered.filter((term) => term.category === activeCategory)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (term) =>
          term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
          term.definition.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    return filtered
  }, [searchTerm, activeCategory])

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">PlanInsta Business Glossary</h1>
            <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
              Your quick reference for startup, legal, finance, marketing, and growth terminology — built for modern
              entrepreneurs.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Need help applying these terms?
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Search Bar */}
          <div className="mb-8 animate-fade-in-up animate-delay-100">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search terms or definitions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 rounded-2xl h-14 text-lg bg-white shadow-lg border-2 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Category Navigation */}
          <div className="mb-8 animate-fade-in-up animate-delay-200">
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 h-auto p-2 bg-gray-100 rounded-2xl">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="rounded-xl text-sm font-medium py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Results Count */}
          <div className="mb-6 text-center">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-orange-600">{filteredTerms.length}</span> terms
              {searchTerm && (
                <span>
                  {" "}
                  for "<span className="font-semibold">{searchTerm}</span>"
                </span>
              )}
            </p>
          </div>

          {/* Glossary Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTerms.map((term, index) => (
              <Card
                key={`${term.category}-${term.term}`}
                className="border-0 shadow-lg rounded-3xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up bg-white"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-6">
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-2xl mb-3">
                      {term.category}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{term.term}</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-3">{term.definition}</p>
                  {term.formula && (
                    <div className="bg-gray-50 rounded-2xl p-3 border-l-4 border-orange-500">
                      <p className="text-sm font-medium text-gray-600 mb-1">Formula:</p>
                      <p className="text-sm font-mono text-gray-800">{term.formula}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredTerms.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No terms found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or selecting a different category.</p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setActiveCategory("All Terms")
                }}
                variant="outline"
                className="rounded-2xl"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      <Footer />
      <LeadCapturePopup source="glossary" />
    </div>
  )
}
