const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  if(users.length > 0) {
    console.log('Found users:', users.map(u => u.email));
    await prisma.user.updateMany({
      data: { name: 'Mahmoud Kamal', gender: 'male' }
    });
    console.log('Updated users.');
  } else {
    console.log('No users found.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
