import { TOrder } from './order.model';
import { TProduct } from './product.model';
import { TProductVariant } from './productVariant.model';

export type TOrderItem = {
  id: string;
  orderId: string;
  productId?: string;
  variantId?: string;
  quantity: number;
  price: string;
  createdAt: Date;
  updatedAt: Date;
  order?: TOrder;
  Product?: TProduct;
  Variant?: TProductVariant;
};
