import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Basic store structure - will be expanded in Task 3
interface AppState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'dentalgemma-settings',
    }
  )
);
