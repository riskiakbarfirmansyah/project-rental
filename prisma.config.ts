import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // DIRECT_URL dipakai untuk prisma migrate/db push (bypass pooler)
    // Jika tidak ada DIRECT_URL, gunakan DATABASE_URL sebagai fallback
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
  },
});