'use client';

import { useState } from 'react';
import { FiShield, FiCheckCircle, FiAlertCircle, FiSearch, FiBox, FiDatabase, FiLink } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { FaPills, FaLock, FaShieldAlt } from 'react-icons/fa';

interface VerificationResult {
  code: string;
  name: string;
  manufacturer: string;
  category: string;
  verified: boolean;
  timestamp: number;
  source: string;
}

export default function MedicineVerifyPage() {
  const [searchCode, setSearchCode] = useState('');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!searchCode.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/medicine-verify?code=${searchCode}`);
      const data = await res.json();
      if (data.success) {
        setResult(data.medicine);
      }
    } catch (err) {
      console.error('Error:', err);
    }
    setLoading(false);
  };

  const handleDatabaseSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/medicine-verify?search=${query}`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.medicines || []);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const sampleCodes = ['COVAS', 'COVAX', 'AMOX500', 'PARA500', 'MET500', 'AMLOD10', 'ATOR20'];

  return (
    <div className="min-h-screen bg-[#020617] relative overflow-hidden font-inter pb-24 text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-cyan-900/10" />
        <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl mb-6">
            <FiShield size={32} className="text-blue-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Medicine <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Verification
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Verify medicine authenticity using blockchain-based supply chain tracking.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8"
        >
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <FiSearch className="text-blue-400" /> Verify by Code
          </h2>

          <div className="flex gap-4 mb-6">
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
              placeholder="Enter medicine code (e.g., COVAS, AMOX500)"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-gray-400 text-sm">Try:</span>
            {sampleCodes.map((code) => (
              <button
                key={code}
                onClick={() => {
                  setSearchCode(code);
                  handleSearch();
                }}
                className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full transition"
              >
                {code}
              </button>
            ))}
          </div>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-6 rounded-2xl border ${
                result.verified 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-red-500/10 border-red-500/30'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                {result.verified ? (
                  <FiCheckCircle size={32} className="text-green-400" />
                ) : (
                  <FiAlertCircle size={32} className="text-red-400" />
                )}
                <div>
                  <h3 className="text-lg font-bold">
                    {result.verified ? 'Verified Authentic' : 'Verification Required'}
                  </h3>
                  <p className="text-sm text-gray-400">{result.source}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Code:</span>
                  <p className="font-bold">{result.code}</p>
                </div>
                <div>
                  <span className="text-gray-400">Medicine:</span>
                  <p className="font-bold">{result.name}</p>
                </div>
                <div>
                  <span className="text-gray-400">Manufacturer:</span>
                  <p className="font-bold">{result.manufacturer}</p>
                </div>
                <div>
                  <span className="text-gray-400">Category:</span>
                  <p className="font-bold">{result.category}</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8"
        >
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <FiDatabase className="text-cyan-400" /> Medicine Database
          </h2>

          <input
            type="text"
            placeholder="Search medicines by name..."
            onChange={(e) => handleDatabaseSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-4"
          />

          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((med) => (
                <div
                  key={med.code}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                >
                  <div>
                    <p className="font-bold">{med.name}</p>
                    <p className="text-sm text-gray-400">{med.manufacturer}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                      {med.category}
                    </span>
                    {med.verified && (
                      <FiCheckCircle className="text-green-400" size={20} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6"
        >
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
            <FaShieldAlt size={40} className="text-purple-400 mx-auto mb-4" />
            <h3 className="font-bold mb-2">Blockchain Tracking</h3>
            <p className="text-gray-400 text-sm">Every transaction is recorded on immutable blockchain</p>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
            <FaLock size={40} className="text-cyan-400 mx-auto mb-4" />
            <h3 className="font-bold mb-2">Anti-Counterfeit</h3>
            <p className="text-gray-400 text-sm">Advanced verification prevents fake medicines</p>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
            <FaPills size={40} className="text-blue-400 mx-auto mb-4" />
            <h3 className="font-bold mb-2">Verified Database</h3>
            <p className="text-gray-400 text-sm">Connected to authorized pharmaceutical database</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}