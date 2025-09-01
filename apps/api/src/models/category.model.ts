import { TProduct } from './product.model';

export type TCategory = {
  id: string;
  name: string;
  Product?: TProduct[];
};
