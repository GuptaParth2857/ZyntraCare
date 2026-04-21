'use client';

import { useState, useEffect } from 'react';

interface PatientRecord {
  id: string;
  userId: string;
  bloodType?: string;
  allergies?: string;
  medicalHistory?: string;
  emergencyContact?: string;
  emergencyContactPhone?: string;
  dateOfBirth?: string;
  gender?: string;
}

interface HealthMetric {
  id: string;
  date: string;
  bloodPressure?: string;
  heartRate?: number;
  bloodSugar?: number;
  weight?: number;
  height?: number;
  temperature?: number;
  oxygenLevel?: number;
}

export default function PatientHealthDashboard({ userId }: { userId: string }) {
  const [record, setRecord] = useState<PatientRecord | null>(null);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      const [recordRes, metricsRes] = await Promise.all([
        fetch(`/api/patient-records?userId=${userId}`),
        fetch(`/api/health?userId=${userId}`),
      ]);
      const [recordData, metricsData] = await Promise.all([
        recordRes.json(),
        metricsRes.json(),
      ]);
      setRecord(recordData.record);
      setMetrics(metricsData.metrics || []);
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setLoading(false);
    }
  };

  const updateRecord = async (data: Partial<PatientRecord>) => {
    try {
      const res = await fetch('/api/patient-records', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...data }),
      });
      if (res.ok) {
        const updated = await res.json();
        setRecord(updated.record);
      }
    } catch (e) {
      console.error('Update error:', e);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading health data...</div>;

  return (
    <div className="space-y-6">
      {/* Health ID Card */}
      <HealthIDCard record={record} userId={userId} onUpdate={updateRecord} />

      {/* Vitals Grid */}
      <VitalsGrid metrics={metrics} />

      {/* History Charts */}
      <HistoryCharts metrics={metrics} />

      {/* Medical Info */}
      <MedicalInfo record={record} onUpdate={updateRecord} />
    </div>
  );
}

function HealthIDCard({ record, userId, onUpdate }: { record: PatientRecord | null; userId: string; onUpdate: (data: Partial<PatientRecord>) => void }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    bloodType: record?.bloodType || '',
    emergencyContact: record?.emergencyContact || '',
    emergencyContactPhone: record?.emergencyContactPhone || '',
    allergies: record?.allergies || '',
    medicalHistory: record?.medicalHistory || '',
  });

  useEffect(() => {
    if (record) {
      setForm({
        bloodType: record.bloodType || '',
        emergencyContact: record.emergencyContact || '',
        emergencyContactPhone: record.emergencyContactPhone || '',
        allergies: record.allergies || '',
        medicalHistory: record.medicalHistory || '',
      });
    }
  }, [record]);

  const handleSave = () => {
    onUpdate(form);
    setEditing(false);
  };

  return (
    <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">🏥 ZyntraCare Health ID</h2>
          <p className="text-blue-200">Patient ID: {userId.slice(0, 12)}</p>
        </div>
        <button onClick={() => setEditing(!editing)} className="px-3 py-1 bg-white/20 rounded">
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div>
          <p className="text-blue-200 text-sm">Blood Type</p>
          {editing ? (
            <select
              value={form.bloodType}
              onChange={(e) => setForm({ ...form, bloodType: e.target.value })}
              className="w-full p-1 bg-white/20 rounded"
            >
              <option value="">Select</option>
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          ) : (
            <p className="text-xl font-bold">{record?.bloodType || 'N/A'}</p>
          )}
        </div>

        <div>
          <p className="text-blue-200 text-sm">Emergency Contact</p>
          {editing ? (
            <input
              value={form.emergencyContact}
              onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
              className="w-full p-1 bg-white/20 rounded"
              placeholder="Name"
            />
          ) : (
            <p className="font-bold">{record?.emergencyContact || 'N/A'}</p>
          )}
        </div>

        <div>
          <p className="text-blue-200 text-sm">Phone</p>
          {editing ? (
            <input
              value={form.emergencyContactPhone}
              onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
              className="w-full p-1 bg-white/20 rounded"
              placeholder="Phone"
            />
          ) : (
            <p className="font-bold">{record?.emergencyContactPhone || 'N/A'}</p>
          )}
        </div>

        <div>
          <p className="text-blue-200 text-sm">Allergies</p>
          <p className="font-bold">{record?.allergies || 'None'}</p>
        </div>
      </div>

      {editing && (
        <div className="mt-4 space-y-2">
          <textarea
            value={form.medicalHistory}
            onChange={(e) => setForm({ ...form, medicalHistory: e.target.value })}
            className="w-full p-2 bg-white/20 rounded"
            placeholder="Medical History"
            rows={2}
          />
          <button onClick={handleSave} className="w-full py-2 bg-white text-blue-600 font-bold rounded">
            Save
          </button>
        </div>
      )}
    </div>
  );
}

