import { TMail } from '@/libs/mailer';

const SUBJECT = 'Thanks for subscribing to TokoPakBimo';

const PARAGRAPHS = [
  'Dear Sir/Madam,',
  'Thank you for subscribing to TokoPakBimo.',
  'Unfortunately, TokoPakBimo is a personal portfolio project and not a real online store. There is no actual newsletter, so you will not receive any promotional emails from us, and your email address has not been saved.',
  'If you did not sign up yourself, you can safely ignore this message.',
  'Thank you for stopping by and trying out the site!',
];

const SIGNATURE = ['Best regards,', 'TokoPakBimo'];

export function buildSubscribeMail(to: string): TMail {
  const text = [...PARAGRAPHS, SIGNATURE.join('\n')].join('\n\n');
  const html = [
    '<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#111">',
    ...PARAGRAPHS.map((p) => `<p>${p}</p>`),
    `<p>${SIGNATURE.join('<br />')}</p>`,
    '</div>',
  ].join('');

  return { to, subject: SUBJECT, text, html };
}
