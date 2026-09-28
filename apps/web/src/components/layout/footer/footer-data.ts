import { FiMapPin, FiPhone, FiMail, FiClock } from 'react-icons/fi';
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
} from 'react-icons/fa';

export const LINK_COLUMNS = [
  {
    title: 'Company',
    links: [
      'About Us',
      'Delivery Information',
      'Privacy Policy',
      'Terms & Conditions',
      'Contact Us',
      'Support Center',
      'Careers',
    ],
  },
  {
    title: 'Account',
    links: [
      'Sign In',
      'View Cart',
      'My Wishlist',
      'Track My Order',
      'Help Ticket',
      'Shipping Details',
      'Compare products',
    ],
  },
  {
    title: 'Corporate',
    links: [
      'Become a Vendor',
      'Affiliate Program',
      'Suppliers Business',
      'Suppliers Careers',
      'Our Suppliers',
      'Accessibility',
      'Promotions',
    ],
  },
  {
    title: 'Popular',
    links: [
      'Milk & Flavoured Milk',
      'Butter and Margarine',
      'Eggs Substitutes',
      'Marmalades',
      'Sour Cream and Dips',
      'Tea & Kombucha',
      'Cheese',
    ],
  },
];

export const CONTACTS = [
  {
    icon: FiMapPin,
    label: 'Address',
    value: 'Permata Hijau, Jakarta Selatan, Indonesia',
  },
  { icon: FiPhone, label: 'Call Us', value: '(+62) 8xx-8xxx-5xxx' },
  { icon: FiMail, label: 'Email', value: 'sale@tokopakbimo.com' },
  { icon: FiClock, label: 'Hours', value: '10:00 - 18:00, Mon - Sat' },
];

export const HOTLINES = [
  { number: '1900 - 6666', note: 'Working 8:00 - 22:00' },
  { number: '1900 - 8888', note: '24/7 Support Center' },
];

// href null = not live yet (shows the "in development" toast).
export const SOCIALS = [
  {
    icon: FaFacebookF,
    label: 'Facebook',
    href: 'https://web.facebook.com/bimo.dwien.prabowo/',
  },
  { icon: FaTwitter, label: 'Twitter', href: 'https://x.com/yaelahmoo' },
  {
    icon: FaInstagram,
    label: 'Instagram',
    href: 'https://www.instagram.com/bimodprabowo/',
  },
  { icon: FaYoutube, label: 'YouTube', href: null },
  {
    icon: FaLinkedinIn,
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/bimodwien/',
  },
];
