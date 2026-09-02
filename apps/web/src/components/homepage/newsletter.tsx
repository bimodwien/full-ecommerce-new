import React from 'react';
import { Mail } from 'lucide-react';

const NewsLetter = () => {
  return (
    <section className="relative w-full rounded-none bg-ink px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16 overflow-hidden">
      <div className="max-w-2xl text-canvas">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium leading-snug sm:leading-tight lg:leading-11">
          Stay home &amp; get your fashion needs from our shop
        </h2>
        <p className="mt-3 sm:mt-4 text-canvas/70 text-base sm:text-lg leading-normal">
          Start Your Fashion &amp; Tech Shopping with TokoPakBimo
        </p>

        {/* Email form */}
        <form
          className="relative mt-5 w-full max-w-130"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <div className="relative h-12 rounded-3xl bg-canvas pl-12 pr-36 sm:pr-44">
            <Mail className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-mute" />
            <input
              type="email"
              required
              aria-label="Your email address"
              placeholder="Your email address"
              className="h-full w-full rounded-3xl bg-transparent pr-2 text-sm sm:text-base text-ink placeholder:text-mute focus:outline-none"
            />
            {/* Subscribe button overlapping on the right */}
            <button
              type="submit"
              className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 inline-flex h-12 items-center justify-center rounded-full bg-soft-cloud px-5 sm:px-6 text-sm sm:text-base font-medium text-ink active:scale-95 active:opacity-80 hover:bg-hairline-soft focus:outline-none z-10"
            >
              Subscribe
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default NewsLetter;
