'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiUser, FiCheck, FiX, FiKey } from 'react-icons/fi';

export default function SetupAdmin() {
  const [email, setEmail] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null);

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !secretKey) {
      setResult({ success: false, message: 'Please fill all fields' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/admin/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, secretKey })
      });

      const data = await res.json();

      if (res.ok) {
        setResult({ success: true, message: data.message });
      } else {
        setResult({ success: false, message: data.error });
      }
    } catch {
      setResult({ success: false, message: 'Something went wrong' });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiShield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white">Setup Admin</h1>
            <p className="text-slate-400 text-sm mt-1">Promote a user to admin role</p>
          </div>

          <form onSubmit={handlePromote} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm font-medium mb-2">User Email</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-sm font-medium mb-2">Secret Key</label>
              <div className="relative">
                <FiKey className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="Enter admin secret key"
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
                />
              </div>
            </div>

            {result && (
              <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
                result.success 
                  ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}>
                {result.success ? <FiCheck /> : <FiX />}
                {result.message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Promote to Admin'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-slate-800/30 rounded-xl">
            <p className="text-slate-500 text-xs">
              <strong className="text-slate-400">Note:</strong> User must already be registered in the system. Use the secret key to authorize this action.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
