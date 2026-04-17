import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { SyncButton } from "../sync-button"

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

describe("SyncButton", () => {
  it("renders the sync button", () => {
    render(<SyncButton />)
    expect(screen.getByRole("button")).toBeDefined()
  })

  it("shows loading state when clicked", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ totalCreated: 0, totalSkipped: 0, results: [] }),
    })

    render(<SyncButton />)
    const button = screen.getByRole("button")
    fireEvent.click(button)

    expect(button).toHaveProperty("disabled", true)

    await waitFor(() => {
      expect(button).toHaveProperty("disabled", false)
    })
  })
})
