import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || '',
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"ZyntraCare" <noreply@zyntracare.com>',
      to,
      subject,
      html,
      text,
    });
    console.log(`[Email] Sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Email] Failed to send:', error);
    return { success: false, error: String(error) };
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  return sendEmail({
    to: email,
    subject: 'Welcome to ZyntraCare!',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0ea5e9;">Welcome to ZyntraCare, ${name}!</h1>
        <p>Thank you for joining India's leading healthcare platform.</p>
        <p>You can now:</p>
        <ul>
          <li>Find hospitals and specialists</li>
          <li>Book appointments instantly</li>
          <li>Access emergency services</li>
          <li>Track your health records</li>
        </ul>
        <p>Get started at: <a href="https://zyntracare.com">zyntracare.com</a></p>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated message from ZyntraCare.</p>
      </div>
    `,
  });
}

export async function sendOTPEmail(email: string, otp: string) {
  return sendEmail({
    to: email,
    subject: 'Your ZyntraCare OTP',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0ea5e9;">Verify Your Email</h1>
        <p>Your OTP is:</p>
        <div style="background: #f0f9ff; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0ea5e9;">
          ${otp}
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
  return sendEmail({
    to: email,
    subject: 'Reset Your ZyntraCare Password',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0ea5e9;">Reset Your Password</h1>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">Reset Password</a>
        <p>Or copy this link: ${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
}

export async function sendBookingConfirmation(email: string, details: { doctor: string; hospital: string; date: string; time: string }) {
  return sendEmail({
    to: email,
    subject: 'Appointment Confirmed - ZyntraCare',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">Appointment Confirmed!</h1>
        <p>Your appointment has been booked successfully.</p>
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Doctor:</strong> ${details.doctor}</p>
          <p><strong>Hospital:</strong> ${details.hospital}</p>
          <p><strong>Date:</strong> ${details.date}</p>
          <p><strong>Time:</strong> ${details.time}</p>
        </div>
        <p>Please arrive 15 minutes before your appointment.</p>
      </div>
    `,
  });
}