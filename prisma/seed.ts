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

      const doctorEmail = `dr.${firstName.toLowerCase()}.${lastName.toLowerCase()}.${doctorCount}@hospital.com`;
      const doctorUser = await prisma.user.upsert({
        where: { email: doctorEmail },
        update: { role: 'doctor', passwordHash: hashedPassword },
        create: {
          email: doctorEmail,
          name: `Dr. ${firstName} ${lastName}`,
          passwordHash: hashedPassword,
          role: 'doctor',
        },
      });

      const doctor = await prisma.doctor.create({
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

      await prisma.doctorHospital.create({
        data: { doctorId: doctor.id, hospitalId: hospital.id },
      }).catch(() => {});

      doctorCount++;
    }
  }
  console.log(`✅ Created ${doctorCount} doctors`);

  const pharmacyData = [
    { name: 'Apollo Pharmacy', city: 'Delhi', lat: 28.6139, lng: 77.2090, address: 'Connaught Place, Delhi' },
    { name: 'MedPlus', city: 'Mumbai', lat: 19.0760, lng: 72.8777, address: 'Andheri West, Mumbai' },
    { name: 'Netmeds', city: 'Bangalore', lat: 12.9716, lng: 77.5946, address: 'MG Road, Bangalore' },
    { name: '1mg', city: 'Chennai', lat: 13.0827, lng: 80.2707, address: 'T Nagar, Chennai' },
    { name: 'Pharmeasy', city: 'Kolkata', lat: 22.5726, lng: 88.3639, address: 'Park Street, Kolkata' },
    { name: 'Chemist Warehouse', city: 'Hyderabad', lat: 17.3850, lng: 78.4867, address: 'Hitech City, Hyderabad' },
    { name: 'Wellness Pharmacy', city: 'Pune', lat: 18.5204, lng: 73.8567, address: 'Koregaon Park, Pune' },
    { name: 'Truemeds', city: 'Gurgaon', lat: 28.4283, lng: 77.0266, address: 'Sector 29, Gurgaon' },
  ];

  for (const p of pharmacyData) {
    await prisma.pharmacy.create({
      data: {
        name: p.name,
        address: p.address,
        city: p.city,
        state: CITIES.find(c => c.city === p.city)?.state || 'India',
        pincode: '110001',
        phone: '+919999999999',
        lat: p.lat,
        lng: p.lng,
        rating: 3.5 + Math.random() * 1.5,
        isOnline: true,
        deliveryAvailable: true,
        open24Hours: Math.random() > 0.5,
        verified: true,
      },
    });
  }
  console.log(`✅ Created ${pharmacyData.length} pharmacies`);

  const labData = [
    { name: 'Dr. Lal PathLabs', city: 'Delhi', tests: ['Blood Test', 'Thyroid', 'Lipid Profile', 'Diabetes'] },
    { name: 'Thyrocare', city: 'Mumbai', tests: ['Thyroid', 'Vitamin', 'Hormone', 'Allergy'] },
    { name: 'SRL Diagnostics', city: 'Bangalore', tests: ['Blood Test', 'Liver Function', 'Kidney Function', 'Lipid Profile'] },
    { name: 'Metropolis', city: 'Chennai', tests: ['Blood Test', 'Cancer Screening', 'Genetic Test', 'Hormone'] },
    { name: 'Quest Diagnostics', city: 'Kolkata', tests: ['Blood Test', 'Diabetes', 'Thyroid', 'Cardiac'] },
    { name: 'PathKind Labs', city: 'Hyderabad', tests: ['Blood Test', 'Allergy', 'Vitamin', 'Infection'] },
    { name: 'Suburban Diagnostics', city: 'Pune', tests: ['Blood Test', 'Thyroid', 'Lipid Profile', 'Liver Function'] },
    { name: 'Core Diagnostics', city: 'Gurgaon', tests: ['Blood Test', 'Genetic Test', 'Cancer Screening', 'Hormone'] },
  ];

  for (const lab of labData) {
    const cityInfo = CITIES.find(c => c.city === lab.city)!;
    await prisma.lab.create({
      data: {
        name: lab.name,
        address: `Diagnostic Center, ${lab.city}`,
        city: lab.city,
        state: cityInfo.state,
        pincode: '110001',
        phone: '+919999999999',
        lat: cityInfo.lat + (Math.random() - 0.5) * 0.05,
        lng: cityInfo.lng + (Math.random() - 0.5) * 0.05,
        rating: 3.5 + Math.random() * 1.5,
        accredited: true,
        homeCollection: true,
        tests: JSON.stringify(lab.tests),
        verified: true,
      },
    });
  }
  console.log(`✅ Created ${labData.length} labs`);

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

  const BLOG_DATA = [
    {
      title: 'Managing High Blood Pressure Naturally: A Complete Guide',
      slug: 'managing-high-blood-pressure-naturally',
      content: 'Complete guide on managing blood pressure through lifestyle changes, dietary habits, and natural remedies. Learn about DASH diet, exercise routines, stress management techniques, and monitoring strategies.',
      excerpt: 'Effective lifestyle changes and dietary habits that can significantly lower your blood pressure readings without medication.',
      author: 'Dr. Priya Sharma',
      image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=800',
      category: 'Cardiology',
      tags: JSON.stringify(['heart health', 'blood pressure', 'lifestyle']),
      readTime: 10,
      featured: true,
      published: true,
    },
    {
      title: 'The Ultimate Guide to Plant-Based Nutrition in India',
      slug: 'plant-based-nutrition-guide-india',
      content: 'Comprehensive guide to plant-based nutrition tailored for Indian diets. Covers protein sources, vitamin B12 supplementation, iron-rich Indian foods, and meal planning.',
      excerpt: 'Everything you need to know about switching to a plant-based diet with locally available Indian ingredients.',
      author: 'Dr. Ananya Verma',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800',
      category: 'Nutrition',
      tags: JSON.stringify(['plant-based', 'nutrition', 'vegan', 'Indian diet']),
      readTime: 8,
      featured: false,
      published: true,
    },
    {
      title: 'Mental Health in the Digital Age: Finding Balance',
      slug: 'mental-health-digital-age-balance',
      content: 'Explore the impact of social media, screen time, and digital overload on mental well-being. Includes practical strategies for digital detox and mindfulness practices.',
      excerpt: 'Practical strategies to protect your mental well-being while navigating our increasingly digital world.',
      author: 'Dr. Arjun Mehta',
      image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&q=80&w=800',
      category: 'Mental Health',
      tags: JSON.stringify(['mental health', 'digital detox', 'mindfulness']),
      readTime: 7,
      featured: false,
      published: true,
    },
    {
      title: 'Yoga for Beginners: 5 Poses to Start Your Day',
      slug: 'yoga-beginners-5-poses-morning',
      content: 'Start your morning right with these five foundational yoga poses. Step-by-step instructions, breathing techniques, and modifications for all fitness levels.',
      excerpt: 'A simple 15-minute morning yoga routine that anyone can do, regardless of age or fitness level.',
      author: 'Rohit Singh',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
      category: 'Fitness',
      tags: JSON.stringify(['yoga', 'fitness', 'morning routine']),
      readTime: 5,
      featured: false,
      published: true,
    },
    {
      title: 'Understanding Diabetes: Prevention and Early Warning Signs',
      slug: 'understanding-diabetes-prevention-early-warning',
      content: 'Learn about the different types of diabetes, risk factors specific to the Indian population, early warning signs, and evidence-based prevention strategies.',
      excerpt: 'Essential knowledge about diabetes prevention and the early signs every Indian should watch for.',
      author: 'Dr. Kavita Reddy',
      image: 'https://images.unsplash.com/photo-1571013459516-f131706a1620?auto=format&fit=crop&q=80&w=800',
      category: 'Wellness',
      tags: JSON.stringify(['diabetes', 'prevention', 'blood sugar']),
      readTime: 9,
      featured: false,
      published: true,
    },
    {
      title: 'Eye Care Tips for the Screen Generation',
      slug: 'eye-care-tips-screen-generation',
      content: 'With increasing screen time, eye health has never been more important. Covers the 20-20-20 rule, proper lighting, blue light protection, and exercises for eye strain relief.',
      excerpt: 'Protect your vision with these essential eye care tips designed for people who spend hours on screens.',
      author: 'Dr. Sneha Patel',
      image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&q=80&w=800',
      category: 'Eye Care',
      tags: JSON.stringify(['eye care', 'screen time', 'vision']),
      readTime: 6,
      featured: false,
      published: true,
    },
    {
      title: 'The Science of Sleep: How to Fix Your Sleep Schedule',
      slug: 'science-of-sleep-fix-schedule',
      content: 'Understand your circadian rhythm, the impact of blue light on melatonin production, and practical steps to reset your sleep schedule.',
      excerpt: 'Evidence-based strategies to reset your body clock and finally get the restful sleep you deserve.',
      author: 'Dr. Amit Kumar',
      image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=800',
      category: 'Wellness',
      tags: JSON.stringify(['sleep', 'circadian rhythm', 'insomnia']),
      readTime: 7,
      featured: false,
      published: true,
    },
    {
      title: 'Immunity Boosters: Ayurvedic Secrets for Modern Times',
      slug: 'immunity-boosters-ayurvedic-secrets',
      content: 'Ancient Ayurvedic wisdom combined with modern science to strengthen your immune system. Learn about turmeric, ashwagandha, giloy, and other traditional remedies.',
      excerpt: 'Time-tested Ayurvedic remedies and modern nutritional science to supercharge your immune system.',
      author: 'Dr. Rajesh Joshi',
      image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=800',
      category: 'Public Health',
      tags: JSON.stringify(['ayurveda', 'immunity', 'herbal remedies']),
      readTime: 8,
      featured: false,
      published: true,
    },
  ];

  for (const blogData of BLOG_DATA) {
    const existing = await prisma.blog.findUnique({ where: { slug: blogData.slug } });
    if (!existing) {
      await prisma.blog.create({ data: blogData });
    }
  }
  console.log('✅ Created 8 blog articles');

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