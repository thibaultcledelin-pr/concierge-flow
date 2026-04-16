import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { readFileSync } from "fs"
import { ExpenseForm } from "../expense-form"

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

describe("expense-form non-regression", () => {
  // Non-regression: PR #11, bug #12 — optional chaining, no non-null assertion
  it("source code uses optional chaining for defaultValues.id", () => {
    const source = readFileSync("src/components/expenses/expense-form.tsx", "utf-8")
    expect(source).not.toContain("defaultValues!.id")
    expect(source).toContain("defaultValues?.id")
  })

  // Non-regression: PR #11, bug #12 — form renders without defaultValues
  it("renders without crashing when defaultValues is undefined", () => {
    render(
      <ExpenseForm
        properties={[]}
        open={true}
        onOpenChange={vi.fn()}
        onSuccess={vi.fn()}
      />
    )
    expect(screen.getByText("Nouvelle d\u00e9pense")).toBeInTheDocument()
  })
})
