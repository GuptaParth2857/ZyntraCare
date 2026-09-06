'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { FiSearch, FiMapPin, FiCheckCircle, FiAlertCircle, FiHeart, FiUsers, FiActivity, FiShield } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface Donor {
  id: string;
  name: string;
  bloodType: string;
  organs: string[];
  city: string;
  isActive: boolean;
}

interface Recipient {
  id: string;
  name: string;
  organNeeded: string;
  bloodType: string;
  urgency: string;
  city: string;
}

interface DonorMatch {
  donorId: string;
  donorName: string;
  bloodType: string;
  organ: string[];
  city: string;
  matchScore: number;
  isCompatible: boolean;
}

interface MatchGroup {
  recipient: Recipient;
  matches: DonorMatch[];
}

interface MatchResult {
  recipientName: string;
  donorName: string;
  organ: string;
  score: number;
  recipientCity: string;
  donorCity: string;
  compatible: boolean;
}

interface RegisterFormState {
  name: string;
  bloodType: string;
  organ: string;
  city: string;
  urgency: string;
  age: string;
}

interface NationalCard { label: string; value: string; note: string; year: number }
interface OrganRow { organ: string; living: string; deceased: string }
interface TopState { state: string; transplants: string; note?: string }
interface NationalData {
  updatedAt: string;
  source: string;
  cards: NationalCard[];
  organWise: OrganRow[];
  topStates: TopState[];
  milestone: string;
}

