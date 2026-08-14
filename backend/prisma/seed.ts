import {
  PrismaClient,
  UserRole,
  Gender,
  AthleteType,
  SportCategory,
  TeamStaffRole,
} from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const SEASON_NAME = "2025/2026";

async function main(): Promise<void> {
  const email = (
    process.env.SEED_ADMIN_EMAIL ?? "admin@umu.ac.ug"
  ).toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "Admin@2025";
  const fullName = process.env.SEED_ADMIN_NAME ?? "Sports Department Admin";

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      fullName,
      passwordHash,
      role: UserRole.SUPER_ADMIN,
    },
  });

  console.log(`SUPER_ADMIN ready: ${admin.email} (role=${admin.role})`);

  await seedSports();
  const season = await seedCurrentSeason(admin.id);
  await seedAthletes();
  const teams = await seedTeams(season.id);
  await seedSquads(teams.umuSaintsId, season.id);
  await seedStaff(admin.id, teams.umuSaintsId);
}

const SPORTS: Array<{ name: string; gender: Gender; category: SportCategory }> =
  [
    { name: "Football", gender: Gender.MALE, category: SportCategory.TEAM },
    { name: "Netball", gender: Gender.FEMALE, category: SportCategory.TEAM },
    { name: "Basketball", gender: Gender.MALE, category: SportCategory.TEAM },
    { name: "Volleyball", gender: Gender.MALE, category: SportCategory.TEAM },
    { name: "Rugby", gender: Gender.MALE, category: SportCategory.TEAM },
    { name: "Handball", gender: Gender.MIXED, category: SportCategory.TEAM },
    {
      name: "Tennis",
      gender: Gender.MIXED,
      category: SportCategory.INDIVIDUAL,
    },
    {
      name: "Table Tennis",
      gender: Gender.MIXED,
      category: SportCategory.INDIVIDUAL,
    },
    {
      name: "Badminton",
      gender: Gender.MIXED,
      category: SportCategory.INDIVIDUAL,
    },
    {
      name: "Athletics",
      gender: Gender.MIXED,
      category: SportCategory.INDIVIDUAL,
    },
    {
      name: "Swimming",
      gender: Gender.MIXED,
      category: SportCategory.INDIVIDUAL,
    },
    { name: "Chess", gender: Gender.MIXED, category: SportCategory.INDIVIDUAL },
    {
      name: "Scrabble",
      gender: Gender.MIXED,
      category: SportCategory.INDIVIDUAL,
    },
    { name: "Darts", gender: Gender.MIXED, category: SportCategory.INDIVIDUAL },
  ];

async function seedSports(): Promise<void> {
  for (const sport of SPORTS) {
    await prisma.sport.upsert({
      where: { name: sport.name },
      update: {},
      create: sport,
    });
  }
  console.log(`Sports ready: ${SPORTS.length} seeded`);
}

async function seedCurrentSeason(createdBy: string) {
  const season = await prisma.season.upsert({
    where: { name: SEASON_NAME },
    update: { isCurrent: true },
    create: {
      name: SEASON_NAME,
      startDate: new Date("2025-08-01"),
      endDate: new Date("2026-07-31"),
      isCurrent: true,
      createdBy,
    },
  });

  await prisma.season.updateMany({
    where: { isCurrent: true, NOT: { id: season.id } },
    data: { isCurrent: false },
  });

  console.log(`Season ready: ${season.name} (current)`);
  return season;
}

