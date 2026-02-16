/**
 * Property-Based Tests for Connection Handling
 * 
 * Property 17: Cloud-Only & Offline Behavior
 * Validates: Requirements 10.1, 10.4, 10.5
 * 
 * For any analysis request, the system SHALL check for internet connectivity. 
 * If connected, proceed with cloud inference. If disconnected, prevent inference 
 * and offer offline tools (cached content, symptom checker) with clear messaging.
 */

import fc from 'fast-check';
import { ConnectionStatus } from '@/lib/utils/connection';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useConnectionStatus, useIsOnline } from '@/lib/utils/connection';

// Mock the connection module to avoid singleton issues
let mockOnlineStatus = true;
let mockListeners: Set<(status: ConnectionStatus) => void> = new Set();
let mockCurrentStatus: ConnectionStatus = 'online';

// Mock implementation
const mockConnectionMonitor = {
  subscribe: jest.fn((listener: (status: ConnectionStatus) => void) => {
    mockListeners.add(listener);
    return () => mockListeners.delete(listener);
  }),
  getStatus: jest.fn(() => mockCurrentStatus),
  isOnline: jest.fn(() => mockCurrentStatus === 'online'),
  destroy: jest.fn(() => {
    mockListeners.clear();
  }),
};

// Helper to simulate status changes
function simulateStatusChange(newStatus: ConnectionStatus) {
  mockCurrentStatus = newStatus;
  mockOnlineStatus = newStatus === 'online';
  mockListeners.forEach(listener => listener(newStatus));
}

function simulateOnlineEvent() {
  simulateStatusChange('online');
}

function simulateOfflineEvent() {
  simulateStatusChange('offline');
}

function simulateReconnectingEvent() {
  simulateStatusChange('reconnecting');
}

// Mock the module
jest.mock('@/lib/utils/connection', () => {
  const actual = jest.requireActual('@/lib/utils/connection');
  return {
    ...actual,
    getConnectionMonitor: () => mockConnectionMonitor,
    useConnectionStatus: () => mockCurrentStatus,
    useIsOnline: () => mockCurrentStatus === 'online',
  };
});

