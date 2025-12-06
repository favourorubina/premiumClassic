import type { PrismaClient as PrismaClientType } from '@prisma/client';

const { PrismaClient } = require('@prisma/client') as any;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClientType };

export const prisma: PrismaClientType =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
