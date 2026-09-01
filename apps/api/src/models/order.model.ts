import { OrderStatus } from '@prisma/client';
import { TUser } from './user.model';
import { TOrderItem } from './orderItem.model';

export type TOrder = {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: string;
  midtransOrderId?: string | null;
  snapToken?: string | null;
  snapRedirectUrl?: string | null;
  paymentType?: string | null;
  transactionStatus?: string | null;
  paidAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user?: TUser;
  OrderItems?: TOrderItem[];
};
