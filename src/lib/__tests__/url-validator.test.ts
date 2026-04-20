import { describe, it, expect } from "vitest"
import { isAllowedUrl } from "../url-validator"

describe("isAllowedUrl", () => {
  it("allows valid HTTPS URLs", () => {
    expect(isAllowedUrl("https://www.airbnb.com/calendar/ical/123.ics")).toBe(true)
    expect(isAllowedUrl("https://admin.booking.com/hotel/123/ical.ics")).toBe(true)
  })

  it("rejects HTTP URLs", () => {
    expect(isAllowedUrl("http://www.airbnb.com/cal.ics")).toBe(false)
  })

  it("rejects localhost", () => {
    expect(isAllowedUrl("https://localhost/api")).toBe(false)
    expect(isAllowedUrl("https://LOCALHOST/api")).toBe(false)
  })

  it("rejects 127.0.0.1", () => {
    expect(isAllowedUrl("https://127.0.0.1/secret")).toBe(false)
    expect(isAllowedUrl("https://127.0.0.99/secret")).toBe(false)
  })

  it("rejects 10.x private range", () => {
    expect(isAllowedUrl("https://10.0.0.1/internal")).toBe(false)
    expect(isAllowedUrl("https://10.255.255.255/api")).toBe(false)
  })

  it("rejects 192.168.x private range", () => {
    expect(isAllowedUrl("https://192.168.1.1/admin")).toBe(false)
  })

  it("rejects 172.16-31.x private range (Docker, AWS VPC)", () => {
    expect(isAllowedUrl("https://172.16.0.1/internal")).toBe(false)
    expect(isAllowedUrl("https://172.31.255.255/api")).toBe(false)
  })

  it("allows 172.32+ (not private)", () => {
    expect(isAllowedUrl("https://172.32.0.1/api")).toBe(true)
  })

  it("rejects 169.254.x (AWS metadata endpoint)", () => {
    expect(isAllowedUrl("https://169.254.169.254/latest/meta-data")).toBe(false)
  })

  it("rejects IPv6 loopback", () => {
    expect(isAllowedUrl("https://[::1]/api")).toBe(false)
  })

  it("rejects invalid URLs", () => {
    expect(isAllowedUrl("not-a-url")).toBe(false)
    expect(isAllowedUrl("")).toBe(false)
  })
})
