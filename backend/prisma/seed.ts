import { PrismaClient, UserRole } from '@prisma/client';
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
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
