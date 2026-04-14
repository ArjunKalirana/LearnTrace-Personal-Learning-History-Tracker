const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const users = await prisma.user.findMany({
      select: { 
        id: true,
        email: true, 
        emailVerified: true, 
        verificationToken: true 
      }
    });
    console.log('--- USERS ---');
    console.log(JSON.stringify(users, null, 2));

    const entries = await prisma.learningEntry.findMany({
        select: {
            id: true,
            title: true,
            certificatePath: true,
            userId: true
        }
    });
    console.log('--- ENTRIES ---');
    console.log(JSON.stringify(entries, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
