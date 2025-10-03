import React from 'react';
import { Mail } from 'lucide-react';

const Heroes = () => {
  return (
    <section className="relative w-full rounded-[30px] bg-[#FFF2D9] px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16 overflow-hidden">
      {/* Decorative watermark background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <svg
          viewBox="0 0 800 400"
          className="absolute right-0 top-1/2 h-[120%] -translate-y-1/2 text-zinc-600/10"
          fill="none"
        >
          <g stroke="currentColor" strokeWidth="2">
            {/* Abstract device card */}
            <rect x="560" y="80" width="160" height="110" rx="16" ry="16" />
            <rect x="575" y="95" width="130" height="8" rx="4" />
            <rect x="575" y="115" width="90" height="8" rx="4" />
            <rect x="575" y="135" width="110" height="8" rx="4" />

            {/* Concentric circles */}
            <circle cx="720" cy="260" r="36" />
            <circle cx="720" cy="260" r="60" />

            {/* Dotted connection line */}
            <path
              d="M500 300c40-20 80-10 120 10s80 30 120 10"
              strokeDasharray="4 8"
            />

            {/* Small accent dots */}
            <circle cx="560" cy="250" r="4" />
            <circle cx="590" cy="270" r="4" />
            <circle cx="610" cy="240" r="4" />
          </g>
        </svg>
      </div>

      <div className="max-w-3xl">
        <h1
          className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-snug sm:leading-[56px] lg:leading-[72px] text-slate-700"
          style={{ fontFamily: 'var(--font-quicksand)' }}
        >
          Don&apos;t miss the latest
          <br className="hidden sm:block" />
          <span className="sm:hidden"> </span>
          fashion & tech drops
        </h1>

        <p className="mt-4 sm:mt-6 text-base sm:text-xl text-zinc-500 leading-normal">
          Sign up for the daily newsletter
        </p>

        <form
          className="relative mt-6 w-full max-w-[440px]"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="relative h-12 rounded-full bg-white shadow ring-1 ring-zinc-200 pl-12 pr-36 sm:pr-44">
            <Mail className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <input
              type="email"
              placeholder="Your email address"
              className="h-full w-full rounded-full bg-transparent pr-2 text-sm sm:text-base text-zinc-700 placeholder-zinc-400 outline-none"
            />
            <button
              type="submit"
              aria-label="Subscribe to newsletter"
              className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 inline-flex h-12 sm:h-12 items-center justify-center rounded-full bg-emerald-500 px-5 sm:px-6 text-sm sm:text-base font-medium text-white shadow-lg ring-1 ring-white/60 hover:bg-emerald-600"
            >
              Subscribe
            </button>
          </div>
        </form>
      </div>

      {/* Pager dots - center across the full hero */}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex items-center justify-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden />
        <span
          className="h-2.5 w-2.5 rounded-full border border-zinc-400"
          aria-hidden
        />
      </div>
    </section>
  );
};

export default Heroes;
