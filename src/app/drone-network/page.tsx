'use client';

import { useState, useEffect } from 'react';
import { FiNavigation, FiMapPin, FiPackage, FiClock, FiShield, FiZap, FiActivity, FiRadio } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Drone {
  id: string;
  type: 'blood' | 'organ' | 'medicine' | 'emergency';
  status: 'idle' | 'charging' | 'in-transit' | 'returning';
  currentLocation: { lat: number; lng: number };
  destination: string;
  ETA: string;
  battery: number;
  altitude: number;
  speed: number;
}

const drones: Drone[] = [
  { id: 'DRN-001', type: 'blood', status: 'in-transit', currentLocation: { lat: 28.6139, lng: 77.2090 }, destination: 'AIIMS, Delhi', ETA: '8 min', battery: 78, altitude: 120, speed: 45 },
  { id: 'DRN-002', type: 'medicine', status: 'in-transit', currentLocation: { lat: 28.6288, lng: 77.2194 }, destination: 'Fortis Hospital', ETA: '12 min', battery: 92, altitude: 100, speed: 38 },
  { id: 'DRN-003', type: 'organ', status: 'charging', currentLocation: { lat: 28.5892, lng: 77.2298 }, destination: 'Medanta', ETA: 'Standby', battery: 45, altitude: 0, speed: 0 },
  { id: 'DRN-004', type: 'emergency', status: 'in-transit', currentLocation: { lat: 28.6544, lng: 77.2412 }, destination: 'Emergency Site - Dwarka', ETA: '3 min', battery: 95, altitude: 150, speed: 65 },
  { id: 'DRN-005', type: 'blood', status: 'returning', currentLocation: { lat: 28.5661, lng: 77.2434 }, destination: 'Base Station', ETA: '15 min', battery: 34, altitude: 80, speed: 30 },
];

const activeDeliveries = [
  { id: 'DEL-001', item: 'Blood Pack (O+)', quantity: 2, from: 'Red Cross Bank', to: 'Apollo Hospital', status: 'In Transit', drone: 'DRN-001', eta: '8 min' },
  { id: 'DEL-002', item: 'Insulin Vials', quantity: 10, from: 'MedPlus Pharmacy', to: 'Home Delivery', status: 'In Transit', drone: 'DRN-002', eta: '12 min' },
  { id: 'DEL-003', item: 'Heart Valves', quantity: 1, from: 'Manipal Hospital', to: 'AIIMS OT', status: 'Standby', drone: 'DRN-003', eta: 'Pending' },
];

const typeColors = {
  blood: 'from-red-500 to-rose-500',
  organ: 'from-purple-500 to-pink-500',
  medicine: 'from-blue-500 to-cyan-500',
  emergency: 'from-amber-500 to-orange-500',
};

