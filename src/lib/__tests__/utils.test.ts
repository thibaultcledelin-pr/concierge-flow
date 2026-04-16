import { describe, it, expect } from "vitest"
import { formatCurrency, calculateMargin, calculateNights, calculateRevenuePerNight, calculateOccupancyRate } from "../utils"

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

  describe("calculateMargin", () => {
    it("calculates correct margin", () => {
      expect(calculateMargin(1000, 300)).toBeCloseTo(70)
    })

    it("returns 0 when revenue is 0", () => {
      expect(calculateMargin(0, 100)).toBe(0)
    })

    it("returns 100% when no expenses", () => {
      expect(calculateMargin(1000, 0)).toBe(100)
    })

    it("handles negative profit (expenses > revenue)", () => {
      expect(calculateMargin(100, 200)).toBeCloseTo(-100)
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

  describe("calculateRevenuePerNight", () => {
    it("calculates correctly", () => {
      expect(calculateRevenuePerNight(1000, 200, 5)).toBe(160)
    })

    it("returns 0 when no nights", () => {
      expect(calculateRevenuePerNight(1000, 200, 0)).toBe(0)
    })
  })

  describe("calculateOccupancyRate", () => {
    it("calculates percentage correctly", () => {
      expect(calculateOccupancyRate(15, 30)).toBe(50)
    })

    it("caps at 100%", () => {
      expect(calculateOccupancyRate(35, 30)).toBe(100)
    })

    it("returns 0 when no days", () => {
      expect(calculateOccupancyRate(10, 0)).toBe(0)
    })
  })
})
