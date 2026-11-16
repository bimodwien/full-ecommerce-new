import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!, // your database
});

const prisma = new PrismaClient({
    adapter,
    // Query logs are useful in dev but would flood the production logs.
    log:
        process.env.NODE_ENV === 'production'
            ? ['warn', 'error']
            : ['query', 'info', 'warn', 'error'],
});

export default prisma;
