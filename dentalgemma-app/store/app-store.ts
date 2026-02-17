import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppState,
  AnalysisHistoryItem,
  XRayAnalysis,
  CaseAssessment,
  VoiceSession,
  Treatment,
  ResearchPaper,
  DentistInfo,
  UserSettings,
  DashboardStats,
  Theme,
  VoiceMode,
} from '@/types';

// Default settings
const defaultSettings: UserSettings = {
  theme: 'system',
  voiceSettings: {
    mode: 'standard',
    language: 'en-US',
    speechRate: 1.0,
    pitch: 1.0,
  },
  fontSize: 'medium',
  reduceAnimations: false,
  highContrast: false,
  colorBlindMode: false,
};

// Default dashboard stats
const defaultDashboardStats: DashboardStats = {
  totalAnalyses: 0,
  casesAssessed: 0,
  papersFound: 0,
  dentistsLocated: 0,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Current Analysis State
      currentXRayAnalysis: null,
      currentCaseAssessment: null,
      currentVoiceSession: null,

      // History
      analysisHistory: [],

      // Treatments
      treatments: [],

      // Saved Items
      savedPapers: [],
      favoriteDentists: [],

      // Settings
      settings: defaultSettings,

      // Dashboard Stats
      dashboardStats: defaultDashboardStats,

      // Actions
      setCurrentXRayAnalysis: (analysis) =>
        set({ currentXRayAnalysis: analysis }),

      setCurrentCaseAssessment: (assessment) =>
        set({ currentCaseAssessment: assessment }),

      setCurrentVoiceSession: (session) =>
        set({ currentVoiceSession: session }),

      addToHistory: (item) =>
        set((state) => ({
          analysisHistory: [item, ...state.analysisHistory],
        })),

      removeFromHistory: (ids) =>
        set((state) => ({
          analysisHistory: state.analysisHistory.filter(
            (item) => !ids.includes(item.id)
          ),
        })),

      clearHistory: () =>
        set({ analysisHistory: [] }),

      addTreatment: (treatment) =>
        set((state) => ({
          treatments: [...state.treatments, treatment],
        })),

      updateTreatment: (id, updates) =>
        set((state) => ({
          treatments: state.treatments.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
          ),
        })),

      deleteTreatment: (id) =>
        set((state) => ({
          treatments: state.treatments.filter((t) => t.id !== id),
        })),

      savePaper: (paper) =>
        set((state) => {
          const exists = state.savedPapers.some((p) => p.pmid === paper.pmid);
          if (exists) return state;
          return {
            savedPapers: [...state.savedPapers, { ...paper, saved: true }],
          };
        }),

      unsavePaper: (pmid) =>
        set((state) => ({
          savedPapers: state.savedPapers.filter((p) => p.pmid !== pmid),
        })),

      saveDentist: (dentist) =>
        set((state) => {
          const exists = state.favoriteDentists.some(
            (d) => d.placeId === dentist.placeId
          );
          if (exists) return state;
          return {
            favoriteDentists: [...state.favoriteDentists, dentist],
          };
        }),

      unsaveDentist: (placeId) =>
        set((state) => ({
          favoriteDentists: state.favoriteDentists.filter(
            (d) => d.placeId !== placeId
          ),
        })),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      updateDashboardStats: (stats) =>
        set((state) => ({
          dashboardStats: { ...state.dashboardStats, ...stats },
        })),
    }),
    {
      name: 'dentalgemma-app-storage',
      partialize: (state) => ({
        analysisHistory: state.analysisHistory,
        treatments: state.treatments,
        savedPapers: state.savedPapers,
        favoriteDentists: state.favoriteDentists,
        settings: state.settings,
        dashboardStats: state.dashboardStats,
      }),
    }
  )
);
