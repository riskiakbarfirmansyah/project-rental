const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
require("dotenv").config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  
  try {
    const userCount = await prisma.user.count();
    console.log("User count:", userCount);
  } catch (err) {
    console.error("Prisma error:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
