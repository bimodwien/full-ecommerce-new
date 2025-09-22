'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { userLogin } from '@/libraries/redux/middlewares/auth.middleware';
import { useAppDispatch } from '@/libraries/redux/hooks';
import { toast } from 'sonner';
import Image from 'next/image';

function LoginPage() {
  const dispatch = useAppDispatch();
  const initialValues = {
    username: '',
    password: '',
  };
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
        window.location.href = '/';
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

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#15AD39]/10 to-[#15AD39]/5 items-center justify-center p-12">
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
            <Link href="/" className="text-[#15AD39] cursor-pointer">
              TokoPakBimo
            </Link>
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
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
              Sign in to TokoPakBimo
            </h1>
            <p className="text-gray-600">
              Welcome back! Please enter your details.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Username Input */}
            <div className="relative">
              <input
                type="text"
                className="peer w-full h-12 text-base border border-gray-300 rounded-lg outline-none px-4 bg-white placeholder-transparent focus:border-2 focus:border-[#15AD39] transition-all duration-300"
                placeholder=" "
                id="username"
                {...formik.getFieldProps('username')}
                required
              />
              <label
                htmlFor="username"
                className="absolute left-4 top-1/2 -translate-y-1/2 px-1 bg-white text-gray-500 text-base transition-all duration-300 pointer-events-none
                           peer-focus:top-[-8px] peer-focus:left-3 peer-focus:translate-y-0 peer-focus:text-[#15AD39] peer-focus:text-xs peer-focus:font-medium
                           peer-[&:not(:placeholder-shown)]:top-[-8px] peer-[&:not(:placeholder-shown)]:left-3 peer-[&:not(:placeholder-shown)]:translate-y-0 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:font-medium"
              >
                Username
              </label>
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type="password"
                className="peer w-full h-12 text-base border border-gray-300 rounded-lg outline-none px-4 bg-white placeholder-transparent focus:border-2 focus:border-[#15AD39] transition-all duration-300"
                placeholder=" "
                id="password"
                {...formik.getFieldProps('password')}
                required
              />
              <label
                htmlFor="password"
                className="absolute left-4 top-1/2 -translate-y-1/2 px-1 bg-white text-gray-500 text-base transition-all duration-300 pointer-events-none
                           peer-focus:top-[-8px] peer-focus:left-3 peer-focus:translate-y-0 peer-focus:text-[#15AD39] peer-focus:text-xs peer-focus:font-medium
                           peer-[&:not(:placeholder-shown)]:top-[-8px] peer-[&:not(:placeholder-shown)]:left-3 peer-[&:not(:placeholder-shown)]:translate-y-0 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:font-medium"
              >
                Password
              </label>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-[#15AD39] hover:text-[#15AD39]/80 transition-colors duration-200"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-[#15AD39] hover:bg-[#15AD39]/90 text-white font-medium rounded-lg transition-all duration-300 cursor-pointer"
            >
              Sign In
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <Button
              type="button"
              variant="outline"
              //   onClick={handleGoogleSignIn}
              className="w-full h-12 border-gray-300 hover:bg-[#15AD39]/10 hover:border-[#15AD39] hover:text-[#15AD39] transition-all duration-300 bg-transparent cursor-pointer"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="text-[#15AD39] hover:text-[#15AD39]/80 font-medium transition-colors duration-200"
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
