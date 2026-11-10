import prisma from '../../src/prisma';
import { hashPassword } from '../../src/libs/bcrypt';

function requireEnv(key: string) {
  const value = process.env[key];
  if (!value) throw new Error(`${key} is not set in .env`);
  return value;
}

export default async function seedSeller() {
  const email = requireEnv('SEED_SELLER_EMAIL');
  const password = requireEnv('SEED_SELLER_PASSWORD');

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;

  return prisma.user.create({
    data: {
      name: 'Admin',
      username: 'admin',
      email,
      password: await hashPassword(password),
      role: 'seller',
    },
  });
}
