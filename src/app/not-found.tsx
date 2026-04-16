import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600/15 text-violet-400">
        <span className="text-3xl font-bold">?</span>
      </div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">Page introuvable</h1>
      <p className="mt-2 text-muted-foreground">
        Cette page n&apos;existe pas ou a été déplacée.
      </p>
      <Button asChild className="mt-6">
        <Link href="/dashboard">Retour au dashboard</Link>
      </Button>
    </div>
  )
}
