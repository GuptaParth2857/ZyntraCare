'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiFileText, FiCheck, FiCheckCircle, FiClock, FiMapPin, FiPhone, FiStar, FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiArrowRight, FiArrowLeft, FiPackage, FiTruck, FiHome, FiSearch, FiX, FiAlertCircle, FiDownload, FiCopy, FiExternalLink } from 'react-icons/fi';
import Link from 'next/link';

interface ParsedMedicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  price: number;
  alternatives: { name: string; price: number; company: string }[];
  selected: boolean;
}

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  distance: string;
  image: string;
  openNow: boolean;
}

interface OrderItem {
  medicine: ParsedMedicine;
  quantity: number;
}

interface Order {
  id: string;
  trackingId: string;
  date: string;
  items: OrderItem[];
  pharmacy: Pharmacy;
  address: string;
  total: number;
  status: 'placed' | 'processing' | 'out_for_delivery' | 'delivered';
  statusSteps: { step: string; time: string; done: boolean }[];
}

interface DeliveryForm {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  landmark: string;
  payment: 'cod' | 'upi' | 'card';
}

const MOCK_PHARMACIES: Pharmacy[] = [
  { id: '1', name: 'Apollo Pharmacy', address: 'MG Road, Sector 14, Gurgaon', rating: 4.8, deliveryTime: '25-35 min', deliveryFee: 0, distance: '1.2 km', image: '💊', openNow: true },
  { id: '2', name: 'MedPlus', address: 'Connaught Place, New Delhi', rating: 4.6, deliveryTime: '30-40 min', deliveryFee: 15, distance: '2.1 km', image: '🏥', openNow: true },
  { id: '3', name: 'Netmeds Pharmacy', address: 'Sector 62, Noida', rating: 4.5, deliveryTime: '35-45 min', deliveryFee: 20, distance: '3.5 km', image: '💊', openNow: true },
  { id: '4', name: '1mg Pharmacy', address: 'Cyber Hub, Gurgaon', rating: 4.7, deliveryTime: '20-30 min', deliveryFee: 0, distance: '1.8 km', image: '🧪', openNow: true },
  { id: '5', name: 'Wellness Forever', address: 'Bandra West, Mumbai', rating: 4.4, deliveryTime: '40-50 min', deliveryFee: 25, distance: '4.2 km', image: '🏥', openNow: false },
];

const PARSED_MEDICINES: ParsedMedicine[] = [
  {
    id: '1', name: 'Amoxicillin 500mg', dosage: '500mg', frequency: 'Three times daily', duration: '7 days',
    quantity: 21, price: 85,
    alternatives: [
      { name: 'Azithromycin 250mg', price: 120, company: 'Cipla' },
      { name: 'Cefixime 200mg', price: 95, company: 'Lupin' },
    ],
    selected: true,
  },
  {
    id: '2', name: 'Paracetamol 650mg', dosage: '650mg', frequency: 'Every 8 hours', duration: '5 days',
    quantity: 15, price: 25,
    alternatives: [
      { name: 'Crocin Advance 500mg', price: 30, company: 'GSK' },
      { name: 'Dolo 650mg', price: 28, company: 'Micro Labs' },
    ],
    selected: true,
  },
  {
    id: '3', name: 'Pantoprazole 40mg', dosage: '40mg', frequency: 'Once daily before breakfast', duration: '14 days',
    quantity: 14, price: 120,
    alternatives: [
      { name: 'Omeprazole 20mg', price: 65, company: 'Alkem' },
      { name: 'Esomeprazole 40mg', price: 150, company: 'Dr. Reddy\'s' },
    ],
    selected: true,
  },
  {
    id: '4', name: 'Cetirizine 10mg', dosage: '10mg', frequency: 'Once daily at night', duration: '10 days',
    quantity: 10, price: 35,
    alternatives: [
      { name: 'Levocetirizine 5mg', price: 40, company: 'UCB' },
      { name: 'Fexofenadine 120mg', price: 55, company: 'Sanofi' },
    ],
    selected: true,
  },
  {
    id: '5', name: 'Ondansetron 4mg', dosage: '4mg', frequency: 'As needed for nausea', duration: '5 days',
    quantity: 5, price: 45,
    alternatives: [
      { name: 'Domperidone 10mg', price: 30, company: 'Janssen' },
    ],
    selected: true,
  },
];

