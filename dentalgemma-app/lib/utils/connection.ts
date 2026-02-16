'use client';

import { useEffect, useState } from 'react';

/**
 * Connection status type
 */
export type ConnectionStatus = 'online' | 'offline' | 'reconnecting';

/**
 * Connection monitor utility
 * Tracks browser online/offline status
 */
class ConnectionMonitor {
  private listeners: Set<(status: ConnectionStatus) => void> = new Set();
  private currentStatus: ConnectionStatus = 'online';
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.currentStatus = navigator.onLine ? 'online' : 'offline';
      this.setupListeners();
    }
  }

  private setupListeners() {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  private handleOnline = () => {
    this.currentStatus = 'online';
    this.notifyListeners();
    
    // Clear reconnecting timeout if exists
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  };

  private handleOffline = () => {
    this.currentStatus = 'offline';
    this.notifyListeners();
    
    // Set reconnecting state after a delay
    this.reconnectTimeout = setTimeout(() => {
      if (this.currentStatus === 'offline') {
        this.currentStatus = 'reconnecting';
        this.notifyListeners();
      }
    }, 3000); // Wait 3 seconds before showing "reconnecting"
  };

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentStatus));
  }

  /**
   * Subscribe to connection status changes
   */
  subscribe(listener: (status: ConnectionStatus) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get current connection status
   */
  getStatus(): ConnectionStatus {
    return this.currentStatus;
  }

  /**
   * Check if currently online
   */
  isOnline(): boolean {
    return this.currentStatus === 'online';
  }

  /**
   * Cleanup listeners
   */
  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    this.listeners.clear();
  }
}

// Singleton instance
let connectionMonitor: ConnectionMonitor | null = null;

/**
 * Get the connection monitor singleton instance
 */
export function getConnectionMonitor(): ConnectionMonitor {
  if (!connectionMonitor) {
    connectionMonitor = new ConnectionMonitor();
  }
  return connectionMonitor;
}

/**
 * React hook to monitor connection status
 * @returns Current connection status
 */
export function useConnectionStatus(): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>(() => {
    if (typeof window === 'undefined') return 'online';
    return getConnectionMonitor().getStatus();
  });

  useEffect(() => {
    const monitor = getConnectionMonitor();
    
    // Set initial status
    setStatus(monitor.getStatus());
    
    // Subscribe to changes
    const unsubscribe = monitor.subscribe(setStatus);
    
    return unsubscribe;
  }, []);

  return status;
}

/**
 * React hook to check if online
 * @returns True if online, false otherwise
 */
export function useIsOnline(): boolean {
  const status = useConnectionStatus();
  return status === 'online';
}
