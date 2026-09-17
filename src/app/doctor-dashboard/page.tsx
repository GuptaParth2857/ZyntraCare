'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiLock, FiLoader, FiAlertTriangle, FiUsers, FiShield, FiTrendingUp, FiMapPin, FiNavigation, FiRefreshCw } from 'react-icons/fi';
import { useSession } from 'next-auth/react';

interface Incident {
  id: string;
  type: string;
  block: string;
  floor?: string;
  location?: string;
  priority: string;
  priorityLabel?: string;
  nearest?: string;
  notifiedTeam?: string;
  description?: string;
  status?: string;
  time: string;
}

const BLOCK_MAP: Record<string, string> = {
  'Block A': 'Admin Block 1F',
  'Block B': 'Engineering Block 2F',
  'Block C': 'Science Block 1F',
  'Block D': 'Hostel Block 1F',
  'Main Gate': 'Security Booth',
  'Sports Complex': 'North Pavilion',
};

const NEXT_STATUS: Record<string, { next: string; label: string }> = {
  reported: { next: 'dispatched', label: 'Dispatch Team' },
  dispatched: { next: 'on-scene', label: 'Mark On Scene' },
  'on-scene': { next: 'resolved', label: 'Resolve' },
};

const PRIORITY_WEIGHT: Record<string, number> = { high: 0, medium: 1, low: 2 };

export default function DoctorDashboardPage() {
  const { data: session, status } = useSession();
  const demoMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === '1';
  const isAuthenticated = demoMode || status === 'authenticated';

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/campus-emergency');
      const d = await r.json();
      setIncidents(d.incidents ?? []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    load();
    const iv = setInterval(load, 10000);
    return () => clearInterval(iv);
  }, [isAuthenticated, load]);

  const advance = async (inc: Incident) => {
    const step = NEXT_STATUS[inc.status || 'reported'];
    if (!step) return;
    setBusyId(inc.id);
    try {
      const r = await fetch('/api/campus-emergency', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: inc.id, status: step.next }),
      });
      if (r.ok) await load();
    } catch {
    } finally {
      setBusyId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-white">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
          <FiLock size={28} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-3">Responder Dashboard is private</h1>
          <p className="text-gray-400 text-sm mb-8">Sign in as a doctor, campus security or clinic admin to view the incident queue.</p>
          <a href="/auth/signin" className="inline-block bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-semibold transition">
            Sign in
          </a>
          <p className="mt-5 text-sm">
            <a href="?demo=1" className="text-red-400 hover:text-red-300">or try the demo</a>
          </p>
        </div>
      </div>
    );
  }

  const high = incidents.filter((i) => i.priority === 'high').length;
  const medium = incidents.filter((i) => i.priority === 'medium').length;
  const low = incidents.filter((i) => i.priority === 'low').length;
  const open = incidents.filter((i) => (i.status || 'reported') !== 'resolved').length;
  const sorted = [...incidents].sort(
    (a, b) => (PRIORITY_WEIGHT[a.priority] ?? 3) - (PRIORITY_WEIGHT[b.priority] ?? 3)
  );

  const statusBadge = (s?: string) =>
    s === 'resolved'
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
      : s === 'on-scene'
        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
        : s === 'dispatched'
          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          : 'bg-red-500/20 text-red-300 border-red-500/40';

  return (
    <div className="min-h-screen py-12 text-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-2">
          <FiUsers size={22} className="text-red-400" />
          <h1 className="text-3xl font-bold">Campus Incident Dashboard</h1>
          <button onClick={load} className="ml-auto p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition" title="Refresh">
            <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        <p className="text-gray-400 mb-8">
          Live response console for doctors, campus security &amp; admins · {open} open of {incidents.length} total · auto-refreshes every 10s.
        </p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <FiAlertTriangle size={18} className="text-red-500 mb-3" />
            <p className="text-4xl font-black text-red-500">{high}</p>
            <p className="text-sm text-gray-400 mt-1">Critical</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <FiTrendingUp size={18} className="text-amber-500 mb-3" />
            <p className="text-4xl font-black text-amber-500">{medium}</p>
            <p className="text-sm text-gray-400 mt-1">Urgent</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <FiShield size={18} className="text-emerald-500 mb-3" />
            <p className="text-4xl font-black text-emerald-500">{low}</p>
            <p className="text-sm text-gray-400 mt-1">Normal</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-8">
          <h2 className="font-bold text-lg mb-4">Floor guide (nearest facility)</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(BLOCK_MAP).map(([block, map]) => (
              <div key={block} className="bg-white/5 rounded-xl p-3">
                <p className="text-sm font-semibold">{block}</p>
                <p className="text-xs text-gray-400 mt-1">{map}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Emergency queue</h2>
            <span className="text-xs text-gray-500">{incidents.length} total</span>
          </div>
          {loading && incidents.length === 0 ? (
            <div className="flex justify-center py-8">
              <FiLoader size={24} className="animate-spin text-red-500" />
            </div>
          ) : sorted.length === 0 ? (
            <p className="text-center text-gray-500 py-8 text-sm">No incidents yet. Queue is clear — reports will appear here instantly.</p>
          ) : (
            <div className="space-y-3">
              {sorted.map((inc) => {
                const step = NEXT_STATUS[inc.status || 'reported'];
                return (
                  <div key={inc.id} className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-start gap-3">
                      <span className={`mt-1 w-2.5 h-2.5 rounded-full ${inc.priority === 'high' ? 'bg-red-500' : inc.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold">{inc.type}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusBadge(inc.status)} capitalize`}>{inc.status || 'reported'}</span>
                          <span className="text-[10px] text-white/40 uppercase tracking-wide">{inc.priorityLabel || inc.priority}</span>
                        </div>
                        <div className="mt-2 grid gap-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1.5">
                            <FiMapPin className="text-red-400" /> {inc.location || inc.block}
                          </span>
                          {inc.nearest && (
                            <span className="flex items-center gap-1.5">
                              <FiNavigation className="text-red-400" /> {inc.nearest}
                            </span>
                          )}
                          {inc.notifiedTeam && <span className="flex items-center gap-1.5"><FiUsers className="text-emerald-400" /> {inc.notifiedTeam}</span>}
                          {inc.description && <span className="text-gray-500">&ldquo;{inc.description}&rdquo;</span>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-xs text-gray-400 font-mono">{new Date(inc.time).toLocaleTimeString()}</span>
                        {step && (
                          <button
                            onClick={() => advance(inc)}
                            disabled={busyId === inc.id}
                            className="text-xs px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-500 disabled:opacity-50 font-semibold transition"
                          >
                            {busyId === inc.id ? '…' : step.label}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
