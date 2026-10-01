'use client';
import React from 'react';
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
import { TOrder } from '@/models/order.model';
import { useOrderReturn } from './use-order-return';

interface OrderReturnDialogProps {
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (order: TOrder) => void;
}

const OrderReturnDialog = (props: OrderReturnDialogProps) => {
  const { open, onOpenChange } = props;
  const { reason, setReason, pending, handleSubmit } = useOrderReturn(props);

  return (
    <AlertDialog open={open} onOpenChange={(o) => !pending && onOpenChange(o)}>
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
