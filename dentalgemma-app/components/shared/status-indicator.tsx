'use client';

import { useConnectionStatus } from '@/lib/utils/connection';
import { WifiOff, RefreshCw } from 'lucide-react';

/**
 * Connection status indicator component
 * Shows a discreet indicator when offline or reconnecting
 */
export function StatusIndicator() {
  const status = useConnectionStatus();

  // Don't show anything when online
  if (status === 'online') {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 shadow-lg border border-yellow-200 dark:border-yellow-800"
      role="status"
      aria-live="polite"
      aria-label={status === 'offline' ? 'You are offline' : 'Reconnecting to the internet'}
    >
      {status === 'offline' ? (
        <>
          <WifiOff className="h-4 w-4 text-yellow-600 dark:text-yellow-400" aria-hidden="true" />
          <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
            You are offline
          </span>
        </>
      ) : (
        <>
          <RefreshCw 
            className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" 
            aria-hidden="true" 
          />
          <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
            Reconnecting...
          </span>
        </>
      )}
    </div>
  );
}
