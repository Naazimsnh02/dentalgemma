/**
 * Property-Based Tests for Auto-Save Functionality
 * 
 * Property 30: Form Auto-Save
 * Validates: Requirements 2.14
 * 
 * When form data is entered, the system SHALL auto-save to localStorage 
 * every 30 seconds and restore on page load.
 */

import fc from 'fast-check';
import { createAutoSaveManager, AutoSaveManager } from '@/lib/utils/auto-save';
import { save, load, remove } from '@/lib/storage/local-storage';
import type { ClinicalCase } from '@/types';

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

// Setup localStorage mock
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Arbitrary for generating valid ClinicalCase objects
const clinicalCaseArbitrary = fc.record({
  id: fc.uuid(),
  patient: fc.record({
    age: fc.integer({ min: 1, max: 120 }),
    gender: fc.constantFrom('male', 'female', 'other'),
    patientId: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  }),
  chiefComplaint: fc.record({
    description: fc.string({ minLength: 1, maxLength: 500 }),
    duration: fc.string({ minLength: 1, maxLength: 100 }),
    painLevel: fc.integer({ min: 1, max: 10 }),
    triggers: fc.array(fc.string({ maxLength: 100 }), { maxLength: 10 }),
  }),
  clinicalFindings: fc.record({
    intraoral: fc.string({ maxLength: 500 }),
    extraoral: fc.string({ maxLength: 500 }),
    softTissue: fc.string({ maxLength: 500 }),
    periodontal: fc.string({ maxLength: 500 }),
  }),
  radiographicFindings: fc.record({
    description: fc.string({ maxLength: 500 }),
    xrayImage: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
    boneLoss: fc.string({ maxLength: 200 }),
    periapicalStatus: fc.string({ maxLength: 200 }),
  }),
  medicalHistory: fc.record({
    medications: fc.array(fc.string({ maxLength: 100 }), { maxLength: 20 }),
    allergies: fc.array(fc.string({ maxLength: 100 }), { maxLength: 20 }),
    systemicConditions: fc.array(fc.string({ maxLength: 100 }), { maxLength: 20 }),
    previousTreatments: fc.array(fc.string({ maxLength: 100 }), { maxLength: 20 }),
  }),
  createdAt: fc.date(),
  updatedAt: fc.date(),
}) as fc.Arbitrary<ClinicalCase>;

