import Papa from "papaparse"
import { calculateNights } from "@/lib/utils"

export interface ParsedCsvBooking {
  guestName: string | null
  checkIn: Date
  checkOut: Date
  nights: number
  totalAmount: number
  netAmount: number | null
  platform: "AIRBNB" | "BOOKING" | "OTHER"
}

interface AirbnbRow {
  "Confirmation code"?: string
  "Guest"?: string
  "Guest name"?: string
  "Start date"?: string
  "End date"?: string
  "Nights"?: string
  "Earnings"?: string
  "Amount"?: string
  "Gross earnings"?: string
  "Host fee"?: string
  [key: string]: string | undefined
}

interface BookingRow {
  "Booking number"?: string
  "Guest Name"?: string
  "Guest name"?: string
  "Check-in"?: string
  "Checkin"?: string
  "Check-out"?: string
  "Checkout"?: string
  "Total"?: string
  "Price"?: string
  "Commission"?: string
  [key: string]: string | undefined
}

function parseAmount(value: string | undefined): number {
  if (!value) return 0
  const cleaned = value.replace(/[€$£,\s]/g, "").replace(",", ".")
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

function parseDate(value: string | undefined): Date | null {
  if (!value) return null
  const date = new Date(value)
  return isNaN(date.getTime()) ? null : date
}

function findColumn(row: Record<string, string | undefined>, candidates: string[]): string | undefined {
  for (const key of candidates) {
    const found = Object.keys(row).find(
      (k) => k.toLowerCase().trim() === key.toLowerCase()
    )
    if (found && row[found]) return row[found]
  }
  return undefined
}

export function parseAirbnbCsv(csvData: string): ParsedCsvBooking[] {
  const result = Papa.parse<AirbnbRow>(csvData, {
    header: true,
    skipEmptyLines: true,
  })

  const bookings: ParsedCsvBooking[] = []

  for (const row of result.data) {
    const guest = findColumn(row, ["Guest", "Guest name"])
    const startDate = findColumn(row, ["Start date", "Check-in", "Checkin"])
    const endDate = findColumn(row, ["End date", "Check-out", "Checkout"])
    const earnings = findColumn(row, ["Earnings", "Amount", "Gross earnings", "Total payout"])

    const checkIn = parseDate(startDate)
    const checkOut = parseDate(endDate)

    if (!checkIn || !checkOut) continue

    const totalAmount = parseAmount(earnings)
    const hostFee = parseAmount(findColumn(row, ["Host fee", "Service fee"]))
    const netAmount = hostFee > 0 ? totalAmount - hostFee : null

    bookings.push({
      guestName: guest || null,
      checkIn,
      checkOut,
      nights: calculateNights(checkIn, checkOut),
      totalAmount,
      netAmount,
      platform: "AIRBNB",
    })
  }

  return bookings
}

export function parseBookingCsv(csvData: string): ParsedCsvBooking[] {
  const result = Papa.parse<BookingRow>(csvData, {
    header: true,
    skipEmptyLines: true,
  })

  const bookings: ParsedCsvBooking[] = []

  for (const row of result.data) {
    const guest = findColumn(row, ["Guest Name", "Guest name"])
    const startDate = findColumn(row, ["Check-in", "Checkin"])
    const endDate = findColumn(row, ["Check-out", "Checkout"])
    const total = findColumn(row, ["Total", "Price", "Amount"])
    const commission = findColumn(row, ["Commission"])

    const checkIn = parseDate(startDate)
    const checkOut = parseDate(endDate)

    if (!checkIn || !checkOut) continue

    const totalAmount = parseAmount(total)
    const commissionAmount = parseAmount(commission)
    const netAmount = commissionAmount > 0 ? totalAmount - commissionAmount : null

    bookings.push({
      guestName: guest || null,
      checkIn,
      checkOut,
      nights: calculateNights(checkIn, checkOut),
      totalAmount,
      netAmount,
      platform: "BOOKING",
    })
  }

  return bookings
}

export function detectCsvPlatform(csvData: string): "AIRBNB" | "BOOKING" | "UNKNOWN" {
  const firstLine = csvData.split("\n")[0]?.toLowerCase() || ""
  if (firstLine.includes("confirmation code") || firstLine.includes("earnings")) return "AIRBNB"
  if (firstLine.includes("booking number") || firstLine.includes("commission")) return "BOOKING"
  return "UNKNOWN"
}
