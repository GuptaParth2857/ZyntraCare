'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiPlus, FiX, FiAlertTriangle, FiCheckCircle, FiInfo, FiShare2, FiShield, FiActivity, FiCopy, FiCheck } from 'react-icons/fi';
import Link from 'next/link';

interface MedicineInfo {
  id: string;
  name: string;
  genericName: string;
  category: string;
  uses: string[];
  sideEffects: string[];
  warnings: string[];
  dosage: string;
  manufacturer: string;
  price: number;
  requiresPrescription: boolean;
}

interface Interaction {
  med1: string;
  med2: string;
  severity: 'safe' | 'mild' | 'moderate' | 'severe' | 'contraindicated';
  description: string;
  whatToWatch: string;
  alternatives: string[];
}

const MEDICINE_DATABASE: MedicineInfo[] = [
  { id: '1', name: 'Paracetamol 500mg', genericName: 'Acetaminophen', category: 'Analgesic', uses: ['Fever', 'Headache', 'Body pain', 'Toothache'], sideEffects: ['Nausea', 'Rash (rare)', 'Liver damage (overdose)'], warnings: ['Do not exceed 4g/day', 'Avoid with liver disease'], dosage: '500mg-1g every 4-6 hours', manufacturer: 'Crocin/GSK', price: 25, requiresPrescription: false },
  { id: '2', name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', category: 'NSAID', uses: ['Pain', 'Inflammation', 'Fever', 'Arthritis'], sideEffects: ['Stomach upset', 'Dizziness', 'Headache'], warnings: ['Take with food', 'Avoid with kidney disease', 'Risk of GI bleeding'], dosage: '400mg every 6-8 hours', manufacturer: 'Brufen/Abbott', price: 35, requiresPrescription: false },
  { id: '3', name: 'Metformin 500mg', genericName: 'Metformin HCl', category: 'Antidiabetic', uses: ['Type 2 Diabetes', 'PCOS', 'Prediabetes'], sideEffects: ['Nausea', 'Diarrhea', 'Stomach cramps', 'Metallic taste'], warnings: ['Monitor kidney function', 'Risk of lactic acidosis', 'Stop before contrast dye'], dosage: '500mg twice daily with meals', manufacturer: 'Glycomet/USV', price: 45, requiresPrescription: true },
  { id: '4', name: 'Amlodipine 5mg', genericName: 'Amlodipine Besylate', category: 'Antihypertensive', uses: ['High blood pressure', 'Angina', 'Coronary artery disease'], sideEffects: ['Ankle swelling', 'Dizziness', 'Flushing', 'Fatigue'], warnings: ['Do not stop suddenly', 'Monitor blood pressure regularly'], dosage: '5mg once daily', manufacturer: 'Amlodac/Zydus', price: 30, requiresPrescription: true },
  { id: '5', name: 'Omeprazole 20mg', genericName: 'Omeprazole', category: 'Proton Pump Inhibitor', uses: ['Acid reflux', 'Gastric ulcers', 'GERD', 'H. pylori (combination)'], sideEffects: ['Headache', 'Nausea', 'Abdominal pain', 'Long-term B12 deficiency'], warnings: ['Do not use long-term without guidance', 'May reduce magnesium levels'], dosage: '20mg once daily before breakfast', manufacturer: 'Omez/Dr. Reddy\'s', price: 65, requiresPrescription: false },
  { id: '6', name: 'Cetirizine 10mg', genericName: 'Cetirizine HCl', category: 'Antihistamine', uses: ['Allergies', 'Hay fever', 'Urticaria', 'Itchy eyes'], sideEffects: ['Drowsiness', 'Dry mouth', 'Fatigue', 'Headache'], warnings: ['May cause drowsiness', 'Avoid driving after taking'], dosage: '10mg once daily', manufacturer: 'Cetz/UCB', price: 25, requiresPrescription: false },
  { id: '7', name: 'Atorvastatin 10mg', genericName: 'Atorvastatin Calcium', category: 'Statin', uses: ['High cholesterol', 'Heart disease prevention', 'High triglycerides'], sideEffects: ['Muscle pain', 'Joint pain', 'Nausea', 'Diarrhea'], warnings: ['Monitor liver function', 'Avoid grapefruit', 'Report unexplained muscle pain'], dosage: '10-20mg once daily at night', manufacturer: 'Atorva/Pfizer', price: 55, requiresPrescription: true },
  { id: '8', name: 'Losartan 50mg', genericName: 'Losartan Potassium', category: 'ARB', uses: ['High blood pressure', 'Diabetic nephropathy', 'Heart failure'], sideEffects: ['Dizziness', 'Upper respiratory infection', 'Back pain'], warnings: ['Monitor potassium levels', 'Avoid in pregnancy', 'Do not combine with ACE inhibitors'], dosage: '50mg once daily', manufacturer: 'Losar/Unichem', price: 40, requiresPrescription: true },
  { id: '9', name: 'Azithromycin 250mg', genericName: 'Azithromycin', category: 'Antibiotic', uses: ['Bacterial infections', 'Respiratory infections', 'Skin infections', 'STIs'], sideEffects: ['Diarrhea', 'Nausea', 'Abdominal pain', 'QT prolongation'], warnings: ['Complete full course', 'Avoid in heart rhythm disorders'], dosage: '500mg day 1, then 250mg for 4 days', manufacturer: 'Azee/Cipla', price: 85, requiresPrescription: true },
  { id: '10', name: 'Pantoprazole 40mg', genericName: 'Pantoprazole Sodium', category: 'Proton Pump Inhibitor', uses: ['GERD', 'Erosive esophagitis', 'Zollinger-Ellison syndrome'], sideEffects: ['Headache', 'Nausea', 'Flatulence', 'Abdominal pain'], warnings: ['Long-term use may reduce B12', 'Take before meals'], dosage: '40mg once daily before breakfast', manufacturer: 'Pantop/Sun Pharma', price: 80, requiresPrescription: false },
  { id: '11', name: 'Dolo 650mg', genericName: 'Paracetamol 650mg', category: 'Analgesic', uses: ['Fever', 'Moderate pain', 'Post-vaccination fever'], sideEffects: ['Nausea', 'Rare allergic reactions'], warnings: ['Do not exceed 3g/day with other paracetamol products'], dosage: '650mg every 6-8 hours', manufacturer: 'Micro Labs', price: 28, requiresPrescription: false },
  { id: '12', name: 'Montair LC', genericName: 'Montelukast + Levocetirizine', category: 'Antiallergic', uses: ['Asthma', 'Allergic rhinitis', 'Seasonal allergies'], sideEffects: ['Headache', 'Drowsiness', 'Nausea', 'Upper respiratory tract infection'], warnings: ['Not for acute asthma attacks', 'Monitor mood changes'], dosage: 'One tablet daily at night', manufacturer: 'Cipla', price: 120, requiresPrescription: true },
  { id: '13', name: 'Metoprolol 50mg', genericName: 'Metoprolol Succinate', category: 'Beta-Blocker', uses: ['High blood pressure', 'Angina', 'Heart failure', 'Arrhythmia'], sideEffects: ['Fatigue', 'Dizziness', 'Cold extremities', 'Slow heart rate'], warnings: ['Do not stop suddenly', 'Avoid in asthma', 'Monitor heart rate'], dosage: '50mg once daily', manufacturer: 'Betaloc/AstraZeneca', price: 45, requiresPrescription: true },
  { id: '14', name: 'Glimepiride 2mg', genericName: 'Glimepiride', category: 'Sulfonylurea', uses: ['Type 2 Diabetes'], sideEffects: ['Hypoglycemia', 'Weight gain', 'Nausea', 'Dizziness'], warnings: ['Take with breakfast', 'Monitor blood sugar', 'Risk of hypoglycemia'], dosage: '2mg once daily with breakfast', manufacturer: 'Amaryl/Sanofi', price: 60, requiresPrescription: true },
  { id: '15', name: 'Aspirin 75mg', genericName: 'Acetylsalicylic Acid', category: 'Antiplatelet', uses: ['Heart attack prevention', 'Stroke prevention', 'Blood clot prevention'], sideEffects: ['GI bleeding', 'Heartburn', 'Easy bruising'], warnings: ['Avoid with bleeding disorders', 'Do not use in children < 16', 'Stop 7 days before surgery'], dosage: '75mg once daily', manufacturer: 'Ecosprin/USV', price: 15, requiresPrescription: true },
  { id: '16', name: 'Digoxin 0.25mg', genericName: 'Digoxin', category: 'Cardiac Glycoside', uses: ['Heart failure', 'Atrial fibrillation', 'Atrial flutter'], sideEffects: ['Nausea', 'Visual changes', 'Arrhythmias', 'Confusion'], warnings: ['Narrow therapeutic index', 'Monitor digoxin levels', 'Risk of toxicity with low potassium'], dosage: '0.125-0.25mg once daily', manufacturer: 'Lanoxin/GSK', price: 35, requiresPrescription: true },
  { id: '17', name: 'Warfarin 5mg', genericName: 'Warfarin Sodium', category: 'Anticoagulant', uses: ['Blood clot prevention', 'Deep vein thrombosis', 'Pulmonary embolism', 'Atrial fibrillation'], sideEffects: ['Bleeding', 'Bruising', 'Nausea', 'Hair loss (rare)'], warnings: ['Regular INR monitoring', 'Avoid vitamin K rich foods inconsistently', 'Many drug interactions'], dosage: '1-10mg daily based on INR', manufacturer: 'Warfarin/Cipla', price: 20, requiresPrescription: true },
  { id: '18', name: 'Insulin Glargine', genericName: 'Insulin Glargine', category: 'Insulin', uses: ['Type 1 Diabetes', 'Type 2 Diabetes (uncontrolled)'], sideEffects: ['Hypoglycemia', 'Injection site reactions', 'Weight gain', 'Lipodystrophy'], warnings: ['Do not mix with other insulins', 'Rotate injection sites', 'Monitor blood sugar'], dosage: 'Once daily injection as prescribed', manufacturer: 'Lantus/Sanofi', price: 1200, requiresPrescription: true },
  { id: '19', name: 'Levothyroxine 50mcg', genericName: 'Levothyroxine Sodium', category: 'Thyroid Hormone', uses: ['Hypothyroidism', 'Thyroid cancer (post-thyroidectomy)'], sideEffects: ['Palpitations', 'Tremors', 'Weight loss', 'Insomnia (if overdose)'], warnings: ['Take on empty stomach 30 min before food', 'Monitor TSH regularly', 'Many drug interactions'], dosage: '50mcg once daily, empty stomach', manufacturer: 'Thyrox/Abbott', price: 30, requiresPrescription: true },
  { id: '20', name: 'Salbutamol Inhaler', genericName: 'Salbutamol', category: 'Bronchodilator', uses: ['Asthma', 'COPD', 'Exercise-induced bronchospasm'], sideEffects: ['Tremors', 'Palpitations', 'Headache', 'Throat irritation'], warnings: ['Do not exceed recommended puffs', 'Rinse mouth after use', 'Seek medical attention if rescue inhaler used frequently'], dosage: '1-2 puffs as needed', manufacturer: 'Asthalin/Cipla', price: 150, requiresPrescription: false },
  { id: '21', name: 'Fluconazole 150mg', genericName: 'Fluconazole', category: 'Antifungal', uses: ['Vaginal candidiasis', 'Oral thrush', 'Fungal skin infections'], sideEffects: ['Nausea', 'Headache', 'Abdominal pain', 'Liver toxicity (rare)'], warnings: ['Avoid with liver disease', 'Monitor liver function with prolonged use', 'Drug interactions with warfarin'], dosage: '150mg single dose or as prescribed', manufacturer: 'Flucos/Cipla', price: 45, requiresPrescription: false },
  { id: '22', name: 'Domperidone 10mg', genericName: 'Domperidone', category: 'Prokinetic', uses: ['Nausea', 'Vomiting', 'Gastric motility disorders'], sideEffects: ['Dry mouth', 'Headache', 'Rash', 'Cardiac effects (high dose)'], warnings: ['Avoid in cardiac patients', 'Do not exceed 10mg TID', 'Short-term use preferred'], dosage: '10mg three times daily before meals', manufacturer: 'Domperone/Janssen', price: 30, requiresPrescription: false },
  { id: '23', name: 'Diazepam 5mg', genericName: 'Diazepam', category: 'Benzodiazepine', uses: ['Anxiety', 'Muscle spasm', 'Seizures', 'Alcohol withdrawal'], sideEffects: ['Drowsiness', 'Fatigue', 'Confusion', 'Dependency'], warnings: ['Risk of dependency', 'Do not combine with alcohol', 'Avoid long-term use', 'Do not stop abruptly'], dosage: '2-10mg two to four times daily', manufacturer: 'Valium/Roche', price: 40, requiresPrescription: true },
  { id: '24', name: 'Ramipril 5mg', genericName: 'Ramipril', category: 'ACE Inhibitor', uses: ['High blood pressure', 'Heart failure', 'Diabetic nephropathy', 'Post heart attack'], sideEffects: ['Dry cough', 'Dizziness', 'Hyperkalemia', 'Angioedema (rare)'], warnings: ['Monitor kidney function', 'Avoid in pregnancy', 'Report any swelling of face/lips'], dosage: '2.5-10mg once daily', manufacturer: 'Cardace/Sanofi', price: 50, requiresPrescription: true },
  { id: '25', name: 'Tramadol 50mg', genericName: 'Tramadol HCl', category: 'Opioid Analgesic', uses: ['Moderate to severe pain', 'Post-surgical pain', 'Chronic pain'], sideEffects: ['Nausea', 'Dizziness', 'Constipation', 'Drowsiness', 'Seizures (rare)'], warnings: ['Risk of dependency', 'Do not combine with SSRIs', 'Avoid alcohol', 'Do not drive'], dosage: '50-100mg every 4-6 hours (max 400mg/day)', manufacturer: 'Tramal/Cipla', price: 55, requiresPrescription: true },
  { id: '26', name: 'Spironolactone 25mg', genericName: 'Spironolactone', category: 'Potassium-Sparing Diuretic', uses: ['Heart failure', 'Edema', 'Hypertension', 'Ascites'], sideEffects: ['Hyperkalemia', 'Dizziness', 'Nausea', 'Gynecomastia (males)'], warnings: ['Monitor potassium levels', 'Avoid potassium supplements', 'Avoid in severe kidney disease'], dosage: '25-100mg daily', manufacturer: 'Aldactone/Pfizer', price: 35, requiresPrescription: true },
  { id: '27', name: 'Ciprofloxacin 500mg', genericName: 'Ciprofloxacin', category: 'Fluoroquinolone Antibiotic', uses: ['Urinary tract infections', 'Respiratory infections', 'Skin infections', 'Gastrointestinal infections'], sideEffects: ['Nausea', 'Diarrhea', 'Tendon pain', 'Photosensitivity'], warnings: ['Risk of tendon rupture', 'Avoid in children < 18', 'Take with plenty of water', 'Avoid dairy products near dose'], dosage: '250-500mg twice daily', manufacturer: 'Ciplox/Cipla', price: 70, requiresPrescription: true },
  { id: '28', name: 'Prednisolone 10mg', genericName: 'Prednisolone', category: 'Corticosteroid', uses: ['Asthma', 'Allergic conditions', 'Autoimmune conditions', 'Inflammation'], sideEffects: ['Increased appetite', 'Weight gain', 'Insomnia', 'Blood sugar elevation', 'Mood changes'], warnings: ['Do not stop abruptly', 'Monitor blood sugar', 'Risk of osteoporosis with long-term use', 'Avoid infections'], dosage: '5-60mg daily in divided doses', manufacturer: 'Predmet/Mankind', price: 25, requiresPrescription: true },
  { id: '29', name: 'Telmisartan 40mg', genericName: 'Telmisartan', category: 'ARB', uses: ['High blood pressure', 'Cardiovascular risk reduction'], sideEffects: ['Dizziness', 'Back pain', 'Diarrhea', 'Sinusitis'], warnings: ['Avoid in pregnancy', 'Monitor potassium', 'Not for use with ACE inhibitors'], dosage: '40-80mg once daily', manufacturer: 'Telsartan/Glenmark', price: 55, requiresPrescription: true },
  { id: '30', name: 'Gabapentin 300mg', genericName: 'Gabapentin', category: 'Anticonvulsant/Neuropathic', uses: ['Neuropathic pain', 'Epilepsy (adjunct)', 'Postherpetic neuralgia'], sideEffects: ['Drowsiness', 'Dizziness', 'Fatigue', 'Weight gain', 'Peripheral edema'], warnings: ['Do not stop abruptly', 'May cause respiratory depression with opioids', 'Dose adjustment in kidney disease'], dosage: '300-600mg three times daily', manufacturer: 'Gabapin/Intas', price: 40, requiresPrescription: true },
  { id: '31', name: 'Clopide 75mg', genericName: 'Clopidogrel', category: 'Antiplatelet', uses: ['Heart attack prevention', 'Stroke prevention', 'Peripheral artery disease'], sideEffects: ['Bleeding', 'Bruising', 'Diarrhea', 'Abdominal pain'], warnings: ['Stop 5-7 days before surgery', 'Avoid with PPIs (omeprazole)', 'Monitor for bleeding'], dosage: '75mg once daily', manufacturer: 'Clopide/USV', price: 35, requiresPrescription: true },
  { id: '32', name: 'Esomeprazole 40mg', genericName: 'Esomeprazole', category: 'Proton Pump Inhibitor', uses: ['GERD', 'Erosive esophagitis', 'H. pylori (triple therapy)', 'Zollinger-Ellison'], sideEffects: ['Headache', 'Abdominal pain', 'Nausea', 'Diarrhea'], warnings: ['Long-term use: B12/Magnesium deficiency', 'Take before meals'], dosage: '20-40mg once daily', manufacturer: 'Nexium/AstraZeneca', price: 110, requiresPrescription: false },
  { id: '33', name: 'Hydrochlorothiazide 12.5mg', genericName: 'Hydrochlorothiazide', category: 'Thiazide Diuretic', uses: ['High blood pressure', 'Edema', 'Heart failure'], sideEffects: ['Dizziness', 'Electrolyte imbalance', 'Increased urination', 'Photosensitivity'], warnings: ['Monitor electrolytes', 'Take in morning', 'Avoid in severe kidney disease'], dosage: '12.5-25mg once daily', manufacturer: 'Aquazide/Novartis', price: 20, requiresPrescription: true },
  { id: '34', name: 'Pregabalin 75mg', genericName: 'Pregabalin', category: 'Anticonvulsant/Neuropathic', uses: ['Neuropathic pain', 'Fibromyalgia', 'Epilepsy (adjunct)', 'Generalized anxiety'], sideEffects: ['Drowsiness', 'Weight gain', 'Dizziness', 'Blurred vision', 'Peripheral edema'], warnings: ['Risk of dependency', 'Do not stop abruptly', 'May impair driving'], dosage: '75-150mg twice daily', manufacturer: 'Pregabid/Sun Pharma', price: 95, requiresPrescription: true },
  { id: '35', name: 'Fluoxetine 20mg', genericName: 'Fluoxetine', category: 'SSRI Antidepressant', uses: ['Depression', 'OCD', 'Panic disorder', 'Bulimia nervosa'], sideEffects: ['Nausea', 'Insomnia', 'Anxiety', 'Sexual dysfunction', 'Headache'], warnings: ['Monitor for suicidal ideation', 'Avoid with MAOIs', '2-week washout before MAOIs'], dosage: '20mg once daily', manufacturer: 'Prozac/Lilly', price: 50, requiresPrescription: true },
  { id: '36', name: 'Clonazepam 0.5mg', genericName: 'Clonazepam', category: 'Benzodiazepine', uses: ['Seizures', 'Panic disorder', 'Anxiety', 'Restless leg syndrome'], sideEffects: ['Drowsiness', 'Dizziness', 'Memory problems', 'Dependency'], warnings: ['Risk of dependency', 'Do not combine with alcohol', 'Do not stop abruptly', 'Impairs driving'], dosage: '0.25-2mg daily in divided doses', manufacturer: 'Lonazep/Abbott', price: 35, requiresPrescription: true },
  { id: '37', name: 'Ondansetron 4mg', genericName: 'Ondansetron', category: 'Antiemetic', uses: ['Chemotherapy-induced nausea', 'Post-operative nausea', 'Pregnancy vomiting'], sideEffects: ['Headache', 'Constipation', 'Dizziness', 'Fatigue'], warnings: ['May prolong QT interval', 'Adjust dose in liver disease'], dosage: '4-8mg every 8 hours', manufacturer: 'Emeset/Cipla', price: 45, requiresPrescription: false },
  { id: '38', name: 'Deferasirox 500mg', genericName: 'Deferasirox', category: 'Iron Chelator', uses: ['Iron overload (thalassemia)', 'Transfusional hemosiderosis'], sideEffects: ['Nausea', 'Vomiting', 'Abdominal pain', 'Kidney toxicity', 'Liver toxicity'], warnings: ['Monitor kidney and liver function', 'Take on empty stomach', 'Serious skin reactions'], dosage: '20-40mg/kg/day', manufacturer: 'Exjade/Novartis', price: 3500, requiresPrescription: true },
  { id: '39', name: 'Clozapine 100mg', genericName: 'Clozapine', category: 'Atypical Antipsychotic', uses: ['Treatment-resistant schizophrenia'], sideEffects: ['Sedation', 'Weight gain', 'Drooling', 'Agranulocytosis (rare)'], warnings: ['Regular blood count monitoring mandatory', 'Risk of fatal myocarditis', 'Risk of seizures'], dosage: '12.5-100mg twice daily', manufacturer: 'Clozaril/Novartis', price: 150, requiresPrescription: true },
  { id: '40', name: 'Methotrexate 2.5mg', genericName: 'Methotrexate', category: 'DMARD/Antimetabolite', uses: ['Rheumatoid arthritis', 'Psoriasis', 'Certain cancers', 'Ectopic pregnancy'], sideEffects: ['Nausea', 'Mouth ulcers', 'Hair loss', 'Liver toxicity', 'Bone marrow suppression'], warnings: ['Monitor blood counts', 'Avoid alcohol', 'Supplement with folic acid', 'Contraception mandatory'], dosage: '7.5-25mg once weekly', manufacturer: 'Methotrexate/Pfizer', price: 80, requiresPrescription: true },
  { id: '41', name: 'Allopurinol 100mg', genericName: 'Allopurinol', category: 'Xanthine Oxidase Inhibitor', uses: ['Gout', 'Hyperuricemia', 'Kidney stones (uric acid)'], sideEffects: ['Rash', 'Nausea', 'Diarrhea', 'Liver function changes'], warnings: ['Start low in kidney disease', 'Take plenty of water', 'Avoid during acute gout attack'], dosage: '100-300mg once daily', manufacturer: 'Purinol/USV', price: 20, requiresPrescription: true },
  { id: '42', name: 'Sildenafil 50mg', genericName: 'Sildenafil Citrate', category: 'PDE5 Inhibitor', uses: ['Erectile dysfunction', 'Pulmonary arterial hypertension'], sideEffects: ['Headache', 'Flushing', 'Nasal congestion', 'Vision changes', 'Dizziness'], warnings: ['Do not combine with nitrates', 'Risk of hypotension', 'Seek immediate help for prolonged erection (>4hrs)'], dosage: '50mg 30-60 min before activity', manufacturer: 'Viagra/Pfizer', price: 250, requiresPrescription: true },
  { id: '43', name: 'Lamotrigine 50mg', genericName: 'Lamotrigine', category: 'Anticonvulsant/Mood Stabilizer', uses: ['Epilepsy', 'Bipolar disorder (maintenance)'], sideEffects: ['Rash (potentially serious)', 'Headache', 'Dizziness', 'Nausea'], warnings: ['Start very low and titrate slowly', 'Risk of Stevens-Johnson syndrome', 'Report any rash immediately'], dosage: '25-400mg daily in divided doses', manufacturer: 'Lamictal/GSK', price: 120, requiresPrescription: true },
  { id: '44', name: 'Acitretin 25mg', genericName: 'Acitretin', category: 'Retinoid', uses: ['Severe psoriasis', 'Disorders of keratinization'], sideEffects: ['Dry lips and skin', 'Hair thinning', 'Liver toxicity', 'Joint pain'], warnings: ['Teratogenic - avoid pregnancy 3 years after stopping', 'Monitor liver function and lipids', 'Avoid vitamin A supplements'], dosage: '25-50mg daily with food', manufacturer: 'Soriatane/Roche', price: 350, requiresPrescription: true },
  { id: '45', name: 'Sumatriptan 50mg', genericName: 'Sumatriptan', category: 'Triptan', uses: ['Migraine', 'Cluster headaches'], sideEffects: ['Tingling', 'Dizziness', 'Drowsiness', 'Nausea', 'Chest tightness'], warnings: ['Not for prophylaxis', 'Avoid with SSRIs/SNRIs', 'Risk of serotonin syndrome', 'Cardiac screening first'], dosage: '50-100mg at migraine onset', manufacturer: 'Imitrex/GSK', price: 180, requiresPrescription: true },
  { id: '46', name: 'Bisoprolol 5mg', genericName: 'Bisoprolol Fumarate', category: 'Beta-Blocker', uses: ['High blood pressure', 'Heart failure', 'Angina'], sideEffects: ['Fatigue', 'Dizziness', 'Cold extremities', 'Bradycardia'], warnings: ['Do not stop abruptly', 'Avoid in asthma', 'Monitor heart rate', 'Take in morning'], dosage: '2.5-10mg once daily', manufacturer: 'Bisoprol/Lupin', price: 30, requiresPrescription: true },
  { id: '47', name: 'Tamsulosin 0.4mg', genericName: 'Tamsulosin HCl', category: 'Alpha-Blocker', uses: ['Benign prostatic hyperplasia (BPH)', 'Kidney stone passage'], sideEffects: ['Dizziness', 'Postural hypotension', 'Retrograde ejaculation', 'Abnormal ejaculation'], warnings: ['Take 30 min after same meal each day', 'Risk of intraoperative floppy iris syndrome'], dosage: '0.4mg once daily 30 min after breakfast', manufacturer: 'Flomax/Boehringer', price: 90, requiresPrescription: true },
  { id: '48', name: 'Montelukast 10mg', genericName: 'Montelukast Sodium', category: 'Leukotriene Receptor Antagonist', uses: ['Asthma', 'Exercise-induced bronchospasm', 'Allergic rhinitis'], sideEffects: ['Headache', 'Upper respiratory infection', 'Abdominal pain', 'Cough'], warnings: ['Not for acute asthma attacks', 'Monitor for neuropsychiatric symptoms'], dosage: '10mg once daily at bedtime', manufacturer: 'Montair/Cipla', price: 75, requiresPrescription: false },
  { id: '49', name: 'Insulin Lispro', genericName: 'Insulin Lispro', category: 'Rapid-acting Insulin', uses: ['Type 1 Diabetes', 'Type 2 Diabetes (mealtime dosing)'], sideEffects: ['Hypoglycemia', 'Injection site reactions', 'Weight gain', 'Lipodystrophy'], warnings: ['Inject 15 min before meals', 'Rotate injection sites', 'Do not mix with NPH insulin'], dosage: 'Per sliding scale before meals', manufacturer: 'Humalog/Eli Lilly', price: 1500, requiresPrescription: true },
  { id: '50', name: 'Escitalopram 10mg', genericName: 'Escitalopram Oxalate', category: 'SSRI Antidepressant', uses: ['Depression', 'Generalized anxiety disorder', 'Panic disorder', 'OCD'], sideEffects: ['Nausea', 'Insomnia', 'Sexual dysfunction', 'Headache', 'Drowsiness'], warnings: ['Monitor for suicidal ideation', 'Avoid with MAOIs', 'Risk of QT prolongation at high doses'], dosage: '10-20mg once daily', manufacturer: 'Lexapro/Lundbeck', price: 65, requiresPrescription: true },
  { id: '51', name: 'Orlistat 60mg', genericName: 'Orlistat', category: 'Lipase Inhibitor', uses: ['Obesity management', 'Weight loss'], sideEffects: ['Oily stools', 'Flatulence', 'Fecal urgency', 'Fat-soluble vitamin deficiency'], warnings: ['Take with or up to 1 hour after meals', 'Supplement multivitamin 2 hours apart', 'Avoid high-fat meals'], dosage: '60mg three times daily with meals', manufacturer: 'Xenical/Roche', price: 200, requiresPrescription: false },
  { id: '52', name: 'Cyclosporine 100mg', genericName: 'Cyclosporine', category: 'Immunosuppressant', uses: ['Organ transplant rejection prevention', 'Severe rheumatoid arthritis', 'Psoriasis', 'Nephrotic syndrome'], sideEffects: ['Nephrotoxicity', 'Hypertension', 'Tremor', 'Gingival hyperplasia', 'Hirsutism'], warnings: ['Monitor kidney function', 'Monitor drug levels', 'Avoid grapefruit', 'Increased infection risk'], dosage: '2-5mg/kg/day in divided doses', manufacturer: 'Neoral/Novartis', price: 500, requiresPrescription: true },
];

const INTERACTION_DATABASE: Interaction[] = [
  { med1: 'Paracetamol 500mg', med2: 'Ibuprofen 400mg', severity: 'mild', description: 'Can be taken together but increases risk of stomach irritation. Generally considered safe when used short-term.', whatToWatch: 'Take ibuprofen with food. Monitor for stomach discomfort. Do not exceed recommended doses.', alternatives: ['Use Paracetamol alone if possible', 'Consider Diclofenac gel for localized pain'] },
  { med1: 'Metformin 500mg', med2: 'Omeprazole 20mg', severity: 'mild', description: 'PPIs may slightly reduce B12 absorption, which Metformin also affects. Long-term use of both may increase B12 deficiency risk.', whatToWatch: 'Monitor B12 levels annually. Consider B12 supplementation.', alternatives: ['Pantoprazole may have fewer interactions'] },
  { med1: 'Metformin 500mg', med2: 'Losartan 50mg', severity: 'safe', description: 'Generally safe to combine. Losartan may even provide renal protection for diabetic patients.', whatToWatch: 'Monitor kidney function and potassium levels periodically.', alternatives: [] },
  { med1: 'Amlodipine 5mg', med2: 'Metoprolol 50mg', severity: 'moderate', description: 'Both lower blood pressure and heart rate. Combination may cause excessive hypotension and bradycardia.', whatToWatch: 'Monitor blood pressure and heart rate regularly. Watch for dizziness, lightheadedness, fainting.', alternatives: ['Consider Losartan as alternative to one of these', 'Dose adjustment may be needed'] },
  { med1: 'Aspirin 75mg', med2: 'Warfarin 5mg', severity: 'severe', description: 'Significantly increased risk of bleeding. Both affect clotting mechanisms through different pathways.', whatToWatch: 'Monitor INR very closely. Watch for unusual bleeding, bruising, dark stools. This combination requires careful medical supervision.', alternatives: ['Use Clopidogrel as alternative to Aspirin', 'Consider DOACs instead of Warfarin'] },
  { med1: 'Omeprazole 20mg', med2: 'Clopide 75mg', severity: 'moderate', description: 'Omeprazole may reduce the antiplatelet effect of Clopidogrel by inhibiting CYP2C19 activation.', whatToWatch: 'If both needed, take Clopidogrel 2 hours before Omeprazole. Monitor cardiovascular events.', alternatives: ['Switch to Pantoprazole (fewer CYP2C19 interactions)', 'Consider H2 blockers like Ranitidine'] },
  { med1: 'Ibuprofen 400mg', med2: 'Losartan 50mg', severity: 'moderate', description: 'NSAIDs can reduce the antihypertensive effect of ARBs and increase risk of kidney damage.', whatToWatch: 'Avoid long-term NSAID use with Losartan. Monitor blood pressure more frequently. Consider short-term use only.', alternatives: ['Use Paracetamol for pain instead', 'Topical NSAIDs like Diclofenac gel'] },
  { med1: 'Metformin 500mg', med2: 'Glimepiride 2mg', severity: 'mild', description: 'Common combination for diabetes. Additive blood sugar lowering effect, so monitoring is important.', whatToWatch: 'Monitor blood sugar closely, especially initially. Risk of hypoglycemia, especially if meals are skipped.', alternatives: [] },
  { med1: 'Amlodipine 5mg', med2: 'Atorvastatin 10mg', severity: 'safe', description: 'Common and well-studied combination. Often used together for patients with hypertension and high cholesterol.', whatToWatch: 'Monitor for muscle pain (atorvastatin). Regular lipid panel and blood pressure checks.', alternatives: [] },
  { med1: 'Fluoxetine 20mg', med2: 'Tramadol 50mg', severity: 'severe', description: 'Risk of serotonin syndrome - a potentially life-threatening condition. Both increase serotonin levels.', whatToWatch: 'Avoid combination. Symptoms of serotonin syndrome: agitation, hallucinations, rapid heart rate, fever, muscle stiffness, nausea.', alternatives: ['Use Paracetamol or Gabapentin for pain instead of Tramadol'] },
  { med1: 'Diazepam 5mg', med2: 'Alcohol', severity: 'contraindicated', description: 'Both are CNS depressants. Combined use can cause severe sedation, respiratory depression, coma, or death.', whatToWatch: 'Absolutely avoid alcohol while taking Diazepam. Even small amounts are dangerous.', alternatives: ['Consider non-benzodiazepine options for anxiety (Buspirone)'] },
  { med1: 'Warfarin 5mg', med2: 'Fluconazole 150mg', severity: 'severe', description: 'Fluconazole inhibits CYP2C9, significantly increasing Warfarin levels and INR. High risk of bleeding.', whatToWatch: 'Avoid combination if possible. If necessary, reduce Warfarin dose and monitor INR daily.', alternatives: ['Use topical antifungal if possible', 'Consider Itraconazole instead of Fluconazole'] },
  { med1: 'Cetirizine 10mg', med2: 'Diazepam 5mg', severity: 'moderate', description: 'Both cause CNS depression. Combined use may cause excessive drowsiness and impaired coordination.', whatToWatch: 'Avoid driving. Start with lower doses. Monitor for excessive sedation.', alternatives: ['Use Cetirizine in morning and Diazepam at night', 'Consider Loratadine (less sedating antihistamine)'] },
  { med1: 'Losartan 50mg', med2: 'Spironolactone 25mg', severity: 'severe', description: 'Both increase potassium levels. Combined use significantly increases risk of dangerous hyperkalemia.', whatToWatch: 'Monitor potassium levels closely. Avoid potassium supplements. Watch for muscle weakness, palpitations.', alternatives: ['Use Hydrochlorothiazide instead of Spironolactone', 'Use Amlodipine instead of Losartan'] },
  { med1: 'Metoprolol 50mg', med2: 'Salbutamol Inhaler', severity: 'mild', description: 'Beta-blockers may reduce the effectiveness of Salbutamol. Salbutamol may also cause tachycardia counteracting Metoprolol.', whatToWatch: 'Use cardioselective beta-blockers (as Metoprolol is). Monitor breathing and heart rate. Inform your doctor.', alternatives: ['Consider alternatives to beta-blockers', 'Use inhaled steroids for asthma maintenance'] },
  { med1: 'Paracetamol 500mg', med2: 'Warfarin 5mg', severity: 'mild', description: 'Regular Paracetamol use may slightly increase INR. Single doses are generally safe.', whatToWatch: 'Limit Paracetamol to <2g/day with Warfarin. Monitor INR if using regularly.', alternatives: [] },
  { med1: 'Pantoprazole 40mg', med2: 'Levothyroxine 50mcg', severity: 'moderate', description: 'PPIs reduce stomach acid needed for Levothyroxine absorption. Can reduce Levothyroxine effectiveness by up to 30%.', whatToWatch: 'Take Levothyroxine at least 4 hours before Pantoprazole. Monitor TSH regularly.', alternatives: ['Consider H2 blockers for acid if possible'] },
  { med1: 'Gabapentin 300mg', med2: 'Diazepam 5mg', severity: 'moderate', description: 'Both are CNS depressants. Combined use may cause excessive sedation, respiratory depression, and cognitive impairment.', whatToWatch: 'Start with lowest effective doses. Monitor for excessive drowsiness and breathing difficulties. Avoid driving.', alternatives: ['Use one CNS depressant at a time if possible'] },
  { med1: 'Ciprofloxacin 500mg', med2: 'Omeprazole 20mg', severity: 'mild', description: 'Ciprofloxacin absorption may be slightly reduced by PPIs due to pH-dependent solubility.', whatToWatch: 'Take Ciprofloxacin 2 hours before or 6 hours after Omeprazole.', alternatives: ['Consider taking PPI at bedtime and Ciprofloxacin in the morning'] },
  { med1: 'Prednisolone 10mg', med2: 'Glimepiride 2mg', severity: 'moderate', description: 'Corticosteroids increase blood sugar, counteracting the effect of antidiabetics.', whatToWatch: 'Monitor blood sugar very closely during Prednisolone course. May need temporary insulin dose increase.', alternatives: ['Monitor and adjust diabetic medication accordingly'] },
  { med1: 'Metformin 500mg', med2: 'Aspirin 75mg', severity: 'safe', description: 'Safe combination often used in diabetic patients for cardiovascular protection.', whatToWatch: 'Monitor for any GI symptoms. Standard monitoring is sufficient.', alternatives: [] },
  { med1: 'Amlodipine 5mg', med2: 'Ibuprofen 400mg', severity: 'moderate', description: 'NSAIDs can reduce antihypertensive effect of Amlodipine and increase cardiovascular risk.', whatToWatch: 'Short-term NSAID use only. Monitor blood pressure. Use lowest effective dose.', alternatives: ['Use Paracetamol instead', 'Topical NSAIDs'] },
  { med1: 'Ramipril 5mg', med2: 'Spironolactone 25mg', severity: 'severe', description: 'Both increase potassium levels. High risk of life-threatening hyperkalemia.', whatToWatch: 'Monitor potassium and kidney function closely. Avoid potassium supplements. This combination requires careful medical supervision.', alternatives: ['Use Hydrochlorothiazide instead of Spironolactone'] },
  { med1: 'Cetirizine 10mg', med2: 'Montair LC', severity: 'mild', description: 'Both have antihistamine properties. Combined use may increase sedation without much added benefit.', whatToWatch: 'Use one antihistamine at a time unless directed otherwise. Monitor for drowsiness.', alternatives: ['Choose one: Cetirizine OR Montair LC'] },
  { med1: 'Fluoxetine 20mg', med2: 'Ondansetron 4mg', severity: 'moderate', description: 'Both can affect serotonin levels. Combined use slightly increases risk of serotonin syndrome.', whatToWatch: 'Use low doses. Monitor for agitation, tremor, rapid heart rate. Usually safe at standard doses.', alternatives: ['Domperidone for nausea instead'] },
  { med1: 'Levothyroxine 50mcg', med2: 'Calcium supplement', severity: 'moderate', description: 'Calcium supplements can reduce Levothyroxine absorption by up to 40%.', whatToWatch: 'Take Levothyroxine at least 4 hours before calcium supplements.', alternatives: ['Take calcium at bedtime'] },
  { med1: 'Clonazepam 0.5mg', med2: 'Fluoxetine 20mg', severity: 'moderate', description: 'Combined CNS depression and possible increased benzodiazepine levels.', whatToWatch: 'Start with lowest doses. Monitor for excessive sedation. Avoid alcohol.', alternatives: ['Consider Buspirone for anxiety instead of Clonazepam'] },
  { med1: 'Cyclosporine 100mg', med2: 'Fluconazole 150mg', severity: 'severe', description: 'Fluconazole significantly increases Cyclosporine levels through CYP3A4 inhibition. Risk of nephrotoxicity.', whatToWatch: 'Monitor Cyclosporine drug levels and kidney function closely. Dose reduction may be necessary.', alternatives: ['Consider topical antifungal', 'Use alternative immunosuppressant'] },
  { med1: 'Pregabalin 75mg', med2: 'Clonazepam 0.5mg', severity: 'severe', description: 'Both are CNS depressants with high risk of respiratory depression and excessive sedation.', whatToWatch: 'Avoid combination if possible. If necessary, use lowest doses and monitor breathing.', alternatives: ['Choose one for neuropathic pain/anxiety'] },
  { med1: 'Escitalopram 10mg', med2: 'Tramadol 50mg', severity: 'severe', description: 'High risk of serotonin syndrome. Both increase serotonergic activity.', whatToWatch: 'Avoid combination. If unavoidable, monitor closely for serotonin syndrome symptoms.', alternatives: ['Use Paracetamol or Gabapentin instead of Tramadol'] },
  { med1: 'Tamsulosin 0.4mg', med2: 'Amlodipine 5mg', severity: 'mild', description: 'Both can lower blood pressure. Additive hypotensive effect possible.', whatToWatch: 'Monitor blood pressure, especially when standing up. Rise slowly from sitting/lying.', alternatives: [] },
  { med1: 'Lamotrigine 50mg', med2: 'OCP', severity: 'mild', description: 'Lamotrigine levels may be reduced by oral contraceptives, and vice versa.', whatToWatch: 'Monitor Lamotrigine levels. May need dose adjustment. Consider alternative contraception.', alternatives: ['IUD or progesterone-only pill'] },
];

const SEVERITY_CONFIG = {
  safe: { label: 'Safe', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', icon: FiCheckCircle },
  mild: { label: 'Mild', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: FiInfo },
  moderate: { label: 'Moderate', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: FiAlertTriangle },
  severe: { label: 'Severe', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: FiAlertTriangle },
  contraindicated: { label: 'Contraindicated', color: 'text-red-500', bg: 'bg-red-500/20', border: 'border-red-500/50', icon: FiAlertTriangle },
};

export default function MedicineInteractionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedicines, setSelectedMedicines] = useState<MedicineInfo[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [expandedMed, setExpandedMed] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const filteredMedicines = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return MEDICINE_DATABASE.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.genericName.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q)
    ).filter(m => !selectedMedicines.some(s => s.id === m.id)).slice(0, 8);
  }, [searchQuery, selectedMedicines]);

  const addMedicine = (med: MedicineInfo) => {
    setSelectedMedicines(prev => [...prev, med]);
    setSearchQuery('');
    setShowResults(false);
  };

  const removeMedicine = (id: string) => {
    setSelectedMedicines(prev => prev.filter(m => m.id !== id));
    setShowResults(false);
    setInteractions([]);
  };

  const checkInteractions = () => {
    const found: Interaction[] = [];
    for (let i = 0; i < selectedMedicines.length; i++) {
      for (let j = i + 1; j < selectedMedicines.length; j++) {
        const m1 = selectedMedicines[i];
        const m2 = selectedMedicines[j];
        const interaction = INTERACTION_DATABASE.find(
          (inter) =>
            (inter.med1 === m1.name && inter.med2 === m2.name) ||
            (inter.med1 === m2.name && inter.med2 === m1.name)
        );
        if (interaction) found.push(interaction);
      }
    }
    setInteractions(found);
    setShowResults(true);
  };

  const getOverallSafety = () => {
    if (interactions.length === 0) return { score: 100, label: 'Excellent', color: 'text-green-400' };
    const severityScores = { safe: 100, mild: 75, moderate: 50, severe: 20, contraindicated: 0 };
    const avg = interactions.reduce((sum, i) => sum + severityScores[i.severity], 0) / interactions.length;
    if (avg >= 80) return { score: avg, label: 'Good', color: 'text-green-400' };
    if (avg >= 50) return { score: avg, label: 'Caution', color: 'text-yellow-400' };
    if (avg >= 25) return { score: avg, label: 'Warning', color: 'text-orange-400' };
    return { score: avg, label: 'Danger', color: 'text-red-400' };
  };

  const generateSummary = () => {
    const safety = getOverallSafety();
    let text = `ZyntraCare Medicine Interaction Report\n${'='.repeat(40)}\n`;
    text += `Date: ${new Date().toLocaleDateString('en-IN')}\n\n`;
    text += `MEDICINES (${selectedMedicines.length}):\n`;
    selectedMedicines.forEach(m => { text += `• ${m.name} (${m.genericName}) - ${m.category}\n`; });
    text += `\nINTERACTIONS FOUND: ${interactions.length}\n`;
    text += `Overall Safety: ${safety.label} (${Math.round(safety.score)}%)\n\n`;
    if (interactions.length > 0) {
      interactions.forEach((inter, i) => {
        text += `${i + 1}. [${SEVERITY_CONFIG[inter.severity].label}] ${inter.med1} + ${inter.med2}\n`;
        text += `   ${inter.description}\n`;
        text += `   Watch: ${inter.whatToWatch}\n\n`;
      });
    } else {
      text += 'No significant interactions found.\n';
    }
    text += '\nDisclaimer: This is an AI-generated report. Always consult your doctor.';
    return text;
  };

  const shareWithDoctor = () => {
    const summary = generateSummary();
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const safety = showResults ? getOverallSafety() : null;

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-pink-900/10" />
        <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl mb-6">
            <FiActivity size={32} className="text-purple-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Medicine <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Interaction Checker</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Check for dangerous interactions between your medicines. Search from 50+ common Indian medicines.
          </p>
        </motion.div>

        {/* Search & Add */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <FiSearch className="text-purple-400" /> Add Medicines
          </h2>

          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
              onFocus={() => setShowResults(true)}
              placeholder="Search by name, generic name, or category (e.g., Paracetamol, NSAID, Diabetes)..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition text-lg"
            />

            <AnimatePresence>
              {showResults && filteredMedicines.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl">
                  {filteredMedicines.map(med => (
                    <button
                      key={med.id}
                      onClick={() => addMedicine(med)}
                      className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/10 transition text-left border-b border-white/5 last:border-0"
                    >
                      <div>
                        <p className="font-bold">{med.name}</p>
                        <p className="text-sm text-gray-400">{med.genericName} • {med.category}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {med.requiresPrescription && (
                          <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">Rx</span>
                        )}
                        <FiPlus className="text-purple-400" size={20} />
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {selectedMedicines.length > 0 && (
            <div className="mt-6">
              <p className="text-sm text-gray-400 mb-3">{selectedMedicines.length} medicine{selectedMedicines.length !== 1 ? 's' : ''} selected</p>
              <div className="flex flex-wrap gap-2">
                {selectedMedicines.map(med => (
                  <motion.div key={med.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-xl px-4 py-2">
                    <span className="font-medium">{med.name}</span>
                    <button onClick={() => removeMedicine(med.id)} className="text-gray-400 hover:text-red-400 transition">
                      <FiX size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>

              {selectedMedicines.length >= 2 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={checkInteractions}
                  className="mt-6 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold transition flex items-center gap-2"
                >
                  <FiShield size={18} /> Check Interactions
                </motion.button>
              )}
            </div>
          )}
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {showResults && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {/* Safety Score */}
              {safety && (
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="text-center">
                      <div className="relative w-32 h-32">
                        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                          <circle cx="60" cy="60" r="50" fill="none"
                            stroke={safety.score >= 75 ? '#4ade80' : safety.score >= 50 ? '#facc15' : safety.score >= 25 ? '#fb923c' : '#ef4444'}
                            strokeWidth="10" strokeLinecap="round"
                            strokeDasharray={`${(safety.score / 100) * 314} 314`} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-3xl font-black ${safety.color}`}>{Math.round(safety.score)}%</span>
                          <span className="text-xs text-gray-400">Safe</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black mb-2">Overall Safety: <span className={safety.color}>{safety.label}</span></h3>
                      <p className="text-gray-400">
                        {interactions.length === 0
                          ? 'No interactions found between your selected medicines.'
                          : `Found ${interactions.length} interaction${interactions.length !== 1 ? 's' : ''} between your medicines.`
                        }
                      </p>
                      {interactions.length > 0 && (
                        <div className="flex gap-3 mt-4 flex-wrap">
                          {['severe', 'moderate', 'mild', 'safe'].map(sev => {
                            const count = interactions.filter(i => i.severity === sev).length;
                            if (count === 0) return null;
                            const cfg = SEVERITY_CONFIG[sev as keyof typeof SEVERITY_CONFIG];
                            return (
                              <span key={sev} className={`text-sm px-3 py-1 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                                {cfg.label}: {count}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <button onClick={shareWithDoctor}
                      className="px-6 py-3 bg-white/10 hover:bg-white/15 rounded-xl font-medium transition flex items-center gap-2 whitespace-nowrap">
                      {copied ? <FiCheck size={18} className="text-green-400" /> : <FiShare2 size={18} />}
                      {copied ? 'Copied!' : 'Share with Doctor'}
                    </button>
                  </div>
                </div>
              )}

              {/* Interaction Cards */}
              {interactions.length > 0 && (
                <div className="space-y-4 mb-8">
                  {interactions.sort((a, b) => {
                    const order = { contraindicated: 0, severe: 1, moderate: 2, mild: 3, safe: 4 };
                    return order[a.severity] - order[b.severity];
                  }).map((inter, idx) => {
                    const cfg = SEVERITY_CONFIG[inter.severity];
                    const Icon = cfg.icon;
                    return (
                      <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`p-6 rounded-2xl border ${cfg.bg} ${cfg.border}`}>
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cfg.bg}`}>
                            <Icon size={24} className={cfg.color} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <span className={`text-xs font-bold px-3 py-1 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                                {cfg.label}
                              </span>
                              <h3 className="font-bold text-lg">{inter.med1} + {inter.med2}</h3>
                            </div>
                            <p className="text-gray-300 mb-3">{inter.description}</p>
                            <div className="bg-black/20 rounded-xl p-4 mb-3">
                              <p className="text-sm font-bold text-yellow-400 mb-1">What to Watch For:</p>
                              <p className="text-sm text-gray-300">{inter.whatToWatch}</p>
                            </div>
                            {inter.alternatives.length > 0 && (
                              <div>
                                <p className="text-sm font-bold text-purple-400 mb-1">Suggested Alternatives:</p>
                                <ul className="text-sm text-gray-300 list-disc list-inside">
                                  {inter.alternatives.map((alt, ai) => <li key={ai}>{alt}</li>)}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Medicine Info Cards */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <FiInfo className="text-purple-400" /> Medicine Information
                </h2>
                <div className="space-y-3">
                  {selectedMedicines.map(med => (
                    <div key={med.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => setExpandedMed(expandedMed === med.id ? null : med.id)}
                        className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/5 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                            <span className="text-lg">💊</span>
                          </div>
                          <div className="text-left">
                            <p className="font-bold">{med.name}</p>
                            <p className="text-sm text-gray-400">{med.genericName} • {med.manufacturer}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-400 font-bold">₹{med.price}</span>
                          {med.requiresPrescription && (
                            <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">Rx Required</span>
                          )}
                        </div>
                      </button>
                      <AnimatePresence>
                        {expandedMed === med.id && (
                          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                            className="overflow-hidden border-t border-white/10">
                            <div className="px-5 py-4 grid sm:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-bold text-purple-400 mb-1">Uses</p>
                                <div className="flex flex-wrap gap-1">
                                  {med.uses.map((use, i) => (
                                    <span key={i} className="text-xs bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-full">{use}</span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-blue-400 mb-1">Dosage</p>
                                <p className="text-sm text-gray-300">{med.dosage}</p>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-yellow-400 mb-1">Side Effects</p>
                                <p className="text-sm text-gray-300">{med.sideEffects.join(', ')}</p>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-red-400 mb-1">Warnings</p>
                                <p className="text-sm text-gray-300">{med.warnings.join(', ')}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Common Combinations Quick Info */}
        {!showResults && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FiAlertTriangle className="text-yellow-400" /> Common Dangerous Combinations in India
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {INTERACTION_DATABASE.filter(i => i.severity === 'severe' || i.severity === 'contraindicated').slice(0, 6).map((inter, idx) => {
                const cfg = SEVERITY_CONFIG[inter.severity];
                return (
                  <div key={idx} className={`p-4 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <p className="font-bold text-sm">{inter.med1}</p>
                    <p className="text-gray-400 text-xs">+</p>
                    <p className="font-bold text-sm">{inter.med2}</p>
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">{inter.description}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
