'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { FiBell, FiX, FiCheck, FiAlertCircle, FiInfo, FiMessageSquare, FiCalendar, FiCreditCard, FiUser } from 'react-icons/fi';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    href: string;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('zyntracare_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotifications(parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        })));
      } catch { }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('zyntracare_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearNotifications,
      unreadCount
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

// Helper functions to trigger different notification types
export function notifySuccess(title: string, message: string) {
  const { addNotification } = useNotifications() || {};
  if (addNotification) {
    addNotification({ type: 'success', title, message });
  }
}

export function notifyError(title: string, message: string) {
  const { addNotification } = useNotifications() || {};
  if (addNotification) {
    addNotification({ type: 'error', title, message });
  }
}

export function notifyInfo(title: string, message: string) {
  const { addNotification } = useNotifications() || {};
  if (addNotification) {
    addNotification({ type: 'info', title, message });
  }
}

export function notifyWarning(title: string, message: string) {
  const { addNotification } = useNotifications() || {};
  if (addNotification) {
    addNotification({ type: 'warning', title, message });
  }
}

// Notification Bell Component
export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <FiCheck className="text-green-400" />;
      case 'error': return <FiAlertCircle className="text-red-400" />;
      case 'warning': return <FiAlertCircle className="text-amber-400" />;
      default: return <FiInfo className="text-blue-400" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-white font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-sky-400 hover:text-sky-300"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FiBell className="mx-auto mb-2 opacity-50" size={32} />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.slice(0, 10).map(n => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`p-4 border-b border-slate-800 cursor-pointer hover:bg-slate-800/50 transition ${!n.read ? 'bg-slate-800/30' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!n.read ? 'text-white font-medium' : 'text-gray-300'}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{n.message}</p>
                        <p className="text-xs text-gray-600 mt-1">{formatTime(n.timestamp)}</p>
                      </div>
                      {!n.read && (
                        <div className="w-2 h-2 bg-sky-500 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t border-slate-700">
                <button
                  onClick={() => { notifications.length = 0; setIsOpen(false); }}
                  className="w-full text-center text-xs text-gray-500 hover:text-gray-400"
                >
                  Clear all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Add notifications for common actions
export function notifyBooking(doctorName: string, hospitalName: string) {
  if (typeof window !== 'undefined') {
    const { addNotification } = (window as any).__notificationContext || {};
    if (addNotification) {
      addNotification({
        type: 'success',
        title: 'Appointment Booked',
        message: `Booking confirmed with ${doctorName} at ${hospitalName}`,
      });
    }
  }
}

export function notifyFeedbacksubmitted() {
  if (typeof window !== 'undefined') {
    const { addNotification } = (window as any).__notificationContext || {};
    if (addNotification) {
      addNotification({
        type: 'success',
        title: 'Feedback Submitted',
        message: 'Thank you for your feedback!',
      });
    }
  }
}

export function notifyEmergency(type: string) {
  if (typeof window !== 'undefined') {
    const { addNotification } = (window as any).__notificationContext || {};
    if (addNotification) {
      addNotification({
        type: 'warning',
        title: 'Emergency Alert',
        message: `Emergency ${type} initiated`,
      });
    }
  }
}