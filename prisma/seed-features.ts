import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const prisma = new PrismaClient({
  adapter: new PrismaLibSql({ url: process.env.DATABASE_URL || 'file:./dev.db' }),
});

const DEMO_USER_ID = 'demo-user';

const CITIES = [
  { city: 'New Delhi', state: 'Delhi', lat: 28.6139, lng: 77.209 },
  { city: 'Mumbai', state: 'Maharashtra', lat: 19.076, lng: 72.8777 },
  { city: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  { city: 'Hyderabad', state: 'Telangana', lat: 17.385, lng: 78.4867 },
  { city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
];

const HOSPITAL_NAMES = ['AIIMS', 'Fortis', 'Apollo', 'Max', 'Medanta', 'Narayana', 'Manipal', 'BLK'];

const MEDICINES_1 = [
  { med: 'Aspirin', dose: '75mg' },
  { med: 'Amlodipine', dose: '5mg' },
  { med: 'Metformin', dose: '500mg' },
  { med: 'Atorvastatin', dose: '20mg' },
  { med: 'Paracetamol', dose: '650mg' },
  { med: 'Pantoprazole', dose: '40mg' },
];

async function ensureDemoUser() {
  const existing = await prisma.user.findUnique({ where: { id: DEMO_USER_ID } as any });
  if (existing) return existing;
  return prisma.user.create({
    data: {
      id: DEMO_USER_ID,
      email: 'demo.user@zyntracare.app',
      name: 'Demo Patient',
      phone: '+919876543210',
      role: 'patient',
      city: 'New Delhi',
      age: 34,
      bloodGroup: 'O+',
      emailVerified: true,
    },
  });
}

async function seedPatientRecord(userId: string) {
  const exists = await prisma.patientRecord.findUnique({ where: { userId } as any });
  if (!exists) {
    await prisma.patientRecord.create({
      data: {
        userId,
        bloodType: 'O+',
        allergies: 'Penicillin',
        medicalHistory: 'Mild hypertension (manageable); no surgeries',
        emergencyContact: 'Meera Sharma',
        emergencyContactPhone: '+919876543211',
        dateOfBirth: '1992-04-17',
        gender: 'male',
      },
    });
  }
  console.log('✅ PatientRecord');
}

async function seedHealthRecords(userId: string) {
  const count = await prisma.healthRecord.count({ where: { userId } });
  if (count > 0) return;
  await prisma.healthRecord.createMany({
    data: [
      { userId, title: 'Complete Blood Count', type: 'report', date: '2026-07-21', hospital: 'Thyrocare Lab', doctor: 'Dr. K.K. Sethi', fileUrl: '/records/cbc.pdf', notes: '1.2 MB · Verified on blockchain' },
      { userId, title: 'Chest X-Ray', type: 'scan', date: '2026-06-10', hospital: 'Max Super Speciality', doctor: 'Dr. Anjali Verma', fileUrl: '/records/xray.pdf', notes: '5.1 MB · DICOM' },
      { userId, title: 'Cardiology Prescription', type: 'prescription', date: '2026-07-22', hospital: 'Fortis Escorts', doctor: 'Dr. Rajiv Bajaj', fileUrl: '/records/rx.pdf', notes: '0.4 MB' },
      { userId, title: 'COVID-19 Booster', type: 'vaccination', date: '2026-03-15', hospital: 'Community Health Centre', doctor: '', fileUrl: '', notes: 'CoWin verification complete' },
      { userId, title: 'Lipid Profile', type: 'report', date: '2026-07-21', hospital: 'Thyrocare Lab', doctor: 'Dr. K.K. Sethi', fileUrl: '/records/lipid.pdf', notes: '1.1 MB · LDL 118 mg/dL' },
    ],
  });
  console.log('✅ HealthRecord (5)');
}

async function seedHealthMetrics(userId: string) {
  const count = await prisma.healthMetric.count({ where: { userId } });
  if (count > 0) return;
  const data: any[] = [];
  const now = new Date();
  for (let d = 29; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    const bpSys = 118 + Math.floor(Math.random() * 18);
    const bpDia = 74 + Math.floor(Math.random() * 12);
    data.push({
      userId,
      date: date.toISOString().split('T')[0],
      bloodPressure: `${bpSys}/${bpDia}`,
      heartRate: 68 + Math.floor(Math.random() * 16),
      bloodSugar: Math.round((92 + Math.random() * 30) * 10) / 10,
      weight: Math.round((74 + Math.random() * 2) * 10) / 10,
      height: 172,
      temperature: Math.round((36.6 + Math.random() * 0.5) * 10) / 10,
      oxygenLevel: 96 + Math.floor(Math.random() * 3),
    });
  }
  await prisma.healthMetric.createMany({ data });
  console.log(`✅ HealthMetric (${data.length})`);
}

async function seedWearableData(userId: string) {
  const count = await prisma.wearableData.count({ where: { userId } });
  if (count > 0) return;
  const data: any[] = [];
  const now = new Date();
  for (let d = 13; d >= 0; d--) {
    const t = new Date(now);
    t.setDate(t.getDate() - d);
    data.push({
      userId,
      deviceId: 'fitbit-zc-01',
      heartRate: 66 + Math.floor(Math.random() * 18),
      bloodPressure: `${116 + Math.floor(Math.random() * 14)}/${72 + Math.floor(Math.random() * 12)}`,
      oxygenLevel: 96 + Math.floor(Math.random() * 3),
      steps: 4000 + Math.floor(Math.random() * 9000),
      calories: 1600 + Math.floor(Math.random() * 700),
      sleepHours: Math.round((6.5 + Math.random() * 2) * 10) / 10,
      recordedAt: t,
    });
  }
  await prisma.wearableData.createMany({ data });
  console.log(`✅ WearableData (${data.length})`);
}

async function seedDigitalTwin(userId: string) {
  await prisma.digitalTwin.upsert({
    where: { userId } as any,
    update: {
      displayName: 'Demo Avatar',
      healthSummary: JSON.stringify({
        organs: [
          { name: 'Heart', health: 85, color: '#ef4444', position: { x: 50, y: 25 }, description: 'Pumping life through your body' },
          { name: 'Lungs', health: 78, color: '#3b82f6', position: { x: 35, y: 30 }, description: 'Breathing the breath of life' },
          { name: 'Liver', health: 92, color: '#22c55e', position: { x: 65, y: 40 }, description: 'Detoxifying your blood' },
          { name: 'Kidneys', health: 88, color: '#8b5cf6', position: { x: 45, y: 55 }, description: 'Filtering waste day and night' },
          { name: 'Brain', health: 95, color: '#f59e0b', position: { x: 50, y: 15 }, description: 'Command center of your body' },
        ],
        habits: ['exercise', 'sleep'],
        healthScore: 87,
      }),
      lastSyncAt: new Date(),
    },
    create: {
      userId,
      displayName: 'Demo Avatar',
      healthSummary: JSON.stringify({
        organs: [
          { name: 'Heart', health: 85, color: '#ef4444', position: { x: 50, y: 25 }, description: 'Pumping life through your body' },
          { name: 'Lungs', health: 78, color: '#3b82f6', position: { x: 35, y: 30 }, description: 'Breathing the breath of life' },
          { name: 'Liver', health: 92, color: '#22c55e', position: { x: 65, y: 40 }, description: 'Detoxifying your blood' },
          { name: 'Kidneys', health: 88, color: '#8b5cf6', position: { x: 45, y: 55 }, description: 'Filtering waste day and night' },
          { name: 'Brain', health: 95, color: '#f59e0b', position: { x: 50, y: 15 }, description: 'Command center of your body' },
        ],
        habits: ['exercise', 'sleep'],
        healthScore: 87,
      }),
      lastSyncAt: new Date(),
    },
  });
  console.log('✅ DigitalTwin');
}

async function seedHealthGoals(userId: string) {
  const count = await prisma.healthGoal.count({ where: { userId } });
  if (count > 0) return;
  await prisma.healthGoal.createMany({
    data: [
      { userId, title: '10,000 Steps Daily', type: 'steps', targetValue: 10000, currentValue: 8200, unit: 'steps', startDate: '2026-08-01', status: 'active' },
      { userId, title: 'Sleep 8 Hours', type: 'sleep', targetValue: 8, currentValue: 7.2, unit: 'hrs', startDate: '2026-08-01', status: 'active' },
      { userId, title: 'Lose 3 kg', type: 'weight', targetValue: 71, currentValue: 74, unit: 'kg', startDate: '2026-07-01', endDate: '2026-10-01', status: 'active' },
      { userId, title: 'Drink 2L Water', type: 'water', targetValue: 2, currentValue: 1.6, unit: 'L', startDate: '2026-08-01', status: 'active' },
    ],
  });
  console.log('✅ HealthGoal (4)');
}

async function seedHealthTimeline(userId: string) {
  const count = await prisma.healthTimelineEvent.count({ where: { userId } });
  if (count > 0) return;
  const events = [
    { title: 'Annual Health Check-up', category: 'visit', date: '2026-07-20', hospital: 'AIIMS New Delhi', doctor: 'Dr. K.K. Sethi', description: 'Full panel blood work, ECG and lipid profile. All within normal limits.' },
    { title: 'CBC & Lipid Profile', category: 'lab', date: '2026-07-21', hospital: 'Thyrocare Lab', doctor: '', description: 'Hemoglobin 13.8 g/dL, LDL 118 mg/dL, HDL 52 mg/dL.' },
    { title: 'COVID-19 Booster', category: 'vaccination', date: '2026-03-15', hospital: 'Community Health Centre', doctor: '', description: 'Administered booster dose without reaction.' },
    { title: 'Cardiology Consultation', category: 'diagnosis', date: '2026-07-22', hospital: 'Fortis Escorts', doctor: 'Dr. Rajiv Bajaj', description: 'Mild hypertension diagnosis; advised lifestyle changes + Amlodipine 5mg.' },
    { title: 'Root Canal Treatment', category: 'surgery', date: '2026-02-10', hospital: 'Apollo Dental', doctor: '', description: 'Left lower molar root canal completed in two sittings.' },
    { title: 'Vitamin D3 Supplements', category: 'medication', date: '2026-08-01', hospital: '', doctor: '', description: 'Started weekly Vitamin D3 60K IU for deficiency.' },
  ];
  await prisma.healthTimelineEvent.createMany({ data: events.map(e => ({ ...e, userId, attachments: '[]', metadata: '{}' })) });
  console.log('✅ HealthTimelineEvent (6)');
}

async function seedMedicineReminders(userId: string) {
  const count = await prisma.medicineReminder.count({ where: { userId } });
  if (count > 0) return;
  await prisma.medicineReminder.createMany({
    data: [
      { userId, medicine: 'Amlodipine', dosage: '5mg', frequency: 'daily', times: '["08:00"]', startDate: '2026-07-22', notes: 'Take in the morning with breakfast' },
      { userId, medicine: 'Atorvastatin', dosage: '20mg', frequency: 'daily', times: '["21:00"]', startDate: '2026-07-22', notes: 'Take at night' },
      { userId, medicine: 'Vitamin D3', dosage: '60K IU', frequency: 'weekly', times: '["09:00"]', startDate: '2026-08-01', notes: 'Once a week, Sunday morning' },
      { userId, medicine: 'Paracetamol (as needed)', dosage: '650mg', frequency: 'custom', times: '["12:00"]', startDate: '2026-08-20', notes: 'Only for fever/headache' },
    ],
  });
  console.log('✅ MedicineReminder (4)');
}

async function seedHealthWallet(userId: string) {
  const wallet = await prisma.healthWallet.upsert({
    where: { userId } as any,
    update: {},
    create: { userId, balance: 1240 },
  });
  const txCount = await prisma.healthTransaction.count({ where: { walletId: wallet.id } });
  if (txCount === 0) {
    await prisma.healthTransaction.createMany({
      data: [
        { walletId: wallet.id, amount: 500, type: 'credit', category: 'reward', description: 'Welcome bonus', status: 'completed' },
        { walletId: wallet.id, amount: 200, type: 'credit', category: 'reward', description: 'Daily wellness mission completed', status: 'completed' },
        { walletId: wallet.id, amount: 150, type: 'credit', category: 'reward', description: 'Appointment attended', status: 'completed' },
        { walletId: wallet.id, amount: 200, type: 'credit', category: 'reward', description: 'Health data donation (anonymized)', status: 'completed' },
        { walletId: wallet.id, amount: 190, type: 'credit', category: 'reward', description: 'Steps challenge milestone', status: 'completed' },
      ],
    });
  }
  console.log('✅ HealthWallet + transactions');
}

async function seedRewards(userId: string) {
  const count = await prisma.reward.count({ where: { userId } });
  if (count > 0) return;
  const sources = ['mission', 'appointment', 'workout', 'donation', 'referral'];
  const descs = ['Completed 10K steps', 'Booked appointment', 'Workout streak 5 days', 'Health data donation', 'Referred a friend'];
  await prisma.reward.createMany({
    data: Array.from({ length: 10 }, (_, i) => ({
      userId,
      points: [50, 100, 25, 200, 150][i % 5],
      source: sources[i % 5],
      description: descs[i % 5],
    })),
  });
  console.log('✅ Reward (10)');
}

async function seedMedicalID(userId: string) {
  const exists = await prisma.medicalID.findUnique({ where: { userId } as any });
  if (exists) return;
  await prisma.medicalID.create({
    data: {
      userId,
      bloodGroup: 'O+',
      allergies: 'Penicillin',
      conditions: 'Hypertension',
      medications: 'Amlodipine, Atorvastatin',
      emergencyContact1: 'Meera Sharma',
      emergencyPhone1: '+919876543211',
      emergencyContact2: 'Ravi Kumar',
      emergencyPhone2: '+919876543212',
      organDonor: true,
      insuranceProvider: 'Star Health',
      insuranceNumber: 'STH-2045-8891',
    },
  });
  console.log('✅ MedicalID');
}

async function seedPrescriptions(userId: string) {
  const count = await prisma.prescription.count({ where: { userId } });
  if (count > 0) return;
  const doc = await prisma.doctor.findFirst();
  const doctorName = doc ? (await prisma.user.findUnique({ where: { id: doc.userId }, select: { name: true } }))?.name || 'Dr. Cardiologist' : 'Dr. Cardiologist';
  const now = new Date();
  const ago = new Date(now); ago.setDate(ago.getDate() - 40);
  await prisma.prescription.createMany({
    data: [
      {
        userId,
        doctorName,
        doctorId: doc?.id || null,
        medicines: JSON.stringify([{ name: 'Amlodipine', dosage: '5mg', frequency: 'OD' }, { name: 'Atorvastatin', dosage: '20mg', frequency: 'OD' }]),
        instructions: 'Take in the morning. Monitor BP daily. Follow-up in 3 months.',
        date: ago.toISOString().split('T')[0],
        validUntil: new Date(now.getTime() + 180 * 86400000).toISOString().split('T')[0],
      },
      {
        userId,
        doctorName,
        doctorId: doc?.id || null,
        medicines: JSON.stringify([{ name: 'Vitamin D3', dosage: '60K IU', frequency: 'Weekly' }]),
        instructions: 'Once a week on Sunday after breakfast. Repeat D3 level after 8 weeks.',
        date: now.toISOString().split('T')[0],
        validUntil: new Date(now.getTime() + 180 * 86400000).toISOString().split('T')[0],
      },
    ],
  });
  console.log('✅ Prescription (2)');
}

async function seedHealthCamps() {
  const count = await prisma.healthCamp.count();
  if (count > 0) return;
  const services = ['Blood Pressure', 'Blood Sugar', 'BMI', 'Ophthalmology', 'Dental'];
  const camps = CITIES.slice(0, 6).map((c, i) => ({
    name: `Free ${['Diabetes & BP', 'Eye Care', 'Heart Health', 'Women\'s Health', 'Child Vaccination', 'Dental'][i]} Camp`,
    campType: ['Free Check-up', 'Eye Screening', 'Cardiac', 'Women\'s Health', 'Vaccination', 'Dental'][i],
    date: `2026-09-${String(5 + i).padStart(2, '0')}`,
    time: '09:00 AM - 02:00 PM',
    location: `Community Health Centre, ${c.city} Sector 7`,
    city: c.city,
    state: c.state,
    lat: c.lat,
    lng: c.lng,
    services: JSON.stringify(services.slice(0, 3 + (i % 2))),
    hospital: HOSPITAL_NAMES[i % HOSPITAL_NAMES.length] + ', ' + c.city,
    registration: i % 2 === 0 ? 'Free' : '₹50',
    spotsAvailable: 30 + i * 10,
    organizedBy: 'ZyntraCare Health Foundation',
  }));
  await prisma.healthCamp.createMany({ data: camps });
  console.log('✅ HealthCamp (6)');
}

async function seedCommunities() {
  const count = await prisma.community.count();
  if (count > 0) return;
  const communities = [
    { name: 'Diabetes Support Group', description: 'Share tips, track sugar levels and stay motivated.', category: 'Chronic Conditions', memberCount: 1240 },
    { name: 'New Parents Circle', description: 'Advice on baby care, feeding and sleep.', category: 'Parenting', memberCount: 860 },
    { name: 'Heart Health Warriors', description: 'Support for cardiac patients and families.', category: 'Cardiology', memberCount: 530 },
    { name: 'Mental Wellness', description: 'A safe space for mental health discussions.', category: 'Mental Health', memberCount: 2100 },
    { name: 'Fitness & Yoga', description: 'Daily workout and yoga routines for all levels.', category: 'Fitness', memberCount: 940 },
  ];
  for (const c of communities) {
    const created = await prisma.community.create({ data: { ...c, image: '', createdBy: DEMO_USER_ID, isActive: true } });
    const posts = [
      { content: 'Welcome everyone! Introduce yourselves and let\'s grow together. 💙', likes: 25, replies: 12 },
      { content: 'Sharing a helpful article I found on managing the condition naturally.', likes: 18, replies: 5 },
      { content: 'Has anyone tried the new tracking feature? It really helped me stay consistent.', likes: 9, replies: 3 },
    ];
    for (const p of posts) {
      await prisma.communityPost.create({
        data: { communityId: created.id, userId: DEMO_USER_ID, authorName: 'Demo Patient', content: p.content, likes: p.likes, replies: p.replies },
      });
    }
  }
  console.log('✅ Community (5) + posts');
}

async function seedClinicalTrials() {
  const count = await prisma.clinicalTrial.count();
  if (count > 0) return;
  await prisma.clinicalTrial.createMany({
    data: [
      { title: 'Study of a Novel SGLT2 Inhibitor in Type 2 Diabetes', description: 'Evaluating glycemic control and cardiovascular safety of a novel SGLT2 inhibitor vs placebo.', phase: 'Phase 3', condition: 'Type 2 Diabetes', intervention: 'Drug: SGLT2 inhibitor', sponsor: 'Sun Pharma', location: 'AIIMS, New Delhi', ageRange: '18-70', eligibility: '["HbA1c >7%", "No recent CV event"]', status: 'recruiting', startDate: '2026-08-01', contactEmail: 'ct@sunpharma.com', contactPhone: '+91-11-40000000', url: 'https://clinicaltrials.gov' },
      { title: 'AI-Assisted Early Detection of Diabetic Retinopathy', description: 'Validating an AI screening model against expert ophthalmology review.', phase: 'Phase 2', condition: 'Diabetic Retinopathy', intervention: 'Device: AI screening', sponsor: 'TCS Health', location: 'Sankara Nethralaya, Chennai', ageRange: '21-75', eligibility: '["Diabetes", "No prior laser"]', status: 'recruiting', startDate: '2026-07-15', contactEmail: 'trial@tcs.com', contactPhone: '+91-44-26000000', url: '' },
      { title: 'Low-Cost Wearable for Hypertension Monitoring', description: 'Testing accuracy of a low-cost wearable cuff for ambulatory BP monitoring.', phase: 'Phase 1', condition: 'Hypertension', intervention: 'Device: wearable cuff', sponsor: 'Zyfra', location: 'Narayana Health, Bangalore', ageRange: '25-65', eligibility: '["Stage 1 HTN"]', status: 'recruiting', startDate: '2026-09-01', contactEmail: 'rnd@zyfra.io', contactPhone: '+91-80-41000000', url: '' },
      { title: 'Telehealth CBT for Anxiety in Rural Populations', description: 'Comparing digital CBT delivery with standard care in rural districts.', phase: 'Phase 3', condition: 'Generalized Anxiety', intervention: 'Behavioral: CBT sessions', sponsor: 'NIMHANS', location: 'NIMHANS, Bangalore', ageRange: '18-60', eligibility: '["GAD-7 >=10"]', status: 'active', startDate: '2026-05-01', contactEmail: 'ct@nimhans.ac.in', contactPhone: '+91-80-26560000', url: '' },
      { title: 'Community Screening for Oral Cancer', description: 'Assessing effectiveness of community-level visual screening for oral cancer.', phase: 'Phase 4', condition: 'Oral Cancer', intervention: 'Screening: visual + adjunct', sponsor: 'ICMR', location: 'Tata Memorial, Mumbai', ageRange: '30-80', eligibility: '["Tobacco users"]', status: 'recruiting', startDate: '2026-06-01', contactEmail: 'icmr-ct@nic.in', contactPhone: '+91-22-24170000', url: '' },
      { title: 'Smart Inhaler Adherence in Asthma', description: 'Measuring adherence improvement with sensor-enabled inhalers.', phase: 'Phase 2', condition: 'Asthma', intervention: 'Device: smart inhaler', sponsor: 'Cipla', location: 'KEM Hospital, Pune', ageRange: '12-65', eligibility: '["Moderate asthma"]', status: 'completed', startDate: '2025-11-01', endDate: '2026-04-30', contactEmail: 'research@cipla.com', contactPhone: '+91-20-66000000', url: '' },
    ],
  });
  console.log('✅ ClinicalTrial (6)');
}

async function seedMedicineInteractions() {
  const count = await prisma.medicineInteraction.count();
  if (count > 0) return;
  const interactions = [
    ['Aspirin', 'Warfarin', 'Major', 'Increased bleeding risk. Monitor INR closely.', 'monitor'],
    ['Warfarin', 'Ciprofloxacin', 'Major', 'Ciprofloxacin increases warfarin effect — risk of bleeding.', 'avoid'],
    ['Metformin', 'Alcohol', 'Moderate', 'Increased risk of lactic acidosis.', 'avoid'],
    ['Amlodipine', 'Simvastatin', 'Moderate', 'Increased simvastatin exposure — myopathy risk.', 'monitor'],
    ['Paracetamol', 'Warfarin', 'Moderate', 'Prolonged high-dose paracetamol may increase INR.', 'monitor'],
    ['Omeprazole', 'Clopidogrel', 'Moderate', 'Reduced clopidogrel activation — antiplatelet effect decreased.', 'monitor'],
    ['Atorvastatin', 'Grapefruit', 'Moderate', 'Increased statin levels — muscle pain risk.', 'avoid'],
    ['Ibuprofen', 'Aspirin', 'Major', 'Reduces aspirin\'s cardioprotective effect + GI bleed risk.', 'avoid'],
    ['Losartan', 'Potassium Supplements', 'Moderate', 'Risk of hyperkalemia.', 'monitor'],
    ['Ciprofloxacin', 'Antacids', 'Moderate', 'Reduces antibiotic absorption. Separate by 2-4 hours.', 'monitor'],
    ['Diazepam', 'Alcohol', 'Major', 'Potent CNS depression — respiratory risk.', 'avoid'],
    ['Lisinopril', 'Ibuprofen', 'Moderate', 'Reduced antihypertensive effect + kidney risk.', 'monitor'],
  ];
  await prisma.medicineInteraction.createMany({
    data: interactions.map(([med1, med2, severity, advice, action]) => ({
      medicine1: med1 as string,
      medicine2: med2 as string,
      severity: severity as string,
      description: advice as string,
      recommendation: action as string,
    })),
  });
  console.log('✅ MedicineInteraction (12)');
}

async function seedWellnessMissions() {
  const count = await prisma.wellnessMission.count();
  if (count > 0) return;
  const missions = [
    { title: 'Drink 8 Glasses of Water', category: 'nutrition', points: 20, duration: 'daily', icon: '💧', description: 'Stay hydrated throughout the day.' },
    { title: '10-Minute Morning Walk', category: 'exercise', points: 30, duration: 'daily', icon: '🚶', description: 'Kickstart circulation.' },
    { title: '5-Minute Meditation', category: 'mental', points: 25, duration: 'daily', icon: '🧘', description: 'Calm the mind.' },
    { title: '8 Hours of Sleep', category: 'sleep', points: 30, duration: 'daily', icon: '😴', description: 'Prioritise rest.' },
    { title: 'Call a Loved One', category: 'social', points: 15, duration: 'daily', icon: '📞', description: 'Nurture relationships.' },
    { title: 'Walk 10,000 Steps', category: 'exercise', points: 50, duration: 'daily', icon: '👟', description: 'Hit your step goal.' },
    { title: 'Eat 5 Servings of Vegetables', category: 'nutrition', points: 40, duration: 'daily', icon: '🥗', description: 'Fuel with greens.' },
  ];
  await prisma.wellnessMission.createMany({ data: missions });
  console.log('✅ WellnessMission (7)');
}

async function seedHealthChallenges() {
  const count = await prisma.healthChallenge.count();
  if (count > 0) return;
  await prisma.healthChallenge.createMany({
    data: [
      { title: '30-Day Walking Challenge', category: 'fitness', duration: 30, targetValue: 10000, unit: 'steps', points: 500, icon: '🚶', startDate: '2026-09-01', endDate: '2026-09-30', description: 'Walk 10,000 steps daily for 30 days.' },
      { title: 'Sugar-Free September', category: 'nutrition', duration: 30, targetValue: 0, unit: 'g sugar', points: 400, icon: '🚫', startDate: '2026-09-01', endDate: '2026-09-30', description: 'Avoid added sugar for a month.' },
      { title: '7-Day Meditation Reset', category: 'mental', duration: 7, targetValue: 10, unit: 'min', points: 150, icon: '🧘', startDate: '2026-09-08', endDate: '2026-09-14', description: 'Meditate 10 minutes daily for a week.' },
      { title: 'Hydration Heroes', category: 'hydration', duration: 14, targetValue: 2, unit: 'L', points: 200, icon: '💧', startDate: '2026-09-01', endDate: '2026-09-14', description: 'Drink 2L water every day for two weeks.' },
      { title: '8-Hour Sleep Streak', category: 'sleep', duration: 21, targetValue: 8, unit: 'hrs', points: 300, icon: '😴', startDate: '2026-09-01', endDate: '2026-09-21', description: 'Sleep 8 hours nightly for 3 weeks.' },
    ],
  });
  console.log('✅ HealthChallenge (5)');
}

async function seedDoctorReviews() {
  const count = await prisma.doctorReview.count();
  if (count > 0) return;
  const doctors = await prisma.doctor.findMany({ take: 10, include: { user: { select: { name: true } } } });
  if (doctors.length === 0) return;
  const sampleReviews = [
    { rating: 5, title: 'Excellent, very thorough', comment: 'Explained everything clearly and put me at ease. Highly recommend.', visitType: 'in_person', wouldRecommend: true },
    { rating: 4, title: 'Good experience', comment: 'Professional and knowledgeable. Wait time was a bit long.', visitType: 'online', wouldRecommend: true },
    { rating: 5, title: 'Best specialist I\'ve visited', comment: 'Very detailed diagnosis and follow-up care.', visitType: 'in_person', wouldRecommend: true },
  ];
  for (const doc of doctors.slice(0, 6)) {
    await prisma.doctorReview.create({
      data: {
        doctorId: doc.id,
        userId: DEMO_USER_ID,
        userName: 'Demo Patient',
        rating: sampleReviews[Math.floor(Math.random() * 3)].rating,
        title: sampleReviews[Math.floor(Math.random() * 3)].title,
        comment: sampleReviews[Math.floor(Math.random() * 3)].comment,
        visitType: 'in_person',
        wouldRecommend: true,
      },
    });
  }
  console.log('✅ DoctorReview (6)');
}

async function seedDrones() {
  const count = await prisma.drone.count();
  if (count > 0) return;
  const drones = [
    { droneId: 'DRN-001', name: 'SkyMed-1', model: 'QuadX Pro', status: 'IDLE', batteryLevel: 92, lat: 28.6139, lng: 77.209, altitude: 0, speed: 0 },
    { droneId: 'DRN-002', name: 'SkyMed-2', model: 'QuadX Pro', status: 'IN_FLIGHT', batteryLevel: 74, lat: 28.6288, lng: 77.2194, altitude: 120, speed: 45 },
    { droneId: 'DRN-003', name: 'SkyMed-3', model: 'HexaLift', status: 'CHARGING', batteryLevel: 45, lat: 28.5892, lng: 77.2298, altitude: 0, speed: 0 },
    { droneId: 'DRN-004', name: 'SkyMed-4', model: 'RapidDropper', status: 'IN_FLIGHT', batteryLevel: 88, lat: 28.6544, lng: 77.2412, altitude: 150, speed: 65 },
    { droneId: 'DRN-005', name: 'SkyMed-5', model: 'QuadX Pro', status: 'IN_FLIGHT', batteryLevel: 60, lat: 28.5661, lng: 77.2434, altitude: 80, speed: 30 },
  ];
  for (const d of drones) {
    await prisma.drone.create({ data: d });
  }
  const createdDrones = await prisma.drone.findMany({ where: { droneId: { in: drones.map(d => d.droneId) } } });
  await prisma.droneMission.createMany({
    data: [
      { droneId: createdDrones[0].id, type: 'delivery', status: 'COMPLETED', originLat: 28.6139, originLng: 77.209, destLat: 28.62, destLng: 77.22, packageDesc: 'Blood Pack (O+)', recipientName: 'Apollo Hospital', recipientPhone: '+919876543210', completedAt: new Date() },
      { droneId: createdDrones[1].id, type: 'delivery', status: 'IN_PROGRESS', originLat: 28.6139, originLng: 77.209, destLat: 28.63, destLng: 77.22, packageDesc: 'Insulin Vials', recipientName: 'MedPlus Pharmacy', recipientPhone: '+919876543211', startedAt: new Date() },
      { droneId: createdDrones[3].id, type: 'emergency', status: 'IN_PROGRESS', originLat: 28.65, originLng: 77.24, destLat: 28.64, destLng: 77.23, packageDesc: 'Emergency Supplies', recipientName: 'Dwarka Emergency Site', recipientPhone: '+919876543212', startedAt: new Date() },
    ],
  });
  console.log('✅ Drone (5) + missions');
}

async function seedOrganMatch() {
  const dCount = await prisma.organDonor.count();
  if (dCount >= 5) return;
  await prisma.user.deleteMany({ where: { email: { in: ['donor0@zyntracare.app','donor1@zyntracare.app','donor2@zyntracare.app','donor3@zyntracare.app','donor4@zyntracare.app','recipient0@zyntracare.app','recipient1@zyntracare.app','recipient2@zyntracare.app','recipient3@zyntracare.app','recipient4@zyntracare.app'] } } as any });
  const cities = CITIES;
  const now = new Date();
  for (let i = 0; i < 5; i++) {
    const c = cities[i % cities.length];
    const donor = await prisma.user.create({
      data: { email: `donor${i}@zyntracare.app`, name: `Organ Donor ${i + 1}`, phone: `+91930${String(10000 + i * 1111)}`, role: 'patient', city: c.city },
    });
    await prisma.organDonor.create({
      data: { userId: donor.id, organs: JSON.stringify(['Kidney', 'Liver'].slice(0, 1 + (i % 2))), bloodType: ['O+', 'O-', 'A+', 'B+', 'AB+'][i % 5], age: 30 + i, weight: 70 + i, height: 168 + i, city: c.city, state: c.state, isActive: true },
    });
    const rec = await prisma.user.create({
      data: { email: `recipient${i}@zyntracare.app`, name: `Recipient ${i + 1}`, phone: `+91931${String(10000 + i * 1111)}`, role: 'patient', city: c.city },
    });
    await prisma.organRecipient.create({
      data: { userId: rec.id, organNeeded: ['Kidney', 'Liver', 'Cornea', 'Heart'][i % 4], bloodType: ['O+', 'A+', 'B+', 'O-', 'AB+'][i % 5], urgency: ['HIGH', 'MEDIUM', 'CRITICAL', 'LOW', 'MEDIUM'][i % 5], age: 40 + i, city: c.city, state: c.state, isActive: true },
    });
  }
  console.log('✅ OrganDonor (5) + Recipient (5)');
}

async function seedInsurancePlans() {
  const count = await prisma.insurancePlan.count();
  if (count > 0) return;
  await prisma.insurancePlan.createMany({
    data: [
      { name: 'Micro Health Shield', provider: 'ZyntraCare Insurance', type: 'health', coverage: 250000, premium: 299, period: 'monthly', description: 'Basic hospitalization cover for individuals & families.', eligibility: '["18-65", "No pre-existing cardiac disease"]', isActive: true },
      { name: 'Accident Care', provider: 'SBI General', type: 'accident', coverage: 500000, premium: 199, period: 'monthly', description: 'Accidental death & disability cover on the go.', eligibility: '["18-70"]', isActive: true },
      { name: 'Critical Illness Shield', provider: 'HDFC Ergo', type: 'critical_illness', coverage: 1000000, premium: 549, period: 'monthly', description: 'Lump-sum payout on major critical illnesses.', eligibility: '["18-60", "Non-smoker"]', isActive: true },
      { name: 'Daily Hospital Cash', provider: 'Care Health', type: 'daily_hospital', coverage: 3000, premium: 129, period: 'monthly', description: 'Cash allowance for every day of hospitalization.', eligibility: '["18-65"]', isActive: true },
    ],
  });
  console.log('✅ InsurancePlan (4)');
}

async function seedEmergencyAlerts() {
  const count = await prisma.emergencyAlert.count();
  if (count > 0) return;
  const hospital = await prisma.hospital.findFirst({ where: { emergency: true } });
  await prisma.emergencyAlert.createMany({
    data: [
      { userId: DEMO_USER_ID, location: 'Connaught Place, New Delhi', latitude: 28.6315, longitude: 77.2167, alertType: 'MEDICAL', description: 'Chest pain reported, ambulance dispatched.', status: 'RESOLVED' },
      { userId: DEMO_USER_ID, location: 'Dwarka Sector 6, New Delhi', latitude: 28.5814, longitude: 77.0557, alertType: 'ACCIDENT', description: 'Road accident at Metro exit, EMS on route.', status: 'TRIGGERED', hospitalId: hospital?.id || null },
      { userId: DEMO_USER_ID, location: 'Saket, New Delhi', latitude: 28.5245, longitude: 77.2065, alertType: 'MEDICAL', description: 'Elderly woman with breathing difficulty.', status: 'RESOLVED' },
    ],
  });
  console.log('✅ EmergencyAlert (3)');
}

async function seedCampRegistrations() {
  const count = await prisma.campRegistration.count();
  if (count > 0) return;
  const camps = await prisma.healthCamp.findMany({ take: 6 });
  if (camps.length === 0) return;
  const names = ['Rahul Verma', 'Sneha Iyer', 'Amit Patel', 'Farida Khan', 'John Mathew', 'Kavita Nair'];
  for (let i = 0; i < camps.length; i++) {
    for (let j = 0; j < 3; j++) {
      await prisma.campRegistration.create({
        data: { campId: camps[i].id, name: names[(i + j) % names.length], phone: `+9198${String(700000 + (i * 13 + j * 7) * 37)}`, email: `${names[(i + j) % names.length].toLowerCase().replace(' ', '.')}@example.com`, age: 22 + ((i + j) % 45), city: camps[i].city },
      });
    }
  }
  console.log(`✅ CampRegistration (${camps.length * 3})`);
}

async function seedChallengeParticipations() {
  const count = await prisma.challengeParticipation.count();
  if (count > 0) return;
  const challenges = await prisma.healthChallenge.findMany({ take: 5 });
  for (const c of challenges) {
    await prisma.challengeParticipation.create({ data: { challengeId: c.id, userId: DEMO_USER_ID, progress: 0.35, completed: false } });
  }
  console.log('✅ ChallengeParticipation (5)');
}

async function seedRealTimeBeds() {
  const count = await prisma.realTimeBed.count();
  if (count > 0) return;
  const hospitals = await prisma.hospital.findMany({ take: 40 });
  const rows = hospitals.map(h => {
    let beds: Record<string, number> = {};
    try { beds = JSON.parse(h.beds || '{}') as Record<string, number>; } catch (e) { beds = {}; }
    const total = beds.total || 300;
    const available = beds.available ?? Math.floor(total * 0.45);
    const totalICU = beds.icu || Math.floor(total * 0.1);
    const availableICU = beds.icuAvailable ?? Math.floor(totalICU * 0.5);
    return {
      hospitalId: h.id,
      hospitalName: h.name,
      totalBeds: total,
      availableBeds: available,
      occupiedBeds: total - available,
      totalICU,
      availableICU,
      occupiedICU: totalICU - availableICU,
      icuOccupancy: totalICU > 0 ? Math.round(((totalICU - availableICU) / totalICU) * 100) : 0,
      generalOccupancy: total > 0 ? Math.round(((total - available) / total) * 100) : 0,
      updateSource: 'auto',
      isVerified: true,
    };
  });
  await prisma.realTimeBed.createMany({ data: rows });
  console.log(`✅ RealTimeBed (${rows.length})`);
}

async function seedFamilyMembers(userId: string) {
  const count = await prisma.familyMember.count({ where: { userId } });
  if (count > 0) return;
  await prisma.familyMember.createMany({
    data: [
      { userId, name: 'Meera Sharma', relation: 'spouse', age: 32, bloodGroup: 'B+', phone: '+919876543211', conditions: '["None"]', medications: '["None"]', isEmergency: true },
      { userId, name: 'Rohan Sharma', relation: 'child', age: 7, bloodGroup: 'O+', conditions: '["Asthma"]', medications: '["Albuterol"]', isEmergency: true },
      { userId, name: 'Suresh Sharma', relation: 'parent', age: 62, bloodGroup: 'A+', phone: '+919876543212', conditions: '["Diabetes","Hypertension"]', medications: '["Metformin","Amlodipine"]', isEmergency: false },
      { userId, name: 'Priya Sharma', relation: 'parent', age: 59, bloodGroup: 'AB+', conditions: '["None"]', medications: '["None"]', isEmergency: false },
      { userId, name: 'Aditya Sharma', relation: 'sibling', age: 29, bloodGroup: 'O-', phone: '+919876543213', conditions: '["None"]', medications: '["None"]', isEmergency: false },
    ],
  });
  console.log('✅ FamilyMember (5)');
}

async function seedPets(userId: string) {
  const count = await prisma.pet.count({ where: { userId } });
  if (count > 0) return;
  const pets = await prisma.pet.createMany({
    data: [
      { userId, name: 'Bruno', species: 'dog', breed: 'Labrador Retriever', age: 4, weight: 28, color: 'Golden', microchip: '982000123456789', notes: 'Friendly, loves treats. Vaccinated for rabies.' },
      { userId, name: 'Milo', species: 'cat', breed: 'Persian', age: 2, weight: 4.5, color: 'White', notes: 'Indoor cat, milk allergy.' },
    ],
  });
  const petRows = await prisma.pet.findMany({ where: { userId } });
  await prisma.petVaccination.createMany({
    data: petRows.flatMap((p, i) => [
      { petId: p.id, name: 'Rabies', dateGiven: '2026-02-14', nextDueDate: '2027-02-14', veterinarian: 'Dr. Anil Kumar', notes: 'Booster shot' },
      { petId: p.id, name: i === 0 ? 'DHPP' : 'FVRCP', dateGiven: '2026-01-05', nextDueDate: '2027-01-05', veterinarian: 'Dr. Anil Kumar' },
    ]),
  });
  console.log(`✅ Pet (${pets.count}) + PetVaccination`);
}

async function seedVoiceReminders(userId: string) {
  const count = await prisma.voiceReminder.count({ where: { userId } });
  if (count > 0) return;
  const now = new Date();
  await prisma.voiceReminder.createMany({
    data: [
      { userId, title: 'Morning medicine', message: 'Time to take your Amlodipine 5mg.', scheduledAt: new Date(now.getTime() + 30 * 60000), repeatType: 'daily' },
      { userId, title: 'Hydration check', message: 'Drink a glass of water and stay hydrated.', scheduledAt: new Date(now.getTime() + 90 * 60000), repeatType: 'daily' },
      { userId, title: 'Evening walk', message: 'Gentle reminder for your 30-minute evening walk.', scheduledAt: new Date(now.getTime() + 6 * 3600000), repeatType: 'daily' },
      { userId, title: 'Doctor follow-up', message: 'Your physiotherapy follow-up is tomorrow morning.', scheduledAt: new Date(now.getTime() + 20 * 3600000), repeatType: 'none' },
    ],
  });
  console.log('✅ VoiceReminder (4)');
}

async function seedInsuranceClaims(userId: string) {
  const count = await prisma.insuranceClaim.count({ where: { userId } });
  if (count > 0) return;
  await prisma.insuranceClaim.createMany({
    data: [
      { userId, hospitalName: 'Fortis Escorts Heart Institute', treatmentType: 'Angioplasty', claimAmount: 185000, approvedAmount: 172000, status: 'approved', diagnosis: 'Coronary artery disease', treatmentDate: '2026-07-22', claimNumber: 'ZCI-20260722-0041', documents: '["/records/claim1.pdf"]', notes: 'Approved in 5 days' },
      { userId, hospitalName: 'Max Super Speciality Hospital', treatmentType: 'Consultation + Lab', claimAmount: 24800, status: 'processing', diagnosis: 'Routine checkup', treatmentDate: '2026-08-05', claimNumber: 'ZCI-20260805-0017', documents: '["/records/claim2.pdf"]', notes: 'Under review' },
      { userId, hospitalName: 'City Dental Care', treatmentType: 'Root canal', claimAmount: 12000, status: 'submitted', diagnosis: 'Endodontic treatment', treatmentDate: '2026-08-18', claimNumber: 'ZCI-20260818-0009', documents: '["/records/claim3.pdf"]', notes: 'Awaiting submission of dental records' },
      { userId, hospitalName: 'Thyrocare Lab', treatmentType: 'Full body checkup', claimAmount: 19999, approvedAmount: 16300, status: 'paid', diagnosis: 'Preventive screening', treatmentDate: '2026-06-12', claimNumber: 'ZCI-20260612-0102', documents: '["/records/claim4.pdf"]', notes: 'Amount credited to bank' },
    ],
  });
  console.log('✅ InsuranceClaim (4)');
}

async function seedDataListings(userId: string) {
  const count = await prisma.dataListing.count({ where: { userId } });
  if (count > 0) return;
  await prisma.dataListing.createMany({
    data: [
      { userId, title: 'Wearable health metrics — 6 months', description: 'Anonymized heart rate, sleep and activity data from a Fitbit device.', dataType: 'wearable', price: 15, format: 'CSV', isAnonymized: true, status: 'ACTIVE' },
      { userId, title: 'Genomic risk profile', description: 'Share de-identified genomic variants for population research.', dataType: 'genomic', price: 250, format: 'VCF', isAnonymized: true, status: 'ACTIVE' },
      { userId, title: 'Blood pressure trends', description: 'Daily BP readings over 6 months for hypertension research.', dataType: 'health_record', price: 8, format: 'JSON', isAnonymized: true, status: 'ACTIVE' },
      { userId, title: 'Annual lab results set', description: 'LTFH-like panel results aggregated by age and region.', dataType: 'research', price: 0, format: 'CSV', isAnonymized: true, status: 'ARCHIVED' },
    ],
  });
  console.log('✅ DataListing (4)');
}

async function seedQueueEntries() {
  const count = await prisma.queueEntry.count();
  if (count > 0) return;
  const hospitals = await prisma.hospital.findMany({ take: 6 });
  if (hospitals.length === 0) return;
  const departments = ['Cardiology', 'Orthopaedics', 'Neurology', 'General Medicine', 'Pediatrics', 'Dermatology'];
  const names = ['Rahul Verma', 'Ananya Iyer', 'Vikram Singh', 'Kavita Nair', 'Arjun Reddy', 'Sneha Deshmukh'];
  const rows = hospitals.slice(0, 4).flatMap((h, hi) =>
    departments.slice(0, 3).map((dept, di) => ({
      hospitalId: h.id,
      userId: di === 0 ? DEMO_USER_ID : null,
      patientName: names[(hi * 3 + di) % names.length],
      department: dept,
      queueNumber: (hi * 7 + di) + 1,
      status: di === 0 ? 'waiting' : di === 1 ? 'in_progress' : 'completed',
      priority: di === 2 ? 'urgent' : 'normal',
      estimatedWait: 15 + di * 10,
      joinedAt: new Date(),
    })),
  );
  await prisma.queueEntry.createMany({ data: rows });
  console.log(`✅ QueueEntry (${rows.length})`);
}

async function seedMedicineSupply() {
  const count = await prisma.medicineSupply.count();
  if (count > 0) return;
  const hospitals = await prisma.hospital.findMany({ take: 4 });
  const medicines = [
    { medicine: 'Paracetamol 650mg', manufacturer: 'Cipla', distributor: 'MedPlus Distributors' },
    { medicine: 'Amlodipine 5mg', manufacturer: 'Sun Pharma', distributor: 'Apollo Distributors' },
    { medicine: 'Metformin 500mg', manufacturer: 'USV', distributor: 'MedPlus Distributors' },
    { medicine: 'Atorvastatin 20mg', manufacturer: 'Dr. Reddy\'s', distributor: 'Apollo Distributors' },
    { medicine: 'Amoxicillin 500mg', manufacturer: 'Alkem', distributor: 'Jan Aushadhi' },
    { medicine: 'Omeprazole 20mg', manufacturer: 'Torrent', distributor: 'MedPlus Distributors' },
  ];
  const yearAgo = new Date();
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  const rows = medicines.map((m, i) => ({
    batchId: `BATCH-ZC-${2026}${String(100 + i)}`,
    medicine: m.medicine,
    manufacturer: m.manufacturer,
    distributor: m.distributor,
    hospitalId: hospitals[i % Math.max(hospitals.length, 1)]?.id ?? null,
    quantity: 500 + i * 250,
    manufacturingDate: yearAgo,
    expiryDate: new Date(yearAgo.getFullYear() + 2, yearAgo.getMonth(), yearAgo.getDate()),
    currentLocation: 'New Delhi · Warehouse 4',
    supplyStatus: ['MANUFACTURED', 'IN_TRANSIT', 'AT_HOSPITAL', 'DELIVERED'][i % 4],
    blockchainHash: `0x${Math.random().toString(16).slice(2, 42)}`,
    notes: 'Tracked on supply chain ledger',
  }));
  await prisma.medicineSupply.createMany({ data: rows });
  console.log(`✅ MedicineSupply (${rows.length})`);
}

async function seedCorporatePrograms() {
  const count = await prisma.corporateProgram.count();
  if (count > 0) return;
  const program = await prisma.corporateProgram.create({
    data: {
      companyName: 'TechNova Solutions Pvt Ltd',
      contactName: 'Ritika Mehta',
      contactEmail: 'hr@technova.example',
      contactPhone: '+919811223344',
      employeeCount: 420,
      services: JSON.stringify(['Annual health checkups', 'Mental health support', 'Teleconsultations', 'Fitness challenges']),
      status: 'ACTIVE',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2027-03-31'),
      members: {
        create: [
          { employeeId: 'TN-1021', name: 'Ritika Mehta', email: 'ritika@technova.example', department: 'HR' },
          { employeeId: 'TN-0845', name: 'Amit Bansal', email: 'amit@technova.example', department: 'Engineering' },
          { employeeId: 'TN-1129', name: 'Divya Kulkarni', email: 'divya@technova.example', department: 'Finance' },
          { employeeId: 'TN-0973', name: 'Rohan Gupta', email: 'rohan@technova.example', department: 'Sales' },
        ],
      },
    },
  });
  console.log('✅ CorporateProgram + members');
}

async function seedAppointments(userId: string) {
  const count = await prisma.appointment.count({ where: { userId } });
  if (count > 0) return;
  const doctors = await prisma.doctor.findMany({ take: 6, include: { user: { select: { name: true } } } });
  const hospitals = await prisma.hospital.findMany({ take: 4 });
  const now = new Date();
  const day = (offset: number) => new Date(now.getTime() + offset * 86400000).toISOString().split('T')[0];

  const appts = [
    { doctorIdx: 0, hospIdx: 0, date: day(3), time: '10:30 AM', status: 'confirmed', isOnline: false },
    { doctorIdx: 1, hospIdx: 1, date: day(7), time: '04:00 PM', status: 'confirmed', isOnline: true },
    { doctorIdx: 2, hospIdx: 2, date: day(-20), time: '11:00 AM', status: 'completed', isOnline: false },
    { doctorIdx: 3, hospIdx: 3, date: day(-45), time: '05:30 PM', status: 'completed', isOnline: false },
  ].filter(a => doctors.length > a.doctorIdx && hospitals.length > a.hospIdx);

  const created: string[] = [];
  for (const a of appts) {
    if (doctors.length === 0 || hospitals.length === 0) continue;
    const doc = doctors[a.doctorIdx];
    const made = await prisma.appointment.create({
      data: {
        userId,
        hospitalId: hospitals[a.hospIdx].id,
        doctorId: doc.id,
        doctorName: doc.user?.name || 'Dr. Specialist',
        specialty: doc.specialty,
        date: a.date,
        time: a.time,
        status: a.status,
        isOnline: a.isOnline,
      },
    });
    created.push(made.id);
  }
  if (created.length > 0) {
    await prisma.appointmentReminder.create({
      data: { userId, appointmentId: created[0], title: 'Upcoming doctor appointment', dateTime: `${appts[0].date} ${appts[0].time}`, location: hospitals?.[0]?.name || '', reminderBefore: 60, type: 'appointment', notes: 'Your appointment is tomorrow. Reach 15 minutes early.' },
    });
    await prisma.notification.createMany({
      data: [
        { userId, title: 'Appointment reminder', message: `Check-up with ${doctors[0]?.user?.name || 'your doctor'} at ${hospitals[0]?.name || 'hospital'} tomorrow ${appts[0].time}.`, type: 'info', link: '/appointment-reminders' },
        { userId, title: 'Health tip', message: 'Drink 8 glasses of water today to stay hydrated.', type: 'success' },
      ],
    });
  }
  console.log(`✅ Appointments (${created.length}) for ${userId}`);
}

async function main() {
  console.log('🌱 Seeding feature data...');
  const demoUser = await ensureDemoUser();
  const realUser = await prisma.user.findFirst({ where: { email: 'test@patient.com' } });
  const profileTargets = Array.from(new Set([demoUser.id, realUser?.id].filter(Boolean))) as string[];
  console.log('✅ Profile targets:', profileTargets.join(', '));

  // Non-user / fleet data
  await seedHealthCamps();
  await seedCommunities();
  await seedClinicalTrials();
  await seedMedicineInteractions();
  await seedWellnessMissions();
  await seedHealthChallenges();
  await seedDoctorReviews();
  await seedDrones();
  await seedOrganMatch();
  await seedInsurancePlans();
  await seedEmergencyAlerts();
  await seedCampRegistrations();
  await seedChallengeParticipations();
  await seedRealTimeBeds();

  // user-scoped (demo-user + real demo login)
  for (const uid of profileTargets) {
    await seedPatientRecord(uid);
    await seedHealthRecords(uid);
    await seedHealthMetrics(uid);
    await seedWearableData(uid);
    await seedDigitalTwin(uid);
    await seedHealthGoals(uid);
    await seedHealthTimeline(uid);
    await seedMedicineReminders(uid);
    await seedHealthWallet(uid);
    await seedRewards(uid);
    await seedMedicalID(uid);
    await seedPrescriptions(uid);
    await seedAppointments(uid);
    await seedFamilyMembers(uid);
    await seedPets(uid);
    await seedVoiceReminders(uid);
    await seedInsuranceClaims(uid);
    await seedDataListings(uid);
  }

  await seedQueueEntries();
  await seedMedicineSupply();
  await seedCorporatePrograms();

  console.log('🎉 Feature seed complete.');
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
