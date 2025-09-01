import prisma from '@/prisma';

class ProductService {
  static async getProductsByCategory(categoryId: string) {
    return prisma.product.findMany({
      where: { categoryId },
    });
  }
}

export default ProductService;
