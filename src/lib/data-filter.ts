const SENSITIVE_FIELDS = ["icalUrl", "icalUrlBooking", "ownerEmail", "ownerName", "userId"] as const

type PropertyRecord = Record<string, unknown>

export function stripSensitiveFields<T extends PropertyRecord>(obj: T): Omit<T, typeof SENSITIVE_FIELDS[number]> {
  const cleaned = { ...obj }
  for (const field of SENSITIVE_FIELDS) {
    delete cleaned[field]
  }
  return cleaned
}

export function stripSensitiveFromList<T extends PropertyRecord>(items: T[]): Omit<T, typeof SENSITIVE_FIELDS[number]>[] {
  return items.map(stripSensitiveFields)
}

export function maskIcalUrl(url: string | null): string | null {
  if (!url) return null
  try {
    const parsed = new URL(url)
    return `${parsed.protocol}//${parsed.hostname}/***`
  } catch {
    return "***"
  }
}

export function safePropertyForList<T extends PropertyRecord>(property: T) {
  return {
    ...stripSensitiveFields(property),
    hasIcal: !!(property.icalUrl),
    hasIcalBooking: !!(property.icalUrlBooking),
    hasOwnerEmail: !!(property.ownerEmail),
  }
}
