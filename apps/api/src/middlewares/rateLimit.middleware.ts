import { rateLimit } from 'express-rate-limit';

// General limiter for all API traffic.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) =>
    req.method === 'GET' && req.path.startsWith('/products/image/'),
  message: { message: 'Too many requests, please try again later.' },
});

// Stricter limiter for auth endpoints (login/register/google) to slow down brute-force attempts.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again later.' },
});
