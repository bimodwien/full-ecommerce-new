import { useState } from 'react';
import { toast } from 'sonner';
import { submitOrderReturn } from '@/helpers/fetch-order';
import { TOrder } from '@/models/order.model';

interface OrderReturnOptions {
  orderId: string;
  onOpenChange: (open: boolean) => void;
  onSuccess: (order: TOrder) => void;
}

export function useOrderReturn({
  orderId,
  onOpenChange,
  onSuccess,
}: OrderReturnOptions) {
  const [reason, setReason] = useState('');
  const [pending, setPending] = useState(false);

  const handleSubmit = async () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      toast.error('Please provide a reason for the return.');
      return;
    }
    setPending(true);
    try {
      // toast.promise() resolves to a toast handle, not the request's value,
      // so keep the request itself to get the updated order back.
      const request = submitOrderReturn(orderId, trimmed);
      toast.promise(request, {
        loading: 'Submitting return…',
        success: 'Return submitted',
        error: (err) =>
          err?.response?.data?.message || 'Failed to submit return',
      });
      onSuccess(await request);
      setReason('');
      onOpenChange(false);
    } catch {
      // toast.promise already surfaced the failure
    } finally {
      setPending(false);
    }
  };

  return { reason, setReason, pending, handleSubmit };
}
