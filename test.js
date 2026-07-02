const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); async function main() { const days = await prisma.routineDay.findMany(); console.log(days); } main();  
