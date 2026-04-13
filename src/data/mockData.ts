// src/data/mockData.ts
import { Hospital, Doctor, Camp, EmergencyNumber } from '@/types';

export const hospitals: Hospital[] = [
  // ── DELHI NCR ──────────────────────────────────────────────────────
  {
    id: 'h1',
    name: 'AIIMS New Delhi',
    address: 'Sri Aurobindo Marg, Ansari Nagar',
    city: 'New Delhi',
    state: 'Delhi',
    phone: '+91-11-2659-3308',
    email: 'director@aiims.edu',
    specialties: ['Cardiology', 'Neurology', 'Oncology', 'Orthopedics', 'Nephrology', 'Gastroenterology'],
    beds: { total: 2478, occupied: 2201, available: 277, icu: 180, icuAvailable: 18 },
    emergency: true,
    location: { lat: 28.5672, lng: 77.2100 },
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800',
    workingHours: '24/7',
    doctors: 1500
  },
  {
    id: 'h2',
    name: 'Fortis Escorts Heart Institute',
    address: 'Okhla Road, New Friends Colony',
    city: 'New Delhi',
    state: 'Delhi',
    phone: '+91-11-4713-5000',
    email: 'escorts@fortishealthcare.com',
    specialties: ['Cardiology', 'Cardiac Surgery', 'Pediatric Cardiology', 'Vascular Surgery'],
    beds: { total: 340, occupied: 298, available: 42, icu: 60, icuAvailable: 8 },
    emergency: true,
    location: { lat: 28.5662, lng: 77.2831 },
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
    workingHours: '24/7',
    doctors: 180
  },
  {
    id: 'h3',
    name: 'Sir Ganga Ram Hospital',
    address: 'Rajinder Nagar, Sarhadi Gandhi Nagar',
    city: 'New Delhi',
    state: 'Delhi',
    phone: '+91-11-2575-0000',
    email: 'info@sgrh.com',
    specialties: ['Cardiology', 'Oncology', 'Neurology', 'Orthopedics', 'Urology'],
    beds: { total: 675, occupied: 589, available: 86, icu: 75, icuAvailable: 12 },
    emergency: true,
    location: { lat: 28.6432, lng: 77.1814 },
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800',
    workingHours: '24/7',
    doctors: 350
  },
  {
    id: 'h4',
    name: 'Fortis Memorial Hospital',
    address: 'Sector 44, Opposite HUDA City Centre',
    city: 'Gurgaon',
    state: 'Haryana',
    phone: '+91-124-4922-222',
    email: 'info.gurgaon@fortishealthcare.com',
    specialties: ['Cardiology', 'Oncology', 'Neurology', 'Orthopedics', 'Nephrology'],
    beds: { total: 300, occupied: 245, available: 55, icu: 50, icuAvailable: 12 },
    emergency: true,
    location: { lat: 28.4595, lng: 77.0282 },
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1588882914095-e7c67db22cf0?w=800',
    workingHours: '24/7',
    doctors: 150
  },
  {
    id: 'h5',
    name: 'Max Super Specialty Hospital',
    address: '1, Press Enclave Marg, Saket',
    city: 'New Delhi',
    state: 'Delhi',
    phone: '+91-11-2651-5050',
    email: 'care@maxhealthcare.in',
    specialties: ['Cardiology', 'Oncology', 'Neurosurgery', 'Transplant', 'Pediatrics'],
    beds: { total: 550, occupied: 487, available: 63, icu: 90, icuAvailable: 14 },
    emergency: true,
    location: { lat: 28.5274, lng: 77.2159 },
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?w=800',
    workingHours: '24/7',
    doctors: 290
  },

  // ── MUMBAI ──────────────────────────────────────────────────────────
  {
    id: 'h6',
    name: 'Kokilaben Dhirubhai Ambani Hospital',
    address: 'Rao Saheb Achutrao Patwardhan Marg, Four Bungalows',
    city: 'Mumbai',
    state: 'Maharashtra',
    phone: '+91-22-3066-9999',
    email: 'info@kokilabenhospital.com',
    specialties: ['Oncology', 'Cardiac Surgery', 'Neurosurgery', 'Transplant', 'Robotics Surgery'],
    beds: { total: 750, occupied: 661, available: 89, icu: 100, icuAvailable: 16 },
    emergency: true,
    location: { lat: 19.1197, lng: 72.8468 },
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800',
    workingHours: '24/7',
    doctors: 400
  },
  {
    id: 'h7',
    name: 'Lilavati Hospital & Research Centre',
    address: 'A-791, Bandra Reclamation, Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    phone: '+91-22-2675-1000',
    email: 'info@lilavatihospital.com',
    specialties: ['Cardiology', 'Oncology', 'Orthopedics', 'Gastroenterology', 'Nephrology'],
    beds: { total: 323, occupied: 278, available: 45, icu: 55, icuAvailable: 9 },
    emergency: true,
    location: { lat: 19.0608, lng: 72.8348 },
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1631217868264-e6b2b364fdfc?w=800',
    workingHours: '24/7',
    doctors: 220
  },
  {
    id: 'h8',
    name: 'Tata Memorial Hospital',
    address: 'Dr. E Borges Road, Parel',
    city: 'Mumbai',
    state: 'Maharashtra',
    phone: '+91-22-2417-7000',
    email: 'info@tmc.gov.in',
    specialties: ['Oncology', 'Radiation Therapy', 'Bone Marrow Transplant', 'Pediatric Oncology'],
    beds: { total: 629, occupied: 598, available: 31, icu: 70, icuAvailable: 5 },
    emergency: true,
    location: { lat: 18.9982, lng: 72.8378 },
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1604881991720-f91add269bed?w=800',
    workingHours: '24/7',
    doctors: 310
  },

  // ── BENGALURU ───────────────────────────────────────────────────────
  {
    id: 'h9',
    name: 'Manipal Hospital Bengaluru',
    address: '98, HAL Airport Road, Kodihalli',
    city: 'Bengaluru',
    state: 'Karnataka',
    phone: '+91-80-2502-4444',
    email: 'info@manipalhospitals.com',
    specialties: ['Cardiology', 'Neurology', 'Oncology', 'Orthopedics', 'Urology'],
    beds: { total: 600, occupied: 529, available: 71, icu: 85, icuAvailable: 17 },
    emergency: true,
    location: { lat: 12.9700, lng: 77.6099 },
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1547489432-cf93fa6c71ee?w=800',
    workingHours: '24/7',
    doctors: 320
  },
  {
    id: 'h10',
    name: 'Narayana Health City',
    address: '258/A, Bommasandra Industrial Area, Anekal Taluk',
    city: 'Bengaluru',
    state: 'Karnataka',
    phone: '+91-80-7122-2222',
    email: 'info@narayanahealth.org',
    specialties: ['Cardiac Surgery', 'Nephrology', 'Neurosurgery', 'Pediatric Cardiology', 'Transplant'],
    beds: { total: 3000, occupied: 2671, available: 329, icu: 250, icuAvailable: 41 },
    emergency: true,
    location: { lat: 12.8170, lng: 77.6828 },
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800',
    workingHours: '24/7',
    doctors: 800
  },

  // ── HYDERABAD ───────────────────────────────────────────────────────
  {
    id: 'h11',
    name: 'Apollo Hospitals Jubilee Hills',
    address: 'Jubilee Hills, Road No.72',
    city: 'Hyderabad',
    state: 'Telangana',
    phone: '+91-40-2360-7777',
    email: 'hyderabad@apollohospitals.com',
    specialties: ['Cardiology', 'Oncology', 'Neurology', 'Orthopedics', 'Gastroenterology'],
    beds: { total: 695, occupied: 601, available: 94, icu: 90, icuAvailable: 19 },
    emergency: true,
    location: { lat: 17.4318, lng: 78.4074 },
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
    workingHours: '24/7',
    doctors: 375
  },
  {
    id: 'h12',
    name: 'KIMS Hospitals',
    address: '1-8-31/1, Minister Road, Krishna Nagar Colony',
    city: 'Hyderabad',
    state: 'Telangana',
    phone: '+91-40-4488-5000',
    email: 'info@kimshospitals.com',
    specialties: ['Neurology', 'Cardiology', 'Orthopedics', 'Oncology', 'Nephrology'],
    beds: { total: 1000, occupied: 871, available: 129, icu: 120, icuAvailable: 22 },
    emergency: true,
    location: { lat: 17.3850, lng: 78.4867 },
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1588862114096-abc10c36849b?w=800',
    workingHours: '24/7',
    doctors: 450
  },

  // ── CHENNAI ─────────────────────────────────────────────────────────
  {
    id: 'h13',
    name: 'Apollo Hospitals Chennai',
    address: '21, Greams Lane, Off Greams Road',
    city: 'Chennai',
    state: 'Tamil Nadu',
    phone: '+91-44-2829-0200',
    email: 'chennai@apollohospitals.com',
    specialties: ['Cardiology', 'Oncology', 'Transplant', 'Orthopedics', 'Neurology'],
    beds: { total: 700, occupied: 623, available: 77, icu: 95, icuAvailable: 13 },
    emergency: true,
    location: { lat: 13.0569, lng: 80.2425 },
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1590650046871-92c887180603?w=800',
    workingHours: '24/7',
    doctors: 400
  },
  {
    id: 'h14',
    name: 'MIOT International',
    address: '4/112, Mount Poonamalle Road, Manapakkam',
    city: 'Chennai',
    state: 'Tamil Nadu',
    phone: '+91-44-4200-2288',
    email: 'info@miothospitals.com',
    specialties: ['Orthopedics', 'Cardiology', 'Neurology', 'Oncology'],
    beds: { total: 1000, occupied: 856, available: 144, icu: 100, icuAvailable: 21 },
    emergency: true,
    location: { lat: 13.0142, lng: 80.1724 },
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800',
    workingHours: '24/7',
    doctors: 300
  },

  // ── KOLKATA ─────────────────────────────────────────────────────────
  {
    id: 'h15',
    name: 'AMRI Hospitals Salt Lake',
    address: 'JC-16 & 17, Sector III, Salt Lake City',
    city: 'Kolkata',
    state: 'West Bengal',
    phone: '+91-33-6606-3800',
    email: 'info@amrihospitals.com',
    specialties: ['Cardiology', 'Neurology', 'Oncology', 'Gastroenterology', 'Nephrology'],
    beds: { total: 400, occupied: 344, available: 56, icu: 60, icuAvailable: 10 },
    emergency: true,
    location: { lat: 22.5726, lng: 88.4121 },
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800',
    workingHours: '24/7',
    doctors: 210
  },

  // ── PUNE ─────────────────────────────────────────────────────────────
  {
    id: 'h16',
    name: 'Ruby Hall Clinic',
    address: '40, Sassoon Road',
    city: 'Pune',
    state: 'Maharashtra',
    phone: '+91-20-6645-5100',
    email: 'admin@rubyhall.com',
    specialties: ['Cardiology', 'Orthopedics', 'Oncology', 'Neurology', 'Nephrology'],
    beds: { total: 600, occupied: 511, available: 89, icu: 80, icuAvailable: 15 },
    emergency: true,
    location: { lat: 18.5314, lng: 73.8758 },
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800',
    workingHours: '24/7',
    doctors: 280
  },

  // ── AHMEDABAD ────────────────────────────────────────────────────────
  {
    id: 'h17',
    name: 'UN Mehta Institute of Cardiology',
    address: 'New Civil Hospital Campus, Asarwa',
    city: 'Ahmedabad',
    state: 'Gujarat',
    phone: '+91-79-2268-1281',
    email: 'info@unmehta.com',
    specialties: ['Cardiology', 'Cardiac Surgery', 'Pediatric Cardiology', 'Vascular Surgery'],
    beds: { total: 450, occupied: 398, available: 52, icu: 65, icuAvailable: 9 },
    emergency: true,
    location: { lat: 23.0505, lng: 72.5886 },
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=800',
    workingHours: '24/7',
    doctors: 200
  },

  // ── JAIPUR ───────────────────────────────────────────────────────────
  {
    id: 'h18',
    name: 'Sawai Man Singh Hospital',
    address: 'Sawai Ram Singh Road, Ganesh Nagar',
    city: 'Jaipur',
    state: 'Rajasthan',
    phone: '+91-141-2518-888',
    email: 'info@smshospital.gov.in',
    specialties: ['Cardiology', 'Orthopedics', 'Neurology', 'Burns', 'Emergency Medicine'],
    beds: { total: 2000, occupied: 1856, available: 144, icu: 120, icuAvailable: 16 },
    emergency: true,
    location: { lat: 26.9124, lng: 75.7873 },
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800',
    workingHours: '24/7',
    doctors: 600
  },

  // ── LUCKNOW ──────────────────────────────────────────────────────────
  {
    id: 'h19',
    name: 'SGPGI Lucknow',
    address: 'Raebareli Road',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    phone: '+91-522-2668-700',
    email: 'info@sgpgi.ac.in',
    specialties: ['Neurology', 'Nephrology', 'Cardiology', 'Endocrinology', 'Gastroenterology'],
    beds: { total: 950, occupied: 831, available: 119, icu: 110, icuAvailable: 18 },
    emergency: true,
    location: { lat: 26.7600, lng: 80.9236 },
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1586041828039-b8d193d6d1fd?w=800',
    workingHours: '24/7',
    doctors: 420
  },

  // ── CHANDIGARH ───────────────────────────────────────────────────────
  {
    id: 'h20',
    name: 'PGI Chandigarh',
    address: 'Sector 12, Post Graduate Institute',
    city: 'Chandigarh',
    state: 'Punjab',
    phone: '+91-172-2755-555',
    email: 'director@pgimer.edu.in',
    specialties: ['Cardiology', 'Neurology', 'Nephrology', 'Oncology', 'Pediatrics'],
    beds: { total: 1748, occupied: 1581, available: 167, icu: 150, icuAvailable: 23 },
    emergency: true,
    location: { lat: 30.7648, lng: 76.7751 },
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1626315869436-d6781ba69d6e?w=800',
    workingHours: '24/7',
    doctors: 700
  },

  // ── KOCHI ─────────────────────────────────────────────────────────────
  {
    id: 'h21',
    name: 'Amrita Institute of Medical Sciences',
    address: 'AIMS Ponekkara P.O.',
    city: 'Kochi',
    state: 'Kerala',
    phone: '+91-484-285-3914',
    email: 'info@aims.amrita.edu',
    specialties: ['Cardiology', 'Neurology', 'Oncology', 'Transplant', 'Pediatrics'],
    beds: { total: 1300, occupied: 1139, available: 161, icu: 140, icuAvailable: 25 },
    emergency: true,
    location: { lat: 9.9967, lng: 76.3068 },
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800',
    workingHours: '24/7',
    doctors: 550
  },

  // ── BHOPAL / INDORE ───────────────────────────────────────────────────
  {
    id: 'h22',
    name: 'Bombay Hospital Indore',
    address: '14, Ring Road, Indore',
    city: 'Indore',
    state: 'Madhya Pradesh',
    phone: '+91-731-404-0404',
    email: 'info@bombayhospitalindore.com',
    specialties: ['Cardiology', 'Oncology', 'Orthopedics', 'Neurology'],
    beds: { total: 400, occupied: 341, available: 59, icu: 55, icuAvailable: 11 },
    emergency: true,
    location: { lat: 22.7196, lng: 75.8577 },
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800',
    workingHours: '24/7',
    doctors: 180
  },
];

