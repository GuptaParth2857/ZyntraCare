'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiFileText, FiCheckCircle, FiAlertTriangle, FiTrendingUp, FiDownload, FiShare2, FiActivity, FiHeart, FiZap, FiClock, FiBarChart2, FiBook, FiSearch, FiX, FiInfo, FiChevronUp, FiChevronDown } from 'react-icons/fi';

interface LabParameter {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'low' | 'high' | 'critical';
  explanation: string;
}

interface HealthReport {
  reportType: string;
  labName: string;
  reportDate: string;
  patientName: string;
  patientAge: number;
  healthScore: number;
  overallSummary: string;
  parameters: LabParameter[];
  riskFlags: RiskFlag[];
  recommendations: string[];
}

interface RiskFlag {
  name: string;
  severity: 'low' | 'moderate' | 'high';
  description: string;
  action: string;
}

interface TrendData {
  month: string;
  parameters: { name: string; value: number }[];
}

const MOCK_REPORTS: Record<string, HealthReport> = {
  'Blood Test': {
    reportType: 'Complete Blood Count (CBC) + Lipid Profile',
    labName: 'Thyrocare Technologies Ltd.',
    reportDate: '2026-08-18',
    patientName: 'Rajesh Kumar Sharma',
    patientAge: 42,
    healthScore: 72,
    overallSummary: 'Your blood work shows mostly normal values with mildly elevated cholesterol and slightly low Vitamin D. Liver and kidney functions are within normal range. No signs of infection or anemia.',
    parameters: [
      { name: 'Hemoglobin', value: '13.8', unit: 'g/dL', referenceRange: '13.0 - 17.0', status: 'normal', explanation: 'Your hemoglobin is well within normal range, indicating good oxygen-carrying capacity. No signs of anemia.' },
      { name: 'Total WBC Count', value: '7200', unit: '/cmm', referenceRange: '4000 - 11000', status: 'normal', explanation: 'White blood cell count is normal. Your immune system appears healthy with no signs of active infection.' },
      { name: 'Platelet Count', value: '245000', unit: '/cmm', referenceRange: '150000 - 400000', status: 'normal', explanation: 'Platelet count is normal, meaning your blood clotting mechanism is functioning properly.' },
      { name: 'Total Cholesterol', value: '238', unit: 'mg/dL', referenceRange: '< 200', status: 'high', explanation: 'Your total cholesterol is above the desirable limit. This increases risk of heart disease. Diet modification and exercise recommended.' },
      { name: 'LDL Cholesterol', value: '156', unit: 'mg/dL', referenceRange: '< 100', status: 'high', explanation: 'LDL ("bad cholesterol") is significantly elevated. This contributes to plaque buildup in arteries. Statins or lifestyle changes may be needed.' },
      { name: 'HDL Cholesterol', value: '42', unit: 'mg/dL', referenceRange: '> 40', status: 'normal', explanation: 'HDL ("good cholesterol") is at the lower end of normal. Regular exercise can help raise this level.' },
      { name: 'Triglycerides', value: '185', unit: 'mg/dL', referenceRange: '< 150', status: 'high', explanation: 'Triglycerides are elevated. This is often linked to high carbohydrate intake, sugar, or alcohol. Reduce refined carbs.' },
      { name: 'Fasting Blood Sugar', value: '98', unit: 'mg/dL', referenceRange: '70 - 100', status: 'normal', explanation: 'Your fasting glucose is normal. No signs of diabetes or pre-diabetes at this time.' },
      { name: 'HbA1c', value: '5.6', unit: '%', referenceRange: '< 5.7', status: 'normal', explanation: 'HbA1c indicates average blood sugar over 3 months. Your value is normal, below the pre-diabetes threshold.' },
      { name: 'Vitamin D', value: '18', unit: 'ng/mL', referenceRange: '30 - 100', status: 'low', explanation: 'Vitamin D is deficient. This can cause bone pain, fatigue, and weakened immunity. Supplementation of 60,000 IU/week recommended.' },
      { name: 'Serum Creatinine', value: '0.9', unit: 'mg/dL', referenceRange: '0.6 - 1.2', status: 'normal', explanation: 'Kidney function is normal. Creatinine level indicates healthy filtration rate.' },
      { name: 'SGPT (ALT)', value: '32', unit: 'U/L', referenceRange: '5 - 40', status: 'normal', explanation: 'Liver enzyme is within normal limits. No signs of liver damage or hepatitis.' },
    ],
    riskFlags: [
      { name: 'High Cholesterol', severity: 'moderate', description: 'Total cholesterol 238 mg/dL with LDL at 156 mg/dL increases cardiovascular risk.', action: 'Consider low-fat diet, 30 min daily exercise, and consult cardiologist if levels persist above 240.' },
      { name: 'Vitamin D Deficiency', severity: 'moderate', description: 'Level at 18 ng/mL is below the optimal 30 ng/mL threshold.', action: 'Start Vitamin D3 supplementation (60,000 IU weekly for 8 weeks). Re-test after 3 months.' },
      { name: 'Elevated Triglycerides', severity: 'low', description: 'Triglycerides at 185 mg/dL suggest dietary adjustments needed.', action: 'Reduce sugar and refined carbohydrate intake. Increase omega-3 fatty acids (fish, walnuts).' },
    ],
    recommendations: [
      'Start a heart-healthy diet: reduce saturated fats, increase fiber intake (oats, fruits, vegetables)',
      'Exercise for at least 30 minutes daily — brisk walking, cycling, or swimming',
      'Take Vitamin D3 supplement: 60,000 IU once weekly for 8 weeks, then maintenance dose',
      'Reduce refined sugar and processed food intake',
      'Re-test lipid profile after 3 months of lifestyle changes',
      'Consult a cardiologist if LDL remains above 160 mg/dL',
      'Include fatty fish (salmon, mackerel) twice a week for omega-3',
    ],
  },
  'Urine': {
    reportType: 'Routine Urinalysis',
    labName: 'Dr. Lal PathLabs Pvt. Ltd.',
    reportDate: '2026-08-15',
    patientName: 'Rajesh Kumar Sharma',
    patientAge: 42,
    healthScore: 88,
    overallSummary: 'Your urine report is largely normal with trace ketones which may indicate fasting or low-carb diet. No infection, no sugar, no protein in urine. Kidney function indicators are healthy.',
    parameters: [
      { name: 'Color', value: 'Pale Yellow', unit: '', referenceRange: 'Pale to Deep Yellow', status: 'normal', explanation: 'Normal color indicates adequate hydration. Darker color would suggest dehydration.' },
      { name: 'Appearance', value: 'Clear', unit: '', referenceRange: 'Clear', status: 'normal', explanation: 'Clear urine indicates no turbidity or suspended particles. No signs of infection.' },
      { name: 'pH', value: '6.0', unit: '', referenceRange: '4.5 - 8.0', status: 'normal', explanation: 'Slightly acidic pH is normal for an average Indian diet. No concern.' },
      { name: 'Specific Gravity', value: '1.018', unit: '', referenceRange: '1.005 - 1.030', status: 'normal', explanation: 'Kidney concentration ability is normal. Good hydration level.' },
      { name: 'Glucose', value: 'Absent', unit: '', referenceRange: 'Absent', status: 'normal', explanation: 'No glucose in urine — consistent with normal blood sugar levels. No diabetes indicators.' },
      { name: 'Protein', value: 'Absent', unit: '', referenceRange: 'Absent', status: 'normal', explanation: 'No protein detected. Kidney filtration is functioning properly.' },
      { name: 'Ketones', value: 'Trace', unit: '', referenceRange: 'Absent', status: 'low', explanation: 'Trace ketones may indicate fasting, low-carb diet, or prolonged exercise. Usually not concerning if trace.' },
      { name: 'Blood', value: 'Absent', unit: '', referenceRange: 'Absent', status: 'normal', explanation: 'No blood in urine. No signs of kidney stones, UTI, or bladder issues.' },
      { name: 'Urobilinogen', value: '0.2', unit: 'mg/dL', referenceRange: '0.1 - 1.0', status: 'normal', explanation: 'Normal liver function indicator. No signs of liver disease or hemolysis.' },
    ],
    riskFlags: [
      { name: 'Trace Ketones', severity: 'low', description: 'Small amount of ketones detected, possibly from fasting or low-carb diet.', action: 'Ensure regular meals with adequate carbohydrates. If persistent, check blood sugar levels.' },
    ],
    recommendations: [
      'Maintain adequate hydration — drink at least 2.5 liters of water daily',
      'Ensure regular meals to avoid ketone buildup from fasting',
      'No medical treatment required based on this report',
      'Annual urinalysis recommended for routine health monitoring',
    ],
  },
  'X-Ray': {
    reportType: 'Chest X-Ray (PA View)',
    labName: 'Fortis Memorial Research Institute',
    reportDate: '2026-08-12',
    patientName: 'Rajesh Kumar Sharma',
    patientAge: 42,
    healthScore: 82,
    overallSummary: 'Chest X-ray shows clear lung fields with no active pathology. Mild cardiomegaly noted which may be positional. No pleural effusion, consolidation, or pneumothorax. Bony thorax is intact.',
    parameters: [
      { name: 'Lung Fields', value: 'Clear bilaterally', unit: '', referenceRange: 'Clear', status: 'normal', explanation: 'Both lung fields are well-expanded and clear. No signs of pneumonia, tuberculosis, or lung disease.' },
      { name: 'Heart Size', value: 'Mildly enlarged', unit: '', referenceRange: 'Normal', status: 'low', explanation: 'Cardiothoracic ratio appears mildly increased. May be positional or indicate early cardiomegaly. Correlation with echocardiogram recommended.' },
      { name: 'Mediastinum', value: 'Normal', unit: '', referenceRange: 'Normal', status: 'normal', explanation: 'Mediastinal contours are normal. No widened mediastinum or lymphadenopathy.' },
      { name: 'Trachea', value: 'Central', unit: '', referenceRange: 'Central', status: 'normal', explanation: 'Trachea is centrally located. No deviation suggesting mass or collapse.' },
      { name: 'Diaphragm', value: 'Normal bilaterally', unit: '', referenceRange: 'Normal', status: 'normal', explanation: 'Both domes of diaphragm are well-defined and at normal position. Costophrenic angles are clear.' },
      { name: 'Bony Thorax', value: 'Intact', unit: '', referenceRange: 'Intact', status: 'normal', explanation: 'No fractures, lesions, or bony abnormalities detected in ribs, clavicle, or spine.' },
    ],
    riskFlags: [
      { name: 'Mild Cardiomegaly', severity: 'moderate', description: 'Heart shadow appears mildly enlarged on X-ray.', action: 'Get an echocardiogram to assess actual heart size and function. Monitor blood pressure regularly.' },
    ],
    recommendations: [
      'Get an echocardiogram (2D Echo) to evaluate heart size and function',
      'Monitor blood pressure weekly — maintain below 130/80 mmHg',
      'Regular cardiovascular exercise (walking 30 min/day)',
      'Follow up with cardiologist if symptoms like breathlessness or chest pain occur',
      'Annual chest X-ray for routine monitoring',
    ],
  },
  'ECG': {
    reportType: '12-Lead Electrocardiogram (ECG)',
    labName: 'Apollo Hospitals, Chennai',
    reportDate: '2026-08-10',
    patientName: 'Rajesh Kumar Sharma',
    patientAge: 42,
    healthScore: 76,
    overallSummary: 'ECG shows normal sinus rhythm with rate of 78 bpm. No ST-T changes, no arrhythmia. PR interval and QRS duration are within normal limits. Mild left axis deviation noted.',
    parameters: [
      { name: 'Heart Rate', value: '78', unit: 'bpm', referenceRange: '60 - 100', status: 'normal', explanation: 'Resting heart rate is normal. Good cardiovascular fitness indicator.' },
      { name: 'Rhythm', value: 'Normal Sinus', unit: '', referenceRange: 'Normal Sinus', status: 'normal', explanation: 'Heart beat originates from SA node normally. No arrhythmia detected.' },
      { name: 'PR Interval', value: '0.16', unit: 'sec', referenceRange: '0.12 - 0.20', status: 'normal', explanation: 'AV conduction time is normal. No heart block present.' },
      { name: 'QRS Duration', value: '0.08', unit: 'sec', referenceRange: '0.06 - 0.10', status: 'normal', explanation: 'Ventricular depolarization is within normal time. No bundle branch block.' },
      { name: 'QT Interval', value: '0.38', unit: 'sec', referenceRange: '0.36 - 0.44', status: 'normal', explanation: 'QT interval is normal. No risk of dangerous arrhythmias (Torsades de Pointes).' },
      { name: 'Axis', value: 'Left Axis Deviation', unit: '', referenceRange: '-30° to +90°', status: 'low', explanation: 'Left axis deviation may indicate left ventricular hypertrophy or conduction abnormality. Usually benign in isolation but warrants echocardiogram.' },
      { name: 'ST Segments', value: 'No elevation/depression', unit: '', referenceRange: 'Isoelectric', status: 'normal', explanation: 'No ST changes — no evidence of acute myocardial ischemia or infarction.' },
    ],
    riskFlags: [
      { name: 'Left Axis Deviation', severity: 'low', description: 'ECG axis is shifted leftward, possibly indicating left ventricular changes.', action: 'Get echocardiogram to rule out LVH. Usually benign in healthy individuals.' },
    ],
    recommendations: [
      'Echocardiogram recommended to evaluate left ventricular function',
      'Maintain regular cardiovascular exercise',
      'Annual ECG for routine cardiac screening',
      'No immediate treatment required — follow up in 6 months',
    ],
  },
  'MRI': {
    reportType: 'MRI Brain with Contrast',
    labName: 'Narayana Health, Bangalore',
    reportDate: '2026-08-05',
    patientName: 'Rajesh Kumar Sharma',
    patientAge: 42,
    healthScore: 91,
    overallSummary: 'MRI brain with contrast shows normal brain parenchyma. No evidence of infarction, hemorrhage, mass lesion, or demyelination. Ventricles are normal in size. Pituitary gland is normal. Sinuses are clear.',
    parameters: [
      { name: 'Brain Parenchyma', value: 'Normal', unit: '', referenceRange: 'Normal signal intensity', status: 'normal', explanation: 'Brain tissue appears normal with no abnormal signal changes. No tumors, strokes, or lesions.' },
      { name: 'Ventricles', value: 'Normal size', unit: '', referenceRange: 'Normal', status: 'normal', explanation: 'Lateral and third ventricles are normal in size and shape. No hydrocephalus.' },
      { name: 'Cerebellum', value: 'Normal', unit: '', referenceRange: 'Normal', status: 'normal', explanation: 'Cerebellum shows normal signal. No atrophy or lesions. Balance and coordination centers intact.' },
      { name: 'Brainstem', value: 'Normal', unit: '', referenceRange: 'Normal', status: 'normal', explanation: 'Midbrain, pons, and medulla are normal. No compression or signal abnormality.' },
      { name: 'Pituitary Gland', value: 'Normal', unit: '', referenceRange: 'Normal size', status: 'normal', explanation: 'Pituitary is normal in size with no adenoma. Hormone production centers are intact.' },
      { name: 'Sinuses', value: 'Clear', unit: '', referenceRange: 'Clear/Pneumatized', status: 'normal', explanation: 'All paranasal sinuses are well-pneumatized. No sinusitis or mucosal thickening.' },
    ],
    riskFlags: [],
    recommendations: [
      'No abnormal findings — routine brain health is excellent',
      'Continue regular exercise and cognitive activities',
      'No follow-up imaging needed unless symptoms develop',
      'Annual health checkup recommended',
    ],
  },
  'General Checkup': {
    reportType: 'Annual Health Checkup Package',
    labName: 'Manipal Hospital, Bangalore',
    reportDate: '2026-07-28',
    patientName: 'Rajesh Kumar Sharma',
    patientAge: 42,
    healthScore: 68,
    overallSummary: 'General health checkup reveals elevated BMI (28.3), pre-hypertensive blood pressure, mildly elevated liver enzymes, and vitamin D deficiency. Blood sugar is borderline. Needs lifestyle modification.',
    parameters: [
      { name: 'BMI', value: '28.3', unit: 'kg/m²', referenceRange: '18.5 - 24.9', status: 'high', explanation: 'BMI indicates overweight status. Increases risk of diabetes, heart disease, and joint problems. Weight loss of 5-7 kg recommended.' },
      { name: 'Blood Pressure', value: '138/88', unit: 'mmHg', referenceRange: '< 120/80', status: 'high', explanation: 'Blood pressure is in pre-hypertension range. Stage 1 hypertension territory. Dietary changes and exercise essential.' },
      { name: 'Random Blood Sugar', value: '142', unit: 'mg/dL', referenceRange: '< 140', status: 'high', explanation: 'Borderline elevated. May indicate pre-diabetes. Fasting and HbA1c tests recommended for confirmation.' },
      { name: 'Waist Circumference', value: '38', unit: 'inches', referenceRange: '< 35', status: 'high', explanation: 'Abdominal obesity increases metabolic syndrome risk. Target waist circumference should be below 35 inches.' },
      { name: 'Resting Heart Rate', value: '82', unit: 'bpm', referenceRange: '60 - 80', status: 'low', explanation: 'Slightly elevated resting heart rate. Improve cardiovascular fitness with regular aerobic exercise.' },
      { name: 'Body Fat %', value: '28', unit: '%', referenceRange: '15 - 25', status: 'high', explanation: 'Body fat percentage is above optimal range. Resistance training and dietary changes recommended.' },
    ],
    riskFlags: [
      { name: 'Overweight/Obesity', severity: 'moderate', description: 'BMI 28.3 with elevated body fat percentage and waist circumference.', action: 'Aim for 5-7 kg weight loss over 3-6 months through diet and exercise. Target BMI below 25.' },
      { name: 'Pre-Hypertension', severity: 'moderate', description: 'Blood pressure 138/88 mmHg is above normal range.', action: 'Reduce salt intake to < 5g/day. Exercise regularly. Monitor BP weekly. Consider medication if persists.' },
      { name: 'Borderline Blood Sugar', severity: 'moderate', description: 'Random blood sugar at 142 mg/dL is borderline elevated.', action: 'Get fasting glucose and HbA1c tests. Reduce sugar and refined carb intake. Exercise regularly.' },
    ],
    recommendations: [
      'Lose 5-7 kg weight over 3-6 months through calorie deficit and exercise',
      'Reduce salt intake to less than 5 grams per day (Indian cooking uses more salt)',
      'Exercise 30 minutes daily — brisk walking is most effective for BP reduction',
      'Get fasting blood sugar and HbA1c tested for diabetes screening',
      'Follow DASH diet: rich in fruits, vegetables, whole grains, low-fat dairy',
      'Limit alcohol intake and avoid smoking',
      'Re-test blood pressure and blood sugar after 3 months of lifestyle changes',
    ],
  },
};

