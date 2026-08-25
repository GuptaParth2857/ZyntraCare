import nodemailer from 'nodemailer';

// Validate required environment variables
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL_PORT = process.env.EMAIL_PORT;
const EMAIL_FROM = process.env.EMAIL_FROM;

// Check if email is properly configured
const isEmailConfigured = EMAIL_HOST && EMAIL_USER && EMAIL_PASSWORD;

if (!isEmailConfigured) {
  console.error('[Email] CRITICAL: Email not configured. Set EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD in .env.local');
}

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: EMAIL_USER || '',
    pass: EMAIL_PASSWORD || '',
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  if (!isEmailConfigured) {
    console.error(`[Email] FAILED - Not configured. Would send to ${to}: ${subject}`);
    return { success: false, error: 'Email not configured' };
  }
  
  try {
    const info = await transporter.sendMail({
      from: EMAIL_FROM || `"ZyntraCare" <${EMAIL_USER}>`,
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
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://zyntracare.com'}/reset-password?token=${resetToken}`;
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

export async function sendEmergencyAlert(email: string, details: { patient: string; location: string; message: string; timestamp: string }) {
  return sendEmail({
    to: email,
    subject: '🚨 Emergency Alert - ZyntraCare',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ef4444;">Emergency Alert</h1>
        <p>An emergency alert has been triggered:</p>
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <p><strong>Patient:</strong> ${details.patient}</p>
          <p><strong>Location:</strong> ${details.location}</p>
          <p><strong>Message:</strong> ${details.message}</p>
          <p><strong>Time:</strong> ${details.timestamp}</p>
        </div>
        <p>Emergency services have been notified.</p>
      </div>
    `,
  });
}

// =============================================================================
// COMBINED EMAIL + WHATSAPP NOTIFICATIONS
// =============================================================================

import {
  sendAppointmentConfirmation as sendWhatsAppAppointmentConfirmation,
  sendAppointmentReminder as sendWhatsAppAppointmentReminder,
  sendPrescriptionReady as sendWhatsAppPrescriptionReady,
  sendEmergencyAlert as sendWhatsAppEmergencyAlert,
  sendOTPViaWhatsApp,
  type WhatsAppResult,
} from '@/lib/whatsapp';

interface CombinedResult {
  email: { success: boolean; messageId?: string; error?: string };
  whatsapp: WhatsAppResult;
}

/**
 * Send an appointment confirmation via both Email and WhatsApp.
 *
 * @param email        – Recipient email address
 * @param phone        – Recipient WhatsApp number (E.164)
 * @param appointment  – Appointment details
 */
export async function sendWhatsAppNotification(
  email: string,
  phone: string,
  appointment: { doctorName: string; date: string; time: string; hospital: string; department?: string; appointmentId?: string }
): Promise<CombinedResult> {
  const [emailResult, whatsappResult] = await Promise.all([
    sendBookingConfirmation(email, {
      doctor: appointment.doctorName,
      hospital: appointment.hospital,
      date: appointment.date,
      time: appointment.time,
    }),
    sendWhatsAppAppointmentConfirmation(phone, appointment),
  ]);

  return {
    email: emailResult,
    whatsapp: whatsappResult,
  };
}

/**
 * Send an appointment reminder via both Email and WhatsApp.
 */
export async function sendCombinedAppointmentReminder(
  email: string,
  phone: string,
  appointment: { doctorName: string; date: string; time: string; hospital: string; department?: string; appointmentId?: string }
): Promise<CombinedResult> {
  const [emailResult, whatsappResult] = await Promise.all([
    sendEmail({
      to: email,
      subject: 'Appointment Reminder – ZyntraCare',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f59e0b;">Appointment Reminder</h1>
          <p>Your appointment is tomorrow:</p>
          <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p><strong>Doctor:</strong> ${appointment.doctorName}</p>
            <p><strong>Hospital:</strong> ${appointment.hospital}</p>
            <p><strong>Date:</strong> ${appointment.date}</p>
            <p><strong>Time:</strong> ${appointment.time}</p>
          </div>
          <p>Please arrive 15 minutes before your appointment.</p>
        </div>
      `,
    }),
    sendWhatsAppAppointmentReminder(phone, appointment),
  ]);

  return { email: emailResult, whatsapp: whatsappResult };
}

/**
 * Send a prescription-ready notification via both Email and WhatsApp.
 */
export async function sendCombinedPrescriptionReady(
  email: string,
  phone: string,
  prescription: { prescriptionId: string; doctorName: string; hospital: string; medicines: string[]; readyAt?: string; pickupLocation?: string }
): Promise<CombinedResult> {
  const [emailResult, whatsappResult] = await Promise.all([
    sendEmail({
      to: email,
      subject: 'Prescription Ready – ZyntraCare',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10b981;">Prescription Ready</h1>
          <p>Your prescription is ready for pickup:</p>
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p><strong>Prescription ID:</strong> ${prescription.prescriptionId}</p>
            <p><strong>Doctor:</strong> ${prescription.doctorName}</p>
            <p><strong>Hospital:</strong> ${prescription.hospital}</p>
            <p><strong>Medicines:</strong> ${prescription.medicines.join(', ')}</p>
            ${prescription.pickupLocation ? `<p><strong>Pickup:</strong> ${prescription.pickupLocation}</p>` : ''}
          </div>
          <p>Please collect within 48 hours.</p>
        </div>
      `,
    }),
    sendWhatsAppPrescriptionReady(phone, prescription),
  ]);

  return { email: emailResult, whatsapp: whatsappResult };
}

/**
 * Send an emergency alert via both Email and WhatsApp.
 */
export async function sendCombinedEmergencyAlert(
  email: string,
  phone: string,
  emergency: { patientName: string; location: string; message: string; timestamp: string; alertType?: string; contactNumber?: string }
): Promise<CombinedResult> {
  const [emailResult, whatsappResult] = await Promise.all([
    sendEmergencyAlert(email, {
      patient: emergency.patientName,
      location: emergency.location,
      message: emergency.message,
      timestamp: emergency.timestamp,
    }),
    sendWhatsAppEmergencyAlert(phone, emergency),
  ]);

  return { email: emailResult, whatsapp: whatsappResult };
}

/**
 * Send an OTP via both Email and WhatsApp for maximum deliverability.
 */
export async function sendCombinedOTP(
  email: string,
  phone: string,
  otp: string
): Promise<CombinedResult> {
  const [emailResult, whatsappResult] = await Promise.all([
    sendOTPEmail(email, otp),
    sendOTPViaWhatsApp(phone, otp),
  ]);

  return { email: emailResult, whatsapp: whatsappResult };
}
