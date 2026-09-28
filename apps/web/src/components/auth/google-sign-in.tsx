'use client';

import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAppDispatch } from '@/libraries/redux/hooks';
import { googleLogin } from '@/libraries/redux/middlewares/auth.middleware';
import type { AppDispatch } from '@/libraries/redux/store';

// Google Identity Services caps the button width at 400px, so size it to
// the container ourselves.
function useButtonWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(384);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const updateWidth = () => setWidth(Math.min(el.offsetWidth, 400));
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);
  return { ref, width };
}

function OrDivider() {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-zinc-200" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-white px-2 text-zinc-700">Or continue with</span>
      </div>
    </div>
  );
}

async function signInWithGoogle(
  dispatch: AppDispatch,
  credentialResponse: CredentialResponse,
) {
  const id = toast.loading('Authenticating...');
  try {
    if (!credentialResponse.credential) {
      throw new Error('No credential returned from Google');
    }
    await dispatch(googleLogin(credentialResponse.credential));
    toast.success('Login success', { id });
    setTimeout(() => {
      // Full page load on purpose — see the note in use-login-form.ts.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = '/';
    }, 1000);
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Google sign-in failed. Please try again.';
    toast.error(errorMessage, { id });
  }
}

// "Or continue with" divider plus the Google button, shared by login/register.
export default function GoogleSignIn() {
  const dispatch = useAppDispatch();
  const { ref, width } = useButtonWidth();

  const handleSuccess = (res: CredentialResponse) =>
    signInWithGoogle(dispatch, res);

  return (
    <>
      <OrDivider />
      <div ref={ref} className="w-full flex justify-center">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => toast.error('Google sign-in failed.')}
          shape="rectangular"
          width={width}
        />
      </div>
    </>
  );
}
