import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, text, html, replyTo }: SendEmailOptions) {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not set — email skipped");
    return null;
  }

  const { data, error } = await resend.emails.send({
    from: "AGC 3D Studios <noreply@agc3dstudios.it>",
    to: Array.isArray(to) ? to : [to],
    subject,
    text,
    html,
    replyTo,
  });

  if (error) throw new Error(`Email failed: ${error.message}`);
  return data;
}
