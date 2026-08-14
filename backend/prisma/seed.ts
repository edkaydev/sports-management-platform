import { PrismaClient, UserRole, Gender, AthleteType, SportCategory } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const email = (process.env.SEED_ADMIN_EMAIL ?? 'admin@umu.ac.ug').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@2025';
  const fullName = process.env.SEED_ADMIN_NAME ?? 'Sports Department Admin';

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
  await seedAthletes();
}

const SPORTS: Array<{ name: string; gender: Gender; category: SportCategory }> = [
  { name: 'Football', gender: Gender.MALE, category: SportCategory.TEAM },
  { name: 'Netball', gender: Gender.FEMALE, category: SportCategory.TEAM },
  { name: 'Basketball', gender: Gender.MALE, category: SportCategory.TEAM },
  { name: 'Athletics', gender: Gender.MALE, category: SportCategory.INDIVIDUAL },
  { name: 'Volleyball', gender: Gender.FEMALE, category: SportCategory.TEAM },
  { name: 'Swimming', gender: Gender.MALE, category: SportCategory.INDIVIDUAL },
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

async function seedAthletes(): Promise<void> {
  const football = await prisma.sport.findUnique({ where: { name: 'Football' } });
  if (!football) return;

  const sample = [
    {
      fullName: 'Kayiira Edward',
      registrationNumber: '2024/BSCS/001',
      gender: Gender.MALE,
      email: 'edward.kayiira@umu.ac.ug',
      phoneNumber: '0772000001',
      yearOfStudy: 3,
      programme: 'BSc Computer Science',
      faculty: 'Faculty of Science',
      athleteType: AthleteType.CONTRACT,
      position: 'Midfielder',
      hasCondition: false,
    },
    {
      fullName: 'Aisha Nakato',
      registrationNumber: '2024/BBAM/014',
      gender: Gender.FEMALE,
      email: 'aisha.nakato@umu.ac.ug',
      phoneNumber: '0772000002',
      yearOfStudy: 2,
      programme: 'BBA Marketing',
      faculty: 'Faculty of Business',
      athleteType: AthleteType.SCHOLARSHIP,
      position: 'Striker',
      hasCondition: true,
    },
    {
      fullName: 'Brian Ssewankambo',
      registrationNumber: '2023/BSWE/007',
      gender: Gender.MALE,
      email: 'brian.ssewa@umu.ac.ug',
      phoneNumber: '0772000003',
      yearOfStudy: 4,
      programme: 'BSW Education',
      faculty: 'Faculty of Education',
      athleteType: AthleteType.REGULAR,
      position: 'Defender',
      hasCondition: false,
    },
  ];

  for (const s of sample) {
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
            conditionDescription: s.hasCondition ? 'Mild exercise-induced asthma' : null,
          },
        },
        affiliations: {
          create: [{ sportId: football.id, position: s.position }],
        },
      },
    });
    console.log(`ATHLETE ready: ${athlete.fullName} (${athlete.registrationNumber})`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
