'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { FiFileText, FiUpload, FiSearch, FiFilter, FiDownload, FiTrash2, FiEye, FiPlus, FiChevronRight, FiCalendar, FiClock, FiLoader, FiAlertCircle } from 'react-icons/fi';

export default function HealthRecordsPage() {
  const { data: session } = useSession();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const userId = (session?.user as any)?.id || 'demo-user';

  useEffect(() => {
    fetch(`/api/health-records?userId=${userId}`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to load records');
        return r.json();
      })
      .then(data => {
        if (data.records?.length) {
          setRecords(data.records.map((r: any) => ({
            id: r.id,
            title: r.title || r.recordType || 'Medical Record',
            type: r.recordType === 'report' ? 'Lab Report' : r.recordType === 'prescription' ? 'Prescription' : r.recordType === 'scan' ? 'Imaging' : 'Immunization',
            date: r.date ? new Date(r.date).toLocaleDateString() : new Date().toLocaleDateString(),
            hospital: r.hospitalName || '',
            doctor: r.doctorName || '',
            fileSize: r.fileSize || '--',
          })));
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load health records');
        setLoading(false);
      });
  }, [session, userId]);

  const handleDelete = (id: number) => {
    fetch(`/api/health-records?id=${id}`, { method: 'DELETE' })
      .then(() => setRecords(prev => prev.filter(r => r.id !== id)))
      .catch(() => setRecords(prev => prev.filter(r => r.id !== id)));
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const inferType = (name: string): string => {
      const n = name.toLowerCase();
      if (n.includes('prescri') || n.includes('rx')) return 'prescription';
      if (n.includes('scan') || n.includes('mri') || n.includes('ct') || n.includes('xray') || n.includes('x-ray')) return 'scan';
      if (n.includes('vacci') || n.includes('immun')) return 'vaccination';
      return 'report';
    };
    const recordPreview: any = {
      id: -Date.now(),
      title: file.name.replace(/\.[^.]+$/, ''),
      type: inferType(file.name) === 'prescription' ? 'Prescription' : inferType(file.name) === 'scan' ? 'Imaging' : inferType(file.name) === 'vaccination' ? 'Immunization' : 'Lab Report',
      date: new Date().toLocaleDateString(),
      hospital: '',
      doctor: '',
      fileSize: file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`,
    };
    fetch('/api/health-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        title: recordPreview.title,
        type: inferType(file.name),
        date: new Date().toISOString().split('T')[0],
        fileUrl: `upload://${file.name}`,
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.record) setRecords(prev => [{ ...recordPreview, id: data.record.id }, ...prev]);
        else setRecords(prev => [recordPreview, ...prev]);
      })
      .catch(() => setRecords(prev => [recordPreview, ...prev]));
    if (fileRef.current) fileRef.current.value = '';
  };

  const filtered = records.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.hospital.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || r.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-transparent text-white pb-24">
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 px-4 pt-20 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"><FiFileText className="text-white" size={24} /></div>
            <div>
              <h1 className="text-3xl font-black">Health Records</h1>
              <p className="text-purple-200 text-sm">All your medical documents in one place</p>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search records..." className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:border-purple-400/50 backdrop-blur" />
            </div>
            <button onClick={() => fileRef.current?.click()} className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-bold text-sm hover:bg-white/20 transition flex items-center gap-2">
              <FiUpload size={14} /> Upload
            </button>
            <input ref={fileRef} type="file" accept="image/*,.pdf,.doc,application/pdf" onChange={handleUpload} className="hidden" />
          </div>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3">
            <FiAlertCircle className="text-red-400 flex-shrink-0" />
            <div>
              <p className="text-red-400 text-sm font-bold">Error loading records</p>
              <p className="text-red-400/70 text-xs">{error}</p>
            </div>
            <button onClick={() => { setError(''); setLoading(true); window.location.reload(); }} className="ml-auto px-3 py-1 bg-red-500/20 rounded-lg text-red-400 text-xs font-bold hover:bg-red-500/30 transition">Retry</button>
          </motion.div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-4">
          {['All', 'Lab Report', 'Prescription', 'Imaging', 'Immunization'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${filter === f ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <FiLoader className="animate-spin text-purple-400" size={32} />
            <p className="text-gray-400 text-sm">Loading your health records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FiFileText className="text-5xl text-gray-600 mx-auto mb-4" />
            <p className="text-xl font-bold">{records.length === 0 ? 'No records yet' : 'No records found'}</p>
            <p className="text-gray-500 text-sm mt-1">{records.length === 0 ? 'Upload your first health record to get started' : 'Try a different search or filter'}</p>
            {records.length === 0 && (
              <button onClick={() => fileRef.current?.click()} className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold inline-flex items-center gap-2">
                <FiPlus size={16} /> Upload Record
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(record => (
              <motion.div key={record.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 hover:bg-slate-900/80 transition group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${record.type === 'Lab Report' ? 'bg-blue-500/20' : record.type === 'Prescription' ? 'bg-emerald-500/20' : record.type === 'Imaging' ? 'bg-purple-500/20' : 'bg-amber-500/20'}`}>
                      <FiFileText className={`${record.type === 'Lab Report' ? 'text-blue-400' : record.type === 'Prescription' ? 'text-emerald-400' : record.type === 'Imaging' ? 'text-purple-400' : 'text-amber-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-bold">{record.title}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${record.type === 'Lab Report' ? 'bg-blue-500/10 text-blue-400' : record.type === 'Prescription' ? 'bg-emerald-500/10 text-emerald-400' : record.type === 'Imaging' ? 'bg-purple-500/10 text-purple-400' : 'bg-amber-500/10 text-amber-400'}`}>{record.type}</span>
                        <FiCalendar size={10} /> {record.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">{record.fileSize}</span>
                    <button className="p-2 text-gray-500 hover:text-blue-400 transition" title="View"><FiEye size={16} /></button>
                    <button className="p-2 text-gray-500 hover:text-emerald-400 transition" title="Download"><FiDownload size={16} /></button>
                    <button onClick={() => handleDelete(record.id)} className="p-2 text-gray-500 hover:text-red-400 transition" title="Delete"><FiTrash2 size={16} /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/blockchain-records" className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 text-center hover:border-blue-500/30 transition">
            <span className="text-2xl block mb-1">🔗</span>
            <span className="text-xs font-bold text-gray-400">Blockchain Records</span>
          </Link>
          <Link href="/health-id" className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 text-center hover:border-blue-500/30 transition">
            <span className="text-2xl block mb-1">🪪</span>
            <span className="text-xs font-bold text-gray-400">Health ID</span>
          </Link>
          <Link href="/pdf-prescription" className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 text-center hover:border-blue-500/30 transition">
            <span className="text-2xl block mb-1">📄</span>
            <span className="text-xs font-bold text-gray-400">PDF Prescription</span>
          </Link>
          <Link href="/health-tracker" className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 text-center hover:border-blue-500/30 transition">
            <span className="text-2xl block mb-1">📈</span>
            <span className="text-xs font-bold text-gray-400">Health Tracker</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
