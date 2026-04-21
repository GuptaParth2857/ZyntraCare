'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiDatabase, FiDollarSign, FiShield, FiActivity, FiTrendingUp, FiLock,
  FiCheckCircle, FiAlertTriangle, FiUsers, FiGlobe, FiSmartphone, FiRefreshCw,
  FiSend, FiCreditCard, FiEye, FiEyeOff
} from 'react-icons/fi';

interface DataListing {
  id: string;
  disease: string;
  dataType: string;
  records: number;
  price: number;
  buyer: string;
  status: 'available' | 'sold' | 'pending';
  anonymized: boolean;
}

interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  type: 'sale' | 'withdrawal' | 'deposit';
  timestamp: string;
}

const SAMPLE_LISTINGS: DataListing[] = [
  { id: 'DAT-001', disease: 'Type 2 Diabetes', dataType: 'Clinical Records', records: 15420, price: 2500, buyer: 'Pfizer India', status: 'available', anonymized: true },
  { id: 'DAT-002', disease: 'Cardiovascular', dataType: 'ECG Data', records: 8900, price: 4200, buyer: 'Cipla R&D', status: 'available', anonymized: true },
  { id: 'DAT-003', disease: 'Cancer Genomics', dataType: 'DNA Sequences', records: 2300, price: 15000, buyer: 'Roche India', status: 'pending', anonymized: true },
  { id: 'DAT-004', disease: 'Respiratory', dataType: 'Lung Scans', records: 12500, price: 3800, buyer: 'GSK Pharma', status: 'sold', anonymized: true },
  { id: 'DAT-005', disease: 'Mental Health', dataType: 'Survey Data', records: 5600, price: 1800, buyer: 'Sun Pharma', status: 'available', anonymized: true },
  { id: 'DAT-006', disease: 'Pediatric', dataType: 'Growth Metrics', records: 22000, price: 1500, buyer: 'Abbott', status: 'available', anonymized: true },
];

const MY_DATA_LISTINGS: DataListing[] = [
  { id: 'MY-001', disease: 'My Health Profile', dataType: 'Vitals & Metrics', records: 1, price: 50, buyer: 'Anyone', status: 'available', anonymized: true },
  { id: 'MY-002', disease: 'Blood Reports', dataType: 'Lab Results', records: 12, price: 200, buyer: 'Researchers', status: 'available', anonymized: true },
  { id: 'MY-003', disease: 'Prescription History', dataType: 'Medications', records: 45, price: 350, buyer: 'Pharma Companies', status: 'sold', anonymized: true },
];

