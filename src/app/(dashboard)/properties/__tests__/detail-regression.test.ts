import { describe, it, expect } from "vitest"
import { readFileSync } from "fs"

describe("property detail page non-regression", () => {
  // Non-regression: PR #11, bug #10 — no setLoading(false) in catch before redirect
  it("does not call setLoading(false) before router.push in catch", () => {
    const source = readFileSync("src/app/(dashboard)/properties/[id]/page.tsx", "utf-8")
    const catchMatch = source.match(/\.catch\(\s*\(\)\s*=>\s*\{[^}]*\}/s)
    if (catchMatch) {
      expect(catchMatch[0]).not.toContain("setLoading(false)")
    }
  })
})
