'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiLock, FiLoader, FiAlertTriangle, FiUsers, FiMapPin, FiShield, FiCheckCircle, FiBell, FiNavigation } from 'react-icons/fi';
import { useSession } from 'next-auth/react';

const EMERGENCY_TYPES = ['Medical', 'Fire', 'Security', 'Accident', 'Other'];
const CAMPUS_BLOCKS = ['Block A', 'Block B', 'Block C', 'Block D', 'Main Gate', 'Sports Complex'];
const CAMPUS_FLOORS = ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor'];

const STATUS_STEPS = [
  { key: 'reported', label: 'Reported', hint: 'Incident logged and team alerted' },
  { key: 'dispatched', label: 'Team Dispatched', hint: 'Response team is on the way' },
  { key: 'on-scene', label: 'On Scene', hint: 'Responders have reached the location' },
  { key: 'resolved', label: 'Resolved', hint: 'Situation handled — help completed' },
];

type Incident = {
  id: string;
  type: string;
  block: string;
  floor?: string;
  location?: string;
  priority: string;
  priorityLabel?: string;
  nearest: string;
  notifiedTeam?: string;
  status?: string;
  source?: string;
  notifySent?: boolean;
  time?: string;
};

export default function CampusEmergencyPage() {
  const { data: session, status } = useSession();
  const demoMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === '1';
  const isAuthenticated = demoMode || status === 'authenticated';
  const reporterId = demoMode ? 'demo-user' : (session?.user as any)?.id;

  const [type, setType] = useState('');
  const [block, setBlock] = useState('');
  const [floor, setFloor] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);
  const [lerror, setError] = useState('');
  const [result, setResult] = useState<Incident | null>(null);
  const [history, setHistory] = useState<Incident[]>([]);

  const loadIncidents = useCallback(async () => {
    try {
      const r = await fetch('/api/campus-emergency');
      const d = await r.json();
      if (Array.isArray(d.incidents)) setHistory(d.incidents);
    } catch {}
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadIncidents();
  }, [isAuthenticated, loadIncidents]);

  // Live incident tracking — poll the active incident until it is resolved.
  useEffect(() => {
    if (!result?.id || result.status === 'resolved') return;
    const iv = setInterval(async () => {
      try {
        const r = await fetch('/api/campus-emergency');
        const d = await r.json();
        const latest = (d.incidents || []).find((i: Incident) => i.id === result.id);
        if (latest) {
          setResult((prev) => (prev ? { ...prev, ...latest } : latest));
          setHistory(d.incidents);
        }
      } catch {}
    }, 5000);
    return () => clearInterval(iv);
  }, [result?.id, result?.status]);

  const report = async (payload: Record<string, unknown>, isSos: boolean) => {
    setError('');
    if (isSos) setSosLoading(true);
    else setLoading(true);
    try {
      const res = await fetch('/api/campus-emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, reporter: reporterId, sos: isSos }),
      });
      const data = await res.json();
      setResult(data);
      loadIncidents();
    } catch (err) {
      console.error('Campus emergency error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSosLoading(false);
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !block) {
      setError('Please select emergency type and location block.');
      return;
    }
    report({ type, block, floor, description, contact }, false);
  };

  const handleSos = () => {
    report(
      {
        type: 'Medical',
        block: block || 'Block B',
        floor,
        description: description || 'One-tap SOS — need immediate medical help.',
        contact,
      },
      true
    );
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <FiLoader size={30} className="animate-spin text-red-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-white">
        <div className="max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-[2rem] p-8 text-center">
          <FiLock size={28} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-3xl font-bold mb-2">Campus Emergency is private</h1>
          <p className="text-gray-400 mb-6">Sign in to report an incident — your location and emergency stay protected.</p>
          <a href="/auth/signin" className="inline-block bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-semibold transition">
            Sign In
          </a>
          <p className="mt-4 text-sm">
            <a href="?demo=1" className="text-red-400 hover:text-red-300">or try the demo</a>
          </p>
        </div>
      </div>
    );
  }

  const priorityColor =
    result?.priority === 'high' ? 'text-red-500' : result?.priority === 'medium' ? 'text-amber-500' : 'text-emerald-500';
  const priorityRing =
    result?.priority === 'high' ? 'border-red-500/50' : result?.priority === 'medium' ? 'border-amber-500/50' : 'border-emerald-500/40';
  const priorityHint =
    result?.priority === 'high'
      ? 'Immediate dispatch — stay where you are if safe, keep the entry clear, call 112 if life-threatening.'
      : result?.priority === 'medium'
        ? 'Response team on the way — remain at the location and keep the block gate open.'
        : 'Logged for the campus nurse. Help will reach you shortly.';
  const statusIndex = Math.max(0, STATUS_STEPS.findIndex((s) => s.key === (result?.status || 'reported')));

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
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <FiAlertTriangle className="text-red-500" /> Campus Emergency
        </h1>
        <p className="text-gray-400 mb-6">One-tap reporting — AI classifies severity, routes the nearest first-aid and notifies the right campus team.</p>

        <button
          type="button"
          onClick={handleSos}
          disabled={sosLoading || loading}
          className="w-full mb-6 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white py-5 rounded-[2rem] font-black text-xl tracking-wide flex items-center justify-center gap-3 shadow-lg shadow-red-900/40 border border-red-400/40 transition"
        >
          {sosLoading ? <FiLoader className="animate-spin" /> : <FiBell />}
          {sosLoading ? 'SENDING SOS…' : 'ONE-TAP SOS — MEDICAL EMERGENCY'}
        </button>
        <p className="text-center text-xs text-gray-500 -mt-3 mb-8">
          Instantly alerts {block ? `the team for ${block}` : 'campus medical + security'} with critical priority. Type & location optional below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white/5 border border-white/10 rounded-[2rem] p-6">
          <div>
            <label className="text-sm text-gray-400 font-semibold block mb-2">Emergency type</label>
            <div className="flex flex-wrap gap-2">
              {EMERGENCY_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                    type === t ? 'bg-red-600 border-red-500 text-white' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 font-semibold block mb-2">Campus location</label>
            <div className="flex flex-wrap gap-2">
              {CAMPUS_BLOCKS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBlock(b)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                    block === b ? 'bg-red-600 border-red-500 text-white' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 font-semibold block mb-2">Floor</label>
            <div className="flex flex-wrap gap-2">
              {CAMPUS_FLOORS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFloor(f)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                    floor === f ? 'bg-red-600 border-red-500 text-white' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 font-semibold block mb-2">What happened?</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="E.g. Student collapsed near Block B second floor, lab corridor..."
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 font-semibold block mb-2">Emergency contact (optional)</label>
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="+91 98XXXXXX21"
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500"
            />
          </div>

          {lerror && <p className="text-red-400 text-sm">{lerror}</p>}

          <button
            type="submit"
            disabled={loading || sosLoading}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/15 text-white py-3.5 rounded-xl font-bold transition disabled:opacity-50"
          >
            {loading ? 'Reporting…' : 'Report Emergency'}
          </button>
        </form>

        {result && (
          <div className={`mt-8 bg-white/5 border ${priorityRing} rounded-[2rem] p-6 animate-in fade-in slide-in-from-bottom-4`}>
            <div className="flex items-center gap-3">
              <span className={`text-3xl font-black ${priorityColor}`}>{result.priorityLabel || result.priority?.toUpperCase()}</span>
              <span className="ml-auto text-white/40 font-mono text-xs">{result.id}</span>
            </div>
            <p className="text-gray-300 mt-2 text-sm">{priorityHint}</p>

            <div className="mt-4 grid gap-2 text-sm">
              <div className="flex items-start gap-2 text-gray-300">
                <FiMapPin className="mt-0.5 text-red-400" />
                <span>
                  Location: <span className="text-white">{result.location || (result.floor ? `${result.block}, ${result.floor}` : result.block)}</span>
                </span>
              </div>
              <div className="flex items-start gap-2 text-gray-300">
                <FiNavigation className="mt-0.5 text-red-400" />
                <span>
                  Nearest help: <span className="text-white">{result.nearest}</span>
                </span>
              </div>
              {result.notifySent && (
                <div className="flex items-center gap-2 text-emerald-400">
                  <FiUsers /> Notify: <span className="text-white">{result.notifiedTeam || 'Campus Response Team'}</span> — notified.
                </div>
              )}
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">Live incident tracking</p>
              <div className="space-y-2">
                {STATUS_STEPS.map((step, i) => {
                  const done = i <= statusIndex;
                  const active = i === statusIndex;
                  return (
                    <div key={step.key} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] ${done ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-white/5 border-white/15 text-gray-500'}`}>
                          {done ? <FiCheckCircle size={12} /> : i + 1}
                        </span>
                        {i < STATUS_STEPS.length - 1 && <span className={`w-px h-5 ${i < statusIndex ? 'bg-emerald-500/40' : 'bg-white/10'}`} />}
                      </div>
                      <div className={active ? 'text-white' : done ? 'text-gray-300' : 'text-gray-500'}>
                        <p className="text-sm font-semibold">{step.label}</p>
                        <p className="text-xs text-gray-500">{step.hint}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="mt-4 text-[10px] uppercase tracking-wide text-gray-600">
              Classified by {result.source === 'ai' ? 'AI model' : 'clinical rules'} · updates automatically
            </p>
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-8 bg-white/5 border border-white/10 rounded-[2rem] p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FiShield /> Recent incidents
            </h3>
            <div className="space-y-2">
              {history.slice(0, 8).map((h) => (
                <div key={h.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl text-sm">
                  <span className={`w-2 h-2 rounded-full ${h.priority === 'high' ? 'bg-red-500' : h.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-300 truncate">
                      {h.type} · {h.location || (h.floor ? `${h.block}, ${h.floor}` : h.block)}
                    </p>
                    <p className="text-white/40 text-xs font-mono truncate">
                      {h.id} · {h.notifiedTeam}
                    </p>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full border capitalize ${statusBadge(h.status)}`}>{h.status || 'reported'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
