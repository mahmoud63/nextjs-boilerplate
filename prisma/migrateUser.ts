import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// A simple scrypt hash function for password (so we don't need external bcrypt lib)
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return salt + ":" + derivedKey.toString('hex');
}

async function main() {
  console.log('Starting user migration...');

  // 1. Create Mahmoud.Kamal
  const username = "Mahmoud.Kamal";
  let user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        username,
        passwordHash: hashPassword('MMK007'),
        height: 175,
      }
    });
    console.log('Created user:', user.username);
  } else {
    console.log('User already exists:', user.username);
  }

  // 2. Add Initial Weight Log
  const initialWeight = 96.6;
  const existingWeight = await prisma.weightLog.findFirst({
    where: { userId: user.id }
  });

  if (!existingWeight) {
    await prisma.weightLog.create({
      data: {
        userId: user.id,
        weight: initialWeight,
        date: new Date()
      }
    });
    console.log('Created initial weight log: 96.6 kg');
  }

  // 3. Migrate all existing WorkoutSessions, RoutineDays, and ExerciseConfigs to this user
  // In MongoDB, newly added fields might not exist, so { userId: null } might not match them.
  // We will just update ALL records to belong to this user.
  
  const allSessions = await prisma.workoutSession.findMany();
  for (const session of allSessions) {
    await prisma.workoutSession.update({ where: { id: session.id }, data: { userId: user.id } });
  }
  console.log(`Updated ${allSessions.length} WorkoutSessions to belong to ${username}`);

  const allDays = await prisma.routineDay.findMany();
  for (const day of allDays) {
    await prisma.routineDay.update({ where: { id: day.id }, data: { userId: user.id } });
  }
  console.log(`Updated ${allDays.length} RoutineDays to belong to ${username}`);

  const allExercises = await prisma.exerciseConfig.findMany();
  for (const ex of allExercises) {
    await prisma.exerciseConfig.update({ where: { id: ex.id }, data: { userId: user.id } });
  }
  console.log(`Updated ${allExercises.length} ExerciseConfigs to belong to ${username}`);

  console.log('Migration completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
