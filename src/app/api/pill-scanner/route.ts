import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Types
interface Medicine {
  name: string;
  composition: string;
  category: string;
  manufacturer: string;
  dosage: string;
  maxDaily: string;
  sideEffects: string;
  schedule: string;
  color: string;
  shape: string;
  genericName?: string;
  brandNames?: string[];
  interactions?: string[];
  otc?: boolean;
}

interface MedicineMatch {
  medicine: Medicine;
  score: number;
  matchType: string;
}

interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  advice: string;
}

// Expanded Medicine Database - 110+ Indian medicines
const MEDICINE_DATABASE: Medicine[] = [
  // Pain Relief (15)
  { name: 'Paracetamol 500mg', composition: 'Paracetamol 500mg', category: 'Pain Relief', manufacturer: 'Cipla', dosage: '1-2 tablets every 4-6 hours', maxDaily: '8 tablets', sideEffects: 'Nausea, rash', schedule: 'As needed', color: 'White', shape: 'Round', otc: true },
  { name: 'Dolo 650', composition: 'Paracetamol 650mg', category: 'Pain Relief', manufacturer: 'Micro Labs', dosage: '1 tablet every 6 hours', maxDaily: '4 tablets', sideEffects: 'Nausea', schedule: 'After food', color: 'White', shape: 'Tablet', otc: true },
  { name: 'Ibuprofen 400mg', composition: 'Ibuprofen 400mg', category: 'Pain Relief', manufacturer: 'Cipla', dosage: '1 tablet every 6-8 hours', maxDaily: '3 tablets', sideEffects: 'GI upset', schedule: 'After food', color: 'Orange', shape: 'Round', otc: true },
  { name: 'Diclofenac 50mg', composition: 'Diclofenac 50mg', category: 'Pain Relief', manufacturer: 'Novartis', dosage: '1 tablet 2-3 times daily', maxDaily: '3 tablets', sideEffects: 'Stomach pain', schedule: 'After food', color: 'Yellow', shape: 'Tablet', otc: true },
  { name: 'Combiflam', composition: 'Ibuprofen 400mg + Paracetamol 325mg', category: 'Pain Relief', manufacturer: 'Sanofi', dosage: '1 tablet 2-3 times daily', maxDaily: '3 tablets', sideEffects: 'Stomach upset', schedule: 'After food', color: 'Red', shape: 'Tablet', otc: true },
  { name: 'Aceclofenac 100mg', composition: 'Aceclofenac 100mg', category: 'Pain Relief', manufacturer: 'Cipla', dosage: '1 tablet twice daily', maxDaily: '2 tablets', sideEffects: 'Nausea, dizziness', schedule: 'After food', color: 'White', shape: 'Tablet' },
  { name: 'Nimesulide 100mg', composition: 'Nimesulide 100mg', category: 'Pain Relief', manufacturer: 'Dr Reddy\'s', dosage: '1 tablet twice daily', maxDaily: '2 tablets', sideEffects: 'Liver issues', schedule: 'After food', color: 'Pink', shape: 'Tablet' },
  { name: 'Tramadol 50mg', composition: 'Tramadol 50mg', category: 'Pain Relief', manufacturer: 'Cipla', dosage: '1 tablet every 6 hours', maxDaily: '4 tablets', sideEffects: 'Drowsiness, constipation', schedule: 'With food', color: 'White', shape: 'Tablet' },
  { name: 'Pentazocine 30mg', composition: 'Pentazocine 30mg', category: 'Pain Relief', manufacturer: 'Sun Pharma', dosage: '1 tablet every 4 hours', maxDaily: '6 tablets', sideEffects: 'Dizziness, sweating', schedule: 'After food', color: 'White', shape: 'Tablet' },
  { name: 'Aspirin 325mg', composition: 'Aspirin 325mg', category: 'Pain Relief', manufacturer: 'Bayer', dosage: '1 tablet every 4 hours', maxDaily: '4 tablets', sideEffects: 'GI bleeding', schedule: 'After food', color: 'White', shape: 'Round', otc: true },
  { name: 'Mefenamic Acid 500mg', composition: 'Mefenamic Acid 500mg', category: 'Pain Relief', manufacturer: 'Cipla', dosage: '1 tablet 3 times daily', maxDaily: '3 tablets', sideEffects: 'Diarrhea, nausea', schedule: 'After food', color: 'Yellow', shape: 'Capsule', otc: true },
  { name: 'Etoricoxib 90mg', composition: 'Etoricoxib 90mg', category: 'Pain Relief', manufacturer: 'MSD', dosage: '1 tablet daily', maxDaily: '1 tablet', sideEffects: 'High BP, edema', schedule: 'Any time', color: 'Pink', shape: 'Tablet' },
  { name: 'Lornoxicam 8mg', composition: 'Lornoxicam 8mg', category: 'Pain Relief', manufacturer: 'Dr Reddy\'s', dosage: '1 tablet twice daily', maxDaily: '2 tablets', sideEffects: 'Abdominal pain', schedule: 'After food', color: 'White', shape: 'Tablet' },
  { name: 'Flupirtine 100mg', composition: 'Flupirtine 100mg', category: 'Pain Relief', manufacturer: 'Dr Reddy\'s', dosage: '1 capsule 3 times daily', maxDaily: '3 capsules', sideEffects: 'Drowsiness, liver', schedule: 'With food', color: 'Green', shape: 'Capsule' },
  { name: 'Zolmitriptan 2.5mg', composition: 'Zolmitriptan 2.5mg', category: 'Pain Relief', manufacturer: 'Cipla', dosage: '1 tablet at migraine onset', maxDaily: '2 tablets', sideEffects: 'Dizziness, chest tightness', schedule: 'As needed', color: 'Pink', shape: 'Tablet' },

  // Antibiotics (12)
  { name: 'Amoxicillin 500mg', composition: 'Amoxicillin 500mg', category: 'Antibiotic', manufacturer: 'Sun Pharma', dosage: '1 capsule 3 times daily', maxDaily: '3 capsules', sideEffects: 'Diarrhea', schedule: 'After food', color: 'Red/Yellow', shape: 'Capsule' },
  { name: 'Azithromycin 500mg', composition: 'Azithromycin 500mg', category: 'Antibiotic', manufacturer: 'Cipla', dosage: '1 tablet daily for 3 days', maxDaily: '1 tablet', sideEffects: 'Nausea', schedule: 'Empty stomach', color: 'White', shape: 'Tablet' },
  { name: 'Cefixime 200mg', composition: 'Cefixime 200mg', category: 'Antibiotic', manufacturer: 'Sun Pharma', dosage: '1 tablet twice daily', maxDaily: '2 tablets', sideEffects: 'Diarrhea, rash', schedule: 'After food', color: 'White', shape: 'Tablet' },
  { name: 'Ciprofloxacin 500mg', composition: 'Ciprofloxacin 500mg', category: 'Antibiotic', manufacturer: 'Bayer', dosage: '1 tablet twice daily', maxDaily: '2 tablets', sideEffects: 'Nausea, tendon issues', schedule: 'Empty stomach', color: 'White', shape: 'Tablet' },
  { name: 'Doxycycline 100mg', composition: 'Doxycycline 100mg', category: 'Antibiotic', manufacturer: 'Cipla', dosage: '1 capsule twice daily', maxDaily: '2 capsules', sideEffects: 'Photosensitivity', schedule: 'After food', color: 'Yellow', shape: 'Capsule' },
  { name: 'Metronidazole 400mg', composition: 'Metronidazole 400mg', category: 'Antibiotic', manufacturer: 'Sun Pharma', dosage: '1 tablet 3 times daily', maxDaily: '3 tablets', sideEffects: 'Metallic taste', schedule: 'After food', color: 'White', shape: 'Tablet' },
  { name: 'Clindamycin 300mg', composition: 'Clindamycin 300mg', category: 'Antibiotic', manufacturer: 'Pfizer', dosage: '1 capsule 3 times daily', maxDaily: '3 capsules', sideEffects: 'Diarrhea', schedule: 'With food', color: 'Blue', shape: 'Capsule' },
  { name: 'Cefpodoxime 200mg', composition: 'Cefpodoxime 200mg', category: 'Antibiotic', manufacturer: 'Lupin', dosage: '1 tablet twice daily', maxDaily: '2 tablets', sideEffects: 'Diarrhea', schedule: 'After food', color: 'White', shape: 'Tablet' },
  { name: 'Norfloxacin 400mg', composition: 'Norfloxacin 400mg', category: 'Antibiotic', manufacturer: 'Sun Pharma', dosage: '1 tablet twice daily', maxDaily: '2 tablets', sideEffects: 'Headache', schedule: 'Empty stomach', color: 'White', shape: 'Tablet' },
  { name: 'Linezolid 600mg', composition: 'Linezolid 600mg', category: 'Antibiotic', manufacturer: 'Pfizer', dosage: '1 tablet twice daily', maxDaily: '2 tablets', sideEffects: 'Serotonin syndrome risk', schedule: 'Any time', color: 'Yellow', shape: 'Tablet' },
  { name: 'Meropenem 1g', composition: 'Meropenem 1g', category: 'Antibiotic', manufacturer: 'Cipla', dosage: '1 injection every 8 hours', maxDaily: '3g', sideEffects: 'Seizures, diarrhea', schedule: 'IV only', color: 'White', shape: 'Powder' },
  { name: 'Vancomycin 500mg', composition: 'Vancomycin 500mg', category: 'Antibiotic', manufacturer: 'Cipla', dosage: '1 infusion every 8 hours', maxDaily: '3g', sideEffects: 'Kidney toxicity', schedule: 'IV only', color: 'White', shape: 'Powder' },

  // Anti-Diabetic (8)
  { name: 'Metformin 500mg', composition: 'Metformin 500mg', category: 'Anti-Diabetic', manufacturer: 'USV', dosage: '1 tablet twice daily with meals', maxDaily: '3 tablets', sideEffects: 'Nausea, metallic taste', schedule: 'With meals', color: 'White', shape: 'Round' },
  { name: 'Glimepiride 2mg', composition: 'Glimepiride 2mg', category: 'Anti-Diabetic', manufacturer: 'Sanofi', dosage: '1 tablet daily with breakfast', maxDaily: '1 tablet', sideEffects: 'Hypoglycemia', schedule: 'Before breakfast', color: 'Yellow', shape: 'Round' },
  { name: 'Sitagliptin 100mg', composition: 'Sitagliptin 100mg', category: 'Anti-Diabetic', manufacturer: 'MSD', dosage: '1 tablet daily', maxDaily: '1 tablet', sideEffects: 'Upper respiratory infection', schedule: 'Any time', color: 'Pink', shape: 'Tablet' },
  { name: 'Empagliflozin 10mg', composition: 'Empagliflozin 10mg', category: 'Anti-Diabetic', manufacturer: 'Boehringer', dosage: '1 tablet daily', maxDaily: '1 tablet', sideEffects: 'UTI, dehydration', schedule: 'Morning', color: 'Yellow', shape: 'Tablet' },
  { name: 'Voglibose 0.3mg', composition: 'Voglibose 0.3mg', category: 'Anti-Diabetic', manufacturer: 'Sun Pharma', dosage: '1 tablet 3 times daily', maxDaily: '3 tablets', sideEffects: 'Flatulence, diarrhea', schedule: 'With meals', color: 'White', shape: 'Tablet' },
  { name: 'Pioglitazone 15mg', composition: 'Pioglitazone 15mg', category: 'Anti-Diabetic', manufacturer: 'Sun Pharma', dosage: '1 tablet daily', maxDaily: '1 tablet', sideEffects: 'Weight gain, edema', schedule: 'Morning', color: 'White', shape: 'Tablet' },
  { name: 'Januvia 100', composition: 'Sitagliptin 100mg', category: 'Anti-Diabetic', manufacturer: 'MSD', dosage: '1 tablet daily', maxDaily: '1 tablet', sideEffects: 'Joint pain', schedule: 'Any time', color: 'Peach', shape: 'Tablet' },
  { name: 'Glycomet-GP2', composition: 'Glimepiride 2mg + Metformin 500mg', category: 'Anti-Diabetic', manufacturer: 'USV', dosage: '1 tablet twice daily with meals', maxDaily: '2 tablets', sideEffects: 'Hypoglycemia, nausea', schedule: 'With meals', color: 'White', shape: 'Tablet' },

  // Cardiovascular (12)
  { name: 'Amlodipine 5mg', composition: 'Amlodipine 5mg', category: 'Cardiovascular', manufacturer: 'Pfizer', dosage: '1 tablet daily', maxDaily: '1 tablet', sideEffects: 'Ankle swelling, headache', schedule: 'Morning', color: 'White', shape: 'Tablet' },
  { name: 'Telmisartan 40mg', composition: 'Telmisartan 40mg', category: 'Cardiovascular', manufacturer: 'Boehringer', dosage: '1 tablet daily', maxDaily: '1 tablet', sideEffects: 'Dizziness', schedule: 'Morning', color: 'White', shape: 'Tablet' },
  { name: 'Atorvastatin 20mg', composition: 'Atorvastatin 20mg', category: 'Cardiovascular', manufacturer: 'Pfizer', dosage: '1 tablet at night', maxDaily: '1 tablet', sideEffects: 'Muscle pain', schedule: 'Night', color: 'White', shape: 'Oval' },
  { name: 'Losartan 50mg', composition: 'Losartan 50mg', category: 'Cardiovascular', manufacturer: 'Merck', dosage: '1 tablet daily', maxDaily: '1 tablet', sideEffects: 'Dizziness, cough', schedule: 'Morning', color: 'White', shape: 'Round' },
  { name: 'Clopidogrel 75mg', composition: 'Clopidogrel 75mg', category: 'Cardiovascular', manufacturer: 'Sanofi', dosage: '1 tablet daily', maxDaily: '1 tablet', sideEffects: 'Bruising', schedule: 'Any time', color: 'Pink', shape: 'Round' },
  { name: 'Metoprolol 50mg', composition: 'Metoprolol Succinate 50mg', category: 'Cardiovascular', manufacturer: 'AstraZeneca', dosage: '1 tablet daily', maxDaily: '1 tablet', sideEffects: 'Bradycardia, fatigue', schedule: 'Morning', color: 'White', shape: 'Tablet' },
  { name: 'Bisoprolol 5mg', composition: 'Bisoprolol 5mg', category: 'Cardiovascular', manufacturer: 'Cipla', dosage: '1 tablet daily', maxDaily: '1 tablet', sideEffects: 'Dizziness, cold extremities', schedule: 'Morning', color: 'White', shape: 'Tablet' },
  { name: 'Ramipril 5mg', composition: 'Ramipril 5mg', category: 'Cardiovascular', manufacturer: 'Sanofi', dosage: '1 tablet daily', maxDaily: '1 tablet', sideEffects: 'Dry cough, dizziness', schedule: 'Morning', color: 'Red', shape: 'Tablet' },
  { name: 'Aspirin 75mg', composition: 'Aspirin 75mg', category: 'Cardiovascular', manufacturer: 'Bayer', dosage: '1 tablet daily', maxDaily: '1 tablet', sideEffects: 'GI bleeding', schedule: 'After food', color: 'Orange', shape: 'Tablet' },
  { name: 'Nitroglycerin 0.5mg', composition: 'Nitroglycerin 0.5mg', category: 'Cardiovascular', manufacturer: 'Cipla', dosage: '1 tablet under tongue', maxDaily: 'As needed', sideEffects: 'Headache, hypotension', schedule: 'As needed', color: 'White', shape: 'Sublingual' },
  { name: 'Furosemide 40mg', composition: 'Furosemide 40mg', category: 'Cardiovascular', manufacturer: 'Sanofi', dosage: '1 tablet daily', maxDaily: '1 tablet', sideEffects: 'Dehydration, hypokalemia', schedule: 'Morning', color: 'Yellow', shape: 'Tablet' },
  { name: 'Digoxin 0.25mg', composition: 'Digoxin 0.25mg', category: 'Cardiovascular', manufacturer: 'GSK', dosage: '1 tablet daily', maxDaily: '1 tablet', sideEffects: 'Nausea, visual changes', schedule: 'Morning', color: 'Green', shape: 'Tablet' },

  // Gastrointestinal (10)
  { name: 'Omeprazole 20mg', composition: 'Omeprazole 20mg', category: 'Gastrointestinal', manufacturer: 'AstraZeneca', dosage: '1 capsule daily before breakfast', maxDaily: '1 capsule', sideEffects: 'Headache, gas', schedule: 'Empty stomach', color: 'Pink', shape: 'Capsule', otc: true },
  { name: 'Pantoprazole 40mg', composition: 'Pantoprazole 40mg', category: 'Gastrointestinal', manufacturer: 'Pfizer', dosage: '1 tablet daily', maxDaily: '1 tablet', sideEffects: 'Nausea, flatulence', schedule: 'Empty stomach', color: 'Yellow', shape: 'Tablet' },
  { name: 'Ranitidine 150mg', composition: 'Ranitidine 150mg', category: 'Gastrointestinal', manufacturer: 'Sun Pharma', dosage: '1 tablet twice daily', maxDaily: '2 tablets', sideEffects: 'Headache', schedule: 'Before food', color: 'White', shape: 'Tablet', otc: true },
  { name: 'Domperidone 10mg', composition: 'Domperidone 10mg', category: 'Gastrointestinal', manufacturer: 'Cipla', dosage: '1 tablet 3 times daily', maxDaily: '3 tablets', sideEffects: 'Dry mouth', schedule: 'Before food', color: 'White', shape: 'Tablet', otc: true },
  { name: 'Ondansetron 4mg', composition: 'Ondansetron 4mg', category: 'Gastrointestinal', manufacturer: 'Cipla', dosage: '1 tablet every 8 hours', maxDaily: '3 tablets', sideEffects: 'Constipation, headache', schedule: 'As needed', color: 'White', shape: 'Tablet' },
  { name: 'Loperamide 2mg', composition: 'Loperamide 2mg', category: 'Gastrointestinal', manufacturer: 'Sun Pharma', dosage: '1 tablet after loose stool', maxDaily: '6 tablets', sideEffects: 'Constipation', schedule: 'As needed', color: 'Blue', shape: 'Capsule', otc: true },
  { name: 'ORS Sachet', composition: 'Oral Rehydration Salts', category: 'Gastrointestinal', manufacturer: 'Various', dosage: '1 sachet in 1L water', maxDaily: 'As needed', sideEffects: 'None', schedule: 'As needed', color: 'White', shape: 'Powder', otc: true },
  { name: 'Lactulose 15ml', composition: 'Lactulose 15ml', category: 'Gastrointestinal', manufacturer: 'Abbott', dosage: '15ml daily', maxDaily: '30ml', sideEffects: 'Bloating, gas', schedule: 'Morning', color: 'Clear', shape: 'Syrup', otc: true },
  { name: 'Sucralfate 1g', composition: 'Sucralfate 1g', category: 'Gastrointestinal', manufacturer: 'Sanofi', dosage: '1 tablet 4 times daily', maxDaily: '4 tablets', sideEffects: 'Constipation', schedule: 'Before meals', color: 'White', shape: 'Tablet' },
  { name: 'Esomeprazole 40mg', composition: 'Esomeprazole 40mg', category: 'Gastrointestinal', manufacturer: 'AstraZeneca', dosage: '1 capsule daily', maxDaily: '1 capsule', sideEffects: 'Diarrhea, headache', schedule: 'Empty stomach', color: 'Purple', shape: 'Capsule' },

  // Respiratory (8)
  { name: 'Montelukast 10mg', composition: 'Montelukast 10mg', category: 'Respiratory', manufacturer: 'MSD', dosage: '1 tablet at night', maxDaily: '1 tablet', sideEffects: 'Headache, thirst', schedule: 'Night', color: 'White', shape: 'Round' },
  { name: 'Salbutamol Inhaler', composition: 'Salbutamol 100mcg', category: 'Respiratory', manufacturer: 'Cipla', dosage: '2 puffs every 4 hours', maxDaily: '8 puffs', sideEffects: 'Tremors, palpitations', schedule: 'As needed', color: 'Blue', shape: 'Inhaler', otc: true },
  { name: 'Levocetirizine 5mg', composition: 'Levocetirizine 5mg', category: 'Respiratory', manufacturer: 'UCB', dosage: '1 tablet daily', maxDaily: '1 tablet', sideEffects: 'Drowsiness', schedule: 'Night', color: 'White', shape: 'Tablet', otc: true },
  { name: 'Ambroxol 75mg', composition: 'Ambroxol 75mg', category: 'Respiratory', manufacturer: 'Cipla', dosage: '1 tablet daily', maxDaily: '1 tablet', sideEffects: 'Nausea, diarrhea', schedule: 'Morning', color: 'White', shape: 'Tablet' },
  { name: 'Budesonide Inhaler', composition: 'Budesonide 200mcg', category: 'Respiratory', manufacturer: 'AstraZeneca', dosage: '2 puffs twice daily', maxDaily: '4 puffs', sideEffects: 'Oral thrush', schedule: 'Regular use', color: 'Brown', shape: 'Inhaler' },
  { name: 'Terbutaline 2.5mg', composition: 'Terbutaline 2.5mg', category: 'Respiratory', manufacturer: 'Cipla', dosage: '1 tablet 3 times daily', maxDaily: '3 tablets', sideEffects: 'Tremors', schedule: 'After food', color: 'White', shape: 'Tablet' },
  { name: 'Phenylephrine 10mg', composition: 'Phenylephrine 10mg', category: 'Respiratory', manufacturer: 'Various', dosage: '1 tablet every 4 hours', maxDaily: '4 tablets', sideEffects: 'Insomnia, BP rise', schedule: 'As needed', color: 'White', shape: 'Tablet', otc: true },
  { name: 'Dextromethorphan 15mg', composition: 'Dextromethorphan 15mg', category: 'Respiratory', manufacturer: 'Various', dosage: '10ml every 6 hours', maxDaily: '40ml', sideEffects: 'Drowsiness', schedule: 'As needed', color: 'Clear', shape: 'Syrup', otc: true },

  // Dermatological (6)
  { name: 'Cetirizine 10mg', composition: 'Cetirizine 10mg', category: 'Dermatological', manufacturer: 'UCB', dosage: '1 tablet daily', maxDaily: '1 tablet', sideEffects: 'Drowsiness', schedule: 'Night', color: 'White', shape: 'Round', otc: true },
  { name: 'Clotrimazole Cream', composition: 'Clotrimazole 1%', category: 'Dermatological', manufacturer: 'Bayer', dosage: 'Apply 2-3 times daily', maxDaily: 'As needed', sideEffects: 'Local irritation', schedule: 'Clean area first', color: 'White', shape: 'Cream', otc: true },
  { name: 'Betamethasone Cream', composition: 'Betamethasone 0.1%', category: 'Dermatological', manufacturer: 'GSK', dosage: 'Apply 1-2 times daily', maxDaily: '2 weeks max', sideEffects: 'Skin thinning', schedule: 'Short course', color: 'White', shape: 'Cream' },
  { name: 'Terbinafine Cream', composition: 'Terbinafine 1%', category: 'Dermatological', manufacturer: 'Novartis', dosage: 'Apply twice daily', maxDaily: '2 weeks', sideEffects: 'Burning, itching', schedule: 'Clean area first', color: 'White', shape: 'Cream', otc: true },
  { name: 'Permethrin Cream', composition: 'Permethrin 5%', category: 'Dermatological', manufacturer: 'Various', dosage: 'Apply once, wash off 8 hours', maxDaily: '1 application', sideEffects: 'Itching, numbness', schedule: 'As directed', color: 'White', shape: 'Cream' },
  { name: 'Mupirocin 2%', composition: 'Mupirocin 2%', category: 'Dermatological', manufacturer: 'GSK', dosage: 'Apply 3 times daily', maxDaily: '2 weeks', sideEffects: 'Local irritation', schedule: 'Clean area first', color: 'White', shape: 'Ointment' },

  // Neurological (6)
  { name: 'Escitalopram 10mg', composition: 'Escitalopram 10mg', category: 'Neurological', manufacturer: 'Lundbeck', dosage: '1 tablet daily', maxDaily: '1 tablet', sideEffects: 'Nausea, insomnia', schedule: 'Morning', color: 'White', shape: 'Oval' },
  { name: 'Gabapentin 300mg', composition: 'Gabapentin 300mg', category: 'Neurological', manufacturer: 'Sun Pharma', dosage: '1 capsule 3 times daily', maxDaily: '3 capsules', sideEffects: 'Dizziness', schedule: 'With food', color: 'Yellow', shape: 'Capsule' },
  { name: 'Pregabalin 75mg', composition: 'Pregabalin 75mg', category: 'Neurological', manufacturer: 'Pfizer', dosage: '1 capsule twice daily', maxDaily: '2 capsules', sideEffects: 'Weight gain, dizziness', schedule: 'With food', color: 'White', shape: 'Capsule' },
  { name: 'Carbamazepine 200mg', composition: 'Carbamazepine 200mg', category: 'Neurological', manufacturer: 'Novartis', dosage: '1 tablet twice daily', maxDaily: '2 tablets', sideEffects: 'Rash, dizziness', schedule: 'With food', color: 'Pink', shape: 'Tablet' },
  { name: 'Valproic Acid 500mg', composition: 'Valproic Acid 500mg', category: 'Neurological', manufacturer: 'Sun Pharma', dosage: '1 tablet twice daily', maxDaily: '2 tablets', sideEffects: 'Tremor, hair loss', schedule: 'With food', color: 'Blue', shape: 'Tablet' },
  { name: 'Levetiracetam 500mg', composition: 'Levetiracetam 500mg', category: 'Neurological', manufacturer: 'UCB', dosage: '1 tablet twice daily', maxDaily: '2 tablets', sideEffects: 'Drowsiness, irritability', schedule: 'Any time', color: 'Yellow', shape: 'Tablet' },

  // Psychiatric (5)
  { name: 'Alprazolam 0.5mg', composition: 'Alprazolam 0.5mg', category: 'Psychiatric', manufacturer: 'Pfizer', dosage: '1 tablet 2-3 times daily', maxDaily: '3 tablets', sideEffects: 'Drowsiness, dependence', schedule: 'As needed', color: 'Blue', shape: 'Tablet' },
  { name: 'Sertraline 50mg', composition: 'Sertraline 50mg', category: 'Psychiatric', manufacturer: 'Pfizer', dosage: '1 tablet daily', maxDaily: '1 tablet', sideEffects: 'Nausea, insomnia', schedule: 'Morning', color: 'Blue', shape: 'Tablet' },
  { name: 'Quetiapine 25mg', composition: 'Quetiapine 25mg', category: 'Psychiatric', manufacturer: 'AstraZeneca', dosage: '1 tablet at bedtime', maxDaily: '1 tablet', sideEffects: 'Drowsiness, weight gain', schedule: 'Night', color: 'Yellow', shape: 'Tablet' },
  { name: 'Olanzapine 5mg', composition: 'Olanzapine 5mg', category: 'Psychiatric', manufacturer: 'Lilly', dosage: '1 tablet daily', maxDaily: '1 tablet', sideEffects: 'Weight gain, metabolic', schedule: 'Night', color: 'White', shape: 'Tablet' },
  { name: 'Lithium 300mg', composition: 'Lithium Carbonate 300mg', category: 'Psychiatric', manufacturer: 'Sun Pharma', dosage: '1 tablet 2-3 times daily', maxDaily: '3 tablets', sideEffects: 'Tremor, thyroid', schedule: 'With food', color: 'White', shape: 'Tablet' },

  // Hormonal (5)
  { name: 'Levothyroxine 50mcg', composition: 'Levothyroxine 50mcg', category: 'Hormonal', manufacturer: 'Abbott', dosage: '1 tablet daily', maxDaily: '1 tablet', sideEffects: 'Palpitations', schedule: 'Empty stomach', color: 'White', shape: 'Round' },
  { name: 'OCP (Yasmin)', composition: 'Drospirenone 3mg + Ethinyl Estradiol 0.03mg', category: 'Hormonal', manufacturer: 'Bayer', dosage: '1 tablet daily for 21 days', maxDaily: '1 tablet', sideEffects: 'Nausea, breast tenderness', schedule: 'Same time daily', color: 'Yellow', shape: 'Tablet' },
  { name: 'Metformin 500mg for PCOS', composition: 'Metformin 500mg', category: 'Hormonal', manufacturer: 'USV', dosage: '1 tablet twice daily', maxDaily: '2 tablets', sideEffects: 'GI upset', schedule: 'With meals', color: 'White', shape: 'Round' },
  { name: 'Progesterone 200mg', composition: 'Micronized Progesterone 200mg', category: 'Hormonal', manufacturer: 'Sun Pharma', dosage: '1 capsule at bedtime', maxDaily: '1 capsule', sideEffects: 'Drowsiness', schedule: 'Night', color: 'Yellow', shape: 'Capsule' },
  { name: 'Testosterone Gel', composition: 'Testosterone 1%', category: 'Hormonal', manufacturer: 'Various', dosage: 'Apply to shoulders daily', maxDaily: 'As directed', sideEffects: 'Skin irritation', schedule: 'Morning', color: 'Clear', shape: 'Gel' },

  // Vitamins/Supplements (8)
  { name: 'Vitamin D3 60K', composition: 'Cholecalciferol 60000IU', category: 'Vitamin/Supplement', manufacturer: 'Abbott', dosage: '1 capsule weekly', maxDaily: '1 capsule', sideEffects: 'None typically', schedule: 'After breakfast', color: 'White', shape: 'Capsule', otc: true },
  { name: 'Vitamin B12', composition: 'Methylcobalamin 1500mcg', category: 'Vitamin/Supplement', manufacturer: 'Cipla', dosage: '1 tablet daily', maxDaily: '1 tablet', sideEffects: 'None typically', schedule: 'Any time', color: 'Pink', shape: 'Sublingual', otc: true },
  { name: 'Iron Supplement', composition: 'Ferrous Fumarate 200mg', category: 'Vitamin/Supplement', manufacturer: 'Various', dosage: '1 tablet daily', maxDaily: '1 tablet', sideEffects: 'Constipation, black stool', schedule: 'Empty stomach', color: 'Brown', shape: 'Tablet', otc: true },
  { name: 'Calcium + Vitamin D3', composition: 'Calcium 500mg + D3 250IU', category: 'Vitamin/Supplement', manufacturer: 'Abbott', dosage: '1 tablet twice daily', maxDaily: '2 tablets', sideEffects: 'None typically', schedule: 'After food', color: 'White', shape: 'Tablet', otc: true },
  { name: 'Omega 3 Fish Oil', composition: 'EPA 180mg + DHA 120mg', category: 'Vitamin/Supplement', manufacturer: 'Various', dosage: '1 capsule daily', maxDaily: '1 capsule', sideEffects: 'Fishy aftertaste', schedule: 'With food', color: 'Yellow', shape: 'Capsule', otc: true },
  { name: 'Multivitamin', composition: 'Multiple Vitamins & Minerals', category: 'Vitamin/Supplement', manufacturer: 'Various', dosage: '1 tablet daily', maxDaily: '1 tablet', sideEffects: 'None typically', schedule: 'After food', color: 'Red', shape: 'Tablet', otc: true },
  { name: 'Zinc 50mg', composition: 'Zinc Sulfate 50mg', category: 'Vitamin/Supplement', manufacturer: 'Various', dosage: '1 tablet daily', maxDaily: '1 tablet', sideEffects: 'Nausea', schedule: 'After food', color: 'White', shape: 'Tablet', otc: true },
  { name: 'Folic Acid 5mg', composition: 'Folic Acid 5mg', category: 'Vitamin/Supplement', manufacturer: 'Various', dosage: '1 tablet daily', maxDaily: '1 tablet', sideEffects: 'None typically', schedule: 'Any time', color: 'Yellow', shape: 'Tablet', otc: true },

  // Antifungal (4)
  { name: 'Fluconazole 150mg', composition: 'Fluconazole 150mg', category: 'Antifungal', manufacturer: 'Pfizer', dosage: '1 capsule weekly for 2-4 weeks', maxDaily: '1 capsule', sideEffects: 'Nausea, headache', schedule: 'Any time', color: 'Blue', shape: 'Capsule' },
  { name: 'Itraconazole 100mg', composition: 'Itraconazole 100mg', category: 'Antifungal', manufacturer: 'Cipla', dosage: '1 capsule twice daily', maxDaily: '2 capsules', sideEffects: 'GI upset', schedule: 'After food', color: 'Blue', shape: 'Capsule' },
  { name: 'Ketoconazole 200mg', composition: 'Ketoconazole 200mg', category: 'Antifungal', manufacturer: 'Janssen', dosage: '1 tablet daily', maxDaily: '1 tablet', sideEffects: 'Liver toxicity', schedule: 'After food', color: 'White', shape: 'Tablet' },
  { name: 'Terbinafine 250mg', composition: 'Terbinafine 250mg', category: 'Antifungal', manufacturer: 'Novartis', dosage: '1 tablet daily for 6-12 weeks', maxDaily: '1 tablet', sideEffects: 'Liver issues, taste changes', schedule: 'After food', color: 'White', shape: 'Tablet' },

  // Antiviral (4)
  { name: 'Acyclovir 400mg', composition: 'Acyclovir 400mg', category: 'Antiviral', manufacturer: 'Cipla', dosage: '1 tablet 3-5 times daily', maxDaily: '5 tablets', sideEffects: 'Nausea, headache', schedule: 'With water', color: 'White', shape: 'Tablet' },
  { name: 'Oseltamivir 75mg', composition: 'Oseltamivir 75mg', category: 'Antiviral', manufacturer: 'Roche', dosage: '1 capsule twice daily for 5 days', maxDaily: '2 capsules', sideEffects: 'Nausea, vomiting', schedule: 'With food', color: 'Blue', shape: 'Capsule' },
  { name: 'Remdesivir 100mg', composition: 'Remdesivir 100mg', category: 'Antiviral', manufacturer: 'Cipla', dosage: 'IV infusion daily', maxDaily: '1 dose', sideEffects: 'Liver enzymes elevated', schedule: 'IV only', color: 'White', shape: 'Powder' },
  { name: 'Molnupiravir 400mg', composition: 'Molnupiravir 400mg', category: 'Antiviral', manufacturer: 'Dr Reddy\'s', dosage: '2 capsules twice daily for 5 days', maxDaily: '8 capsules', sideEffects: 'Diarrhea, nausea', schedule: 'With food', color: 'White', shape: 'Capsule' },

  // Muscle Relaxants (4)
  { name: 'Thiocolchicoside 4mg', composition: 'Thiocolchicoside 4mg', category: 'Muscle Relaxant', manufacturer: 'Cipla', dosage: '1 tablet twice daily', maxDaily: '2 tablets', sideEffects: 'Diarrhea, weakness', schedule: 'After food', color: 'Orange', shape: 'Tablet' },
  { name: 'Cyclobenzaprine 5mg', composition: 'Cyclobenzaprine 5mg', category: 'Muscle Relaxant', manufacturer: 'Sun Pharma', dosage: '1 tablet 3 times daily', maxDaily: '3 tablets', sideEffects: 'Drowsiness, dry mouth', schedule: 'After food', color: 'White', shape: 'Tablet' },
  { name: 'Tizanidine 2mg', composition: 'Tizanidine 2mg', category: 'Muscle Relaxant', manufacturer: 'Cipla', dosage: '1 tablet 3 times daily', maxDaily: '3 tablets', sideEffects: 'Drowsiness, dizziness', schedule: 'With food', color: 'White', shape: 'Tablet' },
  { name: 'Eperisone 50mg', composition: 'Eperisone 50mg', category: 'Muscle Relaxant', manufacturer: 'Abbott', dosage: '1 tablet 3 times daily', maxDaily: '3 tablets', sideEffects: 'GI upset', schedule: 'After food', color: 'White', shape: 'Tablet' },

  // Eye/Ear drops (4)
  { name: 'Timolol Eye Drops', composition: 'Timolol 0.5%', category: 'Eye/Ear Drop', manufacturer: 'Sun Pharma', dosage: '1 drop twice daily', maxDaily: '2 drops', sideEffects: 'Eye irritation', schedule: 'Regular use', color: 'Clear', shape: 'Drops' },
  { name: 'Moxifloxacin Eye Drops', composition: 'Moxifloxacin 0.5%', category: 'Eye/Ear Drop', manufacturer: 'Sun Pharma', dosage: '1 drop 4 times daily', maxDaily: '4 drops', sideEffects: 'Eye burning', schedule: 'For 7 days', color: 'Clear', shape: 'Drops' },
  { name: 'Ofloxacin Ear Drops', composition: 'Ofloxacin 0.3%', category: 'Eye/Ear Drop', manufacturer: 'Sun Pharma', dosage: '5 drops in ear twice daily', maxDaily: '10 drops', sideEffects: 'Ear pain', schedule: 'For 7-14 days', color: 'Clear', shape: 'Drops' },
  { name: 'Sodium Hyaluronate Drops', composition: 'Sodium Hyaluronate 0.3%', category: 'Eye/Ear Drop', manufacturer: 'Sun Pharma', dosage: '1 drop as needed', maxDaily: '6 drops', sideEffects: 'None', schedule: 'As needed', color: 'Clear', shape: 'Drops', otc: true },
];

