"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, ChevronLeft, ChevronRight } from "lucide-react"
import type { BusinessPlanData } from "@/app/plan-builder/page"

interface PlanInputFormProps {
  data: BusinessPlanData
  onChange: (data: Partial<BusinessPlanData>) => void
}

const formSections = [
  { id: "basics", label: "Business Basics", icon: "🏢" },
  { id: "vision", label: "Vision & Goals", icon: "🎯" },
  { id: "market", label: "Target Market", icon: "👥" },
  { id: "product", label: "Product/Service", icon: "📦" },
  { id: "marketing", label: "Marketing & Sales", icon: "📈" },
  { id: "operations", label: "Operations & Team", icon: "⚙️" },
  { id: "financial", label: "Financial Info", icon: "💰" },
  { id: "traction", label: "Traction & Milestones", icon: "🚀" },
  { id: "extras", label: "Extras", icon: "📝" },
]

const marketingChannelOptions = [
  "SEO",
  "Ads",
  "Social Media",
  "Email Marketing",
  "Referrals",
  "Content Marketing",
  "Partnerships",
]

export function PlanInputForm({ data, onChange }: PlanInputFormProps) {
  const [activeTab, setActiveTab] = useState("basics")
  const [selectedChannels, setSelectedChannels] = useState<string[]>(data.marketingChannels)

  const currentSectionIndex = formSections.findIndex((section) => section.id === activeTab)

  const handleNext = () => {
    if (currentSectionIndex < formSections.length - 1) {
      setActiveTab(formSections[currentSectionIndex + 1].id)
    }
  }

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setActiveTab(formSections[currentSectionIndex - 1].id)
    }
  }

  const addKeyFeature = () => {
    onChange({ keyFeatures: [...data.keyFeatures, ""] })
  }

  const removeKeyFeature = (index: number) => {
    const newFeatures = data.keyFeatures.filter((_, i) => i !== index)
    onChange({ keyFeatures: newFeatures })
  }

  const updateKeyFeature = (index: number, value: string) => {
    const newFeatures = [...data.keyFeatures]
    newFeatures[index] = value
    onChange({ keyFeatures: newFeatures })
  }

  const addInvestmentItem = () => {
    onChange({
      investmentUtilization: [...data.investmentUtilization, { item: "", amount: "" }],
    })
  }

  const removeInvestmentItem = (index: number) => {
    const newItems = data.investmentUtilization.filter((_, i) => i !== index)
    onChange({ investmentUtilization: newItems })
  }

  const updateInvestmentItem = (index: number, field: "item" | "amount", value: string) => {
    const newItems = [...data.investmentUtilization]
    newItems[index][field] = value
    onChange({ investmentUtilization: newItems })
  }

  const addFundingUseItem = () => {
    onChange({
      fundingUseBreakdown: [...data.fundingUseBreakdown, { item: "", amount: "" }],
    })
  }

  const removeFundingUseItem = (index: number) => {
    const newItems = data.fundingUseBreakdown.filter((_, i) => i !== index)
    onChange({ fundingUseBreakdown: newItems })
  }

  const updateFundingUseItem = (index: number, field: "item" | "amount", value: string) => {
    const newItems = [...data.fundingUseBreakdown]
    newItems[index][field] = value
    onChange({ fundingUseBreakdown: newItems })
  }

  const toggleMarketingChannel = (channel: string) => {
    const newChannels = selectedChannels.includes(channel)
      ? selectedChannels.filter((c) => c !== channel)
      : [...selectedChannels, channel]
    setSelectedChannels(newChannels)
    onChange({ marketingChannels: newChannels })
  }

  const updateAchievement = (index: number, value: string) => {
    const newAchievements = [...data.achievements]
    newAchievements[index] = value
    onChange({ achievements: newAchievements })
  }

  return (
    <TooltipProvider>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Build Your Business Plan</h2>
          <p className="text-gray-600">Fill out the sections below to generate your comprehensive business plan</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 lg:grid-cols-5 gap-2 h-auto p-2 bg-gray-100 rounded-2xl">
            {formSections.map((section) => (
              <TabsTrigger
                key={section.id}
                value={section.id}
                className="flex flex-col items-center p-3 rounded-xl text-xs font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white"
              >
                <span className="text-lg mb-1">{section.icon}</span>
                <span className="text-center leading-tight">{section.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Business Basics */}
          <TabsContent value="basics" className="space-y-6">
            <Card className="border-0 shadow-lg rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <span className="mr-2">🏢</span>
                  Business Basics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      value={data.businessName}
                      onChange={(e) => onChange({ businessName: e.target.value })}
                      placeholder="Enter your business name"
                      className="rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessModel">Business Model *</Label>
                    <Select value={data.businessModel} onValueChange={(value) => onChange({ businessModel: value })}>
                      <SelectTrigger className="rounded-2xl">
                        <SelectValue placeholder="Select business model" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="saas">SaaS</SelectItem>
                        <SelectItem value="d2c">D2C</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                        <SelectItem value="marketplace">Marketplace</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">One-line Description *</Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => onChange({ description: e.target.value })}
                    placeholder="Describe your business in one compelling sentence"
                    className="rounded-2xl"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessStage">Business Stage *</Label>
                  <Select value={data.businessStage} onValueChange={(value) => onChange({ businessStage: value })}>
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue placeholder="Select current stage" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="idea">Idea</SelectItem>
                      <SelectItem value="mvp">MVP</SelectItem>
                      <SelectItem value="early-revenue">Early Revenue</SelectItem>
                      <SelectItem value="growth">Growth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vision & Goals */}
          <TabsContent value="vision" className="space-y-6">
            <Card className="border-0 shadow-lg rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <span className="mr-2">🎯</span>
                  Vision & Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="visionStatement">Vision Statement *</Label>
                  <Textarea
                    id="visionStatement"
                    value={data.visionStatement}
                    onChange={(e) => onChange({ visionStatement: e.target.value })}
                    placeholder="What is your long-term vision for this business?"
                    className="rounded-2xl"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="shortTermGoal">Short-term Goal (6-12 months)</Label>
                    <Textarea
                      id="shortTermGoal"
                      value={data.shortTermGoal}
                      onChange={(e) => onChange({ shortTermGoal: e.target.value })}
                      placeholder="What do you want to achieve in the next year?"
                      className="rounded-2xl"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longTermGoal">Long-term Goal (3-5 years)</Label>
                    <Textarea
                      id="longTermGoal"
                      value={data.longTermGoal}
                      onChange={(e) => onChange({ longTermGoal: e.target.value })}
                      placeholder="Where do you see your business in 3-5 years?"
                      className="rounded-2xl"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Target Market */}
          <TabsContent value="market" className="space-y-6">
            <Card className="border-0 shadow-lg rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <span className="mr-2">👥</span>
                  Target Market
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience *</Label>
                  <Textarea
                    id="targetAudience"
                    value={data.targetAudience}
                    onChange={(e) => onChange({ targetAudience: e.target.value })}
                    placeholder="Describe your ideal customers in detail"
                    className="rounded-2xl"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location/Region</Label>
                    <Input
                      id="location"
                      value={data.location}
                      onChange={(e) => onChange({ location: e.target.value })}
                      placeholder="e.g., Global, US, India, Europe"
                      className="rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="marketSize">Market Size (Optional)</Label>
                    <Input
                      id="marketSize"
                      value={data.marketSize}
                      onChange={(e) => onChange({ marketSize: e.target.value })}
                      placeholder="e.g., $10B TAM, 1M potential customers"
                      className="rounded-2xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Product/Service */}
          <TabsContent value="product" className="space-y-6">
            <Card className="border-0 shadow-lg rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <span className="mr-2">📦</span>
                  Product/Service
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product/Service Name *</Label>
                  <Input
                    id="productName"
                    value={data.productName}
                    onChange={(e) => onChange({ productName: e.target.value })}
                    placeholder="What is your main product or service?"
                    className="rounded-2xl"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Key Features</Label>
                    <Button type="button" onClick={addKeyFeature} size="sm" className="rounded-xl">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Feature
                    </Button>
                  </div>
                  {data.keyFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateKeyFeature(index, e.target.value)}
                        placeholder={`Key feature ${index + 1}`}
                        className="rounded-2xl"
                      />
                      {data.keyFeatures.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeKeyFeature(index)}
                          size="sm"
                          variant="outline"
                          className="rounded-xl"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uniqueSellingPoint">Unique Selling Point *</Label>
                  <Textarea
                    id="uniqueSellingPoint"
                    value={data.uniqueSellingPoint}
                    onChange={(e) => onChange({ uniqueSellingPoint: e.target.value })}
                    placeholder="What makes your product/service unique and better than competitors?"
                    className="rounded-2xl"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Marketing & Sales */}
          <TabsContent value="marketing" className="space-y-6">
            <Card className="border-0 shadow-lg rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <span className="mr-2">📈</span>
                  Marketing & Sales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Marketing Channels (Select all that apply)</Label>
                  <div className="flex flex-wrap gap-2">
                    {marketingChannelOptions.map((channel) => (
                      <Badge
                        key={channel}
                        variant={selectedChannels.includes(channel) ? "default" : "outline"}
                        className={`cursor-pointer rounded-2xl px-4 py-2 transition-all duration-200 ${
                          selectedChannels.includes(channel)
                            ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                            : "hover:border-orange-500 hover:text-orange-600"
                        }`}
                        onClick={() => toggleMarketingChannel(channel)}
                      >
                        {channel}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="pricingStrategy">Pricing Strategy</Label>
                    <Select
                      value={data.pricingStrategy}
                      onValueChange={(value) => onChange({ pricingStrategy: value })}
                    >
                      <SelectTrigger className="rounded-2xl">
                        <SelectValue placeholder="Select pricing model" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="subscription">Subscription</SelectItem>
                        <SelectItem value="one-time">One-time Payment</SelectItem>
                        <SelectItem value="freemium">Freemium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salesTeam">Do you have a sales team?</Label>
                    <div className="flex items-center space-x-2 pt-2">
                      <Switch
                        id="salesTeam"
                        checked={data.hasSalesTeam}
                        onCheckedChange={(checked) => onChange({ hasSalesTeam: checked })}
                      />
                      <Label htmlFor="salesTeam" className="text-sm">
                        {data.hasSalesTeam ? "Yes" : "No"}
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Operations & Team */}
          <TabsContent value="operations" className="space-y-6">
            <Card className="border-0 shadow-lg rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <span className="mr-2">⚙️</span>
                  Operations & Team
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="operationLocation">Operation Location</Label>
                    <Input
                      id="operationLocation"
                      value={data.operationLocation}
                      onChange={(e) => onChange({ operationLocation: e.target.value })}
                      placeholder="Where is your business located?"
                      className="rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="legalStructure">Legal Structure</Label>
                    <Select value={data.legalStructure} onValueChange={(value) => onChange({ legalStructure: value })}>
                      <SelectTrigger className="rounded-2xl">
                        <SelectValue placeholder="Select legal structure" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="sole-proprietorship">Sole Proprietorship</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="llc">LLC</SelectItem>
                        <SelectItem value="corporation">Corporation</SelectItem>
                        <SelectItem value="pvt-ltd">Private Limited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="teamSize">Team Size</Label>
                    <Input
                      id="teamSize"
                      value={data.teamSize}
                      onChange={(e) => onChange({ teamSize: e.target.value })}
                      placeholder="e.g., 5 people, Just me, 10-20 employees"
                      className="rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="founderRole">Your Key Role</Label>
                    <Input
                      id="founderRole"
                      value={data.founderRole}
                      onChange={(e) => onChange({ founderRole: e.target.value })}
                      placeholder="e.g., CEO, CTO, Founder"
                      className="rounded-2xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Info */}
          <TabsContent value="financial" className="space-y-6">
            <Card className="border-0 shadow-lg rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <span className="mr-2">💰</span>
                  Financial Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="initialInvestment">Initial Investment</Label>
                    <Input
                      id="initialInvestment"
                      value={data.initialInvestment}
                      onChange={(e) => onChange({ initialInvestment: e.target.value })}
                      placeholder="e.g., $50,000"
                      className="rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fundingReceived">Funding Received</Label>
                    <Select
                      value={data.fundingReceived}
                      onValueChange={(value) => onChange({ fundingReceived: value })}
                    >
                      <SelectTrigger className="rounded-2xl">
                        <SelectValue placeholder="Select funding status" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="bootstrapped">Bootstrapped</SelectItem>
                        <SelectItem value="angel">Angel Investment</SelectItem>
                        <SelectItem value="vc">VC Funding</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Investment Utilization</Label>
                    <Button type="button" onClick={addInvestmentItem} size="sm" className="rounded-xl">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </Button>
                  </div>
                  {data.investmentUtilization.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={item.item}
                        onChange={(e) => updateInvestmentItem(index, "item", e.target.value)}
                        placeholder="e.g., Marketing, Development"
                        className="rounded-2xl flex-1"
                      />
                      <Input
                        value={item.amount}
                        onChange={(e) => updateInvestmentItem(index, "amount", e.target.value)}
                        placeholder="Amount"
                        className="rounded-2xl w-32"
                      />
                      {data.investmentUtilization.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeInvestmentItem(index)}
                          size="sm"
                          variant="outline"
                          className="rounded-xl"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyRevenue">Current Monthly Revenue</Label>
                    <Input
                      id="monthlyRevenue"
                      value={data.monthlyRevenue}
                      onChange={(e) => onChange({ monthlyRevenue: e.target.value })}
                      placeholder="e.g., $10,000"
                      className="rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlyExpenses">Current Monthly Expenses</Label>
                    <Input
                      id="monthlyExpenses"
                      value={data.monthlyExpenses}
                      onChange={(e) => onChange({ monthlyExpenses: e.target.value })}
                      placeholder="e.g., $5,000"
                      className="rounded-2xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fundingNeeded">Funding Needed</Label>
                  <Input
                    id="fundingNeeded"
                    value={data.fundingNeeded}
                    onChange={(e) => onChange({ fundingNeeded: e.target.value })}
                    placeholder="e.g., $100,000"
                    className="rounded-2xl"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Funding Use Breakdown</Label>
                    <Button type="button" onClick={addFundingUseItem} size="sm" className="rounded-xl">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </Button>
                  </div>
                  {data.fundingUseBreakdown.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={item.item}
                        onChange={(e) => updateFundingUseItem(index, "item", e.target.value)}
                        placeholder="e.g., Product Development, Marketing"
                        className="rounded-2xl flex-1"
                      />
                      <Input
                        value={item.amount}
                        onChange={(e) => updateFundingUseItem(index, "amount", e.target.value)}
                        placeholder="Amount"
                        className="rounded-2xl w-32"
                      />
                      {data.fundingUseBreakdown.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeFundingUseItem(index)}
                          size="sm"
                          variant="outline"
                          className="rounded-xl"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Traction & Milestones */}
          <TabsContent value="traction" className="space-y-6">
            <Card className="border-0 shadow-lg rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <span className="mr-2">🚀</span>
                  Traction & Milestones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Key Achievements</Label>
                  {data.achievements.map((achievement, index) => (
                    <div key={index} className="space-y-2">
                      <Label htmlFor={`achievement-${index}`}>Achievement {index + 1}</Label>
                      <Textarea
                        id={`achievement-${index}`}
                        value={achievement}
                        onChange={(e) => updateAchievement(index, e.target.value)}
                        placeholder={`Describe a key achievement or milestone you've reached`}
                        className="rounded-2xl"
                        rows={2}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upcomingMilestone">Upcoming Milestone</Label>
                  <Textarea
                    id="upcomingMilestone"
                    value={data.upcomingMilestone}
                    onChange={(e) => onChange({ upcomingMilestone: e.target.value })}
                    placeholder="What's the next major milestone you're working towards?"
                    className="rounded-2xl"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Extras */}
          <TabsContent value="extras" className="space-y-6">
            <Card className="border-0 shadow-lg rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <span className="mr-2">📝</span>
                  Additional Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={data.notes}
                    onChange={(e) => onChange({ notes: e.target.value })}
                    placeholder="Any additional information, special considerations, or notes you'd like to include in your business plan"
                    className="rounded-2xl"
                    rows={5}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <Button
            onClick={handlePrevious}
            disabled={currentSectionIndex === 0}
            variant="outline"
            className="rounded-2xl px-6 py-2"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous Section
          </Button>

          <span className="text-sm text-gray-500">
            {currentSectionIndex + 1} of {formSections.length}
          </span>

          <Button
            onClick={handleNext}
            disabled={currentSectionIndex === formSections.length - 1}
            className="rounded-2xl px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            Next Section
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}
