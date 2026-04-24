'use client';

import { Place } from '@/hooks/useNearbyPlaces';
import { formatDistance } from '@/utils/distance';
import { FiPhone, FiMapPin, FiNavigation, FiClock, FiStar, FiExternalLink } from 'react-icons/fi';

interface PlaceCardProps {
  place: Place;
  onSelect?: (place: Place) => void;
  isSelected?: boolean;
  compact?: boolean;
  showMap?: boolean;
}

function PlaceCard({ place, onSelect, isSelected = false, compact = false, showMap = false }: PlaceCardProps) {
  const getTypeStyles = () => {
    switch (place.type) {
      case 'hospital':
        return { bg: 'bg-teal-500/15', border: 'border-teal-500/30', text: 'text-teal-400', icon: '🏥' };
      case 'clinic':
        return { bg: 'bg-blue-500/15', border: 'border-blue-500/30', text: 'text-blue-400', icon: '🏥' };
      case 'pharmacy':
        return { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-400', icon: '💊' };
      default:
        return { bg: 'bg-gray-500/15', border: 'border-gray-500/30', text: 'text-gray-400', icon: '📍' };
    }
  };

  const typeStyles = getTypeStyles();

  const getCleanPhone = (phone: string) => phone.replace(/\D/g, '');
  const openStatus = place.openingHours ? (place.openingHours === '24/7' || place.openingHours.includes('Mo-Fr') ? 'Open' : 'Closed') : '';

  if (compact) {
    return (
      <button
        className={`w-full text-left p-3 rounded-xl border transition-all ${
          isSelected ? 'border-teal-500/50 bg-teal-500/10' : 'border-white/5 bg-white/5 hover:bg-white/10'
        }`}
        onClick={() => onSelect?.(place)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{typeStyles.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{place.name}</p>
            <p className="text-xs text-gray-400">{place.type}</p>
          </div>
          {place.distance && (
            <span className="text-xs text-teal-400 font-medium">{formatDistance(place.distance)}</span>
          )}
        </div>
      </button>
    );
  }

  return (
    <div
      className={`relative bg-slate-900/80 backdrop-blur-sm border rounded-2xl overflow-hidden transition-all duration-300 ${
        isSelected ? 'border-teal-500/50 shadow-lg shadow-teal-500/10' : 'border-white/5 hover:border-white/10'
      }`}
      onClick={() => onSelect?.(place)}
    >
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`w-12 h-12 rounded-xl ${typeStyles.bg} border ${typeStyles.border} flex items-center justify-center text-2xl flex-shrink-0`}>
              {typeStyles.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">{place.name}</h3>
              {place.address && <p className="text-xs text-gray-400 truncate mt-0.5">{place.address}</p>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${typeStyles.bg} ${typeStyles.text} border ${typeStyles.border}`}>
              {place.type.charAt(0).toUpperCase() + place.type.slice(1)}
            </span>
            {openStatus && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                {openStatus}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {place.distance && (
        <div className="flex-shrink-0 text-right px-4">
          <div className="flex items-center gap-1 text-teal-400 font-bold text-lg">
            <FiMapPin size={16} />
            <span>{formatDistance(place.distance)}</span>
          </div>
        </div>
      )}

      <div className="px-4 pb-4">
        <div className="flex gap-2">
          {place.phone && (
            <a
              href={`tel:${getCleanPhone(place.phone)}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-1.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 py-2 rounded-lg text-xs font-bold transition"
            >
              <FiPhone size={12} />
              Call
            </a>
          )}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-slate-300 py-2 rounded-lg text-xs font-semibold transition"
          >
            <FiNavigation size={12} />
            Route
          </a>
        </div>
      </div>
    </div>
  );
}

function PlaceCardSkeleton() {
  return (
    <div className="bg-slate-900/80 rounded-2xl border border-white/5 p-4 animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-slate-800" />
        <div className="flex-1">
          <div className="h-5 w-3/4 bg-slate-800 rounded mb-2" />
          <div className="h-4 w-1/2 bg-slate-800 rounded" />
        </div>
        <div className="h-6 w-16 bg-slate-800 rounded" />
      </div>
      <div className="h-4 w-full bg-slate-800 rounded mb-2" />
      <div className="h-4 w-2/3 bg-slate-800 rounded mb-4" />
      <div className="flex gap-2">
        <div className="flex-1 h-11 bg-slate-800 rounded-xl" />
        <div className="flex-1 h-11 bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}

export { PlaceCard, PlaceCardSkeleton };