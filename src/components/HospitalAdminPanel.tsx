'use client';

import { useState, useEffect } from 'react';

interface HospitalAdmin {
  id: string;
  userId: string;
  hospitalId: string;
  permissions: string;
  hospital?: { name: string; address: string };
}

interface Doctor {
  id: string;
  userId: string;
  specialty: string;
  license: string;
  experience: number;
  bio: string;
  education: string;
  languages: string;
  consultingFee: number;
  isAvailable: boolean;
  user?: { name: string; email: string; phone: string };
  hospitalLinks?: { hospital: { name: string } }[];
}

interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  rating: number;
  verified: boolean;
}

export default function HospitalAdminPanel({ adminId }: { adminId?: string }) {
  const [admins, setAdmins] = useState<HospitalAdmin[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'doctors' | 'beds' | 'alerts'>('dashboard');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const [adminsRes, doctorsRes] = await Promise.all([
        fetch('/api/hospital-admin'),
        fetch('/api/doctors'),
      ]);
      const [adminsData, doctorsData] = await Promise.all([
        adminsRes.json(),
        doctorsRes.json(),
      ]);
      setAdmins(adminsData.admins || []);
      setDoctors(doctorsData.doctors || []);
    } catch (e) {
      console.error('Fetch error:', e);
    }
  };

  const makeDoctor = async (userId: string, specialty: string, license: string) => {
    try {
      const res = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, specialty, license }),
      });
      if (res.ok) {
        alert('Doctor created!');
        fetchData();
      }
    } catch (e) {
      console.error('Error:', e);
    }
  };

  const toggleDoctorAvailability = async (doctorId: string, isAvailable: boolean) => {
    try {
      await fetch('/api/doctors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId, isAvailable }),
      });
      fetchData();
    } catch (e) {
      console.error('Error:', e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-blue-600 p-4">
        <h1 className="text-xl font-bold">🏥 Hospital Admin Panel</h1>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-800">
        {['dashboard', 'doctors', 'beds', 'alerts'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-3 capitalize ${
              activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'dashboard' && (
          <DashboardView admins={admins} doctors={doctors} />
        )}
        {activeTab === 'doctors' && (
          <DoctorsView doctors={doctors} onToggle={toggleDoctorAvailability} onAdd={makeDoctor} />
        )}
        {activeTab === 'beds' && <BedsView />}
        {activeTab === 'alerts' && <AlertsView />}
      </div>
    </div>
  );
}

function DashboardView({ admins, doctors }: { admins: HospitalAdmin[]; doctors: Doctor[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-blue-600 p-6 rounded-lg">
        <p className="text-3xl font-bold">{admins.length}</p>
        <p className="text-sm">Admins</p>
      </div>
      <div className="bg-green-600 p-6 rounded-lg">
        <p className="text-3xl font-bold">{doctors.filter(d => d.isAvailable).length}</p>
        <p className="text-sm">Available Doctors</p>
      </div>
      <div className="bg-yellow-600 p-6 rounded-lg">
        <p className="text-3xl font-bold">{doctors.length}</p>
        <p className="text-sm">Total Doctors</p>
      </div>
      <div className="bg-purple-600 p-6 rounded-lg">
        <p className="text-3xl font-bold">
          ₹{Math.round(doctors.reduce((sum, d) => sum + d.consultingFee, 0) / doctors.length || 0)}
        </p>
        <p className="text-sm">Avg. Consultation Fee</p>
      </div>
    </div>
  );
}

function DoctorsView({
  doctors,
  onToggle,
  onAdd,
}: {
  doctors: Doctor[];
  onToggle: (id: string, avail: boolean) => void;
  onAdd: (userId: string, specialty: string, license: string) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [newDoc, setNewDoc] = useState({ userId: '', specialty: '', license: '' });

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-xl font-bold">👨‍⚕️ Doctors</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="px-3 py-1 bg-blue-600 rounded">
          {showAdd ? 'Cancel' : '+ Add Doctor'}
        </button>
      </div>

      {showAdd && (
        <div className="p-4 bg-gray-800 rounded-lg space-y-2">
          <input
            type="text"
            placeholder="User ID"
            value={newDoc.userId}
            onChange={(e) => setNewDoc({ ...newDoc, userId: e.target.value })}
            className="w-full p-2 bg-gray-700 rounded"
          />
          <input
            type="text"
            placeholder="Specialty"
            value={newDoc.specialty}
            onChange={(e) => setNewDoc({ ...newDoc, specialty: e.target.value })}
            className="w-full p-2 bg-gray-700 rounded"
          />
          <input
            type="text"
            placeholder="License Number"
            value={newDoc.license}
            onChange={(e) => setNewDoc({ ...newDoc, license: e.target.value })}
            className="w-full p-2 bg-gray-700 rounded"
          />
          <button
            onClick={() => {
              onAdd(newDoc.userId, newDoc.specialty, newDoc.license);
              setShowAdd(false);
              setNewDoc({ userId: '', specialty: '', license: '' });
            }}
            className="w-full py-2 bg-green-600 rounded"
          >
            Create Doctor
          </button>
        </div>
      )}

      <div className="space-y-2">
        {doctors.map((doc) => (
          <div key={doc.id} className="p-4 bg-gray-800 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold">{doc.user?.name || 'Doctor'}</p>
                <p className="text-sm text-gray-400">{doc.specialty}</p>
                <p className="text-xs text-gray-500">
                  {doc.experience} years exp. • {doc.education}
                </p>
                <p className="text-xs text-gray-500">License: {doc.license}</p>
              </div>
              <div className="text-right">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    doc.isAvailable ? 'bg-green-600' : 'bg-red-600'
                  }`}
                >
                  {doc.isAvailable ? 'Available' : 'Busy'}
                </span>
                <p className="text-sm font-bold mt-2">₹{doc.consultingFee}</p>
                <button
                  onClick={() => onToggle(doc.id, !doc.isAvailable)}
                  className="text-xs text-blue-400"
                >
                  Toggle
                </button>
              </div>
            </div>
            {doc.hospitalLinks && doc.hospitalLinks.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                🏥 {doc.hospitalLinks.map((h) => h.hospital.name).join(', ')}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function BedsView() {
  const [beds, setBeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/beds/manage')
      .then((res) => res.json())
      .then((json) => setBeds(json.beds || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading beds...</div>;

  const stats = {
    total: beds.length,
    available: beds.filter((b) => b.status === 'AVAILABLE').length,
    occupied: beds.filter((b) => b.status === 'OCCUPIED').length,
    maintenance: beds.filter((b) => b.status === 'MAINTENANCE').length,
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">🛏️ Bed Management</h2>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-600 p-4 rounded-lg">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs">Total</p>
        </div>
        <div className="bg-green-600 p-4 rounded-lg">
          <p className="text-2xl font-bold">{stats.available}</p>
          <p className="text-xs">Available</p>
        </div>
        <div className="bg-red-600 p-4 rounded-lg">
          <p className="text-2xl font-bold">{stats.occupied}</p>
          <p className="text-xs">Occupied</p>
        </div>
        <div className="bg-yellow-600 p-4 rounded-lg">
          <p className="text-2xl font-bold">{stats.maintenance}</p>
          <p className="text-xs">Maintenance</p>
        </div>
      </div>

      <div className="space-y-2">
        {beds.map((bed) => (
          <div key={bed.id} className="p-3 bg-gray-800 rounded-lg flex justify-between">
            <div>
              <p className="font-medium">
                {bed.hospital?.name} - {bed.bedNumber}
              </p>
              <p className="text-xs text-gray-500">
                {bed.bedType} • Floor {bed.floor} • Ward {bed.ward}
              </p>
            </div>
            <span
              className={`px-2 py-1 rounded text-xs ${
                bed.status === 'AVAILABLE'
                  ? 'bg-green-600'
                  : bed.status === 'OCCUPIED'
                  ? 'bg-red-600'
                  : 'bg-yellow-600'
              }`}
            >
              {bed.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlertsView() {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/emergency')
      .then((res) => res.json())
      .then((json) => setAlerts(json.alerts || []))
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">🚨 Emergency Alerts</h2>

      <div className="space-y-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg ${
              alert.status === 'TRIGGERED' ? 'bg-red-900' : 'bg-gray-800'
            }`}
          >
            <div className="flex justify-between">
              <div>
                <span className="px-2 py-1 bg-red-600 rounded text-xs">{alert.alertType}</span>
                <p className="mt-2">{alert.location}</p>
                {alert.description && (
                  <p className="text-sm text-gray-400">{alert.description}</p>
                )}
              </div>
              <span
                className={`px-2 py-1 rounded text-xs ${
                  alert.status === 'TRIGGERED'
                    ? 'bg-red-600 animate-pulse'
                    : 'bg-green-600'
                }`}
              >
                {alert.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}