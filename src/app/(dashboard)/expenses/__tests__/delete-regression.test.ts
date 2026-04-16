import { describe, it, expect } from "vitest"
import { readFileSync } from "fs"

describe("expenses delete non-regression", () => {
  // Non-regression: PR #11, bug #14 — delete must check res.ok before removing from UI
  it("checks response status before removing item from list", () => {
    const source = readFileSync("src/app/(dashboard)/expenses/page.tsx", "utf-8")
    const deleteSection = source.slice(source.indexOf("handleDelete"))
    expect(deleteSection).toContain("res.ok")
  })

  // Non-regression: PR #11, bug #14 — shows error message if delete fails
  it("shows error feedback on delete failure", () => {
    const source = readFileSync("src/app/(dashboard)/expenses/page.tsx", "utf-8")
    const deleteSection = source.slice(source.indexOf("handleDelete"))
    expect(deleteSection).toContain("Impossible")
  })
})
