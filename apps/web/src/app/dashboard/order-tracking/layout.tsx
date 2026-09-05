import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Tracking',
  description: 'Track and manage customer orders',
};

export default function OrderTrackingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