function VitalsGrid({ metrics }: { metrics: HealthMetric[] }) {
  const latest = metrics[0];

  const vitalCards = [
    { label: 'Blood Pressure', value: latest?.bloodPressure || '--/--', unit: 'mmHg', icon: '❤️', color: 'red' },
    { label: 'Heart Rate', value: latest?.heartRate || '--', unit: 'bpm', icon: '💓', color: 'pink' },
    { label: 'Blood Sugar', value: latest?.bloodSugar?.toFixed(1) || '--', unit: 'mg/dL', icon: '🩸', color: 'purple' },
    { label: 'Temperature', value: latest?.temperature?.toFixed(1) || '--', unit: '°F', icon: '🌡️', color: 'orange' },
    { label: 'Oxygen', value: latest?.oxygenLevel?.toFixed(1) || '--', unit: '%', icon: '💨', color: 'blue' },
    { label: 'Weight', value: latest?.weight?.toFixed(1) || '--', unit: 'kg', icon: '⚖️', color: 'green' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {vitalCards.map((vital) => (
        <div key={vital.label} className="bg-gray-800 rounded-xl p-4">
          <p className="text-2xl mb-2">{vital.icon}</p>
          <p className="text-gray-400 text-sm">{vital.label}</p>
          <p className="text-xl font-bold">{vital.value}</p>
          <p className="text-gray-500 text-xs">{vital.unit}</p>
        </div>
      ))}
    </div>
  );
}

function HistoryCharts({ metrics }: { metrics: HealthMetric[] }) {
  const chartData = metrics.slice(0, 7).reverse();

  if (chartData.length === 0) {
    return <div className="text-center p-8 text-gray-500">No health data yet</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">📊 Health Trends (Last 7 Records)</h3>

      {/* Blood Pressure Chart */}
      <div className="bg-gray-800 rounded-xl p-4">
        <h4 className="text-sm text-gray-400 mb-2">Blood Pressure</h4>
        <div className="flex items-end gap-1 h-24">
          {chartData.map((m, i) => {
            const [systolic, diastolic] = (m.bloodPressure || '120/80').split('/').map(Number);
            const maxSystolic = 180;
            const maxDiastolic = 120;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-red-500 rounded-t"
                  style={{ height: `${(systolic / maxSystolic) * 100}%` }}
                />
                <div
                  className="w-full bg-red-300 rounded-t"
                  style={{ height: `${(diastolic / maxDiastolic) * 100}%` }}
                />
                <p className="text-xs text-gray-500 rotate-45">{m.date?.slice(5)}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Heart Rate Chart */}
      <div className="bg-gray-800 rounded-xl p-4">
        <h4 className="text-sm text-gray-400 mb-2">Heart Rate</h4>
        <div className="flex items-end gap-1 h-24">
          {chartData.map((m, i) => {
            const hr = m.heartRate || 80;
            return (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-pink-500 rounded-t"
                  style={{ height: `${Math.min((hr / 120) * 100, 100)}%` }}
                />
                <p className="text-xs text-gray-500">{hr}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MedicalInfo({ record, onUpdate }: { record: PatientRecord | null; onUpdate: (data: Partial<PatientRecord>) => void }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-bold mb-4">📋 Medical Information</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-500 text-sm">Date of Birth</p>
          <p>{record?.dateOfBirth || 'Not set'}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Gender</p>
          <p>{record?.gender || 'Not set'}</p>
        </div>
        <div className="col-span-2">
          <p className="text-gray-500 text-sm">Medical History</p>
          <p>{record?.medicalHistory || 'No history recorded'}</p>
        </div>
        <div className="col-span-2">
          <p className="text-gray-500 text-sm">Known Allergies</p>
          <p>{record?.allergies || 'None'}</p>
        </div>
      </div>
    </div>
  );
}