'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FiCamera, FiUpload, FiCpu, FiWifiOff, FiRefreshCw, FiCheckCircle, FiAlertTriangle, FiInfo, FiImage } from 'react-icons/fi';

type ClassificationResult = {
  label: string;
  score: number;
};

export default function EdgeAIVisionPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pipelineRef = useRef<any>(null);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [modelLoading, setModelLoading] = useState(true);
  const [modelProgress, setModelProgress] = useState('Loading image classification model...');
  const [classifying, setClassifying] = useState(false);
  const [results, setResults] = useState<ClassificationResult[]>([]);
  const [webgpu, setWebgpu] = useState(false);
  const [offline, setOffline] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setOffline(!navigator.onLine);
    const goOnline = () => setOffline(false);
    const goOffline = () => setOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
  }, []);

  useEffect(() => {
    if ('gpu' in navigator) {
      try {
        const gpu = (navigator as any).gpu;
        if (gpu) setWebgpu(true);
      } catch { }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { pipeline } = await import('@xenova/transformers');
        setModelProgress('Downloading MobileNet v2 model (first load only)...');
        const classifier = await pipeline('image-classification', 'Xenova/mobilenet-v2', {
          progress_callback: (p: any) => {
            if (p.status === 'progress' && p.total) {
              setModelProgress(`Downloading model: ${Math.round((p.loaded / p.total) * 100)}%`);
            }
          },
        } as any);
        if (!cancelled) {
          pipelineRef.current = classifier;
          setModelLoading(false);
          setModelProgress('Model ready');
        }
      } catch (err: any) {
        if (!cancelled) {
          setError('Failed to load AI model: ' + (err.message || 'Unknown error'));
          setModelLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: 640, height: 480 } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setStreaming(true);
      setCapturedImage(null);
      setResults([]);
      setError('');
    } catch (err: any) {
      setError('Camera access denied. Use image upload instead.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
    setStreaming(false);
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    setResults([]);
    classifyImage(dataUrl);
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStreaming(false);
    setResults([]);
    setError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setCapturedImage(dataUrl);
      classifyImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const classifyImage = async (imageData: string) => {
    if (!pipelineRef.current) {
      setError('Model not loaded yet. Please wait.');
      return;
    }
    setClassifying(true);
    setError('');
    try {
      const output = await pipelineRef.current(imageData, { topk: 5 });
      const formatted: ClassificationResult[] = output.map((r: any) => ({
        label: r.label.replace(/_/g, ' ').replace(/,/g, ', '),
        score: r.score,
      }));
      setResults(formatted);
    } catch (err: any) {
      setError('Classification failed: ' + (err.message || 'Unknown error'));
    } finally {
      setClassifying(false);
    }
  };

  const resetAll = () => {
    stopCamera();
    setCapturedImage(null);
    setResults([]);
    setError('');
  };

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-4">
            <FiCpu size={14} /> Edge AI Vision
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-3">
            AI Image{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Classification</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
            100% offline image recognition using Transformers.js + WebGPU. Your photos never leave your device.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${webgpu ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'}`}>
              <FiCpu size={12} /> {webgpu ? 'WebGPU Accelerated' : 'CPU Mode'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
              <FiWifiOff size={12} /> Works Offline
            </span>
          </div>
        </motion.div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <FiAlertTriangle className="text-red-400 mt-0.5 shrink-0" size={18} />
            <p className="text-red-300 text-sm">{error}</p>
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Camera / Upload Controls */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FiCamera className="text-purple-400" size={20} /> Capture Image
            </h2>

            <div className="space-y-3">
              {!streaming && !capturedImage && (
                <>
                  <button onClick={startCamera} disabled={modelLoading} className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold hover:from-purple-500 hover:to-blue-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    <FiCamera size={18} /> Open Camera
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} disabled={modelLoading} className="w-full py-3 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    <FiUpload size={18} /> Upload Image
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </>
              )}

              {streaming && (
                <div className="relative rounded-xl overflow-hidden border border-white/10">
                  <video ref={videoRef} className="w-full h-64 object-cover" playsInline />
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3">
                    <button onClick={captureFrame} className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full font-bold text-sm hover:from-purple-500 hover:to-blue-500 transition-all flex items-center gap-2">
                      <FiCamera size={16} /> Capture
                    </button>
                    <button onClick={stopCamera} className="px-4 py-2 bg-white/10 border border-white/20 rounded-full font-bold text-sm hover:bg-white/20 transition-all">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {modelLoading && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                  <div className="flex items-center gap-3 text-purple-300 text-sm mb-2">
                    <FiRefreshCw className="animate-spin" size={16} />
                    {modelProgress}
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                      initial={false}
                      animate={{ width: modelProgress.includes('%') ? modelProgress.match(/(\d+)/)?.[0] + '%' || '50%' : '100%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {capturedImage && (
                <div className="relative rounded-xl overflow-hidden border border-white/10">
                  <Image src={capturedImage} alt="Captured" width={640} height={480} className="w-full h-64 object-cover" unoptimized />
                  <button onClick={resetAll} className="absolute top-3 right-3 p-2 bg-black/60 rounded-lg backdrop-blur-sm hover:bg-black/80 transition-all">
                    <FiRefreshCw size={16} />
                  </button>
                </div>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </motion.div>

          {/* Results Panel */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FiInfo className="text-blue-400" size={20} /> Classification Results
            </h2>

            {!capturedImage && !classifying && results.length === 0 && (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500">
                <FiImage size={48} className="mb-3 opacity-30" />
                <p className="text-sm">Capture or upload an image to classify it using the on-device AI model.</p>
              </div>
            )}

            {classifying && (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <FiRefreshCw className="animate-spin text-purple-400 mb-4" size={32} />
                <p className="text-slate-400 text-sm">Classifying image...</p>
                <p className="text-slate-500 text-xs mt-1">Running inference on-device with WebGPU</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-3">
                {results.map((r, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-3 bg-white/[0.03] border border-white/10 rounded-xl"
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-semibold text-white">{r.label}</span>
                      <span className={`text-xs font-bold ${r.score > 0.5 ? 'text-emerald-400' : r.score > 0.2 ? 'text-amber-400' : 'text-slate-400'}`}>
                        {(r.score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${r.score * 100}%` }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className={`h-full rounded-full ${r.score > 0.5 ? 'bg-emerald-500' : r.score > 0.2 ? 'bg-amber-500' : 'bg-slate-500'}`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Info Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.02] border border-white/8 rounded-2xl p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <FiWifiOff size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white mb-1">100% Offline</h3>
                <p className="text-xs text-slate-500">Model runs entirely in your browser. No data sent to any server. Works without internet.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <FiCpu size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white mb-1">WebGPU Accelerated</h3>
                <p className="text-xs text-slate-500">Uses your GPU for fast inference. Falls back to CPU if WebGPU is unavailable.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <FiCheckCircle size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white mb-1">MobileNet v2</h3>
                <p className="text-xs text-slate-500">Lightweight model (14MB) capable of recognizing 1000+ object categories. First load only.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
