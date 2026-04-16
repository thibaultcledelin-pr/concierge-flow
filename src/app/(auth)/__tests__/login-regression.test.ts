import { describe, it, expect } from "vitest"
import { readFileSync } from "fs"

describe("login page non-regression", () => {
  // Non-regression: PR #11, bug #15 — loading stays true during navigation
  it("does not call setLoading(false) after router.push", () => {
    const source = readFileSync("src/app/(auth)/login/page.tsx", "utf-8")
    const afterPush = source.slice(source.indexOf("router.push"))
    const nextSetLoading = afterPush.indexOf("setLoading(false)")
    const functionEnd = afterPush.indexOf("}")
    // setLoading(false) should NOT appear between router.push and the end of handleSubmit
    if (nextSetLoading !== -1) {
      expect(nextSetLoading).toBeGreaterThan(functionEnd)
    }
  })
})
