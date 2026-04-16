import { PrismaClient } from "../src/generated/prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Clean existing data
  await prisma.booking.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.property.deleteMany()
  await prisma.user.deleteMany()

  // Create demo user
  const user = await prisma.user.create({
    data: {
      id: "demo-user-001",
      email: "demo@conciergeflow.fr",
      name: "Marie Conciergerie",
      company: "MC Gestion",
    },
  })
  console.log(`Created user: ${user.email}`)

  // Create 4 properties
  const properties = await Promise.all([
    prisma.property.create({
      data: {
        userId: user.id,
        name: "Studio Marais",
        address: "18 rue des Francs-Bourgeois",
        city: "Paris",
        type: "STUDIO",
        rooms: 1,
        surface: 28,
        monthlyRent: 1200,
        icalUrl: "https://www.airbnb.com/calendar/ical/studio-marais.ics",
      },
    }),
    prisma.property.create({
      data: {
        userId: user.id,
        name: "T3 Bastille",
        address: "45 rue de la Roquette",
        city: "Paris",
        type: "APARTMENT",
        rooms: 3,
        surface: 65,
        monthlyRent: 1800,
        icalUrl: "https://www.airbnb.com/calendar/ical/t3-bastille.ics",
        icalUrlBooking: "https://admin.booking.com/hotel/ical/t3-bastille",
      },
    }),
    prisma.property.create({
      data: {
        userId: user.id,
        name: "T2 République",
        address: "12 boulevard Voltaire",
        city: "Paris",
        type: "APARTMENT",
        rooms: 2,
        surface: 45,
        monthlyRent: 1400,
      },
    }),
    prisma.property.create({
      data: {
        userId: user.id,
        name: "Loft Oberkampf",
        address: "7 rue Oberkampf",
        city: "Paris",
        type: "LOFT",
        rooms: 2,
        surface: 55,
        monthlyRent: 1600,
        icalUrl: "https://www.airbnb.com/calendar/ical/loft-oberkampf.ics",
      },
    }),
  ])
  console.log(`Created ${properties.length} properties`)

  // Helper to create dates relative to today
  const today = new Date()
  function daysAgo(days: number) {
    const d = new Date(today)
    d.setDate(d.getDate() - days)
    return d
  }

  // Create 20 bookings over the last 3 months
  const bookingsData = [
    // Studio Marais
    { propertyId: properties[0].id, guestName: "Jean Dupont", checkIn: daysAgo(85), checkOut: daysAgo(82), nights: 3, totalAmount: 420, netAmount: 378, platform: "AIRBNB" as const, source: "ICAL" as const },
    { propertyId: properties[0].id, guestName: "Emma Wilson", checkIn: daysAgo(75), checkOut: daysAgo(71), nights: 4, totalAmount: 560, netAmount: 504, platform: "AIRBNB" as const, source: "CSV" as const },
    { propertyId: properties[0].id, guestName: "Pierre Martin", checkIn: daysAgo(60), checkOut: daysAgo(57), nights: 3, totalAmount: 450, netAmount: 405, platform: "BOOKING" as const, source: "CSV" as const },
    { propertyId: properties[0].id, guestName: "Sarah Connor", checkIn: daysAgo(45), checkOut: daysAgo(40), nights: 5, totalAmount: 750, netAmount: 675, platform: "AIRBNB" as const, source: "ICAL" as const },
    { propertyId: properties[0].id, guestName: "Luca Rossi", checkIn: daysAgo(20), checkOut: daysAgo(17), nights: 3, totalAmount: 480, netAmount: 432, platform: "AIRBNB" as const, source: "CSV" as const },

    // T3 Bastille
    { propertyId: properties[1].id, guestName: "Marie Leroy", checkIn: daysAgo(88), checkOut: daysAgo(83), nights: 5, totalAmount: 1250, netAmount: 1125, platform: "AIRBNB" as const, source: "CSV" as const },
    { propertyId: properties[1].id, guestName: "Hans Mueller", checkIn: daysAgo(70), checkOut: daysAgo(64), nights: 6, totalAmount: 1320, netAmount: 1122, platform: "BOOKING" as const, source: "CSV" as const },
    { propertyId: properties[1].id, guestName: "Sophie Bernard", checkIn: daysAgo(55), checkOut: daysAgo(50), nights: 5, totalAmount: 1100, netAmount: 990, platform: "AIRBNB" as const, source: "ICAL" as const },
    { propertyId: properties[1].id, guestName: "Tom Smith", checkIn: daysAgo(35), checkOut: daysAgo(30), nights: 5, totalAmount: 1200, netAmount: 1080, platform: "BOOKING" as const, source: "CSV" as const },
    { propertyId: properties[1].id, guestName: "Ana Garcia", checkIn: daysAgo(15), checkOut: daysAgo(10), nights: 5, totalAmount: 1350, netAmount: 1215, platform: "AIRBNB" as const, source: "CSV" as const },

    // T2 République
    { propertyId: properties[2].id, guestName: "François Petit", checkIn: daysAgo(80), checkOut: daysAgo(76), nights: 4, totalAmount: 680, netAmount: 612, platform: "AIRBNB" as const, source: "CSV" as const },
    { propertyId: properties[2].id, guestName: "James Brown", checkIn: daysAgo(65), checkOut: daysAgo(62), nights: 3, totalAmount: 540, netAmount: 486, platform: "BOOKING" as const, source: "CSV" as const },
    { propertyId: properties[2].id, guestName: "Clara Dubois", checkIn: daysAgo(42), checkOut: daysAgo(38), nights: 4, totalAmount: 720, netAmount: 648, platform: "AIRBNB" as const, source: "ICAL" as const },
    { propertyId: properties[2].id, guestName: "Marco Polo", checkIn: daysAgo(25), checkOut: daysAgo(22), nights: 3, totalAmount: 510, netAmount: 459, platform: "AIRBNB" as const, source: "CSV" as const },
    { propertyId: properties[2].id, guestName: "Yuki Tanaka", checkIn: daysAgo(8), checkOut: daysAgo(5), nights: 3, totalAmount: 570, netAmount: 513, platform: "BOOKING" as const, source: "CSV" as const },

    // Loft Oberkampf
    { propertyId: properties[3].id, guestName: "Paul Moreau", checkIn: daysAgo(82), checkOut: daysAgo(76), nights: 6, totalAmount: 1440, netAmount: 1296, platform: "AIRBNB" as const, source: "CSV" as const },
    { propertyId: properties[3].id, guestName: "Lisa Chen", checkIn: daysAgo(62), checkOut: daysAgo(58), nights: 4, totalAmount: 960, netAmount: 864, platform: "AIRBNB" as const, source: "ICAL" as const },
    { propertyId: properties[3].id, guestName: "David Kim", checkIn: daysAgo(48), checkOut: daysAgo(43), nights: 5, totalAmount: 1150, netAmount: 1035, platform: "BOOKING" as const, source: "CSV" as const },
    { propertyId: properties[3].id, guestName: "Elena Volkov", checkIn: daysAgo(28), checkOut: daysAgo(24), nights: 4, totalAmount: 1040, netAmount: 936, platform: "AIRBNB" as const, source: "CSV" as const },
    { propertyId: properties[3].id, guestName: "Alex Fontaine", checkIn: daysAgo(10), checkOut: daysAgo(5), nights: 5, totalAmount: 1250, netAmount: 1125, platform: "AIRBNB" as const, source: "CSV" as const },
  ]

  for (const booking of bookingsData) {
    await prisma.booking.create({ data: booking })
  }
  console.log(`Created ${bookingsData.length} bookings`)

  // Create 15 expenses
  const expensesData = [
    // Recurring monthly
    { userId: user.id, propertyId: properties[0].id, category: "CLEANING" as const, label: "Ménage mensuel Studio", amount: 80, date: daysAgo(60), isRecurring: true, frequency: "MONTHLY" as const },
    { userId: user.id, propertyId: properties[1].id, category: "CLEANING" as const, label: "Ménage mensuel T3", amount: 120, date: daysAgo(60), isRecurring: true, frequency: "MONTHLY" as const },
    { userId: user.id, propertyId: properties[3].id, category: "CLEANING" as const, label: "Ménage mensuel Loft", amount: 100, date: daysAgo(60), isRecurring: true, frequency: "MONTHLY" as const },
    { userId: user.id, category: "INSURANCE" as const, label: "Assurance RC Pro", amount: 150, date: daysAgo(75), isRecurring: true, frequency: "MONTHLY" as const },

    // One-time expenses
    { userId: user.id, propertyId: properties[0].id, category: "SUPPLIES" as const, label: "Kit accueil (savon, café, thé)", amount: 45, date: daysAgo(50) },
    { userId: user.id, propertyId: properties[1].id, category: "MAINTENANCE" as const, label: "Réparation chauffe-eau", amount: 320, date: daysAgo(40) },
    { userId: user.id, propertyId: properties[1].id, category: "FURNISHING" as const, label: "Nouveaux draps", amount: 180, date: daysAgo(35) },
    { userId: user.id, propertyId: properties[2].id, category: "SUPPLIES" as const, label: "Produits ménagers", amount: 35, date: daysAgo(30) },
    { userId: user.id, propertyId: properties[2].id, category: "MAINTENANCE" as const, label: "Serrurier (changement serrure)", amount: 150, date: daysAgo(25) },
    { userId: user.id, propertyId: properties[3].id, category: "FURNISHING" as const, label: "Canapé neuf", amount: 650, date: daysAgo(55) },
    { userId: user.id, propertyId: properties[3].id, category: "UTILITIES" as const, label: "Électricité mars", amount: 85, date: daysAgo(45) },
    { userId: user.id, category: "TAX" as const, label: "CFE 2026", amount: 890, date: daysAgo(20) },
    { userId: user.id, category: "MARKETING" as const, label: "Photos pro logements", amount: 350, date: daysAgo(70) },
    { userId: user.id, propertyId: properties[0].id, category: "PLATFORM_FEE" as const, label: "Commission Airbnb mars", amount: 126, date: daysAgo(60) },
    { userId: user.id, propertyId: properties[1].id, category: "PLATFORM_FEE" as const, label: "Commission Booking mars", amount: 198, date: daysAgo(60) },
  ]

  for (const expense of expensesData) {
    await prisma.expense.create({ data: expense })
  }
  console.log(`Created ${expensesData.length} expenses`)

  console.log("Seed complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
