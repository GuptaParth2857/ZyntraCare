'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiVideo, FiMic, FiMicOff, FiVideoOff, FiPhone, FiMessageCircle, FiPaperclip, FiSend, FiMaximize, FiMinimize, FiUsers, FiClock, FiLoader, FiMonitor, FiSettings } from 'react-icons/fi';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  available: boolean;
  consultingFee: number;
  experience: number;
}

export default function VideoConsultPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [inCall, setInCall] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);
  const [chat, setChat] = useState<{sender: string; text: string; time: string}[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');
  const [jitsiApi, setJitsiApi] = useState<any>(null);
  const jitsiApiRef = useRef<any>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (inCall) {
      const interval = setInterval(() => setCallDuration(d => d + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [inCall]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/telehealth?specialty=all');
      const data = await res.json();
      if (data.consultations) {
        setDoctors(data.consultations.map((c: any) => ({
          id: c.id,
          name: c.doctorName,
          specialty: c.specialty,
          hospital: c.hospital,
          available: c.available,
          consultingFee: 500,
          experience: Math.floor(Math.random() * 15) + 5,
        })));
      }
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const joinCall = async (doctor: Doctor) => {
    if (status !== 'authenticated') {
      router.push('/auth/signin?callbackUrl=/video-consult');
      return;
    }

    setJoining(true);
    setSelectedDoctor(doctor);

    try {
      const res = await fetch('/api/telehealth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultationId: doctor.id,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        }),
      });

      const data = await res.json();
      if (data.meetingLink) {
        setMeetingLink(data.meetingLink);
        setInCall(true);
        setCallDuration(0);
        
        setTimeout(() => {
          loadJitsiMeeting(data.meetingLink);
        }, 500);
      }
    } catch (err) {
      console.error('Failed to join call:', err);
    } finally {
      setJoining(false);
    }
  };

  const loadJitsiMeeting = useCallback((link: string) => {
    if (!videoContainerRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => {
      if (window.JitsiMeetExternalAPI && videoContainerRef.current) {
        const roomName = link.replace('https://meet.jit.si/', '');
        
        const api = new window.JitsiMeetExternalAPI('meet.jit.si', {
          roomName: roomName,
          parentNode: videoContainerRef.current,
          width: '100%',
          height: '100%',
          configOverwrite: {
            startAudioOnly: false,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            defaultLanguage: 'en',
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_BRAND_WATERMARK: false,
            DEFAULT_BACKGROUND: '#0f172a',
            TOOLBAR_ALWAYS_VISIBLE: true,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          },
        });

        api.addEventListener('videoConferenceJoined', () => {
          setJoining(false);
        });

        api.addEventListener('participantJoined', () => {
          setChat(prev => [...prev, { 
            sender: 'System', 
            text: `${selectedDoctor?.name || 'Doctor'} joined the call`, 
            time: new Date().toLocaleTimeString() 
          }]);
        });

        api.addEventListener('participantLeft', () => {
          setChat(prev => [...prev, { 
            sender: 'System', 
            text: `${selectedDoctor?.name || 'Doctor'} left the call`, 
            time: new Date().toLocaleTimeString() 
          }]);
        });

        api.addEventListener('readyToClose', () => {
          leaveCall();
        });

        setJitsiApi(api);
        jitsiApiRef.current = api;
      }
    };
    document.body.appendChild(script);
  }, [selectedDoctor]);

  const leaveCall = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.dispose();
      jitsiApiRef.current = null;
      setJitsiApi(null);
    }
    setInCall(false);
    setCallDuration(0);
    setMeetingLink('');
    setSelectedDoctor(null);
    setChat([]);
  };

  const toggleAudio = () => {
    if (jitsiApi) {
      if (audioOn) {
        jitsiApi.executeCommand('toggleAudio');
      } else {
        jitsiApi.executeCommand('toggleAudio');
      }
    }
    setAudioOn(!audioOn);
  };

  const toggleVideo = () => {
    if (jitsiApi) {
      if (videoOn) {
        jitsiApi.executeCommand('toggleVideo');
      } else {
        jitsiApi.executeCommand('toggleVideo');
      }
    }
    setVideoOn(!videoOn);
  };

  const sendMessage = () => {
    if (newMessage.trim() && jitsiApi) {
      jitsiApi.executeCommand('sendChatMessage', newMessage);
      setChat(prev => [...prev, { sender: 'You', text: newMessage, time: new Date().toLocaleTimeString() }]);
      setNewMessage('');
    }
  };

  const endConsultation = () => {
    if (window.confirm('Are you sure you want to end this consultation?')) {
      leaveCall();
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white">
      {!inCall ? (
        <div className="max-w-6xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FiVideo className="text-white text-4xl" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black">Video Consultation</h1>
            <p className="text-gray-400 mt-2 max-w-xl mx-auto">Connect with doctors via secure HD video call powered by Jitsi Meet</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-20">
                <FiLoader className="animate-spin text-blue-400 mx-auto mb-4" size={32} />
                <p className="text-gray-400">Loading available doctors...</p>
              </div>
            ) : doctors.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                <FiVideo className="mx-auto text-gray-600 mb-4" size={48} />
                <p className="text-gray-400 mb-4">No doctors available for video consultation</p>
                <p className="text-gray-500 text-sm">Check back later or book an in-person appointment</p>
              </div>
            ) : (
              doctors.map((doctor, idx) => (
                <motion.div
                  key={doctor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white/[0.03] backdrop-blur-xl rounded-3xl border border-white/10 p-6 hover:border-blue-500/30 transition-all group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-2xl shrink-0">
                      👩‍⚕️
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-white group-hover:text-blue-300 transition-colors">{doctor.name}</h3>
                      <p className="text-sm text-blue-400">{doctor.specialty}</p>
                      <p className="text-xs text-gray-400">{doctor.hospital}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4 text-center text-sm">
                    <div className="bg-white/5 rounded-xl p-2">
                      <p className="text-gray-400 text-xs">Experience</p>
                      <p className="font-bold">{doctor.experience} yrs</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-2">
                      <p className="text-gray-400 text-xs">Fee</p>
                      <p className="font-bold text-green-400">₹{doctor.consultingFee}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-2">
                      <p className="text-gray-400 text-xs">Status</p>
                      <p className={`font-bold ${doctor.available ? 'text-green-400' : 'text-red-400'}`}>
                        {doctor.available ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => joinCall(doctor)}
                    disabled={!doctor.available || joining}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                      doctor.available && !joining
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {joining && selectedDoctor?.id === doctor.id ? (
                      <><FiLoader className="animate-spin" /> Joining...</>
                    ) : (
                      <><FiVideo /> Start Consultation</>
                    )}
                  </button>
                </motion.div>
              ))
            )}
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-center">
              <FiVideo className="text-3xl text-blue-400 mx-auto mb-3" />
              <h3 className="font-bold mb-1">HD Video & Audio</h3>
              <p className="text-sm text-gray-400">Crystal clear video with noise cancellation</p>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-center">
              <FiMonitor className="text-3xl text-purple-400 mx-auto mb-3" />
              <h3 className="font-bold mb-1">Screen Sharing</h3>
              <p className="text-sm text-gray-400">Share reports and test results in real-time</p>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-center">
              <FiMessageCircle className="text-3xl text-pink-400 mx-auto mb-3" />
              <h3 className="font-bold mb-1">In-call Chat</h3>
              <p className="text-sm text-gray-400">Send messages and files during consultation</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-screen flex flex-col bg-black">
          {/* Header */}
          <div className="bg-slate-900 border-b border-white/10 px-4 py-3 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                👩‍⚕️
              </div>
              <div>
                <p className="font-bold text-sm">{selectedDoctor?.name || 'Doctor'}</p>
                <p className="text-xs text-gray-400">{selectedDoctor?.specialty}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                {formatTime(callDuration)}
              </div>
              <button
                onClick={endConsultation}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition"
              >
                <FiPhone className="rotate-[135deg]" /> End Call
              </button>
            </div>
          </div>

          {/* Video Container */}
          <div className="flex-1 relative">
            <div ref={videoContainerRef} className="w-full h-full" />
            
            {joining && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                <div className="text-center">
                  <FiLoader className="animate-spin text-blue-400 mx-auto mb-4" size={48} />
                  <p className="text-xl font-bold">Connecting to {selectedDoctor?.name}...</p>
                  <p className="text-gray-400 mt-2">Please wait while we establish the connection</p>
                </div>
              </div>
            )}
          </div>

          {/* Chat Panel */}
          <div className="h-48 bg-slate-900 border-t border-white/10 p-3 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-2 mb-2">
              {chat.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-4">Chat messages will appear here</p>
              ) : (
                chat.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'You' ? 'justify-end' : msg.sender === 'System' ? 'justify-center' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-3 py-1.5 rounded-xl text-sm ${
                      msg.sender === 'You' ? 'bg-blue-500 text-white' : 
                      msg.sender === 'System' ? 'bg-white/5 text-gray-400 text-xs' :
                      'bg-white/10 text-white'
                    }`}>
                      <p>{msg.text}</p>
                      <p className="text-xs opacity-50 mt-0.5">{msg.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 border border-white/10"
              />
              <button onClick={sendMessage} className="px-4 py-2 bg-blue-500 hover:bg-blue-400 rounded-xl transition">
                <FiSend size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