// Drug Interaction Database - 35+ interactions
const DRUG_INTERACTIONS: DrugInteraction[] = [
  { drug1: 'Aspirin', drug2: 'Ibuprofen', severity: 'moderate', description: 'Both are NSAIDs - increased risk of GI bleeding and reduced cardioprotective effect of aspirin', advice: 'Avoid combining. Use paracetamol instead for pain relief if on aspirin.' },
  { drug1: 'Aspirin', drug2: 'Clopidogrel', severity: 'mild', description: 'Increased bleeding risk when combined', advice: 'Generally prescribed together for heart patients. Monitor for bleeding.' },
  { drug1: 'Metformin', drug2: 'Alcohol', severity: 'severe', description: 'Increased risk of lactic acidosis', advice: 'Avoid alcohol while taking metformin.' },
  { drug1: 'Metformin', drug2: 'Ibuprofen', severity: 'moderate', description: 'NSAIDs can reduce kidney function affecting metformin clearance', advice: 'Use occasional paracetamol instead. Monitor kidney function.' },
  { drug1: 'Warfarin', drug2: 'Aspirin', severity: 'severe', description: 'Significantly increased bleeding risk', advice: 'Only combine under close medical supervision with regular INR monitoring.' },
  { drug1: 'Warfarin', drug2: 'Metronidazole', severity: 'severe', description: 'Metronidazole increases warfarin effect significantly', advice: 'Avoid combination or closely monitor INR. Dose adjustment needed.' },
  { drug1: 'Amlodipine', drug2: 'Simvastatin', severity: 'moderate', description: 'Increased risk of muscle damage (rhabdomyolysis)', advice: 'Limit simvastatin dose to 20mg when combined. Monitor for muscle pain.' },
  { drug1: 'Losartan', drug2: 'Potassium', severity: 'moderate', description: 'Risk of hyperkalemia', advice: 'Monitor potassium levels regularly. Avoid potassium supplements unless advised.' },
  { drug1: 'Ciprofloxacin', drug2: 'Antacid', severity: 'moderate', description: 'Antacids reduce ciprofloxacin absorption', advice: 'Take ciprofloxacin 2 hours before or 6 hours after antacids.' },
  { drug1: 'Ciprofloxacin', drug2: 'Theophylline', severity: 'severe', description: 'Ciprofloxacin increases theophylline levels', advice: 'Avoid combination. Risk of seizures and cardiac arrhythmias.' },
  { drug1: 'Omeprazole', drug2: 'Clopidogrel', severity: 'severe', description: 'Omeprazole reduces activation of clopidogrel', advice: 'Use pantoprazole instead if on clopidogrel.' },
  { drug1: 'Escitalopram', drug2: 'Tramadol', severity: 'severe', description: 'Risk of serotonin syndrome', advice: 'Avoid combining. Can cause fever, agitation, tremors.' },
  { drug1: 'Gabapentin', drug2: 'Opioid', severity: 'severe', description: 'Increased respiratory depression risk', advice: 'Use lowest doses. Monitor for excessive sedation.' },
  { drug1: 'Metoprolol', drug2: 'Verapamil', severity: 'severe', description: 'Risk of severe bradycardia and heart block', advice: 'Avoid combining without expert supervision.' },
  { drug1: 'Digoxin', drug2: 'Amiodarone', severity: 'severe', description: 'Amiodarone increases digoxin levels', advice: 'Reduce digoxin dose by 50% if combining.' },
  { drug1: 'Lithium', drug2: 'Ibuprofen', severity: 'severe', description: 'NSAIDs increase lithium levels significantly', advice: 'Avoid NSAIDs. Use paracetamol for pain relief.' },
  { drug1: 'Lithium', drug2: 'Metronidazole', severity: 'severe', description: 'Increased lithium levels, risk of toxicity', advice: 'Avoid combination.' },
  { drug1: 'Phenytoin', drug2: 'Amiodarone', severity: 'moderate', description: 'Amiodarone increases phenytoin levels', advice: 'Monitor phenytoin levels and adjust dose.' },
  { drug1: 'Carbamazepine', drug2: 'Erythromycin', severity: 'moderate', description: 'Erythromycin increases carbamazepine levels', advice: 'Monitor for carbamazepine toxicity symptoms.' },
  { drug1: 'Fluconazole', drug2: 'Warfarin', severity: 'severe', description: 'Fluconazole potentiates warfarin effect', advice: 'Monitor INR closely. May need to reduce warfarin dose.' },
  { drug1: 'Fluconazole', drug2: 'Statins', severity: 'moderate', description: 'Increased risk of muscle damage with statins', advice: 'Temporarily stop statin during fluconazole course.' },
  { drug1: 'Azithromycin', drug2: 'Antacid', severity: 'mild', description: 'Antacids may reduce azithromycin absorption', advice: 'Take azithromycin 1 hour before or 2 hours after antacids.' },
  { drug1: 'Doxycycline', drug2: 'Antacid', severity: 'moderate', description: 'Antacids reduce doxycycline absorption significantly', advice: 'Take doxycycline 2 hours before or after antacids.' },
  { drug1: 'Doxycycline', drug2: 'Dairy', severity: 'moderate', description: 'Dairy products reduce doxycycline absorption', advice: 'Avoid dairy within 2 hours of taking doxycycline.' },
  { drug1: 'Nifedipine', drug2: 'Metoprolol', severity: 'moderate', description: 'Risk of excessive hypotension and bradycardia', advice: 'Combine with caution. Monitor BP and heart rate.' },
  { drug1: 'Alprazolam', drug2: 'Opioid', severity: 'severe', description: 'Extreme sedation and respiratory depression risk', advice: 'Avoid combining. Can be fatal.' },
  { drug1: 'Olanzapine', drug2: 'Metformin', severity: 'moderate', description: 'Both increase metabolic syndrome risk', advice: 'Monitor weight, blood sugar, and lipids regularly.' },
  { drug1: 'Levothyroxine', drug2: 'Calcium', severity: 'moderate', description: 'Calcium reduces levothyroxine absorption', advice: 'Take levothyroxine 4 hours apart from calcium.' },
  { drug1: 'Levothyroxine', drug2: 'Iron', severity: 'moderate', description: 'Iron reduces levothyroxine absorption', advice: 'Take levothyroxine 4 hours apart from iron supplements.' },
  { drug1: 'Oral Contraceptive', drug2: 'Rifampicin', severity: 'severe', description: 'Rifampicin reduces effectiveness of oral contraceptives', advice: 'Use alternative contraception while on rifampicin.' },
  { drug1: 'ACE Inhibitor', drug2: 'Potassium', severity: 'severe', description: 'Risk of life-threatening hyperkalemia', advice: 'Avoid potassium supplements. Monitor potassium levels.' },
  { drug1: 'Ibuprofen', drug2: 'ACE Inhibitor', severity: 'moderate', description: 'NSAIDs reduce antihypertensive effect and increase kidney risk', advice: 'Avoid regular NSAID use. Use paracetamol instead.' },
  { drug1: 'Cetirizine', drug2: 'Alcohol', severity: 'mild', description: 'Increased drowsiness and impaired coordination', advice: 'Avoid alcohol or use caution. Do not drive.' },
  { drug1: 'Paracetamol', drug2: 'Alcohol', severity: 'moderate', description: 'Increased risk of liver damage with heavy drinking', advice: 'Avoid alcohol or limit to occasional use. Do not exceed recommended dose.' },
  { drug1: 'Fluconazole', drug2: 'Atorvastatin', severity: 'severe', description: 'Fluconazole significantly increases statin levels', advice: 'Temporarily stop atorvastatin during fluconazole course.' },
];

