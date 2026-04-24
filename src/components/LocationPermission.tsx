'use client';

// LocationPermission.tsx - Request Location Permission UI
// Handles permission states gracefully

import { FiMapPin, FiRefreshCw, FiX } from 'react-icons/fi';

interface LocationPermissionProps {
  onRequestPermission: () => void;
  loading?: boolean;
  error?: string | null;
  onUseDefault?: () => void;
}

export default function LocationPermission({
  onRequestPermission,
  loading = false,
  error = null,
  onUseDefault,
}: LocationPermissionProps) {
  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
      {/* Icon */}
      <div className="w-16 h-16 mx-auto mb-4 bg-teal-500/20 rounded-full flex items-center justify-center">
        <FiMapPin size={32} className="text-teal-400" />
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-white mb-2">
        Enable Location
      </h3>

      {/* Description */}
      <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
        We need your location to find hospitals, clinics, and medical stores near you. 
        Your location is only used to show nearby places and is never shared.
      </p>

      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-col gap-3 max-w-xs mx-auto">
        <button
          onClick={onRequestPermission}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white py-3 px-6 rounded-xl font-bold text-sm transition shadow-lg shadow-teal-500/20 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Getting Location...
            </>
          ) : (
            <>
              <FiMapPin size={18} />
              Enable Location
            </>
          )}
        </button>

        {onUseDefault && (
          <button
            onClick={onUseDefault}
            className="flex items-center justify-center gap-2 text-slate-400 hover:text-white py-2 text-sm transition"
          >
            Use Default Location (Delhi)
          </button>
        )}
      </div>

      {/* Privacy note */}
      <p className="text-xs text-slate-500 mt-6 flex items-center justify-center gap-1">
        <FiMapPin size={10} />
        Your location data is processed locally and never stored on our servers
      </p>
    </div>
  );
}

// LocationPermissionDenied - When user denies permission
interface LocationDeniedProps {
  onRetry: () => void;
}

export function LocationDenied({ onRetry }: LocationDeniedProps) {
  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6 text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
        <FiX size={32} className="text-red-400" />
      </div>

      <h3 className="text-xl font-bold text-white mb-2">
        Location Access Denied
      </h3>

      <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
        You denied location access. You can still browse hospitals, but we cannot show 
        places near you. To enable location, change your browser settings.
      </p>

      <button
        onClick={onRetry}
        className="flex items-center justify-center gap-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 py-3 px-6 rounded-xl font-bold text-sm transition"
      >
        <FiRefreshCw size={18} />
        Try Again
      </button>
    </div>
  );
}