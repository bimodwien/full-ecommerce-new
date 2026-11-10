import 'dotenv/config';
import prisma from '../../src/prisma';
import seedSeller from './seedSeller';
import seedCategories from './seedCategories';
import seedProducts from './seedProducts';

async function main() {
  const seller = await seedSeller();
  const categories = await seedCategories();
  await seedProducts(seller.id, categories);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
