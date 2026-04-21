'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUsers, FiDollarSign, FiShield, FiActivity, FiMapPin, FiClock,
  FiCheckCircle, FiAlertTriangle, FiTrendingUp, FiSmartphone, FiGlobe,
  FiRefreshCw, FiSend, FiHome, FiHeart
} from 'react-icons/fi';

interface VillagePool {
  id: string;
  name: string;
  state: string;
  members: number;
  poolAmount: number;
  monthlyContribution: number;
  claimsPaid: number;
  active: boolean;
}

interface Claim {
  id: string;
  member: string;
  village: string;
  reason: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
}

interface Member {
  id: string;
  name: string;
  joined: string;
  claims: number;
  verified: boolean;
}

const VILLAGE_POOLS: VillagePool[] = [
  { id: 'VP-001', name: 'Rampur Gaon', state: 'UP', members: 87, poolAmount: 124200, monthlyContribution: 100, claimsPaid: 12, active: true },
  { id: 'VP-002', name: 'Shivpuri Colony', state: 'MP', members: 156, poolAmount: 287500, monthlyContribution: 100, claimsPaid: 28, active: true },
  { id: 'VP-003', name: 'Lakshmi Nagar', state: 'Maharashtra', members: 92, poolAmount: 156800, monthlyContribution: 100, claimsPaid: 15, active: true },
  { id: 'VP-004', name: 'Gandhi Tola', state: 'Bihar', members: 134, poolAmount: 201500, monthlyContribution: 100, claimsPaid: 19, active: true },
  { id: 'VP-005', name: 'Nehru Basti', state: 'Rajasthan', members: 78, poolAmount: 112400, monthlyContribution: 100, claimsPaid: 8, active: false },
];

const RECENT_CLAIMS: Claim[] = [
  { id: 'CLM-001', member: 'Ramesh Kumar', village: 'Rampur Gaon', reason: 'Bone Fracture', amount: 25000, status: 'approved', timestamp: '2 hours ago' },
  { id: 'CLM-002', member: 'Sunita Devi', village: 'Shivpuri Colony', reason: 'Emergency Surgery', amount: 45000, status: 'approved', timestamp: '5 hours ago' },
  { id: 'CLM-003', member: 'Ahmed Khan', village: 'Lakshmi Nagar', reason: 'Heart Treatment', amount: 65000, status: 'pending', timestamp: '1 day ago' },
  { id: 'CLM-004', member: 'Priya Singh', village: 'Gandhi Tola', reason: 'Child Birth', amount: 15000, status: 'approved', timestamp: '2 days ago' },
];

