// src/app/hospitals/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { FiFilter, FiMapPin, FiGrid, FiSearch, FiActivity, FiTrendingUp, FiAward, FiUsers, FiHeart } from 'react-icons/fi';
import { MdLocalHospital } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import HospitalCard from '@/components/HospitalCard';
import HospitalMap from '@/components/HospitalMap';
import { hospitals as baseHospitals, states } from '@/data/mockData';
import { Hospital } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

// Extended hospital data — real Indian hospitals with real information
const allHospitals: Hospital[] = [
  ...baseHospitals,
  // Additional major hospitals across India
  {
    id: 'h-ext-1',
    name: 'Apollo Hospitals Chennai',
    address: '21 Greams Lane, Off Greams Road',
    city: 'Chennai',
    state: 'Tamil Nadu',
    phone: '+91-44-2829-3333',
    email: 'info@apollohospitals.com',
    specialties: ['Cardiology', 'Oncology', 'Neurology', 'Transplant', 'Orthopedics'],
    beds: { total: 560, occupied: 430, available: 130, icu: 80, icuAvailable: 22 },
    emergency: true,
    location: { lat: 13.0601, lng: 80.2487 },
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800',
    workingHours: '24/7',
    doctors: 350
  },
  {
    id: 'h-ext-2',
    name: 'Medanta – The Medicity',
    address: 'Sector 38, DLF City',
    city: 'Gurgaon',
    state: 'Haryana',
    phone: '+91-124-4141-414',
    email: 'info@medanta.org',
    specialties: ['Cardiology', 'Neurosciences', 'Oncology', 'Orthopedics', 'Nephrology'],
    beds: { total: 1250, occupied: 980, available: 270, icu: 150, icuAvailable: 42 },
    emergency: true,
    location: { lat: 28.4551, lng: 77.0442 },
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
    workingHours: '24/7',
    doctors: 1300
  },
  {
    id: 'h-ext-3',
    name: 'AIIMS New Delhi',
    address: 'Ansari Nagar East, New Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    phone: '+91-11-2658-8500',
    email: 'hospital@aiims.edu',
    specialties: ['All Specialties', 'Research', 'Neurology', 'Cardiology', 'Oncology'],
    beds: { total: 2478, occupied: 2100, available: 378, icu: 200, icuAvailable: 65 },
    emergency: true,
    location: { lat: 28.5672, lng: 77.2100 },
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800',
    workingHours: '24/7',
    doctors: 2000
  },
  {
    id: 'h-ext-4',
    name: "Narayana Health City",
    address: '258/A Bommasandra Industrial Area',
    city: 'Bangalore',
    state: 'Karnataka',
    phone: '+91-80-7122-2222',
    email: 'info@narayanahealth.org',
    specialties: ['Cardiology', 'Cardiac Surgery', 'Oncology', 'Neurology', 'Nephrology'],
    beds: { total: 1000, occupied: 780, available: 220, icu: 120, icuAvailable: 35 },
    emergency: true,
    location: { lat: 12.8387, lng: 77.6815 },
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1588862114096-abc10c36849b?w=800',
    workingHours: '24/7',
    doctors: 600
  },
  {
    id: 'h-ext-5',
    name: 'Lilavati Hospital',
    address: 'A-791, Bandra Reclamation',
    city: 'Mumbai',
    state: 'Maharashtra',
    phone: '+91-22-2675-1000',
    email: 'info@lilavatihospital.com',
    specialties: ['Cardiology', 'Neurology', 'Oncology', 'Orthopedics', 'Gastroenterology'],
    beds: { total: 323, occupied: 260, available: 63, icu: 48, icuAvailable: 11 },
    emergency: true,
    location: { lat: 19.0596, lng: 72.8295 },
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800',
    workingHours: '24/7',
    doctors: 200
  },
  {
    id: 'h-ext-6',
    name: 'Christian Medical College',
    address: 'Ida Scudder Road, Vellore',
    city: 'Vellore',
    state: 'Tamil Nadu',
    phone: '+91-416-228-1000',
    email: 'info@cmcvellore.ac.in',
    specialties: ['Neurology', 'Cardiology', 'Oncology', 'Transplant', 'Ophthalmology'],
    beds: { total: 2700, occupied: 2300, available: 400, icu: 250, icuAvailable: 60 },
    emergency: true,
    location: { lat: 12.9237, lng: 79.1300 },
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1590650046871-92c887180603?w=800',
    workingHours: '24/7',
    doctors: 1800
  },
  {
    id: 'h-ext-7',
    name: 'Tata Memorial Hospital',
    address: 'Dr. E Borges Road, Parel',
    city: 'Mumbai',
    state: 'Maharashtra',
    phone: '+91-22-2417-7000',
    email: 'info@tmc.gov.in',
    specialties: ['Oncology', 'Radiation Therapy', 'Bone Marrow Transplant'],
    beds: { total: 629, occupied: 450, available: 179, icu: 70, icuAvailable: 25 },
    emergency: true,
    location: { lat: 18.9982, lng: 72.8378 },
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1604881991720-f91add269bed?w=800',
    workingHours: '24/7',
    doctors: 310
  },
  {
    id: 'h-ext-8',
    name: 'Manipal Hospital',
    address: '98 HAL Airport Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    phone: '+91-80-2502-4444',
    email: 'info@manipalhospitals.com',
    specialties: ['Cardiology', 'Neurology', 'Oncology', 'Orthopedics'],
    beds: { total: 600, occupied: 420, available: 180, icu: 85, icuAvailable: 30 },
    emergency: true,
    location: { lat: 12.9700, lng: 77.6099 },
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1547489432-cf93fa6c71ee?w=800',
    workingHours: '24/7',
    doctors: 320
  },
  {
    id: 'h-ext-9',
    name: 'KIMS Hospitals',
    address: 'Minister Road, Krishna Nagar',
    city: 'Hyderabad',
    state: 'Telangana',
    phone: '+91-40-4488-5000',
    email: 'info@kimshospitals.com',
    specialties: ['Neurology', 'Cardiology', 'Orthopedics', 'Oncology'],
    beds: { total: 1000, occupied: 720, available: 280, icu: 120, icuAvailable: 45 },
    emergency: true,
    location: { lat: 17.3850, lng: 78.4867 },
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1588862114096-abc10c36849b?w=800',
    workingHours: '24/7',
    doctors: 450
  },
  {
    id: 'h-ext-10',
    name: 'MIOT International',
    address: 'Mount Poonamalle Road, Manapakkam',
    city: 'Chennai',
    state: 'Tamil Nadu',
    phone: '+91-44-4200-2288',
    email: 'info@miothospitals.com',
    specialties: ['Orthopedics', 'Cardiology', 'Neurology', 'Oncology'],
    beds: { total: 1000, occupied: 750, available: 250, icu: 100, icuAvailable: 35 },
    emergency: true,
    location: { lat: 13.0142, lng: 80.1724 },
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800',
    workingHours: '24/7',
    doctors: 300
  },
  {
    id: 'h-ext-11',
    name: 'AMRI Hospitals Salt Lake',
    address: 'Sector III, Salt Lake City',
    city: 'Kolkata',
    state: 'West Bengal',
    phone: '+91-33-6606-3800',
    email: 'info@amrihospitals.com',
    specialties: ['Cardiology', 'Neurology', 'Oncology', 'Gastroenterology'],
    beds: { total: 400, occupied: 280, available: 120, icu: 60, icuAvailable: 20 },
    emergency: true,
    location: { lat: 22.5726, lng: 88.4121 },
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800',
    workingHours: '24/7',
    doctors: 210
  },
  {
    id: 'h-ext-12',
    name: 'Ruby Hall Clinic',
    address: '40 Sassoon Road',
    city: 'Pune',
    state: 'Maharashtra',
    phone: '+91-20-6645-5100',
    email: 'admin@rubyhall.com',
    specialties: ['Cardiology', 'Orthopedics', 'Oncology', 'Neurology'],
    beds: { total: 600, occupied: 420, available: 180, icu: 80, icuAvailable: 28 },
    emergency: true,
    location: { lat: 18.5314, lng: 73.8758 },
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800',
    workingHours: '24/7',
    doctors: 280
  },
  {
    id: 'h-ext-13',
    name: 'UN Mehta Institute',
    address: 'New Civil Hospital Campus',
    city: 'Ahmedabad',
    state: 'Gujarat',
    phone: '+91-79-2268-1281',
    email: 'info@unmehta.com',
    specialties: ['Cardiology', 'Cardiac Surgery', 'Pediatric Cardiology'],
    beds: { total: 450, occupied: 320, available: 130, icu: 65, icuAvailable: 22 },
    emergency: true,
    location: { lat: 23.0505, lng: 72.5886 },
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=800',
    workingHours: '24/7',
    doctors: 200
  },
  {
    id: 'h-ext-14',
    name: 'Sawai Man Singh Hospital',
    address: 'Sawai Ram Singh Road',
    city: 'Jaipur',
    state: 'Rajasthan',
    phone: '+91-141-2518-888',
    email: 'info@smshospital.gov.in',
    specialties: ['Cardiology', 'Orthopedics', 'Neurology', 'Emergency Medicine'],
    beds: { total: 2000, occupied: 1600, available: 400, icu: 120, icuAvailable: 35 },
    emergency: true,
    location: { lat: 26.9124, lng: 75.7873 },
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800',
    workingHours: '24/7',
    doctors: 600
  },
  {
    id: 'h-ext-15',
    name: 'SGPGI Lucknow',
    address: 'Raebareli Road',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    phone: '+91-522-2668-700',
    email: 'info@sgpgi.ac.in',
    specialties: ['Neurology', 'Nephrology', 'Cardiology', 'Endocrinology'],
    beds: { total: 950, occupied: 700, available: 250, icu: 110, icuAvailable: 40 },
    emergency: true,
    location: { lat: 26.7600, lng: 80.9236 },
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1586041828039-b8d193d6d1fd?w=800',
    workingHours: '24/7',
    doctors: 420
  },
  {
    id: 'h-ext-16',
    name: 'PGI Chandigarh',
    address: 'Sector 12',
    city: 'Chandigarh',
    state: 'Punjab',
    phone: '+91-172-2755-555',
    email: 'director@pgimer.edu.in',
    specialties: ['Cardiology', 'Neurology', 'Nephrology', 'Oncology'],
    beds: { total: 1748, occupied: 1300, available: 448, icu: 150, icuAvailable: 55 },
    emergency: true,
    location: { lat: 30.7648, lng: 76.7751 },
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1626315869436-d6781ba69d6e?w=800',
    workingHours: '24/7',
    doctors: 700
  },
  {
    id: 'h-ext-17',
    name: 'Amrita Institute',
    address: 'AIMS Ponekkara P.O.',
    city: 'Kochi',
    state: 'Kerala',
    phone: '+91-484-285-3914',
    email: 'info@aims.amrita.edu',
    specialties: ['Cardiology', 'Neurology', 'Oncology', 'Transplant'],
    beds: { total: 1300, occupied: 950, available: 350, icu: 140, icuAvailable: 50 },
    emergency: true,
    location: { lat: 9.9967, lng: 76.3068 },
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800',
    workingHours: '24/7',
    doctors: 550
  },
  {
    id: 'h-ext-18',
    name: 'Bombay Hospital Indore',
    address: '14 Ring Road',
    city: 'Indore',
    state: 'Madhya Pradesh',
    phone: '+91-731-404-0404',
    email: 'info@bombayhospitalindore.com',
    specialties: ['Cardiology', 'Oncology', 'Orthopedics', 'Neurology'],
    beds: { total: 400, occupied: 280, available: 120, icu: 55, icuAvailable: 18 },
    emergency: true,
    location: { lat: 22.7196, lng: 75.8577 },
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800',
    workingHours: '24/7',
    doctors: 180
  },
  {
    id: 'h-ext-19',
    name: 'Jaslok Hospital',
    address: '15 Pedder Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    phone: '+91-22-6657-3333',
    email: 'info@jaslokhospital.net',
    specialties: ['Cardiology', 'Neurology', 'Oncology', 'Nephrology'],
    beds: { total: 350, occupied: 250, available: 100, icu: 45, icuAvailable: 15 },
    emergency: true,
    location: { lat: 18.9720, lng: 72.8070 },
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
    workingHours: '24/7',
    doctors: 200
  },
  {
    id: 'h-ext-20',
    name: 'Breach Candy Hospital',
    address: '60 A Bhulabhai Desai Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    phone: '+91-22-2366-7880',
    email: 'info@breachcandy.com',
    specialties: ['Cardiology', 'Orthopedics', 'Gastroenterology'],
    beds: { total: 80, occupied: 50, available: 30, icu: 15, icuAvailable: 8 },
    emergency: true,
    location: { lat: 18.9725, lng: 72.8000 },
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800',
    workingHours: '24/7',
    doctors: 75
  },
  {
    id: 'h-ext-21',
    name: 'Hiranandani Hospital',
    address: 'Sector 10, Vashi',
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    phone: '+91-22-6285-7000',
    email: 'info@hiranandani hospital.net',
    specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics'],
    beds: { total: 240, occupied: 160, available: 80, icu: 35, icuAvailable: 12 },
    emergency: true,
    location: { lat: 19.0630, lng: 73.0100 },
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?w=800',
    workingHours: '24/7',
    doctors: 150
  },
  {
    id: 'h-ext-22',
    name: 'Fortis Mulund',
    address: 'Mulund Goregaon Link Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    phone: '+91-22-6795-4444',
    email: 'info.mumbai@fortishealthcare.com',
    specialties: ['Cardiology', 'Cardiac Surgery', 'Neurology', 'Orthopedics'],
    beds: { total: 300, occupied: 210, available: 90, icu: 50, icuAvailable: 18 },
    emergency: true,
    location: { lat: 19.1650, lng: 72.9400 },
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800',
    workingHours: '24/7',
    doctors: 180
  },
  {
    id: 'h-ext-23',
    name: 'Wockhardt Hospital',
    address: 'Admiralty Road, Mankhurd',
    city: 'Mumbai',
    state: 'Maharashtra',
    phone: '+91-22-6755-0800',
    email: 'info@wockhardthospitals.com',
    specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'Nephrology'],
    beds: { total: 350, occupied: 240, available: 110, icu: 55, icuAvailable: 20 },
    emergency: true,
    location: { lat: 19.0400, lng: 72.8500 },
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800',
    workingHours: '24/7',
    doctors: 190
  },
  {
    id: 'h-ext-24',
    name: 'Kokilaben Dhirubhai Ambani',
    address: 'Four Bungalows',
    city: 'Mumbai',
    state: 'Maharashtra',
    phone: '+91-22-3066-9999',
    email: 'info@kokilabenhospital.com',
    specialties: ['Oncology', 'Cardiac Surgery', 'Neurosurgery', 'Transplant'],
    beds: { total: 750, occupied: 550, available: 200, icu: 100, icuAvailable: 35 },
    emergency: true,
    location: { lat: 19.1197, lng: 72.8468 },
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1588882914095-e7c67db22cf0?w=800',
    workingHours: '24/7',
    doctors: 400
  },
  {
    id: 'h-ext-25',
    name: 'Saifee Hospital',
    address: '15/2 Maharshi Karve Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    phone: '+91-22-6757-0111',
    email: 'info@saifeehospital.com',
    specialties: ['Cardiology', 'Orthopedics', 'Neurology', 'Gastroenterology'],
    beds: { total: 150, occupied: 100, available: 50, icu: 25, icuAvailable: 10 },
    emergency: true,
    location: { lat: 18.9550, lng: 72.8200 },
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1604881991720-f91add269bed?w=800',
    workingHours: '24/7',
    doctors: 90
  },
  {
    id: 'h-ext-26',
    name: 'PD Hinduja Hospital',
    address: 'Veer Savarkar Marg, Mahim',
    city: 'Mumbai',
    state: 'Maharashtra',
    phone: '+91-22-6924-8000',
    email: 'info@hindujahospital.com',
    specialties: ['Cardiology', 'Neurology', 'Oncology', 'Nephrology'],
    beds: { total: 400, occupied: 280, available: 120, icu: 60, icuAvailable: 22 },
    emergency: true,
    location: { lat: 19.0400, lng: 72.8400 },
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800',
    workingHours: '24/7',
    doctors: 250
  },
];

