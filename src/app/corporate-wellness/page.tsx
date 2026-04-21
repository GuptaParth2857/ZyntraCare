'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiActivity, FiHeart, FiShield, FiTrendingUp, FiCalendar, FiBriefcase, FiCheckCircle, FiAlertCircle, FiDownload, FiMail } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface Employee {
  id: string;
  name: string;
  department: string;
  healthScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  lastCheckup: string;
  vitals: { heartRate: number; bp: string; sugar: string };
  goals: { completed: number; total: number };
}

const MOCK_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Rahul Sharma', department: 'Engineering', healthScore: 85, riskLevel: 'low', lastCheckup: '2024-03-15', vitals: { heartRate: 72, bp: '120/80', sugar: '95' }, goals: { completed: 8, total: 10 } },
  { id: '2', name: 'Priya Singh', department: 'Marketing', healthScore: 72, riskLevel: 'medium', lastCheckup: '2024-03-10', vitals: { heartRate: 88, bp: '130/85', sugar: '110' }, goals: { completed: 5, total: 10 } },
  { id: '3', name: 'Amit Kumar', department: 'Sales', healthScore: 45, riskLevel: 'high', lastCheckup: '2024-02-28', vitals: { heartRate: 95, bp: '145/95', sugar: '145' }, goals: { completed: 2, total: 10 } },
  { id: '4', name: 'Sneha Reddy', department: 'HR', healthScore: 90, riskLevel: 'low', lastCheckup: '2024-03-18', vitals: { heartRate: 68, bp: '115/75', sugar: '88' }, goals: { completed: 9, total: 10 } },
  { id: '5', name: 'Vikram Joshi', department: 'Finance', healthScore: 58, riskLevel: 'high', lastCheckup: '2024-03-01', vitals: { heartRate: 98, bp: '150/100', sugar: '160' }, goals: { completed: 3, total: 10 } },
];

const DEPT_STATS = [
  { name: 'Engineering', healthy: 45, atRisk: 5 },
  { name: 'Marketing', healthy: 30, atRisk: 10 },
  { name: 'Sales', healthy: 25, atRisk: 15 },
  { name: 'HR', healthy: 40, atRisk: 0 },
  { name: 'Finance', healthy: 20, atRisk: 10 },
];

const HEALTH_TREND = [
  { month: 'Jan', avgScore: 72 },
  { month: 'Feb', avgScore: 75 },
  { month: 'Mar', avgScore: 78 },
];

export default function CorporateWellnessPage() {
  const [employees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [selectedDept, setSelectedDept] = useState('all');

  const filteredEmployees = selectedDept === 'all'
    ? employees
    : employees.filter(e => e.department === selectedDept);

  const avgHealthScore = Math.round(employees.reduce((a, e) => a + e.healthScore, 0) / employees.length);
  const highRiskCount = employees.filter(e => e.riskLevel === 'high').length;
  const totalGoals = employees.reduce((a, e) => a + e.goals.completed, 0);

  const riskData = [
    { name: 'Low Risk', value: employees.filter(e => e.riskLevel === 'low').length, color: '#10b981' },
    { name: 'Medium Risk', value: employees.filter(e => e.riskLevel === 'medium').length, color: '#f59e0b' },
    { name: 'High Risk', value: employees.filter(e => e.riskLevel === 'high').length, color: '#ef4444' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 text-white p-6 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <FiBriefcase className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-black">Corporate Wellness</h1>
                <p className="text-indigo-300">Employee Health Dashboard</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white/10 rounded-xl font-medium flex items-center gap-2">
                <FiDownload /> Export
              </button>
              <button className="px-4 py-2 bg-indigo-500 rounded-xl font-medium flex items-center gap-2">
                <FiMail /> Invite
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4">
              <p className="text-indigo-300 text-sm">Total Employees</p>
              <p className="text-3xl font-black">{employees.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4">
              <p className="text-indigo-300 text-sm">Avg Health Score</p>
              <p className="text-3xl font-black text-emerald-400">{avgHealthScore}%</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4">
              <p className="text-indigo-300 text-sm">High Risk</p>
              <p className="text-3xl font-black text-red-400">{highRiskCount}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4">
              <p className="text-indigo-300 text-sm">Goals Completed</p>
              <p className="text-3xl font-black text-amber-400">{totalGoals}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-12 space-y-6">
        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Risk Distribution */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold mb-4">Risk Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-sm">
              {riskData.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Health Trend */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold mb-4">Company Health Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={HEALTH_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[60, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="avgScore" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {highRiskCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <FiAlertCircle className="text-red-500 text-xl mt-0.5" />
            <div>
              <p className="font-bold text-red-700">{highRiskCount} employees require immediate attention</p>
              <p className="text-sm text-red-600">Review health reports and schedule consultations</p>
            </div>
          </div>
        )}

        {/* Department Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedDept('all')}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap ${
              selectedDept === 'all' ? 'bg-indigo-500 text-white' : 'bg-white border'
            }`}
          >
            All Departments
          </button>
          {['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'].map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap ${
                selectedDept === dept ? 'bg-indigo-500 text-white' : 'bg-white border'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Employee List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold">Employee Health Records</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Employee</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Department</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Health Score</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Risk Level</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Vitals</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Goals</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map(emp => (
                  <tr key={emp.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {emp.name.charAt(0)}
                        </div>
                        <span className="font-medium">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{emp.department}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              emp.healthScore >= 70 ? 'bg-emerald-500' : emp.healthScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${emp.healthScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{emp.healthScore}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        emp.riskLevel === 'low' ? 'bg-emerald-100 text-emerald-700' :
                        emp.riskLevel === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {emp.riskLevel.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="space-y-1">
                        <p>❤️ {emp.vitals.heartRate} bpm</p>
                        <p>🩺 {emp.vitals.bp}</p>
                        <p>🩸 {emp.vitals.sugar} mg/dL</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FiCheckCircle className="text-emerald-500" />
                        <span className="text-sm">{emp.goals.completed}/{emp.goals.total}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-indigo-500 font-medium text-sm hover:underline">
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}