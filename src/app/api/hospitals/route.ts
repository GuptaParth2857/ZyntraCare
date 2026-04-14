import { NextRequest, NextResponse } from 'next/server';

function calculateHaversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchRealHospitalsFromOSM(lat: number, lng: number, radius: number = 30000) {
  const query = `[out:json][timeout:15];
    (
      node["amenity"="hospital"](around:${radius},${lat},${lng});
      way["amenity"="hospital"](around:${radius},${lat},${lng});
      node["amenity"="clinic"](around:${radius},${lat},${lng});
    );
    out center 30;`;

  try {
    const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`, {
      signal: AbortSignal.timeout(15000)
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.elements || [])
      .filter((el: any) => el.tags?.name)
      .map((el: any) => {
        const hLat = el.lat ?? el.center?.lat;
        const hLng = el.lon ?? el.center?.lon;
        return {
          id: `OSM_${el.id}`,
          name: el.tags.name,
          city: el.tags['addr:city'] || 'Nearby',
          state: el.tags['addr:state'] || 'India',
          location: { lat: hLat, lng: hLng },
          type: el.tags.amenity === 'hospital' ? 'Hospital' : 'Clinic',
          rating: 0,
          beds: { total: 0, available: 0, icu: 0, icuAvailable: 0 },
          specialties: [],
          phone: el.tags['contact:phone'] || el.tags.phone || '',
          emergency: el.tags.emergency === 'yes',
          ambulance: el.tags['emergency:ambulance'] === 'yes',
          verified: false,
          waitTime: 'N/A',
          established: 0,
          distance: calculateHaversine(lat, lng, hLat, hLng),
        };
      })
      .sort((a: any, b: any) => a.distance - b.distance)
      .slice(0, 20);
  } catch (e) {
    console.error('OSM fetch error:', e);
    return null;
  }
}
function generateHospital(
  id: number,
  name: string,
  city: string,
  state: string,
  lat: number,
  lng: number,
  type: string,
  beds: number,
  specialties: string[]
) {
  return {
    id: `HOSP_${String(id).padStart(4, '0')}`,
    name,
    city,
    state,
    location: { lat: lat + (Math.random() - 0.5) * 0.05, lng: lng + (Math.random() - 0.5) * 0.05 },
    type,
    rating: +(3.5 + Math.random() * 1.5).toFixed(1),
    beds: { total: beds, available: Math.floor(beds * (0.1 + Math.random() * 0.4)), icu: Math.floor(beds * 0.08), icuAvailable: Math.floor(beds * 0.02) },
    specialties,
    phone: `+91 ${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    emergency: Math.random() > 0.2,
    ambulance: Math.random() > 0.3,
    verified: Math.random() > 0.15,
    waitTime: `${Math.floor(10 + Math.random() * 50)} min`,
    established: 1960 + Math.floor(Math.random() * 60),
  };
}

const BASE_HOSPITALS = [
  // Delhi NCR
  { name: 'AIIMS New Delhi', city: 'Delhi', state: 'Delhi', lat: 28.5672, lng: 77.2100, type: 'Government', beds: 2478, specs: ['Cardiology', 'Oncology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Trauma'] },
  { name: 'Safdarjung Hospital', city: 'Delhi', state: 'Delhi', lat: 28.5685, lng: 77.2066, type: 'Government', beds: 1531, specs: ['Surgery', 'Medicine', 'Obstetrics', 'Pediatrics'] },
  { name: 'RML Hospital', city: 'Delhi', state: 'Delhi', lat: 28.6271, lng: 77.2110, type: 'Government', beds: 1500, specs: ['Emergency', 'Surgery', 'Medicine', 'Orthopedics'] },
  { name: 'Fortis Memorial Hospital Gurugram', city: 'Gurugram', state: 'Haryana', lat: 28.4744, lng: 77.0266, type: 'Private', beds: 1000, specs: ['Cardiology', 'Neurology', 'Oncology', 'Bone Marrow Transplant'] },
  { name: 'Max Super Speciality Hospital Saket', city: 'Delhi', state: 'Delhi', lat: 28.5264, lng: 77.2138, type: 'Private', beds: 500, specs: ['Cancer Care', 'Heart Surgery', 'Neurosciences', 'Renal Sciences'] },
  { name: 'Apollo Hospital Delhi', city: 'Delhi', state: 'Delhi', lat: 28.5983, lng: 77.2256, type: 'Private', beds: 710, specs: ['Cardiology', 'Robotic Surgery', 'Liver Transplant', 'Bone Marrow'] },
  { name: 'Medanta The Medicity', city: 'Gurugram', state: 'Haryana', lat: 28.4421, lng: 77.0177, type: 'Private', beds: 1650, specs: ['Cardiology', 'Transplant', 'Oncology', 'Neurology', 'Orthopedics'] },
  { name: 'BLK Super Speciality Hospital', city: 'Delhi', state: 'Delhi', lat: 28.6513, lng: 77.1870, type: 'Private', beds: 650, specs: ['Bone Marrow Transplant', 'Cardiac', 'Neuro', 'Gastro'] },
  { name: 'Sir Ganga Ram Hospital', city: 'Delhi', state: 'Delhi', lat: 28.6431, lng: 77.1888, type: 'Private', beds: 675, specs: ['General Medicine', 'Surgery', 'Gynecology', 'Pediatrics'] },
  { name: 'Indraprastha Apollo', city: 'Delhi', state: 'Delhi', lat: 28.5490, lng: 77.2820, type: 'Private', beds: 710, specs: ['Cardiology', 'Oncology', 'Neurology'] },
  // Mumbai
  { name: 'KEM Hospital Mumbai', city: 'Mumbai', state: 'Maharashtra', lat: 18.9956, lng: 72.8361, type: 'Government', beds: 1800, specs: ['General Medicine', 'Surgery', 'Pediatrics', 'Psychiatry'] },
  { name: 'Lokmanya Tilak Hospital Sion', city: 'Mumbai', state: 'Maharashtra', lat: 19.0421, lng: 72.8649, type: 'Government', beds: 1500, specs: ['Medicine', 'Surgery', 'Obstetrics', 'Orthopedics'] },
  { name: 'Tata Memorial Hospital', city: 'Mumbai', state: 'Maharashtra', lat: 18.9987, lng: 72.8129, type: 'Government', beds: 629, specs: ['Oncology', 'Hematology', 'Radiation Therapy'] },
  { name: 'Kokilaben Dhirubhai Ambani Hospital', city: 'Mumbai', state: 'Maharashtra', lat: 19.1327, lng: 72.8272, type: 'Private', beds: 750, specs: ['Cardiac', 'Neuroscience', 'Oncology', 'Orthopedics'] },
  { name: 'Lilavati Hospital', city: 'Mumbai', state: 'Maharashtra', lat: 19.0470, lng: 72.8258, type: 'Private', beds: 323, specs: ['Cardiology', 'Oncology', 'Neurology', 'Spine'] },
  { name: 'Nanavati Hospital Mumbai', city: 'Mumbai', state: 'Maharashtra', lat: 19.0831, lng: 72.8419, type: 'Private', beds: 350, specs: ['Cardiac', 'Orthopedics', 'Gastroenterology'] },
  { name: 'Breach Candy Hospital', city: 'Mumbai', state: 'Maharashtra', lat: 18.9687, lng: 72.8068, type: 'Private', beds: 300, specs: ['General', 'Maternity', 'Pediatrics'] },
  { name: 'Hinduja Hospital', city: 'Mumbai', state: 'Maharashtra', lat: 19.0062, lng: 72.8293, type: 'Private', beds: 351, specs: ['Oncology', 'Neurology', 'Transplant'] },
  // Bengaluru
  { name: 'Victoria Hospital Bangalore', city: 'Bengaluru', state: 'Karnataka', lat: 12.9601, lng: 77.5700, type: 'Government', beds: 1350, specs: ['General Medicine', 'Surgery', 'Pediatrics'] },
  { name: 'Bowring and Lady Curzon Hospital', city: 'Bengaluru', state: 'Karnataka', lat: 12.9762, lng: 77.6000, type: 'Government', beds: 950, specs: ['Medicine', 'Surgery', 'Psychiatry'] },
  { name: 'Manipal Hospitals Bangalore', city: 'Bengaluru', state: 'Karnataka', lat: 12.9457, lng: 77.6015, type: 'Private', beds: 600, specs: ['Cardiac', 'Neuro', 'Ortho', 'Transplant'] },
  { name: 'Apollo Hospitals Bannerghatta', city: 'Bengaluru', state: 'Karnataka', lat: 12.8706, lng: 77.5957, type: 'Private', beds: 500, specs: ['Cardiology', 'Oncology', 'Neurology'] },
  { name: 'Fortis Hospital Bannerghatta', city: 'Bengaluru', state: 'Karnataka', lat: 12.8707, lng: 77.5966, type: 'Private', beds: 280, specs: ['Cardiac', 'Oncology', 'Neurology'] },
  { name: 'Narayana Health City', city: 'Bengaluru', state: 'Karnataka', lat: 12.9079, lng: 77.6389, type: 'Private', beds: 2000, specs: ['Cardiac', 'Transplant', 'Oncology', 'Neurology'] },
  { name: 'St John\'s Medical College Hospital', city: 'Bengaluru', state: 'Karnataka', lat: 12.9200, lng: 77.6100, type: 'Private', beds: 1200, specs: ['Medicine', 'Surgery', 'Pediatrics', 'Gynecology'] },
  // Chennai
  { name: 'Government General Hospital Chennai', city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, type: 'Government', beds: 2665, specs: ['General Medicine', 'Trauma', 'Surgery', 'Pediatrics'] },
  { name: 'Apollo Hospitals Chennai', city: 'Chennai', state: 'Tamil Nadu', lat: 13.0562, lng: 80.2575, type: 'Private', beds: 700, specs: ['Cardiology', 'Oncology', 'Transplant', 'Neurology'] },
  { name: 'MIOT International', city: 'Chennai', state: 'Tamil Nadu', lat: 13.0155, lng: 80.1700, type: 'Private', beds: 1000, specs: ['Orthopedics', 'Cardiac', 'Neuro', 'Oncology'] },
  { name: 'Fortis Malar Hospital', city: 'Chennai', state: 'Tamil Nadu', lat: 12.9921, lng: 80.2429, type: 'Private', beds: 179, specs: ['Cardiac', 'Orthopedics', 'Gastro'] },
  { name: 'Sri Ramachandra Medical Centre', city: 'Chennai', state: 'Tamil Nadu', lat: 13.0350, lng: 80.1571, type: 'Private', beds: 1800, specs: ['Cardiac', 'Transplant', 'Oncology'] },
  // Kolkata  
  { name: 'SSKM Hospital Kolkata', city: 'Kolkata', state: 'West Bengal', lat: 22.5353, lng: 88.3412, type: 'Government', beds: 2200, specs: ['General Medicine', 'Surgery', 'Neurology'] },
  { name: 'Apollo Multispeciality Kolkata', city: 'Kolkata', state: 'West Bengal', lat: 22.5018, lng: 88.3832, type: 'Private', beds: 350, specs: ['Cardiology', 'Oncology', 'Transplant'] },
  { name: 'Peerless Hospital Kolkata', city: 'Kolkata', state: 'West Bengal', lat: 22.5031, lng: 88.3735, type: 'Private', beds: 450, specs: ['Cardiac', 'Neuro', 'Orthopedics'] },
  { name: 'Belle Vue Clinic', city: 'Kolkata', state: 'West Bengal', lat: 22.5276, lng: 88.3590, type: 'Private', beds: 200, specs: ['General Medicine', 'Surgery', 'Maternity'] },
  // Hyderabad
  { name: 'Osmania General Hospital', city: 'Hyderabad', state: 'Telangana', lat: 17.3830, lng: 78.4742, type: 'Government', beds: 1200, specs: ['General Medicine', 'Surgery', 'Pediatrics'] },
  { name: 'Apollo Hospitals Jubilee Hills', city: 'Hyderabad', state: 'Telangana', lat: 17.4344, lng: 78.4111, type: 'Private', beds: 600, specs: ['Cardiology', 'Oncology', 'Neurology'] },
  { name: 'Yashoda Hospital Secunderabad', city: 'Hyderabad', state: 'Telangana', lat: 17.4399, lng: 78.4983, type: 'Private', beds: 500, specs: ['Cardiac', 'Neuro', 'Gastro', 'Ortho'] },
  { name: 'KIMS Hospitals', city: 'Hyderabad', state: 'Telangana', lat: 17.4151, lng: 78.4543, type: 'Private', beds: 700, specs: ['Cardiac', 'Transplant', 'Oncology'] },
  { name: 'Care Hospitals Banjara Hills', city: 'Hyderabad', state: 'Telangana', lat: 17.4070, lng: 78.4430, type: 'Private', beds: 500, specs: ['Cardiac', 'Ortho', 'Neuro'] },
  // Ahmedabad & Gujarat
  { name: 'Civil Hospital Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', lat: 23.0583, lng: 72.5866, type: 'Government', beds: 2200, specs: ['General', 'Trauma', 'Surgery', 'Pediatrics'] },
  { name: 'Sterling Hospital Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', lat: 23.0401, lng: 72.5500, type: 'Private', beds: 570, specs: ['Cardiac', 'Ortho', 'Neuro', 'Gastro'] },
  { name: 'HCG Cancer Centre', city: 'Ahmedabad', state: 'Gujarat', lat: 23.0200, lng: 72.5600, type: 'Private', beds: 250, specs: ['Oncology', 'Radiation Therapy', 'Hematology'] },
  // Pune
  { name: 'Sassoon General Hospital Pune', city: 'Pune', state: 'Maharashtra', lat: 18.5128, lng: 73.8570, type: 'Government', beds: 1500, specs: ['General Medicine', 'Surgery', 'Trauma'] },
  { name: 'Ruby Hall Clinic Pune', city: 'Pune', state: 'Maharashtra', lat: 18.5362, lng: 73.8795, type: 'Private', beds: 450, specs: ['Cardiac', 'Neurology', 'Transplant'] },
  { name: 'KEM Hospital Pune', city: 'Pune', state: 'Maharashtra', lat: 18.5264, lng: 73.8554, type: 'Government', beds: 1200, specs: ['Medicine', 'Surgery', 'Pediatrics'] },
  { name: 'Jehangir Hospital Pune', city: 'Pune', state: 'Maharashtra', lat: 18.5309, lng: 73.8770, type: 'Private', beds: 350, specs: ['General', 'Cardiac', 'Orthopedics'] },
  // Jaipur & Rajasthan
  { name: 'SMS Medical College & Hospital', city: 'Jaipur', state: 'Rajasthan', lat: 26.9042, lng: 75.8045, type: 'Government', beds: 5000, specs: ['General', 'Surgery', 'Trauma', 'Pediatrics', 'Orthopedics'] },
  { name: 'Fortis Escorts Hospital Jaipur', city: 'Jaipur', state: 'Rajasthan', lat: 26.8927, lng: 75.7971, type: 'Private', beds: 200, specs: ['Cardiac', 'Ortho', 'Gastro'] },
  { name: 'Narayana Multispeciality Jaipur', city: 'Jaipur', state: 'Rajasthan', lat: 26.8500, lng: 75.8000, type: 'Private', beds: 300, specs: ['Cardiac', 'Neuro', 'Ortho'] },
  // Lucknow & UP
  { name: 'SGPGI Lucknow', city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8451, lng: 80.9996, type: 'Government', beds: 1500, specs: ['Nephrology', 'Cardiology', 'Neurology', 'Endocrinology'] },
  { name: 'KGMU Lucknow', city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8499, lng: 80.9485, type: 'Government', beds: 5000, specs: ['General', 'Surgery', 'Trauma', 'Pediatrics'] },
  { name: 'Medanta Hospital Lucknow', city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8139, lng: 80.9800, type: 'Private', beds: 600, specs: ['Cardiac', 'Neuro', 'Ortho', 'Oncology'] },
  // Chandigarh & Punjab
  { name: 'PGIMER Chandigarh', city: 'Chandigarh', state: 'Punjab', lat: 30.7648, lng: 76.7745, type: 'Government', beds: 2073, specs: ['Cardiology', 'Neurology', 'Hematology', 'Gastro', 'Transplant'] },
  { name: 'Fortis Hospital Mohali', city: 'Mohali', state: 'Punjab', lat: 30.7341, lng: 76.7214, type: 'Private', beds: 350, specs: ['Cardiac', 'Neuro', 'Ortho'] },
  { name: 'Max Hospital Mohali', city: 'Mohali', state: 'Punjab', lat: 30.7050, lng: 76.7200, type: 'Private', beds: 280, specs: ['Cancer', 'Heart', 'Spine'] },
];

// Generate 1000+ hospitals by expanding base hospitals across more cities
function generateHospitalDatabase() {
  const hospitals = [];
  let id = 1;

  // Add base hospitals
  for (const h of BASE_HOSPITALS) {
    hospitals.push(generateHospital(id++, h.name, h.city, h.state, h.lat, h.lng, h.type, h.beds, h.specs));
  }

  // Generate additional hospitals for 50+ cities
  const cities = [
    { city: 'Vadodara', state: 'Gujarat', lat: 22.3072, lng: 73.1812 },
    { city: 'Surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311 },
    { city: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882 },
    { city: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126 },
    { city: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577 },
    { city: 'Patna', state: 'Bihar', lat: 25.5941, lng: 85.1376 },
    { city: 'Guwahati', state: 'Assam', lat: 26.1445, lng: 91.7362 },
    { city: 'Bhubaneswar', city2: 'Bhubaneswar', state: 'Odisha', lat: 20.2961, lng: 85.8245 },
    { city: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185 },
    { city: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673 },
    { city: 'Thiruvananthapuram', state: 'Kerala', lat: 8.5241, lng: 76.9366 },
    { city: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558 },
    { city: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lng: 78.1198 },
    { city: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739 },
    { city: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lng: 78.0081 },
    { city: 'Noida', state: 'Uttar Pradesh', lat: 28.5355, lng: 77.3910 },
    { city: 'Ghaziabad', state: 'Uttar Pradesh', lat: 28.6692, lng: 77.4538 },
    { city: 'Faridabad', state: 'Haryana', lat: 28.4089, lng: 77.3178 },
    { city: 'Ranchi', state: 'Jharkhand', lat: 23.3441, lng: 85.3096 },
    { city: 'Raipur', state: 'Chhattisgarh', lat: 21.2514, lng: 81.6296 },
    { city: 'Dehradun', state: 'Uttarakhand', lat: 30.3165, lng: 78.0322 },
    { city: 'Jabalpur', state: 'Madhya Pradesh', lat: 23.1815, lng: 79.9864 },
    { city: 'Amritsar', state: 'Punjab', lat: 31.6340, lng: 74.8723 },
    { city: 'Ludhiana', state: 'Punjab', lat: 30.9010, lng: 75.8573 },
    { city: 'Jodhpur', state: 'Rajasthan', lat: 26.2389, lng: 73.0243 },
    { city: 'Udaipur', state: 'Rajasthan', lat: 24.5854, lng: 73.7125 },
    { city: 'Mysuru', state: 'Karnataka', lat: 12.2958, lng: 76.6394 },
    { city: 'Hubli', state: 'Karnataka', lat: 15.3647, lng: 75.1240 },
    { city: 'Mangaluru', state: 'Karnataka', lat: 12.9141, lng: 74.8560 },
    { city: 'Vijayawada', state: 'Andhra Pradesh', lat: 16.5062, lng: 80.6480 },
    { city: 'Tirupati', state: 'Andhra Pradesh', lat: 13.6288, lng: 79.4192 },
    { city: 'Nashik', state: 'Maharashtra', lat: 19.9975, lng: 73.7898 },
    { city: 'Aurangabad', state: 'Maharashtra', lat: 19.8762, lng: 75.3433 },
    { city: 'Kolhapur', state: 'Maharashtra', lat: 16.7050, lng: 74.2433 },
    { city: 'Jalandhar', state: 'Punjab', lat: 31.3260, lng: 75.5762 },
    { city: 'Shimla', state: 'Himachal Pradesh', lat: 31.1048, lng: 77.1734 },
    { city: 'Jammu', state: 'J&K', lat: 32.7266, lng: 74.8570 },
    { city: 'Srinagar', state: 'J&K', lat: 34.0837, lng: 74.7973 },
    { city: 'Siliguri', state: 'West Bengal', lat: 26.7271, lng: 88.3953 },
    { city: 'Durgapur', state: 'West Bengal', lat: 23.5204, lng: 87.3119 },
    { city: 'Tiruchirappalli', city2: 'Trichy', state: 'Tamil Nadu', lat: 10.7905, lng: 78.7047 },
    { city: 'Salem', state: 'Tamil Nadu', lat: 11.6643, lng: 78.1460 },
    { city: 'Vellore', state: 'Tamil Nadu', lat: 12.9165, lng: 79.1325 },
    { city: 'Meerut', state: 'Uttar Pradesh', lat: 28.9845, lng: 77.7064 },
    { city: 'Aligarh', state: 'Uttar Pradesh', lat: 27.8974, lng: 78.0880 },
    { city: 'Gwalior', state: 'Madhya Pradesh', lat: 26.2183, lng: 78.1828 },
    { city: 'Bikaner', state: 'Rajasthan', lat: 28.0229, lng: 73.3119 },
    { city: 'Ajmer', state: 'Rajasthan', lat: 26.4499, lng: 74.6399 },
    { city: 'Kota', state: 'Rajasthan', lat: 25.2138, lng: 75.8648 },
  ];

  const hospitalTypes = ['Government', 'Private', 'Trust', 'Charitable', 'Military'];
  const allSpecialties = [
    ['Cardiology', 'Emergency', 'General Medicine'],
    ['Orthopedics', 'Surgery', 'Trauma'],
    ['Oncology', 'Radiology', 'Chemotherapy'],
    ['Neurology', 'Neurosurgery', 'Spine'],
    ['Pediatrics', 'Neonatology', 'Child Surgery'],
    ['Gynecology', 'Obstetrics', 'Fertility'],
    ['Gastroenterology', 'Hepatology', 'Endoscopy'],
    ['Nephrology', 'Dialysis', 'Transplant'],
    ['Pulmonology', 'Respiratory', 'Critical Care'],
    ['Psychiatry', 'Mental Health', 'Rehabilitation'],
    ['Dermatology', 'Cosmetology', 'Plastic Surgery'],
    ['Ophthalmology', 'Retina', 'Cataract'],
    ['ENT', 'Head & Neck Surgery', 'Audiology'],
    ['Urology', 'Andrology', 'Kidney Stone'],
    ['Endocrinology', 'Diabetes', 'Thyroid'],
  ];

  const prefixes = ['City', 'District', 'Regional', 'Central', 'Metro', 'Apollo', 'Fortis', 'Max', 'Manipal', 'Care', 'Global', 'National', 'Premier', 'Life', 'Shree', 'Sanjivani', 'Sunrise', 'Star', 'Rainbow', 'Lotus', 'Orchid'];
  const suffixes = ['General Hospital', 'Medical Centre', 'Super Speciality Hospital', 'Multispeciality Hospital', 'Institute of Medical Sciences', 'Healthcare', 'Medical College & Hospital', 'Clinic & Research Centre', 'Hospital & Research Institute'];

  for (const city of cities) {
    // 15-20 hospitals per city
    const count = 15 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
      const type = hospitalTypes[Math.floor(Math.random() * hospitalTypes.length)];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      const name = `${prefix} ${(city as any).city2 || city.city} ${suffix}`;
      const beds = type === 'Government' ? 200 + Math.floor(Math.random() * 800) : 50 + Math.floor(Math.random() * 500);
      const specs = allSpecialties[Math.floor(Math.random() * allSpecialties.length)];
      hospitals.push(generateHospital(id++, name, city.city, city.state, city.lat, city.lng, type, beds, specs));
    }
  }

  return hospitals;
}

const HOSPITALS_DB = generateHospitalDatabase();

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute cache

function getCachedResponse(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCachedResponse(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
  if (cache.size > 100) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cacheKey = req.url;

  const cached = getCachedResponse(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  const city = searchParams.get('city');
  const state = searchParams.get('state');
  const type = searchParams.get('type');
  const specialty = searchParams.get('specialty');
  const search = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');
  const nearby = searchParams.get('nearby') === 'true';

  let results = [...HOSPITALS_DB];

  // If nearby with valid coordinates, fetch REAL hospitals from OSM
  if (nearby && lat && lng) {
    const realHospitals = await fetchRealHospitalsFromOSM(lat, lng, 30000);
    if (realHospitals && realHospitals.length > 0) {
      results = realHospitals;
    } else {
      // Fallback to mock data sorted by distance
      results = results
        .map(h => ({
          ...h,
          distance: calculateHaversine(lat, lng, h.location.lat, h.location.lng)
        }))
        .sort((a: any, b: any) => a.distance - b.distance);
    }
  }

  if (city) results = results.filter(h => h.city.toLowerCase().includes(city.toLowerCase()));
  if (state) results = results.filter(h => h.state.toLowerCase().includes(state.toLowerCase()));
  if (type) results = results.filter(h => h.type.toLowerCase() === type.toLowerCase());
  if (specialty) results = results.filter(h => h.specialties.some(s => s.toLowerCase().includes(specialty.toLowerCase())));
  if (search) results = results.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.city.toLowerCase().includes(search.toLowerCase()) ||
    h.specialties.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  const total = results.length;
  const paginated = results.slice((page - 1) * limit, page * limit);

  const response = {
    hospitals: paginated,
    total,
    page,
    pages: Math.ceil(total / limit),
    cities: [...new Set(HOSPITALS_DB.map(h => h.city))].sort(),
    states: [...new Set(HOSPITALS_DB.map(h => h.state))].sort(),
  };

  setCachedResponse(cacheKey, response);

  return NextResponse.json(response);
}
