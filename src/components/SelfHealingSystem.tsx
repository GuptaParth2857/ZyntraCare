'use client';

import { useEffect, useState, useRef } from 'react';

interface RecoveryAction {
  id: string;
  error: string;
  action: () => Promise<boolean>;
  description: string;
}

const autoRecoveryActions: RecoveryAction[] = [
  {
    id: 'map_reinit',
    error: 'Map container is already initialized',
    action: async () => {
      // Clear any lingering map instances
      const maps = document.querySelectorAll('.leaflet-container');
      maps.forEach(map => {
        (map as any)._leaflet_id = undefined;
      });
      
      // Trigger re-render by updating a localStorage flag
      localStorage.setItem('zyntra_map_refresh', Date.now().toString());
      return true;
    },
    description: 'Reinitializing map containers'
  },
  {
    id: 'cache_clear',
    error: 'Failed to fetch',
    action: async () => {
      // Clear specific cache and retry
      sessionStorage.clear();
      return true;
    },
    description: 'Clearing session cache'
  },
  {
    id: 'component_reload',
    error: 'Component is not defined',
    action: async () => {
      // Force reload dynamic imports
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('zyntra_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      return true;
    },
    description: 'Refreshing component cache'
  }
];

interface SelfHealingSystemProps {
  children: React.ReactNode;
}

export default function SelfHealingSystem({ children }: SelfHealingSystemProps) {
  const [isHealing, setIsHealing] = useState(false);
  const [healingLog, setHealingLog] = useState<string[]>([]);
  const lastErrorRef = useRef<string>('');

  useEffect(() => {
    // Check for map refresh flag
    const checkMapRefresh = () => {
      const lastMapRefresh = localStorage.getItem('zyntra_map_refresh');
      if (lastMapRefresh) {
        const age = Date.now() - parseInt(lastMapRefresh);
        if (age < 5000) {
          // Map was recently refreshed, reload components
          window.location.reload();
        }
      }
    };

    // Listen for storage changes (from other tabs)
    window.addEventListener('storage', (e) => {
      if (e.key === 'zyntra_map_refresh') {
        checkMapRefresh();
      }
    });

    // Error interceptor
    const handleError = (event: ErrorEvent) => {
      if (event.message !== lastErrorRef.current) {
        lastErrorRef.current = event.message;
        attemptSelfHealing(event.message);
      }
    };

    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  const attemptSelfHealing = async (errorMessage: string) => {
    setIsHealing(true);
    
    for (const recovery of autoRecoveryActions) {
      if (errorMessage.toLowerCase().includes(recovery.error.toLowerCase())) {
        addLog(`🔍 Detected: ${recovery.error}`);
        addLog(`🩹 Attempting: ${recovery.description}`);
        
        try {
          const success = await recovery.action();
          if (success) {
            addLog(`✅ ${recovery.description} - Done!`);
            
            // Show toast notification
            showHealingNotification(recovery.description, true);
            
            // Small delay then reload
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          }
        } catch (err) {
          addLog(`❌ Failed to auto-fix`);
          showHealingNotification(recovery.description, false);
        }
        
        break;
      }
    }
    
    setIsHealing(false);
  };

  const addLog = (message: string) => {
    setHealingLog(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()} - ${message}`]);
  };

  const showHealingNotification = (description: string, success: boolean) => {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-[99999] px-4 py-3 rounded-xl shadow-2xl ${
      success 
        ? 'bg-emerald-600/90 text-white' 
        : 'bg-red-600/90 text-white'
    } backdrop-blur-xl border border-white/20 flex items-center gap-3`;
    toast.innerHTML = `
      <span class="text-xl">${success ? '✅' : '❌'}</span>
      <div>
        <p class="font-bold text-sm">${success ? 'Self-Healed!' : 'Auto-fix Failed'}</p>
        <p class="text-xs opacity-80">${description}</p>
      </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  // Listen for heal button click
  useEffect(() => {
    const handleHealRequest = () => {
      addLog('🩺 Running self-healing diagnostics...');
      
      // Check common issues
      const checks = [
        { name: 'Map containers', check: () => document.querySelectorAll('.leaflet-container').length },
        { name: 'Session storage', check: () => Object.keys(sessionStorage).length },
        { name: 'Local storage', check: () => Object.keys(localStorage).filter(k => k.startsWith('zyntra_')).length },
      ];
      
      checks.forEach(({ name, check }) => {
        const count = check();
        if (count > 0) {
          addLog(`📊 ${name}: ${count} items`);
        }
      });
      
      addLog('✨ Diagnostics complete!');
    };

    window.addEventListener('runSelfHealing', handleHealRequest);
    return () => window.removeEventListener('runSelfHealing', handleHealRequest);
  }, []);

  return (
    <>
      {children}
      
      {/* Healing Indicator (only when active) */}
      {isHealing && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[99999]">
          <div className="bg-gradient-to-r from-purple-600 to-teal-600 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span className="font-bold text-white">AI Self-Healing...</span>
          </div>
        </div>
      )}
      
      {/* Debug: Click anywhere to show heal button */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('runSelfHealing'))}
          className="fixed bottom-20 right-4 z-[9998] w-12 h-12 bg-purple-600/80 hover:bg-purple-500 rounded-full shadow-lg flex items-center justify-center text-white text-xl transition"
          title="Run Self-Healing"
        >
          💊
        </button>
      )}
    </>
  );
}

// Utility function to manually trigger healing
export function triggerSelfHeal() {
  window.dispatchEvent(new CustomEvent('runSelfHealing'));
}

// Utility to add recovery action
export function addRecoveryAction(action: RecoveryAction) {
  autoRecoveryActions.push(action);
}