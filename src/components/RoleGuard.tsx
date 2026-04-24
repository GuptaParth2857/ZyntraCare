'use client';

import Link from 'next/link';

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
  // Guest mode - allow access for all features
  // Role checks can be added later for specific admin features
  
  return <>{children}</>;
}