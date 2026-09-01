import { axiosInstance } from '@/libraries/axios';
import { TOrder, TCreateOrderResponse } from '@/models/order.model';

export const createOrder = async (): Promise<TCreateOrderResponse> => {
  const response = await axiosInstance().post('/orders');
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
