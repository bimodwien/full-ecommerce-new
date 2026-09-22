'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  userLogin,
  googleLogin,
} from '@/libraries/redux/middlewares/auth.middleware';
import { useAppDispatch } from '@/libraries/redux/hooks';
import { toast } from 'sonner';
import Image from 'next/image';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

function LoginPage() {
  const dispatch = useAppDispatch();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [googleButtonWidth, setGoogleButtonWidth] = useState(384);
  const initialValues = {
    username: '',
    password: '',
  };

  useEffect(() => {
    const el = googleButtonRef.current;
    if (!el) return;
    // Google Identity Services caps the button width at 400px.
    const updateWidth = () =>
      setGoogleButtonWidth(Math.min(el.offsetWidth, 400));
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);
  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object().shape({
      username: Yup.string().required('Username is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: async (values) => {
      const id = toast.loading('Authenticating...');
      try {
        const result = await dispatch(
          userLogin({
            username: values.username,
            password: values.password,
          }),
        );
        // If no error thrown we assume success
        toast.success('Login success', { id });
        // small delay so the toast is visible before navigating
        setTimeout(() => {
          // Must be a full page load, not router.replace: the role-based
          // routing lives in proxy.ts, which only runs on a real server
          // request. Client-side nav can be served from the router cache,
          // leaving sellers stranded on '/' instead of '/dashboard'.
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.href = '/';
        }, 1000);
      } catch (error: any) {
        let errorMessage = 'Login failed. Please try again.';
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error?.message) {
          errorMessage = error.message;
        }
        toast.error(errorMessage, { id });
      }
    },
  });

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse,
  ) => {
    const id = toast.loading('Authenticating...');
    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential returned from Google');
      }
      await dispatch(googleLogin(credentialResponse.credential));
      toast.success('Login success', { id });
      setTimeout(() => {
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
  };

  return (
    <div className="min-h-screen flex text-zinc-700">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-emerald-500/10 to-emerald-500/5 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <Image
            src="/logo.png"
            alt="TokoPakBimo - Premium Sneakers Collection"
            className="w-full h-auto mb-8"
            width={500}
            height={500}
          />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to{' '}
            <Link href="/" className="text-emerald-600 cursor-pointer">
              TokoPakBimo
            </Link>
          </h2>
          <p className="text-zinc-700 text-lg leading-relaxed">
            Discover our premium fashion items with authentic quality and
            unbeatable prices.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Sign in to{' '}
              <Link href="/" className="text-emerald-600 cursor-pointer">
                TokoPakBimo
              </Link>
            </h1>
            <p className="text-zinc-700">
              Welcome back! Please enter your details.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Username Input */}
            <div className="relative">
              <input
                type="text"
                className="peer w-full h-12 text-base border border-zinc-300 rounded-lg outline-none px-4 bg-white placeholder-transparent focus:border-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                placeholder=" "
                id="username"
                {...formik.getFieldProps('username')}
                required
              />
              <label
                htmlFor="username"
                className="absolute left-4 top-1/2 -translate-y-1/2 px-1 bg-white text-zinc-700 text-base transition-all duration-300 pointer-events-none
                           peer-focus:-top-2 peer-focus:left-3 peer-focus:translate-y-0 peer-focus:text-emerald-600 peer-focus:text-xs peer-focus:font-medium
                           peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:left-3 peer-not-placeholder-shown:translate-y-0 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:font-medium"
              >
                Username
              </label>
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type="password"
                className="peer w-full h-12 text-sm border border-zinc-300 rounded-lg outline-none px-4 bg-white placeholder-transparent focus:border-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                placeholder=" "
                id="password"
                {...formik.getFieldProps('password')}
                required
              />
              <label
                htmlFor="password"
                className="absolute left-4 top-1/2 -translate-y-1/2 px-1 bg-white text-zinc-700 text-base transition-all duration-300 pointer-events-none
                           peer-focus:-top-2 peer-focus:left-3 peer-focus:translate-y-0 peer-focus:text-emerald-600 peer-focus:text-xs peer-focus:font-medium
                           peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:left-3 peer-not-placeholder-shown:translate-y-0 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:font-medium"
              >
                Password
              </label>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 rounded"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
            >
              Sign In
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-zinc-700">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <div ref={googleButtonRef} className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google sign-in failed.')}
                shape="rectangular"
                width={googleButtonWidth}
              />
            </div>
          </form>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-zinc-700">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-200"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
