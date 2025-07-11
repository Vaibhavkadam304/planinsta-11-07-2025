"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Send, Bot, User, Loader2, Sparkles, RefreshCw, Save, X, Wand2, MessageSquare, FileText } from "lucide-react"
import { editPlanSection } from "@/app/actions/edit-section"

interface ChatMessage {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatEditModalProps {
  isOpen: boolean
  onClose: () => void
  sectionName: string
  currentContent: string
  onSave: (newContent: string) => void
}

const sectionTitles: Record<string, string> = {
  executiveSummary: "Executive Summary",
  marketAnalysis: "Market Analysis",
  productStrategy: "Product Strategy",
  marketingStrategy: "Marketing Strategy",
  operationsStrategy: "Operations Strategy",
  financialProjections: "Financial Projections",
  milestonesAndTraction: "Milestones & Traction",
  additionalNotes: "Additional Notes",
}

const quickPrompts = [
  "Make it more professional and investor-ready",
  "Add more specific details and examples",
  "Make it shorter and more concise",
  "Change the tone to be more confident",
  "Focus more on market opportunity",
  "Add competitive advantages",
]

export function ChatEditModal({ isOpen, onClose, sectionName, currentContent, onSave }: ChatEditModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewContent, setPreviewContent] = useState(currentContent)
  const [hasChanges, setHasChanges] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const sectionTitle = sectionTitles[sectionName] || sectionName

  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          id: "welcome",
          type: "assistant",
          content: `Hi! I'm your AI writing assistant. I can help you improve the "${sectionTitle}" section of your business plan.\n\nI can help you:\n• Rewrite for different audiences (investors, banks, partners)\n• Adjust tone and style\n• Add more details or make it more concise\n• Focus on specific aspects\n• Improve clarity and impact\n\nWhat would you like me to help you with?`,
          timestamp: new Date(),
        },
      ])
      setPreviewContent(currentContent)
      setHasChanges(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, sectionTitle, currentContent])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputValue.trim()
    if (!messageToSend || isGenerating) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: messageToSend,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsGenerating(true)

    try {
      const result = await editPlanSection(
        sectionName,
        currentContent,
        messageToSend,
        "Your Business", // You can pass the actual business name here
        "technology", // You can pass the actual industry here
      )

      if (result.success && result.content) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content:
            "I've updated the content based on your request. You can see the changes in the preview panel on the right.",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
        setPreviewContent(result.content)
        setHasChanges(true)
      } else {
        // Fallback to mock response if API fails
        const response = generateAIResponse(messageToSend, sectionName, currentContent)
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: response.message,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
        setPreviewContent(response.updatedContent)
        setHasChanges(true)
      }
    } catch (error) {
      console.error("Error editing section:", error)
      // Fallback to mock response if API fails
      const response = generateAIResponse(messageToSend, sectionName, currentContent)
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: response.message,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setPreviewContent(response.updatedContent)
      setHasChanges(true)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSave = () => {
    onSave(previewContent)
    onClose()
  }

  const handleReset = () => {
    setPreviewContent(currentContent)
    setHasChanges(false)
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: "assistant",
        content: "I've reset the content to the original version. What would you like me to help you with?",
        timestamp: new Date(),
      },
    ])
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0 bg-white rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Wand2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI Content Editor</h2>
              <p className="text-orange-100 text-sm">Editing: {sectionTitle}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {hasChanges && (
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Sparkles className="h-3 w-3 mr-1" />
                Changes Made
              </Badge>
            )}
            <Button onClick={onClose} variant="ghost" size="sm" className="text-white hover:bg-white/20 rounded-xl">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex h-full">
          {/* Chat Panel */}
          <div className="w-1/2 border-r border-gray-200 flex flex-col bg-gray-50">
            {/* Quick Actions */}
            <div className="p-4 bg-white border-b border-gray-200">
              <div className="flex items-center mb-3">
                <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Quick Actions</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {quickPrompts.slice(0, 3).map((prompt, index) => (
                  <Button
                    key={index}
                    onClick={() => handleSendMessage(prompt)}
                    variant="outline"
                    size="sm"
                    className="text-xs text-left justify-start h-auto py-2 px-3 rounded-xl hover:bg-orange-50 hover:border-orange-200"
                    disabled={isGenerating}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        message.type === "user"
                          ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                          : "bg-white text-gray-900 shadow-sm border border-gray-200"
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.type === "assistant" && (
                          <div className="p-1 bg-orange-100 rounded-lg mt-0.5">
                            <Bot className="h-3 w-3 text-orange-600" />
                          </div>
                        )}
                        {message.type === "user" && (
                          <div className="p-1 bg-white/20 rounded-lg mt-0.5">
                            <User className="h-3 w-3 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                          <p
                            className={`text-xs mt-2 ${message.type === "user" ? "text-orange-100" : "text-gray-400"}`}
                          >
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200">
                      <div className="flex items-center space-x-2">
                        <div className="p-1 bg-orange-100 rounded-lg">
                          <Bot className="h-3 w-3 text-orange-600" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                          <span className="text-sm text-gray-600">Rewriting content...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex space-x-3">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tell me how to improve this section..."
                  className="rounded-2xl border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  disabled={isGenerating}
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isGenerating}
                  className="rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 px-6"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="w-1/2 flex flex-col bg-white">
            {/* Preview Header */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Live Preview</span>
                {hasChanges && (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    Modified
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs"
                  disabled={!hasChanges}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
                <Button
                  onClick={handleSave}
                  className="rounded-xl text-xs bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                  disabled={!hasChanges}
                >
                  <Save className="h-3 w-3 mr-1" />
                  Save Changes
                </Button>
              </div>
            </div>

            {/* Preview Content */}
            <ScrollArea className="flex-1 p-6">
              <Card className="border-0 shadow-none">
                <CardContent className="p-0">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{sectionTitle}</h3>
                    <Separator />
                  </div>

                  <div className="prose prose-gray max-w-none">
                    <div className="text-gray-700 leading-relaxed space-y-4">
                      {previewContent.split("\n\n").map((paragraph, index) => {
                        if (paragraph.trim().startsWith("**") && paragraph.trim().endsWith("**")) {
                          return (
                            <h4 key={index} className="font-bold text-lg text-gray-900 mt-6 mb-3">
                              {paragraph.replace(/\*\*/g, "")}
                            </h4>
                          )
                        } else if (paragraph.trim().startsWith("•")) {
                          return (
                            <div key={index} className="flex items-start space-x-2 mb-2">
                              <span className="text-orange-500 mt-2 text-sm">•</span>
                              <span className="flex-1">{paragraph.replace("•", "").trim()}</span>
                            </div>
                          )
                        } else if (paragraph.trim()) {
                          return (
                            <p key={index} className="mb-4 text-sm leading-relaxed">
                              {paragraph}
                            </p>
                          )
                        }
                        return null
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollArea>

            {/* Preview Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Word count: ~{previewContent.split(" ").length} words</span>
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Helper functions for AI responses
function generateAIResponse(
  userInput: string,
  sectionName: string,
  currentContent: string,
): { message: string; updatedContent: string } {
  const input = userInput.toLowerCase()

  let message = ""
  let updatedContent = currentContent

  if (input.includes("professional") || input.includes("investor")) {
    message =
      "I've made the content more professional and investor-ready. The language is now more formal, credible, and suitable for business presentations."
    updatedContent = currentContent
      .replace(/\b(we|our|us)\b/g, "the company")
      .replace(/\b(I|my)\b/g, "the founder")
      .replace(/great|awesome|amazing/g, "exceptional")
      .replace(/good/g, "strong")
  } else if (input.includes("detail") || input.includes("specific") || input.includes("example")) {
    message =
      "I've added more specific details and examples to strengthen the content. The section now provides clearer context and supporting information."
    updatedContent =
      currentContent +
      "\n\nAdditional Details:\nThis approach is supported by market research and industry best practices, ensuring sustainable growth and competitive positioning in the marketplace."
  } else if (input.includes("shorter") || input.includes("concise")) {
    message =
      "I've made the content more concise while preserving all key information. The section is now more focused and easier to read."
    const sentences = currentContent.split(". ")
    updatedContent = sentences.slice(0, Math.ceil(sentences.length * 0.7)).join(". ") + "."
  } else if (input.includes("confident") || input.includes("tone")) {
    message =
      "I've adjusted the tone to be more confident and assertive. The content now demonstrates stronger conviction and leadership."
    updatedContent = currentContent
      .replace(/might/g, "will")
      .replace(/could/g, "can")
      .replace(/hope to/g, "plan to")
      .replace(/try to/g, "will")
  } else if (input.includes("market") || input.includes("opportunity")) {
    message =
      "I've enhanced the market opportunity focus. The content now better emphasizes market potential and business opportunity."
    updatedContent =
      currentContent +
      "\n\nMarket Opportunity:\nThe market presents significant growth potential with increasing demand and favorable industry trends supporting long-term success."
  } else if (input.includes("competitive") || input.includes("advantage")) {
    message =
      "I've strengthened the competitive advantages section. The content now better highlights unique differentiators and market positioning."
    updatedContent =
      currentContent +
      "\n\nCompetitive Advantages:\nOur unique approach and strategic positioning provide sustainable competitive advantages that differentiate us from existing market players."
  } else {
    message =
      "I've improved the content based on your request. The section now better reflects your vision and business objectives with enhanced clarity and impact."
    updatedContent =
      currentContent +
      "\n\n[Enhanced based on user feedback to better align with strategic objectives and market positioning.]"
  }

  return { message, updatedContent }
}
