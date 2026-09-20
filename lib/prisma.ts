import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

let prismaClient: PrismaClient;

if (!globalForPrisma.prisma) {
  const rawUrl = process.env.DATABASE_URL || "";

  // Parse postgres://user:password@host:port/database
  const match = rawUrl.match(/postgres(?:ql)?:\/\/([^:]+):([^@]+)@([^/:]+)(?::(\d+))?\/([^?]+)/);

  let pool: Pool;
  if (match) {
    const [, user, password, rawHost, port, database] = match;
    const host = rawHost.includes("neon.tech") ? rawHost.replace("-pooler.", ".") : rawHost;
    pool = new Pool({
      user,
      password,
      host,
      port: port ? parseInt(port, 10) : 5432,
      database,
      ssl: host.includes("neon.tech") ? { rejectUnauthorized: false } : undefined,
      connectionTimeoutMillis: 15000,
      idleTimeoutMillis: 30000,
    });
  } else {
    pool = new Pool({
      connectionString: rawUrl || "postgresql://placeholder_user:placeholder_password@localhost:5432/placeholder_db",
      ssl: rawUrl.includes("neon.tech") ? { rejectUnauthorized: false } : undefined,
    });
  }

  const adapter = new PrismaPg(pool);
  prismaClient = new PrismaClient({ adapter });
} else {
  prismaClient = globalForPrisma.prisma;
}

export const prisma = prismaClient;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
