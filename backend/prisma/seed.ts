import {
  PrismaClient,
  UserRole,
  Gender,
  AthleteType,
  SportCategory,
  TeamStaffRole,
  AcademicStanding,
  Semester,
  CourseResult,
  ScholarshipType,
  ContractType,
  EventType,
  EventLevel,
  EventFormat,
  MatchType,
  TrialStatus,
  ProspectSource,
} from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const SEASON_NAME = "2025/2026";

async function main(): Promise<void> {
  const email = (
    process.env.SEED_ADMIN_EMAIL ?? "tutor@umu.ac.ug"
  ).toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "tutor123";
  const fullName = process.env.SEED_ADMIN_NAME ?? "Sports Tutor";

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      fullName,
      passwordHash,
      role: UserRole.TUTOR,
      mustChangePassword: true,
    },
  });

  console.log(`TUTOR ready: ${admin.email} (role=${admin.role})`);

  const repEmail = (process.env.SEED_REP_EMAIL ?? "sports@umu.ac.ug").toLowerCase();
  const repPassword = process.env.SEED_REP_PASSWORD ?? "sports123";
  const rep = await prisma.user.upsert({
    where: { email: repEmail },
    update: {},
    create: {
      email: repEmail,
      fullName: "Sports Representative",
      passwordHash: await bcrypt.hash(repPassword, 12),
      role: UserRole.SPORTS_REP,
      mustChangePassword: true,
    },
  });

  console.log(`SPORTS_REP ready: ${rep.email} (role=${rep.role})`);

  await seedSports();
  const season = await seedCurrentSeason(admin.id);
  await seedAthletes();
  const teams = await seedTeams(season.id);
  await seedSquads(teams.umuSaintsId, season.id);
  await seedStaff(admin.id, teams.umuSaintsId);
  await seedAcademicRecords(admin.id);
  await seedScholarshipsAndContracts(admin.id);
  const event = await seedEvent(admin.id, season.id);
  await seedMatch(admin.id, season.id, teams.umuSaintsId, event);
  await seedTrainingSession(admin.id, season.id);
  await seedProspectsAndTrials(admin.id);
  await seedNotifications(admin.id);
  await seedNews(admin.id);
  console.log("Seed complete");
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
    process.env.SEED_COACH_EMAIL ?? "sports@umu.ac.ug"
  ).toLowerCase();
  const coach = await prisma.user.upsert({
    where: { email: coachEmail },
    update: {},
    create: {
      email: coachEmail,
      fullName: "Sports Representative",
      passwordHash: await bcrypt.hash(
        process.env.SEED_COACH_PASSWORD ?? "sports123",
        12,
      ),
      role: UserRole.SPORTS_REP,
      mustChangePassword: true,
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

  console.log(`STAFF ready: ${coach.fullName} (HEAD_COACH of UMU Saints)`);}

async function seedAcademicRecords(enteredBy: string): Promise<void> {
  const semesters: Array<{
    year: string;
    semester: Semester;
    gpa: number;
    failedUnits: number;
    standing: AcademicStanding;
  }> = [
    { year: "2025/2026", semester: Semester.SEM1, gpa: 3.7, failedUnits: 0, standing: AcademicStanding.GOOD_STANDING },
    { year: "2025/2026", semester: Semester.SEM2, gpa: 2.1, failedUnits: 1, standing: AcademicStanding.WARNING },
  ];

  for (const s of SAMPLE_ATHLETES) {
    const athlete = await prisma.studentAthlete.findUnique({
      where: { registrationNumber: s.registrationNumber },
    });
    if (!athlete) continue;

    for (const rec of semesters) {
      const gpa = s.registrationNumber === "2024/BSCS/001" ? rec.gpa : rec.gpa - 0.2;
      await prisma.academicRecord.upsert({
        where: {
          athleteId_academicYear_semester: {
            athleteId: athlete.id,
            academicYear: rec.year,
            semester: rec.semester,
          },
        },
        update: {},
        create: {
          athleteId: athlete.id,
          academicYear: rec.year,
          semester: rec.semester,
          yearOfStudy: s.yearOfStudy,
          gpa,
          cgpa: gpa,
          totalCreditUnitsTaken: 18,
          totalCreditUnitsPassed: 18 - rec.failedUnits,
          failedUnits: rec.failedUnits,
          attendancePercentage: rec.failedUnits > 0 ? 72 : 94,
          academicStanding: rec.standing,
          enteredBy,
          courseResults: {
            create: [
              { courseCode: "UMU101", courseName: "Academic Writing", creditUnits: 3, marks: 78, grade: "B", result: CourseResult.PASS },
              { courseCode: "UMU102", courseName: "Sports Science", creditUnits: 3, marks: 65, grade: "C", result: CourseResult.PASS },
            ],
          },
        },
      });
    }
  }
  console.log(`Academic records ready: ${SAMPLE_ATHLETES.length * semesters.length} seeded`);
}

async function seedScholarshipsAndContracts(awardedBy: string): Promise<void> {
  const aisha = await prisma.studentAthlete.findUnique({
    where: { registrationNumber: "2024/BBAM/014" },
  });
  if (aisha) {
    await prisma.scholarship.upsert({
      where: { id: `seed-scholarship-${aisha.id}` },
      update: {},
      create: {
        id: `seed-scholarship-${aisha.id}`,
        athleteId: aisha.id,
        scholarshipType: ScholarshipType.PARTIAL,
        sponsorName: "UMU Merit Fund",
        coverageDescription: "50% tuition coverage",
        coveragePercentage: 50,
        startDate: new Date("2025-09-01"),
        endDate: new Date("2026-08-31"),
        renewable: true,
        status: "ACTIVE",
        academicRequirementGpa: 2.5,
        awardedBy,
        awardedAt: new Date("2025-09-01"),
      },
    });
  }

  const edward = await prisma.studentAthlete.findUnique({
    where: { registrationNumber: "2024/BSCS/001" },
  });
  if (edward) {
    await prisma.athleteContract.upsert({
      where: { id: `seed-contract-${edward.id}` },
      update: {},
      create: {
        id: `seed-contract-${edward.id}`,
        athleteId: edward.id,
        contractType: ContractType.PLAYING,
        startDate: new Date("2025-09-01"),
        endDate: new Date("2026-08-31"),
        termsSummary: "Playing contract for UMU Saints, senior squad",
        hasAccompanyingScholarship: false,
        signedByAthlete: true,
        signedAt: new Date("2025-08-20"),
        status: "ACTIVE",
        createdBy: awardedBy,
      },
    });
  }
  console.log("Scholarships & contracts ready");
}

async function seedEvent(createdBy: string, seasonId: string) {
  const football = await prisma.sport.findUnique({ where: { name: "Football" } });
  const existing = await prisma.event.findFirst({
    where: { name: "Inter-University Football Gala 2025" },
  });
  if (existing) return existing;

  return prisma.event.create({
    data: {
      name: "Inter-University Football Gala 2025",
      type: EventType.GALA,
      level: EventLevel.NATIONAL,
      sportId: football?.id,
      seasonId,
      organizer: "UMU Sports Department",
      hostInstitution: "Uganda Martyrs University",
      venue: "Nkozi Main Stadium",
      startDate: new Date("2026-03-10T09:00:00.000Z"),
      endDate: new Date("2026-03-14T18:00:00.000Z"),
      description: "Annual inter-university football gala",
      status: "PLANNED",
      format: EventFormat.ROUND_ROBIN,
      maxTeams: 16,
      createdBy,
    },
  });
}

async function seedMatch(
  createdBy: string,
  seasonId: string,
  homeTeamId: string | undefined,
  event: { id: string },
): Promise<void> {
  if (!homeTeamId) return;
  const football = await prisma.sport.findUnique({ where: { name: "Football" } });
  if (!football) return;

  const existing = await prisma.match.findFirst({
    where: { eventId: event.id, homeTeamId },
  });
  if (existing) return;

  await prisma.match.create({
    data: {
      eventId: event.id,
      sportId: football.id,
      seasonId,
      matchNumber: 1,
      round: "Group A",
      homeTeamId,
      venue: "Nkozi Main Stadium",
      scheduledDate: new Date("2026-03-10T14:00:00.000Z"),
      scheduledTime: "14:00",
      status: "SCHEDULED",
      matchType: MatchType.GALA,
      createdBy,
    },
  });
}

async function seedTrainingSession(
  createdBy: string,
  seasonId: string,
): Promise<void> {
  const football = await prisma.sport.findUnique({ where: { name: "Football" } });
  if (!football) return;

  const existing = await prisma.trainingSession.findFirst({
    where: { title: "Tuesday Morning Skills Session" },
  });
  if (existing) return;

  await prisma.trainingSession.create({
    data: {
      sportId: football.id,
      seasonId,
      title: "Tuesday Morning Skills Session",
      location: "Nkozi Training Grounds",
      sessionDate: new Date("2026-08-20T08:00:00.000Z"),
      startTime: "08:00",
      endTime: "10:00",
      focusAreas: "Passing, shooting accuracy, conditioning",
      intensity: "Medium",
      status: "SCHEDULED",
      createdBy,
    },
  });
}

async function seedProspectsAndTrials(createdBy: string): Promise<void> {
  const football = await prisma.sport.findUnique({ where: { name: "Football" } });
  if (!football) return;

  const existingProspect = await prisma.prospect.findFirst({
    where: { email: "james.kato@stmarys.ac.ug" },
  });
  if (!existingProspect) {
    await prisma.prospect.create({
      data: {
        fullName: "James Kato",
        email: "james.kato@stmarys.ac.ug",
        phoneNumber: "0772000099",
        gender: Gender.MALE,
        schoolOrInstitution: "St. Mary's College Kisubi",
        programmeApplied: "BSc Computer Science",
        sportId: football.id,
        position: "Winger",
        previousLevel: "NATIONAL",
        source: ProspectSource.COACH_REFERRAL,
        status: "TRIAL_SCHEDULED",
        createdBy,
      },
    });
  }

  const existingTrial = await prisma.trial.findFirst({
    where: { venue: "Nkozi Main Stadium", trialDate: new Date("2026-09-05T10:00:00.000Z") },
  });
  if (!existingTrial) {
    await prisma.trial.create({
      data: {
        sportId: football.id,
        trialDate: new Date("2026-09-05T10:00:00.000Z"),
        startTime: "10:00",
        venue: "Nkozi Main Stadium",
        conductedBy: createdBy,
        description: "Open trials for the 2026/2027 squad",
        status: TrialStatus.SCHEDULED,
        createdBy,
      },
    });
  }
}

async function seedNotifications(recipient: string): Promise<void> {
  await prisma.notification.createMany({
    data: [
      {
        type: "ACADEMIC_WARNING",
        severity: "WARNING",
        title: "Academic warning",
        message: "Aisha Nakato's standing is WARNING for SEM2 2025/2026.",
        recipientUserId: recipient,
        relatedAthleteId: (
          await prisma.studentAthlete.findUnique({ where: { registrationNumber: "2024/BBAM/014" } })
        )?.id,
      },
      {
        type: "SYSTEM",
        severity: "INFO",
        title: "Welcome to UMU Sports",
        message: "The sports department dashboard is ready.",
        recipientUserId: recipient,
      },
    ],
    skipDuplicates: true,
  });
  console.log("Notifications seeded");
}

const NEWS_POSTS: Array<{
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string;
  featured: boolean;
}> = [
  {
    title: "UMU Saints Complete Pre-Season Preparations",
    slug: "umu-saints-pre-season-preparations",
    excerpt: "The Saints wrapped up a productive pre-season block ahead of the 2026 gala season.",
    content:
      "Uganda Martyrs University's flagship football team completed its pre-season training block at the Nkozi Main Stadium. The squad, led by the head coach, focused on fitness, set-piece drills, and tactical work ahead of the Inter-University Football Gala scheduled for March 2026. All student-athletes reported in good physical condition.",
    tags: "football, umu saints",
    featured: true,
  },
  {
    title: "Registration Opens for the 2026 Inter-University Gala",
    slug: "registration-open-2026-inter-university-gala",
    excerpt: "Teams and individuals can now register for this year's gala across football, netball, basketball, and more.",
    content:
      "The Sports Department has opened registration for the 2026 Inter-University Gala. The event will run from March 10-14 at the Nkozi Main Stadium and surrounding facilities. Interested teams should register before the deadline through the sports office. Individual sports include tennis, badminton, athletics, and swimming.",
    tags: "events, gala, registration",
    featured: false,
  },
];

async function seedNews(authorId: string): Promise<void> {
  for (const post of NEWS_POSTS) {
    await prisma.newsPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        ...post,
        status: "PUBLISHED",
        publishedAt: new Date("2026-08-01T09:00:00.000Z"),
        authorId,
      },
    });
  }
  console.log(`News posts ready: ${NEWS_POSTS.length} seeded`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
