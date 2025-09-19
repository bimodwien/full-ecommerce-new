'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import Link from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch } from '@/libraries/redux/hooks';
import { userRegister } from '@/libraries/redux/middlewares/auth.middleware';

function RegisterPage() {
  const dispatch = useAppDispatch();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      try {
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
          window.location.href = '/login';
        }
      } catch (error: any) {
        const message =
          error?.response?.data?.message || error?.message || 'Register failed';
        setSubmitError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#15AD39]/10 to-[#15AD39]/5 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <img
            src="/logo.png"
            alt="TokoPakBimo - Premium Sneakers Collection"
            className="w-full h-auto mb-8"
          />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Join{' '}
            <Link href="/" className="text-[#15AD39] cursor-pointer">
              TokoPakBimo
            </Link>
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
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
              className="flex items-center text-[#15AD39] hover:text-[#15AD39]/80 transition-colors duration-200"
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
            <p className="text-gray-600">
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
                  className="peer w-full h-12 text-base border border-gray-300 rounded-lg outline-none px-4 bg-white placeholder-transparent focus:border-2 focus:border-[#15AD39] transition-all duration-300"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="name"
                  className="absolute left-4 top-1/2 -translate-y-1/2 px-1 bg-white text-gray-500 text-base transition-all duration-300 pointer-events-none
                             peer-focus:top-[-8px] peer-focus:left-3 peer-focus:translate-y-0 peer-focus:text-[#15AD39] peer-focus:text-xs peer-focus:font-medium
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
                  className="peer w-full h-12 text-base border border-gray-300 rounded-lg outline-none px-4 bg-white placeholder-transparent focus:border-2 focus:border-[#15AD39] transition-all duration-300"
                  placeholder=" "
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
                  className="peer w-full h-12 text-base border border-gray-300 rounded-lg outline-none px-4 bg-white placeholder-transparent focus:border-2 focus:border-[#15AD39] transition-all duration-300"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="email"
                  className="absolute left-4 top-1/2 -translate-y-1/2 px-1 bg-white text-gray-500 text-base transition-all duration-300 pointer-events-none
                             peer-focus:top-[-8px] peer-focus:left-3 peer-focus:translate-y-0 peer-focus:text-[#15AD39] peer-focus:text-xs peer-focus:font-medium
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
                  className="peer w-full h-12 text-base border border-gray-300 rounded-lg outline-none px-4 bg-white placeholder-transparent focus:border-2 focus:border-[#15AD39] transition-all duration-300"
                  placeholder=" "
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
                          ? 'bg-[#15AD39] border-[#15AD39]'
                          : 'border-gray-300 bg-transparent'
                      }`}
                    >
                      {formik.values.role === 'buyer' && (
                        <div className="w-full h-full rounded-full bg-[#15AD39] flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-900">Buyer</span>
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
                          ? 'bg-[#15AD39] border-[#15AD39]'
                          : 'border-gray-300 bg-transparent'
                      }`}
                    >
                      {formik.values.role === 'seller' && (
                        <div className="w-full h-full rounded-full bg-[#15AD39] flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-900">Seller</span>
                </label>
              </div>
            </div>

            {/* Sign Up Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-[#15AD39] hover:bg-[#15AD39]/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-300"
            >
              {isSubmitting ? 'Processing...' : 'Create Account'}
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

            {/* Google Sign Up Button */}
            <Button
              type="button"
              variant="outline"
              //   onClick={handleGoogleSignUp}
              className="w-full h-12 border-gray-300 hover:bg-[#15AD39]/10 hover:border-[#15AD39] hover:text-[#15AD39] transition-all duration-300 bg-transparent"
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
              Sign up with Google
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-[#15AD39] hover:text-[#15AD39]/80 font-medium transition-colors duration-200"
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
