"use client"

import { useState } from "react"
import { Info } from "lucide-react"

interface InfoTooltipProps {
  text: string
}

export function InfoTooltip({ text }: InfoTooltipProps) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="rounded-full p-0.5 text-muted-foreground/50 transition-colors hover:text-muted-foreground"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        aria-label="Plus d'informations"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {show && (
        <div className="absolute right-0 top-6 z-50 w-64 rounded-lg border border-border bg-popover p-3 text-xs leading-relaxed text-popover-foreground shadow-lg">
          {text}
        </div>
      )}
    </div>
  )
}