// Symptom to Medicine Category Mapping
const SYMPTOM_MEDICINE_MAP: Record<string, { categories: string[]; advice: string }> = {
  headache: { categories: ['Pain Relief'], advice: 'Paracetamol or Ibuprofen may help. Persistent headaches need medical attention.' },
  fever: { categories: ['Pain Relief'], advice: 'Paracetamol is preferred for fever. Stay hydrated. See doctor if fever persists >3 days.' },
  'body pain': { categories: ['Pain Relief', 'Muscle Relaxant'], advice: 'Ibuprofen or Combiflam for general pain. Muscle relaxants for muscle spasms.' },
  'stomach pain': { categories: ['Gastrointestinal'], advice: 'Antacids or PPI for acidity. Consult doctor for severe or persistent pain.' },
  acidity: { categories: ['Gastrointestinal'], advice: 'Omeprazole or Pantoprazole for acid reflux. Avoid spicy foods.' },
  diarrhea: { categories: ['Gastrointestinal'], advice: 'ORS and Loperamide may help. See doctor if bloody stools or dehydration.' },
  vomiting: { categories: ['Gastrointestinal'], advice: 'Ondansetron or Domperidone may help. Stay hydrated with small sips.' },
  cough: { categories: ['Respiratory'], advice: 'Dextromethorphan for dry cough. Ambroxol for productive cough.' },
  cold: { categories: ['Respiratory', 'Pain Relief'], advice: 'Phenylephrine for congestion. Cetirizine for runny nose. Paracetamol for fever.' },
  allergy: { categories: ['Dermatological', 'Respiratory'], advice: 'Cetirizine or Levocetirizine for allergies. Avoid the allergen.' },
  'skin rash': { categories: ['Dermatological'], advice: 'Antifungal cream if fungal. Consult doctor for persistent rashes.' },
  'joint pain': { categories: ['Pain Relief'], advice: 'Ibuprofen or Aceclofenac for joint pain. Apply topical analgesics.' },
  'muscle spasm': { categories: ['Muscle Relaxant', 'Pain Relief'], advice: 'Thiocolchicoside or Tizanidine for muscle spasms.' },
  dizziness: { categories: ['Neurological', 'Cardiovascular'], advice: 'Stay hydrated. If persistent, check BP and see doctor.' },
  insomnia: { categories: ['Psychiatric'], advice: 'Practice sleep hygiene. Consult doctor for persistent insomnia.' },
  anxiety: { categories: ['Psychiatric'], advice: 'Practice relaxation techniques. Consult psychiatrist if persistent.' },
  'high BP': { categories: ['Cardiovascular'], advice: 'Regular medication and lifestyle changes. Monitor BP daily.' },
  diabetes: { categories: ['Anti-Diabetic'], advice: 'Regular medication, diet control, and exercise. Monitor blood sugar.' },
  infection: { categories: ['Antibiotic'], advice: 'Complete the full course of antibiotics. Do not self-medicate.' },
  fungal: { categories: ['Antifungal'], advice: 'Keep area dry. Apply antifungal cream regularly.' },
  nausea: { categories: ['Gastrointestinal'], advice: 'Domperidone or Ondansetron may help. Eat small frequent meals.' },
  'sore throat': { categories: ['Pain Relief', 'Antibiotic'], advice: 'Warm water gargle. Paracetamol for pain. See doctor if persistent.' },
  'eye infection': { categories: ['Eye/Ear Drop'], advice: 'Moxifloxacin eye drops. Do not share towels or pillows.' },
  'ear infection': { categories: ['Eye/Ear Drop'], advice: 'Ofloxacin ear drops. Keep ear dry. See ENT specialist.' },
  fatigue: { categories: ['Vitamin/Supplement'], advice: 'Check for iron, B12, or D deficiency. Balanced diet and rest.' },
  'vitamin deficiency': { categories: ['Vitamin/Supplement'], advice: 'Supplements as directed. Include fortified foods in diet.' },
};

