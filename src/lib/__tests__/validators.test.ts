import { describe, it, expect } from "vitest"
import { propertySchema, expenseSchema, bookingSchema } from "../validators"

describe("propertySchema", () => {
  it("accepts valid property data", () => {
    const result = propertySchema.safeParse({
      name: "Studio Marais",
      address: "12 rue de Rivoli",
      city: "Paris",
      type: "APARTMENT",
      rooms: 2,
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty name", () => {
    const result = propertySchema.safeParse({
      name: "",
      address: "12 rue",
      city: "Paris",
      type: "APARTMENT",
      rooms: 1,
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid property type", () => {
    const result = propertySchema.safeParse({
      name: "Test",
      address: "12 rue",
      city: "Paris",
      type: "CASTLE",
      rooms: 1,
    })
    expect(result.success).toBe(false)
  })

  it("rejects negative rooms", () => {
    const result = propertySchema.safeParse({
      name: "Test",
      address: "12 rue",
      city: "Paris",
      type: "APARTMENT",
      rooms: -1,
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid iCal URL", () => {
    const result = propertySchema.safeParse({
      name: "Test",
      address: "12 rue",
      city: "Paris",
      type: "APARTMENT",
      rooms: 1,
      icalUrl: "not-a-url",
    })
    expect(result.success).toBe(false)
  })

  it("accepts empty string for optional iCal URL", () => {
    const result = propertySchema.safeParse({
      name: "Test",
      address: "12 rue",
      city: "Paris",
      type: "APARTMENT",
      rooms: 1,
      icalUrl: "",
    })
    expect(result.success).toBe(true)
  })
})

describe("expenseSchema", () => {
  it("accepts valid expense data", () => {
    const result = expenseSchema.safeParse({
      category: "CLEANING",
      label: "Ménage",
      amount: 50,
      date: "2026-05-01",
    })
    expect(result.success).toBe(true)
  })

  it("rejects negative amount", () => {
    const result = expenseSchema.safeParse({
      category: "CLEANING",
      label: "Test",
      amount: -10,
      date: "2026-05-01",
    })
    expect(result.success).toBe(false)
  })

  it("rejects zero amount", () => {
    const result = expenseSchema.safeParse({
      category: "CLEANING",
      label: "Test",
      amount: 0,
      date: "2026-05-01",
    })
    expect(result.success).toBe(false)
  })

  it("rejects empty label", () => {
    const result = expenseSchema.safeParse({
      category: "CLEANING",
      label: "",
      amount: 50,
      date: "2026-05-01",
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid category", () => {
    const result = expenseSchema.safeParse({
      category: "FAKE_CATEGORY",
      label: "Test",
      amount: 50,
      date: "2026-05-01",
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid propertyId format", () => {
    const result = expenseSchema.safeParse({
      category: "CLEANING",
      label: "Test",
      amount: 50,
      date: "2026-05-01",
      propertyId: "not-a-uuid",
    })
    expect(result.success).toBe(false)
  })
})

describe("bookingSchema", () => {
  it("accepts valid booking data", () => {
    const result = bookingSchema.safeParse({
      propertyId: "00000000-0000-0000-0000-000000000000",
      checkIn: "2026-05-01",
      checkOut: "2026-05-04",
      totalAmount: 450,
      platform: "AIRBNB",
      source: "MANUAL",
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid platform", () => {
    const result = bookingSchema.safeParse({
      propertyId: "00000000-0000-0000-0000-000000000000",
      checkIn: "2026-05-01",
      checkOut: "2026-05-04",
      totalAmount: 450,
      platform: "VRBO",
      source: "MANUAL",
    })
    expect(result.success).toBe(false)
  })
})