const TREND_DATA: TrendData[] = [
  { month: 'Mar 2026', parameters: [{ name: 'Cholesterol', value: 220 }, { name: 'BMI', value: 29.1 }, { name: 'BP Systolic', value: 142 }] },
  { month: 'May 2026', parameters: [{ name: 'Cholesterol', value: 230 }, { name: 'BMI', value: 28.7 }, { name: 'BP Systolic', value: 140 }] },
  { month: 'Aug 2026', parameters: [{ name: 'Cholesterol', value: 238 }, { name: 'BMI', value: 28.3 }, { name: 'BP Systolic', value: 138 }] },
];

const GLOSSARY: { term: string; definition: string }[] = [
  { term: 'CBC', definition: 'Complete Blood Count — measures red cells, white cells, hemoglobin, platelets to screen for infection, anemia, and blood disorders.' },
  { term: 'LDL', definition: 'Low-Density Lipoprotein — "bad cholesterol" that builds up in artery walls. High levels increase heart attack risk.' },
  { term: 'HDL', definition: 'High-Density Lipoprotein — "good cholesterol" that removes excess cholesterol from arteries. Higher is better.' },
  { term: 'HbA1c', definition: 'Glycated Hemoglobin — reflects average blood sugar over past 2-3 months. Below 5.7% is normal.' },
  { term: 'SGPT/ALT', definition: 'Liver enzyme. Elevated levels indicate liver damage from hepatitis, fatty liver, alcohol, or medications.' },
  { term: 'Creatinine', definition: 'Waste product filtered by kidneys. High levels indicate reduced kidney function.' },
  { term: 'TSH', definition: 'Thyroid Stimulating Hormone — regulates thyroid. High TSH means hypothyroidism (underactive thyroid).' },
  { term: 'ECG', definition: 'Electrocardiogram — records heart electrical activity. Detects arrhythmia, heart attacks, and rhythm abnormalities.' },
  { term: 'BMI', definition: 'Body Mass Index — weight/height ratio. 18.5-24.9 is normal, 25-29.9 overweight, 30+ obese.' },
  { term: 'HbA1c', definition: 'Average blood sugar over 2-3 months. Below 5.7% normal, 5.7-6.4% pre-diabetes, 6.5%+ diabetes.' },
  { term: 'MPV', definition: 'Mean Platelet Volume — size of platelets. High MPV may indicate increased platelet production, often seen in inflammation.' },
  { term: 'ESR', definition: 'Erythrocyte Sedimentation Rate — non-specific inflammation marker. Elevated in infections, autoimmune diseases, cancers.' },
  { term: 'Urobilinogen', definition: 'Liver metabolism product found in urine. Normal levels indicate healthy liver. Very high levels suggest liver disease.' },
  { term: 'Specific Gravity', definition: 'Measure of urine concentration. Indicates kidney ability to concentrate urine and hydration status.' },
];

