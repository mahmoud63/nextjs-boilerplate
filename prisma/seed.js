const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding dummy data...");

  // Delete all existing data first to start fresh
  await prisma.exerciseLog.deleteMany({});
  await prisma.workoutSession.deleteMany({});
  
  const dayName = "Chest & Triceps"; // Matches Day 1
  const exercises = [
    { name: "Flat Barbell Bench Press", targetSets: 3 },
    { name: "Incline Dumbbell Press", targetSets: 3 },
    { name: "Decline Bench Press", targetSets: 3 },
    { name: "Pec Deck Fly", targetSets: 3 },
    { name: "V-Bar Pushdowns", targetSets: 3 },
    { name: "Cable Tricep Extensions Overhead", targetSets: 3 },
    { name: "Reverse Grip Push Downs", targetSets: 3 }
  ];

  // Create data for the last 4 weeks (Once a week for Day 1)
  for (let i = 4; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - (i * 7));
    date.setHours(0, 0, 0, 0);

    const session = await prisma.workoutSession.create({
      data: {
        date: date,
        dayName: dayName,
        isCompleted: true,
      }
    });

    for (const ex of exercises) {
      // Simulate weight increasing over time
      const baseWeight = ex.name.includes("Press") ? 60 : 30;
      const progressiveWeight = baseWeight + ((4 - i) * 2.5); // Increase weight slightly each week

      const setsData = [];
      for(let s = 1; s <= ex.targetSets; s++) {
        setsData.push({
          setNumber: s,
          weight: progressiveWeight,
          reps: 12 - (s - 1) // 12, 11, 10
        });
      }

      await prisma.exerciseLog.create({
        data: {
          workoutSessionId: session.id,
          exerciseName: ex.name,
          date: date,
          sets: setsData
        }
      });
    }
    console.log(`Created session for ${date.toDateString()}`);
  }

  console.log("Dummy data seeding complete!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
