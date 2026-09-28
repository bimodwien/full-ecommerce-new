import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiPhone } from 'react-icons/fi';
import { handleNotAvailable } from '../not-available';
import { CONTACTS, HOTLINES, SOCIALS } from './footer-data';

const ICON_CIRCLE_CLASS =
  'inline-flex h-6 w-6 items-center justify-center rounded-full bg-soft-cloud text-ink';

// Logo, tagline, and contact details (spans two grid columns).
export function BrandBlock() {
  return (
    <div className="col-span-2">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/logo.png" alt="TokoPakBimo Logo" width={40} height={40} />
        <span
          className="text-2xl font-semibold text-ink"
          style={{ fontFamily: 'var(--font-bebas-neue)' }}
        >
          TokoPakBimo
        </span>
      </Link>
      <p className="mt-3 max-w-md text-mute">
        Awesome tech & Fashion store website
      </p>
      <ul className="mt-4 space-y-2 text-mute">
        {CONTACTS.map(({ icon: Icon, label, value }) => (
          <li key={label} className="flex items-start gap-2">
            <span className={`mt-0.5 ${ICON_CIRCLE_CLASS}`}>
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <span className="text-stone">{label}: </span>
              {value}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LinkColumn({
  title,
  links,
}: {
  title: string;
  links: string[];
}) {
  return (
    <div className="space-y-3">
      <h4 className="text-ink font-semibold">{title}</h4>
      <ul className="space-y-2">
        {links.map((item) => (
          <li key={item}>
            <Link
              href="#"
              className="hover:text-ink"
              onClick={handleNotAvailable}
            >
              {item}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Hotlines() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      {HOTLINES.map(({ number, note }) => (
        <div key={number} className="flex items-center gap-2">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-soft-cloud text-ink">
            <FiPhone className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <div className="text-lg font-extrabold text-ink">{number}</div>
            <div className="text-[11px] text-stone">{note}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Socials() {
  return (
    <div className="ml-auto flex items-center gap-3 md:ml-0">
      <div className="text-sm font-semibold text-ink">Follow Us</div>
      <ul className="flex items-center gap-2">
        {SOCIALS.map(({ icon: Icon, label, href }) => (
          <li key={label}>
            <Link
              href={href ?? '#'}
              aria-label={`Follow on ${label}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-soft-cloud text-ink hover:bg-hairline-soft"
              onClick={href ? undefined : handleNotAvailable}
            >
              <Icon className="h-4 w-4" />
            </Link>
          </li>
        ))}
      </ul>
      <div className="hidden text-[11px] text-stone sm:block">
        Up to 15% discount on your first subscribe
      </div>
    </div>
  );
}