export const doctors: Doctor[] = [
  {
    id: 'd1',
    name: 'Dr. Devi Prasad Shetty',
    specialty: 'Cardiac Surgery',
    hospitalId: 'h10',
    hospitalName: 'Narayana Health City',
    qualification: 'MS, M.Ch (Cardiac Surgery), FRCS',
    experience: 38,
    rating: 4.9,
    consultationFee: 3000,
    available: true,
    nextAvailable: 'Today, 4:00 PM',
    languages: ['English', 'Hindi', 'Kannada'],
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
    location: { lat: 12.8170, lng: 77.6828 }
  },
  {
    id: 'd2',
    name: 'Dr. Priya Sharma',
    specialty: 'Oncology',
    hospitalId: 'h1',
    hospitalName: 'AIIMS New Delhi',
    qualification: 'MD, DM (Medical Oncology)',
    experience: 14,
    rating: 4.8,
    consultationFee: 2000,
    available: true,
    nextAvailable: 'Tomorrow, 10:00 AM',
    languages: ['English', 'Hindi', 'Bengali'],
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
    location: { lat: 28.5672, lng: 77.2100 }
  },
  {
    id: 'd3',
    name: 'Dr. Naresh Trehan',
    specialty: 'Cardiology',
    hospitalId: 'h5',
    hospitalName: 'Max Super Specialty Hospital',
    qualification: 'MBBS, M.Ch (CTVS), FACC',
    experience: 40,
    rating: 4.9,
    consultationFee: 5000,
    available: true,
    nextAvailable: 'Today, 2:00 PM',
    languages: ['English', 'Hindi'],
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400',
    location: { lat: 28.5274, lng: 77.2159 }
  },
  {
    id: 'd4',
    name: 'Dr. Sunita Reddy',
    specialty: 'Orthopedics',
    hospitalId: 'h9',
    hospitalName: 'Manipal Hospital Bengaluru',
    qualification: 'MS (Orthopedics), FELLOW Joint Replacement',
    experience: 16,
    rating: 4.7,
    consultationFee: 1500,
    available: false,
    nextAvailable: 'Thursday, 11:00 AM',
    languages: ['English', 'Hindi', 'Kannada', 'Telugu'],
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400',
    location: { lat: 12.9700, lng: 77.6099 }
  },
  {
    id: 'd5',
    name: 'Dr. Vikram Singh',
    specialty: 'Neurology',
    hospitalId: 'h2',
    hospitalName: 'Fortis Escorts Heart Institute',
    qualification: 'MD, DM (Neurology), FRCP (Edin)',
    experience: 22,
    rating: 4.9,
    consultationFee: 2500,
    available: true,
    nextAvailable: 'Today, 5:00 PM',
    languages: ['English', 'Hindi', 'Punjabi'],
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400',
    location: { lat: 28.5662, lng: 77.2831 }
  },
  {
    id: 'd6',
    name: 'Dr. Anjali Rao',
    specialty: 'Pediatrics',
    hospitalId: 'h6',
    hospitalName: 'Kokilaben Dhirubhai Ambani Hospital',
    qualification: 'MD (Pediatrics), DNB, Fellowship (UK)',
    experience: 13,
    rating: 4.8,
    consultationFee: 1200,
    available: true,
    nextAvailable: 'Today, 3:00 PM',
    languages: ['English', 'Hindi', 'Marathi'],
    image: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400',
    location: { lat: 19.1197, lng: 72.8468 }
  },
  {
    id: 'd7',
    name: 'Dr. Suresh Menon',
    specialty: 'Nephrology',
    hospitalId: 'h11',
    hospitalName: 'Apollo Hospitals Jubilee Hills',
    qualification: 'MD, DM (Nephrology), FASN',
    experience: 18,
    rating: 4.6,
    consultationFee: 1800,
    available: true,
    nextAvailable: 'Tomorrow, 11:00 AM',
    languages: ['English', 'Hindi', 'Malayalam', 'Telugu'],
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400',
    location: { lat: 17.4318, lng: 78.4074 }
  },
  {
    id: 'd8',
    name: 'Dr. Kavita Iyer',
    specialty: 'Dermatology',
    hospitalId: 'h13',
    hospitalName: 'Apollo Hospitals Chennai',
    qualification: 'MD (Dermatology), FRCP (London)',
    experience: 10,
    rating: 4.7,
    consultationFee: 1100,
    available: true,
    nextAvailable: 'Today, 6:00 PM',
    languages: ['English', 'Tamil', 'Telugu'],
    image: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400',
    location: { lat: 13.0569, lng: 80.2425 }
  }
];

export const camps: Camp[] = [
  {
    id: 'c1',
    name: 'Free Cardiac Checkup Camp',
    date: '2026-04-05',
    time: '9:00 AM - 4:00 PM',
    location: 'Community Hall, Sector 15',
    city: 'Gurgaon',
    state: 'Haryana',
    services: ['ECG', 'Blood Pressure', 'Sugar Test', 'Cardiac Consultation'],
    hospital: 'Fortis Memorial Hospital',
    registration: 'Free'
  },
  {
    id: 'c2',
    name: 'Diabetes Awareness & Screening',
    date: '2026-04-10',
    time: '8:00 AM - 2:00 PM',
    location: 'Narayana Health City Ground Floor',
    city: 'Bengaluru',
    state: 'Karnataka',
    services: ['Blood Sugar Test', 'HbA1c', 'Diet Consultation', 'Eye Checkup'],
    hospital: 'Narayana Health City',
    registration: 'Free'
  },
  {
    id: 'c3',
    name: 'Women Health Camp',
    date: '2026-04-15',
    time: '10:00 AM - 5:00 PM',
    location: 'Apollo Hospitals Chennai Campus',
    city: 'Chennai',
    state: 'Tamil Nadu',
    services: ['Mammography', 'Pap Smear', 'Bone Density', 'Gynecology Consultation'],
    hospital: 'Apollo Hospitals Chennai',
    registration: '₹500'
  },
  {
    id: 'c4',
    name: 'Child Health Camp',
    date: '2026-04-20',
    time: '9:00 AM - 3:00 PM',
    location: 'Kokilaben Hospital Annex',
    city: 'Mumbai',
    state: 'Maharashtra',
    services: ['General Checkup', 'Vaccination', 'Nutrition Advice', 'Eye/Ear Screening'],
    hospital: 'Kokilaben Dhirubhai Ambani Hospital',
    registration: 'Free'
  },
  {
    id: 'c5',
    name: 'Senior Citizen Health Check',
    date: '2026-04-25',
    time: '8:00 AM - 1:00 PM',
    location: 'AMRI Hospitals Annexe',
    city: 'Kolkata',
    state: 'West Bengal',
    services: ['Complete Blood Count', 'ECG', 'Thyroid', 'Orthopedic Consultation'],
    hospital: 'AMRI Hospitals Salt Lake',
    registration: '₹300'
  }
];

export const emergencyNumbers: EmergencyNumber[] = [
  { id: 'e1', state: 'All India', type: 'ambulance', number: '102', description: 'National Ambulance Service' },
  { id: 'e2', state: 'All India', type: 'ambulance', number: '108', description: 'Emergency Ambulance' },
  { id: 'e3', state: 'All India', type: 'police', number: '100', description: 'Police Emergency' },
  { id: 'e4', state: 'All India', type: 'fire', number: '101', description: 'Fire Emergency' },
  { id: 'e5', state: 'All India', type: 'disaster', number: '112', description: 'Disaster Management' },
  { id: 'e6', state: 'Delhi', type: 'medical', number: '103', description: 'Delhi Medical Helpline' },
  { id: 'e7', state: 'Maharashtra', type: 'medical', number: '104', description: 'Maharashtra Health Helpline' },
  { id: 'e8', state: 'Karnataka', type: 'medical', number: '104', description: 'Karnataka Medical Helpline' },
  { id: 'e9', state: 'Haryana', type: 'medical', number: '104', description: 'Haryana Health Helpline' },
  { id: 'e10', state: 'Tamil Nadu', type: 'medical', number: '104', description: 'Tamil Nadu Health Helpline' },
  { id: 'e11', state: 'West Bengal', type: 'medical', number: '102', description: 'West Bengal Health Helpline' },
  { id: 'e12', state: 'All India', type: 'medical', number: '1800-180-1111', description: 'National Health Helpline' }
];

export const specialties = [
  'Cardiology', 'Oncology', 'Neurology', 'Orthopedics', 'Pediatrics',
  'Nephrology', 'Gastroenterology', 'Dermatology', 'Ophthalmology',
  'Pulmonology', 'Gynecology', 'Urology', 'ENT', 'Psychiatry', 'General Medicine'
];

export const states = [
  'All India', 'Delhi', 'Haryana', 'Maharashtra', 'Karnataka',
  'Tamil Nadu', 'West Bengal', 'Uttar Pradesh', 'Gujarat', 'Rajasthan',
  'Punjab', 'Madhya Pradesh', 'Telangana', 'Kerala'
];

// ── BLOG POSTS ───────────────────────────────────────────────────────────────
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  image: string;
  tag: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: 'b1',
    title: 'Understanding Heart Disease: Early Warning Signs You Must Not Ignore',
    excerpt: 'Cardiovascular disease remains India\'s leading cause of death. Learn the 7 early warning signs that can save your life and when to seek emergency care immediately.',
    category: 'Cardiology',
    author: 'Dr. Amit Kumar',
    authorRole: 'Sr. Cardiologist, AIIMS Delhi',
    date: 'March 28, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=800',
    tag: 'Must Read'
  },
  {
    id: 'b2',
    title: 'AI in Healthcare: How Gemini is Revolutionizing Diagnosis in India',
    excerpt: 'Artificial intelligence is transforming how doctors diagnose conditions. Explore how ZyntraCare\'s Gemini AI integration is reducing misdiagnosis rates by 40% across partner hospitals.',
    category: 'Technology',
    author: 'Dr. Priya Sharma',
    authorRole: 'Head of Digital Health, Max Hospital',
    date: 'March 24, 2026',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1655720035861-ba4fd21a598d?w=800',
    tag: 'Trending'
  },
  {
    id: 'b3',
    title: 'Monsoon Health Alert: 8 Diseases That Spike During Rainy Season',
    excerpt: 'Dengue, malaria, typhoid, and leptospirosis surge each monsoon. Our public health experts break down prevention strategies and when you should visit a hospital immediately.',
    category: 'Public Health',
    author: 'Dr. Rajesh Patel',
    authorRole: 'Infectious Disease Specialist',
    date: 'March 20, 2026',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=800',
    tag: 'Seasonal'
  },
  {
    id: 'b4',
    title: 'The Complete Guide to Managing Diabetes in Modern India',
    excerpt: 'India has 77 million diabetics. This comprehensive guide covers diet, exercise, medication management, and how continuous glucose monitoring is changing lives.',
    category: 'Endocrinology',
    author: 'Dr. Sunita Reddy',
    authorRole: 'Diabetologist, Manipal Hospital',
    date: 'March 15, 2026',
    readTime: '10 min read',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800',
    tag: 'In-Depth'
  },
  {
    id: 'b5',
    title: 'Mental Health Crisis in Urban India: Breaking the Silence',
    excerpt: 'Depression affects over 56 million Indians. We speak to psychiatrists, survivors, and policymakers about why seeking help is now easier — and why stigma still kills.',
    category: 'Mental Health',
    author: 'Dr. Anjali Rao',
    authorRole: 'Psychiatrist, NIMHANS Bengaluru',
    date: 'March 10, 2026',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1620228885847-9eab2a1adddc?w=800',
    tag: 'Awareness'
  },
  {
    id: 'b6',
    title: 'Real-Time Hospital Bed Tracking: How We Built India\'s First Live Dashboard',
    excerpt: 'Behind the scenes of ZyntraCare\'s real-time bed availability system. How we partnered with 500+ hospitals to give patients critical information in seconds.',
    category: 'Innovation',
    author: 'ZyntraCare Engineering',
    authorRole: 'Platform Team',
    date: 'March 5, 2026',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    tag: 'Behind The Scenes'
  },
];

// ── VIDEO MASTERCLASS ─────────────────────────────────────────────────────────
export interface VideoMasterclass {
  id: string;
  title: string;
  description: string;
  host: string;
  hostRole: string;
  duration: string;
  category: string;
  thumbnail: string;
  isLive?: boolean;
  scheduledDate?: string;
  viewCount?: string;
  isPremium: boolean;
}

export const videoMasterclasses: VideoMasterclass[] = [
  {
    id: 'v1',
    title: 'Heart Health Masterclass: Bypass Surgery Explained',
    description: 'Dr. Devi Prasad Shetty walks through an entire bypass surgery procedure, explaining every step in patient-friendly language. No medical background required.',
    host: 'Dr. Devi Prasad Shetty',
    hostRole: 'Founder, Narayana Health | World\'s Leading Cardiac Surgeon',
    duration: '45 min',
    category: 'Cardiology',
    thumbnail: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=800',
    viewCount: '2.4M',
    isPremium: false,
  },
  {
    id: 'v2',
    title: 'LIVE: AI-Powered Cancer Detection — Q&A with Oncologists',
    description: 'Join our panel of oncologists live as they demonstrate how AI is detecting early-stage cancers with 94% accuracy. Submit your questions in real-time.',
    host: 'Dr. Priya Sharma',
    hostRole: 'Head of Oncology, AIIMS New Delhi',
    duration: 'LIVE',
    category: 'Oncology',
    thumbnail: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=800',
    isLive: true,
    scheduledDate: 'April 5, 2026 • 7:00 PM IST',
    isPremium: false,
  },
  {
    id: 'v3',
    title: 'The Gut-Brain Connection: Mental Health Through Nutrition',
    description: 'Your gut is your second brain. This masterclass reveals the science behind the microbiome-mood connection, with actionable dietary changes you can start today.',
    host: 'Dr. Anjali Rao',
    hostRole: 'Gastroenterologist & Nutritional Psychiatrist',
    duration: '38 min',
    category: 'Mental Health',
    thumbnail: 'https://images.unsplash.com/photo-1493815793585-d94ccbc86df8?w=800',
    viewCount: '891K',
    isPremium: true,
  },
  {
    id: 'v4',
    title: 'Decoding Your Blood Report: What Doctors Look For',
    description: 'Every number in your CBC, lipid profile, and thyroid panel has a story. Dr. Vikram Singh makes blood report interpretation accessible for everyone.',
    host: 'Dr. Vikram Singh',
    hostRole: 'Internal Medicine Specialist, Max Hospital',
    duration: '52 min',
    category: 'General Medicine',
    thumbnail: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800',
    viewCount: '1.1M',
    isPremium: false,
  },
  {
    id: 'v5',
    title: 'COMING SOON: Genomics & Personalized Medicine in India',
    description: 'How DNA testing is making treatments 3x more effective. A deep dive into pharmacogenomics with India\'s leading researchers. Launching April 15, 2026.',
    host: 'Dr. Suresh Menon',
    hostRole: 'Genomics Researcher, PGI Chandigarh',
    duration: '60 min',
    category: 'Genomics',
    thumbnail: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800',
    scheduledDate: 'April 15, 2026',
    isPremium: true,
  },
];