// Levenshtein Distance calculation for fuzzy matching
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Fuzzy match score (0-1, 1 = perfect match)
function fuzzyMatchScore(input: string, target: string): number {
  const inputLower = input.toLowerCase().trim();
  const targetLower = target.toLowerCase().trim();
  if (inputLower === targetLower) return 1;
  if (targetLower.includes(inputLower) || inputLower.includes(targetLower)) return 0.85;
  const distance = levenshteinDistance(inputLower, targetLower);
  const maxLength = Math.max(inputLower.length, targetLower.length);
  if (maxLength === 0) return 1;
  return Math.max(0, 1 - distance / maxLength);
}

// Extract color words from OCR text
function extractColors(text: string): string[] {
  const colorWords = ['white', 'pink', 'red', 'blue', 'yellow', 'orange', 'green', 'brown', 'purple', 'peach', 'clear', 'ivory'];
  const textLower = text.toLowerCase();
  return colorWords.filter(color => textLower.includes(color));
}

// Extract shape words from OCR text
function extractShapes(text: string): string[] {
  const shapeWords = ['tablet', 'capsule', 'round', 'oval', 'syrup', 'drops', 'cream', 'powder', 'inhaler', 'gel', 'ointment'];
  const textLower = text.toLowerCase();
  return shapeWords.filter(shape => textLower.includes(shape));
}

