'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function PremiumGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') return <div className="text-center p-4">Loading...</div>;

  const isPremium = session?.user?.subscription?.plan !== 'Free' &&
                    session?.user?.subscription?.status === 'active';

  if (!isPremium) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Premium Feature</h2>
        <p className="text-gray-600 mb-6">This feature is only available for premium subscribers.</p>
        <button
          onClick={() => router.push('/subscription')}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
        >
          Upgrade to Premium
        </button>
      </div>
    );
  }

  return <>{children}</>;
}