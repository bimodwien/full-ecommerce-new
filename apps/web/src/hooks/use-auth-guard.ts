'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAppSelector } from '@/libraries/redux/hooks';

export function useAuthGuard(message: string): boolean {
  const auth = useAppSelector((s) => s.auth);
  const router = useRouter();

  useEffect(() => {
    if (auth.initialized && !auth.id) {
      toast.warning(message);
      router.replace('/login');
    }
  }, [auth.initialized, auth.id, router, message]);

  return auth.initialized && Boolean(auth.id);
}

// These two mirror the role rules in proxy.ts. The server-side copy only runs
// on real HTTP requests, so client-side navigation (a <Link>, the back button)
// slips past it — hence the same checks again here.

export function useSellerOnly(): boolean {
  const auth = useAppSelector((s) => s.auth);
  const router = useRouter();

  useEffect(() => {
    if (!auth.initialized) return;
    if (!auth.id) {
      router.replace('/login');
    } else if (auth.role !== 'seller') {
      router.replace('/');
    }
  }, [auth.initialized, auth.id, auth.role, router]);

  return auth.initialized && Boolean(auth.id) && auth.role === 'seller';
}

export function useGuestOnly(): boolean {
  const auth = useAppSelector((s) => s.auth);
  const router = useRouter();

  useEffect(() => {
    if (auth.initialized && auth.id) {
      router.replace(auth.role === 'seller' ? '/dashboard' : '/');
    }
  }, [auth.initialized, auth.id, auth.role, router]);

  return auth.initialized && !auth.id;
}
