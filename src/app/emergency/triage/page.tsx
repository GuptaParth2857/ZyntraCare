'use client';

import { useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

export default function TriagePage() {
  const [symptoms, setSymptoms] = useState('');
  const [priority, setPriority] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms }),
      });
      const data = await res.json();
      setPriority(data.priority);
    } catch (error) {
      console.error('Triage error:', error);
    } finally {
      setLoading(false);
    }
  };

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
              {priority === 'high' && 'Seek immediate medical attention. Call 102 or go to nearest emergency room.'}
              {priority === 'medium' && 'Visit a clinic or hospital within the next few hours.'}
              {priority === 'low' && 'Schedule a regular appointment with your doctor.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}