import { OrderStatus } from '@prisma/client';
import { TUser } from './user.model';
import { TOrderItem } from './orderItem.model';

export type TOrder = {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: string;
  createdAt: Date;
  updatedAt: Date;
  user?: TUser;
  OrderItems?: TOrderItem[];
};
