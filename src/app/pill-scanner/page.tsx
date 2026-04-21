'use client';

import { useState, useRef } from 'react';
import { FiCamera, FiUpload, FiCheckCircle, FiAlertCircle, FiClock, FiShield, FiInfo, FiMapPin, FiSearch, FiX, FiRefreshCw } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface MedicineResult {
  name: string;
  genericName: string;
  manufacturer: string;
  composition: string;
  uses: string[];
  sideEffects: string[];
  warnings: string[];
  pregnancySafe: boolean;
  expiryDate: string;
  price: string;
  verified: boolean;
  barcode: string;
}

const mockResults: Record<string, MedicineResult> = {
  'paracetamol': {
    name: 'Crocin 650',
    genericName: 'Paracetamol 650mg',
    manufacturer: 'GSK Pharmaceuticals',
    composition: 'Paracetamol 650mg',
    uses: ['Fever', 'Headache', 'Body pain', 'Cold & Flu'],
    sideEffects: ['Nausea', 'Stomach pain', 'Loss of appetite'],
    warnings: ['Do not exceed 4g in 24 hours', 'Avoid alcohol'],
    pregnancySafe: true,
    expiryDate: 'Dec 2027',
    price: '₹30 for 15 tablets',
    verified: true,
    barcode: '8901234567890',
  },
  'amoxicillin': {
    name: 'Novamox 500',
    genericName: 'Amoxicillin 500mg',
    manufacturer: 'Sun Pharmaceutical',
    composition: 'Amoxicillin Trihydrate 500mg',
    uses: ['Bacterial infections', 'Ear infection', 'Throat infection', 'UTI'],
    sideEffects: ['Nausea', 'Diarrhea', 'Rash'],
    warnings: ['Complete full course', 'Do not use if allergic to penicillin'],
    pregnancySafe: true,
    expiryDate: 'Aug 2026',
    price: '₹120 for 10 capsules',
    verified: true,
    barcode: '8901234567891',
  },
};

export default function PillScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<MedicineResult | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScan = () => {
    setScanning(true);
    setResult(null);
    setTimeout(() => {
      setScanning(false);
      const mockMedicine = mockResults['paracetamol'];
      setResult(mockMedicine);
    }, 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScanning(true);
      setTimeout(() => {
        setScanning(false);
        setResult(mockResults['paracetamol']);
      }, 2000);
    }
  };

  const handleSearch = () => {
    if (searchQuery.toLowerCase().includes('crocin') || searchQuery.toLowerCase().includes('paracetamol')) {
      setResult(mockResults['paracetamol']);
    } else if (searchQuery.toLowerCase().includes('novamox') || searchQuery.toLowerCase().includes('amoxicillin')) {
      setResult(mockResults['amoxicillin']);
    }
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl mb-6">
            <FiCamera size={32} className="text-cyan-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            AR Pill <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Scanner</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Scan your medicine strip or prescription to verify authenticity, check expiry, and get detailed information.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-8">
              <div className="flex justify-center gap-4 mb-8">
                <button
                  onClick={() => setShowCamera(true)}
                  className="flex-1 flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 hover:border-cyan-500/50 rounded-2xl transition"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <FiCamera size={28} className="text-white" />
                  </div>
                  <span className="font-bold">Scan Medicine</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex flex-col items-center gap-3 p-6 bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl transition"
                >
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                    <FiUpload size={28} className="text-white" />
                  </div>
                  <span className="font-bold">Upload Image</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden mb-6">
                {scanning ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="w-20 h-20 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full mb-4"
                    />
                    <p className="text-cyan-400 font-bold animate-pulse">Analyzing medicine...</p>
                    <p className="text-gray-500 text-sm mt-2">AI is identifying the drug</p>
                  </div>
                ) : result ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4"
                    >
                      <FiCheckCircle size={48} className="text-emerald-400" />
                    </motion.div>
                    <p className="text-emerald-400 font-bold">Medicine Identified!</p>
                    <p className="text-gray-500 text-sm mt-2">{result.name}</p>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <FiCamera size={48} className="text-gray-600 mb-4" />
                    <p className="text-gray-500">Point camera at medicine strip</p>
                    <p className="text-gray-600 text-sm">or upload an image</p>
                  </div>
                )}
              </div>

              {!scanning && !result && (
                <button
                  onClick={handleScan}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-4 rounded-2xl font-bold text-lg transition flex items-center justify-center gap-2"
                >
                  <FiCamera /> Start Scanning
                </button>
              )}

              {result && (
                <button
                  onClick={() => setResult(null)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-bold transition flex items-center justify-center gap-2"
                >
                  <FiRefreshCw /> Scan Another
                </button>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 mb-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <FiSearch className="text-cyan-400" /> Search Medicine
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter medicine name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500"
                />
                <button
                  onClick={handleSearch}
                  className="px-6 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl font-bold transition"
                >
                  Search
                </button>
              </div>
              <p className="text-gray-500 text-sm mt-2">Try: Crocin, Novamox, Paracetamol</p>
            </div>

            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-[2rem] p-6">
              <h3 className="font-bold text-lg mb-4">How It Works</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center font-bold text-sm">1</div>
                  <div>
                    <p className="font-medium text-white">Scan or Upload</p>
                    <p className="text-sm text-gray-400">Point camera at medicine strip</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center font-bold text-sm">2</div>
                  <div>
                    <p className="font-medium text-white">AI Analysis</p>
                    <p className="text-sm text-gray-400">Our AI identifies the medicine</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center font-bold text-sm">3</div>
                  <div>
                    <p className="font-medium text-white">Get Info</p>
                    <p className="text-sm text-gray-400">View details, verify authenticity</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/80 border border-emerald-500/30 rounded-[2rem] p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <FiCheckCircle size={24} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">{result.name}</h3>
                  <p className="text-gray-400">{result.genericName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-full">
                <FiShield className="text-emerald-400" size={16} />
                <span className="text-emerald-400 font-bold text-sm">Verified</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-2xl p-5">
                <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                  <FiInfo className="text-cyan-400" /> Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Manufacturer</span>
                    <span className="text-white">{result.manufacturer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Composition</span>
                    <span className="text-white">{result.composition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price</span>
                    <span className="text-white">{result.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Expiry</span>
                    <span className="text-white">{result.expiryDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Barcode</span>
                    <span className="text-white font-mono">{result.barcode}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-5">
                <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                  <FiCheckCircle className="text-emerald-400" /> Uses
                </h4>
                <div className="space-y-2">
                  {result.uses.map((use, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-gray-300 text-sm">{use}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-5">
                <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                  <FiAlertCircle className="text-amber-400" /> Warnings
                </h4>
                <div className="space-y-2">
                  {result.warnings.map((warning, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-gray-300 text-sm">{warning}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${result.pregnancySafe ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {result.pregnancySafe ? <FiCheckCircle /> : <FiAlertCircle />}
                <span className="font-medium">{result.pregnancySafe ? 'Safe during pregnancy' : 'Not recommended during pregnancy'}</span>
              </div>
              <Link href="/pharmacies" className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition">
                <FiMapPin size={16} />
                <span>Find in Pharmacy</span>
              </Link>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}