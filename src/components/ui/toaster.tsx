"use client"

import { useToast } from "@/hooks/use-toast"
import { X, Check, AlertCircle } from "lucide-react"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 rounded-lg border p-4 shadow-lg animate-in slide-in-from-bottom-5 ${
            toast.variant === "destructive"
              ? "border-destructive/50 bg-destructive/10 text-destructive"
              : "border-border bg-card text-foreground"
          }`}
        >
          {toast.variant === "destructive" ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium">{toast.title}</p>
            {toast.description && (
              <p className="mt-1 text-xs text-muted-foreground">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => dismiss(toast.id)}
            className="shrink-0 rounded-sm opacity-70 hover:opacity-100"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  )
}
