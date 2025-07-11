import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
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
                This Privacy Policy elaborates on what information we collect, why we collect it, how we use it, how we
                protect it, and the rights you have in relation to your data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We collect various categories of data to provide and improve our services. These include:
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Information</h3>
                  <p className="text-gray-700 leading-relaxed">
                    This includes your full name, email address, phone number, and payment-related information required
                    for billing and transaction purposes. This information is essential to create your user account and
                    ensure secure access.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Information</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We collect details such as your business name, business plan content, sector, industry, geographical
                    focus, and any financial estimates or figures you input into the platform. This is necessary to
                    generate AI-assisted business plans tailored to your specific case.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Technical Information</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Automatically collected data includes your IP address, browser type and version, operating system,
                    session timestamps, device type, and other system diagnostics. These help us troubleshoot issues,
                    enhance user experience, and maintain system integrity.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Cookies and Tracking Technologies</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We use cookies, tracking pixels, and related technologies to recognize your browser, store
                    preferences, enhance security, and monitor user interaction. Full details are available in our
                    Cookies Policy section.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We utilize the information we collect for the following purposes:
              </p>

              <ul className="space-y-3 text-gray-700">
                <li>
                  <strong>Service Delivery:</strong> Your data is used to provide access to the PlanInsta platform,
                  allow you to create, save, and manage your business plans, and deliver support services.
                </li>
                <li>
                  <strong>Personalization:</strong> We tailor your experience by remembering your preferences, session
                  history, and customization settings.
                </li>
                <li>
                  <strong>Payment Processing:</strong> We use your information to securely process payments, issue
                  invoices, verify transactions, and maintain payment records.
                </li>
                <li>
                  <strong>Communication:</strong> We may contact you via email or SMS to share updates, notify about
                  plan limits, new features, or changes to policies. Marketing communications are only sent if you
                  opt-in.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Information Sharing and Disclosure</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We do not and will never sell your personal information to any third party. However, we may share your
                information under the following circumstances:
              </p>

              <ul className="space-y-3 text-gray-700">
                <li>
                  <strong>Service Providers:</strong> We engage trusted third-party vendors for infrastructure, cloud
                  hosting, payment gateways (e.g., Stripe, Razorpay), and customer support tools. These providers access
                  only the information needed to perform their functions and are contractually obligated to safeguard
                  your data.
                </li>
                <li>
                  <strong>Legal Obligations:</strong> If required by law, regulation, legal process, or government
                  request, we may disclose your personal data in compliance with applicable statutes.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your data as long as your account remains active or as necessary to fulfil the services
                requested. You may request the deletion of your data at any time by contacting us. Please note that
                backup copies may take up to 30 days to be purged entirely from all systems.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We adopt industry-standard measures to ensure the protection of your data:
              </p>

              <ul className="space-y-2 text-gray-700">
                <li>• All sensitive data is encrypted both in transit (TLS) and at rest.</li>
                <li>• Access to user data is restricted through role-based access control.</li>
                <li>
                  • We conduct regular security audits and vulnerability assessments to detect and resolve threats.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights and Choices</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You have the following rights under applicable data protection laws:
              </p>

              <ul className="space-y-3 text-gray-700">
                <li>
                  <strong>Right to Access:</strong> Request a copy of the personal data we hold about you.
                </li>
                <li>
                  <strong>Right to Correction:</strong> Request corrections to any inaccurate or outdated information.
                </li>
                <li>
                  <strong>Right to Deletion:</strong> Request complete erasure of your personal and business data.
                </li>
                <li>
                  <strong>Right to Withdraw Consent:</strong> You may withdraw previously given consent to data
                  processing at any time.
                </li>
                <li>
                  <strong>Right to Lodge Complaint:</strong> If you believe your rights have been violated, you may file
                  a complaint with your local data protection authority.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-2">For privacy-related concerns, please contact:</p>
              <div className="bg-gray-50 rounded-2xl p-6">
                <p className="text-gray-700 mb-2">
                  <strong>Email:</strong> support@wytmode.com
                </p>
                <p className="text-gray-700">
                  <strong>Phone:</strong> +91 8884557972 / 8277276944
                </p>
              </div>
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
