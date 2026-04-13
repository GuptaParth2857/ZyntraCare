import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-8">📡</div>
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500 mb-4">
          You're Offline
        </h1>
        <p className="text-slate-400 text-lg mb-8">
          It looks like you've lost your internet connection. Please check your network and try again.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-500 text-white font-bold rounded-xl hover:from-sky-400 hover:to-blue-400 transition-all shadow-lg shadow-sky-500/25"
        >
          🔄 Try Again
        </Link>
      </div>
    </div>
  );
}
