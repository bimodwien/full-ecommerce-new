import midtransClient from 'midtrans-client';
import {
  MIDTRANS_SERVER_KEY,
  MIDTRANS_CLIENT_KEY,
  MIDTRANS_IS_PRODUCTION,
} from '@/config';

export const snap = new midtransClient.Snap({
  isProduction: MIDTRANS_IS_PRODUCTION,
  serverKey: MIDTRANS_SERVER_KEY,
  clientKey: MIDTRANS_CLIENT_KEY,
});
