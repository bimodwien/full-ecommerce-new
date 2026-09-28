'use client';
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface OrderTrackingFilterProps {
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

const OrderTrackingFilter = ({
  statusFilter,
  onStatusChange,
}: OrderTrackingFilterProps) => {
  return (
    <div className="bg-white rounded-lg border border-zinc-200 p-4 mb-6 text-zinc-700">
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="PAID">Paid</SelectItem>
          <SelectItem value="SHIPPED">Shipped</SelectItem>
          <SelectItem value="COMPLETED">Completed</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
          <SelectItem value="RETURNED">Returned</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default OrderTrackingFilter;