const ORDER_STATUSES = ['placed', 'processing', 'out_for_delivery', 'delivered'] as const;
const STATUS_LABELS: Record<string, string> = {
  placed: 'Order Placed',
  processing: 'Pharmacy Processing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
};

export default function EPrescriptionPage() {
  const [currentView, setCurrentView] = useState<'upload' | 'parsed' | 'pharmacy' | 'checkout' | 'tracking' | 'history'>('upload');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; preview: string; type: string } | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsedMedicines, setParsedMedicines] = useState<ParsedMedicine[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [deliveryForm, setDeliveryForm] = useState<DeliveryForm>({ name: '', phone: '', address: '', city: '', pincode: '', landmark: '', payment: 'cod' });
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [parsingProgress, setParsingProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [trackingProgress, setTrackingProgress] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('zyntracare_eprescription_orders');
    if (saved) setOrderHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (orderHistory.length > 0) {
      localStorage.setItem('zyntracare_eprescription_orders', JSON.stringify(orderHistory));
    }
  }, [orderHistory]);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedFile({ name: file.name, preview: reader.result as string, type: file.type });
    };
    reader.readAsDataURL(file);
  };

  const startParsing = () => {
    if (!uploadedFile) return;
    setParsing(true);
    setParsingProgress(0);
    const interval = setInterval(() => {
      setParsingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setParsing(false);
          setParsedMedicines(PARSED_MEDICINES);
          setCurrentView('parsed');
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 300);
  };

  const toggleMedicine = (id: string) => {
    setParsedMedicines(prev => prev.map(m => m.id === id ? { ...m, selected: !m.selected } : m));
  };

  const updateQuantity = (id: string, delta: number) => {
    setParsedMedicines(prev => prev.map(m => m.id === id ? { ...m, quantity: Math.max(1, m.quantity + delta) } : m));
  };

  const selectedMeds = parsedMedicines.filter(m => m.selected);
  const subtotal = selectedMeds.reduce((sum, m) => sum + m.price * m.quantity, 0);
  const deliveryFee = selectedPharmacy?.deliveryFee || 0;
  const total = subtotal + deliveryFee;

  const placeOrder = () => {
    if (!selectedPharmacy) return;
    const trackingId = `ZYN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const now = new Date();
    const order: Order = {
      id: Date.now().toString(),
      trackingId,
      date: now.toISOString(),
      items: selectedMeds.map(m => ({ medicine: m, quantity: m.quantity })),
      pharmacy: selectedPharmacy,
      address: `${deliveryForm.address}, ${deliveryForm.city} - ${deliveryForm.pincode}`,
      total,
      status: 'placed',
      statusSteps: [
        { step: 'Order Placed', time: now.toLocaleTimeString(), done: true },
        { step: 'Pharmacy Processing', time: '', done: false },
        { step: 'Out for Delivery', time: '', done: false },
        { step: 'Delivered', time: '', done: false },
      ],
    };
    setCurrentOrder(order);
    setOrderHistory(prev => [order, ...prev]);
    setCurrentView('tracking');
    simulateTracking(order);
  };

  const simulateTracking = (order: Order) => {
    let step = 1;
    setTrackingProgress(0);
    const interval = setInterval(() => {
      if (step >= 4) {
        clearInterval(interval);
        setTrackingProgress(100);
        return;
      }
      setTrackingProgress(prev => Math.min(100, prev + 25));
      setCurrentOrder(prev => {
        if (!prev) return prev;
        const steps = [...prev.statusSteps];
        steps[step] = { ...steps[step], done: true, time: new Date().toLocaleTimeString() };
        return { ...prev, status: ORDER_STATUSES[step], statusSteps: steps };
      });
      step++;
    }, 3000);
  };

  const currentStepIndex = currentOrder ? ORDER_STATUSES.indexOf(currentOrder.status) : 0;

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 via-transparent to-teal-900/10" />
        <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl mb-6">
            <FiFileText size={32} className="text-emerald-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            E-<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Prescription</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Upload your prescription, let AI parse it, and get medicines delivered to your doorstep.
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {[
            { key: 'upload' as const, label: 'Upload', icon: FiUpload },
            { key: 'parsed' as const, label: 'Parsed', icon: FiFileText, disabled: parsedMedicines.length === 0 },
            { key: 'pharmacy' as const, label: 'Pharmacy', icon: FiMapPin, disabled: !selectedPharmacy && currentView === 'upload' },
            { key: 'history' as const, label: 'History', icon: FiClock },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => !tab.disabled && setCurrentView(tab.key)}
              disabled={tab.disabled}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition ${
                currentView === tab.key
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : tab.disabled
                  ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* UPLOAD VIEW */}
          {currentView === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <FiUpload className="text-emerald-400" /> Upload Prescription
                </h2>

                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition ${
                    dragOver
                      ? 'border-emerald-400 bg-emerald-500/10'
                      : uploadedFile
                      ? 'border-emerald-500/50 bg-emerald-500/5'
                      : 'border-white/20 hover:border-emerald-500/50 hover:bg-white/5'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  {uploadedFile ? (
                    <div className="space-y-4">
                      {uploadedFile.type.startsWith('image/') ? (
                        <img src={uploadedFile.preview} alt="Prescription" className="max-h-64 mx-auto rounded-xl" />
                      ) : (
                        <div className="w-20 h-20 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto">
                          <FiFileText size={36} className="text-emerald-400" />
                        </div>
                      )}
                      <p className="text-emerald-400 font-medium">{uploadedFile.name}</p>
                      <p className="text-gray-400 text-sm">Click to change file</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto">
                        <FiUpload size={36} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="text-lg font-bold">Drag & drop your prescription</p>
                        <p className="text-gray-400 text-sm mt-1">Supports JPG, PNG, PDF (max 10MB)</p>
                      </div>
                    </div>
                  )}
                </div>

                {uploadedFile && !parsing && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-center">
                    <button
                      onClick={startParsing}
                      className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl font-bold transition inline-flex items-center gap-2"
                    >
                      <FiFileText size={18} /> Parse with AI
                    </button>
                  </motion.div>
                )}

                {parsing && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
                    <div className="bg-white/5 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                        <div>
                          <p className="font-bold">Analyzing Prescription...</p>
                          <p className="text-sm text-gray-400">AI is reading your prescription and extracting medicine details</p>
                        </div>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2.5">
                        <motion.div
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full"
                          animate={{ width: `${Math.min(parsingProgress, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-2">{Math.min(Math.round(parsingProgress), 100)}% complete</p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Sample Prescriptions */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                <h3 className="text-lg font-bold mb-4">Try a Sample Prescription</h3>
                <p className="text-gray-400 text-sm mb-4">Click below to simulate parsing a common prescription</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {['General Fever & Infection', 'Diabetes Management', 'Hypertension Package'].map((sample, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setUploadedFile({ name: `${sample.replace(/\s/g, '_')}.jpg`, preview: '', type: 'image/jpeg' });
                        setTimeout(() => {
                          setParsing(true);
                          setParsingProgress(0);
                          const interval = setInterval(() => {
                            setParsingProgress(prev => {
                              if (prev >= 100) {
                                clearInterval(interval);
                                setParsing(false);
                                setParsedMedicines(PARSED_MEDICINES);
                                setCurrentView('parsed');
                                return 100;
                              }
                              return prev + Math.random() * 15 + 5;
                            });
                          }, 300);
                        }, 100);
                      }}
                      className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition"
                    >
                      <FiFileText className="text-emerald-400 mb-2" size={24} />
                      <p className="font-bold text-sm">{sample}</p>
                      <p className="text-xs text-gray-400 mt-1">3-5 medicines detected</p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* PARSED VIEW */}
          {currentView === 'parsed' && (
            <motion.div key="parsed" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <FiCheckCircle className="text-emerald-400" /> Parsed Medicines
                  </h2>
                  <span className="text-sm text-gray-400">{selectedMeds.length} of {parsedMedicines.length} selected</span>
                </div>

                <div className="space-y-4">
                  {parsedMedicines.map((med, idx) => (
                    <motion.div
                      key={med.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`p-5 rounded-2xl border transition ${
                        med.selected ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-white/5 border-white/10 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleMedicine(med.id)}
                              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition ${
                                med.selected ? 'bg-emerald-500 border-emerald-500' : 'border-white/30'
                              }`}
                            >
                              {med.selected && <FiCheck size={14} className="text-white" />}
                            </button>
                            <div>
                              <h3 className="font-bold text-lg">{med.name}</h3>
                              <p className="text-sm text-gray-400">
                                {med.dosage} • {med.frequency} • {med.duration}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 ml-9 flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400 text-sm">Qty:</span>
                              <button
                                onClick={() => updateQuantity(med.id, -1)}
                                className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition"
                              >
                                <FiMinus size={14} />
                              </button>
                              <span className="w-8 text-center font-bold">{med.quantity}</span>
                              <button
                                onClick={() => updateQuantity(med.id, 1)}
                                className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition"
                              >
                                <FiPlus size={14} />
                              </button>
                            </div>
                            <span className="text-emerald-400 font-bold">₹{med.price * med.quantity}</span>
                          </div>

                          {med.alternatives.length > 0 && (
                            <div className="mt-3 ml-9">
                              <p className="text-xs text-gray-400 mb-1">Alternatives available:</p>
                              <div className="flex flex-wrap gap-2">
                                {med.alternatives.map((alt, ai) => (
                                  <span key={ai} className="text-xs bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                                    {alt.name} - ₹{alt.price} ({alt.company})
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white/5 rounded-xl">
                  <div>
                    <p className="text-gray-400 text-sm">Subtotal ({selectedMeds.length} items)</p>
                    <p className="text-2xl font-black text-emerald-400">₹{subtotal}</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCurrentView('upload')}
                      className="px-6 py-3 bg-white/10 hover:bg-white/15 rounded-xl font-medium transition"
                    >
                      Re-upload
                    </button>
                    <button
                      onClick={() => setCurrentView('pharmacy')}
                      disabled={selectedMeds.length === 0}
                      className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl font-bold transition flex items-center gap-2 disabled:opacity-50"
                    >
                      <FiMapPin size={18} /> Select Pharmacy
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* PHARMACY VIEW */}
          {currentView === 'pharmacy' && (
            <motion.div key="pharmacy" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <FiMapPin className="text-emerald-400" /> Select Nearby Pharmacy
                    </h2>
                    <div className="space-y-4">
                      {MOCK_PHARMACIES.map((pharmacy) => (
                        <button
                          key={pharmacy.id}
                          onClick={() => setSelectedPharmacy(pharmacy)}
                          className={`w-full p-5 rounded-2xl border text-left transition ${
                            selectedPharmacy?.id === pharmacy.id
                              ? 'bg-emerald-500/10 border-emerald-500/40'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <span className="text-3xl">{pharmacy.image}</span>
                              <div>
                                <h3 className="font-bold text-lg">{pharmacy.name}</h3>
                                <p className="text-sm text-gray-400 flex items-center gap-1">
                                  <FiMapPin size={12} /> {pharmacy.address}
                                </p>
                                <div className="flex items-center gap-4 mt-2">
                                  <span className="flex items-center gap-1 text-sm">
                                    <FiStar size={14} className="text-yellow-400" /> {pharmacy.rating}
                                  </span>
                                  <span className="flex items-center gap-1 text-sm text-gray-400">
                                    <FiClock size={14} /> {pharmacy.deliveryTime}
                                  </span>
                                  <span className="flex items-center gap-1 text-sm text-gray-400">
                                    {pharmacy.distance}
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    pharmacy.openNow ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                  }`}>
                                    {pharmacy.openNow ? 'Open Now' : 'Closed'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${pharmacy.deliveryFee === 0 ? 'text-green-400' : 'text-gray-300'}`}>
                                {pharmacy.deliveryFee === 0 ? 'FREE' : `₹${pharmacy.deliveryFee}`}
                              </p>
                              <p className="text-xs text-gray-400">delivery</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Order Summary */}
                  <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                    <h3 className="font-bold mb-4">Order Summary</h3>
                    <div className="space-y-3">
                      {selectedMeds.map(med => (
                        <div key={med.id} className="flex justify-between text-sm">
                          <span className="text-gray-300 truncate flex-1 mr-2">{med.name} × {med.quantity}</span>
                          <span className="font-medium">₹{med.price * med.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-white/10 mt-4 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Subtotal</span>
                        <span>₹{subtotal}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Delivery</span>
                        <span className={deliveryFee === 0 ? 'text-green-400' : ''}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t border-white/10 pt-2">
                        <span>Total</span>
                        <span className="text-emerald-400">₹{total}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentView('checkout')}
                    disabled={!selectedPharmacy}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    Proceed to Checkout <FiArrowRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* CHECKOUT VIEW */}
          {currentView === 'checkout' && (
            <motion.div key="checkout" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="grid lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                  <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <FiHome className="text-emerald-400" /> Delivery Address
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { key: 'name', label: 'Full Name', placeholder: 'Enter your full name', colSpan: false },
                        { key: 'phone', label: 'Phone Number', placeholder: '+91 XXXXX XXXXX', colSpan: false },
                        { key: 'address', label: 'Address', placeholder: 'Flat no., Building, Street', colSpan: true },
                        { key: 'landmark', label: 'Landmark', placeholder: 'Nearby landmark', colSpan: false },
                        { key: 'city', label: 'City', placeholder: 'City', colSpan: false },
                        { key: 'pincode', label: 'Pincode', placeholder: '000000', colSpan: false },
                      ].map(field => (
                        <div key={field.key} className={field.colSpan ? 'sm:col-span-2' : ''}>
                          <label className="text-sm text-gray-400 mb-1 block">{field.label}</label>
                          <input
                            type="text"
                            placeholder={field.placeholder}
                            value={(deliveryForm as any)[field.key]}
                            onChange={(e) => setDeliveryForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition"
                          />
                        </div>
                      ))}
                    </div>

                    <h3 className="text-lg font-bold mt-8 mb-4">Payment Method</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { key: 'cod' as const, label: 'Cash on Delivery', icon: '💵' },
                        { key: 'upi' as const, label: 'UPI', icon: '📱' },
                        { key: 'card' as const, label: 'Card', icon: '💳' },
                      ].map(method => (
                        <button
                          key={method.key}
                          onClick={() => setDeliveryForm(prev => ({ ...prev, payment: method.key }))}
                          className={`p-4 rounded-xl border text-center transition ${
                            deliveryForm.payment === method.key
                              ? 'bg-emerald-500/10 border-emerald-500/40'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <span className="text-2xl block mb-2">{method.icon}</span>
                          <p className="text-sm font-medium">{method.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                    <h3 className="font-bold mb-2">Delivering from</h3>
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                      <span className="text-2xl">{selectedPharmacy?.image}</span>
                      <div>
                        <p className="font-bold">{selectedPharmacy?.name}</p>
                        <p className="text-xs text-gray-400">{selectedPharmacy?.deliveryTime}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                    <h3 className="font-bold mb-4">Order Total</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span>₹{subtotal}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Delivery</span><span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
                      <div className="flex justify-between text-lg font-bold border-t border-white/10 pt-2 mt-2">
                        <span>Total</span><span className="text-emerald-400">₹{total}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={placeOrder}
                    disabled={!deliveryForm.name || !deliveryForm.phone || !deliveryForm.address || !deliveryForm.city || !deliveryForm.pincode}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <FiShoppingCart size={20} /> Place Order — ₹{total}
                  </button>

                  <button onClick={() => setCurrentView('pharmacy')} className="w-full py-3 bg-white/10 hover:bg-white/15 rounded-xl font-medium transition flex items-center justify-center gap-2">
                    <FiArrowLeft size={18} /> Back to Pharmacy
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TRACKING VIEW */}
          {currentView === 'tracking' && currentOrder && (
            <motion.div key="tracking" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    {currentOrder.status === 'delivered' ? (
                      <FiCheckCircle size={40} className="text-emerald-400" />
                    ) : (
                      <FiPackage size={40} className="text-emerald-400" />
                    )}
                  </div>
                  <h2 className="text-2xl font-black">
                    {currentOrder.status === 'delivered' ? 'Order Delivered!' : 'Order Confirmed'}
                  </h2>
                  <p className="text-gray-400 mt-1">Tracking ID: <span className="text-emerald-400 font-mono">{currentOrder.trackingId}</span></p>
                </div>

                {/* Progress Tracker */}
                <div className="max-w-2xl mx-auto mb-8">
                  <div className="flex items-center justify-between mb-2">
                    {currentOrder.statusSteps.map((step, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all ${
                          step.done
                            ? 'bg-emerald-500 text-white'
                            : i === currentStepIndex
                            ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 animate-pulse'
                            : 'bg-white/10 text-gray-500'
                        }`}>
                          {step.done ? <FiCheck size={18} /> : <span className="text-sm font-bold">{i + 1}</span>}
                        </div>
                        <p className={`text-xs mt-2 text-center ${step.done ? 'text-emerald-400' : 'text-gray-500'}`}>{step.step}</p>
                        {step.time && <p className="text-xs text-gray-500">{step.time}</p>}
                        {i < currentOrder.statusSteps.length - 1 && (
                          <div className={`absolute top-5 left-1/2 w-full h-0.5 ${
                            step.done ? 'bg-emerald-500' : 'bg-white/10'
                          }`} style={{ zIndex: 0 }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Details */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-xl p-5">
                    <h3 className="font-bold mb-3 flex items-center gap-2"><FiMapPin size={16} className="text-emerald-400" /> Delivery Address</h3>
                    <p className="text-gray-300 text-sm">{currentOrder.address}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-5">
                    <h3 className="font-bold mb-3 flex items-center gap-2"><FiPackage size={16} className="text-emerald-400" /> Pharmacy</h3>
                    <p className="font-medium">{currentOrder.pharmacy.name}</p>
                    <p className="text-gray-400 text-sm">{currentOrder.pharmacy.address}</p>
                  </div>
                </div>

                <div className="mt-6 bg-white/5 rounded-xl p-5">
                  <h3 className="font-bold mb-3">Items Ordered</h3>
                  <div className="space-y-2">
                    {currentOrder.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-300">{item.medicine.name} × {item.quantity}</span>
                        <span className="font-medium">₹{item.medicine.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
                      <span>Total Paid</span>
                      <span className="text-emerald-400">₹{currentOrder.total}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button onClick={() => { setCurrentView('history'); setCurrentOrder(null); }} className="px-6 py-3 bg-white/10 hover:bg-white/15 rounded-xl font-medium transition">
                  View Order History
                </button>
                <Link href="/" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold transition text-center">
                  Back to Home
                </Link>
              </div>
            </motion.div>
          )}

          {/* HISTORY VIEW */}
          {currentView === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <FiClock className="text-emerald-400" /> Order History
                </h2>

                {orderHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <FiShoppingCart size={48} className="text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No orders yet</p>
                    <p className="text-gray-500 text-sm mt-1">Upload a prescription to get started</p>
                    <button
                      onClick={() => setCurrentView('upload')}
                      className="mt-4 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold transition"
                    >
                      Upload Prescription
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orderHistory.map((order) => (
                      <div key={order.id} className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-bold">Order #{order.trackingId}</p>
                            <p className="text-sm text-gray-400">{new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                            order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                            order.status === 'out_for_delivery' ? 'bg-blue-500/20 text-blue-400' :
                            order.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {STATUS_LABELS[order.status]}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-400">{order.pharmacy.name} • {order.items.length} items</p>
                          </div>
                          <p className="font-bold text-emerald-400">₹{order.total}</p>
                        </div>
                        <button
                          onClick={() => { setCurrentOrder(order); setCurrentView('tracking'); }}
                          className="mt-3 text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                        >
                          View Details <FiExternalLink size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
