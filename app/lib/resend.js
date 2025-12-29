import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }) {
  return resend.emails.send({
    from: 'Liberty Weather <alerts@libertyweather.com>', // MUST be verified domain
    to,
    subject,
    html,
  });
}
