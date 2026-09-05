import { axiosInstance } from '@/libraries/axios';
import { TOrder, TCreateOrderResponse } from '@/models/order.model';

export const createOrder = async (
  cartItemIds: string[],
): Promise<TCreateOrderResponse> => {
  const response = await axiosInstance().post('/orders', { cartItemIds });
  return {
    order: response.data?.order as TOrder,
    snapToken: response.data?.snapToken ?? null,
    redirectUrl: response.data?.redirectUrl ?? null,
    paymentInitError: response.data?.paymentInitError ?? false,
  };
};

export const fetchOrders = async (
  page: number = 1,
  limit: number = 10,
): Promise<{
  orders: TOrder[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const response = await axiosInstance().get('/orders', {
    params: { page, limit },
  });
  return {
    orders: (response.data?.orders || []) as TOrder[],
    total: response.data?.total ?? 0,
    page: response.data?.page ?? page,
    totalPages: response.data?.totalPages ?? 1,
  };
};

export const fetchOrderById = async (id: string): Promise<TOrder> => {
  const response = await axiosInstance().get(`/orders/${id}`);
  return response.data?.order as TOrder;
};

export const retryOrderPayment = async (
  id: string,
): Promise<{ snapToken: string; redirectUrl: string }> => {
  const response = await axiosInstance().post(`/orders/${id}/retry-payment`);
  return {
    snapToken: response.data?.snapToken as string,
    redirectUrl: response.data?.redirectUrl as string,
  };
};

export const fetchAdminOrders = async (
  page: number = 1,
  limit: number = 10,
  status?: string,
): Promise<{
  orders: TOrder[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const response = await axiosInstance().get('/orders/admin', {
    params: { page, limit, status },
  });
  return {
    orders: (response.data?.orders || []) as TOrder[],
    total: response.data?.total ?? 0,
    page: response.data?.page ?? page,
    totalPages: response.data?.totalPages ?? 1,
  };
};

export const shipOrder = async (id: string): Promise<TOrder> => {
  const response = await axiosInstance().patch(`/orders/${id}/ship`);
  return response.data?.order as TOrder;
};

export const cancelOrder = async (id: string): Promise<TOrder> => {
  const response = await axiosInstance().patch(`/orders/${id}/cancel`);
  return response.data?.order as TOrder;
};

export const completeOrder = async (id: string): Promise<TOrder> => {
  const response = await axiosInstance().patch(`/orders/${id}/complete`);
  return response.data?.order as TOrder;
};

export const submitOrderReturn = async (
  id: string,
  reason: string,
): Promise<TOrder> => {
  const response = await axiosInstance().patch(`/orders/${id}/return`, {
    reason,
  });
  return response.data?.order as TOrder;
};
