import React from 'react';
import Link from 'next/link';
import { handleNotAvailable } from './not-available';
import { LINK_COLUMNS } from './footer/footer-data';
import {
  BrandBlock,
  Hotlines,
  LinkColumn,
  Socials,
} from './footer/footer-parts';

const Footer = () => {
  return (
    <footer className="mt-12 border-t border-hairline bg-canvas text-sm text-mute">
      <div className="mx-auto max-w-screen-2xl px-4 py-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          <BrandBlock />
          {LINK_COLUMNS.map((col) => (
            <LinkColumn key={col.title} title={col.title} links={col.links} />
          ))}
        </div>

        <div className="mt-8 border-t border-hairline pt-6">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-mute">
              © {new Date().getFullYear()},{' '}
              <Link
                href="#"
                className="text-ink hover:underline"
                onClick={handleNotAvailable}
              >
                TokoPakBimo
              </Link>{' '}
              — All rights reserved
            </p>
            <Hotlines />
            <Socials />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
