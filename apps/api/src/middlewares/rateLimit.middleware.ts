import { rateLimit } from 'express-rate-limit';
import { NODE_ENV } from '@/config';

// Dev reloads and StrictMode double-fetches burn through the limit in minutes,
// so the limiters only apply outside development.
const isDev = NODE_ENV === 'development';

// General limiter for all API traffic.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) =>
    isDev || (req.method === 'GET' && req.path.startsWith('/products/image/')),
  message: { message: 'Too many requests, please try again later.' },
});

// Stricter limiter for auth endpoints (login/register/google) to slow down brute-force attempts.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev,
  message: { message: 'Too many attempts, please try again later.' },
});
