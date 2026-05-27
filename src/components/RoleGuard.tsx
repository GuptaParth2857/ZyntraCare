'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FiShield, FiArrowLeft } from 'react-icons/fi';

type Role = 'patient' | 'admin' | 'hospital' | 'ambulance' | 'owner';

export default function RoleGuard({
  allow,
  children,
  title = 'Access Restricted',
  description = 'You do not have permission to view this page.',
}: {
  allow: Role[];
  children: React.ReactNode;
  title?: string;
  description?: string;
}) {
  const { data: session, status } = useSession();
  const userRole = (session?.user as any)?.role as Role | undefined;

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
            <FiShield className="text-amber-400" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
          <p className="text-gray-400 mb-2">{description}</p>
          <p className="text-gray-500 text-sm mb-8">Please sign in with an authorised account.</p>
          <Link href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white/70 hover:text-white transition">
            <FiArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!userRole || !allow.includes(userRole)) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <FiShield className="text-red-400" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Wrong Role</h1>
          <p className="text-gray-400 mb-2">Your account type ({userRole}) does not have access.</p>
          <p className="text-gray-500 text-sm mb-8">This area is for {allow.join(' & ')} accounts only.</p>
          <Link href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white/70 hover:text-white transition">
            <FiArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
