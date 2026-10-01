import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  fetchOrderById,
  retryOrderPayment,
  completeOrder,
} from '@/helpers/fetch-order';
import { TOrder } from '@/models/order.model';

// Reuse the order's Snap token if it has one, else ask the API for one,
// then open the Midtrans popup. Reloads the order once paid or pending.
async function openPayment(order: TOrder, reload: () => void) {
  let token = order.Payment?.snapToken;
  if (!token) {
    const result = await retryOrderPayment(order.id);
    token = result.snapToken;
  }
  if (!window.snap || !token) {
    toast.error('Payment is not ready yet, please try again.');
    return;
  }
  window.snap.pay(token, {
    onSuccess: () => {
      toast.success('Payment successful.');
      reload();
    },
    onPending: () => {
      toast.info('Payment pending.');
      reload();
    },
    onError: () => toast.error('Payment failed.'),
    onClose: () => toast.warning('Payment closed.'),
  });
}

function useOrder(orderId: string) {
  const [order, setOrder] = useState<TOrder | null>(null);
  const [loading, setLoading] = useState(true);
  // Bumped by loadOrder to re-run the fetch effect.
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setOrder(await fetchOrderById(orderId));
      } catch {
        toast.error('Failed to load order.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId, reloadKey]);
  const loadOrder = useCallback(() => setReloadKey((key) => key + 1), []);
  return { order, setOrder, loading, loadOrder };
}

function useCompleteOrder(
  order: TOrder | null,
  setOrder: (order: TOrder) => void,
) {
  const [completing, setCompleting] = useState(false);
  const handleComplete = useCallback(async () => {
    if (!order) return;
    setCompleting(true);
    try {
      setOrder(await completeOrder(order.id));
      toast.success('Order completed.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to complete order.');
    } finally {
      setCompleting(false);
    }
  }, [order, setOrder]);
  return { completing, handleComplete };
}

export function useOrderDetail(orderId: string) {
  const { order, setOrder, loading, loadOrder } = useOrder(orderId);
  const [paying, setPaying] = useState(false);
  const [snapReady, setSnapReady] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const { completing, handleComplete } = useCompleteOrder(order, setOrder);

  const handlePayNow = useCallback(async () => {
    if (!order) return;
    setPaying(true);
    try {
      await openPayment(order, loadOrder);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Failed to initialize payment.',
      );
    } finally {
      setPaying(false);
    }
  }, [order, loadOrder]);

  return {
    order,
    setOrder,
    loading,
    paying,
    snapReady,
    setSnapReady,
    completing,
    returnDialogOpen,
    setReturnDialogOpen,
    handlePayNow,
    handleComplete,
  };
}

export type OrderDetailState = ReturnType<typeof useOrderDetail>;
