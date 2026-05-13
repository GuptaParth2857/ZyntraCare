import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CITIES = [
  { city: 'Delhi', lat: 28.6139, lng: 77.2090, state: 'Delhi' },
  { city: 'Mumbai', lat: 19.0760, lng: 72.8777, state: 'Maharashtra' },
  { city: 'Bangalore', lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  { city: 'Chennai', lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu' },
  { city: 'Kolkata', lat: 22.5726, lng: 88.3639, state: 'West Bengal' },
  { city: 'Hyderabad', lat: 17.3850, lng: 78.4867, state: 'Telangana' },
  { city: 'Pune', lat: 18.5204, lng: 73.8567, state: 'Maharashtra' },
  { city: 'Gurgaon', lat: 28.4283, lng: 77.0266, state: 'Haryana' },
];

const HOSPITALS = [
  'AIIMS', 'Fortis', 'Apollo', 'Max', 'Medanta', 'Narayana', 'Saife', 'BLK', 'Manipal', 'Cloudnine'
];

const SPECIALTIES = [
  'Cardiology', 'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics',
  'Dermatology', 'Gynecology', 'Urology', 'Nephrology', 'Gastroenterology',
  'Pulmonology', 'Ophthalmology', 'ENT', 'Psychiatry', 'General Physician'
];

const FIRST_NAMES = ['Rajesh', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Raj', 'Meera', 'Sanjay', 'Kavita'];
const LAST_NAMES = ['Sharma', 'Kumar', 'Patel', 'Gupta', 'Singh', 'Verma', 'Reddy', 'Joshi', 'Mehta', 'Shah'];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

async function main() {
  console.log('🌱 Starting seed...');

  const hashedPassword = await bcrypt.hash('admin123', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'gupta.parth2857@gmail.com' },
    update: { role: 'admin', passwordHash: hashedPassword },
    create: {
      email: 'gupta.parth2857@gmail.com',
      name: 'Parth Gupta',
      passwordHash: hashedPassword,
      role: 'admin',
    },
  });
  console.log('✅ Admin user:', adminUser.email);

  const testUser = await prisma.user.upsert({
    where: { email: 'test@patient.com' },
    update: {},
    create: {
      email: 'test@patient.com',
      name: 'Test Patient',
      passwordHash: hashedPassword,
      role: 'patient',
      phone: '+919999999999',
    },
  });
  console.log('✅ Test user:', testUser.email);

  let hospitalCount = 0;
  for (const city of CITIES) {
    const numHospitals = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numHospitals; i++) {
      const hospitalName = `${HOSPITALS[i % HOSPITALS.length]} ${city.city}`;
      const lat = city.lat + (Math.random() - 0.5) * 0.1;
      const lng = city.lng + (Math.random() - 0.5) * 0.1;
      const totalBeds = 50 + Math.floor(Math.random() * 450);
      const availableBeds = Math.floor(totalBeds * (0.2 + Math.random() * 0.6));

      await prisma.hospital.create({
        data: {
          name: hospitalName,
          address: `${Math.floor(Math.random() * 500) + 1}, Main Road, ${city.city}`,
          city: city.city,
          state: city.state,
          pincode: String(110001 + Math.floor(Math.random() * 89999)),
          phone: `+91${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
          email: `info@${hospitalName.toLowerCase().replace(/\s/g, '')}.com`,
          website: `https://${hospitalName.toLowerCase().replace(/\s/g, '')}.com`,
          specialties: JSON.stringify(SPECIALTIES.slice(0, 5 + Math.floor(Math.random() * 10))),
          beds: JSON.stringify({ total: totalBeds, available: availableBeds, icu: Math.floor(totalBeds * 0.1), icuAvailable: Math.floor(totalBeds * 0.05) }),
          emergency: true,
          lat,
          lng,
          rating: 3.5 + Math.random() * 1.5,
          doctors: 10 + Math.floor(Math.random() * 40),
          verified: true,
          source: 'manual',
        },
      });
      hospitalCount++;
    }
  }
  console.log(`✅ Created ${hospitalCount} hospitals`);

  let doctorCount = 0;
  const doctors = await prisma.doctor.findMany();
  const hospitals = await prisma.hospital.findMany();

  for (const hospital of hospitals) {
    const numDoctors = 3 + Math.floor(Math.random() * 5);
    for (let i = 0; i < numDoctors; i++) {
      const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const specialty = SPECIALTIES[Math.floor(Math.random() * SPECIALTIES.length)];

      const doctorUser = await prisma.user.create({
        data: {
          email: `dr.${firstName.toLowerCase()}.${lastName.toLowerCase()}${doctorCount}@hospital.com`,
          name: `Dr. ${firstName} ${lastName}`,
          passwordHash: hashedPassword,
          role: 'doctor',
        },
      });

      await prisma.doctor.create({
        data: {
          userId: doctorUser.id,
          specialty,
          license: `MD${Math.floor(Math.random() * 100000)}`,
          experience: 2 + Math.floor(Math.random() * 25),
          bio: `${specialty} specialist with years of experience`,
          education: 'Medical College',
          consultingFee: 300 + Math.floor(Math.random() * 1500),
          isAvailable: Math.random() > 0.2,
        },
      });
      doctorCount++;
    }
  }
  console.log(`✅ Created ${doctorCount} doctors`);

  const pharmacies = [
    { name: 'Apollo Pharmacy', city: 'Delhi', lat: 28.6139, lng: 77.2090 },
    { name: 'MedPlus', city: 'Mumbai', lat: 19.0760, lng: 72.8777 },
    { name: 'Netmeds', city: 'Bangalore', lat: 12.9716, lng: 77.5946 },
    { name: '1mg', city: 'Chennai', lat: 13.0827, lng: 80.2707 },
    { name: 'Pharmeasy', city: 'Kolkata', lat: 22.5726, lng: 88.3639 },
    { name: 'Chemist Warehouse', city: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  ];

  for (const p of pharmacies) {
    await prisma.hospital.create({
      data: {
        name: p.name,
        address: `Pharmacy, ${p.city}`,
        city: p.city,
        state: 'India',
        pincode: '110001',
        phone: '+919999999999',
        lat: p.lat,
        lng: p.lng,
        specialties: '[]',
        beds: '{"total":0,"available":0,"icu":0,"icuAvailable":0}',
        emergency: false,
        doctors: 0,
        verified: true,
        source: 'manual',
      },
    });
  }
  console.log(`✅ Created ${pharmacies.length} pharmacies`);

  const labs = [
    'Dr. Lal PathLabs', 'Thyrocare', 'SRL Diagnostics', 'Metropolis', 'Quest Diagnostics'
  ];
  for (const lab of labs) {
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    await prisma.hospital.create({
      data: {
        name: lab,
        address: `Diagnostic Center, ${city.city}`,
        city: city.city,
        state: city.state,
        pincode: '110001',
        phone: '+919999999999',
        lat: city.lat + (Math.random() - 0.5) * 0.1,
        lng: city.lng + (Math.random() - 0.5) * 0.1,
        specialties: '[]',
        beds: '{"total":0,"available":0,"icu":0,"icuAvailable":0}',
        emergency: false,
        doctors: 0,
        verified: true,
        source: 'manual',
      },
    });
  }
  console.log(`✅ Created ${labs.length} labs`);

  for (let i = 1; i <= 10; i++) {
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    await prisma.ambulance.create({
      data: {
        driverName: `Driver ${i}`,
        vehicleNumber: `AMB${String(i).padStart(4, '0')}`,
        phone: `+91999999999${i}`,
        lat: city.lat + (Math.random() - 0.5) * 0.05,
        lng: city.lng + (Math.random() - 0.5) * 0.05,
        isAvailable: Math.random() > 0.3,
        type: ['basic', 'acls', 'neonatal'][Math.floor(Math.random() * 3)],
      },
    });
  }
  console.log('✅ Created 10 ambulances');

  for (let i = 0; i < 20; i++) {
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    await prisma.user.create({
      data: {
        email: `donor${i}@bloodbank.com`,
        name: `Blood Donor ${i + 1}`,
        phone: `+91999999999${String(i).padStart(2, '0')}`,
        bloodGroup: BLOOD_GROUPS[Math.floor(Math.random() * BLOOD_GROUPS.length)],
        role: 'patient',
        city: city.city,
      },
    });
  }
  console.log('✅ Created 20 blood donors');

  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });