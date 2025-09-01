import { TProduct } from './product.model';
import { TWishlist } from './wishlist.model';
import { TCart } from './cart.model';
import { TOrderItem } from './orderItem.model';

export type TProductVariant = {
  id: string;
  variant: string;
  stock: number;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
  Product?: TProduct;
  Wishlist?: TWishlist[];
  Cart?: TCart[];
  OrderItem?: TOrderItem[];
};
