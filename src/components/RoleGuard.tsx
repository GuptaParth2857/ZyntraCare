'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

type Role = 'patient' | 'admin' | 'hospital' | 'ambulance' | 'owner';

export default function RoleGuard({
  allow,
  children,
  title = 'Access restricted',
  description = 'You do not have permission to view this page.',
}: {
  allow: Role[];
  children: React.ReactNode;
  title?: string;
  description?: string;
}) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-white">
        <div
          className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
          aria-label="Loading"
        />
      </div>
    );
  }

  const role = (session?.user?.role || 'patient') as Role;
  const allowed = !!session && allow.includes(role);

  if (!allowed) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-center text-white">
          <h2 className="text-2xl font-black mb-2">{title}</h2>
          <p className="text-gray-400 mb-6">{description}</p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 font-bold transition"
            >
              Go home
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 border border-blue-500/40 font-bold transition"
            >
              Sign in
            </Link>
          </div>
          <p className="text-gray-600 text-xs mt-5">
            Signed in role:{' '}
            <span className="text-gray-400 font-semibold">{session?.user?.role ?? 'none'}</span>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
