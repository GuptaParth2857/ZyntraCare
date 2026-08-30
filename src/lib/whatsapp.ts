/**
 * WhatsApp Messaging Service for ZyntraCare
 * Uses Twilio WhatsApp API via native fetch() to avoid import issues.
 *
 * Required environment variables:
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_WHATSAPP_NUMBER  (e.g. "whatsapp:+14155238886")
 */

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;

const isWhatsAppConfigured = TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_WHATSAPP_NUMBER;

if (!isWhatsAppConfigured) {
  console.error(
    '[WhatsApp] CRITICAL: Not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER in .env.local'
  );
}

export interface WhatsAppResult {
  success: boolean;
  messageId?: string;
  error?: string;
  demo?: boolean;
}

export interface AppointmentDetails {
  doctorName: string;
  date: string;
  time: string;
  hospital: string;
  department?: string;
  appointmentId?: string;
}

export interface PrescriptionDetails {
  prescriptionId: string;
  doctorName: string;
  hospital: string;
  medicines: string[];
  readyAt?: string;
  pickupLocation?: string;
}

export interface EmergencyDetails {
  patientName: string;
  location: string;
  message: string;
  timestamp: string;
  alertType?: string;
  contactNumber?: string;
}

/**
 * Send a raw WhatsApp message via Twilio API.
 *
 * @param to     – Recipient WhatsApp number in E.164 format (e.g. "+919876543210")
 * @param body   – Plain-text message body
 * @returns      – { success, messageId?, error? }
 */
export async function sendWhatsAppMessage(to: string, body: string): Promise<WhatsAppResult> {
  if (!isWhatsAppConfigured) {
    // DEMO MODE: Twilio keys aren't set, so we gracefully "deliver" the message
    // so live demos never break. Clearly flagged as demo — in production this
    // would actually send via Twilio WhatsApp.
    console.warn(`[WhatsApp] DEMO (no Twilio creds) → To: ${to}\n${body}`);
    return {
      success: true,
      messageId: 'wa_demo_' + Date.now().toString(36),
      demo: true,
    };
  }

  const normalisedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  const from = TWILIO_WHATSAPP_NUMBER!;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[WhatsApp] DEV → To: ${normalisedTo}\n${body}`);
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: normalisedTo, From: from, Body: body }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`[WhatsApp] API error ${response.status}:`, data.message || data);
      return { success: false, error: data.message || `Twilio error ${response.status}` };
    }

    console.log(`[WhatsApp] Sent to ${to}: ${data.sid}`);
    return { success: true, messageId: data.sid };
  } catch (error) {
    console.error('[WhatsApp] Failed to send:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Send an appointment confirmation via WhatsApp.
 *
 * @param to           – Recipient WhatsApp number
 * @param appointment  – Appointment details
 */
export async function sendAppointmentConfirmation(
  to: string,
  appointment: AppointmentDetails
): Promise<WhatsAppResult> {
  const lines = [
    '🏥 *ZyntraCare – Appointment Confirmed*',
    '',
    `👨‍⚕️ Doctor: ${appointment.doctorName}`,
    `📅 Date: ${appointment.date}`,
    `⏰ Time: ${appointment.time}`,
    `🏨 Hospital: ${appointment.hospital}`,
  ];

  if (appointment.department) lines.push(`🩺 Department: ${appointment.department}`);
  if (appointment.appointmentId) lines.push(`🔖 ID: ${appointment.appointmentId}`);

  lines.push('', 'Please arrive 15 minutes before your appointment.', '— ZyntraCare');

  return sendWhatsAppMessage(to, lines.join('\n'));
}

/**
 * Send an appointment reminder (typically 24 h before).
 *
 * @param to           – Recipient WhatsApp number
 * @param appointment  – Appointment details
 */
export async function sendAppointmentReminder(
  to: string,
  appointment: AppointmentDetails
): Promise<WhatsAppResult> {
  const lines = [
    '⏰ *ZyntraCare – Appointment Reminder*',
    '',
    'Your appointment is tomorrow:',
    '',
    `👨‍⚕️ Doctor: ${appointment.doctorName}`,
    `📅 Date: ${appointment.date}`,
    `⏰ Time: ${appointment.time}`,
    `🏨 Hospital: ${appointment.hospital}`,
    '',
    'Please carry your ID and any previous reports.',
    'Reply STOP to unsubscribe from reminders.',
    '— ZyntraCare',
  ];

  return sendWhatsAppMessage(to, lines.join('\n'));
}

/**
 * Notify a patient that their prescription is ready for pickup.
 *
 * @param to           – Recipient WhatsApp number
 * @param prescription – Prescription details
 */
export async function sendPrescriptionReady(
  to: string,
  prescription: PrescriptionDetails
): Promise<WhatsAppResult> {
  const lines = [
    '💊 *ZyntraCare – Prescription Ready*',
    '',
    `🔖 Prescription ID: ${prescription.prescriptionId}`,
    `👨‍⚕️ Doctor: ${prescription.doctorName}`,
    `🏨 Hospital: ${prescription.hospital}`,
    '',
    '📦 Medicines:',
    ...prescription.medicines.map((m, i) => `  ${i + 1}. ${m}`),
  ];

  if (prescription.pickupLocation) lines.push(`📍 Pickup: ${prescription.pickupLocation}`);
  if (prescription.readyAt) lines.push(`⏰ Ready at: ${prescription.readyAt}`);

  lines.push('', 'Please collect within 48 hours.', '— ZyntraCare');

  return sendWhatsAppMessage(to, lines.join('\n'));
}

/**
 * Send an emergency SOS alert via WhatsApp.
 *
 * @param to         – Recipient WhatsApp number (emergency contact)
 * @param emergency  – Emergency details
 */
export async function sendEmergencyAlert(
  to: string,
  emergency: EmergencyDetails
): Promise<WhatsAppResult> {
  const lines = [
    '🚨 *ZyntraCare – EMERGENCY ALERT* 🚨',
    '',
    `Patient: ${emergency.patientName}`,
    `Location: ${emergency.location}`,
    `Message: ${emergency.message}`,
    `Time: ${emergency.timestamp}`,
  ];

  if (emergency.alertType) lines.push(`Type: ${emergency.alertType}`);
  if (emergency.contactNumber) lines.push(`Contact: ${emergency.contactNumber}`);

  lines.push('', 'Emergency services have been notified.', 'If this is a mistake, please disregard.');

  return sendWhatsAppMessage(to, lines.join('\n'));
}

/**
 * Send an OTP for verification via WhatsApp.
 *
 * @param to  – Recipient WhatsApp number
 * @param otp – The OTP string (e.g. "482916")
 */
export async function sendOTPViaWhatsApp(to: string, otp: string): Promise<WhatsAppResult> {
  const lines = [
    '🔐 *ZyntraCare – Verification Code*',
    '',
    `Your OTP is: *${otp}*`,
    '',
    'Valid for 10 minutes.',
    'Do not share this code with anyone.',
    '— ZyntraCare',
  ];

  return sendWhatsAppMessage(to, lines.join('\n'));
}
