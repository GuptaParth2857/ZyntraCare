import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  adapter: new PrismaLibSql({ url: process.env.DATABASE_URL || 'file:./dev.db' }),
});

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

  const EXTRA_BLOG_DATA = [
    // Water intake & hydration
    { title: 'Daily Water Intake: How Much Water Should You Drink?', slug: 'daily-water-intake-guide', content: 'Complete guide to daily water intake based on your weight, activity level, and climate. Benefits of hydration, signs of dehydration, and practical tips to drink more water throughout the day.', excerpt: 'Learn exactly how much water you need daily based on your body weight, activity level, and the Indian climate.', author: 'Dr. Ananya Verma', image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&q=80&w=800', category: 'Nutrition', tags: JSON.stringify(['water intake', 'hydration', 'dehydration', 'health tips']), readTime: 7, featured: false, published: true },
    { title: 'Signs of Dehydration You Should Never Ignore', slug: 'signs-of-dehydration-warning', content: 'Dehydration can be dangerous if left untreated. Learn the early warning signs, from dry mouth to confusion, and when you need immediate medical attention. Includes ORS recipe.', excerpt: 'Recognize the early warning signs of dehydration before they become serious. Essential knowledge for Indian summers.', author: 'Dr. Kavita Reddy', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800', category: 'Wellness', tags: JSON.stringify(['dehydration', 'hydration', 'summer health', 'ORS']), readTime: 5, featured: false, published: true },

    // Fever & infections
    { title: 'Viral Fever: Symptoms, Home Remedies, and Treatment', slug: 'viral-fever-symptoms-treatment', content: 'Viral fever is extremely common in India. Learn about symptoms, temperature ranges, effective home remedies, when to take medication, and red flags that require a doctor visit.', excerpt: 'Everything you need to know about managing viral fever at home and knowing when to see a doctor.', author: 'Dr. Amit Kumar', image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=800', category: 'Wellness', tags: JSON.stringify(['viral fever', 'fever', 'home remedies', 'temperature']), readTime: 6, featured: false, published: true },
    { title: 'Dengue Fever: Symptoms, Prevention, and Warning Signs', slug: 'dengue-fever-prevention-guide', content: 'Dengue is a major health concern in India. Recognize early symptoms, understand the critical phase, learn prevention methods, and know when platelet transfusion is needed.', excerpt: 'Essential guide to dengue prevention and recognizing warning signs that require immediate hospitalization.', author: 'Dr. Rajesh Joshi', image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800', category: 'Public Health', tags: JSON.stringify(['dengue', 'fever', 'mosquito', 'platelets', 'monsoon diseases']), readTime: 8, featured: false, published: true },
    { title: 'Typhoid Fever: Causes, Symptoms, and Recovery Diet', slug: 'typhoid-fever-recovery-diet', content: 'Typhoid remains common in India due to contaminated water. Learn about symptoms, diagnosis (Widal test), antibiotic treatment, and the recovery diet plan.', excerpt: 'Complete guide to typhoid — from early symptoms to the right diet for a full recovery.', author: 'Dr. Priya Sharma', image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=800', category: 'Public Health', tags: JSON.stringify(['typhoid', 'fever', 'food hygiene', 'recovery diet']), readTime: 7, featured: false, published: true },

    // Cough & cold
    { title: 'Home Remedies for Cough and Cold That Actually Work', slug: 'home-remedies-cough-cold', content: 'Proven home remedies for cough and cold using ingredients from your Indian kitchen. Honey, ginger, tulsi, turmeric milk, steam inhalation, and more natural solutions.', excerpt: 'Effective home remedies for cough and cold using ingredients already in your kitchen.', author: 'Rohit Singh', image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&q=80&w=800', category: 'Wellness', tags: JSON.stringify(['cough', 'cold', 'home remedies', 'tulsi', 'ginger']), readTime: 6, featured: false, published: true },
    { title: 'Dry Cough vs Wet Cough: Treatment Differences', slug: 'dry-cough-vs-wet-cough-treatment', content: 'Not all coughs are the same. Learn the difference between dry cough and wet cough, when to use suppressants vs expectorants, and which home remedies work for each type.', excerpt: 'Learn the difference between dry and wet cough and which treatment works for each type.', author: 'Dr. Sneha Patel', image: 'https://images.unsplash.com/photo-1593118247619-e2d6e056c4e2?auto=format&fit=crop&q=80&w=800', category: 'Wellness', tags: JSON.stringify(['cough', 'dry cough', 'wet cough', 'treatment']), readTime: 5, featured: false, published: true },

    // Headache & migraine
    { title: 'Tension Headache vs Migraine: How to Tell the Difference', slug: 'tension-headache-vs-migraine', content: 'Headaches affect millions of Indians. Learn to distinguish between tension headaches and migraines, recognize triggers, and find the right treatment approach for each type.', excerpt: 'Identify whether your headache is a tension headache or migraine, and get the right relief.', author: 'Dr. Arjun Mehta', image: 'https://images.unsplash.com/photo-1571013459516-f131706a1620?auto=format&fit=crop&q=80&w=800', category: 'Mental Health', tags: JSON.stringify(['headache', 'migraine', 'tension headache', 'pain relief']), readTime: 7, featured: false, published: true },
    { title: 'Natural Headache Relief Without Medication', slug: 'natural-headache-relief-remedies', content: '10 natural ways to relieve headaches without popping pills. Essential oils, pressure points, hydration, magnesium, and relaxation techniques that actually work.', excerpt: '10 natural ways to get rid of headaches using essential oils, pressure points, and relaxation techniques.', author: 'Dr. Arjun Mehta', image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=800', category: 'Mental Health', tags: JSON.stringify(['headache', 'natural relief', 'essential oils', 'migraine relief']), readTime: 6, featured: false, published: true },

    // Heart health
    { title: 'Heart Attack Symptoms in Women vs Men', slug: 'heart-attack-symptoms-women-men', content: 'Heart attack symptoms differ between women and men. Women often experience atypical signs like indigestion, fatigue, and jaw pain. Know the differences to save lives.', excerpt: 'Heart attacks present differently in women and men. Know the warning signs for both.', author: 'Dr. Priya Sharma', image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=800', category: 'Cardiology', tags: JSON.stringify(['heart attack', 'women health', 'cardiology', 'emergency']), readTime: 8, featured: false, published: true },
    { title: 'Cholesterol Levels: Normal Range and Diet Plan for Indians', slug: 'cholesterol-levels-diet-indians', content: 'Understanding cholesterol — LDL, HDL, triglycerides. Normal ranges for Indians, foods that lower cholesterol naturally, and when medication is needed.', excerpt: 'Complete guide to cholesterol levels and a diet plan designed for Indian eating habits.', author: 'Dr. Priya Sharma', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800', category: 'Cardiology', tags: JSON.stringify(['cholesterol', 'heart health', 'diet', 'LDL', 'HDL']), readTime: 9, featured: false, published: true },

    // Diabetes
    { title: 'Blood Sugar Levels: Normal Range Chart by Age', slug: 'blood-sugar-levels-normal-range', content: 'Complete blood sugar level guide — fasting, post-meal, and HbA1c normal ranges by age. How to monitor, when to test, and what your numbers mean.', excerpt: 'Your complete reference for normal blood sugar ranges by age and when to be concerned.', author: 'Dr. Kavita Reddy', image: 'https://images.unsplash.com/photo-1571013459516-f131706a1620?auto=format&fit=crop&q=80&w=800', category: 'Wellness', tags: JSON.stringify(['diabetes', 'blood sugar', 'HbA1c', 'glucose levels']), readTime: 8, featured: false, published: true },
    { title: 'Diabetes Diet: What to Eat and What to Avoid', slug: 'diabetes-diet-indian-food', content: 'Indian diet plan for diabetes — which rotis to eat, rice alternatives, best vegetables, fruits to avoid, and meal timing for stable blood sugar.', excerpt: 'A practical Indian diet plan for diabetes with foods to eat and avoid for stable blood sugar.', author: 'Dr. Kavita Reddy', image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=800', category: 'Wellness', tags: JSON.stringify(['diabetes', 'diet', 'Indian food', 'blood sugar']), readTime: 7, featured: false, published: true },

    // Digestion & stomach
    { title: 'Acidity and Heartburn: Causes and Immediate Relief', slug: 'acidity-heartburn-relief-remedies', content: 'Acidity and heartburn affect millions of Indians. Learn immediate relief remedies, long-term dietary changes, and when acid reflux requires medical attention.', excerpt: 'Quick relief remedies for acidity and heartburn using kitchen ingredients and lifestyle changes.', author: 'Dr. Rajesh Joshi', image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=800', category: 'Wellness', tags: JSON.stringify(['acidity', 'heartburn', 'indigestion', 'gas', 'remedies']), readTime: 6, featured: false, published: true },
    { title: 'Constipation Relief: Natural Remedies That Work Fast', slug: 'constipation-relief-natural-remedies', content: 'Struggling with constipation? Learn about fiber-rich Indian foods, hydration tips, natural laxatives, abdominal massage, and when to see a doctor.', excerpt: 'Fast-acting natural remedies for constipation relief using fiber-rich Indian foods.', author: 'Dr. Ananya Verma', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800', category: 'Nutrition', tags: JSON.stringify(['constipation', 'digestion', 'fiber', 'natural remedies']), readTime: 5, featured: false, published: true },
    { title: 'Food Poisoning: Symptoms, Treatment, and Recovery', slug: 'food-poisoning-treatment-recovery', content: 'Food poisoning is common in India. Recognize symptoms, learn immediate first aid, when to take antibiotics, and the right recovery diet to heal your stomach.', excerpt: 'What to do when food poisoning strikes — symptoms, immediate treatment, and recovery diet.', author: 'Dr. Amit Kumar', image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=800', category: 'Public Health', tags: JSON.stringify(['food poisoning', 'stomach infection', 'diarrhea', 'recovery']), readTime: 7, featured: false, published: true },

    // Women's health
    { title: 'PCOS: Symptoms, Diet, and Treatment Options', slug: 'pcos-symptoms-diet-treatment', content: 'PCOS affects 1 in 5 Indian women. Understand symptoms, diagnostic criteria, diet plan for managing PCOS, exercise recommendations, and treatment options including fertility.', excerpt: 'Complete guide to PCOS — recognizing symptoms, managing with diet, and treatment options available in India.', author: 'Dr. Sneha Patel', image: 'https://images.unsplash.com/photo-1571013459516-f131706a1620?auto=format&fit=crop&q=80&w=800', category: 'Wellness', tags: JSON.stringify(['PCOS', 'women health', 'hormones', 'fertility', 'diet']), readTime: 9, featured: false, published: true },
    { title: 'Iron Deficiency Anemia: Symptoms and Diet for Indians', slug: 'iron-deficiency-anemia-diet', content: 'Anemia is widespread in India, especially among women. Learn symptoms, iron-rich Indian foods, vitamin C for absorption, supplementation, and when to seek treatment.', excerpt: 'Prevent and treat iron deficiency anemia with iron-rich Indian foods and proper supplementation.', author: 'Dr. Ananya Verma', image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=800', category: 'Nutrition', tags: JSON.stringify(['anemia', 'iron deficiency', 'women health', 'nutrition']), readTime: 7, featured: false, published: true },
    { title: 'Pregnancy Diet: What to Eat in Each Trimester', slug: 'pregnancy-diet-trimester-guide', content: 'Complete pregnancy diet guide for Indian mothers. What to eat in each trimester, essential nutrients (folic acid, iron, calcium), foods to avoid, and meal plans.', excerpt: ' trimester-by-trimester pregnancy diet guide with essential nutrients and Indian meal suggestions.', author: 'Dr. Sneha Patel', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800', category: 'Wellness', tags: JSON.stringify(['pregnancy', 'diet', 'prenatal', 'nutrition', 'baby health']), readTime: 10, featured: false, published: true },

    // Immunity & vitamins
    { title: 'Vitamin D Deficiency: Symptoms and Treatment for Indians', slug: 'vitamin-d-deficiency-india', content: 'Over 70% of Indians are vitamin D deficient. Learn symptoms (bone pain, fatigue, hair loss), optimal sun exposure timing, food sources, and supplementation guidelines.', excerpt: 'Why vitamin D deficiency is so common in India and how to fix it with sun, food, and supplements.', author: 'Dr. Rajesh Joshi', image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=800', category: 'Public Health', tags: JSON.stringify(['vitamin D', 'deficiency', 'sunlight', 'supplements']), readTime: 6, featured: false, published: true },
    { title: 'Vitamin B12 Deficiency in Vegetarians: Symptoms and Solutions', slug: 'vitamin-b12-deficiency-vegetarians', content: 'Vitamin B12 deficiency is common among Indian vegetarians. Learn neurological symptoms, diagnosis, supplementation, and fortified food sources.', excerpt: 'Essential guide for Indian vegetarians on preventing and treating vitamin B12 deficiency.', author: 'Dr. Ananya Verma', image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=800', category: 'Nutrition', tags: JSON.stringify(['vitamin B12', 'vegetarian', 'nutrition', 'supplements']), readTime: 6, featured: false, published: true },

    // Emergency & first aid
    { title: 'CPR Steps: How to Perform CPR in an Emergency', slug: 'cpr-steps-emergency-guide', content: 'Step-by-step CPR guide for emergencies. Learn chest compression technique, rescue breathing, when to use AED, and hands-only CPR. These skills save lives.', excerpt: 'Life-saving CPR steps everyone should know. Your quick guide to handling cardiac emergencies.', author: 'Dr. Amit Kumar', image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=800', category: 'Public Health', tags: JSON.stringify(['CPR', 'emergency', 'first aid', 'life saving']), readTime: 5, featured: false, published: true },
    { title: 'Snake Bite First Aid: What to Do and What NOT to Do', slug: 'snake-bite-first-aid-guide', content: 'India has the highest snake bite mortality in the world. Learn correct first aid, myths to avoid (no tourniquet, no sucking venom), and the importance of antivenom.', excerpt: 'Life-saving snake bite first aid that every Indian should know — and dangerous myths to avoid.', author: 'Dr. Rajesh Joshi', image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=800', category: 'Public Health', tags: JSON.stringify(['snake bite', 'first aid', 'emergency', 'antivenom']), readTime: 6, featured: false, published: true },

    // Seasonal health
    { title: 'Monsoon Health Tips: Preventing Seasonal Diseases', slug: 'monsoon-health-tips-seasonal-diseases', content: 'Monsoon brings water-borne and airborne diseases. Learn prevention tips for dengue, malaria, typhoid, cold, and fungal infections during the rainy season in India.', excerpt: 'Stay healthy this monsoon with essential prevention tips against dengue, malaria, typhoid, and cold.', author: 'Dr. Rajesh Joshi', image: 'https://images.unsplash.com/photo-1586776977607-310e9c725c37?auto=format&fit=crop&q=80&w=800', category: 'Public Health', tags: JSON.stringify(['monsoon', 'seasonal diseases', 'dengue', 'malaria', 'health tips']), readTime: 7, featured: false, published: true },
    { title: 'Summer Health Tips: Beat the Heat and Stay Hydrated', slug: 'summer-health-tips-heat-hydration', content: 'Indian summers can be brutal. Learn how to prevent heat stroke, stay hydrated, eat cooling foods, and recognize heat-related illness warning signs.', excerpt: 'Essential summer health tips to beat the heat, prevent heat stroke, and stay hydrated in Indian summers.', author: 'Rohit Singh', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800', category: 'Wellness', tags: JSON.stringify(['summer', 'heat stroke', 'hydration', 'health tips']), readTime: 5, featured: false, published: true },

    // Skin & hair
    { title: 'Acne: Causes, Treatment, and Prevention for Indian Skin', slug: 'acne-treatment-indian-skin', content: 'Acne affects teenagers and adults alike. Learn causes, effective treatments (benzoyl peroxide, salicylic acid, retinoids), home remedies, and prevention tips for Indian skin types.', excerpt: 'Complete guide to treating and preventing acne for Indian skin types.', author: 'Dr. Sneha Patel', image: 'https://images.unsplash.com/photo-1571013459516-f131706a1620?auto=format&fit=crop&q=80&w=800', category: 'Wellness', tags: JSON.stringify(['acne', 'skin care', 'pimples', 'Indian skin', 'treatment']), readTime: 8, featured: false, published: true },
    { title: 'Hair Fall: Causes and Proven Treatments for Indians', slug: 'hair-fall-causes-treatments', content: 'Hair fall is a common concern in India. Learn about causes (nutrition, hormones, stress, hard water), proven treatments, and natural remedies for stronger hair.', excerpt: 'Stop hair fall with these proven treatments and natural remedies designed for Indian hair types.', author: 'Dr. Sneha Patel', image: 'https://images.unsplash.com/photo-1571013459516-f131706a1620?auto=format&fit=crop&q=80&w=800', category: 'Wellness', tags: JSON.stringify(['hair fall', 'hair care', 'hair loss treatment', 'dandruff']), readTime: 7, featured: false, published: true },

    // Nutrition
    { title: 'Protein Requirements for Indians: How Much Do You Need?', slug: 'protein-requirements-indian-diet', content: 'Most Indians don\'t get enough protein. Learn your daily protein needs, best Indian protein sources (dal, paneer, soya, eggs), and how to include protein in every meal.', excerpt: 'Indian protein sources and daily requirements — how to fix the protein gap in your diet.', author: 'Dr. Ananya Verma', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800', category: 'Nutrition', tags: JSON.stringify(['protein', 'diet', 'nutrition', 'Indian food', 'muscle health']), readTime: 7, featured: false, published: true },
    { title: 'Weight Loss Diet Plan for Indians: 7-Day Meal Plan', slug: 'weight-loss-diet-plan-indians', content: 'A practical 7-day Indian weight loss diet plan with calorie counts. Includes breakfast, lunch, dinner, and snack options using easily available ingredients.', excerpt: 'A realistic 7-day Indian weight loss meal plan with calorie counts and local ingredients.', author: 'Dr. Ananya Verma', image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=800', category: 'Nutrition', tags: JSON.stringify(['weight loss', 'diet plan', 'Indian diet', 'calorie deficit']), readTime: 8, featured: false, published: true },

    // COVID
    { title: 'Long COVID: Symptoms, Management, and Recovery Tips', slug: 'long-covid-symptoms-recovery', content: 'Many COVID patients experience lingering symptoms. Learn about long COVID symptoms (fatigue, brain fog, breathlessness), management strategies, and recovery timeline.', excerpt: 'Understanding long COVID and practical steps to manage persistent symptoms after recovery.', author: 'Dr. Amit Kumar', image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=800', category: 'Public Health', tags: JSON.stringify(['COVID', 'long COVID', 'recovery', 'post-COVID']), readTime: 7, featured: false, published: true },

    // ════════════════════════════════════════════════════════
    // NEW ARTICLES — User-requested health topics
    // ════════════════════════════════════════════════════════

    // First Aid for Burns
    { title: 'First Aid for Burns: Treatment Guide for Indian Homes', slug: 'first-aid-for-burns-treatment', content: 'Burns are common in Indian kitchens. Learn immediate first aid for thermal, electrical, and chemical burns — cool running water (not ice), sterile dressing, when to pop blisters (never), and when to rush to hospital.', excerpt: 'Step-by-step burn first aid guide — what to do immediately, what NOT to do, and when to see a doctor.', author: 'Dr. Amit Kumar', image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=800', category: 'Public Health', tags: JSON.stringify(['burns', 'first aid', 'kitchen accidents', 'emergency']), readTime: 6, featured: true, published: true },

    // Heart Attack Warning Signs
    { title: 'Heart Attack Warning Signs: Symptoms You Should Never Ignore', slug: 'heart-attack-warning-signs-symptoms', content: 'Recognizing a heart attack early saves lives. Learn the classic signs (chest pain, arm numbness, shortness of breath) and atypical signs (jaw pain, indigestion, fatigue). Includes Indian context and when to call 108.', excerpt: 'Know the warning signs of a heart attack — both classic and silent symptoms that every Indian should recognize.', author: 'Dr. Priya Sharma', image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=800', category: 'Cardiology', tags: JSON.stringify(['heart attack', 'cardiac arrest', 'chest pain', 'emergency', '108']), readTime: 8, featured: true, published: true },

    // Importance of Regular Health Checkups
    { title: 'Importance of Regular Health Checkups: Preventive Care Guide', slug: 'importance-regular-health-checkups', content: 'Prevention is better than cure. Learn why annual health checkups are crucial for early detection of diabetes, hypertension, heart disease, and cancer. Includes age-wise screening recommendations for Indians.', excerpt: 'Why regular health checkups can save your life — age-wise screening guide for common Indian health risks.', author: 'Dr. Kavita Reddy', image: 'https://images.unsplash.com/photo-1571013459516-f131706a1620?auto=format&fit=crop&q=80&w=800', category: 'Wellness', tags: JSON.stringify(['health checkup', 'preventive care', 'screening', 'annual checkup']), readTime: 7, featured: true, published: true },

    // Emergency Numbers in India
    { title: 'Emergency Numbers in India: 108, 112, 102 and More', slug: 'emergency-numbers-india-list', content: 'Complete list of emergency helpline numbers in India — 108 (medical), 112 (unified), 102 (ambulance), 100 (police), 101 (fire), 1098 (child helpline), 181 (women helpline) and more state-wise numbers.', excerpt: 'All important emergency helpline numbers in India — save these in your phone today.', author: 'Rohit Singh', image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=800', category: 'Public Health', tags: JSON.stringify(['emergency numbers', '108', '112', 'ambulance', 'helpline']), readTime: 5, featured: true, published: true },

    // How to Maintain a Healthy Lifestyle
    { title: 'How to Maintain a Healthy Lifestyle: Daily Habits Guide', slug: 'healthy-lifestyle-daily-habits', content: 'A healthy lifestyle is built on small daily habits. Learn about balanced nutrition, regular exercise, sleep hygiene, stress management, and social connections. Practical tips tailored for busy Indian lifestyles.', excerpt: 'Simple daily habits for a healthier life — nutrition, exercise, sleep, and stress management for Indians.', author: 'Dr. Ananya Verma', image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=800', category: 'Wellness', tags: JSON.stringify(['healthy lifestyle', 'daily habits', 'nutrition', 'exercise', 'sleep']), readTime: 9, featured: true, published: true },

    // Heat Stroke: Symptoms and First Aid
    { title: 'Heat Stroke: Symptoms, First Aid, and Prevention Tips', slug: 'heat-stroke-symptoms-first-aid', content: 'Heat stroke is a medical emergency. Learn to recognize symptoms (high body temperature, confusion, rapid pulse), immediate first aid (cooling techniques), and prevention tips for Indian summers.', excerpt: 'Heat stroke can be fatal — recognize symptoms early and learn life-saving first aid techniques.', author: 'Dr. Rajesh Joshi', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800', category: 'Public Health', tags: JSON.stringify(['heat stroke', 'summer', 'first aid', 'dehydration']), readTime: 6, featured: false, published: true },

    // Diabetes Prevention
    { title: 'Diabetes Prevention: 10 Lifestyle Changes That Work', slug: 'diabetes-prevention-lifestyle-changes', content: 'Type 2 diabetes is preventable. Learn 10 evidence-based lifestyle changes — weight management, physical activity, dietary modifications, sleep, and stress reduction. Includes Indian diet tips.', excerpt: 'Prevent type 2 diabetes with these 10 lifestyle changes backed by science and tailored for Indians.', author: 'Dr. Kavita Reddy', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800', category: 'Nutrition', tags: JSON.stringify(['diabetes', 'prevention', 'lifestyle', 'diet', 'exercise']), readTime: 8, featured: false, published: true },

    // Yoga for Beginners
    { title: 'Yoga for Beginners: 10-Minute Daily Morning Routine', slug: 'yoga-beginners-daily-morning-routine', content: 'Start your day with this simple 10-minute yoga routine. Includes Surya Namaskar, Tadasana, Trikonasana, Bhujangasana, and Shavasana. Step-by-step instructions with breathing techniques for beginners.', excerpt: 'A simple 10-minute morning yoga routine perfect for beginners — no equipment needed.', author: 'Rohit Singh', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800', category: 'Fitness', tags: JSON.stringify(['yoga', 'beginner', 'morning routine', 'exercise', 'fitness']), readTime: 7, featured: false, published: true },

    // Benefits of Walking
    { title: 'Benefits of Walking 30 Minutes Daily: Complete Guide', slug: 'benefits-walking-daily-guide', content: 'Walking is the simplest and most effective exercise. Learn the health benefits — weight management, heart health, blood sugar control, mental well-being, joint health. Tips to make walking a daily habit in Indian neighborhoods.', excerpt: 'Discover why walking 30 minutes a day is the best exercise for Indians — benefits and tips to stay consistent.', author: 'Rohit Singh', image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=800', category: 'Fitness', tags: JSON.stringify(['walking', 'exercise', 'fitness', 'weight loss', 'heart health']), readTime: 6, featured: false, published: true },

    // Blood Pressure Guide
    { title: 'High Blood Pressure: Causes, Symptoms, and Prevention', slug: 'high-blood-pressure-causes-prevention', content: 'Hypertension affects 1 in 3 Indian adults. Learn about normal BP ranges, causes (salt, stress, obesity), symptoms (often silent), complications, and lifestyle changes to control blood pressure naturally.', excerpt: 'Complete guide to understanding and managing high blood pressure — the silent killer affecting millions of Indians.', author: 'Dr. Priya Sharma', image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=800', category: 'Cardiology', tags: JSON.stringify(['blood pressure', 'hypertension', 'heart health', 'BP control']), readTime: 8, featured: false, published: true },

    // Immunity Boosting Naturally
    { title: 'How to Strengthen Your Immune System Naturally', slug: 'strengthen-immune-system-naturally', content: 'Boost your immunity with natural methods — vitamin C rich Indian foods (amla, citrus), zinc sources (pumpkin seeds, chickpeas), sleep, exercise, stress management, and herbs like giloy and ashwagandha.', excerpt: 'Natural ways to boost your immune system using Indian superfoods, herbs, and healthy habits.', author: 'Dr. Ananya Verma', image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=800', category: 'Nutrition', tags: JSON.stringify(['immunity', 'immune system', 'natural remedies', 'ayurveda', 'nutrition']), readTime: 7, featured: false, published: true },

    // Child Vaccination Schedule India
    { title: 'Child Vaccination Schedule in India: Complete Guide', slug: 'child-vaccination-schedule-india', content: 'Complete vaccination schedule for children in India as per IAP guidelines. BCG, polio, pentavalent, measles, MMR, typhoid, Hepatitis — age-wise schedule with vaccine details and importance of immunization.', excerpt: 'Complete India vaccination schedule for children from birth to 16 years — age-wise guide for parents.', author: 'Dr. Sneha Patel', image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=800', category: 'Public Health', tags: JSON.stringify(['vaccination', 'child health', 'immunization', 'vaccine schedule', 'IAP']), readTime: 9, featured: false, published: true },

    // Mental Health Stress Reduction
    { title: 'Mental Health: Simple Ways to Reduce Stress and Anxiety', slug: 'mental-health-stress-reduction-tips', content: 'Stress and anxiety are rising in India. Learn practical techniques — deep breathing, meditation, journaling, digital detox, exercise, and when to seek professional help. Includes workplace stress management.', excerpt: 'Simple and effective ways to manage stress and anxiety in your daily life — no expensive therapy needed.', author: 'Dr. Arjun Mehta', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800', category: 'Mental Health', tags: JSON.stringify(['mental health', 'stress', 'anxiety', 'meditation', 'self care']), readTime: 7, featured: false, published: true },

    // Oral Health
    { title: 'Oral Health: Common Dental Problems and Prevention Tips', slug: 'oral-health-dental-care-tips', content: 'Dental health is often neglected in India. Learn about common problems — cavities, gum disease, bad breath, tooth sensitivity. Prevention tips: proper brushing technique, flossing, oil pulling, and regular dental checkups.', excerpt: 'Prevent common dental problems with these oral health tips — brushing, flossing, and Indian home remedies.', author: 'Dr. Sneha Patel', image: 'https://images.unsplash.com/photo-1571013459516-f131706a1620?auto=format&fit=crop&q=80&w=800', category: 'Wellness', tags: JSON.stringify(['dental care', 'oral health', 'teeth', 'gum disease', 'cavities']), readTime: 6, featured: false, published: true },

    // Benefits of Warm Water
    { title: 'Benefits of Drinking Warm Water: Ayurvedic and Scientific View', slug: 'benefits-warm-water-ayurveda', content: 'Warm water has been used in Ayurveda for centuries. Learn the science-backed benefits — digestion improvement, detoxification, weight loss, sinus relief, and metabolism boost. How to make it a daily habit.', excerpt: 'Why drinking warm water every morning can transform your health — Ayurvedic wisdom meets modern science.', author: 'Dr. Ananya Verma', image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&q=80&w=800', category: 'Nutrition', tags: JSON.stringify(['warm water', 'ayurveda', 'digestion', 'detox', 'weight loss']), readTime: 5, featured: false, published: true },
  ];

  const allBlogData = [...BLOG_DATA, ...EXTRA_BLOG_DATA];
  for (const blogData of allBlogData) {
    const existing = await prisma.blog.findUnique({ where: { slug: blogData.slug } });
    if (!existing) {
      await prisma.blog.create({ data: blogData });
    }
  }
  console.log(`✅ Created ${allBlogData.length} blog articles`);

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