export default function HealthReportGeneratorPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'report' | 'trends' | 'glossary'>('upload');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<HealthReport | null>(null);
  const [selectedReportType, setSelectedReportType] = useState<string>('Blood Test');
  const [isDragging, setIsDragging] = useState(false);
  const [showShared, setShowShared] = useState(false);
  const [expandedParam, setExpandedParam] = useState<number | null>(null);
  const [showGlossaryTerm, setShowGlossaryTerm] = useState<number | null>(null);

  const reportTypes = [
    { id: 'Blood Test', label: 'Blood Test', icon: '🩸', description: 'CBC, Lipid, Sugar, Thyroid' },
    { id: 'Urine', label: 'Urine Test', icon: '💧', description: 'Routine, Culture' },
    { id: 'X-Ray', label: 'X-Ray', icon: '🦴', description: 'Chest, Bone, Spine' },
    { id: 'ECG', label: 'ECG', icon: '💓', description: 'Heart Rhythm' },
    { id: 'MRI', label: 'MRI', icon: '🧠', description: 'Brain, Spine, Joints' },
    { id: 'General Checkup', label: 'General', icon: '🏥', description: 'Full Body Checkup' },
  ];

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    simulateAnalysis();
  }, [selectedReportType]);

  const simulateAnalysis = () => {
    setUploadedFile(`${selectedReportType.toLowerCase().replace(' ', '_')}_report.pdf`);
    setIsAnalyzing(true);
    setTimeout(() => {
      setReport(MOCK_REPORTS[selectedReportType]);
      setIsAnalyzing(false);
      setActiveTab('report');
    }, 3000);
  };

  const downloadReport = () => {
    if (!report) return;
    let text = `ZYNTRACARE HEALTH REPORT\n${'='.repeat(40)}\n\n`;
    text += `Patient: ${report.patientName} (Age: ${report.patientAge})\n`;
    text += `Lab: ${report.labName}\nDate: ${report.reportDate}\n`;
    text += `Report Type: ${report.reportType}\n`;
    text += `Health Score: ${report.healthScore}/100\n\n`;
    text += `SUMMARY\n${'-'.repeat(20)}\n${report.overallSummary}\n\n`;
    text += `PARAMETERS\n${'-'.repeat(20)}\n`;
    report.parameters.forEach(p => {
      text += `${p.name}: ${p.value} ${p.unit} [${p.referenceRange}] - ${p.status.toUpperCase()}\n`;
    });
    if (report.riskFlags.length > 0) {
      text += `\nRISK FLAGS\n${'-'.repeat(20)}\n`;
      report.riskFlags.forEach(r => {
        text += `[${r.severity.toUpperCase()}] ${r.name}: ${r.description}\nAction: ${r.action}\n\n`;
      });
    }
    text += `RECOMMENDATIONS\n${'-'.repeat(20)}\n`;
    report.recommendations.forEach((r, i) => { text += `${i + 1}. ${r}\n`; });
    text += `\n${'='.repeat(40)}\nGenerated by ZyntraCare AI | ${new Date().toLocaleDateString()}\n`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ZyntraCare_Report_${report.reportDate}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'from-emerald-500 to-green-400';
    if (score >= 70) return 'from-amber-500 to-yellow-400';
    return 'from-red-500 to-orange-400';
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'low': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'critical': return 'bg-red-700/30 text-red-300 border-red-600/30';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const tabs = [
    { id: 'upload' as const, label: 'Upload', icon: <FiUploadCloud /> },
    { id: 'report' as const, label: 'Report', icon: <FiFileText /> },
    { id: 'trends' as const, label: 'Trends', icon: <FiTrendingUp /> },
    { id: 'glossary' as const, label: 'Glossary', icon: <FiBook /> },
  ];

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl mb-6">
            <FiActivity size={32} className="text-cyan-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            AI Health <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Report Generator</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Upload your lab reports, get instant AI analysis with plain English explanations, risk flags, and personalized recommendations.
          </p>
        </motion.div>

        {/* Health Score Banner */}
        {report && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-8 mb-8 backdrop-blur-xl flex flex-col md:flex-row items-center gap-8"
          >
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="52" fill="none"
                  stroke="url(#scoreGradient)" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(report.healthScore / 100) * 327} 327`}
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={report.healthScore >= 85 ? '#10b981' : report.healthScore >= 70 ? '#f59e0b' : '#ef4444'} />
                    <stop offset="100%" stopColor={report.healthScore >= 85 ? '#34d399' : report.healthScore >= 70 ? '#fbbf24' : '#f87171'} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-black bg-gradient-to-r ${getScoreColor(report.healthScore)} bg-clip-text text-transparent`}>{report.healthScore}</span>
                <span className="text-xs text-gray-400">/100</span>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-black text-white mb-2">Overall Health Score</h2>
              <p className="text-gray-400 text-sm mb-4">{report.overallSummary}</p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-xs font-bold text-emerald-400">
                  {report.parameters.filter(p => p.status === 'normal').length} Normal
                </span>
                <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-xs font-bold text-amber-400">
                  {report.parameters.filter(p => p.status === 'low' || p.status === 'high').length} Abnormal
                </span>
                <span className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-xs font-bold text-red-400">
                  {report.riskFlags.length} Risk Flags
                </span>
                <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-xs font-bold text-cyan-400">
                  {report.recommendations.length} Recommendations
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={downloadReport}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold transition text-sm"
              >
                <FiDownload /> Download
              </button>
              <button
                onClick={() => { setShowShared(true); setTimeout(() => setShowShared(false), 3000); }}
                className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl font-bold transition text-sm"
              >
                <FiShare2 /> Share
              </button>
            </div>
          </motion.div>
        )}

        {showShared && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-6 right-6 z-50 bg-emerald-500/20 border border-emerald-500/30 rounded-xl px-6 py-3 flex items-center gap-2 backdrop-blur-xl"
          >
            <FiCheckCircle className="text-emerald-400" />
            <span className="text-emerald-400 font-bold text-sm">Report shared with Dr. Anand Mehta successfully!</span>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {reportTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedReportType(type.id)}
                    className={`p-5 rounded-2xl border text-left transition ${
                      selectedReportType === type.id
                        ? 'bg-cyan-500/10 border-cyan-500/30'
                        : 'bg-slate-900/80 border-white/10 hover:border-white/20'
                    } backdrop-blur-xl`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{type.icon}</span>
                      <div>
                        <p className={`font-bold ${selectedReportType === type.id ? 'text-cyan-400' : 'text-white'}`}>{type.label}</p>
                        <p className="text-xs text-gray-400">{type.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-[2rem] p-16 text-center transition-all cursor-pointer backdrop-blur-xl ${
                  isDragging
                    ? 'border-cyan-400 bg-cyan-500/10'
                    : uploadedFile && !report
                      ? 'border-cyan-500/50 bg-cyan-500/5'
                      : 'border-white/20 bg-slate-900/80 hover:border-cyan-500/50 hover:bg-cyan-500/5'
                }`}
                onClick={() => !isAnalyzing && simulateAnalysis()}
              >
                {isAnalyzing ? (
                  <div className="flex flex-col items-center">
                    <div className="relative w-20 h-20 mb-6">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                        className="absolute inset-0 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full"
                      />
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                        className="absolute inset-2 border-4 border-blue-500/20 border-b-blue-400 rounded-full"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FiActivity className="text-cyan-400" size={24} />
                      </div>
                    </div>
                    <p className="text-cyan-400 font-bold text-lg mb-2">AI is analyzing your report...</p>
                    <div className="space-y-1">
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-gray-500 text-sm"
                      >
                        Extracting lab values...
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="text-gray-500 text-sm"
                      >
                        Comparing with reference ranges...
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                        className="text-gray-500 text-sm"
                      >
                        Generating risk analysis...
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2 }}
                        className="text-gray-500 text-sm"
                      >
                        Writing recommendations...
                      </motion.p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-6">
                      <FiUploadCloud size={36} className="text-gray-400" />
                    </div>
                    <p className="text-white font-bold text-xl mb-2">Drop your lab report here</p>
                    <p className="text-gray-500 text-sm mb-4">Supports PDF, JPG, PNG from Thyyrocare, Dr Lal PathLabs, Apollo, etc.</p>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-white/5 rounded-lg text-xs text-gray-400 border border-white/10">PDF</span>
                      <span className="px-3 py-1 bg-white/5 rounded-lg text-xs text-gray-400 border border-white/10">JPG</span>
                      <span className="px-3 py-1 bg-white/5 rounded-lg text-xs text-gray-400 border border-white/10">DICOM</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Report Tab */}
          {activeTab === 'report' && report && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Report Header */}
              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-cyan-400 font-bold text-sm">{report.labName}</p>
                    <h3 className="text-xl font-black text-white">{report.reportType}</h3>
                    <p className="text-xs text-gray-400">Patient: {report.patientName} | Age: {report.patientAge} | Date: {new Date(report.reportDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={downloadReport} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition">
                      <FiDownload className="text-white" />
                    </button>
                    <button onClick={() => { setShowShared(true); setTimeout(() => setShowShared(false), 3000); }} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition">
                      <FiShare2 className="text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Parameters */}
              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FiBarChart2 className="text-cyan-400" /> Lab Parameters
                </h3>
                <div className="space-y-2">
                  {report.parameters.map((param, idx) => (
                    <div
                      key={idx}
                      className={`rounded-xl border transition overflow-hidden ${
                        param.status === 'normal' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'
                      }`}
                    >
                      <button
                        onClick={() => setExpandedParam(expandedParam === idx ? null : idx)}
                        className="w-full flex items-center justify-between p-4 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${param.status === 'normal' ? 'bg-emerald-400' : param.status === 'high' ? 'bg-red-400' : 'bg-amber-400'}`} />
                          <div>
                            <p className="text-sm font-bold text-white">{param.name}</p>
                            <p className="text-xs text-gray-500">Range: {param.referenceRange}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-black text-white">{param.value} <span className="text-xs text-gray-400 font-normal">{param.unit}</span></p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(param.status)}`}>
                            {param.status}
                          </span>
                          {expandedParam === idx ? <FiChevronUp className="text-gray-400" /> : <FiChevronDown className="text-gray-400" />}
                        </div>
                      </button>
                      <AnimatePresence>
                        {expandedParam === idx && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-4 pb-4"
                          >
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                              <div className="flex items-start gap-2">
                                <FiInfo className="text-cyan-400 mt-0.5 flex-shrink-0" size={14} />
                                <p className="text-sm text-gray-300">{param.explanation}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Flags */}
              {report.riskFlags.length > 0 && (
                <div className="bg-slate-900/80 border border-red-500/20 rounded-[2rem] p-6 backdrop-blur-xl">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <FiAlertTriangle className="text-red-400" /> Risk Flags
                  </h3>
                  <div className="space-y-4">
                    {report.riskFlags.map((flag, idx) => (
                      <div key={idx} className={`p-4 rounded-xl border ${
                        flag.severity === 'high' ? 'bg-red-500/10 border-red-500/30' :
                        flag.severity === 'moderate' ? 'bg-amber-500/10 border-amber-500/30' :
                        'bg-blue-500/10 border-blue-500/30'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            flag.severity === 'high' ? 'bg-red-500/30 text-red-300' :
                            flag.severity === 'moderate' ? 'bg-amber-500/30 text-amber-300' :
                            'bg-blue-500/30 text-blue-300'
                          }`}>{flag.severity}</span>
                          <span className="font-bold text-white text-sm">{flag.name}</span>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">{flag.description}</p>
                        <p className="text-xs text-cyan-400">Action: {flag.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="bg-slate-900/80 border border-emerald-500/20 rounded-[2rem] p-6 backdrop-blur-xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FiCheckCircle className="text-emerald-400" /> Recommended Actions
                </h3>
                <div className="space-y-3">
                  {report.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                      <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-emerald-400">{idx + 1}</span>
                      </div>
                      <p className="text-sm text-gray-300">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Trends Tab */}
          {activeTab === 'trends' && (
            <motion.div
              key="trends"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto space-y-6"
            >
              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <FiTrendingUp className="text-cyan-400" /> Trend Comparison (Last 3 Reports)
                </h3>
                {['Cholesterol', 'BMI', 'BP Systolic'].map((paramName, pIdx) => {
                  const values = TREND_DATA.map(t => t.parameters.find(p => p.name === paramName)?.value || 0);
                  const maxVal = Math.max(...values) * 1.2;
                  const minVal = Math.min(...values) * 0.8;
                  const range = maxVal - minVal;
                  return (
                    <div key={paramName} className="mb-8 last:mb-0">
                      <p className="text-sm font-bold text-white mb-3">{paramName}</p>
                      <div className="flex items-end gap-4 h-32">
                        {TREND_DATA.map((trend, tIdx) => {
                          const val = values[tIdx];
                          const height = ((val - minVal) / range) * 100;
                          const isHigh = paramName === 'Cholesterol' ? val > 200 : paramName === 'BMI' ? val > 25 : val > 130;
                          return (
                            <div key={trend.month} className="flex-1 flex flex-col items-center">
                              <div className="w-full flex flex-col items-center justify-end h-full relative">
                                <span className={`text-xs font-bold mb-1 ${isHigh ? 'text-red-400' : 'text-emerald-400'}`}>{val}</span>
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: `${height}%` }}
                                  transition={{ duration: 0.8, delay: tIdx * 0.2 }}
                                  className={`w-full rounded-t-lg ${isHigh ? 'bg-gradient-to-t from-red-600 to-red-400' : 'bg-gradient-to-t from-emerald-600 to-emerald-400'}`}
                                />
                              </div>
                              <span className="text-xs text-gray-400 mt-2">{trend.month}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <FiTrendingUp size={12} className={values[2] > values[0] ? 'text-red-400 rotate-180' : 'text-emerald-400'} />
                        <span className={`text-xs ${values[2] > values[0] ? 'text-red-400' : 'text-emerald-400'}`}>
                          {values[2] > values[0] ? 'Worsening' : 'Improving'} — {Math.abs(values[2] - values[0]).toFixed(0)} change since Mar
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Glossary Tab */}
          {activeTab === 'glossary' && (
            <motion.div
              key="glossary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <FiBook className="text-cyan-400" /> Medical Terminology Glossary
                </h3>
                <p className="text-sm text-gray-400 mb-6">Tap any term to learn what it means in plain English.</p>
                <div className="space-y-3">
                  {GLOSSARY.map((item, idx) => (
                    <div key={idx}>
                      <button
                        onClick={() => setShowGlossaryTerm(showGlossaryTerm === idx ? null : idx)}
                        className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                            <FiSearch className="text-cyan-400" size={14} />
                          </div>
                          <span className="text-sm font-bold text-white">{item.term}</span>
                        </div>
                        {showGlossaryTerm === idx ? <FiChevronUp className="text-gray-400" /> : <FiChevronDown className="text-gray-400" />}
                      </button>
                      <AnimatePresence>
                        {showGlossaryTerm === idx && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-4 pb-2"
                          >
                            <p className="text-sm text-gray-300 bg-white/5 rounded-xl p-4 border border-white/10">{item.definition}</p>
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
      </div>
    </div>
  );
}
