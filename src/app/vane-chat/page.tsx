import Link from 'next/link';

export default function VaneChatPage() {
  const vaneUrl = process.env.NEXT_PUBLIC_VANE_BASE_URL || 'http://localhost:3000';

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">
          Medical Research Assistant
        </h1>
        <p className="text-muted-foreground mb-6">
          Powered by Vane - AI-powered search engine with sourced answers
        </p>
        
        {/* Iframe for Vane */}
        <div className="relative w-full h-[80vh] bg-slate-800 rounded-lg overflow-hidden shadow-lg">
          <iframe
            title="Vane Interface"
            width="100%"
            height="100%"
            src={vaneUrl}
            frameBorder="0"
            allow="microphone; camera; clipboard-read; clipboard-write"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
        
        <div className="mt-6 text-sm text-muted-foreground">
          <p>
            <Link href="/" className="text-primary hover:underline">
              ← Back to Home
            </Link>
          </p>
          <p className="mt-2">
            Note: Set NEXT_PUBLIC_VANE_BASE_URL environment variable to point to your deployed Vane instance.
            For local development, ensure Vane is running on port 3000 or set the variable accordingly.
          </p>
        </div>
      </div>
    </div>
  );
}