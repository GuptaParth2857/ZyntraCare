'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDroplet, FiSearch, FiMapPin, FiPhone, FiUser, FiAlertCircle, FiCheckCircle, FiShare2, FiClock, FiActivity } from 'react-icons/fi';
import { EK_BLOOD_GROUPS, EK_COMPONENTS } from '@/lib/eraktkosh';

interface BloodDonor {
  id: string;
  name: string;
  bloodType: string;
  location: string;
  phone: string;
  available: boolean;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function BloodDonorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlood, setSelectedBlood] = useState<string>('');
  const [donors, setDonors] = useState<BloodDonor[]>([]);
  const [stats, setStats] = useState<{ total: number; cities: number; groups: number }>({ total: 0, cities: 0, groups: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRequest, setShowRequest] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [requestForm, setRequestForm] = useState({ name: '', phone: '', bloodType: '', urgency: 'normal', location: '', message: '' });
  const [requestSent, setRequestSent] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [registerForm, setRegisterForm] = useState({ name: '', phone: '', email: '', bloodGroup: '', city: '' });
  const [registerSent, setRegisterSent] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [activeTab, setActiveTab] = useState<'donors' | 'banks' | 'stock'>('donors');
  const [bankCity, setBankCity] = useState('');
  const [banks, setBanks] = useState<any[]>([]);
  const [banksTotal, setBanksTotal] = useState(0);
  const [banksLoading, setBanksLoading] = useState(false);
  const [banksError, setBanksError] = useState('');
  const [banksMeta, setBanksMeta] = useState<{ live: boolean; partial?: boolean; source?: string } | null>(null);
  const [stockState, setStockState] = useState('');
  const [stockDistrict, setStockDistrict] = useState('');
  const [stockDistricts, setStockDistricts] = useState<{ code: string; name: string }[]>([]);
  const [stockGroup, setStockGroup] = useState('all');
  const [stockComponent, setStockComponent] = useState('11');
  const [stockBanks, setStockBanks] = useState<any[]>([]);
  const [stockTotal, setStockTotal] = useState(0);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockError, setStockError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let attempts = 0;
    const fetchDonors = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch('/api/blood-donors');
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || 'Failed to load donors');
        }
        const data = await res.json();
        const rawDonors = Array.isArray(data) ? data : (Array.isArray(data?.donors) ? data.donors : []);
        const mapped = rawDonors.map((d: any) => ({
          id: d.id || String(Math.random()),
          name: d.name || 'Anonymous',
          bloodType: d.bloodType || d.bloodGroup || '',
          location: d.location || d.city || '',
          phone: d.phone || '',
          available: Boolean(d.phone || d.available),
        }));
        setDonors(mapped);
        if (data.stats) setStats({ total: data.stats.total || mapped.length, cities: data.stats.cities || 0, groups: data.stats.groups || 0 });
      } catch (err) {
        attempts += 1;
        console.error('Error fetching donors:', err);
        if (attempts < 2) {
          setTimeout(fetchDonors, 2500);
        } else {
          setError('Failed to load donors');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDonors();
  }, []);

  const filteredDonors = donors.filter(donor => {
    const matchesSearch = !searchQuery || donor.location.toLowerCase().includes(searchQuery.toLowerCase()) || donor.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBlood = !selectedBlood || donor.bloodType === selectedBlood;
    return matchesSearch && matchesBlood;
  });

  const fetchBanks = async (city: string) => {
    setBanksLoading(true);
    setBanksError('');
    setBanksMeta(null);
    try {
      const q = city ? `?city=${encodeURIComponent(city)}&limit=30` : '?limit=30';
      const res = await fetch(`/api/blood-banks${q}`);
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        setBanks([]);
        setBanksTotal(0);
        setBanksError(err?.error || 'Failed to load blood banks');
        return;
      }
      const data = await res.json();
      setBanks(data.banks || []);
      setBanksTotal(data.total || 0);
      if (data.live === false || data.partial) {
        setBanksMeta({ live: false, partial: data.partial, source: data.source });
      } else {
        setBanksMeta({ live: true });
      }
    } catch (err) {
      console.error('Error fetching blood banks:', err);
      setBanksError('Failed to load blood banks');
    }
    setBanksLoading(false);
  };

  const loadDistricts = async (state: string) => {
    setStockDistricts([]);
    setStockDistrict('');
    if (!state) return;
    try {
      const res = await fetch(`/api/eraktkosh?action=districts&state=${encodeURIComponent(state)}`);
      if (!res.ok) return;
      const data = await res.json();
      setStockDistricts(data.districts || []);
    } catch (err) {
      console.error('error loading districts:', err);
    }
  };

  const fetchStock = async () => {
    if (!stockState || !stockDistrict) return;
    setStockLoading(true);
    setStockError('');
    try {
      const q = `/api/eraktkosh?action=stock&state=${encodeURIComponent(stockState)}&district=${encodeURIComponent(stockDistrict)}&group=${encodeURIComponent(stockGroup)}&component=${encodeURIComponent(stockComponent)}`;
      const res = await fetch(q);
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setStockBanks([]);
        setStockTotal(0);
        setStockError(data?.error || 'Failed to load blood stock');
        return;
      }
      setStockBanks(data.banks || []);
      setStockTotal(data.total || 0);
    } catch (err) {
      console.error('error fetching stock:', err);
      setStockError('Failed to load blood stock');
    }
    setStockLoading(false);
  };

  const handleRequest = async () => {
    setRequestError('');
    try {
      const res = await fetch('/api/blood-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestForm),
      });
      if (!res.ok) throw new Error('Failed to send request');
      setRequestSent(true);
      setTimeout(() => {
        setShowRequest(false);
        setRequestSent(false);
        setRequestForm({ name: '', phone: '', bloodType: '', urgency: 'normal', location: '', message: '' });
      }, 3000);
    } catch (err) {
      setRequestError('Failed to send request. Please try again.');
    }
  };

  const handleRegister = async () => {
    setRegisterError('');
    setRegisterLoading(true);
    try {
      const res = await fetch('/api/blood-donors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm),
      });
      if (!res.ok) throw new Error('Failed to register');
      setRegisterSent(true);
      setTimeout(() => {
        setShowRegister(false);
        setRegisterSent(false);
        setRegisterForm({ name: '', phone: '', email: '', bloodGroup: '', city: '' });
      }, 3000);
    } catch (err) {
      setRegisterError('Failed to register. Please try again.');
    }
    setRegisterLoading(false);
  };

  const bloodTypeColors: Record<string, string> = {
    'A+': 'bg-red-500/20 text-red-300 border-red-500/30',
    'A-': 'bg-red-500/10 text-red-300 border-red-500/20',
    'B+': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    'B-': 'bg-orange-500/10 text-orange-300 border-orange-500/20',
    'AB+': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'AB-': 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    'O+': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'O-': 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/15 via-transparent to-red-950/10" />
        <div className="absolute top-[8%] left-[-10%] w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[15%] right-[-10%] w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-red-500/10 border border-red-500/30 rounded-2xl mb-6">
            <FiDroplet size={32} className="text-red-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Blood Donor <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400">Network</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Real donors, government blood banks and live e-RaktKosh stock across India.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <FiDroplet className="text-red-400" />, value: stats.total, label: 'Total Donors' },
            { icon: <FiMapPin className="text-emerald-400" />, value: stats.cities, label: 'Cities Covered' },
            { icon: <FiActivity className="text-blue-400" />, value: stats.groups, label: 'Blood Groups' },
            { icon: <FiUser className="text-purple-400" />, value: filteredDonors.length, label: 'Showing Now' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-5"
            >
              <div className="flex items-center gap-2 mb-1">{s.icon}<span className="text-xs text-gray-400">{s.label}</span></div>
              <p className="text-3xl font-black">{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Search + Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search donors by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
              />
            </div>
            <button
              onClick={() => setShowRegister(true)}
              className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 rounded-xl font-bold flex items-center justify-center gap-2 transition"
            >
              <FiUser /> Register as Donor
            </button>
            <button
              onClick={() => setShowRequest(true)}
              className="px-6 py-4 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 rounded-xl font-bold flex items-center justify-center gap-2 transition"
            >
              <FiAlertCircle /> Request Blood
            </button>
          </div>
          <div className="flex gap-2 flex-wrap mt-4">
            {BLOOD_GROUPS.map(blood => (
              <button
                key={blood}
                onClick={() => setSelectedBlood(selectedBlood === blood ? '' : blood)}
                className={`px-4 py-2 rounded-xl font-bold transition ${
                  selectedBlood === blood
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                }`}
              >
                {blood}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tabs + Content */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { id: 'donors', label: 'Blood Donors' },
            { id: 'banks', label: 'Blood Banks' },
            { id: 'stock', label: 'Live Stock (e-RaktKosh)' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/20'
                  : 'bg-slate-900/80 border border-white/10 text-white/70 hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'banks' && (
          <div>
            <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 mb-4">
              <div className="flex flex-col md:flex-row gap-4 items-stretch">
                <input
                  type="text"
                  value={bankCity}
                  onChange={(e) => setBankCity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchBanks(bankCity)}
                  placeholder="Search blood banks by city (e.g. Delhi, Mumbai, Pune)..."
                  className="flex-1 bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
                <button
                  onClick={() => fetchBanks(bankCity)}
                  disabled={banksLoading}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 rounded-xl font-bold disabled:opacity-50 transition"
                >
                  {banksLoading ? 'Searching...' : 'Search Banks'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Source: data.gov.in — National Blood Bank Directory (NACO, Ministry of Health &amp; Family Welfare, Govt. of India)
              </p>
            </div>

            {banksMeta && !banksMeta.live && (
              <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-xs text-amber-300">
                The live government API is briefly rate-limited, so showing the official directory snapshot right now. It auto-refreshes within a few minutes — try again or set your own free data.gov.in API key (&apos;OGD_API_KEY&apos;) for the full live list.
              </div>
            )}

            {banksLoading ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Fetching blood banks from government directory...</p>
              </div>
            ) : banksError ? (
              <div className="text-center py-16">
                <FiAlertCircle className="text-4xl text-red-500 mx-auto mb-4" />
                <p className="text-xl font-bold text-red-400">{banksError}</p>
                <button onClick={() => fetchBanks(bankCity)} className="mt-4 px-6 py-3 bg-red-500/20 text-red-400 rounded-xl font-bold">
                  Retry
                </button>
              </div>
            ) : banks.length === 0 ? (
              <div className="text-center py-16">
                <FiDroplet className="text-6xl text-gray-700 mx-auto mb-4" />
                <p className="text-xl font-bold">No blood banks found</p>
                <p className="text-gray-400">Try searching by another city</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-400 mb-4">{banksTotal} verified blood banks found</p>
                <div className="grid md:grid-cols-2 gap-4">
                  {banks.map((bank: any) => (
                    <div key={bank.id} className="bg-slate-900/80 backdrop-blur-xl rounded-[2rem] border border-white/10 p-5 hover:border-red-500/40 transition">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-bold flex items-center gap-2"><FiMapPin className="text-red-400 shrink-0" /> {bank.name}</h3>
                        {bank.category && <span className="shrink-0 px-3 py-1 rounded-full text-[11px] font-bold bg-red-500/15 text-red-300">{bank.category}</span>}
                      </div>
                      <p className="text-sm text-gray-400 mt-2">{bank.address}{bank.city ? `, ${bank.city}` : ''}{bank.district ? `, ${bank.district}` : ''}{bank.state ? `, ${bank.state}` : ''} {bank.pincode ? `- ${bank.pincode}` : ''}</p>
                      {bank.serviceTime && <p className="text-xs text-gray-500 mt-1"><FiClock className="inline mr-1" />Service: {bank.serviceTime}</p>}
                      {bank.bloodComponents && <p className="text-xs text-emerald-400 mt-1">Components: {bank.bloodComponents}</p>}
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {bank.contact && (
                          <a href={`tel:${bank.contact.replace(/\s+/g, '')}`} className="flex items-center gap-2 py-2.5 px-3 bg-red-500/15 text-red-300 rounded-xl font-bold text-sm hover:bg-red-500/25 transition">
                            <FiPhone size={14} /> {bank.contact}
                          </a>
                        )}
                        {bank.helpline && (
                          <a href={`tel:${bank.helpline.replace(/\s+/g, '')}`} className="flex items-center gap-2 py-2.5 px-3 bg-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/20 transition">
                            <FiAlertCircle size={14} /> Help: {bank.helpline}
                          </a>
                        )}
                        {bank.email && (
                          <a href={`mailto:${bank.email}`} className="flex items-center gap-2 py-2.5 px-3 bg-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/20 transition truncate">
                            <FiShare2 size={14} /> {bank.email}
                          </a>
                        )}
                        {bank.website && (
                          <a href={bank.website.startsWith('http') ? bank.website : `https://${bank.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 py-2.5 px-3 bg-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/20 transition truncate">
                            <FiShare2 size={14} /> Website
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'stock' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <select
                value={stockState}
                onChange={(e) => { setStockState(e.target.value); loadDistricts(e.target.value); }}
                className="bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none"
              >
                <option value="">Select State</option>
                <option value="97">Delhi</option>
                <option value="27">Maharashtra</option>
                <option value="29">Karnataka</option>
                <option value="36">Telangana</option>
                <option value="28">Andhra Pradesh</option>
                <option value="33">Tamil Nadu</option>
                <option value="32">Kerala</option>
                <option value="24">Gujarat</option>
                <option value="19">West Bengal</option>
                <option value="10">Bihar</option>
                <option value="21">Odisha</option>
                <option value="23">Madhya Pradesh</option>
                <option value="99">Uttar Pradesh</option>
                <option value="98">Rajasthan</option>
                <option value="30">Goa</option>
                <option value="18">Assam</option>
                <option value="11">Sikkim</option>
                <option value="13">Nagaland</option>
                <option value="16">Tripura</option>
                <option value="17">Meghalaya</option>
                <option value="15">Mizoram</option>
                <option value="14">Manipur</option>
                <option value="12">Arunachal Pradesh</option>
              </select>
              <select
                value={stockDistrict}
                onChange={(e) => setStockDistrict(e.target.value)}
                className="bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none"
              >
                <option value="">Select District</option>
                {stockDistricts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
              </select>
              <select
                value={stockGroup}
                onChange={(e) => setStockGroup(e.target.value)}
                className="bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none"
              >
                {EK_BLOOD_GROUPS.map(g => <option key={g.code} value={g.code}>{g.name}</option>)}
              </select>
              <select
                value={stockComponent}
                onChange={(e) => setStockComponent(e.target.value)}
                className="bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none"
              >
                {EK_COMPONENTS.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <button
                onClick={fetchStock}
                disabled={stockLoading || !stockState || !stockDistrict}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 rounded-xl font-bold disabled:opacity-50 transition"
              >
                {stockLoading ? 'Checking stock...' : 'Check Live Stock'}
              </button>
              {stockTotal > 0 && (
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <FiActivity className="text-red-400" /> {stockTotal} blood banks reported stock
                </span>
              )}
            </div>
            <p className="text-xs text-amber-300/90 mb-6">
              Real-time stock from e-RaktKosh — National Blood Transfusion Council, Ministry of Health &amp; Family Welfare. Stock changes constantly — call the bank to confirm before you go.
            </p>

            {stockLoading ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Fetching live stock from e-RaktKosh...</p>
              </div>
            ) : stockError ? (
              <div className="text-center py-16">
                <FiAlertCircle className="text-4xl text-red-500 mx-auto mb-4" />
                <p className="text-xl font-bold text-red-400">{stockError}</p>
                <button onClick={fetchStock} className="mt-4 px-6 py-3 bg-red-500/20 text-red-400 rounded-xl font-bold">Retry</button>
              </div>
            ) : stockBanks.length === 0 ? (
              <div className="text-center py-16">
                <FiDroplet className="text-6xl text-gray-700 mx-auto mb-4" />
                <p className="text-xl font-bold">No stock data yet</p>
                <p className="text-gray-400">Select state + district and press Check Live Stock</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {stockBanks.map((bank, idx) => (
                  <div key={`${bank.name}-${idx}`} className="bg-slate-900/80 backdrop-blur-xl rounded-[2rem] border border-white/10 p-5 hover:border-red-500/40 transition">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-bold text-white">{bank.name}</h4>
                        <p className="text-xs text-gray-400">{bank.category || 'Blood Bank'}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ${bank.available ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {bank.available ? 'AVAILABLE' : 'NOT AVAILABLE'}
                      </span>
                    </div>
                    {bank.address && <p className="text-sm text-gray-400 mb-2">{bank.address}</p>}
                    {Object.keys(bank.units || {}).length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {Object.entries(bank.units).map(([group, val]) => (
                          <span key={group} className="bg-slate-900/70 border border-white/10 rounded-full px-3 py-1 text-xs font-bold text-white">
                            {group}: <span className="text-red-400">{String(val)} units</span>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-400 flex-wrap gap-2">
                      <span className="flex items-center gap-1"><FiClock size={12} /> {bank.lastUpdated || '—'}</span>
                      {bank.phone && (
                        <a href={`tel:${bank.phone.replace(/[^0-9+]/g, '')}`} className="text-red-400 font-bold flex items-center gap-1">
                          <FiPhone size={12} /> {bank.phone}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'donors' && (
        <>
        <h2 className="text-2xl font-black mb-6">
          Nearby Donors <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400">({filteredDonors.length})</span>
        </h2>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Finding donors near you...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <FiAlertCircle className="text-4xl text-red-500 mx-auto mb-4" />
            <p className="text-xl font-bold text-red-400">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-6 py-3 bg-red-500/20 text-red-400 rounded-xl font-bold">
              Retry
            </button>
          </div>
        ) : (<>
          <AnimatePresence>
            <div className="grid md:grid-cols-2 gap-4">
            {filteredDonors.map((donor, index) => (
              <motion.div
                key={donor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-900/80 backdrop-blur-xl rounded-[2rem] border border-white/10 p-5 hover:border-red-500/40 transition"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl ${bloodTypeColors[donor.bloodType]}`}>
                    {donor.bloodType}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{donor.name}</h3>
                      {donor.available && <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> NOW</span>}
                    </div>
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      <FiMapPin size={12} /> {donor.location || 'Location not shared'}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${donor.available ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {donor.available ? 'Available' : 'Unavailable'}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <a
                    href={`tel:${donor.phone}`}
                    className="flex-1 py-3 bg-red-500/20 text-red-400 rounded-xl font-bold text-center flex items-center justify-center gap-2 hover:bg-red-500/30 transition"
                  >
                    <FiPhone size={16} /> Call
                  </a>
                  <button className="flex-1 py-3 bg-white/10 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition">
                    <FiShare2 size={16} /> Share
                  </button>
                </div>
              </motion.div>
            ))}
            </div>
          </AnimatePresence>

        {filteredDonors.length === 0 && !loading && !error && (
          <div className="text-center py-16">
            <FiDroplet className="text-6xl text-gray-700 mx-auto mb-4" />
            <p className="text-xl font-bold">No donors found</p>
            <p className="text-gray-400">Try changing your filters or request blood</p>
          </div>
        )}
        </>)}
        </>
        )}
      </div>

      {/* Register as Donor Modal */}
      <AnimatePresence>
        {showRegister && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !registerSent && setShowRegister(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 rounded-3xl border border-white/10 p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {registerSent ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCheckCircle className="text-emerald-400 text-4xl" />
                  </div>
                  <h3 className="text-xl font-bold">Registered!</h3>
                  <p className="text-gray-400 mt-2">You're now registered as a blood donor</p>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <FiUser className="text-emerald-400" /> Register as Donor
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400">Full Name *</label>
                      <input
                        type="text"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                        className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Phone *</label>
                      <input
                        type="tel"
                        value={registerForm.phone}
                        onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                        className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                        placeholder="10-digit phone"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Email</label>
                      <input
                        type="email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                        className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400">Blood Group *</label>
                        <select
                          value={registerForm.bloodGroup}
                          onChange={(e) => setRegisterForm({...registerForm, bloodGroup: e.target.value})}
                          className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                        >
                          <option value="">Select</option>
                          {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">City *</label>
                        <input
                          type="text"
                          value={registerForm.city}
                          onChange={(e) => setRegisterForm({...registerForm, city: e.target.value})}
                          className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                          placeholder="Your city"
                        />
                      </div>
                    </div>
                    {registerError && <p className="text-red-400 text-sm">{registerError}</p>}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowRegister(false)}
                        className="flex-1 py-3 bg-white/10 text-white rounded-xl font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRegister}
                        disabled={registerLoading || !registerForm.name || !registerForm.phone || !registerForm.bloodGroup || !registerForm.city}
                        className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-bold disabled:opacity-50"
                      >
                        {registerLoading ? 'Registering...' : 'Register'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Request Modal */}
      <AnimatePresence>
        {showRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !requestSent && setShowRequest(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 rounded-3xl border border-white/10 p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {requestSent ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCheckCircle className="text-emerald-400 text-4xl" />
                  </div>
                  <h3 className="text-xl font-bold">Request Sent!</h3>
                  <p className="text-gray-400 mt-2">Donors in your area will be notified</p>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <FiAlertCircle className="text-red-400" /> Request Blood
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400">Patient Name *</label>
                      <input
                        type="text"
                        value={requestForm.name}
                        onChange={(e) => setRequestForm({...requestForm, name: e.target.value})}
                        className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                        placeholder="Patient's name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400">Blood Type *</label>
                        <select
                          value={requestForm.bloodType}
                          onChange={(e) => setRequestForm({...requestForm, bloodType: e.target.value})}
                          className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                        >
                          <option value="">Select</option>
                          {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Urgency</label>
                        <select
                          value={requestForm.urgency}
                          onChange={(e) => setRequestForm({...requestForm, urgency: e.target.value})}
                          className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                        >
                          <option value="normal">Normal</option>
                          <option value="urgent">Urgent</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Location *</label>
                      <input
                        type="text"
                        value={requestForm.location}
                        onChange={(e) => setRequestForm({...requestForm, location: e.target.value})}
                        className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                        placeholder="Hospital/Address"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Contact Phone *</label>
                      <input
                        type="tel"
                        value={requestForm.phone}
                        onChange={(e) => setRequestForm({...requestForm, phone: e.target.value})}
                        className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                        placeholder="10-digit phone"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Message (Optional)</label>
                      <textarea
                        value={requestForm.message}
                        onChange={(e) => setRequestForm({...requestForm, message: e.target.value})}
                        className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 h-24 focus:border-red-500 focus:outline-none"
                        placeholder="Additional details..."
                      />
                    </div>
                    {requestError && <p className="text-red-400 text-sm">{requestError}</p>}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowRequest(false)}
                        className="flex-1 py-3 bg-white/10 text-white rounded-xl font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRequest}
                        disabled={!requestForm.name || !requestForm.bloodType || !requestForm.location || !requestForm.phone}
                        className="flex-1 py-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl font-bold disabled:opacity-50"
                      >
                        Send Request
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}