const ORGANS = ['Kidney', 'Liver', 'Heart', 'Cornea'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const urgencyColor = (urgency: string) => {
  switch (urgency?.toUpperCase()) {
    case 'CRITICAL': return 'bg-red-500 text-white';
    case 'HIGH': return 'bg-orange-500 text-white';
    case 'LOW': return 'bg-green-500 text-white';
    default: return 'bg-yellow-500 text-black';
  }
};

export default function OrganMatchingPage() {
  const [activeTab, setActiveTab] = useState<'donors' | 'recipients' | 'matches'>('donors');
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodFilter, setBloodFilter] = useState('all');
  const [organFilter, setOrganFilter] = useState('all');
  const [donors, setDonors] = useState<Donor[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [matchGroups, setMatchGroups] = useState<MatchGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [national, setNational] = useState<NationalData | null>(null);
  const [nationalError, setNationalError] = useState('');

  const [showDonorModal, setShowDonorModal] = useState(false);
  const [showRecipientModal, setShowRecipientModal] = useState(false);
  const [form, setForm] = useState<RegisterFormState>({ name: '', bloodType: '', organ: '', city: '', urgency: 'MEDIUM', age: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formOk, setFormOk] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/organ-matching');
      if (!res.ok) throw new Error('Failed to load data');
      const data = await res.json();
      setDonors(data.donors || []);
      setRecipients(data.recipients || []);
      setMatchGroups(data.matches || []);
      setLoading(false);
      return data;
    } catch (err) {
      console.error('organ matching fetch error:', err);
      setError('Failed to load organ registry');
      setLoading(false);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetch('/api/national-organs')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { setNational(data); setNationalError(''); })
      .catch(err => { console.error('national organs fetch error:', err); setNationalError('National stats unavailable'); });
  }, []);

  const compatibleCount = matchGroups.reduce((acc, g) => acc + g.matches.filter(m => m.isCompatible).length, 0);
  const totalRegistrations = matchGroups.length;

  const runMatching = async () => {
    setIsMatching(true);
    setMatchResult(null);
    const data = await fetchData();
    const groups = (data?.matches || []) as MatchGroup[];
    let best: MatchResult | null = null;
    for (const group of groups) {
      for (const m of group.matches) {
        if (!best || m.matchScore > best.score) {
          best = {
            recipientName: group.recipient.name || 'Recipient',
            donorName: m.donorName || 'Donor',
            organ: group.recipient.organNeeded,
            score: m.matchScore,
            recipientCity: group.recipient.city || 'Unknown',
            donorCity: m.city || 'Unknown',
            compatible: m.isCompatible,
          };
        }
      }
    }
    setMatchResult(best);
    setIsMatching(false);
  };

  const submitRegistration = async (type: 'donor' | 'recipient') => {
    setFormError('');
    setFormLoading(true);
    setFormOk(false);
    try {
      const body =
        type === 'donor'
          ? { type, organs: [form.organ].filter(Boolean), bloodType: form.bloodType || undefined, age: form.age ? Number(form.age) : undefined, city: form.city || undefined }
          : { type, organNeeded: form.organ, bloodType: form.bloodType || undefined, urgency: form.urgency, age: form.age ? Number(form.age) : undefined, city: form.city || undefined };

      const res = await fetch('/api/organ-matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => null);
      if (res.status === 401) {
        setFormError('Please sign in first to register.');
        setFormLoading(false);
        return;
      }
      if (!res.ok) {
        setFormError(data?.error || 'Registration failed. Please try again.');
        setFormLoading(false);
        return;
      }

      setFormOk(true);
      setForm({ name: '', bloodType: '', organ: '', city: '', urgency: 'MEDIUM', age: '' });
      setTimeout(() => {
        setShowDonorModal(false);
        setShowRecipientModal(false);
        setFormOk(false);
        fetchData();
      }, 1500);
    } catch (err) {
      console.error('organ registration error:', err);
      setFormError('Registration failed. Please try again.');
    }
    setFormLoading(false);
  };

  const filteredDonors = donors.filter(d =>
    (bloodFilter === 'all' || d.bloodType === bloodFilter) &&
    (organFilter === 'all' || d.organs.includes(organFilter)) &&
    (searchQuery === '' || (d.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (d.city || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredRecipients = recipients.filter(r =>
    (bloodFilter === 'all' || r.bloodType === bloodFilter) &&
    (organFilter === 'all' || r.organNeeded === organFilter) &&
    (searchQuery === '' || (r.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (r.city || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-24">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/40 rounded-2xl mb-4">
            <FiHeart size={32} className="text-purple-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-2">
            Organ Donation <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">&amp; Matching</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Transparent matching between registered donors and waiting recipients — scored on blood compatibility, organ type and location.
          </p>
        </div>

        {/* India National Stats — real NOTTO / data.gov.in data */}
        <section className="mb-10">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
            <h2 className="text-2xl font-black flex items-center gap-2">
              <FiShield className="text-purple-400" /> India — National Organ Donation Stats
            </h2>
            {national && (
              <span className="text-xs text-gray-500">Source: {national.source} (updated {national.updatedAt})</span>
            )}
          </div>
          {national && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {national.cards.map(c => (
                  <div key={c.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center hover:border-purple-500/30 transition">
                    <p className="text-2xl font-black text-purple-400">{c.value}</p>
                    <p className="text-xs text-gray-300 mt-1">{c.label}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{c.note}</p>
                  </div>
                ))}
              </div>
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5">
                  <h4 className="font-bold text-sm mb-3">Transplants by Organ (2024)</h4>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500 text-xs">
                        <th className="text-left pb-2 font-semibold">Organ</th>
                        <th className="text-right pb-2 font-semibold">Living</th>
                        <th className="text-right pb-2 font-semibold">Deceased</th>
                      </tr>
                    </thead>
                    <tbody>
                      {national.organWise.map(r => (
                        <tr key={r.organ} className="border-t border-white/10">
                          <td className="py-2 font-bold text-white">{r.organ}</td>
                          <td className="py-2 text-right text-gray-300">{r.living}</td>
                          <td className="py-2 text-right text-gray-300">{r.deceased}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="md:col-span-2 bg-slate-900/60 border border-white/10 rounded-2xl p-5">
                  <h4 className="font-bold text-sm mb-3">Top Transplant States (2025)</h4>
                  <div className="space-y-2">
                    {national.topStates.map(t => (
                      <div key={t.state} className="flex items-center justify-between flex-wrap gap-2">
                        <p className="font-semibold text-white">{t.state} {t.note && <span className="text-xs text-gray-500">({t.note})</span>}</p>
                        <span className="font-mono text-purple-400 font-bold">{t.transplants} transplants</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-4 border-t border-white/10 pt-3">{national.milestone}</p>
                </div>
              </div>
            </>
          )}
          {nationalError && <p className="text-xs text-amber-400">{nationalError}</p>}
        </section>

        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-red-500/20 border border-purple-500/30 rounded-[2rem] p-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                <h3 className="font-bold text-xl flex items-center gap-2">
                  <FiActivity className="text-purple-400" /> Live Registry
                </h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full">
                    <FiCheckCircle className="text-green-400" size={14} />
                    <span className="text-green-400 text-xs font-bold">National Registry Data</span>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1 rounded-full">
                    <FiShield className="text-blue-400" size={14} />
                    <span className="text-blue-400 text-xs font-bold">Real Matching Algorithm</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-slate-900/70 rounded-xl p-4 text-center">
                  <p className="text-3xl font-black text-white">{donors.length}</p>
                  <p className="text-xs text-gray-400">Registered Donors</p>
                </div>
                <div className="bg-slate-900/70 rounded-xl p-4 text-center">
                  <p className="text-3xl font-black text-white">{recipients.length}</p>
                  <p className="text-xs text-gray-400">Waiting Recipients</p>
                </div>
                <div className="bg-slate-900/70 rounded-xl p-4 text-center">
                  <p className="text-3xl font-black text-purple-400">{compatibleCount}</p>
                  <p className="text-xs text-gray-400">Compatible Matches</p>
                </div>
              </div>

              <button
                onClick={runMatching}
                disabled={isMatching || loading}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition flex items-center justify-center gap-2 ${
                  isMatching
                    ? 'bg-purple-500/50 text-white cursor-wait'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500'
                }`}
              >
                {isMatching ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Running Real Matching Algorithm...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <FiActivity /> Run Matching Algorithm
                  </span>
                )}
              </button>

              {matchResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <FiCheckCircle className="text-green-400" size={24} />
                    <span className="font-bold text-green-400">Top Real Match Found</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400">Recipient</p>
                      <p className="font-bold text-white">{matchResult.recipientName} ({matchResult.recipientCity})</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Organ</p>
                      <p className="font-bold text-white">{matchResult.organ}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Matched Donor</p>
                      <p className="font-bold text-white">{matchResult.donorName} ({matchResult.donorCity})</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Match Score</p>
                      <p className="font-mono text-white">{matchResult.score} {matchResult.compatible && <span className="ml-1 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold">COMPATIBLE</span>}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <div>
            <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 h-full">
              <h3 className="font-bold text-lg mb-4">How It Works</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center font-bold text-sm">1</div>
                  <p className="text-sm text-gray-400">Donor &amp; recipient register with medical details</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center font-bold text-sm">2</div>
                  <p className="text-sm text-gray-400">Real algorithm scores every donor-recipient pair</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center font-bold text-sm">3</div>
                  <p className="text-sm text-gray-400">Blood compatibility, tissue type, organ &amp; location weighed</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center font-bold text-sm">4</div>
                  <p className="text-sm text-gray-400">Best matches surfaced to hospitals for verification</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                <button onClick={() => setShowDonorModal(true)} className="block w-full bg-purple-500 hover:bg-purple-400 text-white py-3 rounded-xl font-bold text-center transition">
                  Register as Donor
                </button>
                <button onClick={() => setShowRecipientModal(true)} className="block w-full bg-pink-500 hover:bg-pink-400 text-white py-3 rounded-xl font-bold text-center transition">
                  Register as Recipient
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-6 overflow-x-auto">
          {(['donors', 'recipients', 'matches'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition ${
                activeTab === tab
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              {tab === 'donors' && `Donors (${donors.length})`}
              {tab === 'recipients' && `Recipients (${recipients.length})`}
              {tab === 'matches' && `Matches (${totalRegistrations})`}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <select
            value={bloodFilter}
            onChange={(e) => setBloodFilter(e.target.value)}
            className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3 text-white"
          >
            <option value="all">All Blood Types</option>
            {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select
            value={organFilter}
            onChange={(e) => setOrganFilter(e.target.value)}
            className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3 text-white"
          >
            <option value="all">All Organs</option>
            {ORGANS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading transplant registry...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <FiAlertCircle className="text-4xl text-red-500 mx-auto mb-4" />
            <p className="text-xl font-bold text-red-400">{error}</p>
            <button onClick={fetchData} className="mt-4 px-6 py-3 bg-red-500/20 text-red-400 rounded-xl font-bold">Retry</button>
          </div>
        ) : (
          <>
            {activeTab === 'donors' && (
              filteredDonors.length === 0 ? (
                <EmptyState icon="donor" />
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredDonors.map((donor) => (
                    <div key={donor.id} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 hover:border-purple-500/30 transition">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold">
                            {String(donor.name || 'D').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-white">{donor.name || 'Unnamed Donor'}</h4>
                            <p className="text-xs text-gray-400">{donor.bloodType || 'Blood type not set'}</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400">ACTIVE</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-gray-400">Organs:</span> <span className="font-bold text-white">{donor.organs.join(', ') || '—'}</span></div>
                        <div><span className="text-gray-400">City:</span> <span className="text-white flex items-center gap-1"><FiMapPin size={12} /> {donor.city || '—'}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {activeTab === 'recipients' && (
              filteredRecipients.length === 0 ? (
                <EmptyState icon="recipient" />
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredRecipients.map((recipient) => (
                    <div key={recipient.id} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 hover:border-purple-500/30 transition">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center font-bold">
                            {String(recipient.name || 'R').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-white">{recipient.name || 'Unnamed Recipient'}</h4>
                            <p className="text-xs text-gray-400">{recipient.bloodType || 'Blood type not set'}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${urgencyColor(recipient.urgency)}`}>
                          {recipient.urgency?.toUpperCase() || 'MEDIUM'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-gray-400">Needs:</span> <span className="font-bold text-white">{recipient.organNeeded || '—'}</span></div>
                        <div><span className="text-gray-400">City:</span> <span className="text-white flex items-center gap-1"><FiMapPin size={12} /> {recipient.city || '—'}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {activeTab === 'matches' && (
              matchGroups.length === 0 ? (
                <EmptyState icon="match" />
              ) : (
                <div className="space-y-4">
                  {matchGroups.map((group) => (
                    <div key={group.recipient.id} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-5">
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <FiUsers className="text-purple-400" size={24} />
                          </div>
                          <div>
                            <h4 className="font-bold text-white">{group.recipient.name || 'Recipient'} — {group.recipient.organNeeded}</h4>
                            <p className="text-xs text-gray-400 flex items-center gap-1"><FiMapPin size={12} /> {group.recipient.city || '—'} • {group.recipient.bloodType || 'BG —'} • <span className={urgencyColor(group.recipient.urgency)}>{group.recipient.urgency?.toUpperCase() || 'MEDIUM'}</span></p>
                          </div>
                        </div>
                        <span className="flex items-center gap-1 text-purple-400 text-sm font-bold">
                          <FiShield size={14} /> {group.matches.length} candidate donor(s)
                        </span>
                      </div>
                      <div className="space-y-2">
                        {group.matches.map((m) => (
                          <div key={m.donorId} className="flex items-center justify-between bg-slate-900/50 rounded-xl px-4 py-3 flex-wrap gap-2">
                            <div>
                              <p className="font-bold text-sm text-white">{m.donorName}</p>
                              <p className="text-xs text-gray-400 flex items-center gap-1"><FiMapPin size={11} /> {m.city || '—'} • {m.bloodType || 'BG —'} • {m.organ.join(', ') || '—'}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-xs text-gray-400">Score</p>
                                <p className="font-mono font-bold text-white">{m.matchScore}</p>
                              </div>
                              {m.isCompatible
                                ? <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400">COMPATIBLE</span>
                                : <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400">PARTIAL</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>

      {/* Register as Donor Modal */}
      <AnimateModal open={showDonorModal} onClose={() => !formLoading && setShowDonorModal(false)}>
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><FiHeart className="text-purple-400" /> Register as Organ Donor</h3>
        <RegisterForm
          form={form}
          setForm={setForm}
          loading={formLoading}
          error={formError}
          ok={formOk}
          submitLabel="Register as Donor"
          onSubmit={() => submitRegistration('donor')}
          showUrgency={false}
        />
      </AnimateModal>

      {/* Register as Recipient Modal */}
      <AnimateModal open={showRecipientModal} onClose={() => !formLoading && setShowRecipientModal(false)}>
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><FiUsers className="text-pink-400" /> Register as Recipient</h3>
        <RegisterForm
          form={form}
          setForm={setForm}
          loading={formLoading}
          error={formError}
          ok={formOk}
          submitLabel="Register as Recipient"
          onSubmit={() => submitRegistration('recipient')}
          showUrgency={true}
        />
      </AnimateModal>
    </div>
  );
}

function EmptyState({ icon }: { icon: 'donor' | 'recipient' | 'match' }) {
  return (
    <div className="text-center py-20">
      <FiHeart className={`text-6xl mx-auto mb-4 ${icon === 'recipient' ? 'text-pink-700' : icon === 'match' ? 'text-purple-700' : 'text-purple-700'}`} />
      <p className="text-xl font-bold">Nothing here yet</p>
      <p className="text-gray-400">
        {icon === 'donor' && 'No donors registered yet. Register as a donor to get started.'}
        {icon === 'recipient' && 'No recipients registered yet. Register as a recipient to get started.'}
        {icon === 'match' && 'No matches yet. Run the matching algorithm to find compatible pairs.'}
      </p>
    </div>
  );
}

function RegisterForm({ form, setForm, loading, error, ok, submitLabel, onSubmit, showUrgency }: {
  form: RegisterFormState;
  setForm: (f: RegisterFormState) => void;
  loading: boolean;
  error: string;
  ok: boolean;
  submitLabel: string;
  onSubmit: () => void;
  showUrgency: boolean;
}) {
  if (ok) {
    return (
      <div className="text-center py-10">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiCheckCircle className="text-emerald-400 text-4xl" />
        </div>
        <h3 className="text-xl font-bold">Registered!</h3>
        <p className="text-gray-400 mt-2">Your details are now part of the live registry</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-gray-400">Organ *</label>
        <select
          value={form.organ}
          onChange={(e) => setForm({ ...form, organ: e.target.value })}
          className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white"
        >
          <option value="">Select organ</option>
          {ORGANS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-400">Blood Type</label>
          <select
            value={form.bloodType}
            onChange={(e) => setForm({ ...form, bloodType: e.target.value })}
            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white"
          >
            <option value="">Select</option>
            {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-400">Age</label>
          <input
            type="number"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white"
            placeholder="e.g. 32"
          />
        </div>
      </div>
      <div>
        <label className="text-sm text-gray-400">City</label>
        <input
          type="text"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white"
          placeholder="Your city"
        />
      </div>
      {showUrgency && (
        <div>
          <label className="text-sm text-gray-400">Urgency</label>
          <select
            value={form.urgency}
            onChange={(e) => setForm({ ...form, urgency: e.target.value })}
            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      )}
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        onClick={onSubmit}
        disabled={loading || !form.organ}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold disabled:opacity-50"
      >
        {loading ? 'Submitting...' : submitLabel}
      </button>
    </div>
  );
}

function AnimateModal({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-900 rounded-3xl border border-white/10 p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}