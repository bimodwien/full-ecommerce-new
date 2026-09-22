'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import Link from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch } from '@/libraries/redux/hooks';
import {
  userRegister,
  googleLogin,
} from '@/libraries/redux/middlewares/auth.middleware';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useGuestOnly } from '@/hooks/use-auth-guard';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

function RegisterPage() {
  const allowed = useGuestOnly();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [googleButtonWidth, setGoogleButtonWidth] = useState(384);

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

  const initialValues = {
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'buyer' as 'buyer' | 'seller',
  };

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object().shape({
      name: Yup.string().required('Name is required'),
      username: Yup.string().required('Username is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      password: Yup.string().required('Password is required'),
      role: Yup.string().required('Role is required'),
    }),
    onSubmit: async (values) => {
      setSubmitError(null);
      setIsSubmitting(true);
      let toastId: string | number | undefined;
      try {
        toastId = toast.loading('Creating your account...');
        const result = await dispatch(
          // @ts-ignore - depending on thunk typing
          userRegister({
            name: values.name,
            username: values.username,
            email: values.email,
            password: values.password,
            role: values.role,
          }),
        );
        const payload: any = result;
        if (payload?.success) {
          toast.success('Registration successful. Please sign in.', {
            id: toastId,
          });
          router.push('/login');
        } else {
          toast.error('Register failed', { id: toastId });
        }
      } catch (error: any) {
        // Extract backend error message(s)
        let message: string = 'Register failed';
        const data = error?.response?.data;
        if (typeof data?.message === 'string') {
          message = data.message;
        } else if (typeof data?.error === 'string') {
          message = data.error;
        } else if (Array.isArray(data?.errors)) {
          message = data.errors.join(', ');
        } else if (data && typeof data === 'object') {
          // Handle possible field error map { field: message }
          const parts = Object.values(data)
            .filter((v) => typeof v === 'string')
            .slice(0, 3) as string[];
          if (parts.length) message = parts.join(', ');
        } else if (error?.message) {
          message = error.message;
        }
        if (toastId !== undefined) {
          toast.error(message, { id: toastId });
        } else {
          toast.error(message);
        }
        setSubmitError(message);
      } finally {
        setIsSubmitting(false);
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

  if (!allowed) return null;

  return (
    <div className="min-h-screen flex text-zinc-700">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <Image
            src="/logo.png"
            alt="TokoPakBimo - Premium Sneakers Collection"
            className="w-full h-auto mb-8"
            width={500}
            height={500}
          />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Join{' '}
            <Link href="/" className="text-emerald-600 cursor-pointer">
              TokoPakBimo
            </Link>
          </h2>
          <p className="text-zinc-700 text-lg leading-relaxed">
            Create your account and start exploring premium sneakers and fashion
            items today.
          </p>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Back to Login Link */}
          <div className="flex items-center space-x-2">
            <Link
              href="/login"
              className="flex items-center text-emerald-600 hover:text-emerald-700 hover:underline transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 rounded"
            >
              <span className="text-lg mr-2">←</span>
              <span className="text-sm font-medium">Back to login</span>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Account
            </h1>
            <p className="text-zinc-700">
              Join TokoPakBimo and start shopping!
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {submitError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                {submitError}
              </div>
            )}
            {/* Name Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="peer w-full h-12 text-base border border-zinc-300 rounded-lg outline-none px-4 bg-white placeholder-transparent focus:border-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="name"
                  className="absolute left-4 top-1/2 -translate-y-1/2 px-1 bg-white text-zinc-700 text-base transition-all duration-300 pointer-events-none
                             peer-focus:top-[-8px] peer-focus:left-3 peer-focus:translate-y-0 peer-focus:text-emerald-600 peer-focus:text-xs peer-focus:font-medium
                             peer-[&:not(:placeholder-shown)]:top-[-8px] peer-[&:not(:placeholder-shown)]:left-3 peer-[&:not(:placeholder-shown)]:translate-y-0 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:font-medium"
                >
                  Full Name
                </label>
              </div>
            </div>

            {/* Username Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="peer w-full h-12 text-base border border-zinc-300 rounded-lg outline-none px-4 bg-white placeholder-transparent focus:border-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="username"
                  className="absolute left-4 top-1/2 -translate-y-1/2 px-1 bg-white text-zinc-700 text-base transition-all duration-300 pointer-events-none
                             peer-focus:top-[-8px] peer-focus:left-3 peer-focus:translate-y-0 peer-focus:text-emerald-600 peer-focus:text-xs peer-focus:font-medium
                             peer-[&:not(:placeholder-shown)]:top-[-8px] peer-[&:not(:placeholder-shown)]:left-3 peer-[&:not(:placeholder-shown)]:translate-y-0 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:font-medium"
                >
                  Username
                </label>
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="peer w-full h-12 text-base border border-zinc-300 rounded-lg outline-none px-4 bg-white placeholder-transparent focus:border-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="email"
                  className="absolute left-4 top-1/2 -translate-y-1/2 px-1 bg-white text-zinc-700 text-base transition-all duration-300 pointer-events-none
                             peer-focus:top-[-8px] peer-focus:left-3 peer-focus:translate-y-0 peer-focus:text-emerald-600 peer-focus:text-xs peer-focus:font-medium
                             peer-[&:not(:placeholder-shown)]:top-[-8px] peer-[&:not(:placeholder-shown)]:left-3 peer-[&:not(:placeholder-shown)]:translate-y-0 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:font-medium"
                >
                  Email Address
                </label>
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="peer w-full h-12 text-base border border-zinc-300 rounded-lg outline-none px-4 bg-white placeholder-transparent focus:border-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="password"
                  className="absolute left-4 top-1/2 -translate-y-1/2 px-1 bg-white text-zinc-700 text-base transition-all duration-300 pointer-events-none
                             peer-focus:top-[-8px] peer-focus:left-3 peer-focus:translate-y-0 peer-focus:text-emerald-600 peer-focus:text-xs peer-focus:font-medium
                             peer-[&:not(:placeholder-shown)]:top-[-8px] peer-[&:not(:placeholder-shown)]:left-3 peer-[&:not(:placeholder-shown)]:translate-y-0 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:font-medium"
                >
                  Password
                </label>
              </div>
            </div>

            {/* Role Selection - Radio Buttons */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">
                Role
              </label>
              <div className="flex items-center space-x-8">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <div className="relative">
                    <input
                      type="radio"
                      name="role"
                      value="buyer"
                      checked={formik.values.role === 'buyer'}
                      onChange={() => formik.setFieldValue('role', 'buyer')}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                        formik.values.role === 'buyer'
                          ? 'bg-emerald-600 border-emerald-600'
                          : 'border-zinc-300 bg-transparent'
                      }`}
                    >
                      {formik.values.role === 'buyer' && (
                        <div className="w-full h-full rounded-full bg-emerald-600 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-zinc-700">Buyer</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <div className="relative">
                    <input
                      type="radio"
                      name="role"
                      value="seller"
                      checked={formik.values.role === 'seller'}
                      onChange={() => formik.setFieldValue('role', 'seller')}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                        formik.values.role === 'seller'
                          ? 'bg-emerald-600 border-emerald-600'
                          : 'border-zinc-300 bg-transparent'
                      }`}
                    >
                      {formik.values.role === 'seller' && (
                        <div className="w-full h-full rounded-full bg-emerald-600 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-zinc-700">Seller</span>
                </label>
              </div>
            </div>

            {/* Sign Up Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
            >
              {isSubmitting ? 'Processing...' : 'Create Account'}
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

            {/* Google Sign Up Button */}
            <div ref={googleButtonRef} className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google sign-in failed.')}
                shape="rectangular"
                width={googleButtonWidth}
              />
            </div>
          </form>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-sm text-zinc-700">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-200"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
