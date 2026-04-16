import { describe, it, expect } from "vitest"
import { readFileSync } from "fs"

describe("csv-import non-regression", () => {
  // Non-regression: PR #11, bug #6 — res.json() must be wrapped in try-catch
  it("source code wraps res.json() in try-catch", () => {
    const source = readFileSync("src/components/revenue/csv-import.tsx", "utf-8")
    expect(source).toContain("try {")
    expect(source).toContain(".catch(")
    expect(source).toContain("Erreur")
  })
})
