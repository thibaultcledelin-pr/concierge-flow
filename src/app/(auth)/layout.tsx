export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary" />
          <span className="text-xl font-bold tracking-tight text-foreground">
            ConciergeFlow
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Suivi de rentabilité pour conciergeries
        </p>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
