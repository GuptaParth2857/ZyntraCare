'use client';

import { useEffect, useState, useCallback } from 'react';
import { diagnoseError, formatDebugResponse, autoDebugFromStack, DebugResponse } from '@/lib/debugAssistant';
import { FiAlertTriangle, FiX, FiChevronDown, FiChevronUp, FiCopy, FiRefreshCw, FiTerminal, FiZap } from 'react-icons/fi';

interface GlobalErrorHandlerProps {
  children: ReactNode;
}

interface ErrorLog {
  id: string;
  message: string;
  timestamp: Date;
  diagnosis: DebugResponse | null;
  resolved: boolean;
}

import { ReactNode } from 'react';

export default function GlobalErrorHandler({ children }: GlobalErrorHandlerProps) {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastError, setLastError] = useState<ErrorLog | null>(null);

  // Capture errors
  const handleError = useCallback((event: ErrorEvent) => {
    const errorLog: ErrorLog = {
      id: Date.now().toString(),
      message: event.message,
      timestamp: new Date(),
      diagnosis: null,
      resolved: false
    };

    // Auto-diagnose
    errorLog.diagnosis = diagnoseError({
      errorMessage: event.message,
      context: {
        stackTrace: event.error?.stack || ''
      }
    });

    setErrors(prev => [errorLog, ...prev.slice(0, 9)]);
    setLastError(errorLog);
  }, []);

  // Capture unhandled promise rejections
  const handleUnhandledRejection = useCallback((event: PromiseRejectionEvent) => {
    const message = event.reason?.message || String(event.reason);
    
    const errorLog: ErrorLog = {
      id: Date.now().toString(),
      message,
      timestamp: new Date(),
      diagnosis: null,
      resolved: false
    };

    errorLog.diagnosis = diagnoseError({
      errorMessage: message,
      context: {
        stackTrace: event.reason?.stack || ''
      }
    });

    setErrors(prev => [errorLog, ...prev.slice(0, 9)]);
    setLastError(errorLog);
  }, []);

  useEffect(() => {
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [handleError, handleUnhandledRejection]);

  // Inject fix from localStorage if available
  useEffect(() => {
    const storedFix = localStorage.getItem('zyntra_last_fix');
    if (storedFix) {
      try {
        const fix = JSON.parse(storedFix);
        const fixAge = Date.now() - new Date(fix.timestamp).getTime();
        // Show fix if less than 1 hour old
        if (fixAge < 3600000) {
          console.log('🔧 AI detected similar error before. Suggested fix:', fix.fix);
        }
      } catch (e) {
        // Ignore
      }
    }
  }, []);

  const markResolved = (id: string) => {
    setErrors(prev => prev.map(e => e.id === id ? { ...e, resolved: true } : e));
  };

  const clearErrors = () => {
    setErrors([]);
    setLastError(null);
  };

  const unresolvedCount = errors.filter(e => !e.resolved).length;

  if (typeof window === 'undefined') {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      
      {/* Floating Error Handler Widget */}
      {errors.length > 0 && (
        <div className="fixed bottom-4 right-4 z-[9999] w-80">
          {/* Collapsed State */}
          <div 
            className={`bg-slate-900/95 backdrop-blur-xl border rounded-2xl overflow-hidden transition-all ${
              isExpanded ? 'border-red-500/50' : unresolvedCount > 0 ? 'border-orange-500/50' : 'border-slate-700'
            }`}
          >
            {/* Header */}
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  unresolvedCount > 0 ? 'bg-orange-500/20' : 'bg-emerald-500/20'
                }`}>
                  <FiZap className={unresolvedCount > 0 ? 'text-orange-400' : 'text-emerald-400'} />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">AI Error Handler</p>
                  <p className="text-xs text-slate-400">
                    {unresolvedCount > 0 ? `${unresolvedCount} issue${unresolvedCount > 1 ? 's' : ''} found` : 'All clear!'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <FiChevronDown className="text-slate-400" />
                ) : (
                  <FiChevronUp className="text-slate-400" />
                )}
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="border-t border-white/10 max-h-96 overflow-y-auto">
                {/* Last Error Highlight */}
                {lastError && !lastError.resolved && (
                  <div className="p-4 bg-red-500/10 border-b border-red-500/20">
                    <div className="flex items-start gap-2">
                      <FiAlertTriangle className="text-red-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-red-400 font-bold mb-1">Latest Error:</p>
                        <p className="text-xs text-slate-300 mb-2">{lastError.message.slice(0, 100)}</p>
                        
                        {lastError.diagnosis && (
                          <div className="space-y-2">
                            {lastError.diagnosis.solutions?.slice(0, 2).map((sol, i) => (
                              <p key={i} className="text-xs text-slate-400 flex items-start gap-1">
                                <span className="text-emerald-400">→</span>
                                {sol}
                              </p>
                            ))}
                            
                            {lastError.diagnosis.quickFix && (
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(lastError.diagnosis?.quickFix || '');
                                }}
                                className="mt-2 w-full py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg text-xs text-purple-400 flex items-center justify-center gap-1"
                              >
                                <FiCopy size={12} /> Copy Fix
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Error List */}
                <div className="divide-y divide-white/5">
                  {errors.slice(0, 5).map((error) => (
                    <div 
                      key={error.id}
                      className={`p-3 ${error.resolved ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-300 truncate">{error.message}</p>
                          <p className="text-[10px] text-slate-500 mt-1">
                            {error.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        {error.resolved ? (
                          <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                            Fixed
                          </span>
                        ) : (
                          <button
                            onClick={() => markResolved(error.id)}
                            className="text-[10px] text-slate-400 hover:text-white"
                          >
                            Dismiss
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="p-3 bg-slate-800/50 flex gap-2">
                  <button
                    onClick={() => window.location.href = '/debug'}
                    className="flex-1 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg text-xs text-purple-400 flex items-center justify-center gap-1"
                  >
                    <FiTerminal size={12} /> Full Debug
                  </button>
                  <button
                    onClick={clearErrors}
                    className="py-2 px-3 bg-slate-700/50 rounded-lg text-xs text-slate-400"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}