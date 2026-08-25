'use client';

import HospitalMap from '@/components/HospitalMap';
import { useEffect, useState } from 'react';

export default function MapPage() {
  const [hospitals, setHospitals] = useState([]);

  useEffect(() => {
    // Fetch hospitals from API
    fetch('/api/hospitals')
      .then(res => res.json())
      .then(data => setHospitals(data))
      .catch(err => {
        console.error('Failed to fetch hospitals:', err);
        // Fallback to empty array or use mock data
        setHospitals([]);
      });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <HospitalMap hospitals={hospitals} />
    </div>
  );
}