export default function DataMarketplacePage() {
  const [listings, setListings] = useState<DataListing[]>(SAMPLE_LISTINGS);
  const [myListings, setMyListings] = useState<DataListing[]>(MY_DATA_LISTINGS);
  const [walletBalance, setWalletBalance] = useState(4250);
  const [totalEarned, setTotalEarned] = useState(12500);
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState<'browse' | 'myData' | 'transactions'>('browse');
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 'TXN-001', from: 'Pfizer India', to: 'Me', amount: 2500, type: 'sale', timestamp: '2 hours ago' },
    { id: 'TXN-002', from: 'Me', to: 'Wallet', amount: 1000, type: 'deposit', timestamp: '1 day ago' },
    { id: 'TXN-003', from: 'Cipla R&D', to: 'Me', amount: 4200, type: 'sale', timestamp: '3 days ago' },
    { id: 'TXN-004', from: 'Me', to: 'Bank', amount: 3000, type: 'withdrawal', timestamp: '5 days ago' },
  ]);

  const handlePurchase = (id: string) => {
    setListings(prev => prev.map(l => 
      l.id === id ? { ...l, status: 'sold' as const } : l
    ));
  };

  const getStatusColor = (status: DataListing['status']) => {
    switch (status) {
      case 'available': return 'text-green-400 bg-green-500/20';
      case 'sold': return 'text-slate-400 bg-slate-500/20';
      case 'pending': return 'text-amber-400 bg-amber-500/20';
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
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <FiDatabase className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Data Marketplace
              </h1>
              <p className="text-slate-400 text-sm">Sell your medical data. Earn crypto. Fund your health.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/50 flex items-center gap-2">
              <FiCreditCard className="text-purple-400" />
              <span className="text-purple-400 font-bold">
                {showBalance ? `₹${walletBalance.toLocaleString()}` : '******'}
              </span>
              <button onClick={() => setShowBalance(!showBalance)} className="text-purple-400/60 hover:text-purple-400">
                {showBalance ? <FiEyeOff size={14} /> : <FiEye size={14} />}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FiDollarSign className="text-green-400" />
            <span className="text-slate-400 text-sm">Balance</span>
          </div>
          <div className="text-2xl font-bold text-green-400">₹{walletBalance.toLocaleString()}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FiTrendingUp className="text-purple-400" />
            <span className="text-slate-400 text-sm">Total Earned</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">₹{totalEarned.toLocaleString()}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FiDatabase className="text-blue-400" />
            <span className="text-slate-400 text-sm">Data Sold</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{listings.filter(l => l.status === 'sold').length}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FiUsers className="text-cyan-400" />
            <span className="text-slate-400 text-sm">Active Buyers</span>
          </div>
          <div className="text-2xl font-bold text-cyan-400">24</div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {(['browse', 'myData', 'transactions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              activeTab === tab 
                ? 'bg-purple-500 text-white' 
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            {tab === 'browse' && 'Browse Data'}
            {tab === 'myData' && 'My Data'}
            {tab === 'transactions' && 'Transactions'}
          </button>
        ))}
      </div>

      {activeTab === 'browse' && (
        <div className="grid grid-cols-3 gap-4">
          {listings.map((listing, idx) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(listing.status)}`}>
                  {listing.status.toUpperCase()}
                </span>
                {listing.anonymized && (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <FiShield size={12} /> Anonymous
                  </span>
                )}
              </div>
              <h3 className="font-bold text-lg mb-1">{listing.disease}</h3>
              <p className="text-sm text-slate-400 mb-3">{listing.dataType}</p>
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-slate-400">{listing.records.toLocaleString()} records</span>
                <span className="text-slate-500">Buyer: {listing.buyer}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-400">₹{listing.price.toLocaleString()}</span>
                <button
                  disabled={listing.status !== 'available'}
                  onClick={() => handlePurchase(listing.id)}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    listing.status === 'available'
                      ? 'bg-purple-500 hover:bg-purple-600 text-white'
                      : 'bg-slate-500/20 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {listing.status === 'available' ? 'Sell Data' : listing.status === 'sold' ? 'Sold' : 'Pending'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'myData' && (
        <div className="grid grid-cols-3 gap-4">
          {myListings.map((listing, idx) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(listing.status)}`}>
                  {listing.status.toUpperCase()}
                </span>
                {listing.anonymized && (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <FiShield size={12} /> Anonymous
                  </span>
                )}
              </div>
              <h3 className="font-bold text-lg mb-1">{listing.disease}</h3>
              <p className="text-sm text-slate-400 mb-3">{listing.dataType}</p>
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-slate-400">{listing.records} entries</span>
                <span className="text-slate-500">Buyers: {listing.buyer}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-400">₹{listing.price.toLocaleString()}</span>
                <button className="px-4 py-2 rounded-lg font-semibold bg-purple-500/20 text-purple-400 hover:bg-purple-500/30">
                  Manage
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="font-bold">Transaction History</h3>
          </div>
          <div className="divide-y divide-white/5">
            {transactions.map((txn, idx) => (
              <motion.div
                key={txn.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    txn.type === 'sale' ? 'bg-green-500/20 text-green-400' :
                    txn.type === 'deposit' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {txn.type === 'sale' ? <FiDollarSign /> : txn.type === 'deposit' ? <FiSend /> : <FiSend />}
                  </div>
                  <div>
                    <div className="font-semibold">
                      {txn.type === 'sale' ? `Received from ${txn.from}` : 
                       txn.type === 'deposit' ? `Deposit from ${txn.from}` : 
                       `Withdrawal to ${txn.to}`}
                    </div>
                    <div className="text-xs text-slate-400">{txn.timestamp}</div>
                  </div>
                </div>
                <span className={`font-bold text-lg ${
                  txn.type === 'sale' || txn.type === 'deposit' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {txn.type === 'sale' || txn.type === 'deposit' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl"
      >
        <div className="flex items-center gap-3">
          <FiShield className="text-purple-400 text-2xl" />
          <div>
            <h4 className="font-bold text-purple-400">Your Data is Protected</h4>
            <p className="text-sm text-slate-300">All data is anonymized before listing. You control what you share. Smart contracts ensure instant, secure payments.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}