'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FiWifi, FiRadio, FiMapPin, FiAlertTriangle, FiPhone, FiMessageSquare,
  FiMic, FiMicOff, FiSend, FiSmartphone, FiActivity, FiZap, FiClock,
  FiCheckCircle, FiRefreshCw, FiShield, FiNavigation
} from 'react-icons/fi';

interface MeshNode {
  id: string;
  name: string;
  distance: number;
  signal: number;
  isRelay: boolean;
  lastSeen: string;
}

interface EmergencyMessage {
  id: string;
  from: string;
  message: string;
  type: 'SOS' | 'relay' | 'response' | 'info';
  timestamp: string;
  hops: number;
  reached: boolean;
}

interface FirstAidStep {
  step: number;
  instruction: string;
  duration: string;
  completed: boolean;
}

const FIRST_AID_SNAKEBITE: FirstAidStep[] = [
  { step: 1, instruction: 'Stay calm. Do not panic.', duration: '30 sec', completed: false },
  { step: 2, instruction: 'Immobilize the affected limb. Do not move it.', duration: 'Ongoing', completed: false },
  { step: 3, instruction: 'Remove jewelry/watches near bite area immediately.', duration: '1 min', completed: false },
  { step: 4, instruction: 'Keep limb below heart level.', duration: 'Ongoing', completed: false },
  { step: 5, instruction: 'Clean wound gently with water.', duration: '2 min', completed: false },
  { step: 6, instruction: 'DO NOT apply ice, tourniquet, or cut wound.', duration: 'N/A', completed: false },
  { step: 7, instruction: 'Mark bite time on skin with pen.', duration: '30 sec', completed: false },
  { step: 8, instruction: 'Get to hospital ASAP. Call 108 if available.', duration: 'Immediate', completed: false },
];

