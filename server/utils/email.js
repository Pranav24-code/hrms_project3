import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.RESEND_FROM || "NexaHR <onboarding@resend.dev>";

const resend = resendApiKey ? new Resend(resendApiKey) : null;

/**
 * Send a password reset email containing a one-time reset link.
 * Falls back to logging the link to the console when RESEND_API_KEY is not set,
 * so the flow remains testable in local development.
 */
export const sendResetPasswordEmail = async ({ to, name, resetUrl }) => {
  const html = `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: 0 auto; color: #0f172a;">
      <h2 style="margin-bottom: 4px;">Reset your password</h2>
      <p style="color: #475569;">Hi ${name || "there"}, we received a request to reset the password for your NexaHR account.</p>
      <p style="color: #475569;">Click the button below to choose a new password. This link expires in 1 hour.</p>
      <p style="margin: 24px 0;">
        <a href="${resetUrl}" style="background: #2563eb; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 8px; display: inline-block; font-weight: 600;">Reset Password</a>
      </p>
      <p style="color: #94a3b8; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
      <p style="color: #94a3b8; font-size: 12px; word-break: break-all;">Or paste this link into your browser:<br/>${resetUrl}</p>
    </div>
  `;

  if (!resend) {
    console.warn(
      "[email] RESEND_API_KEY not set — skipping send. Reset link:\n" + resetUrl
    );
    return { skipped: true };
  }

  const { data, error } = await resend.emails.send({
    from: fromAddress,
    to,
    subject: "Reset your NexaHR password",
    html,
  });

  if (error) {
    throw new Error(error.message || "Failed to send reset email");
  }

  return data;
};