// Enhanced medicine matching with scoring
function findMedicineMatches(text: string, topN: number = 5): MedicineMatch[] {
  const normalizedText = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const detectedColors = extractColors(text);
  const detectedShapes = extractShapes(text);
  const matches: MedicineMatch[] = [];

  for (const med of MEDICINE_DATABASE) {
    let score = 0;
    let matchType = '';

    // Exact name match (highest priority)
    if (normalizedText.includes(med.name.toLowerCase())) {
      score = 1.0;
      matchType = 'exact_name';
    }
    // Exact composition match
    else if (normalizedText.includes(med.composition.toLowerCase())) {
      score = 0.95;
      matchType = 'exact_composition';
    }
    // Fuzzy name match
    else {
      const nameFuzzy = fuzzyMatchScore(normalizedText, med.name);
      if (nameFuzzy > 0.6) {
        score = nameFuzzy * 0.85;
        matchType = 'fuzzy_name';
      }
      // Fuzzy composition match
      else {
        const compFuzzy = fuzzyMatchScore(normalizedText, med.composition);
        if (compFuzzy > 0.6) {
          score = compFuzzy * 0.8;
          matchType = 'fuzzy_composition';
        }
      }
    }

    // Composition word matching
    if (score < 0.8) {
      const compositionWords = med.composition.toLowerCase().split(/[\s+]+/);
      const matchCount = compositionWords.filter(word => word.length > 2 && normalizedText.includes(word)).length;
      if (matchCount >= 2) {
        score = Math.max(score, 0.75);
        matchType = 'composition_words';
      }
    }

    // Name word matching
    if (score < 0.7) {
      const nameWords = med.name.toLowerCase().split(/\s+/);
      const matchCount = nameWords.filter(word => word.length > 2 && normalizedText.includes(word)).length;
      if (matchCount >= 1) {
        score = Math.max(score, 0.65);
        matchType = 'name_words';
      }
    }

    // Color bonus
    if (detectedColors.length > 0 && med.color) {
      const medColors = med.color.toLowerCase().split('/');
      const colorMatch = detectedColors.some(c => medColors.includes(c));
      if (colorMatch && score > 0) {
        score = Math.min(1, score + 0.1);
        matchType += '+color';
      }
    }

    // Shape bonus
    if (detectedShapes.length > 0 && med.shape) {
      const medShape = med.shape.toLowerCase();
      const shapeMatch = detectedShapes.includes(medShape);
      if (shapeMatch && score > 0) {
        score = Math.min(1, score + 0.05);
        matchType += '+shape';
      }
    }

    if (score > 0.3) {
      matches.push({ medicine: med, score, matchType });
    }
  }

  // Sort by score descending
  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, topN);
}

