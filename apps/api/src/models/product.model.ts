import { TUser } from './user.model';
import { TCategory } from './category.model';
import { TProductImage } from './productImage.model';
import { TProductVariant } from './productVariant.model';
import { TWishlist } from './wishlist.model';
import { TCart } from './cart.model';
import { TOrderItem } from './orderItem.model';

export type TProduct = {
  id: string;
  name: string;
  description?: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  sellerId: string;
  seller?: TUser;
  categoryId?: string;
  Category?: TCategory;
  Images?: TProductImage[];
  Variants?: TProductVariant[];
  Wishlist?: TWishlist[];
  Cart?: TCart[];
  OrderItems?: TOrderItem[];
};
