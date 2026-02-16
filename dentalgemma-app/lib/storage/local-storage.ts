/**
 * localStorage Manager
 * 
 * Provides safe localStorage operations with error handling and automatic cleanup
 * for QuotaExceededError scenarios.
 */

import type { LocalStorageSchema } from '@/types';

// Storage keys type-safe access
export type StorageKey = keyof LocalStorageSchema;

// Error types
export class StorageError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'StorageError';
  }
}

export class QuotaExceededError extends StorageError {
  constructor() {
    super('Storage quota exceeded', 'QUOTA_EXCEEDED');
  }
}

export class StorageUnavailableError extends StorageError {
  constructor() {
    super('localStorage is not available', 'STORAGE_UNAVAILABLE');
  }
}

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the current storage usage in bytes
 */
export function getStorageSize(): number {
  let total = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total;
}

/**
 * Get storage usage as a percentage (approximate, assumes 5MB limit)
 */
export function getStorageUsagePercent(): number {
  const APPROXIMATE_LIMIT = 5 * 1024 * 1024; // 5MB
  return (getStorageSize() / APPROXIMATE_LIMIT) * 100;
}

/**
 * Save data to localStorage with error handling
 */
export function save<K extends StorageKey>(
  key: K,
  value: LocalStorageSchema[K]
): void {
  if (!isLocalStorageAvailable()) {
    throw new StorageUnavailableError();
  }

  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      // Attempt automatic cleanup
      try {
        cleanupOldData();
        // Retry save after cleanup
        const serialized = JSON.stringify(value);
        localStorage.setItem(key, serialized);
      } catch (retryError) {
        throw new QuotaExceededError();
      }
    } else {
      throw new StorageError(
        `Failed to save data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SAVE_FAILED'
      );
    }
  }
}

/**
 * Load data from localStorage with error handling
 */
export function load<K extends StorageKey>(
  key: K
): LocalStorageSchema[K] | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return null;
    }
    return JSON.parse(item) as LocalStorageSchema[K];
  } catch (error) {
    console.error(`Failed to load data from ${key}:`, error);
    return null;
  }
}

/**
 * Remove a specific key from localStorage
 */
export function remove(key: StorageKey): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove ${key}:`, error);
  }
}

/**
 * Clear all DentalGemma data from localStorage
 */
export function clearAll(): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    const keys = Object.keys(localStorage);
    const dentalGemmaKeys = keys.filter((key) =>
      key.startsWith('dentalgemma:')
    );

    dentalGemmaKeys.forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Failed to clear all data:', error);
  }
}

/**
 * Cleanup old data to free up space
 * Removes oldest history items first, then old autosave data
 */
function cleanupOldData(): void {
  try {
    // 1. Try to remove old history items (keep only last 50)
    const history = load('dentalgemma:history');
    if (history && Array.isArray(history) && history.length > 50) {
      const trimmedHistory = history.slice(0, 50);
      save('dentalgemma:history', trimmedHistory);
      return;
    }

    // 2. Remove autosave data if it exists
    const autosave = localStorage.getItem('dentalgemma:form-autosave');
    if (autosave) {
      remove('dentalgemma:form-autosave');
      return;
    }

    // 3. If still not enough space, remove oldest treatments
    const treatments = load('dentalgemma:treatments');
    if (treatments && Array.isArray(treatments) && treatments.length > 20) {
      const sortedTreatments = [...treatments].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      const trimmedTreatments = sortedTreatments.slice(0, 20);
      save('dentalgemma:treatments', trimmedTreatments);
      return;
    }

    // 4. Last resort: remove saved papers
    const papers = load('dentalgemma:saved-papers');
    if (papers && Array.isArray(papers) && papers.length > 0) {
      const trimmedPapers = papers.slice(0, Math.floor(papers.length / 2));
      save('dentalgemma:saved-papers', trimmedPapers);
    }
  } catch (error) {
    console.error('Failed to cleanup old data:', error);
    throw error;
  }
}

/**
 * Export all data as JSON for backup
 */
export function exportAllData(): string {
  const data: Partial<LocalStorageSchema> = {};

  const keys: StorageKey[] = [
    'dentalgemma:history',
    'dentalgemma:treatments',
    'dentalgemma:saved-papers',
    'dentalgemma:favorites-dentists',
    'dentalgemma:settings',
    'dentalgemma:dashboard-stats',
  ];

  keys.forEach((key) => {
    const value = load(key);
    if (value !== null) {
      data[key] = value as any;
    }
  });

  return JSON.stringify(data, null, 2);
}

/**
 * Import data from JSON backup
 */
export function importData(jsonData: string): void {
  try {
    const data = JSON.parse(jsonData) as Partial<LocalStorageSchema>;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        save(key as StorageKey, value as any);
      }
    });
  } catch (error) {
    throw new StorageError(
      `Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'IMPORT_FAILED'
    );
  }
}
