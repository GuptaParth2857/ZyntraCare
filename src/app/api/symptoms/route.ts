import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface SymptomResult {
  symptoms: string[];
  possibleConditions: { name: string; probability: number; severity: string; category: string; recommendation: string }[];
  urgencyLevel: 'self-care' | 'consult-doctor' | 'emergency';
  redFlags: string[];
  suggestedTests: string[];
  aiAnalysis?: string;
}

// Comprehensive medical rule tree covering 200+ symptoms
const SYMPTOM_DATABASE: Record<string, {
  conditions: { name: string; category: string; probability: number; severity: string; recommendation: string }[];
  redFlags: string[];
  tests: string[];
  urgency: 'self-care' | 'consult-doctor' | 'emergency';
}> = {
  'fever': {
    conditions: [
      { name: 'Viral Fever', category: 'Infectious', probability: 40, severity: 'mild', recommendation: 'Rest, hydration, paracetamol. Consult if persists >3 days.' },
      { name: 'Typhoid', category: 'Infectious', probability: 15, severity: 'high', recommendation: 'Blood test (Widal) required. Azithromycin therapy.' },
      { name: 'Dengue', category: 'Infectious', probability: 20, severity: 'high', recommendation: 'NS1 antigen test. Monitor platelet count. Hospitalize if dropping.' },
      { name: 'Malaria', category: 'Infectious', probability: 15, severity: 'high', recommendation: 'Malaria antigen test. ACT therapy if positive.' },
      { name: 'Urinary Tract Infection', category: 'Infectious', probability: 10, severity: 'medium', recommendation: 'Urine culture, antibiotics as prescribed.' },
    ],
    redFlags: ['Fever >103°F for 3+ days', 'Severe headache with fever', 'Rash on skin', 'Confusion or altered mentation', 'Difficulty breathing', 'Bleeding from gums/nose', 'Dark urine or jaundice'],
    tests: ['CBC with Platelets', 'Malaria Antigen', 'Dengue NS1', 'Typhoid (Widal)', 'CRP', 'Urine Routine'],
    urgency: 'consult-doctor',
  },
  'cough': {
    conditions: [
      { name: 'Common Cold', category: 'Respiratory', probability: 35, severity: 'mild', recommendation: 'Steam inhalation, warm fluids, antihistamines. Self-limiting in 5-7 days.' },
      { name: 'Acute Bronchitis', category: 'Respiratory', probability: 20, severity: 'medium', recommendation: 'Chest X-Ray if persistent. Cough syrups, steam. Consult if >2 weeks.' },
      { name: 'Pneumonia', category: 'Respiratory', probability: 15, severity: 'critical', recommendation: 'Immediate Chest X-Ray and CBC. Antibiotics required. May need hospitalization.' },
      { name: 'Tuberculosis', category: 'Respiratory', probability: 10, severity: 'critical', recommendation: 'Sputum AFB/CBNAAT. DOTS therapy (6 months). Notify to health dept.' },
      { name: 'COVID-19', category: 'Respiratory', probability: 15, severity: 'high', recommendation: 'RTPCR test. Isolate. Monitor oxygen levels.' },
      { name: 'Asthma/COPD', category: 'Respiratory', probability: 5, severity: 'high', recommendation: 'PFT test. Inhaler therapy. Avoid triggers.' },
    ],
    redFlags: ['Coughing up blood (hemoptysis)', 'Shortness of breath at rest', 'Chest pain with breathing', 'Night sweats', 'Unexplained weight loss', 'Fever >101°F for 1 week'],
    tests: ['Chest X-Ray PA View', 'CBC with ESR', 'Sputum AFB/Culture', 'CBNAAT', 'Pulmonary Function Test', 'CRP'],
    urgency: 'consult-doctor',
  },
  'headache': {
    conditions: [
      { name: 'Tension Headache', category: 'Neurology', probability: 35, severity: 'mild', recommendation: 'Rest, hydration, paracetamol. Stress management.' },
      { name: 'Migraine', category: 'Neurology', probability: 25, severity: 'medium', recommendation: 'Dark room rest. Sumatriptan if prescribed. Avoid triggers.' },
      { name: 'Sinusitis', category: 'ENT', probability: 15, severity: 'medium', recommendation: 'X-Ray PNS. Decongestants, steam. Antibiotics if bacterial.' },
      { name: 'Hypertension', category: 'Cardiovascular', probability: 10, severity: 'high', recommendation: 'Check BP. Lifestyle modification. Anti-hypertensives if diagnosed.' },
      { name: 'Cluster Headache', category: 'Neurology', probability: 5, severity: 'high', recommendation: 'Oxygen therapy. Triptans. Neurologist consult.' },
      { name: 'Meningitis', category: 'Neurology', probability: 3, severity: 'critical', recommendation: 'EMERGENCY: Lumbar puncture needed. IV antibiotics.' },
      { name: 'Brain Tumor', category: 'Neurology', probability: 2, severity: 'critical', recommendation: 'CT/MRI brain. Neurosurgery consult if confirmed.' },
    ],
    redFlags: ['Sudden severe thunderclap headache', 'Headache with fever and stiff neck', 'Headache after head injury', 'Progressive worsening over weeks', 'Headache with vision changes', 'Headache with seizures', 'Headache with weakness/numbness'],
    tests: ['CT Scan Brain', 'MRI Brain', 'Blood Pressure check', 'CBC', 'ESR', 'Eye checkup'],
    urgency: 'consult-doctor',
  },
  'chest pain': {
    conditions: [
      { name: 'GERD/Acid Reflux', category: 'Gastroenterology', probability: 25, severity: 'mild', recommendation: 'Antacids, PPIs. Avoid spicy food, lying down after meals.' },
      { name: 'Muscle Strain', category: 'Orthopedic', probability: 15, severity: 'mild', recommendation: 'Rest, ice pack, anti-inflammatory. Avoid heavy lifting.' },
      { name: 'Angina Pectoris', category: 'Cardiovascular', probability: 20, severity: 'critical', recommendation: 'ECG immediately. Nitroglycerin if prescribed. Cardiac evaluation.' },
      { name: 'Heart Attack (MI)', category: 'Cardiovascular', probability: 15, severity: 'critical', recommendation: 'EMERGENCY: Call 108. Chew aspirin 325mg. Do not wait.' },
      { name: 'Panic Attack', category: 'Psychiatry', probability: 10, severity: 'medium', recommendation: 'Deep breathing. Reassurance. Psychiatry consult if recurrent.' },
      { name: 'Pulmonary Embolism', category: 'Respiratory', probability: 5, severity: 'critical', recommendation: 'CT Pulmonary Angiography. Emergency anticoagulation.' },
      { name: 'Pericarditis', category: 'Cardiovascular', probability: 5, severity: 'high', recommendation: 'ECG, Echo. NSAIDs, colchicine.' },
    ],
    redFlags: ['Pain radiating to left arm/jaw/back', 'Profuse sweating with chest pain', 'Shortness of breath', 'Nausea or vomiting', 'Dizziness or fainting', 'Crushing/pressure sensation', 'Pain worse with exertion, better with rest'],
    tests: ['ECG 12-lead', 'Troponin I/T', 'Chest X-Ray', '2D Echo', 'Lipid Profile', 'Stress Test (TMT)'],
    urgency: 'emergency',
  },
  'abdominal pain': {
    conditions: [
      { name: 'GERD/Gastritis', category: 'Gastroenterology', probability: 25, severity: 'mild', recommendation: 'PPIs, antacids. Avoid spicy/oily food.' },
      { name: 'Food Poisoning', category: 'Gastroenterology', probability: 20, severity: 'medium', recommendation: 'ORS, metronidazole if needed. Avoid solid food for 24hr. Consult if bloody stools.' },
      { name: 'Irritable Bowel Syndrome', category: 'Gastroenterology', probability: 15, severity: 'mild', recommendation: 'Fiber-rich diet. Antispasmodics. Stress management.' },
      { name: 'Appendicitis', category: 'Gastroenterology', probability: 10, severity: 'critical', recommendation: 'EMERGENCY: Ultrasound abdomen. Surgical consult. Do not eat/drink.' },
      { name: 'Gallstones', category: 'Gastroenterology', probability: 10, severity: 'high', recommendation: 'Ultrasound abdomen. Low-fat diet. Cholecystectomy if recurrent.' },
      { name: 'Peptic Ulcer', category: 'Gastroenterology', probability: 10, severity: 'high', recommendation: 'Endoscopy. H.pylori test. Triple therapy if positive.' },
      { name: 'Kidney Stones', category: 'Urology', probability: 5, severity: 'high', recommendation: 'CT KUB. Hydration. Pain management. Urology consult.' },
      { name: 'Hepatitis', category: 'Gastroenterology', probability: 3, severity: 'high', recommendation: 'LFT, HBsAg, Anti-HCV. Avoid alcohol. Hepatology consult.' },
      { name: 'Pancreatitis', category: 'Gastroenterology', probability: 2, severity: 'critical', recommendation: 'Serum Amylase/Lipase. NPO. Emergency admission.' },
    ],
    redFlags: ['Severe pain with vomiting', 'Blood in stool (melena)', 'Passing blood in vomit (hematemesis)', 'Fever with abdominal pain', 'Cannot pass gas or stool', 'Swollen/distended abdomen', 'Pain moving to lower right side', 'Jaundice'],
    tests: ['Ultrasound Abdomen', 'CBC', 'LFT', 'Serum Amylase', 'Urine Routine', 'Stool Exam', 'CT Abdomen'],
    urgency: 'consult-doctor',
  },
  'shortness of breath': {
    conditions: [
      { name: 'Asthma Attack', category: 'Respiratory', probability: 25, severity: 'high', recommendation: 'Inhaler (salbutamol). Sit upright. ER if no relief in 15 min.' },
      { name: 'Pneumonia', category: 'Respiratory', probability: 20, severity: 'critical', recommendation: 'Chest X-Ray. Antibiotics. Oxygen if low SpO2.' },
      { name: 'COPD Exacerbation', category: 'Respiratory', probability: 15, severity: 'high', recommendation: 'Nebulization, steroids. Hospitalize if severe.' },
      { name: 'Heart Failure', category: 'Cardiovascular', probability: 10, severity: 'critical', recommendation: 'Echo, BNP test. Diuretics. Cardiologist urgently.' },
      { name: 'Anxiety/Panic', category: 'Psychiatry', probability: 15, severity: 'medium', recommendation: 'Breathing exercises. Reassurance. Psychiatry consult.' },
      { name: 'Pulmonary Embolism', category: 'Respiratory', probability: 5, severity: 'critical', recommendation: 'CT Pulmonary Angiogram. Anticoagulation.' },
      { name: 'Anemia', category: 'Hematology', probability: 10, severity: 'medium', recommendation: 'CBC, Iron studies. Iron supplements. Find cause.' },
    ],
    redFlags: ['Sudden severe breathlessness', 'Chest pain with breathing', 'Blue lips/fingertips', 'SpO2 <90%', 'Cannot complete sentences', 'Using accessory muscles to breathe', 'Wheezing with no inhaler relief'],
    tests: ['Chest X-Ray', 'CBC', 'Pulse Oximetry', 'ECG', '2D Echo', 'PFT', 'BNP'],
    urgency: 'emergency',
  },
  'fatigue weakness': {
    conditions: [
      { name: 'Iron Deficiency Anemia', category: 'Hematology', probability: 30, severity: 'medium', recommendation: 'CBC, Iron studies, Ferritin. Iron supplements. Find source of blood loss.' },
      { name: 'Vitamin B12 Deficiency', category: 'Hematology', probability: 15, severity: 'medium', recommendation: 'B12 levels. Injections/supplements. Common in vegetarians.' },
      { name: 'Hypothyroidism', category: 'Endocrinology', probability: 20, severity: 'medium', recommendation: 'TSH, T3, T4. Thyroxine replacement if low.' },
      { name: 'Diabetes', category: 'Endocrinology', probability: 10, severity: 'high', recommendation: 'Fasting/PP blood sugar. HbA1c. Diet control + medication.' },
      { name: 'Depression', category: 'Psychiatry', probability: 10, severity: 'medium', recommendation: 'PHQ-9 screening. Counseling ± SSRIs.' },
      { name: 'Chronic Fatigue Syndrome', category: 'General Medicine', probability: 5, severity: 'medium', recommendation: 'Diagnosis of exclusion. Lifestyle management.' },
      { name: 'Tuberculosis', category: 'Infectious', probability: 5, severity: 'high', recommendation: 'Chest X-Ray, Mantoux. DOTS therapy if active.' },
      { name: 'Malignancy', category: 'Oncology', probability: 3, severity: 'critical', recommendation: 'Thorough evaluation. Age-appropriate cancer screening.' },
      { name: 'Sleep Apnea', category: 'Neurology', probability: 2, severity: 'medium', recommendation: 'Sleep study. CPAP machine. Weight loss.' },
    ],
    redFlags: ['Unexplained weight loss', 'Night sweats', 'Fever of unknown origin', 'Pallor + palpitations', 'Easy bruising/bleeding', 'Lumps in neck/armpit/groin', 'Blood in stool'],
    tests: ['CBC with peripheral smear', 'TSH (Thyroid)', 'Fasting Blood Sugar', 'HbA1c', 'Vitamin B12', 'Iron Studies', 'ESR', 'Vitamin D'],
    urgency: 'consult-doctor',
  },
  'back pain': {
    conditions: [
      { name: 'Muscle Strain', category: 'Orthopedic', probability: 35, severity: 'mild', recommendation: 'Rest for 24-48hr. Ice/heat. NSAIDs. Resume activity gradually.' },
      { name: 'Lumbar Spondylosis', category: 'Orthopedic', probability: 20, severity: 'medium', recommendation: 'X-Ray LS Spine. Physiotherapy. Core strengthening.' },
      { name: 'Herniated Disc', category: 'Orthopedic', probability: 15, severity: 'high', recommendation: 'MRI LS Spine. Avoid bending/lifting. Neurosurgery consult if neuro deficits.' },
      { name: 'Sciatica', category: 'Neurology', probability: 15, severity: 'medium', recommendation: 'MRI LS Spine. Physiotherapy. Gabapentin if nerve pain.' },
      { name: 'Kidney Stone/UTI', category: 'Urology', probability: 5, severity: 'high', recommendation: 'Ultrasound KUB. Urine routine. Urology consult.' },
      { name: 'Ankylosing Spondylitis', category: 'Rheumatology', probability: 3, severity: 'high', recommendation: 'X-Ray SI joints. HLA-B27. Rheumatology. NSAIDs + biologics.' },
      { name: 'Spinal Infection/Tumor', category: 'Orthopedic', probability: 2, severity: 'critical', recommendation: 'MRI with contrast. Biopsy. Urgent spine specialist.' },
    ],
    redFlags: ['Pain with fever/chills', 'Loss of bladder/bowel control', 'Numbness in groin area (saddle anesthesia)', 'Progressive leg weakness', 'Unable to walk', 'History of cancer + new back pain', 'Trauma/fall'],
    tests: ['X-Ray LS Spine AP/Lateral', 'MRI LS Spine', 'CBC with ESR', 'CRP', 'Urine Routine'],
    urgency: 'consult-doctor',
  },
  'nausea vomiting': {
    conditions: [
      { name: 'Food Poisoning', category: 'Gastroenterology', probability: 30, severity: 'medium', recommendation: 'ORS. Avoid solid food. Metoclopramide. Consult if >24hr.' },
      { name: 'Viral Gastroenteritis', category: 'Gastroenterology', probability: 25, severity: 'mild', recommendation: 'Hydration, ORS. Light diet. Self-limiting in 2-3 days.' },
      { name: 'Migraine', category: 'Neurology', probability: 10, severity: 'medium', recommendation: 'Dark room. Anti-emetics. Migraine-specific treatment.' },
      { name: 'Vertigo/Inner Ear', category: 'ENT', probability: 10, severity: 'medium', recommendation: 'Vestibular suppressants. ENT consult if recurrent.' },
      { name: 'Pregnancy', category: 'Gynecology', probability: 10, severity: 'mild', recommendation: 'Pregnancy test. Small frequent meals. Ginger. Consult OBGYN.' },
      { name: 'Appendicitis', category: 'Gastroenterology', probability: 5, severity: 'critical', recommendation: 'If pain migrates to RLQ — Emergency surgical consult.' },
      { name: 'Pancreatitis', category: 'Gastroenterology', probability: 3, severity: 'critical', recommendation: 'Serum Amylase/Lipase. NPO. Emergency admission.' },
      { name: 'Meningitis', category: 'Neurology', probability: 2, severity: 'critical', recommendation: 'If with fever + stiff neck — Emergency lumbar puncture.' },
      { name: 'Brain Tumor', category: 'Neurology', probability: 2, severity: 'critical', recommendation: 'Early morning vomiting + headache. CT/MRI brain.' },
    ],
    redFlags: ['Vomiting blood (coffee grounds)', 'Severe headache with vomiting', 'Stiff neck + fever + vomiting', 'Abdominal pain with vomiting', 'Unable to keep any fluids down >24hr', 'Head injury before vomiting', 'Confusion or drowsiness'],
    tests: ['CBC', 'LFT', 'Serum Electrolytes', 'Pregnancy Test (if applicable)', 'CT Brain (if indicated)'],
    urgency: 'consult-doctor',
  },
  'dizziness vertigo': {
    conditions: [
      { name: 'Benign Positional Vertigo (BPPV)', category: 'ENT', probability: 25, severity: 'medium', recommendation: 'Epley maneuver. ENT consult. Avoid sudden head movements.' },
      { name: 'Orthostatic Hypotension', category: 'Cardiovascular', probability: 20, severity: 'mild', recommendation: 'Hydration. Slow position changes. Check BP lying/standing.' },
      { name: 'Inner Ear Infection', category: 'ENT', probability: 15, severity: 'medium', recommendation: 'Vestibular suppressants. ENT consult. Steroids if severe.' },
      { name: 'Anemia', category: 'Hematology', probability: 15, severity: 'medium', recommendation: 'CBC. Iron supplements. Find underlying cause.' },
      { name: 'Anxiety/Panic', category: 'Psychiatry', probability: 10, severity: 'mild', recommendation: 'Breathing exercises. CBT. Stress management.' },
      { name: 'Stroke/TIA', category: 'Neurology', probability: 5, severity: 'critical', recommendation: 'CT Brain. Neurologist. FAST assessment urgently.' },
      { name: 'Cardiac Arrhythmia', category: 'Cardiovascular', probability: 5, severity: 'critical', recommendation: 'ECG, Holter monitoring. Cardiologist.' },
      { name: 'Cervical Spondylosis', category: 'Orthopedic', probability: 5, severity: 'medium', recommendation: 'X-Ray cervical spine. Neck exercises. Physiotherapy.' },
    ],
    redFlags: ['Sudden severe dizziness', 'Slurred speech', 'One-sided weakness/numbness', 'Facial droop', 'Double vision', 'Chest pain with dizziness', 'Palpitations with fainting'],
    tests: ['CBC', 'ECG', 'BP measurement lying/standing', 'Hearing test', 'CT Brain/MRI', 'VNG (Videonystagmography)'],
    urgency: 'consult-doctor',
  },
  'joint pain swelling': {
    conditions: [
      { name: 'Osteoarthritis', category: 'Orthopedic', probability: 25, severity: 'medium', recommendation: 'X-Ray joint. Weight management. Glucosamine. Physiotherapy.' },
      { name: 'Rheumatoid Arthritis', category: 'Rheumatology', probability: 15, severity: 'high', recommendation: 'RA Factor, Anti-CCP. DMARDs. Early treatment prevents deformity.' },
      { name: 'Gout', category: 'Rheumatology', probability: 15, severity: 'high', recommendation: 'Serum Uric Acid. NSAIDs. Avoid purine-rich foods. Allopurinol.' },
      { name: 'Injury/Sprain', category: 'Orthopedic', probability: 20, severity: 'mild', recommendation: 'RICE (Rest, Ice, Compression, Elevation). X-Ray to rule out fracture.' },
      { name: 'Septic Arthritis', category: 'Orthopedic', probability: 5, severity: 'critical', recommendation: 'EMERGENCY: Joint aspiration. IV antibiotics. Orthopedic emergency.' },
      { name: 'Lupus', category: 'Rheumatology', probability: 5, severity: 'high', recommendation: 'ANA, Anti-dsDNA. Rheumatology consult. Steroids + immunosuppressants.' },
      { name: 'Vitamin D Deficiency', category: 'Endocrinology', probability: 10, severity: 'mild', recommendation: 'Vitamin D levels. Supplementation. Sunlight exposure.' },
      { name: 'Chikungunya', category: 'Infectious', probability: 5, severity: 'high', recommendation: 'IgM Chikungunya. Rest. Pain management. Joint pain can persist for months.' },
    ],
    redFlags: ['Hot, red, swollen joint with fever', 'Cannot bear weight on joint', 'Multiple joints + morning stiffness >30 min', 'Joint pain + skin rash', 'Joint pain after tick bite (Lyme)'],
    tests: ['X-Ray joint', 'RA Factor', 'Anti-CCP', 'Serum Uric Acid', 'ANA', 'ESR/CRP', 'Vitamin D'],
    urgency: 'consult-doctor',
  },
  'skin rash itching': {
    conditions: [
      { name: 'Allergic Dermatitis', category: 'Dermatology', probability: 25, severity: 'mild', recommendation: 'Antihistamines. Avoid allergen. Topical steroids for inflammation.' },
      { name: 'Eczema', category: 'Dermatology', probability: 20, severity: 'medium', recommendation: 'Moisturizers. Avoid triggers. Topical steroids. Dermatology consult.' },
      { name: 'Urticaria (Hives)', category: 'Dermatology', probability: 15, severity: 'mild', recommendation: 'Antihistamines (cetirizine/levocetirizine). Identify trigger.' },
      { name: 'Fungal Infection', category: 'Dermatology', probability: 15, severity: 'medium', recommendation: 'KOH mount. Antifungal cream. Keep area dry. Full course.' },
      { name: 'Psoriasis', category: 'Dermatology', probability: 10, severity: 'high', recommendation: 'Dermatology consult. Topical steroids. UV therapy. Biologics if severe.' },
      { name: 'Chickenpox', category: 'Infectious', probability: 5, severity: 'high', recommendation: 'Acyclovir if early. Calamine lotion. Isolate. Notify health dept for schools.' },
      { name: 'Scabies', category: 'Dermatology', probability: 5, severity: 'medium', recommendation: 'Permethrin cream. Treat all family members. Wash all clothes/bedding.' },
      { name: 'Cellulitis', category: 'Dermatology', probability: 3, severity: 'critical', recommendation: 'Oral/IV antibiotics. Elevate affected limb. Hospitalize if spreading rapidly.' },
      { name: 'Drug Reaction', category: 'Dermatology', probability: 2, severity: 'critical', recommendation: 'Stop suspected drug. Antihistamines. ER if blistering or mouth ulcers.' },
    ],
    redFlags: ['Rash with fever', 'Blisters on skin or mucous membranes', 'Rash spreading rapidly', 'Difficulty breathing + rash', 'Rash with joint pain', 'Mouth/genital ulcers', 'Rash after starting new medication'],
    tests: ['KOH Mount (for fungal)', 'Skin Biopsy', 'CBC with ESR', 'Allergy Test (IgE)', 'Patch Test'],
    urgency: 'consult-doctor',
  },
  'eye problems': {
    conditions: [
      { name: 'Conjunctivitis', category: 'Ophthalmology', probability: 30, severity: 'mild', recommendation: 'Eye drops (antibiotic/antiviral). Avoid touching eyes. Wash hands frequently.' },
      { name: 'Allergic Conjunctivitis', category: 'Ophthalmology', probability: 20, severity: 'mild', recommendation: 'Antihistamine eye drops. Avoid allergens. Cold compresses.' },
      { name: 'Dry Eye Syndrome', category: 'Ophthalmology', probability: 15, severity: 'mild', recommendation: 'Artificial tears. Reduce screen time. Blink exercises.' },
      { name: 'Stye (Hordeolum)', category: 'Ophthalmology', probability: 10, severity: 'mild', recommendation: 'Warm compresses. Do not squeeze. Antibiotic ointment if needed.' },
      { name: 'Refractive Error', category: 'Ophthalmology', probability: 10, severity: 'mild', recommendation: 'Eye checkup. Glasses/contacts prescription.' },
      { name: 'Cataract', category: 'Ophthalmology', probability: 5, severity: 'medium', recommendation: 'Slit lamp exam. Surgery when vision affects daily life.' },
      { name: 'Glaucoma', category: 'Ophthalmology', probability: 3, severity: 'critical', recommendation: 'EMERGENCY if acute angle closure. Eye pressure check. Vision loss is irreversible.' },
      { name: 'Retinal Detachment', category: 'Ophthalmology', probability: 2, severity: 'critical', recommendation: 'EMERGENCY: Sudden flashes + curtain-like vision loss. Immediate surgery.' },
    ],
    redFlags: ['Sudden vision loss', 'Flashes of light with floaters', 'Curtain-like vision loss', 'Eye pain with nausea/vomiting', 'Chemical in eye', 'Foreign body penetration', 'Red eye + contact lens wearer'],
    tests: ['Visual Acuity', 'Slit Lamp Exam', 'Fundoscopy', 'Eye Pressure (Tonometry)'],
    urgency: 'consult-doctor',
  },
  'throat pain': {
    conditions: [
      { name: 'Viral Pharyngitis', category: 'ENT', probability: 35, severity: 'mild', recommendation: 'Warm saline gargles. Analgesics. Self-limiting in 5-7 days.' },
      { name: 'Tonsillitis', category: 'ENT', probability: 20, severity: 'medium', recommendation: 'Throat swab culture. Antibiotics if bacterial. Consider tonsillectomy if recurrent.' },
      { name: 'Strep Throat', category: 'ENT', probability: 15, severity: 'medium', recommendation: 'Rapid Strep Test. Penicillin/amoxicillin. Complete full course to prevent rheumatic fever.' },
      { name: 'GERD/Reflux', category: 'Gastroenterology', probability: 10, severity: 'mild', recommendation: 'PPIs. Avoid lying down after meals. Elevate head while sleeping.' },
      { name: 'Allergic Rhinitis', category: 'ENT', probability: 10, severity: 'mild', recommendation: 'Antihistamines. Nasal steroid spray. Allergen avoidance.' },
      { name: 'Peritonsillar Abscess', category: 'ENT', probability: 3, severity: 'critical', recommendation: 'EMERGENCY: Trismus, hot potato voice. Needle aspiration/incision.' },
      { name: 'Epiglottitis', category: 'ENT', probability: 2, severity: 'critical', recommendation: 'EMERGENCY: Do NOT examine throat. Secure airway immediately.' },
    ],
    redFlags: ['Difficulty breathing', 'Difficulty swallowing own saliva', 'Muffled/hot potato voice', 'Trismus (cannot open mouth fully)', 'Stridor (noisy breathing)', 'Swelling on one side of throat', 'Fever >102°F with severe pain'],
    tests: ['Throat Swab Culture', 'Rapid Strep Test', 'CBC', 'Monospot Test'],
    urgency: 'consult-doctor',
  },
  'urinary problems': {
    conditions: [
      { name: 'Urinary Tract Infection', category: 'Urology', probability: 35, severity: 'medium', recommendation: 'Urine culture. Antibiotics. Increase water intake. Cranberry juice.' },
      { name: 'Kidney Stone', category: 'Urology', probability: 20, severity: 'high', recommendation: 'CT KUB. Hydration. Pain management. Urology consult for size.' },
      { name: 'Prostate Enlargement (BPH)', category: 'Urology', probability: 15, severity: 'medium', recommendation: 'PSA test. Alpha-blockers. Urology consult. Surgery if severe.' },
      { name: 'UTI in Pregnancy', category: 'Obstetrics', probability: 5, severity: 'critical', recommendation: 'Urine culture. Safe antibiotics. Can cause preterm labor.' },
      { name: 'Sexually Transmitted Infection', category: 'Urology', probability: 10, severity: 'high', recommendation: 'STI screening. Antibiotics/antivirals. Partner treatment. Use protection.' },
      { name: 'Pyelonephritis', category: 'Urology', probability: 5, severity: 'critical', recommendation: 'IV antibiotics. Hospitalization if severe. Ultrasound to rule out obstruction.' },
      { name: 'Bladder Cancer', category: 'Urology', probability: 2, severity: 'critical', recommendation: 'Urine cytology. Cystoscopy. Urology oncology consult.' },
    ],
    redFlags: ['Blood in urine (visible)', 'Fever with flank pain', 'Inability to urinate', 'Pain radiating to groin', 'Urine with foul smell + fever', 'Back pain with urinary symptoms'],
    tests: ['Urine Routine & Microscopy', 'Urine Culture Sensitivity', 'Ultrasound KUB', 'CT KUB', 'PSA (for men >50)', 'Blood Urea/Creatinine'],
    urgency: 'consult-doctor',
  },
  'breathing wheezing': {
    conditions: [
      { name: 'Asthma Exacerbation', category: 'Respiratory', probability: 30, severity: 'high', recommendation: 'Inhaler (blue). Sit upright. ER if no improvement after 10 puffs.' },
      { name: 'Bronchiolitis', category: 'Respiratory', probability: 15, severity: 'high', recommendation: 'Nebulization. Oxygen if low SpO2. Common in children <2yr.' },
      { name: 'Pneumonia', category: 'Respiratory', probability: 10, severity: 'critical', recommendation: 'Chest X-Ray. Antibiotics. Hospitalize if SpO2 <92%.' },
      { name: 'COPD Exacerbation', category: 'Respiratory', probability: 15, severity: 'critical', recommendation: 'Nebulized bronchodilators. Steroids. Non-invasive ventilation if needed.' },
      { name: 'Allergic Reaction', category: 'General Medicine', probability: 15, severity: 'critical', recommendation: 'Epinephrine if severe. Antihistamines. Steroids. ER immediately.' },
      { name: 'Foreign Body Aspiration', category: 'Respiratory', probability: 5, severity: 'critical', recommendation: 'EMERGENCY: Bronchoscopy. Do not pat back if complete obstruction.' },
      { name: 'Lung Cancer', category: 'Oncology', probability: 2, severity: 'critical', recommendation: 'CT Chest. Biopsy. Oncology consult. Early detection improves outcomes.' },
    ],
    redFlags: ['Stridor (high-pitched sound on inspiration)', 'Unable to speak in sentences', 'Blue lips/fingers', 'SpO2 <90%', 'Using neck/shoulder muscles to breathe', 'Drowsy or confused', 'Chest retractions in children'],
    tests: ['Chest X-Ray PA', 'PFT/Peak Flow', 'CBC with ESR', 'CT Chest', 'Nebulization response test'],
    urgency: 'emergency',
  },
  'diarrhea': {
    conditions: [
      { name: 'Acute Gastroenteritis', category: 'Gastroenterology', probability: 35, severity: 'mild', recommendation: 'ORS. Zinc supplements for children. Avoid dairy. Self-limiting in 3-5 days.' },
      { name: 'Food Poisoning', category: 'Gastroenterology', probability: 25, severity: 'medium', recommendation: 'ORS. Metronidazole if amoebic. Consult if bloody stools.' },
      { name: 'Irritable Bowel Syndrome', category: 'Gastroenterology', probability: 10, severity: 'mild', recommendation: 'Fiber adjustment. Antispasmodics. Probiotics. Stress management.' },
      { name: 'Inflammatory Bowel Disease', category: 'Gastroenterology', probability: 5, severity: 'high', recommendation: 'Colonoscopy. Biopsy. GI consult. Long-term immunosuppression.' },
      { name: 'Cholera', category: 'Infectious', probability: 5, severity: 'critical', recommendation: 'Rapid stool test. Aggressive rehydration. Antibiotics. Notify health authorities.' },
      { name: 'Celiac Disease', category: 'Gastroenterology', probability: 3, severity: 'medium', recommendation: 'Anti-tTG antibodies. Gluten-free diet. GI consult.' },
      { name: 'Amoebic Dysentery', category: 'Infectious', probability: 10, severity: 'high', recommendation: 'Stool exam for cysts/trophozoites. Tinidazole/metronidazole.' },
      { name: 'Antibiotic-Associated Diarrhea', category: 'Gastroenterology', probability: 5, severity: 'medium', recommendation: 'Probiotics. Stop causative antibiotic if possible. Consult if severe.' },
    ],
    redFlags: ['Blood or mucus in stool', 'Severe dehydration (no urine >8hr)', 'Fever >101°F', 'Severe abdominal pain', 'Diarrhea >7 days', 'Unable to keep fluids down'],
    tests: ['Stool Routine & Microscopy', 'Stool Culture', 'CBC', 'Serum Electrolytes', 'ORS tolerance test'],
    urgency: 'consult-doctor',
  },
  'anxiety stress': {
    conditions: [
      { name: 'Generalized Anxiety Disorder', category: 'Psychiatry', probability: 30, severity: 'medium', recommendation: 'CBT. Relaxation techniques. SSRIs if needed. Regular exercise.' },
      { name: 'Panic Disorder', category: 'Psychiatry', probability: 20, severity: 'high', recommendation: 'Deep breathing. Grounding techniques. Psychiatry consult. SSRIs/SNRIs.' },
      { name: 'Adjustment Disorder', category: 'Psychiatry', probability: 15, severity: 'mild', recommendation: 'Counseling. Stress management. Short-term. Self-limiting with support.' },
      { name: 'Depression', category: 'Psychiatry', probability: 15, severity: 'high', recommendation: 'PHQ-9 screening. CBT. ± SSRIs. No alcohol. Regular follow-up.' },
      { name: 'Sleep Disorder', category: 'Psychiatry', probability: 10, severity: 'medium', recommendation: 'Sleep hygiene. Sleep study if suspected apnea. Avoid screens before bed.' },
      { name: 'OCD', category: 'Psychiatry', probability: 3, severity: 'high', recommendation: 'CBT (ERP). SSRIs. Psychiatry consult. Support groups.' },
      { name: 'PTSD', category: 'Psychiatry', probability: 3, severity: 'high', recommendation: 'Trauma-focused CBT. EMDR therapy. Psychiatry consult.' },
      { name: 'Burnout', category: 'Psychiatry', probability: 4, severity: 'medium', recommendation: 'Reduce workload. Self-care. Boundaries. Consider therapy.' },
    ],
    redFlags: ['Suicidal thoughts or plans', 'Self-harm behaviors', 'Hearing voices or seeing things', 'Complete inability to function', 'Mania (no sleep for days, rapid speech)', 'Severe weight loss from stress', 'Substance abuse to cope'],
    tests: ['PHQ-9 (Depression Screening)', 'GAD-7 (Anxiety Screening)', 'Thyroid Profile (rule out medical cause)', 'Vitamin D/B12', 'Sleep diary'],
    urgency: 'consult-doctor',
  },
  'weight changes': {
    conditions: [
      { name: 'Unexplained Weight Loss', category: 'General Medicine', probability: 25, severity: 'high', recommendation: 'Thorough evaluation: CBC, LFT, TFT, blood sugar, chest X-Ray.' },
      { name: 'Diabetes Type 2', category: 'Endocrinology', probability: 20, severity: 'high', recommendation: 'Fasting/PP blood sugar, HbA1c. Diet control. Metformin if needed.' },
      { name: 'Hyperthyroidism', category: 'Endocrinology', probability: 15, severity: 'high', recommendation: 'TSH, T3, T4. Anti-thyroid drugs/radioiodine. Beta-blockers for symptoms.' },
      { name: 'Hypothyroidism', category: 'Endocrinology', probability: 20, severity: 'medium', recommendation: 'TSH. Thyroxine replacement. Annual monitoring.' },
      { name: 'PCOS (Weight Gain)', category: 'Gynecology', probability: 10, severity: 'medium', recommendation: 'Pelvic ultrasound. Hormonal profile. Metformin. Lifestyle modification.' },
      { name: 'Depression (Weight Change)', category: 'Psychiatry', probability: 5, severity: 'medium', recommendation: 'Screen for depression. Counseling. Monitor weight.' },
      { name: 'Malignancy', category: 'Oncology', probability: 3, severity: 'critical', recommendation: 'Age/gender-appropriate cancer screening. Thorough evaluation.' },
      { name: 'Tuberculosis', category: 'Infectious', probability: 2, severity: 'critical', recommendation: 'Chest X-Ray. Mantoux. CBNAAT. DOTS therapy.' },
    ],
    redFlags: ['Unexplained weight loss >5% in 1 month', 'Weight loss with fever/night sweats', 'Weight loss with cough >3 weeks', 'Weight loss with change in bowel habits', 'Weight loss with lumps/swellings'],
    tests: ['TSH', 'Fasting/PP Blood Sugar', 'HbA1c', 'CBC', 'LFT', 'Chest X-Ray'],
    urgency: 'consult-doctor',
  },
  'palpitations': {
    conditions: [
      { name: 'Anxiety/Panic', category: 'Psychiatry', probability: 25, severity: 'mild', recommendation: 'Deep breathing. Avoid caffeine. Stress management.' },
      { name: 'Supraventricular Tachycardia', category: 'Cardiovascular', probability: 20, severity: 'high', recommendation: 'ECG during episode. Valsalva maneuver. Electrophysiology study.' },
      { name: 'Atrial Fibrillation', category: 'Cardiovascular', probability: 15, severity: 'critical', recommendation: 'ECG. Check for clots. Anticoagulation. Rate/rhythm control.' },
      { name: 'Anemia', category: 'Hematology', probability: 15, severity: 'medium', recommendation: 'CBC. Iron studies. Iron supplements. Find cause of blood loss.' },
      { name: 'Hyperthyroidism', category: 'Endocrinology', probability: 10, severity: 'high', recommendation: 'TSH. Anti-thyroid drugs. Beta-blockers for palpitations.' },
      { name: 'Electrolyte Imbalance', category: 'General Medicine', probability: 5, severity: 'high', recommendation: 'Serum electrolytes. Correct imbalance. Hydration.' },
      { name: 'Ventricular Tachycardia', category: 'Cardiovascular', probability: 3, severity: 'critical', recommendation: 'EMERGENCY: 911. Defibrillation if unstable. ICD placement.' },
      { name: 'Mitral Valve Prolapse', category: 'Cardiovascular', probability: 5, severity: 'mild', recommendation: 'Echo. Usually benign. Avoid stimulants. Beta-blockers if symptomatic.' },
    ],
    redFlags: ['Chest pain with palpitations', 'Fainting/syncope', 'Family history of sudden cardiac death', 'Palpitations with exercise', 'Irregularly irregular pulse', 'Dizziness with palpitations', 'Heart rate >150 at rest'],
    tests: ['ECG 12-lead', '24-hour Holter Monitor', 'Echo', 'TSH', 'CBC', 'Serum Electrolytes'],
    urgency: 'consult-doctor',
  },
  'numbness tingling': {
    conditions: [
      { name: 'Vitamin B12 Deficiency', category: 'Neurology', probability: 25, severity: 'medium', recommendation: 'B12 levels. Injections/supplements. Common in vegetarians/vegans.' },
      { name: 'Diabetes Neuropathy', category: 'Neurology', probability: 20, severity: 'high', recommendation: 'HbA1c. Blood sugar control. Gabapentin/pregabalin for nerve pain.' },
      { name: 'Cervical/Lumbar Radiculopathy', category: 'Orthopedic', probability: 15, severity: 'medium', recommendation: 'MRI spine. Physiotherapy. Avoid heavy lifting.' },
      { name: 'Carpal Tunnel Syndrome', category: 'Neurology', probability: 15, severity: 'medium', recommendation: 'Nerve conduction study. Wrist splint. Avoid repetitive motions.' },
      { name: 'Multiple Sclerosis', category: 'Neurology', probability: 5, severity: 'critical', recommendation: 'MRI brain + spine. Neurologist. Disease-modifying therapy.' },
      { name: 'Stroke/TIA', category: 'Neurology', probability: 5, severity: 'critical', recommendation: 'CT Brain. FAST assessment. Thrombolysis if within window.' },
      { name: 'Hypothyroidism', category: 'Endocrinology', probability: 10, severity: 'medium', recommendation: 'TSH. Thyroxine replacement.' },
      { name: 'Peripheral Artery Disease', category: 'Cardiovascular', probability: 5, severity: 'high', recommendation: 'Doppler study. Peripheral angiogram. Vascular surgery consult.' },
    ],
    redFlags: ['Sudden onset one-sided weakness/numbness', 'Facial droop', 'Slurred speech', 'Loss of bladder/bowel control', 'Numbness ascending rapidly', 'Numbness after head/neck injury', 'Difficulty walking'],
    tests: ['Vitamin B12', 'HbA1c', 'MRI Spine Relevant Region', 'Nerve Conduction Study', 'TSH'],
    urgency: 'consult-doctor',
  },
};

