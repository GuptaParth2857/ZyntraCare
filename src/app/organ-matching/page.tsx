'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiMapPin, FiPhone, FiClock, FiShield, FiCheckCircle, FiAlertCircle, FiLink, FiDatabase, FiKey, FiUser, FiHeart } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface OrganDonor {
  id: string;
  name: string;
  bloodType: string;
  organ: string;
  age: number;
  city: string;
  hospital: string;
  walletAddress: string;
  registeredAt: string;
  verified: boolean;
}

interface Recipient {
  id: string;
  name: string;
  age: number;
  bloodType: string;
  organNeeded: string;
  priority: 'critical' | 'high' | 'normal';
  city: string;
  hospital: string;
  walletAddress: string;
  waitingSince: string;
  status: 'waiting' | 'matched' | 'transplanted';
}

interface Match {
  id: string;
  donorId: string;
  recipientId: string;
  organ: string;
  timestamp: string;
  txHash: string;
  verified: boolean;
}

const donors: OrganDonor[] = [
  { id: 'D001', name: 'Rahul S.', bloodType: 'O+', organ: 'Kidney', age: 35, city: 'Delhi', hospital: 'AIIMS', walletAddress: '0x7a2...f3e1', registeredAt: '2026-03-15', verified: true },
  { id: 'D002', name: 'Priya M.', bloodType: 'A+', organ: 'Liver', age: 28, city: 'Mumbai', hospital: 'Kokilaben', walletAddress: '0x8b3...g4f2', registeredAt: '2026-03-18', verified: true },
  { id: 'D003', name: 'Amit K.', bloodType: 'B+', organ: 'Heart', age: 42, city: 'Bangalore', hospital: 'Manipal', walletAddress: '0x9c4...h5g3', registeredAt: '2026-03-20', verified: true },
  { id: 'D004', name: 'Sneha R.', bloodType: 'AB+', organ: 'Corneas', age: 25, city: 'Chennai', hospital: 'Apollo', walletAddress: '0xad5...i6h4', registeredAt: '2026-03-19', verified: true },
];

const recipients: Recipient[] = [
  { id: 'R001', name: 'Anil Sharma', age: 45, bloodType: 'O+', organNeeded: 'Kidney', priority: 'critical', city: 'Delhi', hospital: 'Gangaram', walletAddress: '0x1a2...k7l9', waitingSince: '2026-01-10', status: 'waiting' },
  { id: 'R002', name: 'Meera Devi', age: 38, bloodType: 'A+', organNeeded: 'Liver', priority: 'high', city: 'Mumbai', hospital: 'Fortis', walletAddress: '0x2b3...m8n1', waitingSince: '2026-02-15', status: 'waiting' },
  { id: 'R003', name: 'Vikram Singh', age: 52, bloodType: 'B+', organNeeded: 'Heart', priority: 'critical', city: 'Bangalore', hospital: 'Narayana', walletAddress: '0x3c4...n9o2', waitingSince: '2026-01-20', status: 'waiting' },
  { id: 'R004', name: 'Lakshmi', age: 34, bloodType: 'AB+', organNeeded: 'Corneas', priority: 'normal', city: 'Chennai', hospital: 'VGCC', walletAddress: '0x4d5...o1p3', waitingSince: '2026-03-01', status: 'waiting' },
];

const recentMatches: Match[] = [
  { id: 'M001', donorId: 'D001', recipientId: 'R001', organ: 'Kidney', timestamp: '2026-04-21T14:30:00Z', txHash: '0x8f7...ab2c', verified: true },
];