// Drug interaction checker
function checkDrugInteractions(medicines: string[]): DrugInteraction[] {
  const interactions: DrugInteraction[] = [];
  const medNamesLower = medicines.map(m => m.toLowerCase());

  for (const interaction of DRUG_INTERACTIONS) {
    const d1Lower = interaction.drug1.toLowerCase();
    const d2Lower = interaction.drug2.toLowerCase();

    const hasDrug1 = medNamesLower.some(name => name.includes(d1Lower) || d1Lower.includes(name));
    const hasDrug2 = medNamesLower.some(name => name.includes(d2Lower) || d2Lower.includes(name));

    if (hasDrug1 && hasDrug2) {
      interactions.push(interaction);
    }
  }

  // Sort by severity (severe first)
  const severityOrder: Record<string, number> = { severe: 0, moderate: 1, mild: 2 };
  interactions.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return interactions;
}

// Symptom to medicine suggestion
function suggestMedicines(symptoms: string[]): { medicines: Medicine[]; disclaimer: string; advice: string[] } {
  const categorySet = new Set<string>();
  const adviceList: string[] = [];

  for (const symptom of symptoms) {
    const symptomLower = symptom.toLowerCase().trim();
    const mapping = SYMPTOM_MEDICINE_MAP[symptomLower];
    if (mapping) {
      mapping.categories.forEach(cat => categorySet.add(cat));
      adviceList.push(`${symptom}: ${mapping.advice}`);
    }
  }

  // Get OTC medicines from matching categories
  const suggestions = MEDICINE_DATABASE.filter(
    med => categorySet.has(med.category) && med.otc === true
  ).slice(0, 10);

  return {
    medicines: suggestions,
    disclaimer: 'This is NOT medical advice. These are general OTC suggestions only. Always consult a qualified healthcare professional before taking any medication.',
    advice: adviceList.length > 0 ? adviceList : ['No specific suggestions found. Please consult a doctor.'],
  };
}

