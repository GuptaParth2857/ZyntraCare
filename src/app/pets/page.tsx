'use client';

import { useState } from 'react';
import { FiSearch, FiMapPin, FiPhone, FiClock, FiStar, FiCalendar, FiActivity, FiHeart, FiShield, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';

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

interface PetMedicine {
  id: string;
  name: string;
  for: string;
  price: string;
}

const myPets: Pet[] = [
  { id: '1', name: 'Max', species: 'dog', breed: 'Golden Retriever', age: 3, weight: 30, lastCheckup: 'Jan 2026', nextVaccination: 'Apr 2026' },
  { id: '2', name: 'Luna', species: 'cat', breed: 'Persian', age: 2, weight: 4, lastCheckup: 'Feb 2026', nextVaccination: 'May 2026' },
];

const vetClinics: VetClinic[] = [
  { id: '1', name: 'Pet Care Clinic', address: 'HSR Layout, Bangalore', phone: '+91 98765 43210', rating: 4.8, distance: '1.2km', open24x7: true, services: ['Vaccination', 'Surgery', 'Grooming'] },
  { id: '2', name: 'VetPlus Hospital', address: 'Koramangala, Bangalore', phone: '+91 98765 43211', rating: 4.6, distance: '2.5km', open24x7: true, services: ['Emergency', 'Dental', 'Diagnostic'] },
  { id: '3', name: 'Animal Wellness Center', address: 'Indiranagar, Bangalore', phone: '+91 98765 43212', rating: 4.5, distance: '3.8km', open24x7: false, services: ['Acupuncture', 'Physiotherapy'] },
];

const petMedicines: PetMedicine[] = [
  { id: '1', name: 'Deworming Tablet', for: 'Dogs & Cats', price: '₹50' },
  { id: '2', name: 'Flea & Tick Spray', for: 'All Pets', price: '₹250' },
  { id: '3', name: 'Pet Vitamin Syrup', for: 'Dogs', price: '₹180' },
  { id: '4', name: 'Eye Drop', for: 'Dogs & Cats', price: '₹120' },
];

const vaccinationSchedule = [
  { vaccine: 'Rabies', due: 'Apr 2026', for: 'Max' },
  { vaccine: 'DHPP', due: 'May 2026', for: 'Max' },
  { vaccine: 'FVRCP', due: 'May 2026', for: 'Luna' },
];

export default function PetsPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'vets' | 'medicines'>('dashboard');

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
            onClick={() => setActiveTab('vets')}
            className={`px-6 py-3 rounded-2xl font-bold transition ${
              activeTab === 'vets' ? 'bg-orange-500 text-white' : 'bg-white/10 text-gray-400'
            }`}
          >
            <FiMapPin className="inline mr-2" /> Find Vets
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

        {activeTab === 'vets' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="relative mb-6">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for vet clinics..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-4">
                {vetClinics.map((clinic) => (
                  <motion.div
                    key={clinic.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 hover:border-orange-500/30 transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-white">{clinic.name}</h4>
                        <p className="text-gray-400 text-sm flex items-center gap-1">
                          <FiMapPin size={14} /> {clinic.address} - {clinic.distance}
                        </p>
                      </div>
                      {clinic.open24x7 && (
                        <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">
                          24/7
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {clinic.services.map((service, idx) => (
                        <span key={idx} className="bg-white/5 text-gray-300 px-3 py-1 rounded-full text-xs">
                          {service}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <FiStar className="text-amber-400 fill-current" size={18} />
                          <span className="font-bold text-white">{clinic.rating}</span>
                        </div>
                        <a href={`tel:${clinic.phone}`} className="flex items-center gap-2 text-orange-400 hover:text-orange-300">
                          <FiPhone size={16} />
                          <span className="text-sm">{clinic.phone}</span>
                        </a>
                      </div>
                      <Link href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.address)}`} target="_blank" className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-bold text-sm transition">
                        Get Directions
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6">
                <h3 className="font-bold text-lg mb-4">Emergency Contacts</h3>
                <div className="space-y-3">
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <p className="text-red-400 font-bold mb-1">Animal Emergency</p>
                    <p className="text-white font-bold">+91 98765 40000</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-gray-400 font-bold mb-1">Pet Ambulance</p>
                    <p className="text-white font-bold">+91 98765 40001</p>
                  </div>
                </div>
              </div>
            </div>
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
