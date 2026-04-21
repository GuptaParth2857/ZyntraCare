'use client';

import { useState, useRef, useEffect } from 'react';
import { FiMic, FiVolume2, FiUser, FiClock, FiPlay, FiPause, FiSettings, FiHeart, FiShield, FiMessageSquare } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface VoiceMessage {
  id: string;
  text: string;
  voice: 'daughter' | 'son' | 'wife';
  timestamp: string;
  duration: number;
}

const savedVoices = [
  { id: 'v1', name: 'Daughter (Priya)', relation: 'Daughter', voice: 'daughter', preview: true },
  { id: 'v2', name: 'Son (Rahul)', relation: 'Son', voice: 'son', preview: true },
  { id: 'v3', name: 'Wife (Sunita)', relation: 'Wife', voice: 'wife', preview: false },
];

const scheduledReminders = [
  { id: '1', time: '8:00 AM', message: 'Papa, aapki BP ki dawai lene ka time ho gaya hai', voice: 'daughter', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  { id: '2', time: '2:00 PM', message: 'Papa, lunch ke baad medicine zaroor lein', voice: 'daughter', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  { id: '3', time: '8:00 PM', message: 'Papa, aapni raat ki dawai lijiye', voice: 'son', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
];

const sampleMessages: VoiceMessage[] = [
  { id: '1', text: 'Papa, aap khaise ho? Aaj kal theek hain na?', voice: 'daughter', timestamp: '10:30 AM', duration: 5 },
  { id: '2', text: 'Beta, main theek hoon. Tum kaise ho?', voice: 'daughter', timestamp: '10:35 AM', duration: 4 },
  { id: '3', text: 'Main bhi theek hoon papa. Aapne medicine liya?', voice: 'daughter', timestamp: '10:36 AM', duration: 3 },
];

export default function DementiaVoicePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('daughter');
  const [messages, setMessages] = useState<VoiceMessage[]>(sampleMessages);
  const [customMessage, setCustomMessage] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);
  const [livePulse, setLivePulse] = useState(0);
  const [nextReminder, setNextReminder] = useState(30);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    const pulseInterval = setInterval(() => setLivePulse(prev => (prev + 1) % 100), 80);
    return () => clearInterval(pulseInterval);
  }, []);

  useEffect(() => {
    const reminderInterval = setInterval(() => {
      setNextReminder(prev => prev > 0 ? prev - 1 : 30);
    }, 1000);
    return () => clearInterval(reminderInterval);
  }, []);

  useEffect(() => {
    if (!isAITyping && messages.length > 0) {
      const autoReplyInterval = setInterval(() => {
        setIsAITyping(true);
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: 'Ji papa, humein yaad dilayiye humara health behtar ho raha hai',
            voice: 'daughter' as any,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            duration: 4
          }]);
          setIsAITyping(false);
        }, 2000);
      }, 45000);
      return () => clearInterval(autoReplyInterval);
    }
  }, [isAITyping, messages.length]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.log('Recording not available');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: 'New voice message recorded',
          voice: selectedVoice as any,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          duration: 3
        }]);
      }, 1000);
    }
  };

  const playMessage = (message: VoiceMessage) => {
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), message.duration * 1000);
  };

  const sendCustomMessage = () => {
    if (customMessage.trim()) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: customMessage,
        voice: selectedVoice as any,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: Math.ceil(customMessage.length / 15)
      }]);
      setCustomMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden font-inter text-white">
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-24">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/40 rounded-2xl mb-4">
            <FiHeart size={32} className="text-pink-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-2">
            Zyntra <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">Elder Voice</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            AI-powered cloned voice companion for dementia patients. They hear their loved one's voice, not a machine.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xl flex items-center gap-2">
                  <FiMessageSquare className="text-pink-400" /> Voice Chat
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Playing as:</span>
                  <select 
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="bg-white/10 border border-white/10 rounded-xl px-3 py-1 text-sm"
                  >
                    <option value="daughter">Daughter (Priya)</option>
                    <option value="son">Son (Rahul)</option>
                    <option value="wife">Wife (Sunita)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.voice === selectedVoice ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] p-4 rounded-2xl ${
                      msg.voice === selectedVoice 
                        ? 'bg-pink-500/20 border border-pink-500/30' 
                        : 'bg-white/10 border border-white/10'
                    }`}>
                      <p className="text-white mb-2">{msg.text}</p>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-gray-500">{msg.timestamp}</span>
                        <button 
                          onClick={() => playMessage(msg)}
                          className="flex items-center gap-1 text-xs text-pink-400 hover:text-pink-300"
                        >
                          <FiVolume2 size={12} /> Play
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isAITyping && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 border border-white/10 p-4 rounded-2xl">
                      <p className="text-gray-400 text-sm">AI is generating response...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Type a message for your loved one..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendCustomMessage()}
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-gray-500"
                />
                <button
                  onClick={sendCustomMessage}
                  className="px-6 bg-pink-500 hover:bg-pink-400 text-white rounded-2xl font-bold transition"
                >
                  Send
                </button>
              </div>

              <div className="mt-4 flex justify-center">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition ${
                    isRecording 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-pink-500 hover:bg-pink-400 text-white'
                  }`}
                >
                  <FiMic size={20} />
                  {isRecording ? 'Recording...' : 'Hold to Record'}
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 mb-6">
              <h3 className="font-bold text-lg mb-4">Cloned Voices</h3>
              <div className="space-y-3">
                {savedVoices.map((voice) => (
                  <div key={voice.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                        <FiUser className="text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{voice.name}</p>
                        <p className="text-xs text-gray-400">{voice.relation}</p>
                      </div>
                    </div>
                    {voice.preview && (
                      <button className="text-pink-400 hover:text-pink-300">
                        <FiPlay size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl font-bold text-sm transition">
                + Clone New Voice
              </button>
            </div>

            <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 mb-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <FiClock className="text-pink-400" /> Scheduled Reminders
              </h3>
              <div className="space-y-3">
                {scheduledReminders.map((reminder) => (
                  <div key={reminder.id} className="p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white">{reminder.time}</span>
                      <span className="text-xs text-gray-400">{reminder.days.join(', ')}</span>
                    </div>
                    <p className="text-sm text-gray-300">{reminder.message}</p>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 bg-pink-500 hover:bg-pink-400 text-white py-2 rounded-xl font-bold text-sm transition">
                + Add Reminder
              </button>
            </div>

            <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/30 rounded-[2rem] p-6">
              <div className="flex items-center gap-3 mb-3">
                <FiShield className="text-pink-400" size={24} />
                <h4 className="font-bold">Privacy Protected</h4>
              </div>
              <p className="text-sm text-gray-400">
                Voice cloning requires explicit consent. All data is encrypted and stored securely.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}