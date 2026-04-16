"use client"

import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface PageErrorProps {
  message?: string
  onRetry?: () => void
}

export function PageError({
  message = "Une erreur est survenue",
  onRetry,
}: PageErrorProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-12">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-sm text-muted-foreground">{message}</p>
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
