import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

function parseDbUrl(url: string) {
  // mysql://user:pass@host:port/database
  try {
    const u = new URL(url);
    return {
      host: u.hostname,
      port: u.port ? parseInt(u.port) : 3306,
      user: u.username || "root",
      password: u.password || "",
      database: u.pathname.slice(1),
    };
  } catch {
    return { host: "localhost", port: 3306, user: "root", password: "", database: "rental_db" };
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const dbConfig = parseDbUrl(process.env.DATABASE_URL || "mysql://root:@localhost:3306/rental_db");
  const adapter = new PrismaMariaDb(dbConfig);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