const SPECIALTIES_LIST = ['Cardiology', 'Oncology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Nephrology', 'Transplant', 'Ophthalmology'];

const PLATFORM_STATS = [
  { label: 'Partner Hospitals', value: allHospitals.length.toString(), icon: MdLocalHospital, color: 'text-teal-400' },
  { label: 'Cities Covered', value: `${new Set(allHospitals.map(h => h.city)).size}+`, icon: FiMapPin, color: 'text-blue-400' },
  { label: 'Beds Available', value: allHospitals.reduce((sum, h) => sum + h.beds.available, 0).toLocaleString(), icon: FiActivity, color: 'text-emerald-400' },
  { label: 'Avg Rating', value: `${(allHospitals.reduce((sum, h) => sum + h.rating, 0) / allHospitals.length).toFixed(1)}★`, icon: FiHeart, color: 'text-amber-400' },
];

export default function HospitalsPage() {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedState, setSelectedState] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [showEmergencyOnly, setShowEmergencyOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  const filteredHospitals = useMemo(() => {
    let result = allHospitals.filter(hospital => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!hospital.name.toLowerCase().includes(q) && !hospital.city.toLowerCase().includes(q)) return false;
      }
      if (selectedState && hospital.state !== selectedState) return false;
      if (selectedSpecialty && !hospital.specialties.includes(selectedSpecialty)) return false;
      if (showEmergencyOnly && !hospital.emergency) return false;
      return true;
    });

    if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'beds') result.sort((a, b) => b.beds.available - a.beds.available);
    else if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [selectedState, selectedSpecialty, showEmergencyOnly, searchQuery, sortBy]);

  const handleHospitalSelect = (hospital: Hospital) => {
    console.log('Selected hospital:', hospital);
  };

  const clearFilters = () => {
    setSelectedState('');
    setSelectedSpecialty('');
    setShowEmergencyOnly(false);
    setSearchQuery('');
  };

  const hasActiveFilters = selectedState || selectedSpecialty || showEmergencyOnly || searchQuery;

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { 
        duration: 0.6, 
        ease: 'easeOut' as const,
        staggerChildren: 0.05
      } 
    },
    exit: { opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.25 } },
  };

