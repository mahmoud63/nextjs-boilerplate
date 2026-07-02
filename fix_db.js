const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  await prisma.$runCommandRaw({
    update: 'User',
    updates: [
      {
        q: { email: { $exists: false } },
        u: [
          {
            $set: {
              email: { $concat: ['$username', '@example.com'] },
              isActive: true
            }
          }
        ],
        multi: true
      }
    ]
  });
  console.log('Done updating existing users');
}
run().catch(console.error).finally(() => prisma.$disconnect());
