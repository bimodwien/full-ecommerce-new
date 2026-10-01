import { useState } from 'react';
import { toast } from 'sonner';
import { useAppDispatch } from '@/libraries/redux/hooks';
import { logout } from '@/libraries/redux/slices/auth.slice';

export function useSidebarLogout() {
  const dispatch = useAppDispatch();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    try {
      setIsLoggingOut(true);
      const toastId = toast.loading('Logging out...');
      setTimeout(() => {
        toast.success('Logged out successfully', { id: toastId });
        // Navigate, then clear auth state to avoid a UI flicker.
        // Full page load on purpose: the seller cookie is still set at this
        // point, and proxy.ts's role routing only runs on a real server
        // request. See the same note in login-page.tsx.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = '/';
        dispatch(logout());
      }, 600);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return { isLoggingOut, handleLogout };
}
