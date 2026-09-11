'use client';

import React from 'react';
import { useSellerOnly } from '@/hooks/use-auth-guard';

export function SellerGate({ children }: { children: React.ReactNode }) {
  return useSellerOnly() ? <>{children}</> : null;
}
