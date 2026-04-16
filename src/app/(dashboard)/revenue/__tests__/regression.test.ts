import { describe, it, expect } from "vitest"
import { readFileSync } from "fs"

describe("revenue page non-regression", () => {
  // Non-regression: PR #11, bug #13 — res.ok must be checked before .json()
  it("checks res.ok before parsing properties response", () => {
    const source = readFileSync("src/app/(dashboard)/revenue/page.tsx", "utf-8")
    const fetchBlocks = source.split("fetch(")
    for (let i = 1; i < fetchBlocks.length; i++) {
      const block = fetchBlocks[i].slice(0, 200)
      expect(block).toContain("res.ok")
    }
  })
})
