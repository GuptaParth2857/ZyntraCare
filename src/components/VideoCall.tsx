'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhone,
  FiVolume2, FiMessageSquare, FiX, FiRefreshCw,
  FiLoader, FiWifi, FiPhoneOff, FiMaximize2, FiMinimize2,
} from 'react-icons/fi';
import { cn } from '@/lib/utils';
import { WebRTCManager, isWebRTCSupported } from '@/lib/webrtc';

interface VideoCallProps {
  roomId?: string;
  doctorName?: string;
  onEnd?: () => void;
}

type CallState = 'idle' | 'calling' | 'connecting' | 'connected' | 'failed' | 'ended';

type ConnectionQuality = 'good' | 'fair' | 'poor';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const qualityColors: Record<ConnectionQuality, string> = {
  good: 'bg-emerald-500',
  fair: 'bg-amber-500',
  poor: 'bg-red-500',
};

const qualityLabels: Record<ConnectionQuality, string> = {
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
};

export default function VideoCall({ roomId, doctorName = 'Doctor', onEnd }: VideoCallProps) {
  const [callState, setCallState] = useState<CallState>('idle');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [duration, setDuration] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>('good');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const webrtcRef = useRef<WebRTCManager | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const supported = isWebRTCSupported();

  const cleanup = useCallback((): void => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (webrtcRef.current) {
      webrtcRef.current.disconnect();
      webrtcRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const startCall = useCallback(async () => {
    if (!supported) {
      setError('WebRTC is not supported in this browser');
      setCallState('failed');
      return;
    }

    const manager = new WebRTCManager();
    webrtcRef.current = manager;

    manager.onError((err: Error) => {
      setError(err.message);
      setCallState('failed');
    });

    manager.onConnectionStateChange((state: string) => {
      if (state === 'connected' || state === 'completed') {
        setCallState('connected');
        durationIntervalRef.current = setInterval(() => {
          setDuration(prev => prev + 1);
        }, 1000);
      } else if (state === 'disconnected') {
        setCallState('ended');
      } else if (state === 'failed') {
        setCallState('failed');
      }
    });

    manager.onRemoteStream((stream: MediaStream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    });

    try {
      await manager.startLocalStream(true, true);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = manager.localStream;
      }
      setCallState('calling');
      await manager.createOffer();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start call');
      setCallState('failed');
    }
  }, [supported]);

  const endCall = useCallback(() => {
    cleanup();
    setCallState('ended');
    onEnd?.();
  }, [cleanup, onEnd]);

  const toggleAudio = useCallback(() => {
    if (webrtcRef.current) {
      const state = webrtcRef.current.toggleAudio();
      setAudioEnabled(state);
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (webrtcRef.current) {
      const state = webrtcRef.current.toggleVideo();
      setVideoEnabled(state);
    }
  }, []);

  const toggleSpeaker = useCallback(() => {
    setSpeakerEnabled(prev => !prev);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!webrtcRef.current?.peerConnection) return;
    const pc = webrtcRef.current.peerConnection;
    const checkQuality = () => {
      const state = pc.iceConnectionState;
      if (state === 'connected') setConnectionQuality('good');
      else if (state === 'checking') setConnectionQuality('fair');
      else if (state === 'disconnected' || state === 'failed') setConnectionQuality('poor');
    };
    pc.addEventListener('iceconnectionstatechange', checkQuality);
    return () => pc.removeEventListener('iceconnectionstatechange', checkQuality);
  }, [callState]);

  const buttonClass = 'p-4 rounded-full transition-all duration-200 flex items-center justify-center';

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        'relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden',
        'bg-slate-900 border border-white/10 shadow-2xl',
        isFullscreen ? 'rounded-none max-w-full h-screen' : 'aspect-video'
      )}
    >
      <AnimatePresence mode="wait">
        {callState === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8"
          >
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center">
              <FiVideo className="w-12 h-12 text-blue-400" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-1">Video Consultation</h2>
              <p className="text-slate-400 text-sm">with {doctorName}</p>
            </div>
            {!supported && (
              <p className="text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
                WebRTC is not supported in this browser
              </p>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startCall}
              disabled={!supported}
              className={cn(
                'px-8 py-3 rounded-xl font-bold text-base',
                'bg-gradient-to-r from-emerald-500 to-emerald-600',
                'hover:from-emerald-400 hover:to-emerald-500',
                'text-white shadow-lg shadow-emerald-500/30',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center gap-2'
              )}
            >
              <FiPhone className="w-5 h-5" />
              Start Call
            </motion.button>
          </motion.div>
        )}

        {callState === 'calling' && (
          <motion.div
            key="calling"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <FiLoader className="w-10 h-10 text-white animate-spin" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-blue-400"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-purple-400"
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-white">Calling {doctorName}...</h2>
              <p className="text-slate-400 text-sm mt-1">Please wait while we connect you</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={endCall}
              className={cn(
                buttonClass,
                'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'
              )}
            >
              <FiPhoneOff className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}

        {callState === 'connecting' && (
          <motion.div
            key="connecting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8"
          >
            <FiLoader className="w-10 h-10 text-blue-400 animate-spin" />
            <h2 className="text-xl font-bold text-white">Connecting...</h2>
            <div className="w-48 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        )}

        {callState === 'connected' && (
          <motion.div
            key="connected"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />

            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <div className={cn('w-2.5 h-2.5 rounded-full', qualityColors[connectionQuality])} />
              <span className="text-xs font-medium text-white">{qualityLabels[connectionQuality]}</span>
            </div>

            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <span className="text-sm font-mono font-bold text-white">
                {formatDuration(duration)}
              </span>
            </div>

            <motion.div
              drag
              dragMomentum={false}
              className="absolute bottom-24 right-4 w-32 h-44 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg cursor-grab active:cursor-grabbing z-10"
            >
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {!videoEnabled && (
                <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                  <FiVideoOff className="w-6 h-6 text-slate-400" />
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
            >
              <div className="flex items-center justify-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleAudio}
                  className={cn(
                    buttonClass,
                    audioEnabled
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                  )}
                >
                  {audioEnabled ? <FiMic className="w-5 h-5" /> : <FiMicOff className="w-5 h-5" />}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleVideo}
                  className={cn(
                    buttonClass,
                    videoEnabled
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                  )}
                >
                  {videoEnabled ? <FiVideo className="w-5 h-5" /> : <FiVideoOff className="w-5 h-5" />}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={endCall}
                  className={cn(
                    buttonClass,
                    'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 w-16 h-16'
                  )}
                >
                  <FiPhone className="w-6 h-6" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleSpeaker}
                  className={cn(
                    buttonClass,
                    speakerEnabled
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-white/5 text-slate-500'
                  )}
                >
                  <FiVolume2 className="w-5 h-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={cn(buttonClass, 'bg-white/10 hover:bg-white/20 text-white')}
                >
                  <FiMessageSquare className="w-5 h-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleFullscreen}
                  className={cn(buttonClass, 'bg-white/10 hover:bg-white/20 text-white')}
                >
                  {isFullscreen ? <FiMinimize2 className="w-5 h-5" /> : <FiMaximize2 className="w-5 h-5" />}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {callState === 'failed' && (
          <motion.div
            key="failed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8"
          >
            <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <FiX className="w-8 h-8 text-red-400" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-1">Connection Failed</h2>
              <p className="text-slate-400 text-sm max-w-xs">
                {error || 'Unable to establish video connection. Please try again.'}
              </p>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startCall}
                className={cn(
                  'px-6 py-3 rounded-xl font-bold text-sm',
                  'bg-gradient-to-r from-blue-500 to-purple-600',
                  'hover:from-blue-400 hover:to-purple-500',
                  'text-white shadow-lg shadow-blue-500/30',
                  'flex items-center gap-2'
                )}
              >
                <FiRefreshCw className="w-4 h-4" />
                Try Again
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { cleanup(); setCallState('idle'); setError(null); }}
                className={cn(
                  'px-6 py-3 rounded-xl font-bold text-sm',
                  'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                )}
              >
                Go Back
              </motion.button>
            </div>
          </motion.div>
        )}

        {callState === 'ended' && (
          <motion.div
            key="ended"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center">
              <FiPhoneOff className="w-8 h-8 text-blue-400" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-1">Call Ended</h2>
              <p className="text-slate-400">with {doctorName}</p>
              {duration > 0 && (
                <p className="text-blue-400 font-mono text-lg font-bold mt-2">
                  Duration: {formatDuration(duration)}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setDuration(0); setCallState('idle'); setError(null); }}
                className={cn(
                  'px-6 py-3 rounded-xl font-bold text-sm',
                  'bg-gradient-to-r from-blue-500 to-purple-600',
                  'hover:from-blue-400 hover:to-purple-500',
                  'text-white shadow-lg shadow-blue-500/30',
                  'flex items-center gap-2'
                )}
              >
                <FiPhone className="w-4 h-4" />
                Call Again
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEnd}
                className={cn(
                  'px-6 py-3 rounded-xl font-bold text-sm',
                  'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                )}
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {callState === 'idle' && (
        <div className="absolute inset-0 -z-10">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-900/80" />
        </div>
      )}
    </motion.div>
  );
}
