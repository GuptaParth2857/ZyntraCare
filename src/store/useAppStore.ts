import { create } from 'zustand';

export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  beds: { total: number; available: number; icu: number; icuAvailable: number };
  emergency: boolean;
  lat: number;
  lng: number;
  rating: number;
}

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface IoTData {
  heartRate: number;
  bloodPressure: { systolic: number; diastolic: number };
  bloodSugar: number;
  oxygenLevel: number;
  temperature: number;
  timestamp: number;
}

export interface RealtimeBedUpdate {
  hospitalId: string;
  beds: { total: number; available: number; icu: number; icuAvailable: number };
  timestamp: number;
}

export interface BlockchainRecord {
  id: string;
  type: string;
  dataHash: string;
  previousHash: string;
  timestamp: number;
  data: string;
}

interface AppState {
  // User location
  userLocation: UserLocation | null;
  setUserLocation: (location: UserLocation | null) => void;

  // Selected hospital
  selectedHospital: Hospital | null;
  setSelectedHospital: (hospital: Hospital | null) => void;

  // IoT Wearable Data
  iotData: IoTData | null;
  setIotData: (data: IoTData | null) => void;
  isSimulatingIoT: boolean;
  setIsSimulatingIoT: (simulating: boolean) => void;

  // Real-time bed updates
  bedUpdates: Map<string, RealtimeBedUpdate>;
  updateBedAvailability: (update: RealtimeBedUpdate) => void;

  // Blockchain records
  blockchainRecords: BlockchainRecord[];
  addBlockchainRecord: (record: BlockchainRecord) => void;

  // Emergency mode
  emergencyMode: boolean;
  setEmergencyMode: (active: boolean) => void;

  // Notifications
  notifications: { id: string; message: string; type: string }[];
  addNotification: (notification: { id: string; message: string; type: string }) => void;
  clearNotification: (id: string) => void;

  // AI Chat history
  chatHistory: { role: 'user' | 'assistant'; content: string }[];
  addChatMessage: (message: { role: 'user' | 'assistant'; content: string }) => void;
  clearChat: () => void;

  // Theme
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // User location
  userLocation: null,
  setUserLocation: (location) => set({ userLocation: location }),

  // Selected hospital
  selectedHospital: null,
  setSelectedHospital: (hospital) => set({ selectedHospital: hospital }),

  // IoT Wearable Data
  iotData: null,
  setIotData: (data) => set({ iotData: data }),
  isSimulatingIoT: false,
  setIsSimulatingIoT: (simulating) => set({ isSimulatingIoT: simulating }),

  // Real-time bed updates
  bedUpdates: new Map(),
  updateBedAvailability: (update) => {
    const updates = new Map(get().bedUpdates);
    updates.set(update.hospitalId, update);
    set({ bedUpdates: updates });
  },

  // Blockchain records
  blockchainRecords: [],
  addBlockchainRecord: (record) => set((state) => ({
    blockchainRecords: [...state.blockchainRecords, record]
  })),

  // Emergency mode
  emergencyMode: false,
  setEmergencyMode: (active) => set({ emergencyMode: active }),

  // Notifications
  notifications: [],
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, notification]
  })),
  clearNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),

  // AI Chat history
  chatHistory: [],
  addChatMessage: (message) => set((state) => ({
    chatHistory: [...state.chatHistory, message].slice(-50)
  })),
  clearChat: () => set({ chatHistory: [] }),

  // Theme
  darkMode: true,
  setDarkMode: (dark) => set({ darkMode: dark })
}));