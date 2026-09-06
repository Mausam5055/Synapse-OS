import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const MAILER_SENDER = process.env.MAILER_SENDER || 'onboarding@resend.dev';

export const resendClient = new Resend(RESEND_API_KEY);

interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Send Account Confirmation / Email Verification
 */
export async function sendVerificationEmail(
  toEmail: string,
  name: string,
  verificationCode: string,
  verificationUrl: string
): Promise<EmailResult> {
  try {
    const data = await resendClient.emails.send({
      from: `Sanjeevni OS <${MAILER_SENDER}>`,
      to: [toEmail],
      subject: `🩺 Confirm your Sanjeevni OS Clinical Account — Verification Code ${verificationCode}`,
      text: `Hello ${name},\n\nThank you for registering for Sanjeevni OS (Autonomous Clinical Intelligence).\n\nYour 6-digit confirmation code is: ${verificationCode}\n\nOr verify directly by opening this link: ${verificationUrl}\n\nThis verification code expires in 45 minutes.\n\n— Sanjeevni OS Care Team`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
            .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
            .header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 1px; }
            .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; }
            .content { padding: 32px 28px; }
            .code-box { background: #f0f9ff; border: 1.5px dashed #0284c7; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }
            .code { font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0369a1; font-family: monospace; }
            .btn { display: inline-block; background: #7e57c2; color: #ffffff !important; padding: 14px 28px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 14px; margin-top: 10px; }
            .footer { padding: 20px 28px; background: #f8fafc; border-top: 1px solid #f1f5f9; font-size: 12px; color: #64748b; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>SANJEEVNI OS</h1>
              <p>Autonomous Clinical Intelligence & Swarm Care</p>
            </div>
            <div class="content">
              <h2 style="font-size: 18px; margin-top: 0; color: #0f172a;">Confirm your Clinical Account</h2>
              <p style="font-size: 14px; color: #334155; line-height: 1.6;">
                Hello <strong>${name}</strong>, thank you for joining the Sanjeevni OS healthcare network. Please enter your 6-digit confirmation code below or click the button to verify your account.
              </p>
              <div class="code-box">
                <div style="font-size: 11px; font-weight: 700; color: #0284c7; text-transform: uppercase; margin-bottom: 6px;">Your 6-Digit Verification Code</div>
                <div class="code">${verificationCode}</div>
              </div>
              <div style="text-align: center; margin: 24px 0;">
                <a href="${verificationUrl}" class="btn">Confirm Account Directly &rarr;</a>
              </div>
              <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
                This link and code will expire in 45 minutes. If you did not request this registration, please disregard this email.
              </p>
            </div>
            <div class="footer">
              <p style="margin: 0;">Sanjeevni OS • National Health Stack & ABDM Telemetry Consensus</p>
              <p style="margin: 4px 0 0 0;">AIIMS Clinical Standard • Dual-Repository Node</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (data.error) {
      console.warn('[Resend] Error sending verification email:', data.error);
      return { success: false, error: data.error.message };
    }

    return { success: true, id: data.data?.id };
  } catch (err: any) {
    console.error('[Resend] Exception sending verification email:', err);
    return { success: false, error: err.message || 'Failed to dispatch email' };
  }
}

/**
 * Send Password Reset Link & Code
 */
export async function sendPasswordResetEmail(
  toEmail: string,
  name: string,
  resetCode: string,
  resetUrl: string
): Promise<EmailResult> {
  try {
    const data = await resendClient.emails.send({
      from: `Sanjeevni OS Security <${MAILER_SENDER}>`,
      to: [toEmail],
      subject: `🔒 Reset your Sanjeevni OS password (Code: ${resetCode})`,
      text: `Hello ${name},\n\nA password reset request was received for your Sanjeevni OS account.\n\nYour reset code is: ${resetCode}\n\nOr click here to reset your password: ${resetUrl}\n\nThis link expires in 30 minutes.\n\nIf you did not request this, your account may be compromised. Please secure your account immediately.\n\n— Sanjeevni OS Security Team`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
            .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
            .header { background: #0f172a; padding: 32px 24px; text-align: center; color: #ffffff; }
            .content { padding: 32px 28px; }
            .code-box { background: #fef2f2; border: 1.5px dashed #ef4444; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }
            .code { font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #dc2626; font-family: monospace; }
            .btn { display: inline-block; background: #7e57c2; color: #ffffff !important; padding: 14px 28px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 14px; }
            .footer { padding: 20px 28px; background: #f8fafc; border-top: 1px solid #f1f5f9; font-size: 12px; color: #64748b; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 22px; font-weight: 800;">SANJEEVNI OS</h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Account Security & Credential Recovery</p>
            </div>
            <div class="content">
              <h2 style="font-size: 18px; margin-top: 0; color: #0f172a;">Password Reset Request</h2>
              <p style="font-size: 14px; color: #334155; line-height: 1.6;">
                Hello <strong>${name}</strong>, we received a request to reset the password for your account associated with <code>${toEmail}</code>.
              </p>
              <div class="code-box">
                <div style="font-size: 11px; font-weight: 700; color: #dc2626; text-transform: uppercase; margin-bottom: 6px;">Your Reset Code</div>
                <div class="code">${resetCode}</div>
              </div>
              <div style="text-align: center; margin: 24px 0;">
                <a href="${resetUrl}" class="btn">Reset Password &rarr;</a>
              </div>
              <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
                This link expires in 30 minutes. If you did not request a password reset, please contact clinical security immediately.
              </p>
            </div>
            <div class="footer">
              <p style="margin: 0;">Sanjeevni OS Security Protocol • 256-Bit Encrypted</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (data.error) {
      console.warn('[Resend] Error sending password reset email:', data.error);
      return { success: false, error: data.error.message };
    }

    return { success: true, id: data.data?.id };
  } catch (err: any) {
    console.error('[Resend] Exception sending password reset email:', err);
    return { success: false, error: err.message || 'Failed to dispatch email' };
  }
}

/**
 * Send Two-Factor OTP code via email
 */
export async function sendTwoFactorOtpEmail(
  toEmail: string,
  name: string,
  otpCode: string
): Promise<EmailResult> {
  try {
    const data = await resendClient.emails.send({
      from: `Sanjeevni OS 2FA <${MAILER_SENDER}>`,
      to: [toEmail],
      subject: `🔑 ${otpCode} is your Sanjeevni OS Two-Factor Security Code`,
      text: `Hello ${name},\n\nYour Sanjeevni OS 2FA login verification code is: ${otpCode}\n\nThis one-time passcode expires in 10 minutes. Do not share this code with anyone.\n\n— Sanjeevni OS Security`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: sans-serif; background-color: #f8fafc; padding: 24px; margin: 0;">
          <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px;">
            <div style="font-size: 18px; font-weight: 800; color: #0284c7; margin-bottom: 8px;">SANJEEVNI OS 2FA</div>
            <h2 style="font-size: 20px; margin: 0 0 16px 0; color: #0f172a;">Two-Factor Authentication Code</h2>
            <p style="font-size: 14px; color: #475569; line-height: 1.5;">
              Use the following 6-digit code to complete your login:
            </p>
            <div style="background: #f0fdf4; border: 2px solid #86efac; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #15803d; font-family: monospace;">${otpCode}</span>
            </div>
            <p style="font-size: 12px; color: #64748b;">This code expires in 10 minutes. Never share this code with anyone.</p>
          </div>
        </body>
        </html>
      `,
    });

    if (data.error) {
      console.warn('[Resend] Error sending 2FA OTP email:', data.error);
      return { success: false, error: data.error.message };
    }

    return { success: true, id: data.data?.id };
  } catch (err: any) {
    console.error('[Resend] Exception sending 2FA OTP email:', err);
    return { success: false, error: err.message || 'Failed to dispatch email' };
  }
}