describe('Property 30: Form Auto-Save', () => {
  let autoSaveManager: AutoSaveManager;

  beforeEach(() => {
    localStorage.clear();
    autoSaveManager = createAutoSaveManager();
  });

  afterEach(() => {
    autoSaveManager.destroy();
    localStorage.clear();
  });

  /**
   * Property: Save and Restore Round-Trip
   * For any valid clinical case, saving and then restoring should return equivalent data
   */
  it('should maintain data integrity through save/restore round-trip', () => {
    fc.assert(
      fc.property(clinicalCaseArbitrary, (clinicalCase) => {
        // Save immediately (bypass debounce)
        autoSaveManager.saveNow(clinicalCase);

        // Restore
        const restored = autoSaveManager.restore();

        // Verify restored data matches saved data
        expect(restored).not.toBeNull();

        // Deep comparison (handling Date serialization)
        const normalizedOriginal = JSON.parse(JSON.stringify(clinicalCase));
        const normalizedRestored = JSON.parse(JSON.stringify(restored));
        expect(normalizedRestored).toEqual(normalizedOriginal);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Multiple Save Operations
   * The last save should overwrite previous saves
   */
  it('should overwrite previous auto-saves with latest data', () => {
    fc.assert(
      fc.property(
        fc.array(clinicalCaseArbitrary, { minLength: 2, maxLength: 5 }),
        (cases) => {
          // Save multiple cases
          cases.forEach((clinicalCase) => {
            autoSaveManager.saveNow(clinicalCase);
          });

          // Restore should return the last saved case
          const restored = autoSaveManager.restore();
          expect(restored).not.toBeNull();

          const lastCase = cases[cases.length - 1];
          const normalizedLast = JSON.parse(JSON.stringify(lastCase));
          const normalizedRestored = JSON.parse(JSON.stringify(restored));
          expect(normalizedRestored).toEqual(normalizedLast);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Clear Operation
   * After clearing, no auto-saved data should be retrievable
   */
  it('should completely remove auto-saved data when cleared', () => {
    fc.assert(
      fc.property(clinicalCaseArbitrary, (clinicalCase) => {
        // Save
        autoSaveManager.saveNow(clinicalCase);
        expect(autoSaveManager.hasAutoSavedData()).toBe(true);

        // Clear
        autoSaveManager.clear();

        // Verify cleared
        expect(autoSaveManager.hasAutoSavedData()).toBe(false);
        expect(autoSaveManager.restore()).toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Partial Data Integrity
   * Even with partial/incomplete clinical case data, round-trip should preserve structure
   */
  it('should preserve partial clinical case data through round-trip', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          patient: fc.record({
            age: fc.integer({ min: 1, max: 120 }),
            gender: fc.constantFrom('male', 'female', 'other'),
          }),
          chiefComplaint: fc.record({
            description: fc.string({ minLength: 1, maxLength: 500 }),
            duration: fc.string({ minLength: 1, maxLength: 100 }),
            painLevel: fc.integer({ min: 1, max: 10 }),
            triggers: fc.array(fc.string({ maxLength: 100 }), { maxLength: 5 }),
          }),
          // Minimal other fields
          clinicalFindings: fc.record({
            intraoral: fc.string({ maxLength: 100 }),
            extraoral: fc.constant(''),
            softTissue: fc.constant(''),
            periodontal: fc.constant(''),
          }),
          radiographicFindings: fc.record({
            description: fc.constant(''),
            boneLoss: fc.constant(''),
            periapicalStatus: fc.constant(''),
          }),
          medicalHistory: fc.record({
            medications: fc.constant([]),
            allergies: fc.constant([]),
            systemicConditions: fc.constant([]),
            previousTreatments: fc.constant([]),
          }),
          createdAt: fc.date(),
          updatedAt: fc.date(),
        }) as fc.Arbitrary<ClinicalCase>,
        (partialCase) => {
          autoSaveManager.saveNow(partialCase);
          const restored = autoSaveManager.restore();

          expect(restored).not.toBeNull();
          const normalizedOriginal = JSON.parse(JSON.stringify(partialCase));
          const normalizedRestored = JSON.parse(JSON.stringify(restored));
          expect(normalizedRestored).toEqual(normalizedOriginal);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: State Consistency
   * Auto-save state should reflect actual storage state
   */
  it('should maintain consistent state with storage', () => {
    fc.assert(
      fc.property(clinicalCaseArbitrary, (clinicalCase) => {
        // Initially no data
        expect(autoSaveManager.hasAutoSavedData()).toBe(false);

        // After save, should have data
        autoSaveManager.saveNow(clinicalCase);
        expect(autoSaveManager.hasAutoSavedData()).toBe(true);

        // After clear, should not have data
        autoSaveManager.clear();
        expect(autoSaveManager.hasAutoSavedData()).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Idempotent Save
   * Saving the same data multiple times should produce the same result
   */
  it('should produce consistent results when saving same data multiple times', () => {
    fc.assert(
      fc.property(clinicalCaseArbitrary, (clinicalCase) => {
        // Save multiple times
        autoSaveManager.saveNow(clinicalCase);
        const firstRestore = autoSaveManager.restore();

        autoSaveManager.saveNow(clinicalCase);
        const secondRestore = autoSaveManager.restore();

        autoSaveManager.saveNow(clinicalCase);
        const thirdRestore = autoSaveManager.restore();

        // All restores should be identical
        const normalized1 = JSON.parse(JSON.stringify(firstRestore));
        const normalized2 = JSON.parse(JSON.stringify(secondRestore));
        const normalized3 = JSON.parse(JSON.stringify(thirdRestore));

        expect(normalized1).toEqual(normalized2);
        expect(normalized2).toEqual(normalized3);
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Data Persistence Across Manager Instances
   * Data saved by one manager instance should be accessible by another
   */
  it('should persist data across different manager instances', () => {
    fc.assert(
      fc.property(clinicalCaseArbitrary, (clinicalCase) => {
        // Save with first manager
        const manager1 = createAutoSaveManager();
        manager1.saveNow(clinicalCase);
        manager1.destroy();

        // Restore with second manager
        const manager2 = createAutoSaveManager();
        const restored = manager2.restore();
        manager2.destroy();

        // Verify data persisted
        expect(restored).not.toBeNull();
        const normalizedOriginal = JSON.parse(JSON.stringify(clinicalCase));
        const normalizedRestored = JSON.parse(JSON.stringify(restored));
        expect(normalizedRestored).toEqual(normalizedOriginal);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Empty String Handling
   * System should correctly handle empty strings in clinical case fields
   */
  it('should correctly handle empty strings in clinical case fields', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          patient: fc.record({
            age: fc.integer({ min: 1, max: 120 }),
            gender: fc.constantFrom('male', 'female', 'other'),
          }),
          chiefComplaint: fc.record({
            description: fc.constant(''),
            duration: fc.constant(''),
            painLevel: fc.integer({ min: 1, max: 10 }),
            triggers: fc.constant([]),
          }),
          clinicalFindings: fc.record({
            intraoral: fc.constant(''),
            extraoral: fc.constant(''),
            softTissue: fc.constant(''),
            periodontal: fc.constant(''),
          }),
          radiographicFindings: fc.record({
            description: fc.constant(''),
            boneLoss: fc.constant(''),
            periapicalStatus: fc.constant(''),
          }),
          medicalHistory: fc.record({
            medications: fc.constant([]),
            allergies: fc.constant([]),
            systemicConditions: fc.constant([]),
            previousTreatments: fc.constant([]),
          }),
          createdAt: fc.date(),
          updatedAt: fc.date(),
        }) as fc.Arbitrary<ClinicalCase>,
        (emptyCase) => {
          autoSaveManager.saveNow(emptyCase);
          const restored = autoSaveManager.restore();

          expect(restored).not.toBeNull();
          expect(restored!.chiefComplaint.description).toBe('');
          expect(restored!.clinicalFindings.intraoral).toBe('');
        }
      ),
      { numRuns: 50 }
    );
  });
});
