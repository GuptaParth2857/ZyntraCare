'use client';

import dynamic from 'next/dynamic';

const DebugAssistant = dynamic(() => import('@/components/DebugAssistant'), { ssr: false });

export default function DebugPage() {
  return <DebugAssistant />;
}