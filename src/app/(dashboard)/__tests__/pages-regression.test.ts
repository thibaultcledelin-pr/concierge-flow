import { describe, it, expect } from "vitest"
import { readFileSync } from "fs"

describe("dashboard pages non-regression", () => {
  it("expenses delete checks res.ok and shows error feedback", () => {
    const source = readFileSync("src/app/(dashboard)/expenses/page.tsx", "utf-8")
    const deleteSection = source.slice(source.indexOf("handleDelete"))
    expect(deleteSection).toContain("res.ok")
    expect(deleteSection).toContain("Impossible")
  })

  it("property detail does not setLoading(false) before redirect in catch", () => {
    const source = readFileSync("src/app/(dashboard)/properties/[id]/page.tsx", "utf-8")
    const catchMatch = source.match(/\.catch\(\s*\(\)\s*=>\s*\{[^}]*\}/s)
    if (catchMatch) {
      expect(catchMatch[0]).not.toContain("setLoading(false)")
    }
  })

  it("revenue page checks res.ok before parsing response", () => {
    const source = readFileSync("src/app/(dashboard)/revenue/page.tsx", "utf-8")
    const fetchBlocks = source.split("fetch(")
    for (let i = 1; i < fetchBlocks.length; i++) {
      const block = fetchBlocks[i].slice(0, 200)
      expect(block).toContain("res.ok")
    }
  })
})
