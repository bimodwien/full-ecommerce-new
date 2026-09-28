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
import { TOrder } from '@/models/order.model';
import { OrderTrackingActions } from './use-order-tracking-actions';

function CancelDescription({ selected }: { selected: TOrder | null }) {
  const siblings = (selected?.Payment?._count.Orders ?? 1) - 1;
  return (
    <AlertDialogDescription>
      This closes the payment window for
      {selected ? ` "${selected.id}"` : ' this order'} and returns its stock.
      The buyer will no longer be able to pay for it. This action cannot be
      undone.
      {selected && siblings > 0 && (
        <>
          {' '}
          The buyer checked out this order together with {siblings} order(s)
          from other sellers in one payment, so those will be cancelled too.
        </>
      )}
    </AlertDialogDescription>
  );
}

export default function CancelOrderDialog({
  actions,
}: {
  actions: OrderTrackingActions;
}) {
  const { selected, cancellingId } = actions;
  return (
    <AlertDialog
      open={selected !== null}
      onOpenChange={(open) =>
        !cancellingId && !open && actions.setSelected(null)
      }
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel order</AlertDialogTitle>
          <CancelDescription selected={selected} />
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={cancellingId !== null}>
            Keep order
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            onClick={actions.confirmCancel}
            disabled={cancellingId !== null}
          >
            {cancellingId ? 'Cancelling…' : 'Cancel order'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