const TEAMS: Array<{
  name: string;
  shortName: string;
  sportName: string;
  gender: Gender;
  venue: string;
  foundingYear: number;
}> = [
  {
    name: "UMU Saints",
    shortName: "UMU",
    sportName: "Football",
    gender: Gender.MALE,
    venue: "Nkozi Main Stadium",
    foundingYear: 1993,
  },
  {
    name: "UMU Flames",
    shortName: "UMU",
    sportName: "Basketball",
    gender: Gender.MALE,
    venue: "Nkozi Indoor Court",
    foundingYear: 1998,
  },
  {
    name: "UMU Martyrs",
    shortName: "UMU",
    sportName: "Rugby",
    gender: Gender.MALE,
    venue: "Nkozi Rugby Grounds",
    foundingYear: 2001,
  },
  {
    name: "UMU Netball",
    shortName: "UMU",
    sportName: "Netball",
    gender: Gender.FEMALE,
    venue: "Nkozi Netball Court",
    foundingYear: 1995,
  },
  {
    name: "UMU Volleyball",
    shortName: "UMU",
    sportName: "Volleyball",
    gender: Gender.MALE,
    venue: "Nkozi Volleyball Court",
    foundingYear: 1996,
  },
  {
    name: "UMU Handball",
    shortName: "UMU",
    sportName: "Handball",
    gender: Gender.MIXED,
    venue: "Nkozi Handball Court",
    foundingYear: 2004,
  },
  {
    name: "UMU Patriots",
    shortName: "UMU",
    sportName: "Tennis",
    gender: Gender.MIXED,
    venue: "Nkozi Tennis Courts",
    foundingYear: 2003,
  },
  {
    name: "UMU Athletics Squad",
    shortName: "UMU",
    sportName: "Athletics",
    gender: Gender.MIXED,
    venue: "Nkozi Athletics Track",
    foundingYear: 1994,
  },
];

async function seedTeams(seasonId: string) {
  const teamIds: Record<string, string> = {};
  const umuSaintsId = await prisma.team.findFirst({
    where: { name: "UMU Saints" },
    select: { id: true },
  });

  for (const team of TEAMS) {
    const sport = await prisma.sport.findUnique({
      where: { name: team.sportName },
    });
    if (!sport) continue;

    const existing = await prisma.team.findFirst({
      where: { name: team.name },
    });
    const created = existing
      ? await prisma.team.update({
          where: { id: existing.id },
          data: { seasonId, isActive: true },
        })
      : await prisma.team.create({
          data: {
            name: team.name,
            shortName: team.shortName,
            sportId: sport.id,
            seasonId,
            gender: team.gender,
            homeVenue: team.venue,
            foundingYear: team.foundingYear,
            isActive: true,
          },
        });

    teamIds[team.name] = created.id;
  }

  const saintsId = teamIds["UMU Saints"] ?? umuSaintsId?.id;
  console.log(`Teams ready: ${TEAMS.length} seeded`);
  return { umuSaintsId: saintsId };
}

const SAMPLE_ATHLETES: Array<{
  fullName: string;
  registrationNumber: string;
  gender: Gender;
  email: string;
  phoneNumber: string;
  yearOfStudy: number;
  programme: string;
  faculty: string;
  athleteType: AthleteType;
  position: string;
  jerseyNumber: number;
  isCaptain: boolean;
  isViceCaptain: boolean;
  hasCondition: boolean;
}> = [
  {
    fullName: "Kayiira Edward",
    registrationNumber: "2024/BSCS/001",
    gender: Gender.MALE,
    email: "edward.kayiira@umu.ac.ug",
    phoneNumber: "0772000001",
    yearOfStudy: 3,
    programme: "BSc Computer Science",
    faculty: "Faculty of Science",
    athleteType: AthleteType.CONTRACT,
    position: "Midfielder",
    jerseyNumber: 8,
    isCaptain: true,
    isViceCaptain: false,
    hasCondition: false,
  },
  {
    fullName: "Aisha Nakato",
    registrationNumber: "2024/BBAM/014",
    gender: Gender.FEMALE,
    email: "aisha.nakato@umu.ac.ug",
    phoneNumber: "0772000002",
    yearOfStudy: 2,
    programme: "BBA Marketing",
    faculty: "Faculty of Business",
    athleteType: AthleteType.SCHOLARSHIP,
    position: "Striker",
    jerseyNumber: 9,
    isCaptain: false,
    isViceCaptain: true,
    hasCondition: true,
  },
  {
    fullName: "Brian Ssewankambo",
    registrationNumber: "2023/BSWE/007",
    gender: Gender.MALE,
    email: "brian.ssewa@umu.ac.ug",
    phoneNumber: "0772000003",
    yearOfStudy: 4,
    programme: "BSW Education",
    faculty: "Faculty of Education",
    athleteType: AthleteType.REGULAR,
    position: "Defender",
    jerseyNumber: 5,
    isCaptain: false,
    isViceCaptain: false,
    hasCondition: false,
  },
];

