import { config } from 'dotenv';
import { resolve } from 'path';
import { CorsOptions } from 'cors';

export const NODE_ENV = process.env.NODE_ENV || 'development';

const envFile = NODE_ENV === 'development' ? '.env.development' : '.env';

config({ path: resolve(__dirname, `../${envFile}`) });
config({ path: resolve(__dirname, `../${envFile}.local`), override: true });

// Load all environment variables from .env file

export const PORT = process.env.PORT || 8000;
export const DATABASE_URL = process.env.DATABASE_URL || '';
export const SECRET_KEY = process.env.SECRET_KEY || '';
export const CLIENT_URL = process.env.CLIENT_URL || '';

// config for Midtrans
export const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || '';
export const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY || '';
export const MIDTRANS_IS_PRODUCTION =
  process.env.MIDTRANS_IS_PRODUCTION === 'true';

// config for nodemailer (Gmail). Google shows the app password in groups of
// four separated by spaces, so strip them in case it was pasted as-is.
export const SMTP_USER = process.env.SMTP_USER || '';
export const SMTP_PASS = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

// config for cors
export const corsOptions: CorsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
};
