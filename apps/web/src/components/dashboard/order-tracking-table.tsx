'use client';
import React, { useState } from 'react';
import { formatIDR } from '@/lib/utils';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
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
import { toast } from 'sonner';
import { shipOrder, cancelOrder } from '@/helpers/fetch-order';
import { TOrder } from '@/models/order.model';
import OrderStatusBadge from '@/components/order/order-status-badge';

// Mirrors CANCELLABLE_AFTER_MS in the API; the server is the real gatekeeper,
// this only keeps the button from offering an action that would be rejected.
const CANCELLABLE_AFTER_MS = 24 * 60 * 60 * 1000;

interface OrderTrackingTableProps {
  orders: TOrder[];
  onOrderUpdated?: (order: TOrder) => void;
}

const OrderTrackingTable = ({
  orders,
  onOrderUpdated,
}: OrderTrackingTableProps) => {
  const [shippingId, setShippingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<TOrder | null>(null);

  const handleShip = async (id: string) => {
    setShippingId(id);
    try {
      // toast.promise() resolves to a toast handle, not the request's value,
      // so keep the request itself to get the updated order back.
      const request = shipOrder(id);
      toast.promise(request, {
        loading: 'Marking as shipped…',
        success: 'Order marked as shipped',
        error: (err) =>
          err?.response?.data?.message || 'Failed to update order',
      });
      onOrderUpdated?.(await request);
    } catch {
      // toast.promise already surfaced the failure
    } finally {
      setShippingId(null);
    }
  };

  const confirmCancel = async () => {
    if (!selected) return;
    const id = selected.id;
    setCancellingId(id);
    try {
      const request = cancelOrder(id);
      toast.promise(request, {
        loading: 'Cancelling order…',
        success: 'Order cancelled, stock returned',
        error: (err) =>
          err?.response?.data?.message || 'Failed to cancel order',
      });
      onOrderUpdated?.(await request);
      setSelected(null);
    } catch {
      // toast.promise already surfaced the failure
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden text-zinc-700">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-40">Order ID</TableHead>
              <TableHead className="hidden sm:table-cell">Buyer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="hidden md:table-cell">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="w-32">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const totalAmount =
                typeof order.totalAmount === 'string'
                  ? Number(order.totalAmount)
                  : order.totalAmount;
              const itemCount = (order.OrderItems || []).reduce(
                (acc, item) => acc + item.quantity,
                0,
              );
              const canCancel =
                Date.now() - new Date(order.createdAt).getTime() >=
                CANCELLABLE_AFTER_MS;

              return (
                <TableRow key={order.id}>
                  <TableCell>
                    <span className="font-medium text-sm truncate block max-w-40">
                      {order.id}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="min-w-0">
                      <span className="block truncate">
                        {order.user?.name || '-'}
                      </span>
                      <span className="text-xs text-zinc-500 block truncate">
                        {order.user?.email || ''}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{itemCount}</TableCell>
                  <TableCell className="font-medium hidden md:table-cell">
                    {formatIDR(totalAmount)}
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(order.createdAt).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    {order.status === 'PAID' && (
                      <Button
                        size="sm"
                        onClick={() => handleShip(order.id)}
                        disabled={shippingId === order.id}
                      >
                        {shippingId === order.id
                          ? 'Processing…'
                          : 'Mark as Shipped'}
                      </Button>
                    )}
                    {order.status === 'PENDING' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setSelected(order)}
                        disabled={!canCancel || cancellingId === order.id}
                        title={
                          canCancel
                            ? undefined
                            : 'Can be cancelled 24 hours after the order was created'
                        }
                      >
                        {cancellingId === order.id ? 'Processing…' : 'Cancel'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Cancel confirmation dialog */}
      <AlertDialog
        open={selected !== null}
        onOpenChange={(open) => !cancellingId && !open && setSelected(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel order</AlertDialogTitle>
            <AlertDialogDescription>
              This closes the payment window for
              {selected ? ` "${selected.id}"` : ' this order'} and returns its
              stock. The buyer will no longer be able to pay for it. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancellingId !== null}>
              Keep order
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmCancel}
              disabled={cancellingId !== null}
            >
              {cancellingId ? 'Cancelling…' : 'Cancel order'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrderTrackingTable;
