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
      // On efface l'horodatage d'activité : sinon, à la reconnexion, le montage
      // relit cette valeur périmée (> 30 min) et redéclenche une déconnexion en boucle.
      localStorage.removeItem(lastActivityKey)
      localStorage.setItem("sessionExpired", "1")
      window.location.href = "/login?timeout=1"
    }

    function resetTimer() {
      const now = Date.now()
      localStorage.setItem(lastActivityKey, now.toString())
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(logout, INACTIVITY_TIMEOUT_MS)
    }

    // Au montage (page chargée = utilisateur présent), on repart toujours d'un
    // minuteur neuf. On NE déconnecte PAS sur la base d'un ancien horodatage :
    // sinon une reconnexion juste après un timeout boucle indéfiniment.
    // La vraie inactivité de 30 min reste gérée par le setTimeout ci-dessous.
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
