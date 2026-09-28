'use client';
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TOrder } from '@/models/order.model';
import OrderTrackingRow from './order-tracking-row';
import CancelOrderDialog from './cancel-order-dialog';
import { useOrderTrackingActions } from './use-order-tracking-actions';

interface OrderTrackingTableProps {
  orders: TOrder[];
  onOrderUpdated?: (order: TOrder) => void;
}

const OrderTrackingTable = ({
  orders,
  onOrderUpdated,
}: OrderTrackingTableProps) => {
  const actions = useOrderTrackingActions(onOrderUpdated);
  const [now] = useState(() => Date.now());

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
            {orders.map((order) => (
              <OrderTrackingRow
                key={order.id}
                order={order}
                actions={actions}
                now={now}
              />
            ))}
          </TableBody>
        </Table>
      </div>
      <CancelOrderDialog actions={actions} />
    </div>
  );
};

export default OrderTrackingTable;
