export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-24 text-center space-y-4">
      <h2 className="text-2xl font-semibold">Plan not found</h2>
      <p className="text-muted-foreground text-sm">
        The plan you’re looking for doesn’t exist or you don’t have access.
      </p>
      <a
        href="/dashboard/plans"
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition"
      >
        Back to My Plans
      </a>
    </div>
  )
}
