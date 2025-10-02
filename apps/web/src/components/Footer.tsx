import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
} from 'lucide-react';

const COL_CLASS = 'space-y-3';

const companyLinks = [
  'About Us',
  'Delivery Information',
  'Privacy Policy',
  'Terms & Conditions',
  'Contact Us',
  'Support Center',
  'Careers',
];

const accountLinks = [
  'Sign In',
  'View Cart',
  'My Wishlist',
  'Track My Order',
  'Help Ticket',
  'Shipping Details',
  'Compare products',
];

const corporateLinks = [
  'Become a Vendor',
  'Affiliate Program',
  'Farm Business',
  'Farm Careers',
  'Our Suppliers',
  'Accessibility',
  'Promotions',
];

const popularLinks = [
  'Milk & Flavoured Milk',
  'Butter and Margarine',
  'Eggs Substitutes',
  'Marmalades',
  'Sour Cream and Dips',
  'Tea & Kombucha',
  'Cheese',
];

const Footer = () => {
  return (
    <footer className="mt-12 border-t border-zinc-200 bg-white text-sm text-zinc-600">
      <div className="mx-auto max-w-screen-2xl px-4 py-10">
        {/* Top grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          {/* Brand + contact (span 2 on lg) */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="TokoPakBimo Logo"
                width={40}
                height={40}
              />
              <span
                className="text-2xl font-semibold text-gray-900"
                style={{ fontFamily: 'var(--font-bebas-neue)' }}
              >
                TokoPakBimo
              </span>
            </Link>
            <p className="mt-3 max-w-md text-zinc-600">
              Awesome grocery store website template
            </p>

            <ul className="mt-4 space-y-2 text-zinc-600">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <MapPin className="h-4 w-4" />
                </span>
                <div>
                  <span className="text-zinc-400">Address: </span>
                  5171 W Campbell Ave, Kent, Utah 53127
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Phone className="h-4 w-4" />
                </span>
                <div>
                  <span className="text-zinc-400">Call Us: </span>
                  (+62) 540-025-124553
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Mail className="h-4 w-4" />
                </span>
                <div>
                  <span className="text-zinc-400">Email: </span>
                  sale@tokopakbimo.com
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Clock className="h-4 w-4" />
                </span>
                <div>
                  <span className="text-zinc-400">Hours: </span>
                  10:00 - 18:00, Mon - Sat
                </div>
              </li>
            </ul>
          </div>

          {/* Columns */}
          <div className={COL_CLASS}>
            <h4 className="text-zinc-800 font-semibold">Company</h4>
            <ul className="space-y-2">
              {companyLinks.map((item) => (
                <li key={item}>
                  <Link href="#" className="hover:text-emerald-600">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={COL_CLASS}>
            <h4 className="text-zinc-800 font-semibold">Account</h4>
            <ul className="space-y-2">
              {accountLinks.map((item) => (
                <li key={item}>
                  <Link href="#" className="hover:text-emerald-600">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={COL_CLASS}>
            <h4 className="text-zinc-800 font-semibold">Corporate</h4>
            <ul className="space-y-2">
              {corporateLinks.map((item) => (
                <li key={item}>
                  <Link href="#" className="hover:text-emerald-600">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={COL_CLASS}>
            <h4 className="text-zinc-800 font-semibold">Popular</h4>
            <ul className="space-y-2">
              {popularLinks.map((item) => (
                <li key={item}>
                  <Link href="#" className="hover:text-emerald-600">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t border-zinc-200 pt-6">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-zinc-500">
              © {new Date().getFullYear()},{' '}
              <Link href="#" className="text-emerald-600 hover:underline">
                TokoPakBimo
              </Link>{' '}
              — All rights reserved
            </p>

            {/* Phones */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Phone className="h-5 w-5" />
                </span>
                <div className="leading-tight">
                  <div className="text-lg font-extrabold text-emerald-600">
                    1900 - 6666
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Working 8:00 - 22:00
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Phone className="h-5 w-5" />
                </span>
                <div className="leading-tight">
                  <div className="text-lg font-extrabold text-emerald-600">
                    1900 - 8888
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    24/7 Support Center
                  </div>
                </div>
              </div>
            </div>

            {/* Socials */}
            <div className="ml-auto flex items-center gap-3 md:ml-0">
              <div className="text-sm font-semibold text-zinc-700">
                Follow Us
              </div>
              <ul className="flex items-center gap-2">
                <li>
                  <Link
                    href="#"
                    aria-label="Follow on Facebook"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                  >
                    <Facebook className="h-4 w-4" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    aria-label="Follow on Twitter"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                  >
                    <Twitter className="h-4 w-4" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    aria-label="Follow on Instagram"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                  >
                    <Instagram className="h-4 w-4" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    aria-label="Follow on YouTube"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                  >
                    <Youtube className="h-4 w-4" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    aria-label="Follow on LinkedIn"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                  >
                    <Linkedin className="h-4 w-4" />
                  </Link>
                </li>
              </ul>
              <div className="hidden text-[11px] text-zinc-400 sm:block">
                Up to 15% discount on your first subscribe
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