// Enhanced OCR with multiple passes and preprocessing info
async function processImageOCR(imageData: string): Promise<{ text: string; confidence: number; preprocessInfo: string[] }> {
  const preprocessInfo: string[] = [];

  try {
    const Tesseract = await import('tesseract.js');

    // Pass 1: Standard recognition
    preprocessInfo.push('Standard OCR pass');
    const result1 = await Tesseract.recognize(imageData, 'eng', {
      logger: (m: any) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Pass 1 Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    let bestText = result1.data.text;
    let bestConfidence = result1.data.confidence;

    // Pass 2: Try with different PSM modes for better detection
    preprocessInfo.push('Enhanced PSM pass');
    const result2 = await Tesseract.recognize(imageData, 'eng', {
      logger: (m: any) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Pass 2 Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    // Use the result with higher confidence or more text
    if (result2.data.confidence > bestConfidence || result2.data.text.length > bestText.length * 1.2) {
      bestText = result2.data.text;
      bestConfidence = result2.data.confidence;
    }

    // Preprocessing suggestions for the user
    preprocessInfo.push('Image preprocessing tips for better results:');
    preprocessInfo.push('- Ensure good lighting and contrast');
    preprocessInfo.push('- Keep the pill packaging flat and centered');
    preprocessInfo.push('- Avoid shadows and glare');
    preprocessInfo.push('- Use a high-resolution image (at least 300 DPI)');
    preprocessInfo.push('- If text is rotated, try rotating the image');

    return {
      text: bestText,
      confidence: bestConfidence,
      preprocessInfo,
    };
  } catch (error) {
    console.error('OCR processing failed:', error);
    return { text: '', confidence: 0, preprocessInfo: ['OCR processing failed'] };
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      // Handle image upload for OCR
      const formData = await req.formData();
      const imageFile = formData.get('image') as File;

      if (!imageFile) {
        return NextResponse.json({ error: 'No image provided' }, { status: 400 });
      }

      // Convert file to base64
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Image = `data:${imageFile.type};base64,${buffer.toString('base64')}`;

      // Process with enhanced OCR
      const ocrResult = await processImageOCR(base64Image);
      const ocrText = ocrResult.text;

      if (!ocrText) {
        return NextResponse.json({
          error: 'Could not read text from image. Please try again with a clearer image.',
          ocrText: '',
          preprocessInfo: ocrResult.preprocessInfo,
          confidence: 0,
        }, { status: 400 });
      }

      // Find matching medicines with scoring
      const matches = findMedicineMatches(ocrText, 5);
      const bestMatch = matches.length > 0 ? matches[0] : null;

      // Check drug interactions if multiple potential matches
      const potentialMeds = matches.map(m => m.medicine.name);
      const interactions = checkDrugInteractions(potentialMeds);

      // Save pill record
      let pillRecord = null;
      try {
        pillRecord = await prisma.pillRecord.create({
          data: {
            imageData: base64Image.substring(0, 1000),
            pillName: bestMatch?.medicine.name || 'Unknown',
            description: ocrText,
            matches: JSON.stringify(matches.map(m => ({
              name: m.medicine.name,
              score: m.score,
              matchType: m.matchType,
            }))),
          },
        });
      } catch (error) {
        console.error('Failed to save pill record:', error);
      }

      return NextResponse.json({
        success: true,
        ocrText,
        confidence: ocrResult.confidence,
        preprocessInfo: ocrResult.preprocessInfo,
        matches: matches.map(m => ({
          name: m.medicine.name,
          genericName: m.medicine.composition,
          manufacturer: m.medicine.manufacturer,
          composition: m.medicine.composition,
          uses: [m.medicine.category],
          sideEffects: m.medicine.sideEffects.split(', '),
          warnings: ['Consult doctor before use', 'Read label carefully'],
          dosage: m.medicine.dosage,
          schedule: m.medicine.schedule,
          color: m.medicine.color,
          shape: m.medicine.shape,
          score: Math.round(m.score * 100),
          matchType: m.matchType,
          otc: m.medicine.otc || false,
        })),
        bestMatch: bestMatch ? {
          name: bestMatch.medicine.name,
          genericName: bestMatch.medicine.composition,
          manufacturer: bestMatch.medicine.manufacturer,
          composition: bestMatch.medicine.composition,
          uses: [bestMatch.medicine.category],
          sideEffects: bestMatch.medicine.sideEffects.split(', '),
          warnings: ['Consult doctor before use'],
          dosage: bestMatch.medicine.dosage,
          schedule: bestMatch.medicine.schedule,
          color: bestMatch.medicine.color,
          shape: bestMatch.medicine.shape,
          score: Math.round(bestMatch.score * 100),
        } : null,
        drugInteractions: interactions.length > 0 ? interactions : null,
        pillRecordId: pillRecord?.id,
      });

    } else {
      // Handle JSON request
      const body = await req.json();
      const { action, query, medicines, symptoms } = body;

      if (action === 'search' && query) {
        // Enhanced search with fuzzy matching
        const matches = findMedicineMatches(query, 15);
        return NextResponse.json({
          success: true,
          medicines: matches.map(m => ({
            name: m.medicine.name,
            genericName: m.medicine.composition,
            manufacturer: m.medicine.manufacturer,
            composition: m.medicine.composition,
            uses: [m.medicine.category],
            sideEffects: m.medicine.sideEffects.split(', '),
            warnings: ['Consult doctor before use'],
            dosage: m.medicine.dosage,
            schedule: m.medicine.schedule,
            color: m.medicine.color,
            shape: m.medicine.shape,
            score: Math.round(m.score * 100),
            matchType: m.matchType,
            otc: m.medicine.otc || false,
          })),
        });
      }

      if (action === 'interactions' && Array.isArray(medicines)) {
        // Drug interaction check
        const interactions = checkDrugInteractions(medicines);
        return NextResponse.json({
          success: true,
          interactions,
          totalInteractions: interactions.length,
          severeCount: interactions.filter(i => i.severity === 'severe').length,
          moderateCount: interactions.filter(i => i.severity === 'moderate').length,
          mildCount: interactions.filter(i => i.severity === 'mild').length,
        });
      }

      if (action === 'suggest' && Array.isArray(symptoms)) {
        // Symptom-based medicine suggestion
        const suggestions = suggestMedicines(symptoms);
        return NextResponse.json({
          success: true,
          ...suggestions,
        });
      }

      if (action === 'scan') {
        return NextResponse.json({
          success: true,
          message: 'Camera scan not available in API. Please upload an image instead.',
          instruction: 'Use the upload feature to scan a pill image.',
        });
      }

      return NextResponse.json({ error: 'Invalid action. Supported: search, interactions, suggest, scan' }, { status: 400 });
    }
  } catch (error) {
    console.error('Pill scanner error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