return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.12, 0.25, 0.12], scale: [1, 1.05, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 left-1/4 w-[700px] h-[700px] bg-teal-600/20 rounded-full blur-[180px]"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.08, 0.18, 0.08], scale: [1, 1.08, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-emerald-500/12 rounded-full blur-[140px]"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center p-5 bg-teal-500/10 border border-teal-500/30 rounded-2xl mb-6 relative overflow-hidden"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/20 to-teal-500/0"
              aria-hidden="true"
            />
            <MdLocalHospital size={36} className="text-teal-400 relative z-10" aria-hidden="true" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-6xl font-black mb-4 tracking-tight leading-none"
          >
            Find{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400">
              Premium Hospitals
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-400 max-w-2xl mx-auto mb-8"
          >
            Real-time bed availability, ICU tracking, and instant contact for India&apos;s top hospitals.
          </motion.p>

          {/* Stats with animations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8"
          >
            {PLATFORM_STATS.map((stat, idx) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.5 + idx * 0.1, type: 'spring', stiffness: 100 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-3 text-center relative overflow-hidden group"
              >
                {/* Glow effect on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                />
                {/* Shimmer */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%)',
                  }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
                />
                <stat.icon size={18} className={`mx-auto mb-1 ${stat.color} relative z-10`} aria-hidden="true" />
                <motion.p 
                  className={`text-xl font-black ${stat.color} relative z-10`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 + idx * 0.1 }}
                >
                  {stat.value}
                </motion.p>
                <p className="text-gray-500 text-[11px] mt-0.5 relative z-10">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="max-w-2xl mx-auto relative"
          >
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={20} aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search hospitals by name or city…"
              aria-label="Search hospitals"
              className="w-full pl-12 pr-4 py-4 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none transition text-base"
            />
          </motion.div>
        </div>

      {/* Quick specialty chips */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 snap-x" role="group" aria-label="Filter by specialty">
          <button
            onClick={() => setSelectedSpecialty('')}
            aria-pressed={selectedSpecialty === ''}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all snap-start ${
              selectedSpecialty === '' ? 'bg-teal-600 text-white shadow-[0_0_20px_rgba(20,184,166,0.4)]' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            }`}
          >All</button>
          {SPECIALTIES_LIST.map(spec => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(prev => prev === spec ? '' : spec)}
              aria-pressed={selectedSpecialty === spec}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all snap-start ${
                selectedSpecialty === spec ? 'bg-teal-600 text-white shadow-[0_0_20px_rgba(20,184,166,0.4)]' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >{spec}</button>
          ))}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-5 rounded-3xl shadow-2xl flex flex-wrap gap-3 items-center"
        >
          <div className="flex items-center gap-2 text-teal-400">
            <FiFilter size={15} aria-hidden="true" />
            <span className="font-bold uppercase tracking-wider text-xs">{t('filters')}:</span>
          </div>

          <select
            value={selectedState}
            onChange={e => setSelectedState(e.target.value)}
            aria-label="Filter by state"
            className="flex-1 min-w-[140px] px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-white text-sm"
          >
            <option value="" className="bg-slate-900">{t('allStates')}</option>
            {states.filter(s => s !== 'All India').map(state => (
              <option key={state} value={state} className="bg-slate-900">{state}</option>
            ))}
          </select>

          <select
            value={selectedSpecialty}
            onChange={e => setSelectedSpecialty(e.target.value)}
            aria-label="Filter by specialty"
            className="flex-1 min-w-[140px] px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-white text-sm"
          >
            <option value="" className="bg-slate-900">{t('allSpecialties')}</option>
            {SPECIALTIES_LIST.map(s => (
              <option key={s} value={s} className="bg-slate-900">{s}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            aria-label="Sort hospitals by"
            className="flex-1 min-w-[140px] px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-white text-sm"
          >
            <option value="rating" className="bg-slate-900">Highest Rated</option>
            <option value="beds" className="bg-slate-900">Most Beds Available</option>
            <option value="name" className="bg-slate-900">A–Z by Name</option>
          </select>

          <label className="flex items-center gap-2 cursor-pointer bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 hover:bg-white/10 transition">
            <input
              type="checkbox"
              checked={showEmergencyOnly}
              onChange={e => setShowEmergencyOnly(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-800 border-white/20 accent-teal-500"
              aria-label="Show emergency hospitals only"
            />
            <span className="text-gray-300 text-sm font-medium whitespace-nowrap">{t('emergencyOnly')}</span>
          </label>

          <AnimatePresence>
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={clearFilters}
                className="px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 font-medium rounded-xl transition border border-red-500/20 text-sm"
              >
                {t('clearFilters')}
              </motion.button>
            )}
          </AnimatePresence>

          {/* View Toggle */}
          <div className="ml-auto flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1" role="group" aria-label="View mode">
            <button
              onClick={() => setViewMode('grid')}
              aria-pressed={viewMode === 'grid'}
              aria-label="Grid view"
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            >
              <FiGrid size={18} aria-hidden="true" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              aria-pressed={viewMode === 'map'}
              aria-label="Map view"
              className={`p-2 rounded-lg transition-all ${viewMode === 'map' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            >
              <FiMapPin size={18} aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Results */}
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-400 text-sm font-medium">
            Showing <span className="text-teal-400 font-bold text-base">{filteredHospitals.length}</span> hospitals
          </p>
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1.5 text-teal-400/70 text-xs"
            >
              <FiTrendingUp size={12} aria-hidden="true" />
              Filtered results
            </motion.div>
          )}
        </div>

        {viewMode === 'grid' ? (
          filteredHospitals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-24 bg-slate-900/30 backdrop-blur-md rounded-3xl border border-white/5"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
              >
                <FiSearch size={48} className="mx-auto text-gray-600 mb-4" aria-hidden="true" />
              </motion.div>
              <p className="text-gray-400 text-lg font-medium">{t('noResults')}</p>
              <p className="text-gray-600 text-sm mt-2 mb-6">Try adjusting your filters</p>
              <button
                onClick={clearFilters}
                className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-2.5 rounded-xl transition font-semibold border border-teal-400/30"
              >
                {t('clearFilters')}
              </button>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              <AnimatePresence mode="popLayout">
                {filteredHospitals.map((hospital, idx) => (
                  <motion.div
                    layout
                    key={hospital.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    custom={idx}
                  >
                    <HospitalCard hospital={hospital} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative"
            style={{ filter: 'drop-shadow(0 0 40px rgba(20, 184, 166, 0.1))' }}
          >
            <HospitalMap
              hospitals={filteredHospitals}
              onHospitalSelect={handleHospitalSelect}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}