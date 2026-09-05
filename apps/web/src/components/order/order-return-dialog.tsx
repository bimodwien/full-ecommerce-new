'use client';
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { submitOrderReturn } from '@/helpers/fetch-order';
import { TOrder } from '@/models/order.model';

interface OrderReturnDialogProps {
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (order: TOrder) => void;
}

const OrderReturnDialog = ({
  orderId,
  open,
  onOpenChange,
  onSuccess,
}: OrderReturnDialogProps) => {
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

  return (
    <AlertDialog
      open={open}
      onOpenChange={(o) => !pending && onOpenChange(o)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Submit return</AlertDialogTitle>
          <AlertDialogDescription>
            Tell us why you want to return this order. This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Textarea
          placeholder="Reason for return..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={pending}
          maxLength={500}
        />
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-none" disabled={pending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="rounded-none"
            onClick={handleSubmit}
            disabled={pending}
          >
            {pending ? 'Submitting…' : 'Submit Return'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OrderReturnDialog;
