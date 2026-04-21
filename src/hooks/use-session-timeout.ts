"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes

const ACTIVITY_EVENTS = ["mousedown", "keydown", "touchstart", "scroll"]

export function useSessionTimeout() {
  const router = useRouter()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityKey = "lastActivity"

  useEffect(() => {
    async function logout() {
      const supabase = createClient()
      await supabase.auth.signOut()
      localStorage.setItem("sessionExpired", "1")
      window.location.href = "/login?timeout=1"
    }

    function resetTimer() {
      const now = Date.now()
      localStorage.setItem(lastActivityKey, now.toString())
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(logout, INACTIVITY_TIMEOUT_MS)
    }

    // Check on mount: was user inactive for too long in another tab?
    const stored = localStorage.getItem(lastActivityKey)
    if (stored) {
      const elapsed = Date.now() - parseInt(stored)
      if (elapsed > INACTIVITY_TIMEOUT_MS) {
        logout()
        return
      }
    }

    resetTimer()

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true })
    })

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, resetTimer)
      })
    }
  }, [router])
}
