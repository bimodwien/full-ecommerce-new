import { useState } from 'react';
import { toast } from 'sonner';
import { shipOrder, cancelOrder } from '@/helpers/fetch-order';
import { TOrder } from '@/models/order.model';

type Messages = { loading: string; success: string; failure: string };

const SHIP_MESSAGES: Messages = {
  loading: 'Marking as shipped…',
  success: 'Order marked as shipped',
  failure: 'Failed to update order',
};

const CANCEL_MESSAGES: Messages = {
  loading: 'Cancelling order…',
  success: 'Order cancelled, stock returned',
  failure: 'Failed to cancel order',
};

// toast.promise() resolves to a toast handle, not the request's value, so
// keep the request itself to get the updated order back.
async function runWithToast(
  request: Promise<TOrder>,
  msg: Messages,
  onOrderUpdated?: (order: TOrder) => void,
) {
  toast.promise(request, {
    loading: msg.loading,
    success: msg.success,
    error: (err) => err?.response?.data?.message || msg.failure,
  });
  onOrderUpdated?.(await request);
}

// Marks a row busy while `work` runs; failures were already toasted.
async function whileBusy(
  setBusyId: (id: string | null) => void,
  id: string,
  work: () => Promise<void>,
) {
  setBusyId(id);
  try {
    await work();
  } catch {
    // toast.promise already surfaced the failure
  } finally {
    setBusyId(null);
  }
}

// Ship and cancel actions for the seller's order tracking table.
export function useOrderTrackingActions(
  onOrderUpdated?: (order: TOrder) => void,
) {
  const [shippingId, setShippingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<TOrder | null>(null);

  const handleShip = (id: string) =>
    whileBusy(setShippingId, id, () =>
      runWithToast(shipOrder(id), SHIP_MESSAGES, onOrderUpdated),
    );

  const confirmCancel = async () => {
    if (!selected) return;
    await whileBusy(setCancellingId, selected.id, async () => {
      await runWithToast(
        cancelOrder(selected.id),
        CANCEL_MESSAGES,
        onOrderUpdated,
      );
      setSelected(null);
    });
  };

  return {
    shippingId,
    cancellingId,
    selected,
    setSelected,
    handleShip,
    confirmCancel,
  };
}

export type OrderTrackingActions = ReturnType<typeof useOrderTrackingActions>;
