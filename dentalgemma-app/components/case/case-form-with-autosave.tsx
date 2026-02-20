'use client';

/**
 * Case Form with Auto-Save Wrapper
 * 
 * Wraps the CaseForm component with auto-save functionality:
 * - Auto-saves to localStorage every 30 seconds
 * - Visual indicator for save status
 * - Restores data on page reload
 * 
 * Requirements: 2.14
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { CaseForm } from './case-form';
import { createAutoSaveManager, formatLastSaved, type AutoSaveState } from '@/lib/utils/auto-save';
import type { ClinicalCase } from '@/types';

interface CaseFormWithAutosaveProps {
  onSubmit: (caseData: ClinicalCase) => void;
  isSubmitting?: boolean;
}

export function CaseFormWithAutosave({ onSubmit, isSubmitting = false }: CaseFormWithAutosaveProps) {
  const [initialData, setInitialData] = useState<Partial<ClinicalCase> | undefined>(undefined);
  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>({
    status: 'idle',
    lastSaved: null,
    error: null,
  });
  
  const autoSaveManagerRef = useRef(createAutoSaveManager());

  // Load saved data on mount
  useEffect(() => {
    const manager = autoSaveManagerRef.current;
    const savedData = manager.restore();
    if (savedData) {
      setInitialData(savedData);
    }

    // Subscribe to auto-save state changes
    const unsubscribe = manager.subscribe((state) => {
      setAutoSaveState(state);
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
      manager.destroy();
    };
  }, []);

  // Auto-save handler
  const handleAutoSave = useCallback((data: Partial<ClinicalCase>) => {
    const manager = autoSaveManagerRef.current;
    // Only save if we have complete data
    if (data.patient && data.chiefComplaint && data.clinicalFindings && 
        data.radiographicFindings && data.medicalHistory) {
      manager.scheduleSave(data as ClinicalCase);
    }
  }, []);

  // Handle form submission
  const handleSubmit = (caseData: ClinicalCase) => {
    // Clear auto-saved data on successful submission
    autoSaveManagerRef.current.clear();
    onSubmit(caseData);
  };

  // Get save status display
  const getSaveStatusDisplay = () => {
    switch (autoSaveState.status) {
      case 'saving':
        return {
          color: 'bg-yellow-500',
          text: 'Saving...',
          animate: true,
        };
      case 'saved':
        return {
          color: 'bg-green-500',
          text: formatLastSaved(autoSaveState.lastSaved),
          animate: false,
        };
      case 'error':
        return {
          color: 'bg-red-500',
          text: autoSaveState.error || 'Failed to save',
          animate: false,
        };
      default:
        return {
          color: 'bg-gray-400',
          text: autoSaveState.lastSaved ? formatLastSaved(autoSaveState.lastSaved) : 'Not saved yet',
          animate: false,
        };
    }
  };

  const statusDisplay = getSaveStatusDisplay();

  return (
    <div className="relative">


      {/* Case Form */}
      <CaseForm
        onSubmit={handleSubmit}
        onSave={handleAutoSave}
        initialData={initialData}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
