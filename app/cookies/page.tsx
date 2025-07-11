import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Cookies Policy</h1>
            <p className="text-lg text-gray-600">Effective Date: July 1, 2025</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                This Cookies Policy explains how PlanInsta uses cookies and similar technologies to recognize users when
                they visit our website or use our application.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. What Are Cookies?</h2>
              <p className="text-gray-700 leading-relaxed">
                Cookies are small text files placed on your computer or mobile device by websites you visit. They are
                used to make websites work efficiently, as well as to provide reporting information and personalization.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Types of Cookies We Use</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Strictly Necessary Cookies</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Required for the core functionality of the platform such as authentication, session persistence, and
                    form submission.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytical/Performance Cookies</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Help us understand how users interact with the platform, allowing us to improve site functionality
                    and user experience.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Preference Cookies</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Store your personal settings including language, region, and saved form progress.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Third-Party Cookies</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Our integrations with services such as Google Analytics, Stripe, or live chat providers may set
                    their own cookies to track interactions or enable secure payments.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Managing Your Cookie Preferences</h2>
              <ul className="space-y-2 text-gray-700">
                <li>• You can control or delete cookies through your browser settings.</li>
                <li>• Most browsers allow you to refuse cookies or alert you when cookies are being sent.</li>
                <li>• Disabling cookies may impact the functionality of some parts of the PlanInsta application.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Consent and Updates</h2>
              <ul className="space-y-2 text-gray-700">
                <li>• By using the PlanInsta website or app, you consent to our use of cookies as outlined.</li>
                <li>
                  • This policy may be updated. Changes will be posted on this page with a revised effective date.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Contact</h2>
              <p className="text-gray-700 leading-relaxed mb-2">
                For any concerns related to cookies or tracking technologies, reach us at:
              </p>
              <div className="bg-gray-50 rounded-2xl p-6">
                <p className="text-gray-700">
                  <strong>Email:</strong> support@wytmode.com
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
