import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { interviewPrisma?: PrismaClient };

export const prisma = globalForPrisma.interviewPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.interviewPrisma = prisma;
}
