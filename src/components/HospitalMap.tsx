'use client';

import { Hospital } from '@/types';

interface HospitalMapProps {
  hospitals?: Hospital[];
  selectedHospital?: Hospital | null;
  userLocation?: { lat: number; lng: number } | null;
  onHospitalSelect?: (hospital: Hospital) => void;
}

export default function HospitalMap({ hospitals = [], selectedHospital, userLocation, onHospitalSelect }: HospitalMapProps) {
  return (
    <div className="w-full h-full min-h-[400px] bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center justify-center">
      <div className="text-center text-gray-400">
        <p className="text-lg font-semibold">Map loading...</p>
        <p className="text-sm mt-1">{hospitals.length} hospital{hospitals.length !== 1 ? 's' : ''} found</p>
      </div>
    </div>
  );
}
