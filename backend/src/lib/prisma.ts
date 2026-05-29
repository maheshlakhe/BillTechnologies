import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
  var readPrisma: PrismaClient | undefined
}

// Main client for writes
const prisma = globalThis.prisma || new PrismaClient({
  log: ['error', 'warn'],
});

// Secondary client for reads (Read Replica)
const readPrisma = globalThis.readPrisma || new PrismaClient({
  log: ['error'],
  datasourceUrl: process.env.READ_REPLICA_URL || process.env.DATABASE_URL
});

// --- GLOBAL FIX: BigInt Serialization ---
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

/**
 * Optimize SQLite for concurrent access.
 */
async function setupSQLite(client: PrismaClient, label: string) {
  try {
    await client.$queryRawUnsafe('PRAGMA journal_mode=WAL;').catch(() => {});
    await client.$queryRawUnsafe('PRAGMA synchronous=NORMAL;').catch(() => {});
    await client.$queryRawUnsafe('PRAGMA busy_timeout=30000;').catch(() => {});
    console.log(`[Prisma] ${label} optimized: WAL mode enabled, busy_timeout=30s.`);
  } catch (e) {
    // Silence error if DB is not SQLite or already locked
  }
}

// Initialize both clients
setupSQLite(prisma, 'WRITE-CLIENT');
setupSQLite(readPrisma, 'READ-CLIENT');

if (process.env.NODE_ENV === 'development') {
  globalThis.prisma = prisma;
  globalThis.readPrisma = readPrisma;
}

export const db = prisma; // Alias for default use
export const readDb = readPrisma;
export default prisma;