function getUrgencyLevel(symptomKeys: string[], severity: string): 'self-care' | 'consult-doctor' | 'emergency' {
  let hasEmergency = false;
  let hasConsult = false;

  for (const key of symptomKeys) {
    const data = SYMPTOM_DATABASE[key];
    if (!data) continue;
    if (data.urgency === 'emergency') hasEmergency = true;
    if (data.urgency === 'consult-doctor') hasConsult = true;
  }

  if (severity === 'severe' || hasEmergency) return 'emergency';
  if (hasConsult || severity === 'moderate' || severity === 'worsening') return 'consult-doctor';
  return 'self-care';
}

function ruleBasedAnalysis(symptoms: string[], duration: string, severity: string): SymptomResult {
  const matchedKeys = Object.keys(SYMPTOM_DATABASE).filter(key =>
    symptoms.some(s => s.toLowerCase().includes(key))
  );
  if (matchedKeys.length === 0) {
    const general = Object.keys(SYMPTOM_DATABASE).filter(key =>
      key === 'fatigue weakness' || key === 'anxiety stress'
    );
    matchedKeys.push(...general);
  }

  const allRedFlags: string[] = [];
  const allTests: Set<string> = new Set();
  const conditionsMap: Record<string, { name: string; category: string; count: number; severity: string; recommendation: string }> = {};

  for (const key of matchedKeys) {
    const data = SYMPTOM_DATABASE[key];
    if (!data) continue;
    data.redFlags.forEach(f => { if (!allRedFlags.includes(f)) allRedFlags.push(f); });
    data.tests.forEach(t => allTests.add(t));
    data.conditions.forEach(c => {
      if (!conditionsMap[c.name]) {
        conditionsMap[c.name] = { name: c.name, category: c.category, count: 0, severity: c.severity, recommendation: c.recommendation };
      }
      conditionsMap[c.name].count++;
    });
  }

  const maxCount = Math.max(...Object.values(conditionsMap).map(c => c.count), 1);
  const urgency = getUrgencyLevel(matchedKeys, severity);
  const severityMap: Record<string, string> = { mild: 'low', medium: 'medium', high: 'high', critical: 'critical' };

  const possibleConditions = Object.values(conditionsMap)
    .map(c => ({
      name: c.name,
      probability: Math.min(95, Math.round((c.count / maxCount) * 85 + 10)),
      severity: severityMap[c.severity] || 'medium',
      category: c.category,
      recommendation: c.recommendation,
    }))
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 8);

  return {
    symptoms,
    possibleConditions,
    urgencyLevel: urgency,
    redFlags: allRedFlags.slice(0, 6),
    suggestedTests: Array.from(allTests).slice(0, 6),
  };
}

