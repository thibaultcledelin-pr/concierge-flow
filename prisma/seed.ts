import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const TARGET_USER_ID = "d2b1976e-93da-48f9-9b53-3b20fd2c3161"

function date(y: number, m: number, d: number) {
  return new Date(y, m - 1, d)
}

async function main() {
  console.log("🌱 Starting seed...")

  const userId = process.argv[2] || process.env.SEED_USER_ID || TARGET_USER_ID
  console.log(`Target userId: ${userId}`)

  // Ensure user exists
  const existing = await prisma.user.findUnique({ where: { id: userId } })
  if (!existing) {
    await prisma.user.create({
      data: { id: userId, email: "demo@conciergeflow.fr", name: "Marie Conciergerie", company: "MC Gestion" },
    })
    console.log("✅ Created user")
  } else {
    console.log(`✅ User exists: ${existing.email}`)
  }

  // Clean
  console.log("\n🗑️  Cleaning...")
  await prisma.booking.deleteMany({ where: { property: { userId } } })
  await prisma.expense.deleteMany({ where: { userId } })
  await prisma.property.deleteMany({ where: { userId } })

  // 5 Properties
  console.log("\n🏠 Creating 5 properties...")
  const props = []
  const propData = [
    { name: "Studio Marais", address: "18 rue des Francs-Bourgeois", city: "Paris", type: "STUDIO" as const, rooms: 1, surface: 28, monthlyRent: 950, icalUrl: "https://www.airbnb.com/calendar/ical/studio-marais.ics" },
    { name: "T3 Bastille", address: "45 rue de la Roquette", city: "Paris", type: "APARTMENT" as const, rooms: 3, surface: 65, monthlyRent: 1800, icalUrl: "https://www.airbnb.com/calendar/ical/t3-bastille.ics", icalUrlBooking: "https://admin.booking.com/hotel/ical/t3-bastille" },
    { name: "T2 République", address: "12 boulevard Voltaire", city: "Paris", type: "APARTMENT" as const, rooms: 2, surface: 45, monthlyRent: 1400 },
    { name: "Loft Oberkampf", address: "7 rue Oberkampf", city: "Paris", type: "LOFT" as const, rooms: 2, surface: 55, monthlyRent: 1600, icalUrl: "https://www.airbnb.com/calendar/ical/loft-oberkampf.ics" },
    { name: "Villa Cannes", address: "23 boulevard de la Croisette", city: "Cannes", type: "VILLA" as const, rooms: 4, surface: 120, monthlyRent: 2500 },
  ]
  for (const d of propData) {
    const p = await prisma.property.create({ data: { ...d, userId } })
    props.push(p)
    console.log(`  ✅ ${p.name}`)
  }

  // 40 Bookings over 9 months (Oct 2025 → Jun 2026)
  console.log("\n📅 Creating bookings...")
  const bookings = [
    // Studio Marais — 80-100€/nuit, good occupancy
    { pi: 0, guest: "Jean Dupont", ci: date(2025,10,2), co: date(2025,10,5), n: 3, amt: 270, net: 243, plat: "AIRBNB" as const },
    { pi: 0, guest: "Emma Wilson", ci: date(2025,10,12), co: date(2025,10,16), n: 4, amt: 360, net: 324, plat: "AIRBNB" as const },
    { pi: 0, guest: "Pierre Martin", ci: date(2025,10,22), co: date(2025,10,25), n: 3, amt: 285, net: 242, plat: "BOOKING" as const },
    { pi: 0, guest: "Sarah Connor", ci: date(2025,11,3), co: date(2025,11,8), n: 5, amt: 450, net: 405, plat: "AIRBNB" as const },
    { pi: 0, guest: "Luca Rossi", ci: date(2025,11,15), co: date(2025,11,18), n: 3, amt: 270, net: 243, plat: "BOOKING" as const },
    { pi: 0, guest: "Anna Schmidt", ci: date(2025,12,1), co: date(2025,12,6), n: 5, amt: 475, net: 428, plat: "AIRBNB" as const },
    { pi: 0, guest: "Marc Leblanc", ci: date(2025,12,20), co: date(2025,12,26), n: 6, amt: 600, net: 540, plat: "AIRBNB" as const },
    { pi: 0, guest: "Yuki Tanaka", ci: date(2026,1,5), co: date(2026,1,9), n: 4, amt: 340, net: 306, plat: "BOOKING" as const },
    { pi: 0, guest: "Robert Duval", ci: date(2026,2,1), co: date(2026,2,4), n: 3, amt: 285, net: 257, plat: "AIRBNB" as const },
    { pi: 0, guest: "Claire Martin", ci: date(2026,2,15), co: date(2026,2,19), n: 4, amt: 380, net: 342, plat: "BOOKING" as const },
    { pi: 0, guest: "Antoine Leclerc", ci: date(2026,3,5), co: date(2026,3,9), n: 4, amt: 360, net: 324, plat: "AIRBNB" as const },
    { pi: 0, guest: "Laura Petit", ci: date(2026,4,2), co: date(2026,4,6), n: 4, amt: 380, net: 342, plat: "AIRBNB" as const },
    { pi: 0, guest: "David Cohen", ci: date(2026,5,1), co: date(2026,5,5), n: 4, amt: 400, net: 360, plat: "BOOKING" as const },
    { pi: 0, guest: "Maria Santos", ci: date(2026,5,18), co: date(2026,5,22), n: 4, amt: 400, net: 360, plat: "AIRBNB" as const },
    { pi: 0, guest: "Thomas Keller", ci: date(2026,6,1), co: date(2026,6,5), n: 4, amt: 420, net: 378, plat: "AIRBNB" as const },
    // T3 Bastille — 150-200€/nuit, premium
    { pi: 1, guest: "Marie Leroy", ci: date(2025,10,1), co: date(2025,10,6), n: 5, amt: 950, net: 855, plat: "AIRBNB" as const },
    { pi: 1, guest: "Hans Mueller", ci: date(2025,10,15), co: date(2025,10,21), n: 6, amt: 1080, net: 918, plat: "BOOKING" as const },
    { pi: 1, guest: "Sophie Bernard", ci: date(2025,11,1), co: date(2025,11,6), n: 5, amt: 900, net: 810, plat: "AIRBNB" as const },
    { pi: 1, guest: "Tom Smith", ci: date(2025,11,20), co: date(2025,11,25), n: 5, amt: 950, net: 855, plat: "BOOKING" as const },
    { pi: 1, guest: "Ana Garcia", ci: date(2025,12,10), co: date(2025,12,16), n: 6, amt: 1200, net: 1080, plat: "AIRBNB" as const },
    { pi: 1, guest: "James Brown", ci: date(2026,1,2), co: date(2026,1,8), n: 6, amt: 1100, net: 990, plat: "AIRBNB" as const },
    { pi: 1, guest: "Clara Dubois", ci: date(2026,2,1), co: date(2026,2,5), n: 4, amt: 760, net: 684, plat: "BOOKING" as const },
    { pi: 1, guest: "David Kim", ci: date(2026,3,1), co: date(2026,3,7), n: 6, amt: 1140, net: 1026, plat: "AIRBNB" as const },
    { pi: 1, guest: "Emma Davis", ci: date(2026,4,5), co: date(2026,4,11), n: 6, amt: 1140, net: 1026, plat: "AIRBNB" as const },
    { pi: 1, guest: "Lucas Moreau", ci: date(2026,5,3), co: date(2026,5,9), n: 6, amt: 1200, net: 1080, plat: "BOOKING" as const },
    { pi: 1, guest: "Isabelle Roux", ci: date(2026,5,20), co: date(2026,5,25), n: 5, amt: 1000, net: 900, plat: "AIRBNB" as const },
    { pi: 1, guest: "Alex Turner", ci: date(2026,6,1), co: date(2026,6,6), n: 5, amt: 1050, net: 945, plat: "AIRBNB" as const },
    // T2 République — 100-130€/nuit
    { pi: 2, guest: "François Petit", ci: date(2025,10,5), co: date(2025,10,9), n: 4, amt: 480, net: 432, plat: "AIRBNB" as const },
    { pi: 2, guest: "Elena Volkov", ci: date(2025,10,20), co: date(2025,10,23), n: 3, amt: 360, net: 306, plat: "BOOKING" as const },
    { pi: 2, guest: "Marco Polo", ci: date(2025,11,8), co: date(2025,11,12), n: 4, amt: 480, net: 432, plat: "AIRBNB" as const },
    { pi: 2, guest: "Sophie Lambert", ci: date(2025,11,25), co: date(2025,11,29), n: 4, amt: 480, net: 432, plat: "AIRBNB" as const },
    { pi: 2, guest: "Lisa Chen", ci: date(2025,12,1), co: date(2025,12,5), n: 4, amt: 520, net: 468, plat: "AIRBNB" as const },
    { pi: 2, guest: "Alex Fontaine", ci: date(2025,12,15), co: date(2025,12,19), n: 4, amt: 500, net: 425, plat: "BOOKING" as const },
    { pi: 2, guest: "Paul Moreau", ci: date(2026,1,10), co: date(2026,1,14), n: 4, amt: 440, net: 396, plat: "AIRBNB" as const },
    { pi: 2, guest: "Nina Petrov", ci: date(2026,2,5), co: date(2026,2,9), n: 4, amt: 480, net: 432, plat: "BOOKING" as const },
    { pi: 2, guest: "Hugo Martin", ci: date(2026,3,10), co: date(2026,3,14), n: 4, amt: 520, net: 468, plat: "AIRBNB" as const },
    { pi: 2, guest: "Julie Blanc", ci: date(2026,4,15), co: date(2026,4,19), n: 4, amt: 520, net: 468, plat: "BOOKING" as const },
    { pi: 2, guest: "Karim Benali", ci: date(2026,5,8), co: date(2026,5,12), n: 4, amt: 540, net: 486, plat: "AIRBNB" as const },
    { pi: 2, guest: "Olivia Durand", ci: date(2026,6,2), co: date(2026,6,6), n: 4, amt: 560, net: 504, plat: "AIRBNB" as const },
    // Loft Oberkampf — DÉFICITAIRE: peu de réservations, prix bas
    { pi: 3, guest: "Pierre Durand", ci: date(2025,10,15), co: date(2025,10,18), n: 3, amt: 240, net: 216, plat: "AIRBNB" as const },
    { pi: 3, guest: "Julie Blanc", ci: date(2025,11,20), co: date(2025,11,22), n: 2, amt: 160, net: 144, plat: "BOOKING" as const },
    { pi: 3, guest: "Thomas Bernard", ci: date(2025,12,28), co: date(2025,12,30), n: 2, amt: 180, net: 162, plat: "AIRBNB" as const },
    { pi: 3, guest: "Marie Dupuis", ci: date(2026,2,10), co: date(2026,2,12), n: 2, amt: 160, net: 144, plat: "BOOKING" as const },
    { pi: 3, guest: "Christophe Roy", ci: date(2026,4,20), co: date(2026,4,22), n: 2, amt: 170, net: 153, plat: "AIRBNB" as const },
    { pi: 3, guest: "Nathalie Girard", ci: date(2026,6,1), co: date(2026,6,3), n: 2, amt: 180, net: 162, plat: "BOOKING" as const },
    // Villa Cannes — 200-250€/nuit, saisonnier
    { pi: 4, guest: "Richard Gere", ci: date(2025,10,1), co: date(2025,10,8), n: 7, amt: 1750, net: 1575, plat: "AIRBNB" as const },
    { pi: 4, guest: "Catherine Deneuve", ci: date(2025,10,20), co: date(2025,10,27), n: 7, amt: 1680, net: 1428, plat: "BOOKING" as const },
    { pi: 4, guest: "George Clooney", ci: date(2025,11,5), co: date(2025,11,12), n: 7, amt: 1540, net: 1386, plat: "AIRBNB" as const },
    { pi: 4, guest: "Monica Bellucci", ci: date(2025,12,20), co: date(2025,12,31), n: 11, amt: 2750, net: 2475, plat: "AIRBNB" as const },
    { pi: 4, guest: "Brad Pitt", ci: date(2026,1,5), co: date(2026,1,12), n: 7, amt: 1540, net: 1386, plat: "BOOKING" as const },
    { pi: 4, guest: "Angelina Jolie", ci: date(2026,2,1), co: date(2026,2,8), n: 7, amt: 1680, net: 1512, plat: "AIRBNB" as const },
    { pi: 4, guest: "Leonardo DiCaprio", ci: date(2026,2,20), co: date(2026,2,28), n: 8, amt: 2000, net: 1800, plat: "AIRBNB" as const },
    { pi: 4, guest: "Penélope Cruz", ci: date(2026,3,5), co: date(2026,3,12), n: 7, amt: 1750, net: 1575, plat: "BOOKING" as const },
    { pi: 4, guest: "Marion Cotillard", ci: date(2026,4,1), co: date(2026,4,8), n: 7, amt: 1820, net: 1638, plat: "AIRBNB" as const },
    { pi: 4, guest: "Jean Dujardin", ci: date(2026,5,1), co: date(2026,5,10), n: 9, amt: 2250, net: 2025, plat: "AIRBNB" as const },
    { pi: 4, guest: "Léa Seydoux", ci: date(2026,5,20), co: date(2026,5,27), n: 7, amt: 1890, net: 1701, plat: "BOOKING" as const },
    { pi: 4, guest: "Omar Sy", ci: date(2026,6,1), co: date(2026,6,8), n: 7, amt: 1960, net: 1764, plat: "AIRBNB" as const },
  ]

  let bCount = 0
  for (const b of bookings) {
    await prisma.booking.create({
      data: {
        propertyId: props[b.pi].id,
        guestName: b.guest,
        checkIn: b.ci,
        checkOut: b.co,
        nights: b.n,
        totalAmount: b.amt,
        netAmount: b.net,
        platform: b.plat,
        source: "CSV",
      },
    })
    bCount++
  }
  console.log(`  ✅ ${bCount} bookings`)

  // 30 Expenses
  console.log("\n💰 Creating 30 expenses...")
  const expenses = [
    // Ménage — 45€/réservation (pour chaque logement sauf Loft qui paie plus cher)
    { pi: 0, cat: "CLEANING" as const, label: "Ménage oct", amt: 135, d: date(2025,10,31), rec: false },
    { pi: 0, cat: "CLEANING" as const, label: "Ménage nov", amt: 90, d: date(2025,11,30), rec: false },
    { pi: 0, cat: "CLEANING" as const, label: "Ménage déc", amt: 90, d: date(2025,12,31), rec: false },
    { pi: 1, cat: "CLEANING" as const, label: "Ménage oct-nov", amt: 180, d: date(2025,11,30), rec: false },
    { pi: 1, cat: "CLEANING" as const, label: "Ménage déc-jan", amt: 135, d: date(2026,1,31), rec: false },
    { pi: 2, cat: "CLEANING" as const, label: "Ménage Q4", amt: 225, d: date(2025,12,31), rec: false },
    { pi: 3, cat: "CLEANING" as const, label: "Ménage Loft (premium)", amt: 280, d: date(2025,12,31), rec: false },
    { pi: 4, cat: "CLEANING" as const, label: "Ménage Villa oct-nov", amt: 270, d: date(2025,11,30), rec: false },
    { pi: 4, cat: "CLEANING" as const, label: "Ménage Villa déc-mar", amt: 360, d: date(2026,3,31), rec: false },
    // Assurance — 80€/mois global
    { pi: null, cat: "INSURANCE" as const, label: "Assurance RC Pro oct", amt: 80, d: date(2025,10,1), rec: true, freq: "MONTHLY" as const },
    { pi: null, cat: "INSURANCE" as const, label: "Assurance RC Pro nov", amt: 80, d: date(2025,11,1), rec: true, freq: "MONTHLY" as const },
    { pi: null, cat: "INSURANCE" as const, label: "Assurance RC Pro déc", amt: 80, d: date(2025,12,1), rec: true, freq: "MONTHLY" as const },
    { pi: null, cat: "INSURANCE" as const, label: "Assurance RC Pro jan", amt: 80, d: date(2026,1,1), rec: true, freq: "MONTHLY" as const },
    { pi: null, cat: "INSURANCE" as const, label: "Assurance RC Pro fév", amt: 80, d: date(2026,2,1), rec: true, freq: "MONTHLY" as const },
    { pi: null, cat: "INSURANCE" as const, label: "Assurance RC Pro mar", amt: 80, d: date(2026,3,1), rec: true, freq: "MONTHLY" as const },
    // Consommables — 30€/mois par logement
    { pi: 0, cat: "SUPPLIES" as const, label: "Kit accueil Studio Q4", amt: 90, d: date(2025,12,15), rec: false },
    { pi: 1, cat: "SUPPLIES" as const, label: "Kit accueil T3 Q4", amt: 90, d: date(2025,12,15), rec: false },
    { pi: 4, cat: "SUPPLIES" as const, label: "Kit luxe Villa", amt: 180, d: date(2025,12,15), rec: false },
    // Maintenance ponctuelle
    { pi: 1, cat: "MAINTENANCE" as const, label: "Réparation chauffe-eau", amt: 320, d: date(2025,11,15) },
    { pi: 3, cat: "MAINTENANCE" as const, label: "Peinture complète Loft", amt: 1800, d: date(2025,10,1) },
    { pi: 3, cat: "MAINTENANCE" as const, label: "Plomberie Loft", amt: 450, d: date(2025,12,5) },
    { pi: 4, cat: "MAINTENANCE" as const, label: "Piscine entretien annuel", amt: 650, d: date(2025,10,15) },
    // Loyer mensuel (2 logements loués)
    { pi: 0, cat: "RENT" as const, label: "Loyer Studio oct-mar", amt: 5700, d: date(2026,3,1), rec: true, freq: "MONTHLY" as const },
    { pi: 3, cat: "RENT" as const, label: "Loyer Loft oct-mar", amt: 9600, d: date(2026,3,1), rec: true, freq: "MONTHLY" as const },
    // Commissions plateformes
    { pi: null, cat: "PLATFORM_FEE" as const, label: "Commission Airbnb Q4", amt: 890, d: date(2025,12,31) },
    { pi: null, cat: "PLATFORM_FEE" as const, label: "Commission Booking Q4", amt: 420, d: date(2025,12,31) },
    { pi: null, cat: "PLATFORM_FEE" as const, label: "Commission Airbnb Q1", amt: 780, d: date(2026,3,31) },
    { pi: null, cat: "PLATFORM_FEE" as const, label: "Commission Airbnb Q2", amt: 850, d: date(2026,6,30) },
    { pi: null, cat: "PLATFORM_FEE" as const, label: "Commission Booking Q2", amt: 380, d: date(2026,6,30) },
    // Taxes + divers
    { pi: null, cat: "TAX" as const, label: "CFE 2025", amt: 890, d: date(2025,12,15) },
    { pi: null, cat: "MARKETING" as const, label: "Photos pro 5 logements", amt: 500, d: date(2025,10,5) },
    { pi: 4, cat: "FURNISHING" as const, label: "Mobilier terrasse Villa", amt: 1200, d: date(2025,10,10) },
    // Assurance + ménage avr-jun 2026
    { pi: null, cat: "INSURANCE" as const, label: "Assurance RC Pro avr", amt: 80, d: date(2026,4,1), rec: true, freq: "MONTHLY" as const },
    { pi: null, cat: "INSURANCE" as const, label: "Assurance RC Pro mai", amt: 80, d: date(2026,5,1), rec: true, freq: "MONTHLY" as const },
    { pi: null, cat: "INSURANCE" as const, label: "Assurance RC Pro jun", amt: 80, d: date(2026,6,1), rec: true, freq: "MONTHLY" as const },
    { pi: 0, cat: "CLEANING" as const, label: "Ménage avr-jun", amt: 135, d: date(2026,6,15), rec: false },
    { pi: 1, cat: "CLEANING" as const, label: "Ménage avr-jun", amt: 180, d: date(2026,6,15), rec: false },
    { pi: 2, cat: "CLEANING" as const, label: "Ménage avr-jun", amt: 135, d: date(2026,6,15), rec: false },
    { pi: 4, cat: "CLEANING" as const, label: "Ménage Villa avr-jun", amt: 315, d: date(2026,6,15), rec: false },
    { pi: 0, cat: "RENT" as const, label: "Loyer Studio avr-jun", amt: 2850, d: date(2026,6,1), rec: true, freq: "MONTHLY" as const },
    { pi: 3, cat: "RENT" as const, label: "Loyer Loft avr-jun", amt: 4800, d: date(2026,6,1), rec: true, freq: "MONTHLY" as const },
    { pi: 4, cat: "MAINTENANCE" as const, label: "Piscine entretien été", amt: 450, d: date(2026,5,15) },
  ]

  let eCount = 0
  for (const e of expenses) {
    await prisma.expense.create({
      data: {
        userId,
        propertyId: e.pi !== null ? props[e.pi].id : undefined,
        category: e.cat,
        label: e.label,
        amount: e.amt,
        date: e.d,
        isRecurring: e.rec || false,
        frequency: (e as { freq?: string }).freq || undefined,
      },
    })
    eCount++
  }
  console.log(`  ✅ ${eCount} expenses`)

  // Verify
  console.log("\n📊 Verification:")
  const counts = {
    properties: await prisma.property.count({ where: { userId } }),
    bookings: await prisma.booking.count({ where: { property: { userId } } }),
    expenses: await prisma.expense.count({ where: { userId } }),
  }
  console.log(`  Properties: ${counts.properties}`)
  console.log(`  Bookings: ${counts.bookings}`)
  console.log(`  Expenses: ${counts.expenses}`)

  // Check Loft is deficitaire
  const loftBookings = await prisma.booking.findMany({ where: { propertyId: props[3].id } })
  const loftExpenses = await prisma.expense.findMany({ where: { propertyId: props[3].id } })
  const loftRev = loftBookings.reduce((s, b) => s + b.totalAmount, 0)
  const loftExp = loftExpenses.reduce((s, e) => s + e.amount, 0)
  console.log(`\n  🔴 Loft Oberkampf: revenus ${loftRev}€, dépenses ${loftExp}€ → ${loftRev - loftExp > 0 ? "BÉNÉFICIAIRE" : "DÉFICITAIRE ✅"}`)

  console.log("\n✅ Seed complete!")
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
