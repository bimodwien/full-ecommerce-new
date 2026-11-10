import prisma from '../../src/prisma';
import names from './data/categories.json';

// Returns category name -> id so products can refer to a category by name.
export default async function seedCategories() {
  const ids = new Map<string, string>();
  for (const name of names) {
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    ids.set(name, category.id);
  }
  return ids;
}
