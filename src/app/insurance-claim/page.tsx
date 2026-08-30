'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiFileText, FiCheckCircle, FiClock, FiXCircle, FiAlertTriangle, FiSearch, FiChevronDown, FiChevronUp, FiSend, FiDownload, FiShield, FiUser, FiHome, FiCalendar, FiHeart, FiActivity, FiFile, FiClipboard, FiTrendingUp, FiDollarSign, FiPrinter } from 'react-icons/fi';
import Link from 'next/link';

interface ParsedBill {
  hospitalName: string;
  hospitalCity: string;
  billDate: string;
  patientName: string;
  patientAge: number;
  admissionDate: string;
  dischargeDate: string;
  diagnosis: string;
  treatmentType: string;
  items: BillItem[];
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
}

interface BillItem {
  name: string;
  category: 'consultation' | 'medicine' | 'lab' | 'room' | 'surgery' | 'other';
  amount: number;
}

interface ClaimForm {
  policyNumber: string;
  patientName: string;
  hospitalName: string;
  dateOfAdmission: string;
  dateOfDischarge: string;
  diagnosis: string;
  treatmentType: string;
  totalAmount: number;
  consultation: number;
  medicine: number;
  labCharges: number;
  roomCharges: number;
  surgeryCharges: number;
  otherCharges: number;
}

interface ClaimHistory {
  id: string;
  claimNumber: string;
  hospitalName: string;
  date: string;
  amount: number;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  statusLabel: string;
}

interface DocumentChecklist {
  name: string;
  required: boolean;
  uploaded: boolean;
  icon: string;
}

const INSURANCE_TERMS = {
  coPayPercent: 10,
  roomLimitPercent: 2,
  waitingPeriodDays: 30,
  preExistingWaitingDays: 48,
  claimDeductionPercent: 5,
  ambulanceCover: 2000,
  dailyHospitalCash: 1000,
};

