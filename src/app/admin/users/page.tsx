'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import RoleGuard from '@/components/RoleGuard';
import { FiUsers, FiUserCheck, FiUserPlus, FiShield, FiActivity, FiSearch, FiMail, FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date | string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(data => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice((page - 1) * usersPerPage, page * usersPerPage);

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <RoleGuard allow={['admin']}>
      <div className="min-h-screen bg-transparent p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
                <FiUsers className="text-sky-400" />
                User Management
              </h1>
              <p className="text-slate-400 mt-1">View and manage registered users</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2">
                <FiUserPlus className="text-sky-400" />
                <span className="text-white font-bold">{users.length}</span>
                <span className="text-slate-400 text-sm">Total Users</span>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
            />
          </div>

          {/* Users Table */}
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-slate-400 mt-3">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center">
                <FiUsers className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-slate-400 mt-3">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left p-4 text-slate-400 text-xs font-bold uppercase tracking-widest">User</th>
                      <th className="text-left p-4 text-slate-400 text-xs font-bold uppercase tracking-widest">Email</th>
                      <th className="text-left p-4 text-slate-400 text-xs font-bold uppercase tracking-widest">Role</th>
                      <th className="text-left p-4 text-slate-400 text-xs font-bold uppercase tracking-widest">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((user, i) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-white/5 hover:bg-white/5"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold">
                              {user.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <span className="text-white font-medium">{user.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-slate-300">{user.email}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            user.role === 'admin' 
                              ? 'bg-red-500/20 text-red-400' 
                              : user.role === 'doctor'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-sky-500/20 text-sky-400'
                          }`}>
                            {user.role || 'patient'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-slate-400 text-sm flex items-center gap-2">
                            <FiCalendar size={14} />
                            {formatDate(user.createdAt)}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-slate-400 text-sm">
                Showing {((page - 1) * usersPerPage) + 1} to {Math.min(page * usersPerPage, filteredUsers.length)} of {filteredUsers.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg bg-slate-900 border border-white/10 text-slate-400 disabled:opacity-50 hover:text-white hover:border-sky-500/50"
                >
                  <FiChevronLeft />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-lg font-bold text-sm ${
                      page === i + 1 
                        ? 'bg-sky-500 text-white' 
                        : 'bg-slate-900 border border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg bg-slate-900 border border-white/10 text-slate-400 disabled:opacity-50 hover:text-white hover:border-sky-500/50"
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </RoleGuard>
  );
}
