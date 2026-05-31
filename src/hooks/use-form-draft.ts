"use client"

import { useEffect, useRef } from "react"

const DRAFT_PREFIX = "draft:"
const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

interface DraftEntry<T> {
  value: T
  savedAt: number
}

// Saves form state to localStorage as the user types
export function useFormDraft<T extends object>(
  key: string,
  value: T,
  options: { enabled?: boolean } = {},
) {
  const { enabled = true } = options
  const initialMount = useRef(true)

  useEffect(() => {
    if (!enabled) return
    // Skip the very first render to avoid overwriting a just-restored draft
    if (initialMount.current) {
      initialMount.current = false
      return
    }
    try {
      const entry: DraftEntry<T> = { value, savedAt: Date.now() }
      localStorage.setItem(DRAFT_PREFIX + key, JSON.stringify(entry))
    } catch {
      // localStorage quota exceeded or unavailable — silently ignore
    }
  }, [key, value, enabled])
}

// Reads a draft if it exists and is not too old
export function loadFormDraft<T>(key: string): T | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(DRAFT_PREFIX + key)
    if (!raw) return null
    const entry = JSON.parse(raw) as DraftEntry<T>
    if (Date.now() - entry.savedAt > DRAFT_MAX_AGE_MS) {
      localStorage.removeItem(DRAFT_PREFIX + key)
      return null
    }
    return entry.value
  } catch {
    return null
  }
}

export function clearFormDraft(key: string) {
  if (typeof window === "undefined") return
  localStorage.removeItem(DRAFT_PREFIX + key)
}

export function hasFormDraft(key: string): boolean {
  return loadFormDraft(key) !== null
}
