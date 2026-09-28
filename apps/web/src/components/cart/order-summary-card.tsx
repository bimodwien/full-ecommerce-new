import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatIDR } from '@/lib/utils';

type Props = {
  itemsLabel: string;
  totalItems: number;
  totalPrice: number;
  action: React.ReactNode;
};

// Sticky "Order Summary" box shared by the cart and checkout pages.
export default function OrderSummaryCard(props: Props) {
  return (
    <div className="w-full lg:w-72 shrink-0">
      <Card className="sticky top-4">
        <CardContent className="p-5 bg-soft-cloud">
          <h2 className="text-lg font-medium text-ink mb-4">Order Summary</h2>
          <div className="flex justify-between text-sm text-mute mb-2">
            <span>{props.itemsLabel}</span>
            <span>{props.totalItems} items</span>
          </div>
          <Separator className="my-3" />
          <div className="flex justify-between font-medium text-ink">
            <span>Total</span>
            <span>{formatIDR(props.totalPrice)}</span>
          </div>
          {props.action}
        </CardContent>
      </Card>
    </div>
  );
}
