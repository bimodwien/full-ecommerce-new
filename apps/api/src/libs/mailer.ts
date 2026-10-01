import nodemailer, { Transporter } from 'nodemailer';
import { SMTP_USER, SMTP_PASS } from '@/config';
import AppError from './appError';

export type TMail = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

let transporter: Transporter | null = null;

// Built lazily so the API still boots when the SMTP credentials are missing;
// only the endpoints that actually send mail fail.
function getTransporter(): Transporter {
  if (!SMTP_USER || !SMTP_PASS) {
    throw new AppError('Email service is not configured', 503);
  }
  transporter ??= nodemailer.createTransport({
    service: 'gmail',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

export async function sendMail(mail: TMail): Promise<void> {
  const client = getTransporter();
  try {
    await client.sendMail({ from: `"TokoPakBimo" <${SMTP_USER}>`, ...mail });
  } catch (error) {
    console.error('[MAILER ERROR]', error);
    throw new AppError('Failed to send email, please try again later', 502);
  }
}
