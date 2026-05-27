'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiMapPin, FiPhone, FiCalendar, FiActivity, FiHeart, FiShield, FiAlertCircle, FiCheckCircle, FiNavigation, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const LiveHealthMap = dynamic(() => import('@/components/LiveHealthMap'), { ssr: false });

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

interface VetClinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  rating: number;
  distance: string;
  open24x7: boolean;
  services: string[];
}

interface PetShop {
  id: number;
  name: string;
  type: 'pet_shop';
  lat: number;
  lng: number;
  distance: number;
  address?: string;
}

interface PetMedicine {
  id: string;
  name: string;
  for: string;
  price: string;
}

export default function PetsPage() {
  const [myPets, setMyPets] = useState<Pet[]>([]);
  const [vetClinics, setVetClinics] = useState<VetClinic[]>([]);
  const [petMedicines, setPetMedicines] = useState<PetMedicine[]>([]);
  const [vaccinationSchedule, setVaccinationSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pets' | 'medicines'>('dashboard');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [petShops, setPetShops] = useState<PetShop[]>([]);
  const [petSearch, setPetSearch] = useState('');

  useEffect(() => {
    fetch('/api/pets').then(r => r.json()).then(data => {
      setMyPets(data.pets || []);
      setVetClinics(data.vetClinics || []);
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

  useEffect(() => {
    if (activeTab !== 'pets') return;
    if (!userLocation) {
      setPetShops(getFallbackShops());
      return;
    }
    const overpassQuery = `[out:json];(node["shop"="pet"](around:5000,${userLocation.lat},${userLocation.lng}););out center 30;`;
    fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`)
      .then(r => r.json())
      .then(data => {
        const shops: PetShop[] = (data.elements || []).map((el: any, i: number) => ({
          id: i,
          name: el.tags?.name || 'Pet Shop',
          type: 'pet_shop' as const,
          lat: el.lat || el.center?.lat || 0,
          lng: el.lon || el.center?.lon || 0,
          distance: 0,
          address: el.tags?.['addr:street']
            ? `${el.tags?.['addr:street']}${el.tags?.['addr:city'] ? ', ' + el.tags?.['addr:city'] : ''}`
            : el.tags?.['addr:city']
              ? el.tags?.['addr:city']
              : undefined,
        })).filter((s: PetShop) => s.lat && s.lng);
        if (shops.length > 0) {
          setPetShops(shops);
        } else {
          setPetShops(getFallbackShops());
        }
      })
      .catch(() => setPetShops(getFallbackShops()));
  }, [userLocation, activeTab]);

  function getFallbackShops(): PetShop[] {
    return [
      { id: 1, name: 'Paws & Claws Pet Store', type: 'pet_shop', lat: 28.6139, lng: 77.2090, distance: 0, address: 'Connaught Place, New Delhi' },
      { id: 2, name: 'Happy Tails Pet Shop', type: 'pet_shop', lat: 28.6200, lng: 77.2200, distance: 0, address: 'Karol Bagh, New Delhi' },
      { id: 3, name: 'Pet World India', type: 'pet_shop', lat: 28.6300, lng: 77.2000, distance: 0, address: 'Rajendra Nagar, New Delhi' },
      { id: 4, name: 'Furry Friends Pet Shop', type: 'pet_shop', lat: 28.6100, lng: 77.2300, distance: 0, address: 'Lajpat Nagar, New Delhi' },
      { id: 5, name: 'Aqua & Pets Hub', type: 'pet_shop', lat: 28.6400, lng: 77.1900, distance: 0, address: 'Model Town, New Delhi' },
      { id: 6, name: 'The Pet Planet', type: 'pet_shop', lat: 28.6000, lng: 77.2400, distance: 0, address: 'Greater Kailash, New Delhi' },
    ];
  }

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center p-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl mb-6">
            <span className="text-4xl">🐾</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Zyntra <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Pets</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Your pet's health matters too! Find vets, medicines, and track your furry friend's health.
          </p>
        </motion.div>

        <div className="flex justify-center gap-4 mb-10">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 rounded-2xl font-bold transition ${
              activeTab === 'dashboard' ? 'bg-orange-500 text-white' : 'bg-white/10 text-gray-400'
            }`}
          >
            <FiActivity className="inline mr-2" /> My Pets
          </button>
          <button
            onClick={() => setActiveTab('pets')}
            className={`px-6 py-3 rounded-2xl font-bold transition ${
              activeTab === 'pets' ? 'bg-orange-500 text-white' : 'bg-white/10 text-gray-400'
            }`}
          >
            <FiMapPin className="inline mr-2" /> Find Pets
          </button>
          <button
            onClick={() => setActiveTab('medicines')}
            className={`px-6 py-3 rounded-2xl font-bold transition ${
              activeTab === 'medicines' ? 'bg-orange-500 text-white' : 'bg-white/10 text-gray-400'
            }`}
          >
            <FiHeart className="inline mr-2" /> Pet Medicines
          </button>
        </div>

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
              </div>

              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <FiShield className="text-orange-400" /> Vaccination Schedule
                </h3>
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
                  <button className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition">
                    <FiAlertCircle className="text-orange-400" />
                    <span className="text-sm">Emergency Vet</span>
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
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-sm text-white">🐕 Regular walks keep dogs healthy and happy</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-sm text-white">🐈 Cats need annual vet checkups</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-sm text-white">💧 Always provide fresh water</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pets' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden h-[380px] shadow-xl">
              <LiveHealthMap
                facilities={petShops}
                userLocation={userLocation}
                centerLat={userLocation?.lat}
                centerLng={userLocation?.lng}
              />
            </motion.div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                <input type="text" value={petSearch} onChange={e => setPetSearch(e.target.value)}
                  placeholder="Search pet shops..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/50 transition" />
              </div>
              {petShops.length > 0 && (
                <span className="text-white/40 text-sm whitespace-nowrap">{petShops.length} shop{petShops.length !== 1 ? 's' : ''}</span>
              )}
            </div>

            {petShops.filter(s => s.name.toLowerCase().includes(petSearch.toLowerCase())).length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {petShops.filter(s => s.name.toLowerCase().includes(petSearch.toLowerCase())).map((shop, idx) => (
                  <motion.div key={shop.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    className="group relative overflow-hidden bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 hover:border-orange-500/30 rounded-2xl p-5 transition-all duration-300">
                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-all duration-500" />
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-xl shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 group-hover:scale-110 transition-all duration-300">
                          <span className="drop-shadow-sm">🐾</span>
                        </div>
                        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-orange-400/30 to-amber-500/30 blur-sm -z-10 group-hover:blur-md transition-all duration-300" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-white font-semibold text-base truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-200 group-hover:to-amber-200 transition-all duration-300">{shop.name}</h4>
                        {shop.address ? (
                          <p className="text-white/40 text-xs flex items-center gap-1.5 mt-1">
                            <FiMapPin size={12} className="shrink-0 text-orange-400/60" />
                            <span className="truncate">{shop.address}</span>
                          </p>
                        ) : (
                          <p className="text-white/30 text-xs mt-1">📍 Location available on map</p>
                        )}
                        <div className="flex items-center gap-3 mt-3">
                          <a href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500/15 to-amber-500/15 hover:from-orange-500/25 hover:to-amber-500/25 text-orange-400 rounded-xl text-xs font-medium transition-all border border-orange-500/20 hover:border-orange-500/40">
                            <FiNavigation size={13} /> Directions
                          </a>
                          <a href={`https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/70 rounded-xl text-xs transition">
                            <FiMapPin size={13} /> View on Maps
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="relative w-20 h-20 mx-auto mb-5">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400/20 to-amber-400/20 blur-xl" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-3xl shadow-lg shadow-orange-500/30">
                    🐾
                  </div>
                </div>
                <p className="text-white/50 text-lg font-medium">No pet shops found nearby</p>
                <p className="text-white/30 text-sm mt-1">Enable location or try searching a different area</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'medicines' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6">
                <h3 className="font-bold text-lg mb-4">Pet Medicines</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {petMedicines.map((med) => (
                    <div key={med.id} className="bg-white/5 rounded-2xl p-5 hover:bg-white/10 transition">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-2xl">
                          💊
                        </div>
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
