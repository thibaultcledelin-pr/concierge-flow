import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function calculateMargin(revenue: number, expenses: number): number {
  if (revenue === 0) return 0
  return ((revenue - expenses) / revenue) * 100
}

export function calculateNights(checkIn: Date, checkOut: Date): number {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function calculateRevenuePerNight(totalAmount: number, expenses: number, nights: number): number {
  if (nights === 0) return 0
  return (totalAmount - expenses) / nights
}

export function calculateOccupancyRate(bookedNights: number, totalDaysInMonth: number): number {
  if (totalDaysInMonth === 0) return 0
  return Math.min(100, (bookedNights / totalDaysInMonth) * 100)
}

export function calculateRevPAR(totalRevenue: number, availableNights: number): number {
  if (availableNights === 0) return 0
  return totalRevenue / availableNights
}

export function calculateADR(totalRevenue: number, occupiedNights: number): number {
  if (occupiedNights === 0) return 0
  return totalRevenue / occupiedNights
}
