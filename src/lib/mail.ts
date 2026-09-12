import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Default sender: in development/testing, Resend's verified test address works immediately
// When you verify your own domain in Resend, you can change this to: support@yourdomain.com
const fromEmail = process.env.EMAIL_FROM || 'Healora HealthCare <onboarding@resend.dev>';

interface SendOtpParams {
  to: string;
  name: string;
  otp: string;
  purpose?: string;
  subject?: string;
}

export async function sendOtpEmail({ to, name, otp, purpose = 'Password Reset', subject }: SendOtpParams) {
  const emailSubject = subject || `Your Healora ${purpose} Code: ${otp}`;

  // If no Resend API key configured yet, log in console for development
  if (!resend) {
    console.log('\n================== RESEND EMAIL SIMULATION ==================');
    console.log(`To:      ${to} (${name})`);
    console.log(`Subject: ${emailSubject}`);
    console.log(`OTP:     ${otp}`);
    console.log('Notice:  Add RESEND_API_KEY to your .env file for live delivery');
    console.log('=============================================================\n');
    return { success: true, mode: 'DEV_SIMULATION' };
  }

  try {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Password Reset OTP</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);" cellspacing="0" cellpadding="0" border="0">
          <!-- Header -->
          <tr>
            <td style="background-color: #042f2e; padding: 28px 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
                Healora <span style="color: #2dd4bf;">HealthCare</span>
              </h1>
              <p style="color: #99f6e4; margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">
                Your Trusted Health Store
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 28px;">
              <h2 style="color: #0f172a; margin: 0 0 12px 0; font-size: 18px; font-weight: 700;">
                ${purpose} Verification Code
              </h2>
              <p style="color: #475569; font-size: 13px; line-height: 1.6; margin: 0 0 24px 0;">
                Hello <strong>${name || 'Valued User'}</strong>,<br>
                We received a request for <strong>${purpose}</strong> on your Healora HealthCare account. Use the one-time verification code below to proceed:
              </p>

              <!-- OTP Box -->
              <div style="background-color: #f0fdfa; border: 2px dashed #0d9488; border-radius: 16px; padding: 20px; text-align: center; margin: 0 0 24px 0;">
                <span style="display: block; color: #115e59; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">
                  Your Verification Code
                </span>
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; color: #0f766e; letter-spacing: 8px; display: inline-block;">
                  ${otp}
                </span>
                <span style="display: block; color: #64748b; font-size: 11px; margin-top: 8px;">
                  ⏱️ Valid for 10 minutes only
                </span>
              </div>

              <!-- Security Notice -->
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 12px 16px; margin-bottom: 24px;">
                <p style="color: #991b1b; font-size: 11px; margin: 0; line-height: 1.5;">
                  <strong>Security Note:</strong> Never share this code with anyone. Healora staff will never ask for your verification code or password.
                </p>
              </div>

              <p style="color: #64748b; font-size: 12px; margin: 0; line-height: 1.5;">
                If you did not make this request, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 18px 24px; text-align: center;">
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">
                © ${new Date().getFullYear()} Healora HealthCare. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject: `Your Healora Verification Code: ${otp}`,
      html: htmlContent,
    });

    if (error) {
      console.error('Resend email error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('Failed to send OTP email:', err);
    return { success: false, error: err.message };
  }
}
