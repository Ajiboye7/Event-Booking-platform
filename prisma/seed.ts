import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // --------------------------------------------------------------------------
  // 1. Create test users
  // --------------------------------------------------------------------------

  const organizer = await prisma.user.upsert({
    where: {
      email: "organizer@test.com",
    },
    update: {},
    create: {
      email: "organizer@test.com",
      name: "Test Organizer",
    },
  });

  const user1 = await prisma.user.upsert({
    where: {
      email: "user1@test.com",
    },
    update: {},
    create: {
      email: "user1@test.com",
      name: "Test User One",
    },
  });

  const user2 = await prisma.user.upsert({
    where: {
      email: "user2@test.com",
    },
    update: {},
    create: {
      email: "user2@test.com",
      name: "Test User Two",
    },
  });

  console.log("✅ Test users created");

  // --------------------------------------------------------------------------
  // 2. Create the concurrency test event
  // --------------------------------------------------------------------------

  const concurrencyEvent = await prisma.event.upsert({
    where: {
      id: "concurrency-test-event",
    },
    update: {
      title: "Concurrency Test Event",
      description: "Used for testing concurrent ticket reservations.",
      venue: "Test Arena",
      startsAt: new Date("2026-12-01T18:00:00Z"),
      totalSeats: 500,
      seatsAvailable: 500,
      priceCents: 1000,
      organizerId: organizer.id,
    },
    create: {
      id: "concurrency-test-event",
      title: "Concurrency Test Event",
      description: "Used for testing concurrent ticket reservations.",
      venue: "Test Arena",
      startsAt: new Date("2026-12-01T18:00:00Z"),
      totalSeats: 500,
      seatsAvailable: 500,
      priceCents: 1000,
      organizerId: organizer.id,
    },
  });

  // --------------------------------------------------------------------------
  // 3. Create normal test events
  // --------------------------------------------------------------------------

  const techEvent = await prisma.event.upsert({
    where: {
      id: "tech-conference-2026",
    },
    update: {},
    create: {
      id: "tech-conference-2026",
      title: "Lagos Tech Conference 2026",
      description:
        "A technology conference bringing developers, founders and technology enthusiasts together.",
      venue: "Landmark Event Centre",
      startsAt: new Date("2026-10-10T10:00:00Z"),
      totalSeats: 2000,
      seatsAvailable: 2000,
      priceCents: 250000,
      organizerId: organizer.id,
    },
  });

  const musicEvent = await prisma.event.upsert({
    where: {
      id: "music-festival-2026",
    },
    update: {},
    create: {
      id: "music-festival-2026",
      title: "Lagos Music Festival 2026",
      description:
        "A live music festival featuring artists from Nigeria and around the world.",
      venue: "Tafawa Balewa Square",
      startsAt: new Date("2026-11-20T16:00:00Z"),
      totalSeats: 5000,
      seatsAvailable: 5000,
      priceCents: 500000,
      organizerId: organizer.id,
    },
  });

  console.log("✅ Events created");

  // --------------------------------------------------------------------------
  // 4. Print useful IDs
  // --------------------------------------------------------------------------

  console.log("\n📋 Seed data:");
  console.log("----------------------------------------");

  console.log("Organizer:");
  console.log(`  ID:    ${organizer.id}`);
  console.log(`  Email: ${organizer.email}`);

  console.log("\nUsers:");
  console.log(`  User 1: ${user1.id}`);
  console.log(`  User 2: ${user2.id}`);

  console.log("\nEvents:");
  console.log(`  Concurrency test: ${concurrencyEvent.id}`);
  console.log(`  Tech conference:  ${techEvent.id}`);
  console.log(`  Music festival:   ${musicEvent.id}`);

  console.log("----------------------------------------");
  console.log("🌱 Database seed completed successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });