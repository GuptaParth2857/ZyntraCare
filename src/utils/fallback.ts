const LAB_BRANDS = [
  'Dr. Lal PathLabs', 'SRL Diagnostics', 'Metropolis', 'Thyrocare',
  'Apollo Diagnostics', 'Fortis Lab', 'Max Lab', 'Core Diagnostics',
  'Suburban Diagnostics', 'PathKind Labs', 'Quest Diagnostics',
  'Redcliffe Labs', 'PhleboIndia', 'Maharishi Lab',
];

const PHARMACY_BRANDS = [
  'Apollo Pharmacy', 'MedPlus Pharmacy', '1mg Pharmacy',
  'Netmeds Store', 'Jan Aushadhi Kendra', 'Fortis Pharmacy',
  'Wellness Forever Pharma', 'Guardian Pharmacy', 'HealthCare Pharmacy',
  'Generic Aadhaar', 'City Medico', 'LifeCare Pharmacy',
];

const TEST_PANELS = [
  ['Blood Test', 'CBC', 'Thyroid', 'Diabetes'],
  ['Blood Test', 'Lipid Profile', 'Liver Function', 'Kidney Function'],
  ['Blood Test', 'Thyroid', 'Vitamin', 'Hormone'],
  ['MRI', 'CT Scan', 'X-Ray', 'Ultrasound'],
  ['Blood Test', 'ECG', 'Diabetes', 'Lipid Profile'],
  ['Blood Test', 'Thyroid', 'Urine Test', 'Infection'],
  ['Cancer Screening', 'Genetic Test', 'Hormone', 'Vitamin'],
  ['Blood Test', 'Allergy', 'Infection', 'Dengue'],
];

export function generateNearbyLabs(lat: number, lng: number, radiusKm: number, count = 12) {
  const results: any[] = [];
  const used = new Set<string>();

  for (let i = 0; i < count * 3 && results.length < count; i++) {
    const brand = LAB_BRANDS[i % LAB_BRANDS.length];
    const suffix = ['Lab', 'Diagnostics', 'Clinic', 'Center', 'Pathology'][i % 5];
    const name = `${brand} ${suffix}`;
    if (used.has(name)) continue;
    used.add(name);

    const angle = (i * 137.5) % 360;
    const dist = (0.3 + (i % 8) * 1.1) * (radiusKm / 10);
    if (dist > radiusKm) continue;

    const offsetLat = (dist / 111.32) * Math.cos(angle * Math.PI / 180);
    const offsetLng = (dist / (111.32 * Math.cos(lat * Math.PI / 180))) * Math.sin(angle * Math.PI / 180);

    results.push({
      id: `fb-lab-${i}`,
      name,
      address: `Near ${suffix}, ${getCityName(lat, lng)}`,
      city: getCityName(lat, lng),
      phone: `+91-${String(1000000000 + Math.floor(Math.random() * 900000000))}`,
      location: { lat: lat + offsetLat, lng: lng + offsetLng },
      distance: parseFloat(dist.toFixed(1)),
      tests: TEST_PANELS[i % TEST_PANELS.length],
      homeCollection: i % 3 !== 0,
      reportsIn: `${[4, 6, 8, 10, 12, 24][i % 6]} hours`,
      rating: parseFloat((4 + Math.random()).toFixed(1)),
    });
  }
  return results.sort((a, b) => a.distance - b.distance);
}

export function generateNearbyPharmacies(lat: number, lng: number, radiusKm: number, count = 10) {
  const results: any[] = [];
  const used = new Set<string>();

  for (let i = 0; i < count * 3 && results.length < count; i++) {
    const brand = PHARMACY_BRANDS[i % PHARMACY_BRANDS.length];
    const suffix = ['Store', 'Pharmacy', 'Medical Store', 'Chemist', 'Drug Store'][i % 5];
    const name = `${brand} ${suffix}`;
    if (used.has(name)) continue;
    used.add(name);

    const angle = (i * 193.7) % 360;
    const dist = (0.2 + (i % 7) * 1.3) * (radiusKm / 10);
    if (dist > radiusKm) continue;

    const offsetLat = (dist / 111.32) * Math.cos(angle * Math.PI / 180);
    const offsetLng = (dist / (111.32 * Math.cos(lat * Math.PI / 180))) * Math.sin(angle * Math.PI / 180);

    results.push({
      id: `fb-pharm-${i}`,
      name,
      address: `${getCityName(lat, lng)} - ${suffix}`,
      city: getCityName(lat, lng),
      phone: `+91-${String(1000000000 + Math.floor(Math.random() * 900000000))}`,
      location: { lat: lat + offsetLat, lng: lng + offsetLng },
      distance: parseFloat(dist.toFixed(1)),
      open24x7: i % 4 === 0,
      rating: parseFloat((4 + Math.random()).toFixed(1)),
      deliveryAvailable: i % 2 === 0,
      isOnline: i % 3 === 0,
    });
  }
  return results.sort((a, b) => a.distance - b.distance);
}

function getCityName(lat: number, lng: number): string {
  const CITIES = [
    { city: 'Delhi', lat: 28.6139, lng: 77.2090 },
    { city: 'Mumbai', lat: 19.0760, lng: 72.8777 },
    { city: 'Bangalore', lat: 12.9716, lng: 77.5946 },
    { city: 'Chennai', lat: 13.0827, lng: 80.2707 },
    { city: 'Kolkata', lat: 22.5726, lng: 88.3639 },
    { city: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
    { city: 'Pune', lat: 18.5204, lng: 73.8567 },
    { city: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
    { city: 'Surat', lat: 21.1702, lng: 72.8311 },
    { city: 'Jaipur', lat: 26.9124, lng: 75.7873 },
    { city: 'Lucknow', lat: 26.8467, lng: 80.9462 },
    { city: 'Patna', lat: 25.5941, lng: 85.1376 },
    { city: 'Bhopal', lat: 23.2599, lng: 77.4126 },
    { city: 'Indore', lat: 22.7196, lng: 75.8577 },
    { city: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
    { city: 'Nagpur', lat: 21.1458, lng: 79.0882 },
    { city: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
    { city: 'Kochi', lat: 9.9312, lng: 76.2673 },
    { city: 'Gurgaon', lat: 28.4595, lng: 77.0266 },
    { city: 'Noida', lat: 28.5355, lng: 77.3910 },
    { city: 'Faridabad', lat: 28.3752, lng: 77.3002 },
    { city: 'Ghaziabad', lat: 28.6692, lng: 77.4538 },
    { city: 'Greater Noida', lat: 28.4744, lng: 77.5040 },
  ];

  let closest = 'Your Area';
  let minDist = Infinity;
  for (const c of CITIES) {
    const d = Math.sqrt(Math.pow(lat - c.lat, 2) + Math.pow(lng - c.lng, 2));
    if (d < minDist) { minDist = d; closest = c.city; }
  }
  return minDist < 0.5 ? closest : 'Your Area';
}

const PET_CLINIC_BRANDS = [
  'Paws & Claws Pet Clinic', 'Creature Comforts Pet Clinic', 'PetVet Pet Clinic',
  'Animal Wellness Pet Centre', 'Dr. Doggy Pet Hospital', 'All Creatures Pet Clinic',
  'Furry Friends Pet Clinic', 'Tails & Whiskers Pet Clinic', 'Pet Health Hub',
  'Happy Paws Pet Clinic', 'Critter Care Pet Clinic', 'PetCare Center',
  'PetLife Pet Clinic', 'Animal Aid Pet Clinic',
];

const PET_SHOP_BRANDS = [
  'Paws & Claws Pet Store', 'Happy Tails Pet Shop', 'Pet Planet',
  'Animal Kingdom Store', 'Furry Tails Pet Supplies', 'PetMart',
  'The Pet Store', 'Puppy Love Shop', 'AquaTerra Pets',
  'Feathers & Fur', 'Pet Bazaar', 'Pet Junction',
  'Paws n Claws Pet Supplies', 'PetVille Store',
];

export function generateNearbyPetVenues(lat: number, lng: number, radiusKm: number, count = 20) {
  const results: any[] = [];
  const used = new Set<string>();

  // Vet clinics/hospitals
  for (let i = 0; i < count * 3 && results.length < count; i++) {
    const brand = PET_CLINIC_BRANDS[i % PET_CLINIC_BRANDS.length];
    const name = `${brand}`;
    if (used.has(name)) continue;
    used.add(name);

    const angle = (i * 127.5) % 360;
    const dist = (0.2 + (i % 6) * 1.5) * (radiusKm / 10);
    if (dist > radiusKm) continue;

    const offsetLat = (dist / 111.32) * Math.cos(angle * Math.PI / 180);
    const offsetLng = (dist / (111.32 * Math.cos(lat * Math.PI / 180))) * Math.sin(angle * Math.PI / 180);

    results.push({
      id: `fb-pet-vet-${i}`,
      name,
      address: `${getCityName(lat, lng)} - Pet Clinic`,
      city: getCityName(lat, lng),
      phone: `+91-${String(1000000000 + Math.floor(Math.random() * 900000000))}`,
      lat: lat + offsetLat,
      lng: lng + offsetLng,
      distance: parseFloat(dist.toFixed(1)),
      category: 'vet',
      icon: '🏥',
      type: 'clinic',
    });
  }

  // Pet shops
  for (let i = 0; i < count * 2 && results.length < Math.round(count * 1.5); i++) {
    const brand = PET_SHOP_BRANDS[i % PET_SHOP_BRANDS.length];
    const name = `${brand}`;
    if (used.has(name)) continue;
    used.add(name);

    const angle = (i * 173.5) % 360;
    const dist = (0.3 + (i % 5) * 1.8) * (radiusKm / 10);
    if (dist > radiusKm) continue;

    const offsetLat = (dist / 111.32) * Math.cos(angle * Math.PI / 180);
    const offsetLng = (dist / (111.32 * Math.cos(lat * Math.PI / 180))) * Math.sin(angle * Math.PI / 180);

    results.push({
      id: `fb-pet-shop-${i}`,
      name,
      address: `${getCityName(lat, lng)} - Pet Store`,
      city: getCityName(lat, lng),
      phone: `+91-${String(1000000000 + Math.floor(Math.random() * 900000000))}`,
      lat: lat + offsetLat,
      lng: lng + offsetLng,
      distance: parseFloat(dist.toFixed(1)),
      category: 'pet_shop',
      icon: '🐾',
      type: 'clinic',
    });
  }

  return results.sort((a: any, b: any) => a.distance - b.distance);
}

export function generateNearbyAll(
  lat: number, lng: number, radiusKm: number,
  filterType: 'all' | 'hospital' | 'lab' | 'pharmacy' = 'all'
) {
  const results: any[] = [];

  if (filterType === 'all' || filterType === 'hospital') {
    const HOSPITAL_NAMES = ['Fortis Hospital', 'Medanta Hospital', 'Sarvodaya Hospital', 'Asian Hospital', 'Metro Hospital', 'City Hospital', 'National Hospital', 'Prime Hospital', 'Global Hospital', 'LifeCare Hospital'];
    for (let i = 0; i < 5; i++) {
      const angle = (i * 157.3) % 360;
      const dist = 0.5 + i * 1.2;
      if (dist > radiusKm) continue;
      const offsetLat = (dist / 111.32) * Math.cos(angle * Math.PI / 180);
      const offsetLng = (dist / (111.32 * Math.cos(lat * Math.PI / 180))) * Math.sin(angle * Math.PI / 180);
      results.push({
        id: `fb-hosp-${i}`, name: HOSPITAL_NAMES[i % HOSPITAL_NAMES.length], type: 'hospital' as const,
        address: `${getCityName(lat, lng)} Main Road`, city: getCityName(lat, lng),
        phone: `+91-${String(1000000000 + Math.floor(Math.random() * 900000000))}`,
        location: { lat: lat + offsetLat, lng: lng + offsetLng },
        distance: parseFloat(dist.toFixed(1)), specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics'].slice(0, 2 + i % 3),
        emergency: i % 2 === 0, rating: parseFloat((4 + Math.random()).toFixed(1)), workingHours: '24/7',
      });
    }
  }

  if (filterType === 'all' || filterType === 'lab') {
    const labs = generateNearbyLabs(lat, lng, radiusKm, 4);
    for (const l of labs) {
      results.push({ ...l, type: 'lab' as const });
    }
  }

  if (filterType === 'all' || filterType === 'pharmacy') {
    const pharms = generateNearbyPharmacies(lat, lng, radiusKm, 4);
    for (const p of pharms) {
      results.push({ ...p, type: 'pharmacy' as const, open24Hours: p.open24x7 });
    }
  }

  return results.sort((a, b) => a.distance - b.distance);
}
