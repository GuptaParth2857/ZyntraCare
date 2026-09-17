'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  FiFileText,
  FiEdit3,
  FiImage,
  FiShield,
  FiUpload,
  FiSearch,
  FiDownload,
  FiTrash2,
  FiEye,
  FiPlus,
  FiCalendar,
  FiLoader,
  FiAlertCircle,
  FiLock,
  FiUserCheck,
  FiFile,
  FiActivity,
  FiInfo,
} from 'react-icons/fi';

interface RecordItem {
  id: string;
  title: string;
  type: string;
  date: string;
  hospital: string;
  doctor: string;
  fileUrl: string;
  hasFile: boolean;
  fileSize: string;
}

const TYPE_META: Record<string, { label: string; icon: any; chip: string; box: string; iconColor: string; hover: string }> = {
  report: {
    label: 'Lab Report',
    icon: FiFileText,
    chip: 'text-blue-400 bg-blue-500/10',
    box: 'bg-blue-500/10 border-blue-500/20',
    iconColor: 'text-blue-400',
    hover: 'hover:border-blue-500/40',
  },
  prescription: {
    label: 'Prescription',
    icon: FiEdit3,
    chip: 'text-emerald-400 bg-emerald-500/10',
    box: 'bg-emerald-500/10 border-emerald-500/20',
    iconColor: 'text-emerald-400',
    hover: 'hover:border-emerald-500/40',
  },
  scan: {
    label: 'Imaging',
    icon: FiImage,
    chip: 'text-purple-400 bg-purple-500/10',
    box: 'bg-purple-500/10 border-purple-500/20',
    iconColor: 'text-purple-400',
    hover: 'hover:border-purple-500/40',
  },
  vaccination: {
    label: 'Immunization',
    icon: FiShield,
    chip: 'text-amber-400 bg-amber-500/10',
    box: 'bg-amber-500/10 border-amber-500/20',
    iconColor: 'text-amber-400',
    hover: 'hover:border-amber-500/40',
  },
};

function abbreviateTitle(title: string): string {
  return title.length > 48 ? `${title.slice(0, 48)}…` : title;
}

