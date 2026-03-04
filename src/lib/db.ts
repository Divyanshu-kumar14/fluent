/**
 * Prisma Client Singleton
 *
 * Initialises a PrismaClient backed by the PostgreSQL adapter (`@prisma/adapter-pg`).
 * In development, the client is cached on `globalThis` so that hot-module reloading
 * does not create multiple database connections.
 */

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { env } from "./env";

// Use the native PostgreSQL adapter for Prisma (driver-based access)
const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

// Cache the Prisma instance on globalThis to survive HMR in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export { prisma }