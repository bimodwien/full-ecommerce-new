import { Badge } from '@/components/ui/badge';
import { OrderStatus } from '@/models/order.model';

const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
  switch (status) {
    case 'PENDING':
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          Pending
        </Badge>
      );
    case 'PAID':
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          Paid
        </Badge>
      );
    case 'SHIPPED':
      return (
        <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">
          Shipped
        </Badge>
      );
    case 'COMPLETED':
      return (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
          Completed
        </Badge>
      );
    case 'CANCELLED':
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          Cancelled
        </Badge>
      );
    case 'RETURNED':
      return (
        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
          Returned
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default OrderStatusBadge;
