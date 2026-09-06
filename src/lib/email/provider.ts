import "server-only";
import { Resend } from "resend";

const API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM ?? "NOVAWEAR <onboarding@resend.dev>";

const resend = API_KEY ? new Resend(API_KEY) : null;

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends transactional email via Resend. Without RESEND_API_KEY configured,
 * emails are logged to the console instead of failing — the checkout/order
 * flow never breaks just because email isn't wired up yet.
 */
export async function sendEmail({ to, subject, html }: SendEmailInput) {
  if (!resend) {
    console.info(`[email:dev-mode] to=${to} subject="${subject}" (RESEND_API_KEY no configurado)`);
    return { skipped: true as const };
  }

  const result = await resend.emails.send({ from: FROM, to, subject, html });
  return { skipped: false as const, result };
}
