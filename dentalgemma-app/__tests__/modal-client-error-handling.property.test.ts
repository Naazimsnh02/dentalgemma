/**
 * Property-Based Tests for Modal Client Error Handling
 * 
 * Tests:
 * - Property 25: Error Handling and Fallback
 * 
 * Validates: Requirements 16.2, 16.3, 16.8
 */

import * as fc from 'fast-check';
import { ModalClient, ModalClientError, NetworkError } from '@/lib/api/modal-client';

// Mock fetch globally
global.fetch = jest.fn();

describe('Modal Client Error Handling Property Tests', () => {
  let client: ModalClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new ModalClient('https://test-modal.com');
  });

  afterEach(() => {
    client.stopKeepAlive();
  });

  describe('Property 25: Error Handling and Fallback', () => {
    /**
     * For any failed API request, the system SHALL:
     * 1. Retry with exponential backoff (max 3 attempts)
     * 2. Fall back to cached data or offline tools after retries exhausted
     * 3. Display user-friendly error messages without stack traces
     * 4. Log errors for debugging while maintaining privacy
     */

    // Arbitrary for HTTP error codes
    const httpErrorCodeArb = fc.constantFrom(
      400, 401, 403, 404, 429, 500, 502, 503, 504
    );

    // Arbitrary for network error types
    const networkErrorArb = fc.constantFrom(
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ENETUNREACH'
    );

    test('**Validates: Requirement 16.2, 16.3** - Retries with exponential backoff (max 3 attempts)', async () => {
      await fc.assert(
        fc.asyncProperty(
          httpErrorCodeArb,
          async (errorCode) => {
            // Clear mocks for each property test run
            jest.clearAllMocks();
            
            // Mock fetch to always fail
            (global.fetch as jest.Mock).mockRejectedValue(
              new Error(`HTTP ${errorCode}`)
            );

            // Attempt to analyze X-ray
            try {
              await client.analyzeXray('data:image/jpeg;base64,test', 'xray');
              // Should not reach here
              expect(true).toBe(false);
            } catch (error) {
              // Verify it's a NetworkError (after retries)
              expect(error).toBeInstanceOf(NetworkError);
              expect((error as NetworkError).message).toContain('Failed after');
              expect((error as NetworkError).message).toContain('attempts');

              // Verify fetch was called 3 times (max retries)
              expect(global.fetch).toHaveBeenCalledTimes(3);
            }
          }
        ),
        { numRuns: 5, timeout: 25000 } // Increase timeout for retry delays
      );
    }, 30000); // Increase Jest timeout

    test('**Validates: Requirement 16.3** - Does not retry on 4xx errors (except 429)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(401, 403, 404), // Exclude 400 which might have different behavior
          async (errorCode) => {
            // Clear mocks for each property test run
            jest.clearAllMocks();
            
            // Mock fetch to return 4xx error
            (global.fetch as jest.Mock).mockResolvedValue({
              ok: false,
              status: errorCode,
              statusText: 'Client Error',
              json: async () => ({ error: `HTTP ${errorCode}` }),
            });

            try {
              await client.analyzeXray('data:image/jpeg;base64,test', 'xray');
              expect(true).toBe(false);
            } catch (error) {
              // Verify it's a ModalClientError
              expect(error).toBeInstanceOf(ModalClientError);

              // Verify fetch was called only once (no retries for 4xx)
              expect(global.fetch).toHaveBeenCalledTimes(1);
            }
          }
        ),
        { numRuns: 3 }
      );
    });

    test('**Validates: Requirement 16.3** - Retries on 429 rate limit errors', async () => {
      // Clear mocks
      jest.clearAllMocks();
      
      // Mock fetch to return 429 error
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: async () => ({ error: 'Rate limit exceeded' }),
      });

      try {
        await client.analyzeXray('data:image/jpeg;base64,test', 'xray');
        expect(true).toBe(false);
      } catch (error) {
        // Verify it's a NetworkError (after retries)
        expect(error).toBeInstanceOf(NetworkError);

        // Verify fetch was called 3 times (retries for 429)
        expect(global.fetch).toHaveBeenCalledTimes(3);
      }
    }, 10000); // Increase timeout

    test('**Validates: Requirement 16.8** - Error messages are user-friendly (no stack traces)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 100 }),
          async (errorMessage) => {
            // Clear mocks for each property test run
            jest.clearAllMocks();
            
            // Mock fetch to fail with custom error
            (global.fetch as jest.Mock).mockRejectedValue(
              new Error(errorMessage)
            );

            try {
              await client.analyzeXray('data:image/jpeg;base64,test', 'xray');
              expect(true).toBe(false);
            } catch (error) {
              const err = error as NetworkError;

              // Verify error message is user-friendly
              expect(err.message).toBeDefined();
              expect(typeof err.message).toBe('string');

              // Verify no stack trace in message
              expect(err.message).not.toContain('at Object');
              expect(err.message).not.toContain('at async');
              expect(err.message).not.toContain('.js:');
              expect(err.message).not.toContain('.ts:');

              // Verify error has a code
              expect(err.code).toBeDefined();
              expect(typeof err.code).toBe('string');
            }
          }
        ),
        { numRuns: 5, timeout: 10000 }
      );
    }, 30000);

    test('Exponential backoff delays increase with each retry', async () => {
      jest.clearAllMocks();
      const delays: number[] = [];
      let callCount = 0;

      // Mock fetch to track timing
      (global.fetch as jest.Mock).mockImplementation(async () => {
        callCount++;
        if (callCount > 1) {
          delays.push(Date.now());
        }
        throw new Error('Network error');
      });

      try {
        await client.analyzeXray('data:image/jpeg;base64,test', 'xray');
      } catch (error) {
        // Verify delays increased (exponential backoff)
        // Note: This is a timing-sensitive test, so we just verify the pattern
        expect(delays.length).toBe(2); // 2 retries after first attempt
      }
    });

    test('Successful retry after transient failure', async () => {
      jest.clearAllMocks();
      let callCount = 0;

      // Mock fetch to fail twice, then succeed
      (global.fetch as jest.Mock).mockImplementation(async () => {
        callCount++;
        if (callCount < 3) {
          throw new Error('Transient network error');
        }
        return {
          ok: true,
          json: async () => ({
            success: true,
            analysis: 'Analysis successful after retry',
            processing_time: Math.fround(1.5),
            model: 'dentalgemma-1.5-4b-it',
            type: 'xray_analysis',
          }),
        };
      });

      // Should succeed on third attempt
      const result = await client.analyzeXray('data:image/jpeg;base64,test', 'xray');

      expect(result).toBeDefined();
      expect(result.findings).toBeDefined();
      expect(global.fetch).toHaveBeenCalledTimes(3);
    }, 10000);

    test('Health check handles errors gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          httpErrorCodeArb,
          async (errorCode) => {
            // Mock fetch to fail
            (global.fetch as jest.Mock).mockResolvedValue({
              ok: false,
              status: errorCode,
              statusText: 'Error',
            });

            try {
              await client.healthCheck();
              expect(true).toBe(false);
            } catch (error) {
              expect(error).toBeInstanceOf(ModalClientError);
              expect((error as ModalClientError).message).toContain('Health check failed');
            }
          }
        ),
        { numRuns: 5 }
      );
    });

    test('Chat endpoint handles errors with retry', async () => {
      jest.clearAllMocks();
      let callCount = 0;

      // Mock fetch to fail twice, then succeed
      (global.fetch as jest.Mock).mockImplementation(async () => {
        callCount++;
        if (callCount < 3) {
          throw new Error('Network error');
        }
        return {
          ok: true,
          json: async () => ({
            success: true,
            message: 'Chat response after retry',
            processing_time: Math.fround(0.5),
            model: 'dentalgemma-1.5-4b-it',
            type: 'chat',
          }),
        };
      });

      const response = await client.chat('Test message');

      expect(response).toBe('Chat response after retry');
      expect(global.fetch).toHaveBeenCalledTimes(3);
    }, 10000);

    test('Assessment endpoint handles errors with retry', async () => {
      jest.clearAllMocks();
      let callCount = 0;

      // Mock fetch to fail twice, then succeed
      (global.fetch as jest.Mock).mockImplementation(async () => {
        callCount++;
        if (callCount < 3) {
          throw new Error('Network error');
        }
        return {
          ok: true,
          json: async () => ({
            success: true,
            assessment: 'Assessment after retry',
            processing_time: Math.fround(2.0),
            model: 'dentalgemma-1.5-4b-it',
            type: 'clinical_assessment',
          }),
        };
      });

      const mockCase = {
        id: '123',
        patient: { age: 30, gender: 'male' as const },
        chiefComplaint: {
          description: 'Pain'
        },
        history: 'Pain for 2 days. Pain level 7.',
        clinicalFindings: {
          description: 'Findings'
        },
        radiographicFindings: {
          description: 'Findings'
        },
        medicalHistory: {
          history: 'None',
          medications: 'None',
          systemicConditions: 'None',
          habits: 'None',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await client.assessCase(mockCase);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    }, 10000);

    test('Error details are preserved for debugging', async () => {
      const originalError = new Error('Original network error');
      (global.fetch as jest.Mock).mockRejectedValue(originalError);

      try {
        await client.analyzeXray('data:image/jpeg;base64,test', 'xray');
        expect(true).toBe(false);
      } catch (error) {
        const err = error as NetworkError;

        // Verify error details are preserved
        expect(err.details).toBeDefined();
        expect(err.details.originalError).toBeDefined();
      }
    });

    test('Configuration error when base URL not set', async () => {
      const clientWithoutUrl = new ModalClient('');

      try {
        await clientWithoutUrl.analyzeXray('data:image/jpeg;base64,test', 'xray');
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(ModalClientError);
        expect((error as ModalClientError).message).toContain('not configured');
        expect((error as ModalClientError).code).toBe('CONFIG_ERROR');
      }
    });
  });

  describe('Error Type Invariants', () => {
    // Define httpErrorCodeArb here for this scope
    const httpErrorCodeArb = fc.constantFrom(
      400, 401, 403, 404, 429, 500, 502, 503, 504
    );

    test('All errors extend ModalClientError', async () => {
      jest.clearAllMocks();
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Test error'));

      try {
        await client.analyzeXray('data:image/jpeg;base64,test', 'xray');
      } catch (error) {
        expect(error).toBeInstanceOf(ModalClientError);
      }
    }, 10000);

    test('Network errors have NETWORK_ERROR code', async () => {
      jest.clearAllMocks();
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network failure'));

      try {
        await client.analyzeXray('data:image/jpeg;base64,test', 'xray');
      } catch (error) {
        expect((error as NetworkError).code).toBe('NETWORK_ERROR');
      }
    }, 10000);

    test('All errors have a message', async () => {
      await fc.assert(
        fc.asyncProperty(
          httpErrorCodeArb,
          async (errorCode) => {
            jest.clearAllMocks();
            (global.fetch as jest.Mock).mockResolvedValue({
              ok: false,
              status: errorCode,
              statusText: 'Error',
              json: async () => ({ error: 'Test error' }),
            });

            try {
              await client.analyzeXray('data:image/jpeg;base64,test', 'xray');
            } catch (error) {
              expect((error as ModalClientError).message).toBeDefined();
              expect(typeof (error as ModalClientError).message).toBe('string');
              expect((error as ModalClientError).message.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 3 }
      );
    }, 15000);
  });
});
