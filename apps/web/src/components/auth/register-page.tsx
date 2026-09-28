'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useGuestOnly } from '@/hooks/use-auth-guard';
import AuthShell, { AuthSwitchLink } from './auth-shell';
import GoogleSignIn from './google-sign-in';
import { RoleField, TextFields } from './register-fields';
import { useRegisterForm } from './use-register-form';

function RegisterHeading() {
  return (
    <>
      <div className="flex items-center space-x-2">
        <Link
          href="/login"
          className="flex items-center text-emerald-600 hover:text-emerald-700 hover:underline transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 rounded"
        >
          <span className="text-lg mr-2">←</span>
          <span className="text-sm font-medium">Back to login</span>
        </Link>
      </div>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create Account
        </h1>
        <p className="text-zinc-700">Join TokoPakBimo and start shopping!</p>
      </div>
    </>
  );
}

function RegisterPage() {
  const allowed = useGuestOnly();
  const { formik, submitError, isSubmitting } = useRegisterForm();

  if (!allowed) return null;

  return (
    <AuthShell
      greeting="Join"
      blurb="Create your account and start exploring premium sneakers and fashion items today."
    >
      <RegisterHeading />

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {submitError && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {submitError}
          </div>
        )}
        <TextFields formik={formik} />
        <RoleField formik={formik} />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
        >
          {isSubmitting ? 'Processing...' : 'Create Account'}
        </Button>
        <GoogleSignIn />
      </form>

      <AuthSwitchLink
        prompt="Already have an account?"
        href="/login"
        label="Sign in here"
      />
    </AuthShell>
  );
}

export default RegisterPage;