async function seedAthletes(): Promise<void> {
  const football = await prisma.sport.findUnique({
    where: { name: "Football" },
  });
  if (!football) return;

  for (const s of SAMPLE_ATHLETES) {
    const athlete = await prisma.studentAthlete.upsert({
      where: { registrationNumber: s.registrationNumber },
      update: {},
      create: {
        fullName: s.fullName,
        registrationNumber: s.registrationNumber,
        gender: s.gender,
        email: s.email,
        phoneNumber: s.phoneNumber,
        yearOfStudy: s.yearOfStudy,
        programme: s.programme,
        faculty: s.faculty,
        athleteType: s.athleteType,
        medicalDeclaration: {
          create: {
            hasCondition: s.hasCondition,
            conditionDescription: s.hasCondition
              ? "Mild exercise-induced asthma"
              : null,
          },
        },
        affiliations: {
          create: [{ sportId: football.id, position: s.position }],
        },
      },
    });
    console.log(
      `ATHLETE ready: ${athlete.fullName} (${athlete.registrationNumber})`,
    );
  }
}

async function seedSquads(
  teamId: string | undefined,
  seasonId: string,
): Promise<void> {
  if (!teamId) return;

  for (const s of SAMPLE_ATHLETES) {
    const athlete = await prisma.studentAthlete.findUnique({
      where: { registrationNumber: s.registrationNumber },
    });
    if (!athlete) continue;

    await prisma.teamSquad.upsert({
      where: {
        teamId_athleteId_seasonId: { teamId, athleteId: athlete.id, seasonId },
      },
      update: {
        jerseyNumber: s.jerseyNumber,
        position: s.position,
        isCaptain: s.isCaptain,
        isViceCaptain: s.isViceCaptain,
        status: "ACTIVE",
      },
      create: {
        teamId,
        athleteId: athlete.id,
        seasonId,
        jerseyNumber: s.jerseyNumber,
        position: s.position,
        isCaptain: s.isCaptain,
        isViceCaptain: s.isViceCaptain,
        joinedDate: new Date("2025-08-15"),
        status: "ACTIVE",
      },
    });
  }
  console.log(`Squad ready: ${SAMPLE_ATHLETES.length} athletes in UMU Saints`);
}

async function seedStaff(
  createdBy: string,
  teamId: string | undefined,
): Promise<void> {
  if (!teamId) return;

  const coachEmail = (
    process.env.SEED_COACH_EMAIL ?? "coach@umu.ac.ug"
  ).toLowerCase();
  const coach = await prisma.user.upsert({
    where: { email: coachEmail },
    update: {},
    create: {
      email: coachEmail,
      fullName: "Sample Team Coach",
      passwordHash: await bcrypt.hash(
        process.env.SEED_COACH_PASSWORD ?? "Coach@2025",
        12,
      ),
      role: UserRole.COACH,
    },
  });

  await prisma.teamStaff.upsert({
    where: {
      teamId_userId_role: {
        teamId,
        userId: coach.id,
        role: TeamStaffRole.HEAD_COACH,
      },
    },
    update: { isActive: true },
    create: {
      teamId,
      userId: coach.id,
      role: TeamStaffRole.HEAD_COACH,
      assignedDate: new Date("2025-08-01"),
      notes: `Assigned by ${createdBy}`,
    },
  });

  console.log(`STAFF ready: ${coach.fullName} (HEAD_COACH of UMU Saints)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