export default function HealthRecordsPage() {
  const { data: session, status } = useSession();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const demoMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === '1';
  const userId = demoMode ? 'demo-user' : (session?.user as any)?.id || '';
  const isAuthenticated = demoMode || status === 'authenticated';

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setError('');
    fetch(`/api/health-records${demoMode ? '?userId=demo-user' : ''}`)
      .then(async r => {
        if (!r.ok) throw new Error(r.status === 401 ? 'Session expired — please sign in again' : 'Failed to load records');
        return r.json();
      })
      .then(data => {
        setRecords((data.records || []).map((r: any) => ({
          id: r.id,
          title: r.title || 'Medical Record',
          type: TYPE_META[r.recordType]?.label ? r.recordType : 'report',
          date: r.date || new Date().toISOString().split('T')[0],
          hospital: r.hospitalName || '',
          doctor: r.doctorName || '',
          fileUrl: r.fileUrl || '',
          hasFile: !!r.hasFile,
          fileSize: r.fileSize || '—',
        })));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load health records');
        setLoading(false);
      });
  }, [isAuthenticated, demoMode]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileRef.current) fileRef.current.value = '';
    if (!file) return;

    const MAX_FILE = 2_000_000;
    if (file.size > MAX_FILE) {
      setError(`File too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Max size is 2 MB.`);
      return;
    }

    const inferType = (name: string): string => {
      const n = name.toLowerCase();
      if (n.includes('prescri') || n.includes('rx')) return 'prescription';
      if (n.includes('scan') || n.includes('mri') || n.includes('ct') || n.includes('xray') || n.includes('x-ray')) return 'scan';
      if (n.includes('vacci') || n.includes('immun')) return 'vaccination';
      if (file.type.startsWith('image/')) return 'scan';
      return 'report';
    };

    const reader = new FileReader();
    reader.onload = async () => {
      setUploading(true);
      setError('');
      try {
        const res = await fetch('/api/health-records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            title: file.name.replace(/\.[^.]+$/, ''),
            type: inferType(file.name),
            date: new Date().toISOString().split('T')[0],
            fileUrl: String(reader.result),
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.record) {
          throw new Error(data.error || 'Upload failed. Please try again.');
        }
        const rec = data.record;
        const newItem: RecordItem = {
          id: rec.id,
          title: rec.title,
          type: TYPE_META[rec.type]?.label ? rec.type : 'report',
          date: rec.date || new Date().toISOString().split('T')[0],
          hospital: rec.hospital || '',
          doctor: rec.doctor || '',
          fileUrl: rec.fileUrl || '',
          hasFile: !!rec.fileUrl,
          fileSize: rec.fileSize || (file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`),
        };
        setRecords(prev => [newItem, ...prev]);
      } catch (err: any) {
        setError(err.message || 'Upload failed. Please try again.');
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => setError('Could not read the selected file.');
    reader.readAsDataURL(file);
  };

  const handleDelete = async (rec: RecordItem) => {
    if (!window.confirm(`Delete "${rec.title}"? This cannot be undone.`)) return;
    setError('');
    try {
      const res = await fetch(`/api/health-records?id=${rec.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete record');
      }
      setRecords(prev => prev.filter(r => r.id !== rec.id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete record');
    }
  };

  const handleView = (rec: RecordItem) => {
    if (!rec.hasFile) return;
    window.open(rec.fileUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = (rec: RecordItem) => {
    if (!rec.hasFile) return;
    const a = document.createElement('a');
    a.href = rec.fileUrl;
    a.download = `${rec.title}.${rec.type === 'report' ? 'pdf' : 'file'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filtered = records.filter(r => {
    const meta = TYPE_META[r.type] || TYPE_META.report;
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.hospital.toLowerCase().includes(search.toLowerCase()) ||
      r.doctor.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || meta.label === filter;
    return matchesSearch && matchesFilter;
  });

  const uploadButton = (
    <>
      <input ref={fileRef} type="file" accept="image/*,.pdf,.jpg,.jpeg,.png,.doc,application/pdf" onChange={handleUpload} className="hidden" />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 rounded-2xl text-white font-black text-sm flex items-center gap-2 transition shadow-[0_8px_30px_rgba(16,185,129,0.25)]"
      >
        {uploading ? <FiLoader className="animate-spin" size={14} /> : <FiUpload size={14} />}
        {uploading ? 'Uploading…' : 'Upload Record'}
      </button>
    </>
  );

  const quickLinks = [
    { href: '/blockchain-records', icon: FiLock, label: 'Blockchain Records', sub: 'Tamper-proof history' },
    { href: '/health-id', icon: FiUserCheck, label: 'Health ID', sub: 'Your unique health identity' },
    { href: '/pdf-prescription', icon: FiFile, label: 'PDF Prescription', sub: 'Generate & share' },
    { href: '/health-tracker', icon: FiActivity, label: 'Health Tracker', sub: 'Daily vitals trends' },
  ];

  return (
    <div className="min-h-screen bg-transparent text-white relative overflow-hidden pt-20">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-900/25 via-transparent to-teal-950/10 pointer-events-none" />
      <div className="pointer-events-none absolute -top-40 -right-40 w-[36rem] h-[36rem] bg-sky-500/10 rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 -left-40 w-[30rem] h-[30rem] bg-emerald-500/10 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex w-16 h-16 bg-white/5 border border-white/10 rounded-[1.5rem] items-center justify-center mb-4 shadow-xl backdrop-blur">
            <FiFileText className="text-sky-400" size={28} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-sky-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">Health Records</span>
          </h1>
          <p className="text-white/40 font-bold tracking-widest uppercase text-xs mt-3">All your medical documents in one place</p>
        </motion.div>

        {!isAuthenticated && status !== 'loading' ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto bg-white/[0.03] border border-white/10 rounded-[2rem] p-10 text-center backdrop-blur-xl">
            <div className="w-14 h-14 mx-auto bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-5">
              <FiLock className="text-emerald-400" size={24} />
            </div>
            <h2 className="text-2xl font-black mb-2">Private to your account</h2>
            <p className="text-white/50 text-sm mb-8">Medical records belong to your account. Sign in to view, upload and manage your health documents.</p>
            <Link href="/auth/signin" className="inline-flex px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-black text-sm hover:from-emerald-500 hover:to-teal-500 transition">
              Sign In
            </Link>
            <p className="text-white/20 text-xs mt-4">Hot preview at <span className="font-mono text-white/40">/health-records?demo=1</span></p>
          </motion.div>
        ) : status === 'loading' ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <FiLoader className="animate-spin text-sky-400" size={32} />
            <p className="text-white/40 text-sm">Loading your records…</p>
          </div>
        ) : (
          <>
            {demoMode && (
              <div className="max-w-3xl mx-auto mb-6 flex items-center gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-sm font-bold">
                <FiInfo size={16} className="flex-shrink-0" />
                Viewing demo dataset. Sign in to manage your own records.
              </div>
            )}

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3">
                <FiAlertCircle className="text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm font-bold flex-1">{error}</p>
                <button onClick={() => { setError(''); setLoading(true); window.location.reload(); }} className="px-3 py-1 bg-red-500/20 rounded-lg text-red-400 text-xs font-bold hover:bg-red-500/30 transition">Retry</button>
              </motion.div>
            )}

            <div className="max-w-3xl mx-auto bg-white/[0.03] border border-white/10 rounded-[2rem] p-4 md:p-5 backdrop-blur-xl shadow-2xl mb-6">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by title, hospital or doctor…"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-sky-500/50 transition"
                  />
                </div>
                {uploadButton}
              </div>
              <div className="flex gap-2 overflow-x-auto mt-4 pb-1">
                {['All', 'Lab Report', 'Prescription', 'Imaging', 'Immunization'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${filter === f ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 hover:text-white'}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <FiLoader className="animate-spin text-sky-400" size={32} />
                <p className="text-white/40 text-sm">Loading your records…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="max-w-lg mx-auto text-center py-16 bg-white/[0.02] border border-white/10 rounded-[2rem]">
                <FiFileText className="mx-auto text-white/20 mb-4" size={48} />
                <p className="text-xl font-black">{records.length === 0 ? 'No records yet' : 'No records found'}</p>
                <p className="text-white/40 text-sm mt-1">{records.length === 0 ? 'Upload your first health record to get started' : 'Try a different search or filter'}</p>
                {records.length === 0 && (
                  <div className="mt-6 flex justify-center"> {uploadButton} </div>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-5">
                {filtered.map(record => {
                  const meta = TYPE_META[record.type] || TYPE_META.report;
                  const Icon = meta.icon;
                  return (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`group bg-white/[0.03] backdrop-blur-xl border border-white/10 ${meta.hover} rounded-[2rem] p-6 transition-all relative overflow-hidden hover:bg-white/[0.05]`}
                    >
                      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity ${meta.box}`} />
                      <div className="flex items-start gap-4 mb-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${meta.box} group-hover:scale-110 transition-transform flex-shrink-0`}>
                          <Icon className={meta.iconColor} size={22} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-black text-lg leading-tight">{abbreviateTitle(record.title)}</h3>
                          <p className="text-white/35 text-[10px] font-bold uppercase tracking-widest mt-1">
                            {[record.hospital, record.doctor].filter(Boolean).join(' • ') || 'Personal record'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mb-5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${meta.chip}`}>{meta.label}</span>
                        <span className="text-white/35 text-xs flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/10 rounded-full">
                          <FiCalendar size={10} /> {record.date}
                        </span>
                        {record.hasFile && <span className="text-white/35 text-[10px] px-2 py-1 bg-white/5 border border-white/10 rounded-full">{record.fileSize}</span>}
                      </div>
                      <div className="flex items-center gap-2 pt-4 border-t border-white/[0.06]">
                        <button
                          onClick={() => handleView(record)}
                          disabled={!record.hasFile}
                          title={record.hasFile ? 'View document' : 'No file attached'}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400 text-xs font-black hover:bg-sky-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          <FiEye size={14} /> View
                        </button>
                        <button
                          onClick={() => handleDownload(record)}
                          disabled={!record.hasFile}
                          title={record.hasFile ? 'Download document' : 'No file attached'}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-black hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          <FiDownload size={14} /> Download
                        </button>
                        <button
                          onClick={() => handleDelete(record)}
                          className="flex items-center justify-center gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-black hover:bg-red-500/25 transition"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickLinks.map(link => (
                <Link key={link.href} href={link.href} className="group bg-white/[0.02] border border-white/10 rounded-[1.5rem] p-5 text-center hover:border-sky-500/40 hover:bg-white/[0.04] transition-all">
                  <div className="w-11 h-11 mx-auto bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-3 group-hover:border-sky-500/30 group-hover:bg-sky-500/10 transition-all">
                    <link.icon className="text-white/50 group-hover:text-sky-400 transition-colors" size={18} />
                  </div>
                  <span className="block text-xs font-black text-white/60 group-hover:text-white transition-colors">{link.label}</span>
                  <span className="block text-[10px] text-white/25 mt-1">{link.sub}</span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}