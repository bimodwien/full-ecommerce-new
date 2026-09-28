'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import AuthShell, { AuthSwitchLink } from './auth-shell';
import FloatingInput from './floating-input';
import GoogleSignIn from './google-sign-in';
import { useLoginForm } from './use-login-form';

function LoginFields({ formik }: { formik: ReturnType<typeof useLoginForm> }) {
  return (
    <>
      <FloatingInput
        id="username"
        label="Username"
        type="text"
        {...formik.getFieldProps('username')}
        required
      />
      <FloatingInput
        id="password"
        label="Password"
        type="password"
        className="text-sm"
        {...formik.getFieldProps('password')}
        required
      />
      <div className="flex justify-end">
        <button
          type="button"
          className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 rounded"
        >
          Forgot password?
        </button>
      </div>
      <Button
        type="submit"
        className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
      >
        Sign In
      </Button>
    </>
  );
}

function LoginPage() {
  const formik = useLoginForm();

  return (
    <AuthShell
      greeting="Welcome to"
      blurb="Discover our premium fashion items with authentic quality and unbeatable prices."
    >
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

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <LoginFields formik={formik} />
        <GoogleSignIn />
      </form>

      <AuthSwitchLink
        prompt="Don't have an account?"
        href="/register"
        label="Sign up for free"
      />
    </AuthShell>
  );
}

export default LoginPage;
