import React from 'react';
import { Mail } from 'lucide-react';

const Heroes = () => {
  return (
    <section className="relative w-full rounded-none bg-soft-cloud px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16 overflow-hidden">
      <div className="max-w-3xl">
        <h1 className="campaign-headline text-[32px] tablet-narrow:text-[40px] desktop-small:text-[48px] text-ink">
          Don&apos;t miss the latest
          <br />
          fashion &amp; tech drops
        </h1>

        <p className="mt-4 sm:mt-6 text-base sm:text-xl text-mute leading-normal">
          Sign up for the daily newsletter
        </p>

        <form
          className="relative mt-6 w-full max-w-110"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="relative h-12 rounded-3xl bg-canvas border-2 border-transparent pl-12 pr-36 sm:pr-44 focus-within:border-ink focus-within:ring-4 focus-within:ring-soft-cloud transition-colors">
            <Mail className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-mute" />
            <input
              type="email"
              placeholder="Your email address"
              className="h-full w-full rounded-3xl bg-transparent pr-2 text-sm sm:text-base text-ink placeholder-mute outline-none"
            />
            <button
              type="submit"
              aria-label="Subscribe to newsletter"
              className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 inline-flex h-12 items-center justify-center rounded-full bg-ink px-5 sm:px-6 text-sm sm:text-base font-medium text-canvas active:scale-95 active:opacity-80 hover:bg-ink/90"
            >
              Subscribe
            </button>
          </div>
        </form>
      </div>

      {/* Pager dots - center across the full hero */}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex items-center justify-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-ink" aria-hidden />
        <span
          className="h-2.5 w-2.5 rounded-full border border-hairline"
          aria-hidden
        />
      </div>
    </section>
  );
};

export default Heroes;
