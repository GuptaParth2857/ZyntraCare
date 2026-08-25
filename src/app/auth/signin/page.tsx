'use client';

import { useRouter } from 'next/navigation';
import AuthModal from '@/components/AuthModal';

export default function SignInPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <AuthModal
        isOpen={true}
        onClose={() => router.push('/')}
        onLogin={() => router.push('/dashboard')}
      />
    </div>
  );
}
