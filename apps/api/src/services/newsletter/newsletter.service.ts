import { Request } from 'express';
import AppError from '@/libs/appError';
import { sendMail } from '@/libs/mailer';
import { buildSubscribeMail } from './template';

// Single address only: no spaces or separators, so one request can never fan
// out to several recipients.
const EMAIL_PATTERN = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/;
const MAX_EMAIL_LENGTH = 254;

function parseEmail(req: Request): string {
  const email = String(req.body?.email ?? '')
    .trim()
    .toLowerCase();
  if (!email) throw new AppError('Email is required', 400);
  if (email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    throw new AppError('Invalid email address', 400);
  }
  return email;
}

class NewsletterService {
  // Nothing is stored: the address is only used to send the reply.
  static async subscribe(req: Request) {
    const email = parseEmail(req);
    await sendMail(buildSubscribeMail(email));
    return { email };
  }
}

export default NewsletterService;