export default function OfflineMeshPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [nodes, setNodes] = useState<MeshNode[]>([]);
  const [messages, setMessages] = useState<EmergencyMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [firstAidSteps, setFirstAidSteps] = useState<FirstAidStep[]>(FIRST_AID_SNAKEBITE);
  const [newMessage, setNewMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [signalPulse, setSignalPulse] = useState(0);
  const [selectedEmergency, setSelectedEmergency] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const fetchMeshData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/mesh-network');
        const data = await res.json();
        setNodes(data.nodes || data || []);
        setMessages(data.messages || []);
      } catch (err) {
        setError('Failed to load mesh network');
        console.error('Error fetching mesh data:', err);
      }
      setLoading(false);
    };
    fetchMeshData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setSignalPulse(prev => (prev + 1) % 100), 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (emergencyMode) {
      const msgInterval = setInterval(async () => {
        try {
          const res = await fetch('/api/mesh-network/messages');
          const data = await res.json();
          if (data.messages) {
            setMessages(data.messages);
          }
        } catch (err) {
          console.error('Failed to fetch messages:', err);
        }
      }, 3000);
      return () => clearInterval(msgInterval);
    }
  }, [emergencyMode]);

  useEffect(() => {
    if (isConnected) {
      const nodeInterval = setInterval(async () => {
        try {
          const res = await fetch('/api/mesh-network');
          const data = await res.json();
          if (data.nodes) {
            setNodes(data.nodes);
          }
        } catch (err) {
          console.error('Failed to fetch nodes:', err);
        }
      }, 2000);
      return () => clearInterval(nodeInterval);
    }
  }, [isConnected]);

  const connectToMesh = async () => {
    setIsConnected(true);
    try {
      const res = await fetch('/api/mesh-network', { method: 'POST' });
      const data = await res.json();
      if (data.nodes) setNodes(data.nodes);
    } catch (err) {
      console.error('Failed to connect to mesh:', err);
    }
  };

  const disconnectFromMesh = () => {
    setIsConnected(false);
    setEmergencyMode(false);
  };

  const sendSOS = async () => {
    setEmergencyMode(true);
    setIsBroadcasting(true);
    try {
      const res = await fetch('/api/mesh-network/sos', { method: 'POST' });
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
    } catch (err) {
      console.error('Failed to send SOS:', err);
    }
    setIsBroadcasting(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await fetch('/api/mesh-network/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage }),
      });
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
    setNewMessage('');
  };

  const completeStep = (step: number) => {
    setFirstAidSteps(prev => prev.map(s => 
      s.step === step ? { ...s, completed: true } : s
    ));
  };

  const getSignalBars = (signal: number) => {
    if (signal >= 80) return 4;
    if (signal >= 60) return 3;
    if (signal >= 40) return 2;
    return 1;
  };

  return (
    <div className="min-h-screen bg-transparent text-white p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              isConnected 
                ? 'bg-gradient-to-br from-cyan-500 to-blue-500 animate-pulse' 
                : 'bg-gradient-to-br from-slate-500 to-slate-600'
            }`}>
              <FiRadio className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Offline Mesh Network
              </h1>
              <p className="text-slate-400 text-sm">Works when the Internet dies. Smartphones become medical walkie-talkies.</p>
            </div>
          </div>
          <button
            onClick={isConnected ? disconnectFromMesh : connectToMesh}
            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 ${
              isConnected 
                ? 'bg-red-500/20 text-red-400 border border-red-500/50' 
                : 'bg-cyan-500 text-white hover:bg-cyan-600'
            }`}
          >
            <FiWifi className={isConnected ? 'text-red-400 animate-pulse' : ''} />
            {isConnected ? 'Disconnect' : 'Connect to Mesh'}
          </button>
        </div>
      </motion.div>

      {!isConnected ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl mx-auto mt-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center"
        >
          {loading ? (
            <>
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
              <p className="text-slate-400">Loading mesh network...</p>
            </>
          ) : error ? (
            <>
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mx-auto mb-6">
                <FiAlertTriangle className="text-4xl text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Connection Error</h2>
              <p className="text-slate-400 mb-6">{error}</p>
              <button onClick={() => window.location.reload()} className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg">
                Retry
              </button>
            </>
          ) : (
          <>
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-6">
            <FiRadio className="text-4xl text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Join the Mesh Network</h2>
          <p className="text-slate-400 mb-6">Connect to nearby devices using Bluetooth/WiFi Direct. Create a resilient medical communication network.</p>
          <button
            onClick={connectToMesh}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg hover:opacity-90 transition-opacity"
          >
            Start Mesh Connection
          </button>
          </>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <FiSmartphone className="text-cyan-400" />
                  Connected Nodes ({nodes.length})
                </h2>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-green-400">Mesh Active</span>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-4">
                  {nodes.map((node, idx) => (
                    <motion.div
                      key={node.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-lg font-bold">
                          {node.name.charAt(0)}
                        </div>
                        {node.isRelay && (
                          <span className="px-2 py-0.5 rounded text-xs bg-cyan-500/20 text-cyan-400">
                            <FiZap size={10} /> Relay
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{node.name}</h3>
                      <p className="text-xs text-slate-400 mb-2">{node.distance}m away</p>
                      <div className="flex items-center gap-1">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 h-3 rounded ${
                              i < getSignalBars(node.signal)
                                ? 'bg-green-500'
                                : 'bg-white/20'
                            }`}
                          />
                        ))}
                        <span className="text-xs ml-1">{node.signal}%</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {emergencyMode ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-2xl overflow-hidden"
              >
                <div className="p-4 border-b border-red-500/30 flex items-center justify-between">
                  <h2 className="text-lg font-bold flex items-center gap-2 text-red-400">
                    <FiAlertTriangle className="animate-pulse" />
                    EMERGENCY MODE ACTIVE
                  </h2>
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <h3 className="font-bold mb-2">First Aid Instructions</h3>
                    <div className="space-y-2">
                      {firstAidSteps.map((step) => (
                        <motion.div
                          key={step.step}
                          whileHover={{ scale: step.completed ? 1 : 1.02 }}
                          onClick={() => !step.completed && completeStep(step.step)}
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                            step.completed 
                              ? 'bg-green-500/20 border border-green-500/30' 
                              : 'bg-white/5 border border-white/10 hover:border-red-500/50'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            step.completed ? 'bg-green-500 text-white' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {step.completed ? <FiCheckCircle /> : step.step}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm ${step.completed ? 'text-slate-400 line-through' : ''}`}>
                              {step.instruction}
                            </p>
                            <p className="text-xs text-slate-500">{step.duration}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
              >
                <div className="p-4 border-b border-white/10">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <FiAlertTriangle className="text-red-400" />
                    Emergency Broadcast
                  </h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={sendSOS}
                      className="p-6 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-lg animate-pulse"
                    >
                      🚨 SEND SOS
                    </button>
                    <button className="p-6 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-400 font-bold">
                      🩹 FIRST AID
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <FiMessageSquare className="text-blue-400" />
                  Mesh Messages
                </h2>
              </div>
              <div className="p-4 max-h-64 overflow-y-auto space-y-2">
                {messages.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">No messages yet. Send an SOS to start.</p>
                ) : (
                  messages.map((msg, idx) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`p-3 rounded-xl ${
                        msg.type === 'SOS' ? 'bg-red-500/20 border border-red-500/30' :
                        msg.type === 'relay' ? 'bg-blue-500/20 border border-blue-500/30' :
                        msg.type === 'response' ? 'bg-green-500/20 border border-green-500/30' :
                        'bg-white/5 border border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={`font-bold ${
                          msg.type === 'SOS' ? 'text-red-400' :
                          msg.type === 'relay' ? 'text-blue-400' :
                          msg.type === 'response' ? 'text-green-400' :
                          'text-slate-400'
                        }`}>{msg.from}</span>
                        <span className="text-slate-500">{msg.timestamp} • {msg.hops} hops</span>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                      {msg.reached && (
                        <span className="flex items-center gap-1 text-xs text-green-400 mt-1">
                          <FiCheckCircle /> Reached destination
                        </span>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-white/10 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-cyan-500"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600"
                >
                  <FiSend />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <FiActivity className="text-cyan-400 animate-pulse" />
                Network Status
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Nodes</span>
                  <span className="font-bold text-cyan-400">{nodes.filter(n => n.signal > 30).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Relay Stations</span>
                  <span className="font-bold text-green-400">{nodes.filter(n => n.isRelay).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Hops</span>
                  <span className="font-bold">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Signal</span>
                  <span className="font-bold">{Math.round(nodes.reduce((a, b) => a + b.signal, 0) / nodes.length)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-2xl p-4">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <FiShield className="text-cyan-400" />
                How Mesh Works
              </h3>
              <p className="text-sm text-slate-300 space-y-2">
                <p>1. Your phone connects to nearby devices via Bluetooth</p>
                <p>2. SOS message hops from phone to phone</p>
                <p>3. Relay nodes amplify and forward the signal</p>
                <p>4. Message reaches someone with internet</p>
                <p>5. Help coordinates back through the mesh</p>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}