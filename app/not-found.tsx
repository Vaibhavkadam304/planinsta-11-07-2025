import Image from "next/image"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      {/* Top-left logo */}
      <Image src="/images/planinsta-logo.png" alt="PlanInsta logo" width={160} height={36} />

      <h1 className="text-4xl font-bold mt-8">404 - Page Not Found</h1>
      <p className="text-gray-600 mt-2">The page you are looking for does not exist.</p>

      {/* Illustration under the headline */}
      <Image
        src="/placeholder.svg?height=280&width=420"
        alt="Confused robot illustration"
        className="mx-auto mt-8 w-full max-w-xs sm:max-w-md"
        width={420}
        height={280}
      />
    </div>
  )
}
