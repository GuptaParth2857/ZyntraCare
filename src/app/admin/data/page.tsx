'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import RoleGuard from '@/components/RoleGuard';
import { FiUsers, FiMessageSquare, FiMail, FiCalendar, FiHome, FiUserCheck, FiDollarSign, FiActivity, FiAlertTriangle, FiServer, FiRefreshCw, FiSearch, FiChevronLeft, FiChevronRight, FiDatabase, FiHeart, FiStar, FiMapPin, FiShield } from 'react-icons/fi';

interface TableInfo {
  total: number;
  recent: number;
}

interface TableData {
  table: string;
  total: number;
  page: number;
  rows: Record<string, any>[];
}

const TABLE_ICONS: Record<string, any> = {
  users: FiUsers,
  feedback: FiMessageSquare,
  contact: FiMail,
  appointments: FiCalendar,
  hospitals: FiHome,
  doctors: FiUserCheck,
  sponsors: FiDollarSign,
  subscriptions: FiStar,
  emergencies: FiAlertTriangle,
  camps: FiMapPin,
  bloodDonors: FiHeart,
  pharmacies: FiShield,
  labs: FiServer,
  healthRecords: FiActivity,
  rewards: FiStar,
};

const TABLE_LABELS: Record<string, string> = {
  users: 'Users',
  feedback: 'Feedback',
  contact: 'Contact Messages',
  appointments: 'Appointments',
  hospitals: 'Hospitals',
  doctors: 'Doctors',
  sponsors: 'Sponsor Inquiries',
  subscriptions: 'Subscriptions',
  emergencies: 'Emergency Alerts',
  camps: 'Health Camps',
  bloodDonors: 'Blood Donors',
  organRecipients: 'Organ Recipients',
  pharmacies: 'Pharmacies',
  labs: 'Labs',
  insurance: 'Insurance Policies',
  corporate: 'Corporate Programs',
  wellnessMissions: 'Wellness Missions',
  healthRecords: 'Health Records',
  healthMetrics: 'Health Metrics',
  rewards: 'Rewards',
  transactions: 'Transactions',
};

export default function AdminDataPage() {
  const [tables, setTables] = useState<Record<string, TableInfo>>({});
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingTable, setLoadingTable] = useState(false);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/data');
      const data = await res.json();
      if (data.tables) setTables(data.tables);
    } catch (e) {
      console.error('Failed to fetch admin overview:', e);
    }
    setLoading(false);
  }, []);

  const fetchTable = useCallback(async (table: string, p: number) => {
    setLoadingTable(true);
    setTableData(null);
    try {
      const res = await fetch(`/api/admin/data?table=${table}&page=${p}&limit=30`);
      const data = await res.json();
      setTableData(data);
    } catch (e) {
      console.error('Failed to fetch table data:', e);
    }
    setLoadingTable(false);
  }, []);

  useEffect(() => { fetchOverview(); }, [fetchOverview]);

  useEffect(() => {
    if (activeTable) {
      setPage(1);
      fetchTable(activeTable, 1);
    }
  }, [activeTable, fetchTable]);

  const handlePageChange = (newPage: number) => {
    if (!activeTable) return;
    setPage(newPage);
    fetchTable(activeTable, newPage);
  };

  const formatDate = (d: any) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return String(d); }
  };

  const renderValue = (key: string, val: any) => {
    if (val === null || val === undefined) return <span className="text-gray-600">—</span>;
    if (key.toLowerCase().includes('date') || key.toLowerCase().includes('createdat') || key.toLowerCase().includes('updatedat')) return formatDate(val);
    if (typeof val === 'boolean') return val ? <span className="text-emerald-400 font-bold">Yes</span> : <span className="text-gray-500">No</span>;
    if (typeof val === 'object') return <span className="text-gray-500 text-xs truncate max-w-[200px] inline-block">{JSON.stringify(val)}</span>;
    return String(val);
  };

  const sortedTables = Object.entries(tables).sort(([, a], [, b]) => b.total - a.total);

  return (
    <RoleGuard allow={['admin']}>
      <div className="min-h-screen bg-transparent text-white p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FiDatabase size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black">Data Manager</h1>
                <p className="text-gray-400 text-sm">Browse and manage all database records</p>
              </div>
            </div>
            <button onClick={fetchOverview} className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-sm font-bold hover:bg-white/20 transition">
              <FiRefreshCw size={14} /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
                {sortedTables.map(([key, info]) => {
                  const Icon = TABLE_ICONS[key] || FiDatabase;
                  return (
                    <button key={key} onClick={() => setActiveTable(key)}
                      className={`bg-slate-900/60 border rounded-2xl p-4 text-left transition hover:scale-[1.02] ${activeTable === key ? 'border-blue-500/50 bg-blue-500/10' : 'border-white/10 hover:border-white/20'}`}>
                      <Icon className={`mb-2 ${key === 'emergencies' ? 'text-red-400' : 'text-blue-400'}`} size={20} />
                      <p className="text-xs font-bold text-gray-400 truncate">{TABLE_LABELS[key] || key}</p>
                      <p className="text-2xl font-black mt-1">{info.total}</p>
                      {info.recent > 0 && <p className="text-[10px] text-emerald-400">+{info.recent} today</p>}
                    </button>
                  );
                })}
              </div>

              {activeTable && (
                <div className="bg-slate-900/60 border border-white/10 rounded-3xl overflow-hidden">
                  <div className="p-4 md:p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-black">{TABLE_LABELS[activeTable] || activeTable}</h2>
                      {tableData && <span className="text-sm text-gray-500">({tableData.total} records)</span>}
                    </div>
                    <div className="relative w-full md:w-64">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                      <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Filter rows..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50" />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    {loadingTable ? (
                      <div className="flex items-center justify-center py-20">
                        <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : tableData && tableData.rows.length > 0 ? (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/5">
                            {Object.keys(tableData.rows[0]).map(col => (
                              <th key={col} className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                {col.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.rows
                            .filter(row => !searchTerm || Object.values(row).some(v => String(v || '').toLowerCase().includes(searchTerm.toLowerCase())))
                            .map((row, i) => (
                              <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition">
                                {Object.entries(row).map(([key, val]) => (
                                  <td key={key} className="px-4 py-3 text-xs text-gray-300 max-w-[250px] truncate">
                                    {renderValue(key, val)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-16 text-gray-500">
                        <FiDatabase className="mx-auto text-3xl mb-3" />
                        <p className="font-bold">No records found</p>
                        <p className="text-sm">This table is empty</p>
                      </div>
                    )}
                  </div>

                  {tableData && tableData.total > 30 && (
                    <div className="flex items-center justify-between px-4 py-4 border-t border-white/10">
                      <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1} className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-lg text-xs font-bold disabled:opacity-30 hover:bg-white/10 transition">
                        <FiChevronLeft size={14} /> Previous
                      </button>
                      <span className="text-xs text-gray-500">Page {page} of {Math.ceil(tableData.total / 30)}</span>
                      <button onClick={() => handlePageChange(page + 1)} disabled={page >= Math.ceil(tableData.total / 30)} className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-lg text-xs font-bold disabled:opacity-30 hover:bg-white/10 transition">
                        Next <FiChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </RoleGuard>
  );
}