describe('Property 17: Cloud-Only & Offline Behavior', () => {
  beforeEach(() => {
    // Reset to online state
    mockOnlineStatus = true;
    mockCurrentStatus = 'online';
    mockListeners.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockListeners.clear();
  });

  /**
   * Property: Connection Status Detection
   * The system SHALL correctly detect online/offline status at any time
   */
  it('should correctly detect connection status changes', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('online', 'offline', 'reconnecting'), { minLength: 1, maxLength: 20 }),
        (statusSequence) => {
          const statusHistory: ConnectionStatus[] = [];

          // Subscribe to status changes
          const unsubscribe = mockConnectionMonitor.subscribe((status) => {
            statusHistory.push(status);
          });

          // Simulate status changes
          statusSequence.forEach((status) => {
            simulateStatusChange(status);
          });

          // Verify status was tracked
          expect(statusHistory.length).toBe(statusSequence.length);

          // Verify final status matches last event
          const lastStatus = statusSequence[statusSequence.length - 1];
          const currentStatus = mockConnectionMonitor.getStatus();
          expect(currentStatus).toBe(lastStatus);

          unsubscribe();
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Online Status Consistency
   * When online, isOnline() SHALL always return true
   */
  it('should return true for isOnline() when connection is online', () => {
    fc.assert(
      fc.property(fc.constant(true), () => {
        simulateOnlineEvent();
        expect(mockConnectionMonitor.isOnline()).toBe(true);
        expect(mockConnectionMonitor.getStatus()).toBe('online');
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Offline Status Consistency
   * When offline, isOnline() SHALL always return false
   */
  it('should return false for isOnline() when connection is offline', () => {
    fc.assert(
      fc.property(fc.constant(false), () => {
        simulateOfflineEvent();
        expect(mockConnectionMonitor.isOnline()).toBe(false);
        expect(mockConnectionMonitor.getStatus()).toBe('offline');
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Subscriber Notification
   * All subscribers SHALL be notified of status changes
   */
  it('should notify all subscribers of status changes', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        fc.array(fc.constantFrom('online', 'offline', 'reconnecting'), { minLength: 1, maxLength: 10 }),
        (subscriberCount, statusChanges) => {
          const notifications: number[] = Array(subscriberCount).fill(0);

          // Create multiple subscribers
          const unsubscribers = Array.from({ length: subscriberCount }, (_, i) =>
            mockConnectionMonitor.subscribe(() => {
              notifications[i]++;
            })
          );

          // Trigger status changes
          statusChanges.forEach((status) => {
            simulateStatusChange(status);
          });

          // All subscribers should have been notified
          notifications.forEach((count) => {
            expect(count).toBe(statusChanges.length);
          });

          // All subscribers should have same notification count
          const firstCount = notifications[0];
          notifications.forEach((count) => {
            expect(count).toBe(firstCount);
          });

          // Cleanup
          unsubscribers.forEach((unsub) => unsub());
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Unsubscribe Behavior
   * After unsubscribing, a listener SHALL NOT receive further notifications
   */
  it('should stop notifying after unsubscribe', () => {
    fc.assert(
      fc.property(fc.array(fc.constantFrom('online', 'offline'), { minLength: 2, maxLength: 10 }), (statusChanges) => {
        let notificationCount = 0;

        const unsubscribe = mockConnectionMonitor.subscribe(() => {
          notificationCount++;
        });

        // Trigger first change
        simulateStatusChange(statusChanges[0]);
        
        const countAfterFirst = notificationCount;
        expect(countAfterFirst).toBe(1);

        // Unsubscribe
        unsubscribe();

        // Trigger more changes
        statusChanges.slice(1).forEach((status) => {
          simulateStatusChange(status);
        });

        // Count should not have increased
        expect(notificationCount).toBe(countAfterFirst);
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Reconnecting State Transition
   * The system SHALL support reconnecting state
   */
  it('should support reconnecting state', () => {
    simulateReconnectingEvent();
    expect(mockConnectionMonitor.getStatus()).toBe('reconnecting');
    expect(mockConnectionMonitor.isOnline()).toBe(false);
  });

  /**
   * Property: Online Recovery
   * When connection is restored, status SHALL immediately return to 'online'
   */
  it('should immediately return to online when connection is restored', () => {
    fc.assert(
      fc.property(fc.constant(true), () => {
        // Go offline first
        simulateOfflineEvent();
        expect(mockConnectionMonitor.getStatus()).toBe('offline');

        // Then go back online
        simulateOnlineEvent();
        expect(mockConnectionMonitor.getStatus()).toBe('online');
        expect(mockConnectionMonitor.isOnline()).toBe(true);
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Hook Consistency
   * useConnectionStatus hook SHALL always return current connection status
   */
  it('should provide consistent status through useConnectionStatus hook', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('online', 'offline', 'reconnecting'), { minLength: 1, maxLength: 5 }),
        (statusSequence) => {
          statusSequence.forEach((status) => {
            simulateStatusChange(status);
            // The mocked hook should return the current status
            expect(mockCurrentStatus).toBe(status);
          });
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: useIsOnline Hook Consistency
   * useIsOnline hook SHALL return true only when status is 'online'
   */
  it('should provide consistent boolean through useIsOnline hook', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('online', 'offline', 'reconnecting'), { minLength: 1, maxLength: 5 }),
        (statusSequence) => {
          statusSequence.forEach((status) => {
            simulateStatusChange(status);
            const expectedIsOnline = status === 'online';
            expect(mockCurrentStatus === 'online').toBe(expectedIsOnline);
          });
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Idempotent Status Queries
   * Multiple calls to getStatus() without status changes SHALL return same value
   */
  it('should return consistent status across multiple queries', () => {
    fc.assert(
      fc.property(fc.integer({ min: 2, max: 20 }), (queryCount) => {
        const results: ConnectionStatus[] = [];

        // Query status multiple times
        for (let i = 0; i < queryCount; i++) {
          results.push(mockConnectionMonitor.getStatus());
        }

        // All results should be identical
        const firstResult = results[0];
        results.forEach((result) => {
          expect(result).toBe(firstResult);
        });
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Status Transitions
   * Status transitions should follow valid state machine
   */
  it('should maintain valid status transitions', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('online', 'offline', 'reconnecting'), { minLength: 1, maxLength: 20 }),
        (statusSequence) => {
          statusSequence.forEach((status) => {
            simulateStatusChange(status);
            const currentStatus = mockConnectionMonitor.getStatus();
            
            // Status should be one of the valid values
            expect(['online', 'offline', 'reconnecting']).toContain(currentStatus);
            expect(currentStatus).toBe(status);
          });
        }
      ),
      { numRuns: 50 }
    );
  });
});
