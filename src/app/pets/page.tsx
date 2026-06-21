'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiMapPin, FiPhone, FiCalendar, FiActivity, FiHeart, FiShield, FiAlertCircle, FiCheckCircle, FiNavigation, FiRefreshCw } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const NearbyMap = dynamic(() => import('@/components/NearbyMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-900/80 animate-pulse flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
    </div>
  ),
});

interface Pet {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit';
  breed: string;
  age: number;
  weight: number;
  lastCheckup: string;
  nextVaccination: string;
}

interface PetVenuePlace {
  id: string;
  name: string;
  type: 'clinic' | 'pharmacy' | 'lab';
  lat: number;
  lng: number;
  address?: string;
  phone?: string;
  distance?: number;
  category: 'vet' | 'pet_shop';
  icon: string;
}

interface PetMedicine {
  id: string;
  name: string;
  for: string;
  price: string;
}

export default function PetsPage() {
  const [myPets, setMyPets] = useState<Pet[]>([]);
  const [petMedicines, setPetMedicines] = useState<PetMedicine[]>([]);
  const [vaccinationSchedule, setVaccinationSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'find' | 'medicines'>('dashboard');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [petVenues, setPetVenues] = useState<PetVenuePlace[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(false);
  const [petSearch, setPetSearch] = useState('');
  const [venueFilter, setVenueFilter] = useState<'all' | 'vet' | 'pet_shop'>('all');
  const [radius, setRadius] = useState(5);
  const [selectedVenue, setSelectedVenue] = useState<PetVenuePlace | null>(null);
  const [venueSource, setVenueSource] = useState('');
  const [venueExpanded, setVenueExpanded] = useState(false);

  // Load pets API data
  useEffect(() => {
    fetch('/api/pets').then(r => r.json()).then(data => {
      setMyPets(data.pets || []);
      setPetMedicines(data.petMedicines || []);
      setVaccinationSchedule(data.vaccinationSchedule || []);
      setLoading(false);
    }).catch(() => setLoading(false));

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationLoading(false);
      },
      () => { setLocationLoading(false); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Fetch pet venues (vet clinics, pet shops) via server API
  const fetchPetVenues = useCallback(async () => {
    if (!userLocation) return;
    setVenuesLoading(true);

    const { lat, lng } = userLocation;
    const radiusM = radius * 1000;

    try {
      const res = await fetch(`/api/pets/nearby?lat=${lat}&lng=${lng}&radius=${radiusM}`);
      const data = await res.json();
      if (data.venues && data.venues.length > 0) {
        setPetVenues(data.venues);
        setVenueSource(data.source === 'overpass' ? 'overpass' : 'fallback');
        setVenueExpanded(data.expanded === true);
      }
    } catch (err) {
      console.warn('Failed to fetch pet venues:', err);
    }
    setVenuesLoading(false);
  }, [userLocation, radius]);

  useEffect(() => {
    if (activeTab === 'find' && userLocation) {
      fetchPetVenues();
    }
  }, [activeTab, userLocation, fetchPetVenues]);

  const filteredVenues = petVenues.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(petSearch.toLowerCase());
    const matchesFilter = venueFilter === 'all' || v.category === venueFilter;
    return matchesSearch && matchesFilter;
  });

  // Map places for map display
  const mapPlaces = filteredVenues.map(v => ({
    id: v.id,
    name: v.name,
    type: v.type,
    lat: v.lat,
    lng: v.lng,
    address: v.address,
    phone: v.phone,
    distance: v.distance,
  }));

  const counts = {
    all: petVenues.length,
    vet: petVenues.filter(v => v.category === 'vet').length,
    pet_shop: petVenues.filter(v => v.category === 'pet_shop').length,
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl mb-6">
            <span className="text-4xl">🐾</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Zyntra <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Pets</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Your pet's health matters too! Find pet clinics, pet shops, medicines, and track your furry friend's health.
          </p>
        </motion.div>

        {/* Tab buttons */}
        <div className="flex justify-center gap-4 mb-10">
          {[
            { key: 'dashboard', label: 'My Pets', icon: <FiActivity className="inline mr-2" /> },
            { key: 'find', label: 'Find Nearby', icon: <FiMapPin className="inline mr-2" /> },
            { key: 'medicines', label: 'Pet Medicines', icon: <FiHeart className="inline mr-2" /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-3 rounded-2xl font-bold transition ${
                activeTab === tab.key ? 'bg-orange-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* MY PETS TAB */}
        {activeTab === 'dashboard' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg">My Pets</h3>
                  <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-xl font-bold text-sm transition">
                    + Add Pet
                  </button>
                </div>
                {myPets.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-5xl">🐾</span>
                    <p className="text-gray-400 mt-4">No pets added yet.</p>
                    <button className="mt-3 bg-orange-500 hover:bg-orange-400 text-white px-6 py-2 rounded-xl font-bold text-sm transition">
                      Add Your First Pet
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {myPets.map((pet) => (
                      <motion.div
                        key={pet.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/20 rounded-2xl p-5"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-3xl">
                            {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : '🐾'}
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-white">{pet.name}</h4>
                            <p className="text-gray-400 text-sm">{pet.breed}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-white/5 rounded-xl p-2">
                            <p className="text-xs text-gray-400">Age</p>
                            <p className="font-bold">{pet.age} yrs</p>
                          </div>
                          <div className="bg-white/5 rounded-xl p-2">
                            <p className="text-xs text-gray-400">Weight</p>
                            <p className="font-bold">{pet.weight} kg</p>
                          </div>
                          <div className="bg-white/5 rounded-xl p-2">
                            <p className="text-xs text-gray-400">Last Visit</p>
                            <p className="font-bold">{pet.lastCheckup}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <FiShield className="text-orange-400" /> Vaccination Schedule
                </h3>
                {vaccinationSchedule.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-6">No vaccinations scheduled yet.</p>
                ) : (
                  <div className="space-y-3">
                    {vaccinationSchedule.map((vax, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center">
                            <FiCheckCircle />
                          </div>
                          <div>
                            <p className="font-medium text-white">{vax.vaccine}</p>
                            <p className="text-xs text-gray-400">For {vax.for}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-orange-400 font-bold">{vax.due}</p>
                          <p className="text-xs text-gray-400">Due</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 mb-6">
                <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Link href="/booking" className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition">
                    <FiCalendar className="text-orange-400" />
                    <span className="text-sm">Book Vet Appointment</span>
                  </Link>
                  <button
                    onClick={() => setActiveTab('find')}
                    className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition"
                  >
                    <FiAlertCircle className="text-orange-400" />
                    <span className="text-sm">Find Emergency Pet Clinic</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition">
                    <FiActivity className="text-orange-400" />
                    <span className="text-sm">Log Weight</span>
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-[2rem] p-6">
                <h3 className="font-bold text-lg mb-3">Pet Health Tips</h3>
                <div className="space-y-3">
                  <div className="bg-white/5 rounded-xl p-3"><p className="text-sm text-white">🐕 Regular walks keep dogs healthy and happy</p></div>
                  <div className="bg-white/5 rounded-xl p-3"><p className="text-sm text-white">🐈 Cats need annual pet checkups</p></div>
                  <div className="bg-white/5 rounded-xl p-3"><p className="text-sm text-white">💧 Always provide fresh water</p></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FIND NEARBY TAB */}
        {activeTab === 'find' && (
          <div className="space-y-6">
            {/* Filter + controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Category filters */}
              <div className="flex gap-2 overflow-x-auto">
                {([
                  { key: 'all', label: `All (${counts.all})`, color: 'bg-orange-500' },
                  { key: 'vet', label: `🏥 Pet Clinics (${counts.vet})`, color: 'bg-red-500' },
                  { key: 'pet_shop', label: `🐾 Pet Shops (${counts.pet_shop})`, color: 'bg-amber-500' },
                ] as const).map(f => (
                  <button
                    key={f.key}
                    onClick={() => setVenueFilter(f.key)}
                    className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition ${venueFilter === f.key ? `${f.color} text-white` : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <select
                  value={radius}
                  onChange={e => setRadius(Number(e.target.value))}
                  className="bg-white/5 border border-white/10 text-white text-sm px-3 py-2 rounded-xl outline-none"
                >
                  {[2, 5, 10, 15, 20].map(r => <option key={r} value={r} className="bg-slate-900">{r}km</option>)}
                </select>
                <button
                  onClick={fetchPetVenues}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-orange-400 hover:bg-white/10 transition text-sm"
                >
                  <FiRefreshCw size={14} /> Refresh
                </button>
                {venueSource && (
                  <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-1 rounded-full">
                    {venueSource === 'overpass' ? '🌍 Live OSM' : venueSource === 'overpass_expanded' ? '🌍 Live OSM (50km)' : '📋 Sample'}
                    {venueExpanded && <span className="ml-1 text-amber-400">• expanded</span>}
                  </span>
                )}
              </div>
            </div>

            {/* Location loading */}
            {locationLoading && (
              <div className="text-center py-8 bg-slate-900/40 rounded-2xl border border-white/5">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Getting your location to find nearby pet venues...</p>
              </div>
            )}

            {!locationLoading && (
              <div className="flex gap-4">
                {/* Map */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 rounded-3xl border border-white/10 overflow-hidden shadow-xl relative"
                  style={{ height: '500px' }}
                >
                  {venuesLoading && (
                    <div className="absolute inset-0 z-50 bg-slate-900/70 flex items-center justify-center rounded-3xl">
                      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {userLocation ? (
                    <NearbyMap
                      places={mapPlaces}
                      userLat={userLocation.lat}
                      userLng={userLocation.lng}
                      radius={radius}
                      height="500px"
                      showRadiusCircle
                      onPlaceSelect={(place) => {
                        const venue = petVenues.find(v => v.id === place.id);
                        if (venue) setSelectedVenue(venue);
                      }}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-slate-900/80">
                      <p className="text-slate-400 text-sm">Enable location to see nearby pet venues on map</p>
                    </div>
                  )}
                </motion.div>

                {/* Side list */}
                <div className="w-80 space-y-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
                  {/* Search */}
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                    <input
                      type="text"
                      value={petSearch}
                      onChange={e => setPetSearch(e.target.value)}
                      placeholder="Search pet venues..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/50 text-sm transition"
                    />
                  </div>
                  <p className="text-slate-400 text-xs px-1">
                    <span className="text-orange-400 font-bold">{filteredVenues.length}</span> venues within {radius}km
                  </p>

                  {filteredVenues.length === 0 ? (
                    <div className="text-center py-10 bg-slate-900/30 rounded-2xl border border-white/5">
                      <span className="text-4xl">🐾</span>
                      <p className="text-white/50 text-sm mt-3">No pet venues found nearby</p>
                      <button onClick={() => setRadius(r => Math.min(r + 5, 20))} className="text-orange-400 text-xs mt-2 hover:text-orange-300">
                        Expand to {Math.min(radius + 5, 20)}km
                      </button>
                    </div>
                  ) : (
                    filteredVenues.map((venue) => (
                      <motion.div
                        key={venue.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`group relative overflow-hidden bg-white/[0.04] hover:bg-white/[0.07] border rounded-2xl p-4 transition-all duration-300 cursor-pointer ${selectedVenue?.id === venue.id ? 'border-orange-500/60 bg-orange-500/10' : 'border-white/10 hover:border-orange-500/30'}`}
                        onClick={() => setSelectedVenue(selectedVenue?.id === venue.id ? null : venue)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-lg shadow-lg shadow-orange-500/20 shrink-0">
                            {venue.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-white font-semibold text-sm truncate">{venue.name}</h4>
                            <p className="text-[11px] text-orange-400/70 font-medium capitalize mb-1">
                              {venue.category === 'vet' ? '🏥 Pet Clinic' : '🐾 Pet Shop'}
                            </p>
                            {venue.address && (
                              <p className="text-white/40 text-xs flex items-center gap-1">
                                <FiMapPin size={10} className="shrink-0 text-orange-400/60" />
                                <span className="truncate">{venue.address}</span>
                              </p>
                            )}
                            {venue.distance !== undefined && (
                              <p className="text-orange-400/60 text-xs mt-0.5">{venue.distance.toFixed(1)} km away</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${venue.lat},${venue.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 rounded-lg text-xs font-medium transition border border-orange-500/20"
                              >
                                <FiNavigation size={11} /> Directions
                              </a>
                              {venue.phone && (
                                <a
                                  href={`tel:${venue.phone}`}
                                  onClick={e => e.stopPropagation()}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/70 rounded-lg text-xs transition"
                                >
                                  <FiPhone size={11} /> Call
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MEDICINES TAB */}
        {activeTab === 'medicines' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6">
                <h3 className="font-bold text-lg mb-4">Pet Medicines</h3>
                {petMedicines.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-10">No pet medicines available.</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {petMedicines.map((med) => (
                      <div key={med.id} className="bg-white/5 rounded-2xl p-5 hover:bg-white/10 transition">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-2xl">💊</div>
                          <span className="text-orange-400 font-bold">{med.price}</span>
                        </div>
                        <h4 className="font-bold text-white mb-1">{med.name}</h4>
                        <p className="text-gray-400 text-sm">For: {med.for}</p>
                        <button className="w-full mt-4 bg-orange-500 hover:bg-orange-400 text-white py-2 rounded-xl font-bold text-sm transition">
                          Add to Cart
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6">
                <h3 className="font-bold text-lg mb-4">Order Pet Medicines</h3>
                <p className="text-gray-400 text-sm mb-4">Get medicines delivered to your home.</p>
                <Link href="/pharmacies" className="block w-full bg-orange-500 hover:bg-orange-400 text-white py-3 rounded-xl font-bold text-center transition">
                  Browse Pharmacies
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
