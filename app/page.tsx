// import { Navigation } from "@/components/navigation"
// import { HeroSection } from "@/components/hero-section"
// import { FeaturesSection } from "@/components/features-section"
// import { PricingSection } from "@/components/pricing-section"
// import { TestimonialsSection } from "@/components/testimonials-section"
// import { Footer } from "@/components/footer"
// import { Toaster } from "@/components/ui/toaster"
// import { DiagnosticQuizWidget } from "@/components/diagnostic-quiz-widget"
// import { VCReadinessWidget } from "@/components/vc-readiness-widget"
// import { BusinessGlossaryWidget } from "@/components/business-glossary-widget"

// export default function HomePage() {
//   return (
//     <div className="min-h-screen bg-white">
//       <Navigation />
//       <HeroSection />
//       <FeaturesSection />
//       <DiagnosticQuizWidget />
//       <VCReadinessWidget />
//       <BusinessGlossaryWidget />
//       <PricingSection />
//       <TestimonialsSection />
//       <Footer />
//       <Toaster />
//     </div>
//   )
// }


// app/page.tsx
import { redirect } from 'next/navigation';

export default function HomePage() {
  // send anyone hitting “/” straight to your sign-in flow
  redirect('/auth/signin');
}
