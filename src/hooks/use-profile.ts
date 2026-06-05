"use client"

import { useEffect, useState } from "react"

interface UserProfile {
  name: string | null
  email: string
  company: string | null
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) {
          setProfile({ name: data.name, email: data.email, company: data.company })
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  return profile
}
