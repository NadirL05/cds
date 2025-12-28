import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { startOfDay, addDays, setHours, setMinutes, addMinutes } from "date-fns";

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seed...");

  // Clean existing data (optional - comment out if you want to keep existing data)
  console.log("🧹 Cleaning existing data...");
  await prisma.booking.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.studio.deleteMany();

  // 1. Create Studios
  console.log("🏢 Creating studios...");
  const studioParis = await prisma.studio.create({
    data: {
      name: "CDS Paris - République",
      city: "Paris",
      maxCapacityPerSlot: 6,
    },
  });

  const studioLyon = await prisma.studio.create({
    data: {
      name: "CDS Lyon",
      city: "Lyon",
      maxCapacityPerSlot: 6,
    },
  });

  console.log(`✅ Created studios: ${studioParis.name}, ${studioLyon.name}`);

  // 2. Create Users

  // Super Admin
  console.log("👤 Creating Super Admin...");
  const superAdmin = await prisma.user.create({
    data: {
      email: "admin@cds.fr",
      role: Role.SUPER_ADMIN,
      profile: {
        create: {
          firstName: "Admin",
          lastName: "CDS",
          goals: [],
          level: "Administrator",
        },
      },
    },
  });

  // Franchise Owners (one per studio)
  console.log("👔 Creating Franchise Owners...");
  const ownerParis = await prisma.user.create({
    data: {
      email: "owner.paris@cds.fr",
      role: Role.FRANCHISE_OWNER,
      homeStudioId: studioParis.id,
      profile: {
        create: {
          firstName: "Sophie",
          lastName: "Martin",
          goals: [],
          level: "Manager",
        },
      },
    },
  });

  const ownerLyon = await prisma.user.create({
    data: {
      email: "owner.lyon@cds.fr",
      role: Role.FRANCHISE_OWNER,
      homeStudioId: studioLyon.id,
      profile: {
        create: {
          firstName: "Marc",
          lastName: "Dupont",
          goals: [],
          level: "Manager",
        },
      },
    },
  });

  // Coaches (2 per studio)
  console.log("💪 Creating Coaches...");
  const coaches = [
    {
      email: "coach1.paris@cds.fr",
      firstName: "Julie",
      lastName: "Bernard",
      studioId: studioParis.id,
    },
    {
      email: "coach2.paris@cds.fr",
      firstName: "Thomas",
      lastName: "Petit",
      studioId: studioParis.id,
    },
    {
      email: "coach1.lyon@cds.fr",
      firstName: "Marie",
      lastName: "Garcia",
      studioId: studioLyon.id,
    },
    {
      email: "coach2.lyon@cds.fr",
      firstName: "Pierre",
      lastName: "Moreau",
      studioId: studioLyon.id,
    },
  ];

  const createdCoaches = await Promise.all(
    coaches.map((coach) =>
      prisma.user.create({
        data: {
          email: coach.email,
          role: Role.COACH,
          homeStudioId: coach.studioId,
          profile: {
            create: {
              firstName: coach.firstName,
              lastName: coach.lastName,
              goals: [],
              level: "Professional",
            },
          },
        },
      })
    )
  );

  // Members (10 members with various profiles)
  console.log("👥 Creating Members...");
  const membersData = [
    {
      email: "member1@example.com",
      firstName: "Alice",
      lastName: "Dubois",
      goals: ["Weight Loss"],
      level: "Beginner",
      medicalNotes: null,
      studioId: studioParis.id,
    },
    {
      email: "member2@example.com",
      firstName: "Bob",
      lastName: "Lefebvre",
      goals: ["Muscle", "Strength"],
      level: "Intermediate",
      medicalNotes: null,
      studioId: studioParis.id,
    },
    {
      email: "member3@example.com",
      firstName: "Claire",
      lastName: "Moreau",
      goals: ["Back Pain", "Rehabilitation"],
      level: "Beginner",
      medicalNotes: "Lower back issues - avoid high intensity",
      studioId: studioParis.id,
    },
    {
      email: "member4@example.com",
      firstName: "David",
      lastName: "Simon",
      goals: ["Weight Loss", "Endurance"],
      level: "Intermediate",
      medicalNotes: null,
      studioId: studioParis.id,
    },
    {
      email: "member5@example.com",
      firstName: "Emma",
      lastName: "Laurent",
      goals: ["Muscle"],
      level: "Advanced",
      medicalNotes: null,
      studioId: studioParis.id,
    },
    {
      email: "member6@example.com",
      firstName: "François",
      lastName: "Rousseau",
      goals: ["Weight Loss"],
      level: "Beginner",
      medicalNotes: null,
      studioId: studioLyon.id,
    },
    {
      email: "member7@example.com",
      firstName: "Gabrielle",
      lastName: "Fournier",
      goals: ["Back Pain"],
      level: "Beginner",
      medicalNotes: "Previous injury - monitor carefully",
      studioId: studioLyon.id,
    },
    {
      email: "member8@example.com",
      firstName: "Hugo",
      lastName: "Girard",
      goals: ["Muscle", "Strength"],
      level: "Intermediate",
      medicalNotes: null,
      studioId: studioLyon.id,
    },
    {
      email: "member9@example.com",
      firstName: "Isabelle",
      lastName: "Bonnet",
      goals: ["Endurance", "Weight Loss"],
      level: "Intermediate",
      medicalNotes: null,
      studioId: studioLyon.id,
    },
    {
      email: "member10@example.com",
      firstName: "Julien",
      lastName: "Dupuis",
      goals: ["Muscle"],
      level: "Advanced",
      medicalNotes: null,
      studioId: studioLyon.id,
    },
  ];

  const createdMembers = await Promise.all(
    membersData.map((member) =>
      prisma.user.create({
        data: {
          email: member.email,
          role: Role.MEMBER,
          homeStudioId: member.studioId,
          profile: {
            create: {
              firstName: member.firstName,
              lastName: member.lastName,
              goals: member.goals,
              level: member.level,
              medicalNotes: member.medicalNotes,
            },
          },
        },
      })
    )
  );

  console.log(`✅ Created ${createdMembers.length} members`);

  // 3. Create Bookings
  console.log("📅 Creating bookings...");

  // Get today and tomorrow dates using date-fns
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);

  // Helper function to create a time slot (20 minutes duration)
  const createTimeSlot = (date: Date, hours: number, minutes: number) => {
    const start = setMinutes(setHours(date, hours), minutes);
    const end = addMinutes(start, 20);
    return { start, end };
  };

  // Bookings for Today
  // Create a slot at 18:00 with 5 bookings (to test capacity - 1 spot left)
  const slot18h00 = createTimeSlot(today, 18, 0);
  const membersFor18h = createdMembers.slice(0, 5); // First 5 members
  await Promise.all(
    membersFor18h.map((member, index) =>
      prisma.booking.create({
        data: {
          studioId: member.homeStudioId!,
          userId: member.id,
          startTime: slot18h00.start,
          endTime: slot18h00.end,
          status: "CONFIRMED",
          programUsed: ["Metabolique", "Force 2", "Massage", "Endurance"][index % 4],
        },
      })
    )
  );

  // Create some other bookings for today
  const slot10h00 = createTimeSlot(today, 10, 0);
  await prisma.booking.create({
    data: {
      studioId: studioParis.id,
      userId: createdMembers[0].id,
      startTime: slot10h00.start,
      endTime: slot10h00.end,
      status: "CONFIRMED",
      programUsed: "Metabolique",
    },
  });

  const slot14h00 = createTimeSlot(today, 14, 0);
  await prisma.booking.create({
    data: {
      studioId: studioParis.id,
      userId: createdMembers[1].id,
      startTime: slot14h00.start,
      endTime: slot14h00.end,
      status: "CONFIRMED",
      programUsed: "Force 2",
    },
  });

  // Bookings for Tomorrow
  const slotTomorrow10h = createTimeSlot(tomorrow, 10, 0);
  await prisma.booking.create({
    data: {
      studioId: studioLyon.id,
      userId: createdMembers[5].id,
      startTime: slotTomorrow10h.start,
      endTime: slotTomorrow10h.end,
      status: "CONFIRMED",
      programUsed: "Endurance",
    },
  });

  const slotTomorrow14h = createTimeSlot(tomorrow, 14, 0);
  await Promise.all(
    [createdMembers[6], createdMembers[7]].map((member, index) =>
      prisma.booking.create({
        data: {
          studioId: studioLyon.id,
          userId: member.id,
          startTime: slotTomorrow14h.start,
          endTime: slotTomorrow14h.end,
          status: "CONFIRMED",
          programUsed: ["Massage", "Metabolique"][index],
        },
      })
    )
  );

  console.log("✅ Created bookings");
  console.log(`   - Today at 18:00: ${membersFor18h.length} bookings (1 spot left)`);
  console.log(`   - Other bookings created for today and tomorrow`);

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - Studios: 2`);
  console.log(`   - Super Admin: 1`);
  console.log(`   - Franchise Owners: 2`);
  console.log(`   - Coaches: 4`);
  console.log(`   - Members: ${createdMembers.length}`);
  console.log(`   - Bookings: Multiple (including test slot at 18:00 today with 5/6 capacity)`);
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
