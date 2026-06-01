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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function sendEmail({ to, subject, text, html, replyTo }: SendEmailOptions) {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not set — email skipped");
    return null;
  }

  const payload = {
    from: process.env.EMAIL_FROM || "AGC 3D Studios <info@agc3dstudios.it>",
    to: Array.isArray(to) ? to : [to],
    subject,
    text,
    html,
    replyTo,
  };

  // Retry on transient network/API errors (e.g. socket closed, DNS hiccup)
  const maxAttempts = 4;
  let lastErr: unknown = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const { data, error } = await resend.emails.send(payload);
      if (error) throw new Error(error.message);
      return data;
    } catch (e: any) {
      lastErr = e;
      console.warn(`Email send attempt ${attempt}/${maxAttempts} failed: ${e?.message ?? e}`);
      if (attempt < maxAttempts) await sleep(attempt * 1000);
    }
  }
  throw new Error(`Email failed after ${maxAttempts} attempts: ${(lastErr as any)?.message ?? lastErr}`);
}
