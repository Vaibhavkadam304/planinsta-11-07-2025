import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertTriangle,
  Zap,
  Bot,
  FileText,
  Settings,
  Calendar,
  CheckCircle2,
  Target,
  MessageSquare,
} from "lucide-react"

export default function SiteMapPage() {
  return (
    <div className="min-h-screen py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white">
        {/* Warning Notice */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <h2 className="text-lg font-semibold text-red-800">⚠️ DEVELOPER NOTICE</h2>
          </div>
          <p className="text-red-700 mt-2">
            <strong>DELETE THIS PAGE AFTER DEVELOPMENT IS COMPLETE.</strong> This site map contains sensitive
            development information and should not be accessible to end users.
          </p>
        </div>

        {/* Project Timeline */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <Calendar className="h-5 w-5 mr-2" />
              Project Timeline - Launch Date: June 26, 2025
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="bg-green-100 rounded-lg p-3">
                  <h4 className="font-semibold text-green-800">Phase 1</h4>
                  <p className="text-xs text-green-600">Core MVP</p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-yellow-100 rounded-lg p-3">
                  <h4 className="font-semibold text-yellow-800">Phase 2</h4>
                  <p className="text-xs text-yellow-600">AI & Features</p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-lg p-3">
                  <h4 className="font-semibold text-blue-800">Phase 3</h4>
                  <p className="text-xs text-blue-600">Business Logic</p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-lg p-3">
                  <h4 className="font-semibold text-purple-800">Phase 4</h4>
                  <p className="text-xs text-purple-600">Testing & Launch</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">PlanInsta - Complete Developer Guide</h1>
          <p className="text-gray-600 text-lg">
            Comprehensive implementation guide with GPT prompts, functionality specs, and step-by-step instructions
          </p>
        </div>

        {/* GPT Prompts Section */}
        <Card className="mb-8 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-800">
              <Bot className="h-5 w-5 mr-2" />
              GPT Integration Prompts & Logic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Business Plan Generation Prompt */}
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  1. Business Plan Generation Prompt
                </h4>
                <div className="bg-gray-900 text-gray-100 p-4 rounded text-sm font-mono mb-4">
                  <div className="text-green-400 mb-2">// System Prompt for Plan Generation</div>
                  <div className="whitespace-pre-wrap">{`You are an expert business plan writer with 20+ years of experience helping entrepreneurs create professional, investor-ready business plans.

TASK: Generate a comprehensive business plan based on the user's form inputs.

PLAN TYPE: {planType} // "starter" (10 pages, GPT-3.5) or "professional" (20 pages, GPT-4o)

USER INPUTS:
{formData} // JSON object with all form responses

REQUIREMENTS:
1. Write in professional, formal business language
2. Use specific data from user inputs - don't make up numbers
3. Structure according to the plan type specifications
4. Include realistic financial projections based on provided data
5. Make it investor-ready and actionable
6. Use proper business terminology and formatting

OUTPUT FORMAT: Return a JSON object with sections:
{
  "executiveSummary": "...",
  "businessDescription": "...",
  "marketAnalysis": "...",
  "productService": "...",
  "marketingStrategy": "...",
  "operationsTeam": "...",
  "financialProjections": "...",
  "fundingRequest": "...", // if applicable
  "appendix": "..."
}

LANGUAGE: {language} // Default: English

Generate the plan now:`}</div>
                </div>

                <div className="space-y-2">
                  <h5 className="font-medium text-gray-800">Implementation Steps:</h5>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Collect all form data from quiz sections</li>
                    <li>Determine plan type (starter/professional) from user subscription</li>
                    <li>Select appropriate GPT model (3.5-turbo for starter, gpt-4o for professional)</li>
                    <li>Construct prompt with user data</li>
                    <li>Call OpenAI API with max_tokens based on plan type</li>
                    <li>Parse JSON response and store in database</li>
                    <li>Track token usage for billing</li>
                  </ol>
                </div>
              </div>

              {/* Section Editing Prompt */}
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  2. Section Editing Prompt (Alter Plan)
                </h4>
                <div className="bg-gray-900 text-gray-100 p-4 rounded text-sm font-mono mb-4">
                  <div className="text-green-400 mb-2">// System Prompt for Section Editing</div>
                  <div className="whitespace-pre-wrap">{`You are an expert business plan editor. Your job is to improve specific sections of business plans based on user feedback.

CURRENT SECTION: {sectionName}
CURRENT CONTENT: {currentContent}

USER REQUEST: {userInstruction}

CONTEXT: This is part of a larger business plan for {businessName} in the {industry} industry.

REQUIREMENTS:
1. Maintain professional business language
2. Keep the same general structure and length
3. Incorporate the user's specific feedback
4. Ensure consistency with the overall business plan
5. Make it more compelling and investor-ready
6. Don't change factual data unless specifically requested

EXAMPLES OF GOOD EDITS:
- "Make this more investor-friendly" → Add ROI projections, market size data, competitive advantages
- "Add more detail about our technology" → Expand technical specifications, development timeline, IP protection
- "Make it sound more confident" → Use stronger language, add specific achievements, quantify benefits

OUTPUT: Return only the improved section content, maintaining the same format as the original.

Rewrite the section now:`}</div>
                </div>

                <div className="space-y-2">
                  <h5 className="font-medium text-gray-800">Implementation Steps:</h5>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Identify which section user clicked to edit</li>
                    <li>Extract current section content</li>
                    <li>Get user's editing instruction from chat input</li>
                    <li>Check user's edit limits (Starter: 1 per section, Professional: unlimited)</li>
                    <li>Construct editing prompt with context</li>
                    <li>Call OpenAI API with appropriate model</li>
                    <li>Replace section content in database</li>
                    <li>Update edit count for user</li>
                  </ol>
                </div>
              </div>

              {/* Quiz Scoring Logic */}
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  3. Quiz Scoring Algorithms
                </h4>
                <div className="bg-gray-900 text-gray-100 p-4 rounded text-sm font-mono mb-4">
                  <div className="text-green-400 mb-2">// What's Missing Quiz Scoring</div>
                  <div className="whitespace-pre-wrap">{`function calculateWhatsMissingScore(responses) {
  const weights = {
    problemSolution: 20,    // Has clear problem/solution
    targetMarket: 15,       // Knows target audience
    revenueModel: 15,       // Has monetization plan
    productReadiness: 15,   // Product development stage
    teamOperations: 10,     // Team structure
    competition: 10,        // Competitive analysis
    financialPlan: 15       // Financial preparedness
  };
  
  let totalScore = 0;
  let maxScore = 100;
  
  // Score each category based on response quality
  Object.keys(responses).forEach(category => {
    const response = responses[category];
    const weight = weights[category];
    
    // Scoring logic based on response completeness
    if (response === 'complete') totalScore += weight;
    else if (response === 'partial') totalScore += weight * 0.5;
    // 'missing' adds 0 points
  });
  
  return {
    score: totalScore,
    percentage: Math.round((totalScore / maxScore) * 100),
    level: getReadinessLevel(totalScore),
    recommendations: generateRecommendations(responses)
  };
}

// VC Readiness Quiz Scoring (0-30 points)
function calculateVCReadinessScore(responses) {
  const scoring = {
    marketSize: { 'less-10m': 0, '10m-100m': 1, '100m-1b': 2, 'more-1b': 3 },
    traction: { 'idea': 0, 'mvp': 1, 'growth': 2, 'revenue': 3 },
    team: { 'solo': 0, 'two': 2, 'three-plus': 3 },
    experience: { 'none': 0, 'industry': 1, 'startup': 2, 'both': 3 },
    // ... more scoring criteria
  };
  
  let totalScore = 0;
  Object.keys(responses).forEach(question => {
    const answer = responses[question];
    if (scoring[question] && scoring[question][answer]) {
      totalScore += scoring[question][answer];
    }
  });
  
  return {
    score: totalScore,
    maxScore: 30,
    readinessLevel: getVCReadinessLevel(totalScore),
    categoryBreakdown: getCategoryScores(responses),
    recommendations: getVCRecommendations(totalScore, responses)
  };
}`}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Implementation Guide */}
        <div className="space-y-8">
          {/* Phase 1: Core MVP */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center text-green-800">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Phase 1: Core MVP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Week 1 */}
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-green-800 mb-2">1: Project Setup & Authentication</h4>
                  <div className="space-y-3">
                    <div className="bg-green-50 p-3 rounded">
                      <h5 className="font-medium mb-2">Environment Setup</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Create Next.js project with TypeScript</li>
                        <li>• Setup Tailwind CSS and Shadcn/ui components</li>
                        <li>• Configure ESLint, Prettier, and Git hooks</li>
                        <li>• Setup Vercel deployment pipeline</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 p-3 rounded">
                      <h5 className="font-medium mb-2">Authentication System</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Integrate Clerk.dev authentication</li>
                        <li>• Create auth pages (signin, signup, verify-email, forgot-password)</li>
                        <li>• Setup webhook endpoint for user creation</li>
                        <li>• Implement protected route middleware</li>
                      </ul>
                      <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono">
                        <div>// API Route: /api/auth/webhook</div>
                        <div>// Handle Clerk user creation/update events</div>
                        <div>// Sync user data with Supabase</div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-3 rounded">
                      <h5 className="font-medium mb-2">Database Setup</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Create Supabase project and configure environment</li>
                        <li>• Create database tables (users, business_plans, folders)</li>
                        <li>• Setup Row Level Security (RLS) policies</li>
                        <li>• Create database helper functions</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Week 2 */}
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-green-800 mb-2">Dashboard & Plan Management</h4>
                  <div className="space-y-3">
                    <div className="bg-green-50 p-3 rounded">
                      <h5 className="font-medium mb-2">Dashboard Implementation</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Create dashboard layout with sidebar navigation</li>
                        <li>• Implement plan listing with search and filters</li>
                        <li>• Add folder creation and management</li>
                        <li>• Create plan CRUD operations</li>
                        <li>• Implement soft delete (trash) functionality</li>
                      </ul>
                      <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono">
                        <div>// API Routes needed:</div>
                        <div>GET /api/plans - List user plans</div>
                        <div>POST /api/plans - Create new plan</div>
                        <div>PUT /api/plans/[id] - Update plan</div>
                        <div>DELETE /api/plans/[id] - Soft delete</div>
                        <div>GET /api/folders - List folders</div>
                        <div>POST /api/folders - Create folder</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Week 3 */}
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-green-800 mb-2">Plan Builder Interface</h4>
                  <div className="space-y-3">
                    <div className="bg-green-50 p-3 rounded">
                      <h5 className="font-medium mb-2">Quiz Interface Development</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Create section-based quiz interface (9 sections)</li>
                        <li>• Implement form validation and progress tracking</li>
                        <li>• Add auto-save functionality every 30 seconds</li>
                        <li>• Create dynamic form fields (add/remove items)</li>
                        <li>• Implement navigation between sections</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Week 4 */}
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-green-800 mb-2">OpenAI Integration</h4>
                  <div className="space-y-3">
                    <div className="bg-green-50 p-3 rounded">
                      <h5 className="font-medium mb-2">AI Plan Generation</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Setup OpenAI API integration</li>
                        <li>• Implement plan generation logic with prompts</li>
                        <li>• Create generation screen with progress indicators</li>
                        <li>• Add error handling and retry logic</li>
                        <li>• Implement token usage tracking</li>
                      </ul>
                      <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono">
                        <div>// API Route: /api/ai/generate-plan</div>
                        <div>// Input: formData, planType, userId</div>
                        <div>// Output: generated business plan JSON</div>
                        <div>// Track: token usage, generation time</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Phase 2: AI & Features */}
          <Card className="border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-800">
                <Bot className="h-5 w-5 mr-2" />
                Phase 2: AI Features & User Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Week 5 */}
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Plan Output & Editing</h4>
                  <div className="space-y-3">
                    <div className="bg-yellow-50 p-3 rounded">
                      <h5 className="font-medium mb-2">Plan Display & AI Editing</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Create professional plan output page</li>
                        <li>• Implement section-wise editing interface</li>
                        <li>• Build AI chat modal for section editing</li>
                        <li>• Add edit limits enforcement (Starter: 1/section)</li>
                        <li>• Create change tracking and version history</li>
                      </ul>
                      <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono">
                        <div>// API Route: /api/ai/edit-section</div>
                        <div>// Check edit limits before processing</div>
                        <div>// Use section-specific prompts</div>
                        <div>// Update edit count in database</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Week 6 */}
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">DOCX Export</h4>
                  <div className="space-y-3">
                    <div className="bg-yellow-50 p-3 rounded">
                      <h5 className="font-medium mb-2">Document Export System</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Integrate html-docx-js or docx npm package</li>
                        <li>• Create professional document templates</li>
                        <li>• Implement client-side DOCX generation</li>
                        <li>• Add custom styling and branding</li>
                        <li>• Create download functionality</li>
                      </ul>
                      <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono">
                        <div>// Client-side generation to avoid server costs</div>
                        <div>// Professional formatting with headers/footers</div>
                        <div>// Include company branding</div>
                        <div>// Support for tables and formatting</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Week 7 */}
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Usage Limits & Plan Management</h4>
                  <div className="space-y-3">
                    <div className="bg-yellow-50 p-3 rounded">
                      <h5 className="font-medium mb-2">Plan Limits & Enforcement</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Implement plan usage tracking</li>
                        <li>• Add plan limit enforcement (Starter: 3, Pro: 10)</li>
                        <li>• Create upgrade prompts and notifications</li>
                        <li>• Add usage dashboard and analytics</li>
                        <li>• Implement plan expiration handling</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Week 8 */}
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">User Experience Polish</h4>
                  <div className="space-y-3">
                    <div className="bg-yellow-50 p-3 rounded">
                      <h5 className="font-medium mb-2">UX Improvements</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Add loading states and progress indicators</li>
                        <li>• Implement error handling and user feedback</li>
                        <li>• Create onboarding flow for new users</li>
                        <li>• Add tooltips and help documentation</li>
                        <li>• Optimize mobile responsiveness</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Phase 3: Business Logic */}
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800">
                <Zap className="h-5 w-5 mr-2" />
                Phase 3: Business Logic & Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Week 9 */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Payment Integration</h4>
                  <div className="space-y-3">
                    <div className="bg-blue-50 p-3 rounded">
                      <h5 className="font-medium mb-2">Razorpay Integration</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Setup Razorpay account and API keys</li>
                        <li>• Create payment flow for plan purchases</li>
                        <li>• Implement GST calculation for Indian users</li>
                        <li>• Add international payment support</li>
                        <li>• Create invoice generation system</li>
                      </ul>
                      <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono">
                        <div>// API Routes:</div>
                        <div>POST /api/payments/create-order</div>
                        <div>POST /api/payments/verify</div>
                        <div>POST /api/payments/webhook</div>
                        <div>// Handle plan activation after payment</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Week 10 */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Quiz Systems</h4>
                  <div className="space-y-3">
                    <div className="bg-blue-50 p-3 rounded">
                      <h5 className="font-medium mb-2">What's Missing & VC Readiness Quizzes</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Implement quiz scoring algorithms</li>
                        <li>• Create results pages with recommendations</li>
                        <li>• Add lead capture before showing results</li>
                        <li>• Implement quiz analytics tracking</li>
                        <li>• Create email follow-up sequences</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Week 11 */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Business Glossary & Tools</h4>
                  <div className="space-y-3">
                    <div className="bg-blue-50 p-3 rounded">
                      <h5 className="font-medium mb-2">Content & Tools</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Create searchable business glossary</li>
                        <li>• Implement timed popup lead capture</li>
                        <li>• Add KPI calculator functionality</li>
                        <li>• Create contact form with email notifications</li>
                        <li>• Setup analytics and tracking</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Week 12 */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Admin & Analytics</h4>
                  <div className="space-y-3">
                    <div className="bg-blue-50 p-3 rounded">
                      <h5 className="font-medium mb-2">Backend Administration</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Create admin dashboard for monitoring</li>
                        <li>• Implement usage analytics and reporting</li>
                        <li>• Add error monitoring with Sentry</li>
                        <li>• Setup email notifications for critical events</li>
                        <li>• Create backup and recovery procedures</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Phase 4: Testing & Launch */}
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-800">
                <Target className="h-5 w-5 mr-2" />
                Phase 4: Testing & Launch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Week 13-14 */}
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Testing & QA</h4>
                  <div className="space-y-3">
                    <div className="bg-purple-50 p-3 rounded">
                      <h5 className="font-medium mb-2">Comprehensive Testing</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Unit testing for critical functions</li>
                        <li>• Integration testing for API endpoints</li>
                        <li>• End-to-end testing for user flows</li>
                        <li>• Performance testing and optimization</li>
                        <li>• Security testing and vulnerability assessment</li>
                        <li>• Mobile responsiveness testing</li>
                        <li>• Cross-browser compatibility testing</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Week 15 */}
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Pre-Launch Preparation</h4>
                  <div className="space-y-3">
                    <div className="bg-purple-50 p-3 rounded">
                      <h5 className="font-medium mb-2">Launch Readiness</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Setup production environment on Vercel</li>
                        <li>• Configure custom domain (planinsta.wytmode.com)</li>
                        <li>• Setup SSL certificates and security headers</li>
                        <li>• Configure production database and backups</li>
                        <li>• Setup monitoring and alerting systems</li>
                        <li>• Create deployment and rollback procedures</li>
                        <li>• Prepare launch marketing materials</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Week 16 */}
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Launch & Post-Launch</h4>
                  <div className="space-y-3">
                    <div className="bg-purple-50 p-3 rounded">
                      <h5 className="font-medium mb-2">Go Live - June 26, 2025</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Deploy to production environment</li>
                        <li>• Monitor system performance and errors</li>
                        <li>• Setup customer support channels</li>
                        <li>• Monitor payment processing and user signups</li>
                        <li>• Collect user feedback and bug reports</li>
                        <li>• Plan post-launch feature iterations</li>
                        <li>• Delete this sitemap page!</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Critical Implementation Notes */}
        <Card className="mt-8 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Critical Implementation Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-red-700">
              <div>
                <h4 className="font-semibold mb-2">🔥 High Priority Items</h4>
                <ul className="text-sm space-y-1">
                  <li>• OpenAI API rate limiting and error handling is CRITICAL</li>
                  <li>• Plan usage limits must be enforced at database level</li>
                  <li>• Payment webhook security is essential for plan activation</li>
                  <li>• Auto-save functionality prevents data loss</li>
                  <li>• Proper error logging for debugging AI generation issues</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">💰 Cost Management</h4>
                <ul className="text-sm space-y-1">
                  <li>• Monitor OpenAI token usage closely (budget $50-300/month)</li>
                  <li>• Implement request caching where possible</li>
                  <li>• Set up billing alerts for all services</li>
                  <li>• Use Vercel's free tier efficiently</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">🔒 Security Requirements</h4>
                <ul className="text-sm space-y-1">
                  <li>• Validate all user inputs before AI processing</li>
                  <li>• Implement proper CORS policies</li>
                  <li>• Use environment variables for all API keys</li>
                  <li>• Setup proper RLS policies in Supabase</li>
                  <li>• Sanitize AI-generated content before display</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Environment Variables */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Complete Environment Variables List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm">
              <div className="space-y-1">
                <div className="text-green-400"># Authentication (Clerk.dev)</div>
                <div>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...</div>
                <div>CLERK_SECRET_KEY=sk_test_...</div>
                <div>CLERK_WEBHOOK_SECRET=whsec_...</div>
                <div>NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/signin</div>
                <div>NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/signup</div>

                <div className="text-green-400 mt-4"># Database (Supabase)</div>
                <div>NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co</div>
                <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...</div>
                <div>SUPABASE_SERVICE_ROLE_KEY=eyJ...</div>

                <div className="text-green-400 mt-4"># AI Integration (OpenAI)</div>
                <div>OPENAI_API_KEY=sk-...</div>
                <div>OPENAI_ORG_ID=org-... # Optional</div>

                <div className="text-green-400 mt-4"># Payments (Razorpay)</div>
                <div>RAZORPAY_KEY_ID=rzp_test_...</div>
                <div>RAZORPAY_KEY_SECRET=...</div>
                <div>RAZORPAY_WEBHOOK_SECRET=...</div>

                <div className="text-green-400 mt-4"># Email (Resend)</div>
                <div>RESEND_API_KEY=re_...</div>
                <div>FROM_EMAIL=noreply@planinsta.com</div>

                <div className="text-green-400 mt-4"># Analytics & Monitoring</div>
                <div>NEXT_PUBLIC_PLAUSIBLE_DOMAIN=planinsta.com</div>
                <div>SENTRY_DSN=https://...</div>

                <div className="text-green-400 mt-4"># Application Settings</div>
                <div>NEXT_PUBLIC_APP_URL=https://planinsta.wytmode.com</div>
                <div>NODE_ENV=production</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Final Checklist */}
        <Card className="mt-8 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Pre-Launch Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-800 mb-3">Technical Checklist</h4>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span>All API endpoints tested and working</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span>OpenAI integration with proper error handling</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span>Payment processing fully functional</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span>Database backups configured</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span>SSL certificates and security headers</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span>Mobile responsiveness verified</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span>Performance optimization completed</span>
                  </label>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-green-800 mb-3">Business Checklist</h4>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span>Legal pages reviewed and updated</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span>Pricing and plan limits configured</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span>Email templates and notifications ready</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span>Customer support channels setup</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span>Analytics and monitoring active</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span>Launch marketing materials prepared</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span>This sitemap page deleted!</span>
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Dashboard Section - Post Launch */}
        <Card className="mt-8 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <Settings className="h-5 w-5 mr-2" />
              Admin Dashboard - Post Launch Priority (Deadline: July 1, 2025)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-orange-100 p-4 rounded-lg mb-6">
              <p className="text-orange-800 font-medium">
                🎯 <strong>Timeline:</strong> Development starts after main app launch (June 26) - Complete by July 1,
                2025
              </p>
              <p className="text-orange-700 text-sm mt-1">
                This admin system is secondary priority and should be developed as a separate phase after the main
                application is live and stable.
              </p>
            </div>

            <div className="space-y-8">
              {/* Admin Authentication & Access */}
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold text-orange-800 mb-3">Phase 1: Admin Authentication & Security</h4>
                <div className="bg-white p-4 rounded-lg border space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Step 1: Admin Role System</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Add admin role field to users table (role: 'user' | 'admin' | 'super_admin')</li>
                      <li>• Create admin middleware for route protection</li>
                      <li>• Implement admin login with separate authentication flow</li>
                      <li>• Add admin session management with enhanced security</li>
                    </ul>
                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono">
                      <div>// Database Schema Update</div>
                      <div>ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';</div>
                      <div>// Middleware: /middleware/admin-auth.ts</div>
                      <div>// Route: /admin/* (protected by admin middleware)</div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Step 2: Admin Dashboard Layout</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Create responsive admin layout with sidebar navigation</li>
                      <li>• Implement dark/light theme toggle</li>
                      <li>• Add breadcrumb navigation</li>
                      <li>• Create admin header with user info and logout</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Customer Management */}
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold text-orange-800 mb-3">Phase 2: Customer Management System</h4>
                <div className="bg-white p-4 rounded-lg border space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Step 1: Customer Overview Dashboard</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Customer list with search, filter, and pagination</li>
                      <li>• Real-time customer statistics (total, active, churned)</li>
                      <li>• Customer segmentation by plan type</li>
                      <li>• Recent customer activity feed</li>
                      <li>• Export customer data to CSV/Excel</li>
                    </ul>
                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono">
                      <div>// API Routes needed:</div>
                      <div>GET /api/admin/customers - List all customers</div>
                      <div>GET /api/admin/customers/[id] - Customer details</div>
                      <div>PUT /api/admin/customers/[id] - Update customer</div>
                      <div>POST /api/admin/customers/export - Export data</div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Step 2: Customer Profile Management</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Edit customer name, email, and profile information</li>
                      <li>• View customer's business plans and usage history</li>
                      <li>• Customer activity timeline and login history</li>
                      <li>• Notes and tags system for customer management</li>
                      <li>• Customer support ticket integration</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Step 3: Password & Security Management</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Force password reset for customers</li>
                      <li>• Disable/enable customer accounts</li>
                      <li>• View customer login attempts and security logs</li>
                      <li>• MFA management (enable/disable for customers)</li>
                    </ul>
                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono">
                      <div>// Integration with Clerk.dev Admin API</div>
                      <div>// Use Clerk's backend API for user management</div>
                      <div>// Sync changes with local database</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan Management */}
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold text-orange-800 mb-3">Phase 3: Plan & Subscription Management</h4>
                <div className="bg-white p-4 rounded-lg border space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Step 1: Plan Assignment & Upgrades</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Upgrade/downgrade customer plans manually</li>
                      <li>• Assign custom plan limits (override default limits)</li>
                      <li>• Extend plan expiration dates</li>
                      <li>• Bulk plan operations for multiple customers</li>
                      <li>• Plan change history and audit logs</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Step 2: Usage Monitoring & Limits</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• View customer's plan usage (plans created, AI edits used)</li>
                      <li>• Reset usage counters manually</li>
                      <li>• Set custom usage limits per customer</li>
                      <li>• Usage alerts and notifications</li>
                      <li>• Plan utilization analytics and reports</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Step 3: Billing & Payment Management</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• View customer payment history</li>
                      <li>• Process refunds and adjustments</li>
                      <li>• Generate custom invoices</li>
                      <li>• Failed payment recovery tools</li>
                      <li>• Revenue analytics by customer</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Analytics & Monitoring */}
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold text-orange-800 mb-3">Phase 4: Analytics & System Monitoring</h4>
                <div className="bg-white p-4 rounded-lg border space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Step 1: OpenAI Usage Analytics</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Real-time OpenAI token usage dashboard</li>
                      <li>• Cost tracking and budget alerts</li>
                      <li>• Usage by customer and plan type</li>
                      <li>• Model performance analytics (GPT-3.5 vs GPT-4o)</li>
                      <li>• API error rates and response times</li>
                    </ul>
                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono">
                      <div>// New table: ai_usage_analytics</div>
                      <div>// Track: tokens, cost, model, response_time, errors</div>
                      <div>// Real-time charts with Chart.js or Recharts</div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Step 2: Database & System Health</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Database performance metrics and query analytics</li>
                      <li>• Storage usage and growth trends</li>
                      <li>• System uptime and error monitoring</li>
                      <li>• API endpoint performance dashboard</li>
                      <li>• Automated health checks and alerts</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Step 3: Application Analytics</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• User engagement metrics and session analytics</li>
                      <li>• Feature usage statistics (quiz completions, plan generations)</li>
                      <li>• Conversion funnel analysis</li>
                      <li>• Page performance and load times</li>
                      <li>• Mobile vs desktop usage patterns</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Marketing & Sales Dashboard */}
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold text-orange-800 mb-3">Phase 5: Marketing & Sales Intelligence</h4>
                <div className="bg-white p-4 rounded-lg border space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Step 1: Lead Management System</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Lead capture analytics from quizzes and forms</li>
                      <li>• Lead scoring and qualification system</li>
                      <li>• Lead-to-customer conversion tracking</li>
                      <li>• Email campaign performance metrics</li>
                      <li>• Lead source attribution and ROI analysis</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Step 2: Sales Performance Dashboard</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Revenue analytics with trends and forecasting</li>
                      <li>• Plan conversion rates (Starter vs Professional)</li>
                      <li>• Customer lifetime value (CLV) calculations</li>
                      <li>• Churn analysis and retention metrics</li>
                      <li>• Sales funnel optimization insights</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Step 3: Marketing Campaign Analytics</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Quiz performance and completion rates</li>
                      <li>• Content engagement metrics (glossary, blog posts)</li>
                      <li>• Social media and referral tracking</li>
                      <li>• A/B testing results and optimization</li>
                      <li>• Marketing spend vs acquisition cost analysis</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Interactive UI Elements */}
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold text-orange-800 mb-3">Phase 6: Interactive UI & User Experience</h4>
                <div className="bg-white p-4 rounded-lg border space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Step 1: Advanced Data Visualization</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Interactive charts and graphs (Chart.js, D3.js, or Recharts)</li>
                      <li>• Real-time data updates with WebSocket connections</li>
                      <li>• Drill-down analytics with filtering and segmentation</li>
                      <li>• Animated transitions and loading states</li>
                      <li>• Export charts as images or PDFs</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Step 2: Interactive Elements & Effects</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Hover effects and micro-interactions</li>
                      <li>• Smooth page transitions and animations</li>
                      <li>• Interactive data tables with sorting and filtering</li>
                      <li>• Modal dialogs with smooth animations</li>
                      <li>• Progress indicators for long-running operations</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Step 3: Advanced UI Components</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Multi-step wizards for complex operations</li>
                      <li>• Drag-and-drop interfaces for data management</li>
                      <li>• Advanced search with autocomplete and filters</li>
                      <li>• Bulk action tools with progress tracking</li>
                      <li>• Customizable dashboard widgets</li>
                    </ul>
                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono">
                      <div>// UI Libraries to consider:</div>
                      <div>// Framer Motion for animations</div>
                      <div>// React DnD for drag-and-drop</div>
                      <div>// React Query for data fetching</div>
                      <div>// Zustand for state management</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Implementation */}
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold text-orange-800 mb-3">Phase 7: Technical Implementation Details</h4>
                <div className="bg-white p-4 rounded-lg border space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Step 1: Database Schema Extensions</h5>
                    <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                      <div className="text-green-600 mb-2">-- Additional tables for admin functionality</div>
                      <div>CREATE TABLE admin_logs (</div>
                      <div> id UUID PRIMARY KEY,</div>
                      <div> admin_id UUID REFERENCES users(id),</div>
                      <div> action VARCHAR(100),</div>
                      <div> target_user_id UUID,</div>
                      <div> details JSONB,</div>
                      <div> created_at TIMESTAMP DEFAULT NOW()</div>
                      <div>);</div>
                      <br />
                      <div>CREATE TABLE system_metrics (</div>
                      <div> id UUID PRIMARY KEY,</div>
                      <div> metric_type VARCHAR(50),</div>
                      <div> value DECIMAL,</div>
                      <div> metadata JSONB,</div>
                      <div> recorded_at TIMESTAMP DEFAULT NOW()</div>
                      <div>);</div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Step 2: API Endpoints for Admin</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded">
                        <h6 className="font-medium text-sm mb-2">Customer Management</h6>
                        <div className="text-xs font-mono space-y-1">
                          <div>GET /api/admin/customers</div>
                          <div>PUT /api/admin/customers/[id]</div>
                          <div>POST /api/admin/customers/[id]/reset-password</div>
                          <div>PUT /api/admin/customers/[id]/plan</div>
                          <div>GET /api/admin/customers/[id]/usage</div>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <h6 className="font-medium text-sm mb-2">Analytics & Monitoring</h6>
                        <div className="text-xs font-mono space-y-1">
                          <div>GET /api/admin/analytics/openai</div>
                          <div>GET /api/admin/analytics/revenue</div>
                          <div>GET /api/admin/analytics/users</div>
                          <div>GET /api/admin/system/health</div>
                          <div>GET /api/admin/leads/analytics</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Step 3: Security & Permissions</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Role-based access control (RBAC) implementation</li>
                      <li>• Admin action logging and audit trails</li>
                      <li>• IP whitelisting for admin access</li>
                      <li>• Two-factor authentication for admin accounts</li>
                      <li>• Session timeout and security monitoring</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Performance & Optimization */}
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold text-orange-800 mb-3">Phase 8: Performance & Optimization</h4>
                <div className="bg-white p-4 rounded-lg border space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Step 1: Data Optimization</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Implement data caching for frequently accessed metrics</li>
                      <li>• Database query optimization and indexing</li>
                      <li>• Pagination for large datasets</li>
                      <li>• Background jobs for heavy analytics processing</li>
                      <li>• Data archiving for historical records</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Step 2: Real-time Features</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• WebSocket connections for live data updates</li>
                      <li>• Real-time notifications for critical events</li>
                      <li>• Live chat support integration</li>
                      <li>• Real-time system monitoring alerts</li>
                      <li>• Live customer activity feeds</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Development Timeline */}
        <Card className="mt-8 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <Calendar className="h-5 w-5 mr-2" />
              Admin Dashboard Development Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-semibold text-orange-800 mb-2">Post-Launch Development Schedule</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="bg-orange-100 rounded-lg p-3">
                      <h5 className="font-semibold text-orange-800">June 27-28</h5>
                      <p className="text-sm text-orange-600">Phase 1-2</p>
                      <p className="text-xs text-orange-600">Auth & Customer Mgmt</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-orange-100 rounded-lg p-3">
                      <h5 className="font-semibold text-orange-800">June 29</h5>
                      <p className="text-sm text-orange-600">Phase 3-4</p>
                      <p className="text-xs text-orange-600">Plans & Analytics</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-orange-100 rounded-lg p-3">
                      <h5 className="font-semibold text-orange-800">June 30</h5>
                      <p className="text-sm text-orange-600">Phase 5-6</p>
                      <p className="text-xs text-orange-600">Marketing & UI</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-orange-100 rounded-lg p-3">
                      <h5 className="font-semibold text-orange-800">July 1</h5>
                      <p className="text-sm text-orange-600">Phase 7-8</p>
                      <p className="text-xs text-orange-600">Testing & Launch</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-semibold text-orange-800 mb-3">Admin Dashboard Features Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Customer Management</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Customer profiles and editing</li>
                      <li>• Password reset and security</li>
                      <li>• Plan upgrades/downgrades</li>
                      <li>• Usage monitoring</li>
                      <li>• Bulk operations</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Analytics & Monitoring</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• OpenAI usage and costs</li>
                      <li>• System health monitoring</li>
                      <li>• Revenue analytics</li>
                      <li>• User engagement metrics</li>
                      <li>• Performance dashboards</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Marketing & Sales</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Lead management system</li>
                      <li>• Conversion tracking</li>
                      <li>• Campaign analytics</li>
                      <li>• Customer lifetime value</li>
                      <li>• Churn analysis</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
