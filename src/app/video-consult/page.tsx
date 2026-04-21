'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiVideo, FiMic, FiMicOff, FiVideoOff, FiPhone, FiMessageCircle, FiPaperclip, FiSend, FiMaximize, FiMinimize, FiSettings, FiUsers, FiClock } from 'react-icons/fi';

export default function VideoConsultPage() {
  const [inCall, setInCall] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);
  const [chat, setChat] = useState<{sender: string; text: string; time: string}[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (inCall) {
      const interval = setInterval(() => setCallDuration(d => d + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [inCall]);

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

  const joinCall = () => {
    setInCall(true);
    setCallDuration(0);
    navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => console.log('Camera permission denied'));
  };

  const leaveCall = () => {
    setInCall(false);
    setCallDuration(0);
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      setChat([...chat, { sender: 'You', text: newMessage, time: new Date().toLocaleTimeString() }]);
      setNewMessage('');
      setTimeout(() => {
        setChat(prev => [...prev, { sender: 'Dr. Sharma', text: 'Let me check that for you.', time: new Date().toLocaleTimeString() }]);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {!inCall ? (
        <div className="max-w-4xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FiVideo className="text-white text-4xl" />
            </div>
            <h1 className="text-3xl font-black">Video Consultation</h1>
            <p className="text-gray-400 mt-2">Connect with doctors via secure HD video call</p>

            <div className="mt-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl" />
                <div className="text-left">
                  <h3 className="font-bold text-lg">Dr. Priya Sharma</h3>
                  <p className="text-sm text-emerald-400">Cardiologist • 15 years exp.</p>
                  <p className="text-xs text-gray-400">Available now</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-gray-400">Wait time</p>
                  <p className="font-bold">~2 min</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-gray-400">Fee</p>
                  <p className="font-bold">₹500</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-gray-400">Rating</p>
                  <p className="font-bold text-amber-400">★ 4.9</p>
                </div>
              </div>

              <button
                onClick={joinCall}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <FiVideo /> Join Video Call
              </button>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-xl p-4">
                <FiVideo className="text-2xl text-blue-400 mb-2" />
                <p className="font-medium">HD Video</p>
                <p className="text-xs text-gray-400">Crystal clear</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <FiMessageCircle className="text-2xl text-purple-400 mb-2" />
                <p className="font-medium">In-call Chat</p>
                <p className="text-xs text-gray-400">Share reports</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <FiUsers className="text-2xl text-pink-400 mb-2" />
                <p className="font-medium">Family Join</p>
                <p className="text-xs text-gray-400">Multiple viewers</p>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="h-screen flex flex-col">
          {/* Video Area */}
          <div className="flex-1 relative bg-black">
            {/* Remote Video (Doctor) */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-5xl">👩‍⚕️</span>
                </div>
                <p className="text-xl font-bold">Dr. Priya Sharma</p>
                <p className="text-sm text-emerald-400">Connected</p>
              </div>
            </div>

            {/* Local Video (You) */}
            <div className="absolute bottom-24 right-4 w-48 h-36 bg-slate-800 rounded-xl overflow-hidden border-2 border-white/20">
              {videoOn ? (
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FiVideoOff className="text-3xl text-gray-500" />
                </div>
              )}
            </div>

            {/* Call Duration */}
            <div className="absolute top-4 left-4 bg-red-500 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              {formatTime(callDuration)}
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/80 backdrop-blur-xl rounded-full px-6 py-3">
              <button
                onClick={() => setAudioOn(!audioOn)}
                className={`w-12 h-12 rounded-full flex items-center justify-center ${audioOn ? 'bg-white/10' : 'bg-red-500'}`}
              >
                {audioOn ? <FiMic /> : <FiMicOff />}
              </button>
              <button
                onClick={() => setVideoOn(!videoOn)}
                className={`w-12 h-12 rounded-full flex items-center justify-center ${videoOn ? 'bg-white/10' : 'bg-red-500'}`}
              >
                {videoOn ? <FiVideo /> : <FiVideoOff />}
              </button>
              <button
                onClick={toggleFullscreen}
                className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center"
              >
                {isFullscreen ? <FiMinimize /> : <FiMaximize />}
              </button>
              <button
                onClick={leaveCall}
                className="w-14 h-12 bg-red-500 rounded-full flex items-center justify-center"
              >
                <FiPhone className="rotate-[135deg]" />
              </button>
            </div>
          </div>

          {/* Chat Panel */}
          <div className="h-64 bg-slate-900 border-t border-white/10 p-4">
            <div className="h-48 overflow-y-auto space-y-2 mb-2">
              {chat.length === 0 ? (
                <p className="text-center text-gray-500 text-sm">No messages yet</p>
              ) : (
                chat.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-2 rounded-xl text-sm ${
                      msg.sender === 'You' ? 'bg-blue-500' : 'bg-white/10'
                    }`}>
                      <p>{msg.text}</p>
                      <p className="text-xs opacity-50">{msg.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <button className="p-3 bg-white/10 rounded-xl">
                <FiPaperclip />
              </button>
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-white/10 rounded-xl px-4"
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={sendMessage} className="p-3 bg-blue-500 rounded-xl">
                <FiSend />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}