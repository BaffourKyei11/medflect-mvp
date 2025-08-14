// Lazy runtime require to avoid compile-time type dependency on @prisma/client
let prisma: any = null;

export const getPrisma = () => {
  if (!prisma) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
  }
  return prisma as any;
};

export type DB = any;
