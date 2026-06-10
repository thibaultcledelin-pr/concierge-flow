import { z } from 'zod'

export const propertySchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  address: z.string().min(1, 'Adresse requise'),
  city: z.string().min(1, 'Ville requise'),
  type: z.enum(['APARTMENT', 'HOUSE', 'STUDIO', 'LOFT', 'VILLA', 'OTHER']),
  rooms: z.number().int().min(1),
  surface: z.number().positive().optional(),
  icalUrl: z.string().url().refine(url => url.startsWith('https://'), { message: 'URL doit \u00eatre en HTTPS' }).optional().or(z.literal('')),
  icalUrlBooking: z.string().url().refine(url => url.startsWith('https://'), { message: 'URL doit \u00eatre en HTTPS' }).optional().or(z.literal('')),
  monthlyRent: z.number().positive().optional(),
  commissionRate: z.number().min(0, 'Min 0').max(100, 'Max 100').optional(),
  ownerName: z.string().optional().or(z.literal('')),
  ownerEmail: z.string().email('Email invalide').optional().or(z.literal('')),
})

export const expenseSchema = z.object({
  propertyId: z.string().uuid().optional(),
  category: z.enum([
    'CLEANING', 'MAINTENANCE', 'SUPPLIES', 'RENT', 'INSURANCE',
    'TAX', 'PLATFORM_FEE', 'UTILITIES', 'FURNISHING', 'MARKETING', 'OTHER'
  ]),
  label: z.string().min(1, 'Libell\u00e9 requis'),
  amount: z.number().positive('Montant requis'),
  date: z.string().or(z.date()),
  isRecurring: z.boolean().default(false),
  frequency: z.enum(['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']).optional(),
  notes: z.string().optional(),
})

export const bookingSchema = z.object({
  propertyId: z.string().uuid(),
  guestName: z.string().optional(),
  checkIn: z.string().or(z.date()),
  checkOut: z.string().or(z.date()),
  totalAmount: z.number().positive(),
  netAmount: z.number().positive().optional(),
  platform: z.enum(['AIRBNB', 'BOOKING', 'DIRECT', 'OTHER']),
  source: z.enum(['ICAL', 'MANUAL', 'CSV']),
})

export const userUpdateSchema = z.object({
  name: z.string().trim().min(1, 'Nom requis').max(120, 'Nom trop long').optional(),
  company: z.string().trim().max(120, 'Nom trop long').optional().or(z.literal('')),
})
