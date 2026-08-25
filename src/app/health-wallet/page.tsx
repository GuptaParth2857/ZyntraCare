'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCreditCard, FiPlus, FiMinus, FiArrowUpRight, FiArrowDownLeft, FiShield, FiDollarSign, FiActivity } from 'react-icons/fi';

interface Transaction {
  id: number;
  type: 'credit' | 'debit';
  desc: string;
  amount: number;
  date: string;
}

export default function HealthWalletPage() {
  const [balance, setBalance] = useState(0);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWalletData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/health-wallet');
        if (!res.ok) throw new Error('Failed to fetch wallet data');
        const data = await res.json();
        setBalance(data.balance || 0);
        setTransactions(data.transactions || []);
      } catch (err) {
        setError('Failed to load wallet data');
        console.error(err);
      }
      setLoading(false);
    };
    fetchWalletData();
  }, []);

  const handleAddMoney = () => {
    if (amount) {
      setBalance(b => b + parseInt(amount));
      setShowAddMoney(false);
      setAmount('');
    }
  };

  return (
    <div className="min-h-screen bg-transparent">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-black">Health Wallet</h1>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <FiShield />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
            <p className="text-emerald-200 text-sm">Available Balance</p>
            <p className="text-4xl font-black mt-1">₹{balance.toLocaleString()}</p>
            <p className="text-xs text-emerald-200 mt-2">ZyntraCare Wallet</p>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowAddMoney(true)}
              className="flex-1 py-3 bg-white text-emerald-600 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <FiPlus /> Add Money
            </button>
            <button className="flex-1 py-3 bg-white/10 text-white rounded-xl font-bold flex items-center justify-center gap-2">
              <FiDollarSign /> Send
            </button>
          </div>
        </motion.div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-12">
        {/* Quick Pay */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <h3 className="font-bold mb-3">Quick Pay</h3>
          <div className="flex justify-around">
            {['Hospitals', 'Labs', 'Pharmacy', 'Doctors'].map(item => (
              <button key={item} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🏥</span>
                </div>
                <span className="text-xs font-medium">{item}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <h3 className="font-bold mb-3">Recent Transactions</h3>
          <div className="space-y-3">
            {transactions.map(t => (
              <div key={t.id} className="flex items-center justify-between p-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'credit' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                    {t.type === 'credit' ? <FiArrowDownLeft className="text-emerald-600" /> : <FiArrowUpRight className="text-red-600" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t.desc}</p>
                    <p className="text-xs text-gray-500">{t.date}</p>
                  </div>
                </div>
                <span className={`font-bold ${t.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {t.type === 'credit' ? '+' : ''}₹{Math.abs(t.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Add Money Modal */}
        {showAddMoney && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm">
              <h3 className="font-bold text-lg mb-4">Add Money</h3>
              <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-4 bg-slate-100 rounded-xl text-2xl font-bold text-center"
              />
              <div className="flex gap-2 mt-4">
                {[500, 1000, 2000, 5000].map(a => (
                  <button
                    key={a}
                    onClick={() => setAmount(a.toString())}
                    className="flex-1 py-2 bg-slate-100 rounded-lg font-medium"
                  >
                    ₹{a}
                  </button>
                ))}
              </div>
              <button
                onClick={handleAddMoney}
                disabled={!amount}
                className="w-full mt-4 py-4 bg-emerald-500 text-white rounded-xl font-bold disabled:opacity-50"
              >
                Add ₹{amount || 0}
              </button>
              <button onClick={() => setShowAddMoney(false)} className="w-full mt-2 text-gray-500">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}