const PRIVATE_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./,
  /^0\.0\.0\.0$/,
  /^::1$/,
  /^\[::1\]$/,
  /^fc00:/i,
  /^fd00:/i,
  /^fe80:/i,
]

export function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== "https:") return false
    const host = parsed.hostname.toLowerCase()
    if (PRIVATE_PATTERNS.some((pattern) => pattern.test(host))) return false
    return true
  } catch {
    return false
  }
}
