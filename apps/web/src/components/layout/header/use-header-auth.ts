import { useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/libraries/redux/hooks';
import { logout } from '@/libraries/redux/slices/auth.slice';
import type { AppDispatch } from '@/libraries/redux/store';

const emptySubscribe = () => () => {};

function logoutAndRedirect(dispatch: AppDispatch) {
  dispatch(logout());
  toast.success('Logged out');
  setTimeout(() => {
    // Full page load on purpose — see the note in auth/use-login-form.ts.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = '/login';
  }, 500);
}

// Login state, badge counts, and logout for the header.
export function useHeaderAuth() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const auth = useAppSelector((s) => s.auth);
  const wishlistCount = useAppSelector((s) => s.wishlist.count);
  const cartCount = useAppSelector((s) => s.cart.count);
  const dispatch = useAppDispatch();
  const router = useRouter();

  // isLoggedIn derived from Redux auth; gated on `mounted` so the first
  // client render always matches the server (hydration-safe), even if
  // AuthProvider's auth check resolves before this component hydrates.
  const isLoggedIn = mounted && Boolean(auth?.id && auth.id !== '');

  // Wishlist/Cart need a session; warn instead of navigating when logged out.
  const goProtected = (path: string, label: string) => {
    if (!isLoggedIn) {
      toast.warning(`You must be logged in to access ${label}.`);
      return;
    }
    router.push(path);
  };

  const handleLogout = () => logoutAndRedirect(dispatch);

  return {
    isLoggedIn,
    // Same reason for the badge counts: Redux only has them after the client
    // hydrates, so the server always renders 0 (no badge).
    wishlistCount: mounted ? wishlistCount : 0,
    cartCount: mounted ? cartCount : 0,
    shortName: (auth?.username ?? 'User').slice(0, 4),
    goProtected,
    handleLogout,
  };
}

export type HeaderAuth = ReturnType<typeof useHeaderAuth>;