export default function OrganMatchingPage() {
  const [activeTab, setActiveTab] = useState<'donors' | 'recipients' | 'matches'>('donors');
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodFilter, setBloodFilter] = useState('all');
  const [organFilter, setOrganFilter] = useState('all');
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<Match | null>(null);
  const [livePulse, setLivePulse] = useState(0);
  const [matchUpdates, setMatchUpdates] = useState<string[]>([]);
  const [stats, setStats] = useState({ donors: 4, recipients: 4, matches: 1 });

  useEffect(() => {
    const pulseInterval = setInterval(() => setLivePulse(prev => (prev + 1) % 100), 100);
    return () => clearInterval(pulseInterval);
  }, []);

  useEffect(() => {
    const updateInterval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        donors: prev.donors + (Math.random() > 0.7 ? 1 : 0),
        recipients: prev.recipients + (Math.random() > 0.8 ? 1 : 0),
      }));
      const updates = ['New donor registered in Delhi', 'Kidney match found in Mumbai', 'Recipient updated priority'];
      const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
      setMatchUpdates(prev => [randomUpdate, ...prev.slice(0, 2)]);
    }, 5000);
    return () => clearInterval(updateInterval);
  }, []);

  const filteredDonors = donors.filter(d => 
    (bloodFilter === 'all' || d.bloodType === bloodFilter) &&
    (organFilter === 'all' || d.organ === organFilter) &&
    (searchQuery === '' || d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.city.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredRecipients = recipients.filter(r =>
    (bloodFilter === 'all' || r.bloodType === bloodFilter) &&
    (organFilter === 'all' || r.organNeeded === organFilter) &&
    (searchQuery === '' || r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.city.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const runMatching = () => {
    setIsMatching(true);
    setMatchResult(null);
    
    setTimeout(() => {
      const match = {
        id: `M${Date.now()}`,
        donorId: 'D001',
        recipientId: 'R001',
        organ: 'Kidney',
        timestamp: new Date().toISOString(),
        txHash: `0x${Math.random().toString(16).substr(2, 9)}...`,
        verified: true
      };
      setMatchResult(match);
      setIsMatching(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden font-inter text-white">
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-24">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/40 rounded-2xl mb-4">
            <FiHeart size={32} className="text-purple-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-2">
            Zyntra <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Organ Chain</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Blockchain-powered transparent organ matching. No middlemen, no corruption, just trust.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-red-500/20 border border-purple-500/30 rounded-[2rem] p-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                <h3 className="font-bold text-xl flex items-center gap-2">
                  <FiDatabase className="text-purple-400" /> Blockchain Registry
                </h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full">
                    <FiCheckCircle className="text-green-400" size={14} />
                    <span className="text-green-400 text-xs font-bold">Ethereum Mainnet</span>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1 rounded-full">
                    <FiKey className="text-blue-400" size={14} />
                    <span className="text-blue-400 text-xs font-bold">Smart Contract Active</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-slate-900/70 rounded-xl p-4 text-center">
                  <p className="text-3xl font-black text-white">{donors.length}</p>
                  <p className="text-xs text-gray-400">Registered Donors</p>
                </div>
                <div className="bg-slate-900/70 rounded-xl p-4 text-center">
                  <p className="text-3xl font-black text-white">{recipients.filter(r => r.status === 'waiting').length}</p>
                  <p className="text-xs text-gray-400">Waiting Recipients</p>
                </div>
                <div className="bg-slate-900/70 rounded-xl p-4 text-center">
                  <p className="text-3xl font-black text-purple-400">{recentMatches.length}</p>
                  <p className="text-xs text-gray-400">Successful Matches</p>
                </div>
              </div>

              <button 
                onClick={runMatching}
                disabled={isMatching}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition flex items-center justify-center gap-2 ${
                  isMatching 
                    ? 'bg-purple-500/50 text-white cursor-wait' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500'
                }`}
              >
                {isMatching ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Running Blockchain Match Algorithm...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <FiLink /> Run AI Matching Algorithm
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
                    <span className="font-bold text-green-400">Match Found!</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400">TX Hash</p>
                      <p className="font-mono text-white">{matchResult.txHash}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Timestamp</p>
                      <p className="text-white">{new Date(matchResult.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 h-full">
              <h3 className="font-bold text-lg mb-4">How It Works</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center font-bold text-sm">1</div>
                  <p className="text-sm text-gray-400">Donor registers wallet (anonymous)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center font-bold text-sm">2</div>
                  <p className="text-sm text-gray-400">Recipient adds medical data</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center font-bold text-sm">3</div>
                  <p className="text-sm text-gray-400">Smart contract runs blind match</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center font-bold text-sm">4</div>
                  <p className="text-sm text-gray-400">Both notified + hospital gets hash</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center font-bold text-sm">5</div>
                  <p className="text-sm text-gray-400">100% transparent on blockchain</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/10">
                <Link href="/register" className="block w-full bg-purple-500 hover:bg-purple-400 text-white py-3 rounded-xl font-bold text-center transition">
                  Register as Donor
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex gap-4 mb-6 overflow-x-auto">
          {['donors', 'recipients', 'matches'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition ${
                activeTab === tab 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              {tab === 'donors' && 'Donors'}
              {tab === 'recipients' && 'Recipients'}
              {tab === 'matches' && 'Matches'}
            </button>
          ))}
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white placeholder:text-gray-500"
            />
          </div>
          <select
            value={bloodFilter}
            onChange={(e) => setBloodFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white"
          >
            <option value="all">All Blood Types</option>
            <option value="O+">O+</option>
            <option value="A+">A+</option>
            <option value="B+">B+</option>
            <option value="AB+">AB+</option>
          </select>
          <select
            value={organFilter}
            onChange={(e) => setOrganFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white"
          >
            <option value="all">All Organs</option>
            <option value="Kidney">Kidney</option>
            <option value="Liver">Liver</option>
            <option value="Heart">Heart</option>
            <option value="Corneas">Corneas</option>
          </select>
        </div>

        {activeTab === 'donors' && (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredDonors.map((donor) => (
              <div key={donor.id} className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 hover:border-purple-500/30 transition">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold">
                      {donor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{donor.name}</h4>
                      <p className="text-xs text-gray-400">{donor.id}</p>
                    </div>
                  </div>
                  {donor.verified && <FiCheckCircle className="text-green-400" />}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div><span className="text-gray-400">Organ:</span> <span className="font-bold text-white">{donor.organ}</span></div>
                  <div><span className="text-gray-400">Blood:</span> <span className="font-bold text-red-400">{donor.bloodType}</span></div>
                  <div><span className="text-gray-400">City:</span> <span className="text-white">{donor.city}</span></div>
                  <div><span className="text-gray-400">Hospital:</span> <span className="text-white">{donor.hospital}</span></div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <span className="text-xs text-gray-500 font-mono">{donor.walletAddress}</span>
                  <button className="px-3 py-1 bg-purple-500 hover:bg-purple-400 text-white rounded-lg text-sm font-bold transition">
                    Contact
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'recipients' && (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredRecipients.map((recipient) => (
              <div key={recipient.id} className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 hover:border-purple-500/30 transition">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center font-bold">
                      {recipient.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{recipient.name}</h4>
                      <p className="text-xs text-gray-400">{recipient.id}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    recipient.priority === 'critical' ? 'bg-red-500 text-white' :
                    recipient.priority === 'high' ? 'bg-orange-500 text-white' :
                    'bg-yellow-500 text-black'
                  }`}>
                    {recipient.priority.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div><span className="text-gray-400">Need:</span> <span className="font-bold text-white">{recipient.organNeeded}</span></div>
                  <div><span className="text-gray-400">Blood:</span> <span className="font-bold text-red-400">{recipient.bloodType}</span></div>
                  <div><span className="text-gray-400">Waiting:</span> <span className="text-white">{recipient.waitingSince}</span></div>
                  <div><span className="text-gray-400">Status:</span> <span className="text-green-400 font-bold">{recipient.status.toUpperCase()}</span></div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <span className="text-xs text-gray-500 font-mono">{recipient.walletAddress}</span>
                  <button className="px-3 py-1 bg-blue-500 hover:bg-blue-400 text-white rounded-lg text-sm font-bold transition">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="space-y-4">
            {recentMatches.map((match) => (
              <div key={match.id} className="bg-slate-900/80 border border-green-500/30 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <FiCheckCircle className="text-green-400" size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Match #{match.id}</h4>
                      <p className="text-xs text-gray-400">{match.organ} Transplant</p>
                    </div>
                  </div>
                  {match.verified && (
                    <span className="flex items-center gap-1 text-green-400 text-sm">
                      <FiShield size={14} /> Verified
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">TX Hash</p>
                    <p className="font-mono text-white">{match.txHash}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Timestamp</p>
                    <p className="text-white">{new Date(match.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}