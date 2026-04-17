import { describe, it, expect } from "vitest"
import { formatCurrency, calculateNights } from "../utils"

describe("utils", () => {
  describe("formatCurrency", () => {
    it("formats positive amounts", () => {
      const result = formatCurrency(1234.56)
      expect(result).toContain("1")
      expect(result).toContain("234")
    })

    it("formats zero", () => {
      const result = formatCurrency(0)
      expect(result).toContain("0")
    })
  })

  describe("calculateNights", () => {
    it("calculates correct nights", () => {
      const checkIn = new Date("2026-05-01")
      const checkOut = new Date("2026-05-04")
      expect(calculateNights(checkIn, checkOut)).toBe(3)
    })

    it("returns 0 for same day", () => {
      const date = new Date("2026-05-01")
      expect(calculateNights(date, date)).toBe(0)
    })
  })
})
