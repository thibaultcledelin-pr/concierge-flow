import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
})

async function main() {
  console.log("🌱 Starting seed...")
  console.log(`DATABASE_URL set: ${!!process.env.DATABASE_URL}`)

  // Test connection
  try {
    await prisma.$connect()
    console.log("✅ Database connection OK")
  } catch (err) {
    console.error("❌ Database connection failed:", err)
    process.exit(1)
  }

  // Get userId from args or env, or find existing user
  const userId = process.argv[2] || process.env.SEED_USER_ID

  let targetUserId: string

  if (userId) {
    // Use provided user ID (from Supabase Auth)
    targetUserId = userId
    console.log(`Using provided userId: ${targetUserId}`)

    // Ensure user exists in our users table
    const existingUser = await prisma.user.findUnique({ where: { id: targetUserId } })
    if (!existingUser) {
      const user = await prisma.user.create({
        data: {
          id: targetUserId,
          email: "demo@conciergeflow.fr",
          name: "Marie Conciergerie",
          company: "MC Gestion",
        },
      })
      console.log(`✅ Created user: ${user.email} (${user.id})`)
    } else {
      console.log(`✅ User already exists: ${existingUser.email} (${existingUser.id})`)
    }
  } else {
    // Find first existing user in database
    const existingUser = await prisma.user.findFirst()
    if (existingUser) {
      targetUserId = existingUser.id
      console.log(`✅ Found existing user: ${existingUser.email} (${existingUser.id})`)
    } else {
      console.error("❌ No user found. Please either:")
      console.error("   1. Register via the app first, then run: npm run seed")
      console.error("   2. Pass your Supabase user ID: npx tsx prisma/seed.ts <your-user-id>")
      console.error("   3. Set SEED_USER_ID env var")
      process.exit(1)
    }
  }

  // Clean existing seed data for this user
  console.log("\n🗑️  Cleaning existing data...")
  const deletedBookings = await prisma.booking.deleteMany({
    where: { property: { userId: targetUserId } },
  })
  console.log(`  Deleted ${deletedBookings.count} bookings`)

  const deletedExpenses = await prisma.expense.deleteMany({
    where: { userId: targetUserId },
  })
  console.log(`  Deleted ${deletedExpenses.count} expenses`)

  const deletedProperties = await prisma.property.deleteMany({
    where: { userId: targetUserId },
  })
  console.log(`  Deleted ${deletedProperties.count} properties`)

  // Create 4 properties
  console.log("\n🏠 Creating properties...")
  const properties = []
  const propertyData = [
    { name: "Studio Marais", address: "18 rue des Francs-Bourgeois", city: "Paris", type: "STUDIO" as const, rooms: 1, surface: 28, monthlyRent: 1200, icalUrl: "https://www.airbnb.com/calendar/ical/studio-marais.ics" },
    { name: "T3 Bastille", address: "45 rue de la Roquette", city: "Paris", type: "APARTMENT" as const, rooms: 3, surface: 65, monthlyRent: 1800, icalUrl: "https://www.airbnb.com/calendar/ical/t3-bastille.ics", icalUrlBooking: "https://admin.booking.com/hotel/ical/t3-bastille" },
    { name: "T2 République", address: "12 boulevard Voltaire", city: "Paris", type: "APARTMENT" as const, rooms: 2, surface: 45, monthlyRent: 1400 },
    { name: "Loft Oberkampf", address: "7 rue Oberkampf", city: "Paris", type: "LOFT" as const, rooms: 2, surface: 55, monthlyRent: 1600, icalUrl: "https://www.airbnb.com/calendar/ical/loft-oberkampf.ics" },
  ]

  for (const data of propertyData) {
    try {
      const property = await prisma.property.create({
        data: { ...data, userId: targetUserId },
      })
      properties.push(property)
      console.log(`  ✅ ${property.name} (${property.id})`)
    } catch (err) {
      console.error(`  ❌ Failed to create ${data.name}:`, err)
    }
  }

  if (properties.length === 0) {
    console.error("❌ No properties created. Aborting.")
    process.exit(1)
  }

  // Helper for dates
  const today = new Date()
  function daysAgo(days: number) {
    const d = new Date(today)
    d.setDate(d.getDate() - days)
    return d
  }

  // Create 20 bookings
  console.log("\n📅 Creating bookings...")
  const bookingsData = [
    { propertyIdx: 0, guestName: "Jean Dupont", checkIn: daysAgo(85), checkOut: daysAgo(82), nights: 3, totalAmount: 420, netAmount: 378, platform: "AIRBNB" as const, source: "ICAL" as const },
    { propertyIdx: 0, guestName: "Emma Wilson", checkIn: daysAgo(75), checkOut: daysAgo(71), nights: 4, totalAmount: 560, netAmount: 504, platform: "AIRBNB" as const, source: "CSV" as const },
    { propertyIdx: 0, guestName: "Pierre Martin", checkIn: daysAgo(60), checkOut: daysAgo(57), nights: 3, totalAmount: 450, netAmount: 405, platform: "BOOKING" as const, source: "CSV" as const },
    { propertyIdx: 0, guestName: "Sarah Connor", checkIn: daysAgo(45), checkOut: daysAgo(40), nights: 5, totalAmount: 750, netAmount: 675, platform: "AIRBNB" as const, source: "ICAL" as const },
    { propertyIdx: 0, guestName: "Luca Rossi", checkIn: daysAgo(20), checkOut: daysAgo(17), nights: 3, totalAmount: 480, netAmount: 432, platform: "AIRBNB" as const, source: "CSV" as const },
    { propertyIdx: 1, guestName: "Marie Leroy", checkIn: daysAgo(88), checkOut: daysAgo(83), nights: 5, totalAmount: 1250, netAmount: 1125, platform: "AIRBNB" as const, source: "CSV" as const },
    { propertyIdx: 1, guestName: "Hans Mueller", checkIn: daysAgo(70), checkOut: daysAgo(64), nights: 6, totalAmount: 1320, netAmount: 1122, platform: "BOOKING" as const, source: "CSV" as const },
    { propertyIdx: 1, guestName: "Sophie Bernard", checkIn: daysAgo(55), checkOut: daysAgo(50), nights: 5, totalAmount: 1100, netAmount: 990, platform: "AIRBNB" as const, source: "ICAL" as const },
    { propertyIdx: 1, guestName: "Tom Smith", checkIn: daysAgo(35), checkOut: daysAgo(30), nights: 5, totalAmount: 1200, netAmount: 1080, platform: "BOOKING" as const, source: "CSV" as const },
    { propertyIdx: 1, guestName: "Ana Garcia", checkIn: daysAgo(15), checkOut: daysAgo(10), nights: 5, totalAmount: 1350, netAmount: 1215, platform: "AIRBNB" as const, source: "CSV" as const },
    { propertyIdx: 2, guestName: "François Petit", checkIn: daysAgo(80), checkOut: daysAgo(76), nights: 4, totalAmount: 680, netAmount: 612, platform: "AIRBNB" as const, source: "CSV" as const },
    { propertyIdx: 2, guestName: "James Brown", checkIn: daysAgo(65), checkOut: daysAgo(62), nights: 3, totalAmount: 540, netAmount: 486, platform: "BOOKING" as const, source: "CSV" as const },
    { propertyIdx: 2, guestName: "Clara Dubois", checkIn: daysAgo(42), checkOut: daysAgo(38), nights: 4, totalAmount: 720, netAmount: 648, platform: "AIRBNB" as const, source: "ICAL" as const },
    { propertyIdx: 2, guestName: "Marco Polo", checkIn: daysAgo(25), checkOut: daysAgo(22), nights: 3, totalAmount: 510, netAmount: 459, platform: "AIRBNB" as const, source: "CSV" as const },
    { propertyIdx: 2, guestName: "Yuki Tanaka", checkIn: daysAgo(8), checkOut: daysAgo(5), nights: 3, totalAmount: 570, netAmount: 513, platform: "BOOKING" as const, source: "CSV" as const },
    { propertyIdx: 3, guestName: "Paul Moreau", checkIn: daysAgo(82), checkOut: daysAgo(76), nights: 6, totalAmount: 1440, netAmount: 1296, platform: "AIRBNB" as const, source: "CSV" as const },
    { propertyIdx: 3, guestName: "Lisa Chen", checkIn: daysAgo(62), checkOut: daysAgo(58), nights: 4, totalAmount: 960, netAmount: 864, platform: "AIRBNB" as const, source: "ICAL" as const },
    { propertyIdx: 3, guestName: "David Kim", checkIn: daysAgo(48), checkOut: daysAgo(43), nights: 5, totalAmount: 1150, netAmount: 1035, platform: "BOOKING" as const, source: "CSV" as const },
    { propertyIdx: 3, guestName: "Elena Volkov", checkIn: daysAgo(28), checkOut: daysAgo(24), nights: 4, totalAmount: 1040, netAmount: 936, platform: "AIRBNB" as const, source: "CSV" as const },
    { propertyIdx: 3, guestName: "Alex Fontaine", checkIn: daysAgo(10), checkOut: daysAgo(5), nights: 5, totalAmount: 1250, netAmount: 1125, platform: "AIRBNB" as const, source: "CSV" as const },
  ]

  let bookingCount = 0
  for (const { propertyIdx, ...data } of bookingsData) {
    if (!properties[propertyIdx]) continue
    try {
      const booking = await prisma.booking.create({
        data: { ...data, propertyId: properties[propertyIdx].id },
      })
      bookingCount++
      if (bookingCount % 5 === 0) console.log(`  ✅ ${bookingCount} bookings created...`)
    } catch (err) {
      console.error(`  ❌ Failed booking for ${data.guestName}:`, err)
    }
  }
  console.log(`  ✅ Total: ${bookingCount} bookings`)

  // Create 15 expenses
  console.log("\n💰 Creating expenses...")
  const expensesData = [
    { propertyIdx: 0, category: "CLEANING" as const, label: "Ménage mensuel Studio", amount: 80, date: daysAgo(60), isRecurring: true, frequency: "MONTHLY" as const },
    { propertyIdx: 1, category: "CLEANING" as const, label: "Ménage mensuel T3", amount: 120, date: daysAgo(60), isRecurring: true, frequency: "MONTHLY" as const },
    { propertyIdx: 3, category: "CLEANING" as const, label: "Ménage mensuel Loft", amount: 100, date: daysAgo(60), isRecurring: true, frequency: "MONTHLY" as const },
    { propertyIdx: null, category: "INSURANCE" as const, label: "Assurance RC Pro", amount: 150, date: daysAgo(75), isRecurring: true, frequency: "MONTHLY" as const },
    { propertyIdx: 0, category: "SUPPLIES" as const, label: "Kit accueil (savon, café, thé)", amount: 45, date: daysAgo(50) },
    { propertyIdx: 1, category: "MAINTENANCE" as const, label: "Réparation chauffe-eau", amount: 320, date: daysAgo(40) },
    { propertyIdx: 1, category: "FURNISHING" as const, label: "Nouveaux draps", amount: 180, date: daysAgo(35) },
    { propertyIdx: 2, category: "SUPPLIES" as const, label: "Produits ménagers", amount: 35, date: daysAgo(30) },
    { propertyIdx: 2, category: "MAINTENANCE" as const, label: "Serrurier (changement serrure)", amount: 150, date: daysAgo(25) },
    { propertyIdx: 3, category: "FURNISHING" as const, label: "Canapé neuf", amount: 650, date: daysAgo(55) },
    { propertyIdx: 3, category: "UTILITIES" as const, label: "Électricité mars", amount: 85, date: daysAgo(45) },
    { propertyIdx: null, category: "TAX" as const, label: "CFE 2026", amount: 890, date: daysAgo(20) },
    { propertyIdx: null, category: "MARKETING" as const, label: "Photos pro logements", amount: 350, date: daysAgo(70) },
    { propertyIdx: 0, category: "PLATFORM_FEE" as const, label: "Commission Airbnb mars", amount: 126, date: daysAgo(60) },
    { propertyIdx: 1, category: "PLATFORM_FEE" as const, label: "Commission Booking mars", amount: 198, date: daysAgo(60) },
  ]

  let expenseCount = 0
  for (const { propertyIdx, ...data } of expensesData) {
    try {
      const expense = await prisma.expense.create({
        data: {
          ...data,
          userId: targetUserId,
          propertyId: propertyIdx !== null ? properties[propertyIdx]?.id : undefined,
        },
      })
      expenseCount++
    } catch (err) {
      console.error(`  ❌ Failed expense "${data.label}":`, err)
    }
  }
  console.log(`  ✅ Total: ${expenseCount} expenses`)

  // Verify
  console.log("\n📊 Verification:")
  const counts = {
    properties: await prisma.property.count({ where: { userId: targetUserId } }),
    bookings: await prisma.booking.count({ where: { property: { userId: targetUserId } } }),
    expenses: await prisma.expense.count({ where: { userId: targetUserId } }),
  }
  console.log(`  Properties: ${counts.properties}`)
  console.log(`  Bookings: ${counts.bookings}`)
  console.log(`  Expenses: ${counts.expenses}`)

  if (counts.properties === 0 || counts.bookings === 0) {
    console.error("\n❌ Seed verification failed — data not persisted!")
    process.exit(1)
  }

  console.log("\n✅ Seed complete!")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