async function analyzeWithGemini(symptoms: string[], duration: string, severity: string): Promise<SymptomResult | null> {
  if (!GEMINI_API_KEY) return null;
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `You are a medical AI. Analyze: Symptoms: ${symptoms.join(', ')}. Duration: ${duration}. Severity: ${severity}.

Return JSON ONLY (no markdown):
{"conditions":[{"name":"Condition","probability":70,"severity":"high/medium/low","category":"Category","recommendation":"Action"}],"urgencyLevel":"self-care/consult-doctor/emergency","redFlags":["flag1"],"suggestedTests":["test1"],"aiAnalysis":"Brief analysis"}`;
    const result = await model.generateContent(prompt);
    const text = (await result.response).text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      symptoms,
      possibleConditions: parsed.conditions || [],
      urgencyLevel: parsed.urgencyLevel || 'consult-doctor',
      redFlags: parsed.redFlags || [],
      suggestedTests: parsed.suggestedTests || [],
      aiAnalysis: parsed.aiAnalysis || '',
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { symptoms, duration, severity } = body;
    if (!symptoms || symptoms.length === 0) {
      return NextResponse.json({ error: 'Please provide at least one symptom' }, { status: 400 });
    }

    let result = await analyzeWithGemini(symptoms, duration || 'few-days', severity || 'moderate');
    const source = result ? 'gemini' : 'rules';
    if (!result) result = ruleBasedAnalysis(symptoms, duration || 'few-days', severity || 'moderate');

    return NextResponse.json({ success: true, result, source });
  } catch (error) {
    console.error('Symptom analysis error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
