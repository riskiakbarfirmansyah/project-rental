import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // DIRECT_URL dipakai untuk prisma migrate/db push (bypass pooler)
    // DATABASE_URL (pooler) dipakai oleh PrismaClient di runtime via adapter
    url: env("DIRECT_URL"),
  },
});