/**
 * Auto-Save Utility
 * 
 * Provides debounced auto-save functionality for form data with visual feedback
 * and automatic restore on page load.
 */

import { save, load, remove } from '@/lib/storage/local-storage';
import type { ClinicalCase } from '@/types';

// Auto-save configuration
const AUTO_SAVE_DELAY = 30000; // 30 seconds
const AUTO_SAVE_KEY = 'dentalgemma:form-autosave';

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface AutoSaveState {
  status: AutoSaveStatus;
  lastSaved: Date | null;
  error: string | null;
}

/**
 * Auto-save manager class
 */
export class AutoSaveManager {
  private timeoutId: NodeJS.Timeout | null = null;
  private status: AutoSaveStatus = 'idle';
  private lastSaved: Date | null = null;
  private error: string | null = null;
  private listeners: Set<(state: AutoSaveState) => void> = new Set();

  /**
   * Schedule an auto-save operation (debounced)
   */
  scheduleSave(data: ClinicalCase): void {
    // Clear existing timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    // Update status to indicate pending save
    this.updateStatus('idle');

    // Schedule new save
    this.timeoutId = setTimeout(() => {
      this.performSave(data);
    }, AUTO_SAVE_DELAY);
  }

  /**
   * Perform immediate save (bypasses debounce)
   */
  saveNow(data: ClinicalCase): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.performSave(data);
  }

  /**
   * Restore saved data from localStorage
   */
  restore(): ClinicalCase | null {
    try {
      const data = load(AUTO_SAVE_KEY);
      return data;
    } catch (error) {
      console.error('Failed to restore auto-saved data:', error);
      this.updateStatus('error', 'Failed to restore data');
      return null;
    }
  }

  /**
   * Clear auto-saved data
   */
  clear(): void {
    try {
      remove(AUTO_SAVE_KEY);
      this.lastSaved = null;
      this.updateStatus('idle');
    } catch (error) {
      console.error('Failed to clear auto-saved data:', error);
    }
  }

  /**
   * Check if auto-saved data exists
   */
  hasAutoSavedData(): boolean {
    const data = load(AUTO_SAVE_KEY);
    return data !== null;
  }

  /**
   * Get current auto-save state
   */
  getState(): AutoSaveState {
    return {
      status: this.status,
      lastSaved: this.lastSaved,
      error: this.error,
    };
  }

  /**
   * Subscribe to auto-save state changes
   */
  subscribe(listener: (state: AutoSaveState) => void): () => void {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Cancel pending auto-save
   */
  cancel(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.updateStatus('idle');
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.cancel();
    this.listeners.clear();
  }

  // Private methods

  private performSave(data: ClinicalCase): void {
    this.updateStatus('saving');

    try {
      save(AUTO_SAVE_KEY, data);
      this.lastSaved = new Date();
      this.error = null;
      this.updateStatus('saved');

      // Reset to idle after 2 seconds
      setTimeout(() => {
        if (this.status === 'saved') {
          this.updateStatus('idle');
        }
      }, 2000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to save';
      this.error = errorMessage;
      this.updateStatus('error', errorMessage);
      console.error('Auto-save failed:', error);
    }
  }

  private updateStatus(status: AutoSaveStatus, error: string | null = null): void {
    this.status = status;
    if (error) {
      this.error = error;
    }

    // Notify all listeners
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (error) {
        console.error('Error in auto-save listener:', error);
      }
    });
  }
}

/**
 * Create a new auto-save manager instance
 */
export function createAutoSaveManager(): AutoSaveManager {
  return new AutoSaveManager();
}

/**
 * Format last saved time for display
 */
export function formatLastSaved(date: Date | null): string {
  if (!date) {
    return 'Never';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffSeconds < 60) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleString();
  }
}

/**
 * React hook for auto-save functionality
 */
export function useAutoSave(
  data: ClinicalCase | null,
  enabled: boolean = true
): {
  state: AutoSaveState;
  saveNow: () => void;
  restore: () => ClinicalCase | null;
  clear: () => void;
  hasAutoSavedData: boolean;
} {
  // This is a placeholder for the React hook implementation
  // The actual implementation will be done when creating the form component
  throw new Error('useAutoSave hook should be implemented in a React component');
}
