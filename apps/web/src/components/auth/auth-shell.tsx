import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

type Props = {
  greeting: string; // "Welcome to" / "Join"
  blurb: string;
  children: React.ReactNode;
};

// Two-column auth layout: brand panel on the left, form on the right.
export default function AuthShell({ greeting, blurb, children }: Props) {
  return (
    <div className="min-h-screen flex text-zinc-700">
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
            {greeting}{' '}
            <Link href="/" className="text-emerald-600 cursor-pointer">
              TokoPakBimo
            </Link>
          </h2>
          <p className="text-zinc-700 text-lg leading-relaxed">{blurb}</p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">{children}</div>
      </div>
    </div>
  );
}

type SwitchProps = { prompt: string; href: string; label: string };

// "Don't have an account? Sign up" style footer link.
export function AuthSwitchLink({ prompt, href, label }: SwitchProps) {
  return (
    <div className="text-center">
      <p className="text-sm text-zinc-700">
        {prompt}{' '}
        <Link
          href={href}
          className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-200"
        >
          {label}
        </Link>
      </p>
    </div>
  );
}
