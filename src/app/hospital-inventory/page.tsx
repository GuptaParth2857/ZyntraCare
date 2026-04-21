'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPackage, FiAlertTriangle, FiCheckCircle, FiTrendingUp, FiActivity, FiThermometer, FiDroplet, FiZap, FiUsers, FiShield } from 'react-icons/fi';

interface InventoryItem {
  id: string;
  name: string;
  category: 'oxygen' | 'medicine' | 'surgical' | 'equipment';
  stock: number;
  minStock: number;
  unit: string;
  expiry?: string;
  lastRestocked: string;
}

const INVENTORY: InventoryItem[] = [
  { id: '1', name: 'Oxygen Cylinders (Large)', category: 'oxygen', stock: 25, minStock: 20, unit: 'cylinders', lastRestocked: '2024-03-15' },
  { id: '2', name: 'Oxygen Cylinders (Portable)', category: 'oxygen', stock: 12, minStock: 15, unit: 'cylinders', lastRestocked: '2024-03-10' },
  { id: '3', name: 'Remdesivir Injection', category: 'medicine', stock: 150, minStock: 100, unit: 'vials', expiry: '2025-06', lastRestocked: '2024-03-01' },
  { id: '4', name: 'Paracetamol 500mg', category: 'medicine', stock: 500, minStock: 200, unit: 'tablets', expiry: '2025-12', lastRestocked: '2024-03-18' },
  { id: '5', name: 'Surgical Masks', category: 'surgical', stock: 2000, minStock: 500, unit: 'pcs', lastRestocked: '2024-03-15' },
  { id: '6', name: 'Nitrile Gloves (M)', category: 'surgical', stock: 45, minStock: 100, unit: 'pairs', lastRestocked: '2024-03-12' },
  { id: '7', name: 'Ventilator', category: 'equipment', stock: 8, minStock: 5, unit: 'units', lastRestocked: '2024-02-28' },
  { id: '8', name: 'Defibrillator', category: 'equipment', stock: 3, minStock: 2, unit: 'units', lastRestocked: '2024-02-15' },
];

export default function InventoryPage() {
  const [items] = useState<InventoryItem[]>(INVENTORY);
  const [filter, setFilter] = useState<string>('all');

  const filteredItems = filter === 'all' ? items : items.filter(i => i.category === filter);
  const lowStock = items.filter(i => i.stock <= i.minStock);
  const inStock = items.filter(i => i.stock > i.minStock);

  const getStockStatus = (item: InventoryItem) => {
    if (item.stock === 0) return { label: 'Out of Stock', color: 'bg-red-500', text: 'text-red-500' };
    if (item.stock <= item.minStock) return { label: 'Low Stock', color: 'bg-amber-500', text: 'text-amber-500' };
    return { label: 'In Stock', color: 'bg-emerald-500', text: 'text-emerald-500' };
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <FiPackage className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-black">Inventory Management</h1>
              <p className="text-emerald-200">Track supplies & stock levels</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-black">{items.length}</p>
              <p className="text-xs text-emerald-200">Total Items</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-emerald-400">{inStock.length}</p>
              <p className="text-xs text-emerald-200">In Stock</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-amber-400">{lowStock.length}</p>
              <p className="text-xs text-emerald-200">Low Stock</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Alerts */}
      {lowStock.length > 0 && (
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <FiAlertTriangle className="text-amber-500 text-xl mt-0.5" />
            <div>
              <p className="font-bold text-amber-700">{lowStock.length} items need restocking</p>
              <p className="text-sm text-amber-600">Order now to avoid shortages</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {['all', 'oxygen', 'medicine', 'surgical', 'equipment'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap ${
                filter === cat ? 'bg-emerald-500 text-white' : 'bg-white border'
              }`}
            >
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Inventory List */}
        <div className="space-y-3">
          {filteredItems.map(item => {
            const status = getStockStatus(item);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      item.category === 'oxygen' ? 'bg-cyan-100' :
                      item.category === 'medicine' ? 'bg-purple-100' :
                      item.category === 'surgical' ? 'bg-blue-100' :
                      'bg-amber-100'
                    }`}>
                      {item.category === 'oxygen' && <FiDroplet className="text-cyan-600" />}
                      {item.category === 'medicine' && <FiPackage className="text-purple-600" />}
                      {item.category === 'surgical' && <FiShield className="text-blue-600" />}
                      {item.category === 'equipment' && <FiActivity className="text-amber-600" />}
                    </div>
                    <div>
                      <h3 className="font-bold">{item.name}</h3>
                      <p className="text-xs text-slate-500">Last restocked: {item.lastRestocked}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full text-white ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">Stock Level</span>
                    <span className="font-medium">{item.stock} / {item.minStock * 2} {item.unit}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.stock === 0 ? 'bg-red-500' :
                        item.stock <= item.minStock ? 'bg-amber-500' :
                        'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, (item.stock / (item.minStock * 2)) * 100)}%` }}
                    />
                  </div>
                </div>

                {item.expiry && (
                  <p className="text-xs text-slate-400 mt-2">Expires: {item.expiry}</p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}