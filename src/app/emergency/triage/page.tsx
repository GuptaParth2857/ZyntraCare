'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiLock, FiLoader, FiCheckCircle } from 'react-icons/fi';
import { useSession } from 'next-auth/react';

interface TriageAssessment {
  urgency: string;
  triageLevel: number;
  possibleConditions: string[];
  recommendedAction: string;
  requiresAmbulance: boolean;
  requiresICU: boolean;
}

export default function TriagePage() {
  const { data: session, status } = useSession();
  const demoMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === '1';
  const isAuthenticated = demoMode || status === 'authenticated';
  const [symptoms, setSymptoms] = useState('');
  const [priority, setPriority] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<TriageAssessment | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms,
          userId: demoMode ? 'demo-user' : (session?.user as any)?.id,
        }),
      });
      const data = await res.json();
      setPriority(data.priority);
      setAssessment(data.assessment ?? null);
      setSaved(Boolean(data.saved));
    } catch (error) {
      console.error('Triage error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <FiLoader size={32} className="animate-spin text-red-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-white">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <FiLock size={28} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your triage is private</h1>
          <p className="text-gray-400 mb-6">Sign in to check symptoms — your medical info stays protected.</p>
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

  return (
    <div className="min-h-screen bg-transparent py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-4">Emergency Priority Check</h1>
        <p className="text-gray-400 mb-8">Describe your symptoms and we'll recommend priority level.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="E.g., Chest pain, difficulty breathing, bleeding..."
            className="w-full p-4 border border-white/10 bg-white/5 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500"
            rows={4}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-500 transition disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Get Priority'}
          </button>
        </form>
        {priority && (
          <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-xl">
            <h2 className="font-bold text-xl mb-2 text-white">Recommended Priority</h2>
            <div className={`text-3xl font-bold ${
              priority === 'high' ? 'text-red-500' : priority === 'medium' ? 'text-amber-500' : 'text-emerald-500'
            }`}>
              {priority.toUpperCase()}
            </div>
            <p className="mt-4 text-gray-400">
              {assessment?.recommendedAction || (
                <>
                  {priority === 'high' && 'Seek immediate medical attention. Call 102 or go to nearest emergency room.'}
                  {priority === 'medium' && 'Visit a clinic or hospital within the next few hours.'}
                  {priority === 'low' && 'Schedule a regular appointment with your doctor.'}
                </>
              )}
            </p>

            {assessment && assessment.possibleConditions.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {assessment.possibleConditions.slice(0, 5).map((c) => (
                  <span key={c} className="text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1 text-gray-300">{c}</span>
                ))}
              </div>
            )}

            {assessment && (
              <div className="mt-4 flex flex-wrap gap-3 text-xs">
                <span className="bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-lg px-3 py-1">Triage level {assessment.triageLevel}/5</span>
                {assessment.requiresAmbulance && <span className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg px-3 py-1">Ambulance required</span>}
                {assessment.requiresICU && <span className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg px-3 py-1">ICU preparation advised</span>}
              </div>
            )}

            {saved && (
              <div className="mt-5 flex items-center gap-2 text-emerald-400 text-sm">
                <FiCheckCircle />
                <span>Saved to your health history.</span>
                <Link href="/health-timeline" className="underline hover:text-emerald-300">View timeline →</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}