export default function MicroInsurancePage() {
  const [pools, setPools] = useState<VillagePool[]>(VILLAGE_POOLS);
  const [claims, setClaims] = useState<Claim[]>(RECENT_CLAIMS);
  const [myVillage, setMyVillage] = useState<VillagePool | null>(null);
  const [walletBalance, setWalletBalance] = useState(3450);
  const [pulse, setPulse] = useState(0);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [members, setMembers] = useState<Member[]>([
    { id: 'M-001', name: 'You (Member)', joined: 'Jan 2024', claims: 0, verified: true },
    { id: 'M-002', name: 'Ramesh Kumar', joined: 'Jan 2024', claims: 1, verified: true },
    { id: 'M-003', name: 'Sunita Devi', joined: 'Feb 2024', claims: 1, verified: true },
    { id: 'M-004', name: 'Vijay Sharma', joined: 'Feb 2024', claims: 0, verified: true },
    { id: 'M-005', name: 'Meera Patel', joined: 'Mar 2024', claims: 0, verified: true },
  ]);

  useEffect(() => {
    const interval = setInterval(() => setPulse(prev => (prev + 1) % 100), 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMyVillage(pools[0]);
  }, []);

  const handleJoinVillage = () => {
    setPools(prev => prev.map(p => 
      p.id === 'VP-001' ? { ...p, members: p.members + 1 } : p
    ));
    setShowJoinModal(false);
  };

  const approveClaim = (id: string) => {
    setClaims(prev => prev.map(c => 
      c.id === id ? { ...c, status: 'approved' as const } : c
    ));
    const claim = claims.find(c => c.id === id);
    if (claim) {
      setWalletBalance(prev => prev - claim.amount);
    }
  };

  const getStatusColor = (status: Claim['status']) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-500/20';
      case 'pending': return 'text-amber-400 bg-amber-500/20';
      case 'rejected': return 'text-red-400 bg-red-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <FiShield className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Village Micro-Insurance
              </h1>
              <p className="text-slate-400 text-sm">Zero paperwork. Zero middlemen. Trustless coverage for the unbanked.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-xl border ${myVillage?.active ? 'border-green-500/50 bg-green-500/20' : 'border-red-500/50 bg-red-500/20'}`}>
              <FiSmartphone className={`inline mr-2 ${myVillage?.active ? 'text-green-400 animate-pulse' : 'text-red-400'}`} />
              <span className={myVillage?.active ? 'text-green-400' : 'text-red-400'}>
                {myVillage?.active ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FiUsers className="text-emerald-400" />
            <span className="text-slate-400 text-sm">My Village Pool</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400">{myVillage?.members || 0}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FiDollarSign className="text-green-400" />
            <span className="text-slate-400 text-sm">Pool Balance</span>
          </div>
          <div className="text-2xl font-bold text-green-400">₹{(myVillage?.poolAmount || 0).toLocaleString()}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FiActivity className="text-amber-400" />
            <span className="text-slate-400 text-sm">Claims Paid</span>
          </div>
          <div className="text-2xl font-bold text-amber-400">{myVillage?.claimsPaid || 0}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FiTrendingUp className="text-blue-400" />
            <span className="text-slate-400 text-sm">My Contribution</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">₹{myVillage?.monthlyContribution || 100}/mo</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FiGlobe className="text-emerald-400" />
                Village Network
              </h2>
              <button
                onClick={() => setShowJoinModal(true)}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm"
              >
                Join Village Pool
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                {pools.map((pool, idx) => (
                  <motion.div
                    key={pool.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => setMyVillage(pool)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      myVillage?.id === pool.id 
                        ? 'bg-emerald-500/20 border-emerald-500/50' 
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    } ${!pool.active ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold">{pool.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs ${pool.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {pool.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{pool.state}</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-slate-400">Members</div>
                        <div className="font-bold">{pool.members}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Pool</div>
                        <div className="font-bold text-green-400">₹{(pool.poolAmount / 1000).toFixed(0)}K</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Claims</div>
                        <div className="font-bold">{pool.claimsPaid}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FiAlertTriangle className="text-amber-400 animate-pulse" />
                Recent Claims
              </h2>
            </div>
            <div className="divide-y divide-white/5">
              {claims.map((claim, idx) => (
                <motion.div
                  key={claim.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      claim.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      claim.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {claim.status === 'pending' ? <FiClock /> : <FiCheckCircle />}
                    </div>
                    <div>
                      <div className="font-semibold">{claim.member}</div>
                      <div className="text-xs text-slate-400">{claim.village} • {claim.reason}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-green-400 font-bold">₹{claim.amount.toLocaleString()}</span>
                    {claim.status === 'pending' && (
                      <button
                        onClick={() => approveClaim(claim.id)}
                        className="px-3 py-1 rounded-lg bg-emerald-500 text-white text-sm font-semibold"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FiUsers className="text-emerald-400" />
              My Village Members
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {members.map((member, idx) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/5"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-sm font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <span className="text-sm">{member.name}</span>
                  </div>
                  {member.verified && <FiCheckCircle className="text-green-400 text-sm" />}
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-2xl p-4">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <FiHeart className="text-red-400" />
              How It Works
            </h3>
            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold">1</span>
                <span>100 villagers contribute ₹100/month</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold">2</span>
                <span>Smart contract pools funds on blockchain</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold">3</span>
                <span>Emergency claim → instant approval</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold">4</span>
                <span>Hospital paid directly from pool</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}