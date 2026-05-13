import { z } from 'zod';

export const patientRecordSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyContactPhone: z.string().regex(/^\+?[0-9]{10,13}$/, 'Invalid phone number').optional().or(z.literal('')),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
});

export const sendOtpSchema = z.object({
  phone: z.string().regex(/^\+?[0-9]{10,13}$/, 'Invalid phone number'),
  action: z.enum(['send', 'verify']).optional(),
  otp: z.string().length(6, 'OTP must be 6 digits').optional(),
});

export const hospitalBedUpdateSchema = z.object({
  hospitalId: z.string().min(1, 'Hospital ID is required'),
  hospitalName: z.string().min(1, 'Hospital name is required'),
  totalBeds: z.number().int().min(0).optional(),
  availableBeds: z.number().int().min(0).optional(),
  totalICU: z.number().int().min(0).optional(),
  availableICU: z.number().int().min(0).optional(),
  adminKey: z.string().optional(),
});

export const adminPromoteSchema = z.object({
  email: z.string().email('Invalid email address'),
  secretKey: z.string().min(1, 'Secret key is required'),
});

export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(body);
  if (!result.success) {
    const errors = result.error.issues.map(i => i.message).join(', ');
    return { success: false, error: errors };
  }
  return { success: true, data: result.data };
}
