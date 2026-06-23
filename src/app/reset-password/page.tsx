'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiLock, FiCheck, FiAlertCircle } from 'react-icons/fi';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(true);

  useEffect(() => {
    if (!token) {
      setValidToken(false);
      setError('Invalid or missing reset token.');
    }
  }, [token]);

  const handleReset = async () => {
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push('/auth/signin'), 2000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiLock size={28} className="text-white" />
          </div>

          {success ? (
            <>
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck size={28} className="text-white" />
              </div>
              <h2 className="text-2xl font-black text-center mb-2">Password Reset!</h2>
              <p className="text-gray-400 text-center">Redirecting to login...</p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-black text-center mb-2">Reset Password</h2>
              <p className="text-gray-400 text-center mb-6">Enter your new password below</p>

              {!validToken && (
                <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm flex items-center gap-2">
                  <FiAlertCircle /> Invalid reset link. Please request a new one.
                </div>
              )}

              {error && (
                <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">{error}</div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Confirm Password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleReset}
                  disabled={loading || !validToken}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 rounded-xl text-white font-bold transition"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </motion.button>
              </div>

              <p className="text-center mt-6 text-sm text-gray-500">
                <Link href="/auth/signin" className="text-blue-400 hover:text-blue-300 font-semibold">Back to Login</Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
