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
  // 2. Remove previously generated test events
  // --------------------------------------------------------------------------

  await prisma.event.deleteMany({
    where: {
      title: {
        startsWith: "Test Event ",
      },
    },
  });

  console.log("🗑️ Existing generated test events removed");

  // --------------------------------------------------------------------------
  // 3. Create concurrency test event
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
      priceCents: 100000,
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
      priceCents: 100000,
      organizerId: organizer.id,
    },
  });

  console.log("✅ Concurrency test event created");

  // --------------------------------------------------------------------------
  // 4. Realistic event data
  // --------------------------------------------------------------------------

  const eventTypes = [
    {
      type: "Music",
      titles: [
        "Lagos Music Festival",
        "Afrobeats Live",
        "Sounds of Lagos",
        "Naija Music Night",
        "Lagos Summer Concert",
        "The Big Concert",
        "Afrobeats Experience",
        "Live in Lagos",
      ],
    },
    {
      type: "Technology",
      titles: [
        "Lagos Tech Conference",
        "Nigeria Developer Conference",
        "Africa Tech Summit",
        "Frontend Engineering Summit",
        "Backend Engineering Conference",
        "AI & Machine Learning Summit",
        "Software Engineering Meetup",
        "Tech Founders Conference",
      ],
    },
    {
      type: "Business",
      titles: [
        "Lagos Business Summit",
        "Entrepreneurs Conference",
        "Africa Business Forum",
        "Startup Founders Summit",
        "Business Leadership Conference",
        "SME Growth Conference",
        "Investment Summit",
        "Young Entrepreneurs Forum",
      ],
    },
    {
      type: "Sports",
      titles: [
        "Lagos Football Tournament",
        "Community Football Championship",
        "5-A-Side Football Tournament",
        "Lagos Basketball Championship",
        "Corporate Football Cup",
        "Street Football Tournament",
        "Intercity Football Tournament",
      ],
    },
    {
      type: "Education",
      titles: [
        "Career Development Conference",
        "Student Leadership Summit",
        "Digital Skills Workshop",
        "Professional Development Summit",
        "Career Growth Conference",
        "Future Skills Conference",
        "Learning & Development Summit",
      ],
    },
    {
      type: "Entertainment",
      titles: [
        "Comedy Night Live",
        "Lagos Comedy Festival",
        "Movie Premiere",
        "Game Night",
        "Comedy & Music Night",
        "Entertainment Festival",
        "Movie & Culture Festival",
      ],
    },
  ];

  const venues = [
    "Landmark Event Centre",
    "Eko Hotel & Suites",
    "Tafawa Balewa Square",
    "MUSON Centre",
    "Terra Kulture",
    "Civic Centre",
    "Lagos Oriental Hotel",
    "The Balmoral Convention Centre",
    "Federal Palace Hotel",
    "National Theatre",
    "Muri Okunola Park",
    "Oniru Beach",
    "Fantasyland",
    "Agip Recital Hall",
    "University of Lagos",
    "Lagos Business School",
    "University of Lagos Sports Centre",
    "Teslim Balogun Stadium",
    "Mobolaji Johnson Arena",
    "RCCG City of David",
  ];

  const seatRanges = [
    { min: 100, max: 300, weight: 25 },
    { min: 300, max: 1000, weight: 30 },
    { min: 1000, max: 3000, weight: 25 },
    { min: 3000, max: 10000, weight: 15 },
    { min: 10000, max: 50000, weight: 5 },
  ];

  const priceTiers = [
    5000,
    10000,
    20000,
    50000,
    100000,
    150000,
    200000,
    300000,
    500000,
    750000,
    1000000,
    1500000,
    2500000,
    5000000,
  ];

  // --------------------------------------------------------------------------
  // 5. Helper functions
  // --------------------------------------------------------------------------

  function randomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  function randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function weightedSeatRange() {
    const totalWeight = seatRanges.reduce(
      (sum, range) => sum + range.weight,
      0
    );

    let random = Math.random() * totalWeight;

    for (const range of seatRanges) {
      random -= range.weight;

      if (random <= 0) {
        return range;
      }
    }

    return seatRanges[0];
  }

  // --------------------------------------------------------------------------
  // 6. Generate 9,999 events
  // --------------------------------------------------------------------------

  const EVENT_COUNT = 9_999;

  const events = Array.from({ length: EVENT_COUNT }, (_, index) => {
    const eventType = randomItem(eventTypes);
    const baseTitle = randomItem(eventType.titles);

    const title = `${baseTitle} 2026 - Edition ${
      Math.floor(index / 500) + 1
    }`;

    const now = new Date();

    // 15% past events
    // 5% events happening soon
    // 80% future events

    const dateDistribution = Math.random();

    let startsAt: Date;

    if (dateDistribution < 0.15) {
      const daysAgo = randomNumber(1, 180);

      startsAt = new Date(
        now.getTime() - daysAgo * 24 * 60 * 60 * 1000
      );
    } else if (dateDistribution < 0.20) {
      const daysAhead = randomNumber(0, 7);

      startsAt = new Date(
        now.getTime() + daysAhead * 24 * 60 * 60 * 1000
      );
    } else {
      const daysAhead = randomNumber(8, 365);

      startsAt = new Date(
        now.getTime() + daysAhead * 24 * 60 * 60 * 1000
      );
    }

    const seatRange = weightedSeatRange();

    const totalSeats = randomNumber(
      seatRange.min,
      seatRange.max
    );

    const seatsAvailable = totalSeats;

    const priceCents = randomItem(priceTiers);

    const venue = randomItem(venues);

    return {
      title,
      description: `${baseTitle} featuring an exciting lineup of activities, speakers, performers and experiences. Join us at ${venue} for this ${eventType.type.toLowerCase()} event.`,
      venue,
      startsAt,
      totalSeats,
      seatsAvailable,
      priceCents,
      organizerId: organizer.id,
    };
  });

  // --------------------------------------------------------------------------
  // 7. Insert all 9,999 events
  // --------------------------------------------------------------------------

  console.log(`🌱 Creating ${events.length} events...`);

  await prisma.event.createMany({
    data: events,
  });

  console.log(`✅ ${events.length} events created`);

  // --------------------------------------------------------------------------
  // 8. Print useful information
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
  console.log(`  Generated events: ${EVENT_COUNT}`);
  console.log(`  Total events:     ${EVENT_COUNT + 1}`);

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