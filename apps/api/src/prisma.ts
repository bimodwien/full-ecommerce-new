import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!, // your database
});

const prisma = new PrismaClient({
    adapter,
    log: ['query', 'info', 'warn', 'error'],
});

export default prisma;