export default function DroneNetworkPage() {
  const [selectedDrone, setSelectedDrone] = useState<string | null>(null);
  const [liveDrones, setLiveDrones] = useState(drones);
  const [deliveries, setDeliveries] = useState(activeDeliveries);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const pulseInterval = setInterval(() => setPulse(prev => (prev + 1) % 100), 100);
    return () => clearInterval(pulseInterval);
  }, []);

  useEffect(() => {
    const droneInterval = setInterval(() => {
      setLiveDrones(prev => prev.map(d => ({
        ...d,
        battery: Math.max(20, d.battery - (d.status === 'in-transit' ? 0.5 : 0)),
        speed: d.status === 'in-transit' ? Math.max(20, d.speed + (Math.random() - 0.5) * 10) : d.speed,
        currentLocation: d.status === 'in-transit' ? {
          lat: d.currentLocation.lat + (Math.random() - 0.5) * 0.001,
          lng: d.currentLocation.lng + (Math.random() - 0.5) * 0.001,
        } : d.currentLocation,
      })));
    }, 2000);
    return () => clearInterval(droneInterval);
  }, []);

  useEffect(() => {
    const deliveryInterval = setInterval(() => {
      setDeliveries(prev => prev.map(d => {
        if (d.status === 'In Transit') {
          const mins = parseInt(d.eta) || 10;
          return { ...d, eta: Math.max(1, mins - 1) + ' min' };
        }
        return d;
      }));
    }, 15000);
    return () => clearInterval(deliveryInterval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden font-inter text-white">
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-24">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 rounded-2xl mb-4">
            <FiNavigation size={32} className="text-cyan-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-2">
            Zyntra <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Sky Network</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Autonomous medical drone delivery system. Blood, organs & medicines delivered within minutes.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xl flex items-center gap-2">
                  <FiMapPin className="text-cyan-400" /> Live Drone Tracking
                </h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-green-500/10 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-green-400 text-xs font-bold">5 Active</span>
                  </div>
                </div>
              </div>

              <div className="relative aspect-[16/9] bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl overflow-hidden mb-4">
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9IiMyMDIwMzEiLz48L2c+PC9zdmc+')] opacity-30" />
                </div>

                {drones.map((drone, idx) => (
                  <motion.div
                    key={drone.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="absolute cursor-pointer"
                    style={{
                      left: `${((drone.currentLocation.lng - 77.18) / 0.1) * 50}%`,
                      top: `${((drone.currentLocation.lat - 28.55) / 0.12) * 50}%`,
                    }}
                    onClick={() => setSelectedDrone(drone.id)}
                  >
                    <motion.div
                      animate={drone.status === 'in-transit' ? { y: [0, -10, 0] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`relative w-12 h-12 rounded-full bg-gradient-to-br ${typeColors[drone.type]} flex items-center justify-center shadow-lg ${
                        selectedDrone === drone.id ? 'ring-4 ring-white' : ''
                      }`}
                    >
                      <FiNavigation className="text-white" size={20} />
                      {drone.status === 'in-transit' && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
                      )}
                    </motion.div>
                  </motion.div>
                ))}

                <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-xl">
                  <p className="text-xs text-gray-400">Live Map • Delhi NCR</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {drones.map((drone) => (
                  <button
                    key={drone.id}
                    onClick={() => setSelectedDrone(drone.id)}
                    className={`p-3 rounded-xl text-left transition ${
                      selectedDrone === drone.id 
                        ? 'bg-cyan-500/20 border border-cyan-500/30' 
                        : 'bg-white/5 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    <p className="font-bold text-sm">{drone.id}</p>
                    <p className="text-xs text-gray-400 capitalize">{drone.type}</p>
                    <p className={`text-xs font-bold ${drone.status === 'in-transit' ? 'text-green-400' : 'text-gray-400'}`}>
                      {drone.status}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 mb-6">
              <h3 className="font-bold text-lg mb-4">Network Stats</h3>
              <div className="space-y-3">
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Total Drones</p>
                  <p className="text-2xl font-bold text-white">12</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-gray-400">In Transit</p>
                  <p className="text-2xl font-bold text-green-400">5</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Avg Delivery</p>
                  <p className="text-2xl font-bold text-cyan-400">8 min</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-[2rem] p-6">
              <h3 className="font-bold text-lg mb-3">Order Delivery</h3>
              <p className="text-gray-400 text-sm mb-4">Request urgent medical delivery via drone.</p>
              <div className="space-y-2">
                <button className="w-full bg-red-500 hover:bg-red-400 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2">
                  <FiZap /> Emergency Blood
                </button>
                <button className="w-full bg-purple-500 hover:bg-purple-400 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2">
                  <FiPackage /> Organ Transport
                </button>
                <button className="w-full bg-blue-500 hover:bg-blue-400 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2">
                  <FiZap /> Medicine Delivery
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-bold text-xl mb-4">Active Deliveries</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {activeDeliveries.map((delivery) => (
              <div key={delivery.id} className="bg-slate-900/80 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-white">{delivery.item}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    delivery.status === 'In Transit' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {delivery.status}
                  </span>
                </div>
                <div className="text-sm text-gray-400 mb-3">
                  <p>From: {delivery.from}</p>
                  <p>To: {delivery.to}</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <span className="text-xs text-gray-500">{delivery.drone}</span>
                  <span className="text-cyan-400 font-bold">{delivery.eta}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}