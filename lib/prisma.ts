import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

let prismaClient: PrismaClient;

if (!globalForPrisma.prisma) {
  const connectionString = process.env.DATABASE_URL;
  
  if (connectionString) {
    const pool = new Pool({ 
      connectionString,
      ssl: connectionString.includes("neon.tech") ? { rejectUnauthorized: false } : undefined
    });
    const adapter = new PrismaPg(pool);
    prismaClient = new PrismaClient({ adapter });
  } else {
    // If DATABASE_URL is not set yet, instantiate PrismaClient without adapter 
    // (it will fail gracefully when queries are made rather than crashing imports)
    prismaClient = new PrismaClient();
  }
} else {
  prismaClient = globalForPrisma.prisma;
}

export const prisma = prismaClient;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
