// src/types/index.ts
export type FacilityType = 'hospital' | 'clinic' | 'pharmacy';

export interface Hospital {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  specialties?: string[];
  beds?: {
    total: number;
    occupied?: number;
    available?: number;
    occupancyPercent?: number;
    icu?: number;
    icuOccupied?: number;
    icuAvailable?: number;
    icuOccupancyPercent?: number;
  };
  emergency?: boolean;
  location?: {
    lat: number;
    lng: number;
  };
  rating?: number;
  image?: string;
  workingHours?: string;
  doctors?: number;
  distance?: number;
  facilityType?: FacilityType;
  source?: string;
  googleMapsUrl?: string;
  directionsUrl?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty?: string;
  hospitalId?: string;
  hospitalName?: string;
  qualification?: string;
  experience?: number;
  rating?: number;
  consultationFee?: number;
  available?: boolean;
  nextAvailable?: string;
  languages?: string[];
  image?: string;
  location?: {
    lat: number;
    lng: number;
  };
  city?: string;
}

export interface Camp {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  city: string;
  state: string;
  services: string[];
  hospital: string;
  registration: string;
}

export interface EmergencyNumber {
  id: string;
  state: string;
  type: 'ambulance' | 'police' | 'fire' | 'disaster' | 'medical';
  number: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'patient' | 'caregiver' | 'admin';
  appointments?: Appointment[];
  medicalRecords?: MedicalRecord[];
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  hospitalId: string;
  hospitalName: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  type: string;
}

export interface MedicalRecord {
  id: string;
  title: string;
  date: string;
  hospital: string;
  doctor: string;
  type: 'report' | 'prescription' | 'bill';
  url: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  language?: string;
}