/**
 * Property-Based Tests for Storage Operations
 * 
 * Property 11: Treatment Data Persistence
 * Validates: Requirements 6.1, 6.7, 6.8, 6.9, 6.10
 * 
 * For any treatment CRUD operation (create, read, update, delete), 
 * the system SHALL persist changes to localStorage immediately and 
 * maintain data consistency across page reloads.
 */

import fc from 'fast-check';
import { save, load, remove, clearAll } from '@/lib/storage/local-storage';
import type { Treatment } from '@/types';

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

// Arbitrary for generating valid Treatment objects
const treatmentArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  phase: fc.string({ minLength: 1, maxLength: 50 }),
  status: fc.constantFrom('not-started', 'in-progress', 'completed'),
  completionPercentage: fc.integer({ min: 0, max: 100 }),
  nextAppointment: fc.option(fc.date(), { nil: undefined }),
  notes: fc.string({ maxLength: 500 }),
  documents: fc.constant([]), // Simplified for testing
  cost: fc.option(fc.float({ min: 0, max: 100000, noNaN: true }), { nil: undefined }),
  createdAt: fc.date(),
  updatedAt: fc.date(),
}) as fc.Arbitrary<Treatment>;

describe('Property 11: Treatment Data Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  /**
   * Property: Save and Load Round-Trip
   * For any valid treatment array, saving and then loading should return equivalent data
   */
  it('should maintain data integrity through save/load round-trip', () => {
    fc.assert(
      fc.property(fc.array(treatmentArbitrary, { maxLength: 50 }), (treatments) => {
        // Save treatments
        save('dentalgemma:treatments', treatments);

        // Load treatments
        const loaded = load('dentalgemma:treatments');

        // Verify loaded data matches saved data
        expect(loaded).not.toBeNull();
        expect(loaded).toHaveLength(treatments.length);

        // Deep comparison (handling Date serialization)
        const normalizedOriginal = JSON.parse(JSON.stringify(treatments));
        const normalizedLoaded = JSON.parse(JSON.stringify(loaded));
        expect(normalizedLoaded).toEqual(normalizedOriginal);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Create Operation Persistence
   * After adding a treatment, it should be retrievable from storage
   */
  it('should persist newly created treatments immediately', () => {
    fc.assert(
      fc.property(treatmentArbitrary, (newTreatment) => {
        // Start with empty array
        const existing: Treatment[] = [];
        save('dentalgemma:treatments', existing);

        // Add new treatment
        const updated = [...existing, newTreatment];
        save('dentalgemma:treatments', updated);

        // Verify persistence
        const loaded = load('dentalgemma:treatments');
        expect(loaded).not.toBeNull();
        expect(loaded).toHaveLength(1);
        
        const normalizedNew = JSON.parse(JSON.stringify(newTreatment));
        const normalizedLoaded = JSON.parse(JSON.stringify(loaded![0]));
        expect(normalizedLoaded).toEqual(normalizedNew);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Update Operation Persistence
   * After updating a treatment, the changes should be persisted
   */
  it('should persist treatment updates immediately', () => {
    fc.assert(
      fc.property(
        fc.array(treatmentArbitrary, { minLength: 1, maxLength: 20 }),
        fc.integer({ min: 0, max: 19 }),
        fc.record({
          completionPercentage: fc.integer({ min: 0, max: 100 }),
          notes: fc.string({ maxLength: 500 }),
        }),
        (treatments, indexRaw, updates) => {
          // Ensure index is valid
          const index = indexRaw % treatments.length;

          // Save initial treatments
          save('dentalgemma:treatments', treatments);

          // Update one treatment
          const updatedTreatments = treatments.map((t, i) =>
            i === index
              ? { ...t, ...updates, updatedAt: new Date() }
              : t
          );
          save('dentalgemma:treatments', updatedTreatments);

          // Verify update persisted
          const loaded = load('dentalgemma:treatments');
          expect(loaded).not.toBeNull();
          expect(loaded![index].completionPercentage).toBe(updates.completionPercentage);
          expect(loaded![index].notes).toBe(updates.notes);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Delete Operation Persistence
   * After deleting a treatment, it should not be retrievable
   */
  it('should persist treatment deletions immediately', () => {
    fc.assert(
      fc.property(
        fc.array(treatmentArbitrary, { minLength: 1, maxLength: 20 }),
        fc.integer({ min: 0, max: 19 }),
        (treatments, indexRaw) => {
          // Ensure index is valid
          const index = indexRaw % treatments.length;
          const deletedId = treatments[index].id;

          // Save initial treatments
          save('dentalgemma:treatments', treatments);

          // Delete one treatment
          const afterDelete = treatments.filter((t) => t.id !== deletedId);
          save('dentalgemma:treatments', afterDelete);

          // Verify deletion persisted
          const loaded = load('dentalgemma:treatments');
          expect(loaded).not.toBeNull();
          expect(loaded!.length).toBe(treatments.length - 1);
          expect(loaded!.find((t) => t.id === deletedId)).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Multiple CRUD Operations Consistency
   * A sequence of CRUD operations should maintain consistency
   */
  it('should maintain consistency across multiple CRUD operations', () => {
    fc.assert(
      fc.property(
        fc.array(treatmentArbitrary, { maxLength: 10 }),
        fc.array(
          fc.oneof(
            fc.record({ op: fc.constant('add'), treatment: treatmentArbitrary }),
            fc.record({ op: fc.constant('delete'), index: fc.integer({ min: 0, max: 9 }) })
          ),
          { maxLength: 10 }
        ),
        (initialTreatments, operations) => {
          // Start with initial treatments
          let current = [...initialTreatments];
          save('dentalgemma:treatments', current);

          // Apply operations
          for (const operation of operations) {
            if (operation.op === 'add') {
              current = [...current, operation.treatment];
            } else if (operation.op === 'delete' && current.length > 0) {
              const index = operation.index % current.length;
              current = current.filter((_, i) => i !== index);
            }
            save('dentalgemma:treatments', current);
          }

          // Verify final state matches
          const loaded = load('dentalgemma:treatments');
          expect(loaded).not.toBeNull();
          expect(loaded!.length).toBe(current.length);

          const normalizedCurrent = JSON.parse(JSON.stringify(current));
          const normalizedLoaded = JSON.parse(JSON.stringify(loaded));
          expect(normalizedLoaded).toEqual(normalizedCurrent);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Data Consistency Across Page Reload Simulation
   * Data should remain consistent even after simulated page reloads
   */
  it('should maintain data consistency across simulated page reloads', () => {
    fc.assert(
      fc.property(fc.array(treatmentArbitrary, { maxLength: 20 }), (treatments) => {
        // Save treatments
        save('dentalgemma:treatments', treatments);

        // Simulate page reload by creating new reference
        const afterReload = load('dentalgemma:treatments');

        // Verify data survived "reload"
        expect(afterReload).not.toBeNull();
        expect(afterReload!.length).toBe(treatments.length);

        const normalizedOriginal = JSON.parse(JSON.stringify(treatments));
        const normalizedReloaded = JSON.parse(JSON.stringify(afterReload));
        expect(normalizedReloaded).toEqual(normalizedOriginal);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Empty Array Handling
   * System should correctly handle empty treatment arrays
   */
  it('should correctly persist and load empty treatment arrays', () => {
    fc.assert(
      fc.property(fc.constant([]), (emptyArray) => {
        save('dentalgemma:treatments', emptyArray as unknown as Treatment[]);
        const loaded = load('dentalgemma:treatments');
        
        expect(loaded).not.toBeNull();
        expect(loaded).toEqual([]);
        expect(Array.isArray(loaded)).toBe(true);
      }),
      { numRuns: 10 }
    );
  });

  /**
   * Property: Clear Operation
   * After clearing, no treatment data should be retrievable
   */
  it('should completely remove treatment data when cleared', () => {
    fc.assert(
      fc.property(fc.array(treatmentArbitrary, { minLength: 1, maxLength: 20 }), (treatments) => {
        // Save treatments
        save('dentalgemma:treatments', treatments);
        expect(load('dentalgemma:treatments')).not.toBeNull();

        // Clear
        remove('dentalgemma:treatments');

        // Verify cleared
        const afterClear = load('dentalgemma:treatments');
        expect(afterClear).toBeNull();
      }),
      { numRuns: 100 }
    );
  });
});
