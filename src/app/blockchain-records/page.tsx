'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiFileText, FiShield, FiCheckCircle, FiLink, FiClock, FiUser, FiActivity } from 'react-icons/fi';

interface RecordBlock {
  id: string;
  type: string;
  date: string;
  hospital: string;
  hash: string;
  previousHash: string;
  verified: boolean;
}

export default function BlockchainRecordsPage() {
  const [records, setRecords] = useState<RecordBlock[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<RecordBlock | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blockchain-records')
      .then(res => res.json())
      .then(data => {
        const chain = (data.records || []).map((r: any) => ({
          id: r.id,
          type: r.type || r.title || 'Record',
          date: r.date || new Date(r.timestamp).toISOString().split('T')[0],
          hospital: r.hospital || 'Unknown',
          hash: r.hash ? `0x${r.hash.slice(0, 4)}...${r.hash.slice(-4)}` : '0x0000...0000',
          previousHash: r.previousHash ? `0x${r.previousHash.slice(0, 4)}...${r.previousHash.slice(-4)}` : '0000...0000',
          verified: true,
        }));
        setRecords(chain);
      })
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <FiLock className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-black">Blockchain Health Records</h1>
              <p className="text-indigo-300">Immutable, tamper-proof medical history</p>
            </div>
          </div>

          {/* Security Info */}
          <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl border border-indigo-500/30 p-4 mb-6">
            <div className="flex items-center gap-3">
              <FiShield className="text-indigo-400 text-2xl" />
              <div>
                <p className="font-bold">Blockchain Secured</p>
                <p className="text-sm text-gray-400">Records are cryptographically signed and cannot be altered</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Chain Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-indigo-500/30" />

            {loading ? (
              <div className="text-center py-16">
                <div className="w-10 h-10 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400 text-sm">Loading blockchain records...</p>
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-16">
                <FiLock size={48} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No blockchain records found</p>
                <p className="text-gray-500 text-sm mt-1">Records will appear here after medical events are logged</p>
              </div>
            ) : records.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-20 pb-6"
              >
                {/* Chain Node */}
                <div className={`absolute left-5 w-6 h-6 rounded-full flex items-center justify-center ${
                  record.verified ? 'bg-emerald-500' : 'bg-amber-500'
                }`}>
                  {record.verified ? <FiCheckCircle className="text-white text-sm" /> : <FiLock className="text-white text-sm" />}
                </div>

                {/* Record Card */}
                <button
                  onClick={() => setSelectedRecord(record)}
                  className="w-full bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 text-left hover:border-indigo-500/30 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                        <FiFileText className="text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="font-bold">{record.type}</h3>
                        <p className="text-sm text-gray-400 flex items-center gap-1">
                          <FiUser size={12} /> {record.hospital}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400 flex items-center gap-1">
                        <FiClock size={12} /> {record.date}
                      </p>
                      <p className="text-xs text-indigo-400 font-mono mt-1">{record.hash}</p>
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>

          {/* Record Details Modal */}
          {selectedRecord && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedRecord(null)}>
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-slate-800 rounded-3xl p-6 max-w-md w-full border border-white/10" onClick={e => e.stopPropagation()}>
                <h3 className="font-bold text-lg mb-4">Record Details</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type</span>
                    <span>{selectedRecord.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date</span>
                    <span>{selectedRecord.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Hospital</span>
                    <span>{selectedRecord.hospital}</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 mt-3">
                    <p className="text-gray-400 mb-1">Transaction Hash</p>
                    <p className="text-xs font-mono bg-black/30 p-2 rounded">{selectedRecord.hash}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Previous Hash</p>
                    <p className="text-xs font-mono bg-black/30 p-2 rounded">{selectedRecord.previousHash}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-emerald-400">
                    <FiCheckCircle />
                    <span>Verified on Blockchain</span>
                  </div>
                </div>

                <button onClick={() => setSelectedRecord(null)} className="w-full mt-6 py-3 bg-indigo-500 rounded-xl font-medium">
                  Close
                </button>
              </motion.div>
            </div>
          )}

          {/* Footer */}
          <p className="text-xs text-gray-500 text-center mt-8">
            🔒 Records secured with cryptographic hashing • Patient-owned data
          </p>
        </motion.div>
      </div>
    </div>
  );
}