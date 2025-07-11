import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Refund Policy</h1>
            <p className="text-lg text-gray-600">Effective Date: July 1, 2025</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Wytmode Cloud Private Limited ("Company", "we", "our", or "us"), headquartered in Bengaluru, India, is
                the legal owner and operator of the PlanInsta application. We are fully committed to safeguarding the
                privacy of our users and ensuring transparency in how we manage their personal and business data.
              </p>
              <p className="text-gray-700 leading-relaxed">
                All purchases are subject to the following refund policy, which is designed to be fair and transparent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. When Refunds Are Issued</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We provide refunds only in the following circumstances:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>• A user is charged multiple times for the same purchase due to a technical error.</li>
                <li>
                  • The platform fails to deliver a generated plan, and we are unable to resolve the issue within a
                  reasonable timeframe (typically 5 working days).
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Non-Refundable Circumstances</h2>
              <ul className="space-y-2 text-gray-700">
                <li>
                  • Dissatisfaction with the quality or style of AI-generated content, as it is based on machine
                  interpretation of user input.
                </li>
                <li>• Incorrect data entry or submission by the user.</li>
                <li>• Unused plan credits after purchase.</li>
                <li>• Requests for refunds based on change of mind.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Refund Request Procedure</h2>
              <p className="text-gray-700 leading-relaxed mb-4">To initiate a refund, follow these steps:</p>
              <ul className="space-y-2 text-gray-700">
                <li>• Send an email to support@wytmode.com within 7 calendar days of the transaction.</li>
                <li>
                  • Include your full name, registered email, transaction ID, and a clear explanation of the issue.
                </li>
                <li>
                  • Our support team will assess the request and notify you of eligibility within 2 business days.
                </li>
                <li>• Approved refunds will be processed within 7–10 business days via the original payment method.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Currency and Tax Notes</h2>
              <ul className="space-y-2 text-gray-700">
                <li>• Any refund will be exclusive of applicable taxes or payment gateway fees.</li>
                <li>• International users may be subject to currency conversion charges by their banks.</li>
              </ul>
            </section>

            <section className="bg-orange-50 rounded-2xl p-6 border-l-4 border-orange-500">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Company Information</h3>
              <p className="text-gray-700 mb-2">
                <strong>Wytmode Cloud Private Limited</strong>
              </p>
              
              <p className="text-gray-700 mb-2">
                <strong>Registered Address:</strong>
                <br />
                #63, H Colony, 2nd Main, Indira Nagar
                <br />
                1st Stage, Bengaluru (KA - IND) 560038
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Email:</strong> support@wytmode.com
                <br />
                <strong>Phone:</strong> (+91) 8884557972 / 8277276944
              </p>
              <p className="text-gray-700">
                <strong>Website:</strong> www.wytmode.com
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
