import { NextRequest, NextResponse } from 'next/server';
import { authRateLimit, sanitizeInput } from '@/lib/rate-limit';
import {
  sendAppointmentConfirmation,
  sendAppointmentReminder,
  sendPrescriptionReady,
  sendEmergencyAlert,
  sendOTPViaWhatsApp,
  type AppointmentDetails,
  type PrescriptionDetails,
  type EmergencyDetails,
} from '@/lib/whatsapp';

const VALID_TYPES = ['appointment', 'reminder', 'prescription', 'emergency', 'otp'] as const;
type NotificationType = (typeof VALID_TYPES)[number];

/**
 * POST /api/notifications/whatsapp
 *
 * Send a WhatsApp notification through ZyntraCare.
 *
 * Body:
 *   {
 *     type: 'appointment' | 'reminder' | 'prescription' | 'emergency' | 'otp',
 *     to:   string,          // WhatsApp number in E.164 (e.g. "+919876543210")
 *     data: any              // Type-specific payload
 *   }
 */
export async function POST(req: NextRequest) {
  const rateLimitCheck = await authRateLimit(req, 30, 60000);
  if (rateLimitCheck) return rateLimitCheck;

  try {
    const body = await req.json();
    const { type, to, data } = body ?? {};

    // --- Input validation ---------------------------------------------------
    if (!type || !VALID_TYPES.includes(type as NotificationType)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    if (!to || typeof to !== 'string') {
      return NextResponse.json({ error: 'Recipient number (to) is required' }, { status: 400 });
    }

    const sanitisedTo = sanitizeInput(to);
    if (!/^\+?[1-9]\d{6,14}$/.test(sanitisedTo.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use E.164 (e.g. "+919876543210")' },
        { status: 400 }
      );
    }

    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: 'Payload data is required' }, { status: 400 });
    }

    // --- Dispatch by type ---------------------------------------------------
    let result;

    switch (type as NotificationType) {
      case 'appointment': {
        const appointment: AppointmentDetails = {
          doctorName: sanitizeInput(data.doctorName || 'N/A'),
          date: sanitizeInput(data.date || 'N/A'),
          time: sanitizeInput(data.time || 'N/A'),
          hospital: sanitizeInput(data.hospital || 'N/A'),
          department: data.department ? sanitizeInput(data.department) : undefined,
          appointmentId: data.appointmentId ? sanitizeInput(data.appointmentId) : undefined,
        };
        result = await sendAppointmentConfirmation(sanitisedTo, appointment);
        break;
      }

      case 'reminder': {
        const appointment: AppointmentDetails = {
          doctorName: sanitizeInput(data.doctorName || 'N/A'),
          date: sanitizeInput(data.date || 'N/A'),
          time: sanitizeInput(data.time || 'N/A'),
          hospital: sanitizeInput(data.hospital || 'N/A'),
          department: data.department ? sanitizeInput(data.department) : undefined,
          appointmentId: data.appointmentId ? sanitizeInput(data.appointmentId) : undefined,
        };
        result = await sendAppointmentReminder(sanitisedTo, appointment);
        break;
      }

      case 'prescription': {
        const prescription: PrescriptionDetails = {
          prescriptionId: sanitizeInput(data.prescriptionId || 'N/A'),
          doctorName: sanitizeInput(data.doctorName || 'N/A'),
          hospital: sanitizeInput(data.hospital || 'N/A'),
          medicines: Array.isArray(data.medicines)
            ? data.medicines.map((m: string) => sanitizeInput(String(m)))
            : [],
          readyAt: data.readyAt ? sanitizeInput(data.readyAt) : undefined,
          pickupLocation: data.pickupLocation ? sanitizeInput(data.pickupLocation) : undefined,
        };
        result = await sendPrescriptionReady(sanitisedTo, prescription);
        break;
      }

      case 'emergency': {
        const emergency: EmergencyDetails = {
          patientName: sanitizeInput(data.patientName || 'Unknown'),
          location: sanitizeInput(data.location || 'Unknown'),
          message: sanitizeInput(data.message || 'Emergency SOS triggered'),
          timestamp: sanitizeInput(data.timestamp || new Date().toISOString()),
          alertType: data.alertType ? sanitizeInput(data.alertType) : undefined,
          contactNumber: data.contactNumber ? sanitizeInput(data.contactNumber) : undefined,
        };
        result = await sendEmergencyAlert(sanitisedTo, emergency);
        break;
      }

      case 'otp': {
        const otp = sanitizeInput(String(data.otp || ''));
        if (!otp || otp.length < 4 || otp.length > 8) {
          return NextResponse.json(
            { error: 'OTP must be between 4 and 8 characters' },
            { status: 400 }
          );
        }
        result = await sendOTPViaWhatsApp(sanitisedTo, otp);
        break;
      }
    }

    if (!result!.success) {
      return NextResponse.json(
        { error: result!.error || 'Failed to send WhatsApp message' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result!.messageId,
      type,
    });
  } catch (error) {
    console.error('[WhatsApp API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
