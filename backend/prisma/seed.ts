import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Database Seed Script
 * 
 * Creates a default user for testing/demo purposes
 * Run with: npm run prisma:seed
 */
async function main() {
  console.log('Seeding database...');

  const email = 'secondarymail251045@gmail.com';
  const password = 'pasword@123';

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    console.log('Default user already exists. Skipping seed.');
    return;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create default user
  const user = await prisma.user.create({
    data: {
      firstName: 'Demo',
      lastName: 'User',
      email: email,
      passwordHash: passwordHash
    }
  });

  console.log('✅ Default user created successfully!');
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   User ID: ${user.id}`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
