import React from 'react';
import { Mail } from 'lucide-react';

const NewsLetter = () => {
  return (
    <section className="relative w-full rounded-[30px] bg-[#3BB77E] px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16 overflow-hidden">
      {/* Decorative watermark background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <svg
          viewBox="0 0 1200 400"
          className="absolute left-0 top-0 h-full w-full text-white/10"
          fill="none"
        >
          <g stroke="currentColor" strokeWidth="2">
            <circle cx="150" cy="80" r="60" />
            <circle cx="200" cy="120" r="30" />
            <path d="M980 60c40 0 72 32 72 72s-32 72-72 72-72-32-72-72 32-72 72-72Z" />
            <rect x="1040" y="180" width="120" height="80" rx="20" />
            <path d="M60 300c60-40 120-40 180 0" />
          </g>
        </svg>
      </div>

      <div className="relative z-10 grid items-center gap-8 lg:grid-cols-2">
        {/* Left: Copy */}
        <div className="text-white">
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-snug sm:leading-tight lg:leading-[56px]"
            style={{ fontFamily: 'var(--font-quicksand)' }}
          >
            Stay home & get your fashion needs from our shop
          </h2>
          <p className="mt-3 sm:mt-4 text-white/80 text-base sm:text-lg leading-normal">
            Start Your Fashion & Tech Shopping with TokoPakBimo
          </p>

          {/* Email form */}
          <form
            className="relative mt-5 w-full max-w-[520px]"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="relative h-12 rounded-full bg-white pl-12 pr-36 sm:pr-44 shadow-lg">
              <Mail className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
              <input
                type="email"
                required
                aria-label="Your email address"
                placeholder="Your email address"
                className="h-full w-full rounded-full bg-transparent pr-2 text-sm sm:text-base text-zinc-700 placeholder:text-zinc-400 focus:outline-none"
              />
              {/* Subscribe button overlapping on the right */}
              <button
                type="submit"
                className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 inline-flex h-12 sm:h-12 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 sm:px-6 text-sm sm:text-base font-semibold text-white shadow-lg ring-1 ring-white/60 hover:from-emerald-600 hover:to-emerald-700 focus:outline-none z-10"
              >
                Subscribe
              </button>
            </div>
          </form>
        </div>

        {/* Right: Visual area (placeholder floating veggies/person) */}
        <div className="relative hidden lg:block">
          {/* Main placeholder figure */}
          <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 right-6 h-64 w-64 rounded-2xl bg-white/10" />
          {/* Floating circles as placeholders for veggies */}
          <div className="absolute right-60 top-6 h-10 w-10 rounded-full bg-white/20" />
          <div className="absolute right-40 top-24 h-14 w-14 rounded-full bg-white/20" />
          <div className="absolute right-24 top-40 h-12 w-12 rounded-full bg-white/20" />
        </div>
      </div>
    </section>
  );
};

export default NewsLetter;
