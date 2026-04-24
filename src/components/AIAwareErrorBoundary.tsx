'use client';

import { Component, ReactNode } from 'react';
import { diagnoseError, formatDebugResponse, DebugResponse } from '@/lib/debugAssistant';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  diagnosis: DebugResponse | null;
  showDiagnostics: boolean;
}

export default class AIAwareErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      diagnosis: null,
      showDiagnostics: false 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by AI Boundary:', error);
    
    // Auto-diagnose the error
    const diagnosis = diagnoseError({
      errorMessage: error.message,
      context: {
        stackTrace: errorInfo.componentStack || ''
      }
    });

    this.setState({ diagnosis, showDiagnostics: true });

    // Log for debugging
    this.props.onError?.(error, errorInfo);

    // Try auto-fix if available
    this.attemptAutoFix(diagnosis);
  }

  attemptAutoFix(diagnosis: DebugResponse) {
    if (diagnosis.success && diagnosis.quickFix) {
      console.log('AI suggests fix:', diagnosis.quickFix);
      // Store the fix suggestion for user
      localStorage.setItem('zyntra_last_fix', JSON.stringify({
        diagnosis: diagnosis.diagnosis,
        fix: diagnosis.quickFix,
        timestamp: new Date().toISOString()
      }));
    }
  }

  dismissError = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      diagnosis: null,
      showDiagnostics: false 
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.state.showDiagnostics && this.state.diagnosis) {
        return (
          <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full bg-slate-800 border border-red-500/30 rounded-3xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 p-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">AI Error Detection</h2>
                    <p className="text-sm text-slate-400">I found the issue and I might have a fix!</p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              <div className="p-6 border-b border-white/10">
                <h3 className="text-sm font-bold text-red-400 mb-2">Error Detected:</h3>
                <p className="text-white font-mono text-sm bg-slate-900/50 p-3 rounded-xl">
                  {this.state.error?.message}
                </p>
              </div>

              {/* AI Diagnosis */}
              <div className="p-6 space-y-4">
                {this.state.diagnosis.causes?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-orange-400 mb-2">⚠️ Possible Causes:</h4>
                    <ul className="space-y-1">
                      {this.state.diagnosis.causes.map((cause, i) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-orange-400">{i + 1}.</span>
                          {cause}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {this.state.diagnosis.solutions?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-emerald-400 mb-2">✅ Solutions:</h4>
                    <ul className="space-y-1">
                      {this.state.diagnosis.solutions.map((sol, i) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-emerald-400">{i + 1}.</span>
                          {sol}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Quick Fix */}
                {this.state.diagnosis.quickFix && (
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-purple-400">⚡ Suggested Fix</h4>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(this.state.diagnosis?.quickFix || '');
                        }}
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        Copy
                      </button>
                    </div>
                    <pre className="text-xs text-slate-300 bg-slate-900/50 p-3 rounded-lg overflow-x-auto">
                      {this.state.diagnosis.quickFix}
                    </pre>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-6 bg-slate-900/50 flex gap-4">
                <button
                  onClick={this.dismissError}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.href = '/debug'}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition"
                >
                  Open Debugger
                </button>
              </div>
            </div>
          </div>
        );
      }

      return this.props.fallback || (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-slate-400 mb-6">I couldn't automatically fix this issue.</p>
            <button
              onClick={() => window.location.href = '/debug'}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold"
            >
              Use Debug Assistant
            </button>
            <button
              onClick={this.dismissError}
              className="ml-4 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}