import { describe, it, expect } from "vitest"
import { readFileSync } from "fs"

describe("import-csv non-regression", () => {
  // Non-regression: PR #9, bug #2 — file.text() must be wrapped in try-catch
  it("source code wraps file.text() in try-catch", () => {
    const source = readFileSync("src/app/api/revenue/import-csv/route.ts", "utf-8")
    expect(source).toContain("try {")
    expect(source).toContain("file.text()")
    expect(source).toContain("Failed to read file")
    expect(source).toContain("status: 400")
  })

  // Non-regression: PR #9 — file size limit must be present
  it("source code checks file size limit (5MB)", () => {
    const source = readFileSync("src/app/api/revenue/import-csv/route.ts", "utf-8")
    expect(source).toContain("5_000_000")
    expect(source).toContain("413")
  })
})