export default function InsuranceClaimPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'form' | 'history' | 'documents'>('upload');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedBill, setParsedBill] = useState<ParsedBill | null>(null);
  const [claimStatus, setClaimStatus] = useState<'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'>('draft');
  const [showEstimate, setShowEstimate] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedBillIndex, setSelectedBillIndex] = useState(0);
  const [claimHistory, setClaimHistory] = useState<ClaimHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const [claimForm, setClaimForm] = useState<ClaimForm>({
    policyNumber: 'ZYNTRA-HEALTH-2026-4891',
    patientName: '',
    hospitalName: '',
    dateOfAdmission: '',
    dateOfDischarge: '',
    diagnosis: '',
    treatmentType: '',
    totalAmount: 0,
    consultation: 0,
    medicine: 0,
    labCharges: 0,
    roomCharges: 0,
    surgeryCharges: 0,
    otherCharges: 0,
  });

  const [documents, setDocuments] = useState<DocumentChecklist[]>([
    { name: 'Original Hospital Bill', required: true, uploaded: false, icon: '📄' },
    { name: 'Discharge Summary', required: true, uploaded: false, icon: '📋' },
    { name: 'Doctor Prescription', required: true, uploaded: false, icon: '💊' },
    { name: 'Patient ID Proof (Aadhaar/PAN)', required: true, uploaded: false, icon: '🪪' },
    { name: 'Lab Reports & Investigations', required: false, uploaded: false, icon: '🧪' },
    { name: 'Insurance Policy Copy', required: false, uploaded: false, icon: '🛡️' },
    { name: 'NEFT/Cheque Details', required: true, uploaded: false, icon: '🏦' },
    { name: 'Cashless Authorization (if applicable)', required: false, uploaded: false, icon: '✅' },
  ]);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const res = await fetch('/api/insurance-claims?userId=demo-user');
        if (res.ok) {
          const data = await res.json();
          setClaimHistory(data.claims || []);
        }
      } catch (e) {
        console.error('Failed to fetch claims', e);
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, []);

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
    simulateUpload();
  }, []);

  const simulateUpload = () => {
    setUploadedFile('hospital_bill_apollo_2026.pdf');
    setIsParsing(true);
    setTimeout(() => {
      setParsedBill(null);
      setClaimForm(prev => ({ ...prev }));
      setIsParsing(false);
      setDocuments(prev => prev.map((d, i) => i === 0 ? { ...d, uploaded: true } : d));
    }, 2500);
  };

  const calculateEstimate = () => {
    setShowEstimate(true);
  };

  const getEstimatedCoverage = () => {
    if (!parsedBill) return null;
    const roomLimit = parsedBill.totalAmount * (INSURANCE_TERMS.roomLimitPercent / 100);
    const actualRoom = parsedBill.items.filter(i => i.category === 'room').reduce((s, i) => s + i.amount, 0);
    const roomExcess = Math.max(0, actualRoom - roomLimit);
    const subtotal = parsedBill.totalAmount - roomExcess;
    const claimDeduction = subtotal * (INSURANCE_TERMS.claimDeductionPercent / 100);
    const afterDeduction = subtotal - claimDeduction;
    const coPay = afterDeduction * (INSURANCE_TERMS.coPayPercent / 100);
    const netPayable = afterDeduction - coPay;
    return {
      totalBill: parsedBill.totalAmount,
      roomExcess,
      claimDeduction,
      coPay,
      netPayable: Math.round(netPayable),
      ambulanceCover: INSURANCE_TERMS.ambulanceCover,
    };
  };

  const submitClaim = async () => {
    try {
      const res = await fetch('/api/insurance-claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'demo-user', ...claimForm }),
      });
      if (res.ok) {
        setClaimStatus('submitted');
        const data = await res.json();
        if (data.claim) {
          setClaimHistory(prev => [data.claim, ...prev]);
        }
      }
    } catch (e) {
      console.error('Failed to submit claim', e);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'consultation': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'medicine': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'lab': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'room': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'surgery': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'submitted': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'under_review': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'approved': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const statusSteps = ['draft', 'submitted', 'under_review', 'approved'];
  const currentStepIndex = statusSteps.indexOf(claimStatus === 'rejected' ? 'under_review' : claimStatus);

  const tabs = [
    { id: 'upload' as const, label: 'Upload Bill', icon: <FiUploadCloud /> },
    { id: 'form' as const, label: 'Claim Form', icon: <FiFileText /> },
    { id: 'history' as const, label: 'History', icon: <FiClock /> },
    { id: 'documents' as const, label: 'Documents', icon: <FiClipboard /> },
  ];

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl mb-6">
            <FiShield size={32} className="text-emerald-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Insurance <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Claim Assistant</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Upload your hospital bill, let AI parse it, and file your claim in minutes. Zero paperwork.
          </p>
        </motion.div>

        {/* Claim Status Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 mb-8 backdrop-blur-xl"
        >
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <FiTrendingUp className="text-emerald-400" /> Claim Status Tracker
          </h3>
          <div className="flex items-center justify-between relative mb-4">
            <div className="absolute top-5 left-0 right-0 h-1 bg-white/10 rounded-full" />
            <div
              className="absolute top-5 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
              style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
            />
            {statusSteps.map((step, idx) => (
              <div key={step} className="relative z-10 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                  idx <= currentStepIndex
                    ? 'bg-emerald-500 border-emerald-400 text-white'
                    : 'bg-slate-800 border-white/20 text-gray-500'
                }`}>
                  {idx < currentStepIndex ? <FiCheckCircle size={18} /> : idx === currentStepIndex ? <FiClock size={18} /> : <span className="text-xs font-bold">{idx + 1}</span>}
                </div>
                <span className={`text-xs mt-2 font-medium capitalize ${idx <= currentStepIndex ? 'text-emerald-400' : 'text-gray-500'}`}>
                  {step.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
          {claimStatus === 'rejected' && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2">
              <FiXCircle className="text-red-400" />
              <span className="text-red-400 text-sm font-medium">Previous claim was rejected. You can file a new claim below.</span>
            </div>
          )}
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
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
              className="grid lg:grid-cols-2 gap-8"
            >
              <div>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-[2rem] p-12 text-center transition-all cursor-pointer backdrop-blur-xl ${
                    isDragging
                      ? 'border-emerald-400 bg-emerald-500/10'
                      : uploadedFile
                        ? 'border-emerald-500/50 bg-emerald-500/5'
                        : 'border-white/20 bg-slate-900/80 hover:border-emerald-500/50 hover:bg-emerald-500/5'
                  }`}
                  onClick={() => !uploadedFile && simulateUpload()}
                >
                  {isParsing ? (
                    <div className="flex flex-col items-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                        className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full mb-4"
                      />
                      <p className="text-emerald-400 font-bold text-lg">AI is parsing your bill...</p>
                      <p className="text-gray-500 text-sm mt-2">Extracting hospital details, items, and amounts</p>
                    </div>
                  ) : uploadedFile ? (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4">
                        <FiCheckCircle size={32} className="text-emerald-400" />
                      </div>
                      <p className="text-white font-bold text-lg">{uploadedFile}</p>
                      <p className="text-emerald-400 text-sm mt-1">Bill parsed successfully!</p>
                      <button
                        onClick={(e) => { e.stopPropagation(); setUploadedFile(null); setParsedBill(null); }}
                        className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition"
                      >
                        Upload Another
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                        <FiUploadCloud size={32} className="text-gray-400" />
                      </div>
                      <p className="text-white font-bold text-lg">Drop your hospital bill here</p>
                      <p className="text-gray-500 text-sm mt-2">Supports PDF, JPG, PNG — AI will extract all data</p>
                      <div className="flex gap-2 mt-4">
                        <span className="px-3 py-1 bg-white/5 rounded-lg text-xs text-gray-400 border border-white/10">PDF</span>
                        <span className="px-3 py-1 bg-white/5 rounded-lg text-xs text-gray-400 border border-white/10">JPG</span>
                        <span className="px-3 py-1 bg-white/5 rounded-lg text-xs text-gray-400 border border-white/10">PNG</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 bg-slate-900/80 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
                  <p className="text-sm font-bold text-gray-300 mb-3">Upload your hospital bill to get started:</p>
                </div>
              </div>

              {/* Parsed Bill Summary */}
              <div>
                {parsedBill ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-900/80 border border-emerald-500/30 rounded-[2rem] p-6 backdrop-blur-xl"
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <FiFileText className="text-emerald-400" />
                      <h3 className="text-lg font-bold text-emerald-400">AI Parsed Bill Summary</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <p className="text-xs text-gray-400 mb-1">Hospital</p>
                        <p className="text-sm font-bold text-white">{parsedBill.hospitalName}</p>
                        <p className="text-xs text-gray-500">{parsedBill.hospitalCity}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <p className="text-xs text-gray-400 mb-1">Bill Date</p>
                        <p className="text-sm font-bold text-white">{new Date(parsedBill.billDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <p className="text-xs text-gray-400 mb-1">Patient</p>
                        <p className="text-sm font-bold text-white">{parsedBill.patientName}</p>
                        <p className="text-xs text-gray-500">Age: {parsedBill.patientAge}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <p className="text-xs text-gray-400 mb-1">Stay</p>
                        <p className="text-sm font-bold text-white">
                          {new Date(parsedBill.admissionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(parsedBill.dischargeDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {Math.ceil((new Date(parsedBill.dischargeDate).getTime() - new Date(parsedBill.admissionDate).getTime()) / 86400000)} nights
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-3 border border-white/10 mb-4">
                      <p className="text-xs text-gray-400 mb-1">Diagnosis</p>
                      <p className="text-sm font-bold text-white">{parsedBill.diagnosis}</p>
                    </div>

                    <div className="mb-6">
                      <p className="text-sm font-bold text-gray-300 mb-3">Itemized Breakdown ({parsedBill.items.length} items)</p>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {parsedBill.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getCategoryColor(item.category)}`}>
                                {item.category}
                              </span>
                              <span className="text-xs text-gray-300">{item.name}</span>
                            </div>
                            <span className="text-sm font-bold text-white whitespace-nowrap ml-2">₹{item.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-emerald-400">Total Amount</span>
                        <span className="text-2xl font-black text-emerald-400">₹{parsedBill.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      onClick={calculateEstimate}
                      className="mt-4 w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2"
                    >
                      <FiDollarSign /> Calculate Estimate
                    </button>

                    {showEstimate && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 bg-slate-950/80 border border-white/10 rounded-xl p-4"
                      >
                        <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                          <FiSearch className="text-amber-400" /> Estimated Coverage
                        </h4>
                        {(() => {
                          const est = getEstimatedCoverage();
                          if (!est) return null;
                          return (
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Total Hospital Bill</span>
                                <span className="text-white font-bold">₹{est.totalBill.toLocaleString()}</span>
                              </div>
                              {est.roomExcess > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Room Rent Excess (超出 limit)</span>
                                  <span className="text-red-400">-₹{est.roomExcess.toLocaleString()}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-gray-400">Claim Deduction ({INSURANCE_TERMS.claimDeductionPercent}%)</span>
                                <span className="text-red-400">-₹{Math.round(est.claimDeduction).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Co-Payment ({INSURANCE_TERMS.coPayPercent}%)</span>
                                <span className="text-red-400">-₹{Math.round(est.coPay).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Ambulance Cover</span>
                                <span className="text-emerald-400">+₹{est.ambulanceCover.toLocaleString()}</span>
                              </div>
                              <div className="border-t border-white/10 pt-2 mt-2 flex justify-between">
                                <span className="text-emerald-400 font-bold">Estimated Payout</span>
                                <span className="text-emerald-400 font-black text-lg">₹{est.netPayable.toLocaleString()}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-2">*Final amount subject to verification. Terms: {INSURANCE_TERMS.coPayPercent}% co-pay, {INSURANCE_TERMS.claimDeductionPercent}% deduction.</p>
                            </div>
                          );
                        })()}
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-12 text-center backdrop-blur-xl">
                    <FiFileText size={48} className="text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 font-bold">Upload a bill to see AI-parsed data</p>
                    <p className="text-gray-500 text-sm mt-2">The AI will extract hospital name, items, amounts, and auto-fill your claim form</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Claim Form Tab */}
          {activeTab === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-8 backdrop-blur-xl max-w-4xl mx-auto">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <FiFileText className="text-emerald-400" /> Insurance Claim Form
                </h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <FiUser /> Personal Details
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { label: 'Policy Number', value: claimForm.policyNumber, key: 'policyNumber' as const },
                        { label: 'Patient Name', value: claimForm.patientName, key: 'patientName' as const },
                      ].map(field => (
                        <div key={field.key}>
                          <label className="text-xs text-gray-400 mb-1 block">{field.label}</label>
                          <input
                            type="text"
                            value={field.value}
                            onChange={(e) => setClaimForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <FiHome /> Hospital Details
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { label: 'Hospital Name', value: claimForm.hospitalName, key: 'hospitalName' as const },
                        { label: 'Diagnosis', value: claimForm.diagnosis, key: 'diagnosis' as const },
                        { label: 'Date of Admission', value: claimForm.dateOfAdmission, key: 'dateOfAdmission' as const, type: 'date' },
                        { label: 'Date of Discharge', value: claimForm.dateOfDischarge, key: 'dateOfDischarge' as const, type: 'date' },
                      ].map(field => (
                        <div key={field.key}>
                          <label className="text-xs text-gray-400 mb-1 block">{field.label}</label>
                          <input
                            type={field.type || 'text'}
                            value={field.value}
                            onChange={(e) => setClaimForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition"
                          />
                        </div>
                      ))}
                      <div className="md:col-span-2">
                        <label className="text-xs text-gray-400 mb-1 block">Treatment Type</label>
                        <input
                          type="text"
                          value={claimForm.treatmentType}
                          onChange={(e) => setClaimForm(prev => ({ ...prev, treatmentType: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <FiDollarSign /> Amount Breakdown
                    </h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      {[
                        { label: 'Consultation', value: claimForm.consultation, key: 'consultation' as const, color: 'blue' },
                        { label: 'Medicine', value: claimForm.medicine, key: 'medicine' as const, color: 'purple' },
                        { label: 'Lab Charges', value: claimForm.labCharges, key: 'labCharges' as const, color: 'cyan' },
                        { label: 'Room Charges', value: claimForm.roomCharges, key: 'roomCharges' as const, color: 'amber' },
                        { label: 'Surgery', value: claimForm.surgeryCharges, key: 'surgeryCharges' as const, color: 'red' },
                        { label: 'Other', value: claimForm.otherCharges, key: 'otherCharges' as const, color: 'gray' },
                      ].map(field => (
                        <div key={field.key}>
                          <label className="text-xs text-gray-400 mb-1 block">{field.label} (₹)</label>
                          <input
                            type="number"
                            value={field.value || ''}
                            onChange={(e) => setClaimForm(prev => ({ ...prev, [field.key]: Number(e.target.value) }))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
                      <span className="text-sm font-bold text-emerald-400">Total Claim Amount</span>
                      <span className="text-2xl font-black text-emerald-400">₹{(claimForm.consultation + claimForm.medicine + claimForm.labCharges + claimForm.roomCharges + claimForm.surgeryCharges + claimForm.otherCharges).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={submitClaim}
                      disabled={claimStatus === 'submitted' || claimStatus === 'under_review'}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold transition flex items-center justify-center gap-2"
                    >
                      <FiSend /> {claimStatus === 'submitted' ? 'Claim Submitted!' : claimStatus === 'under_review' ? 'Under Review...' : 'Submit Claim'}
                    </button>
                    <button className="px-6 py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl font-bold transition flex items-center gap-2">
                      <FiPrinter /> Print
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto space-y-4"
            >
              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl mb-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-black text-emerald-400">{claimHistory.filter(c => c.status === 'approved').length}</p>
                    <p className="text-xs text-gray-400">Approved Claims</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-black text-red-400">{claimHistory.filter(c => c.status === 'rejected').length}</p>
                    <p className="text-xs text-gray-400">Rejected</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-black text-white">₹{claimHistory.filter(c => c.status === 'approved').reduce((s, c) => s + c.amount, 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">Total Reimbursed</p>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-400 text-sm">Loading claims...</p>
                </div>
              ) : claimHistory.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-white/5">
                  <p className="text-gray-400">No claim history yet</p>
                </div>
              ) : claimHistory.map((claim, idx) => (
                <motion.div
                  key={claim.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 backdrop-blur-xl hover:border-white/20 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getStatusStyle(claim.status)}`}>
                        {claim.status === 'approved' ? <FiCheckCircle size={20} /> : claim.status === 'rejected' ? <FiXCircle size={20} /> : <FiClock size={20} />}
                      </div>
                      <div>
                        <p className="font-bold text-white">{claim.claimNumber}</p>
                        <p className="text-sm text-gray-400">{claim.hospitalName}</p>
                        <p className="text-xs text-gray-500">{new Date(claim.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-white">₹{claim.amount.toLocaleString()}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(claim.status)}`}>
                        {claim.statusLabel}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <motion.div
              key="documents"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-8 backdrop-blur-xl">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <FiClipboard className="text-emerald-400" /> Required Documents Checklist
                </h3>
                <p className="text-sm text-gray-400 mb-6">Ensure all required documents are uploaded before submitting your claim.</p>

                <div className="space-y-3">
                  {documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-4 rounded-xl border transition ${
                        doc.uploaded ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setDocuments(prev => prev.map((d, i) => i === idx ? { ...d, uploaded: !d.uploaded } : d))}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                            doc.uploaded ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-500 hover:bg-white/20'
                          }`}
                        >
                          {doc.uploaded ? <FiCheckCircle size={16} /> : <FiFile size={16} />}
                        </button>
                        <div>
                          <p className={`text-sm font-bold ${doc.uploaded ? 'text-emerald-400' : 'text-white'}`}>{doc.name}</p>
                          {doc.required && (
                            <span className="text-[10px] text-amber-400 font-bold uppercase">Required</span>
                          )}
                        </div>
                      </div>
                      <span className="text-2xl">{doc.icon}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center gap-3">
                  {documents.filter(d => d.required).every(d => d.uploaded) ? (
                    <div className="flex-1 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2">
                      <FiCheckCircle className="text-emerald-400" />
                      <span className="text-emerald-400 text-sm font-bold">All required documents uploaded!</span>
                    </div>
                  ) : (
                    <div className="flex-1 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2">
                      <FiAlertTriangle className="text-amber-400" />
                      <span className="text-amber-400 text-sm font-bold">
                        {documents.filter(d => d.required && !d.uploaded).length} required document(s) remaining
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 backdrop-blur-xl max-w-2xl mx-auto">
            <FiShield className="text-emerald-400 mx-auto mb-3" size={24} />
            <p className="text-sm text-gray-400">
              Your data is encrypted end-to-end. Claims are processed within 7-10 business days.
              For support, contact <span className="text-emerald-400 font-bold">claims@zyntracare.in</span> or call <span className="text-emerald-400 font-bold">1800-123-4567</span>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
