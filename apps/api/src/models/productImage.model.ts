import { TProduct } from './product.model';

export type TProductImage = {
  id: string;
  data: Buffer;
  isPrimary: boolean;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
  Product?: TProduct;
};
