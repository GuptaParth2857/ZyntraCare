import Link from 'next/link';

export default function ChatPage() {
  // When deployed together, LibreChat will be served under /librechat
  // For local dev, you can still run LibreChat on port 3001 and override via env var if needed
  const librechatBase = process.env.NEXT_PUBLIC_LIBRECHAT_BASE_URL || '/librechat';

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">
          AI Health Assistant
        </h1>
        <p className="text-muted-foreground mb-6">
          Powered by LibreChat - Advanced AI chat interface
        </p>
        
        {/* Iframe for LibreChat */}
        <div className="relative w-full h-[80vh] bg-slate-800 rounded-lg overflow-hidden shadow-lg">
          <iframe
            title="LibreChat Interface"
            width="100%"
            height="100%"
            src={`${librechatBase}/`}
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
            Note: Set NEXT_PUBLIC_LIBRECHAT_BASE_URL environment variable to change the base path.
            For local development with separate LibreChat, set to http://localhost:3001.
            When both projects are deployed together via Vercel monorepo, leave as default '/librechat'.
          </p>
        </div>
      </div>
    </div>
  );
}