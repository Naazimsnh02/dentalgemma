/**
 * Property-Based Tests for Modal.com Cloud Client
 * 
 * Tests:
 * - Property 1: X-Ray Analysis Output Completeness
 * - Property 3: Clinical Assessment Output Completeness
 * 
 * Validates: Requirements 1.2-1.5, 2.6-2.13
 */

import * as fc from 'fast-check';
import { ModalClient, ModalClientError } from '@/lib/api/modal-client';
import type { AnalysisType, ClinicalCase, XRayAnalysis, CaseAssessment } from '@/types';

// Mock fetch globally
global.fetch = jest.fn();

describe('Modal Client Property-Based Tests', () => {
  let client: ModalClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new ModalClient('https://test-modal.com');
  });

  afterEach(() => {
    client.stopKeepAlive();
  });

  describe('Property 1: X-Ray Analysis Output Completeness', () => {
    /**
     * For any valid X-ray image and analysis type (cavity, OPG, tooth-id, general),
     * the DentalGemma model output SHALL contain all required fields:
     * - findings array
     * - confidence score (0-1)
     * - urgency level
     * - recommendations array
     * - processing time
     */

    // Arbitrary for analysis types
    const analysisTypeArb = fc.constantFrom<AnalysisType>(
      'cavity',
      'opg',
      'tooth-id',
      'general'
    );

    // Arbitrary for base64 image strings
    const base64ImageArb = fc.string({ minLength: 100, maxLength: 200 }).map(
      (str) => `data:image/jpeg;base64,${btoa(str)}`
    );

    // Arbitrary for mock API responses
    const mockXRayResponseArb = fc.record({
      success: fc.constant(true),
      analysis: fc.string({ minLength: 50, maxLength: 500 }),
      processing_time: fc.float({ min: Math.fround(0.1), max: Math.fround(5.0) }),
      model: fc.constant('dentalgemma-1.5-4b-it'),
      type: fc.constant('xray_analysis'),
    });

    test('**Validates: Requirements 1.2, 1.3, 1.4, 1.5** - All analysis types return complete output', async () => {
      await fc.assert(
        fc.asyncProperty(
          analysisTypeArb,
          base64ImageArb,
          mockXRayResponseArb,
          async (analysisType, imageData, mockResponse) => {
            // Setup mock
            (global.fetch as jest.Mock).mockResolvedValueOnce({
              ok: true,
              json: async () => mockResponse,
            });

            // Execute
            const result = await client.analyzeXray(imageData, analysisType);

            // Verify all required fields are present
            expect(result).toBeDefined();
            expect(result.type).toBe(analysisType);
            
            // Required fields from Property 1
            expect(Array.isArray(result.findings)).toBe(true);
            expect(result.findings.length).toBeGreaterThan(0);
            
            expect(typeof result.confidence).toBe('number');
            expect(result.confidence).toBeGreaterThanOrEqual(0);
            expect(result.confidence).toBeLessThanOrEqual(1);
            
            expect(['low', 'medium', 'high']).toContain(result.urgency);
            
            expect(Array.isArray(result.recommendations)).toBe(true);
            expect(result.recommendations.length).toBeGreaterThan(0);
            
            expect(typeof result.processingTime).toBe('number');
            expect(result.processingTime).toBeGreaterThan(0);

            // Type-specific fields
            switch (analysisType) {
              case 'cavity':
                expect(['0', '1', '2', '3+']).toContain((result as any).cavityCount);
                expect(['normal', 'cavity']).toContain((result as any).classification);
                break;
              case 'opg':
                expect(['Healthy', 'Caries', 'Impacted', 'BDC-BDR', 'Infection', 'Fractured'])
                  .toContain((result as any).pathologyClass);
                break;
              case 'tooth-id':
                expect(typeof (result as any).toothCount).toBe('number');
                expect((result as any).toothCount).toBeGreaterThanOrEqual(0);
                expect((result as any).toothCount).toBeLessThanOrEqual(32);
                break;
              case 'general':
                expect(Array.isArray((result as any).reportSections)).toBe(true);
                expect(typeof (result as any).qualityAssessment).toBe('string');
                break;
            }
          }
        ),
        { numRuns: 20 } // Run 20 times with different inputs
      );
    });

    test('Confidence scores are always between 0 and 1', async () => {
      await fc.assert(
        fc.asyncProperty(
          analysisTypeArb,
          base64ImageArb,
          mockXRayResponseArb,
          async (analysisType, imageData, mockResponse) => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
              ok: true,
              json: async () => mockResponse,
            });

            const result = await client.analyzeXray(imageData, analysisType);

            expect(result.confidence).toBeGreaterThanOrEqual(0);
            expect(result.confidence).toBeLessThanOrEqual(1);
          }
        ),
        { numRuns: 20 }
      );
    });

    test('Urgency levels are always valid', async () => {
      await fc.assert(
        fc.asyncProperty(
          analysisTypeArb,
          base64ImageArb,
          mockXRayResponseArb,
          async (analysisType, imageData, mockResponse) => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
              ok: true,
              json: async () => mockResponse,
            });

            const result = await client.analyzeXray(imageData, analysisType);

            expect(['low', 'medium', 'high']).toContain(result.urgency);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Property 3: Clinical Assessment Output Completeness', () => {
    /**
     * For any valid clinical case submission, the DentalGemma model output SHALL contain
     * all 8 required sections:
     * 1. Primary diagnosis (with ICD-10 code, confidence, differential diagnoses)
     * 2. Etiology analysis
     * 3. Urgency classification
     * 4. Management plan
     * 5. Antibiotic recommendations (when indicated)
     * 6. Follow-up schedule
     * 7. Patient counseling
     * 8. Clinical guidelines with evidence level
     */

    // Arbitrary for clinical case data
    const patientInfoArb = fc.record({
      age: fc.integer({ min: 1, max: 100 }),
      gender: fc.constantFrom('male', 'female', 'other'),
      patientId: fc.option(fc.string(), { nil: undefined }),
    });

    const chiefComplaintArb = fc.record({
      description: fc.string({ minLength: 10, maxLength: 200 }),
      duration: fc.string({ minLength: 5, maxLength: 50 }),
      painLevel: fc.integer({ min: 1, max: 10 }),
      triggers: fc.array(fc.string(), { minLength: 0, maxLength: 5 }),
    });

    const clinicalFindingsArb = fc.record({
      intraoral: fc.string({ minLength: 10, maxLength: 200 }),
      extraoral: fc.string({ minLength: 10, maxLength: 200 }),
      softTissue: fc.string({ minLength: 10, maxLength: 200 }),
      periodontal: fc.string({ minLength: 10, maxLength: 200 }),
    });

    const radiographicFindingsArb = fc.record({
      description: fc.string({ minLength: 10, maxLength: 200 }),
      xrayImage: fc.option(fc.string(), { nil: undefined }),
      boneLoss: fc.string({ minLength: 5, maxLength: 100 }),
      periapicalStatus: fc.string({ minLength: 5, maxLength: 100 }),
    });

    const medicalHistoryArb = fc.record({
      medications: fc.array(fc.string(), { minLength: 0, maxLength: 5 }),
      allergies: fc.array(fc.string(), { minLength: 0, maxLength: 5 }),
      systemicConditions: fc.array(fc.string(), { minLength: 0, maxLength: 5 }),
      previousTreatments: fc.array(fc.string(), { minLength: 0, maxLength: 5 }),
    });

    const clinicalCaseArb = fc.record({
      id: fc.uuid(),
      patient: patientInfoArb,
      chiefComplaint: chiefComplaintArb,
      clinicalFindings: clinicalFindingsArb,
      radiographicFindings: radiographicFindingsArb,
      medicalHistory: medicalHistoryArb,
      createdAt: fc.date(),
      updatedAt: fc.date(),
    });

    // Arbitrary for mock assessment response
    const mockAssessmentResponseArb = fc.record({
      success: fc.constant(true),
      assessment: fc.string({ minLength: 200, maxLength: 1000 }),
      processing_time: fc.float({ min: Math.fround(0.5), max: Math.fround(10.0) }),
      model: fc.constant('dentalgemma-1.5-4b-it'),
      type: fc.constant('clinical_assessment'),
    });

    test('**Validates: Requirements 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 2.13** - All 8 sections are present', async () => {
      await fc.assert(
        fc.asyncProperty(
          clinicalCaseArb,
          mockAssessmentResponseArb,
          async (caseData, mockResponse) => {
            // Setup mock
            (global.fetch as jest.Mock).mockResolvedValueOnce({
              ok: true,
              json: async () => mockResponse,
            });

            // Execute
            const result = await client.assessCase(caseData);

            // Verify all 8 required sections are present
            expect(result).toBeDefined();
            expect(result.success).toBe(true);

            // Section 1: Primary Diagnosis
            expect(result.diagnosis).toBeDefined();
            expect(typeof result.diagnosis.primary).toBe('string');
            expect(result.diagnosis.primary.length).toBeGreaterThan(0);
            expect(typeof result.diagnosis.icd10).toBe('string');
            expect(typeof result.diagnosis.confidence).toBe('number');
            expect(result.diagnosis.confidence).toBeGreaterThanOrEqual(0);
            expect(result.diagnosis.confidence).toBeLessThanOrEqual(1);
            expect(Array.isArray(result.diagnosis.differential)).toBe(true);

            // Section 2: Etiology
            expect(result.etiology).toBeDefined();
            expect(typeof result.etiology.rootCause).toBe('string');
            expect(Array.isArray(result.etiology.contributingFactors)).toBe(true);
            expect(Array.isArray(result.etiology.riskFactors)).toBe(true);

            // Section 3: Urgency Classification
            expect(['emergency', 'urgent', 'routine', 'home-care']).toContain(result.urgency);

            // Section 4: Management Plan
            expect(result.managementPlan).toBeDefined();
            expect(Array.isArray(result.managementPlan.immediate)).toBe(true);
            expect(Array.isArray(result.managementPlan.protocol)).toBe(true);
            expect(Array.isArray(result.managementPlan.alternatives)).toBe(true);
            expect(typeof result.managementPlan.expectedOutcomes).toBe('string');
            expect(typeof result.managementPlan.duration).toBe('string');

            // Section 5: Antibiotics (optional but structure must be valid if present)
            if (result.antibiotics) {
              expect(typeof result.antibiotics.indication).toBe('string');
              expect(typeof result.antibiotics.drug).toBe('string');
              expect(typeof result.antibiotics.dosage).toBe('string');
              expect(typeof result.antibiotics.duration).toBe('string');
              expect(Array.isArray(result.antibiotics.alternatives)).toBe(true);
              expect(typeof result.antibiotics.rationale).toBe('string');
            }

            // Section 6: Follow-up Schedule
            expect(result.followUp).toBeDefined();
            expect(typeof result.followUp.initialTiming).toBe('string');
            expect(Array.isArray(result.followUp.monitoring)).toBe(true);
            expect(typeof result.followUp.longTerm).toBe('string');
            expect(Array.isArray(result.followUp.redFlags)).toBe(true);

            // Section 7: Patient Counseling
            expect(result.patientCounseling).toBeDefined();
            expect(typeof result.patientCounseling.explanation).toBe('string');
            expect(result.patientCounseling.explanation.length).toBeGreaterThan(0);
            expect(Array.isArray(result.patientCounseling.homeCare)).toBe(true);
            expect(Array.isArray(result.patientCounseling.dietary)).toBe(true);
            expect(typeof result.patientCounseling.painManagement).toBe('string');
            expect(Array.isArray(result.patientCounseling.emergencyTriggers)).toBe(true);

            // Section 8: Clinical Guidelines
            expect(result.guidelines).toBeDefined();
            expect(Array.isArray(result.guidelines.relevant)).toBe(true);
            expect(Array.isArray(result.guidelines.references)).toBe(true);
            expect(['A', 'B', 'C']).toContain(result.guidelines.evidenceLevel);

            // Processing time
            expect(typeof result.processingTime).toBe('number');
            expect(result.processingTime).toBeGreaterThan(0);
          }
        ),
        { numRuns: 20 }
      );
    });

    test('Urgency classification is always valid', async () => {
      await fc.assert(
        fc.asyncProperty(
          clinicalCaseArb,
          mockAssessmentResponseArb,
          async (caseData, mockResponse) => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
              ok: true,
              json: async () => mockResponse,
            });

            const result = await client.assessCase(caseData);

            expect(['emergency', 'urgent', 'routine', 'home-care']).toContain(result.urgency);
          }
        ),
        { numRuns: 20 }
      );
    });

    test('Evidence level is always A, B, or C', async () => {
      await fc.assert(
        fc.asyncProperty(
          clinicalCaseArb,
          mockAssessmentResponseArb,
          async (caseData, mockResponse) => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
              ok: true,
              json: async () => mockResponse,
            });

            const result = await client.assessCase(caseData);

            expect(['A', 'B', 'C']).toContain(result.guidelines.evidenceLevel);
          }
        ),
        { numRuns: 20 }
      );
    });

    test('Diagnosis confidence is always between 0 and 1', async () => {
      await fc.assert(
        fc.asyncProperty(
          clinicalCaseArb,
          mockAssessmentResponseArb,
          async (caseData, mockResponse) => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
              ok: true,
              json: async () => mockResponse,
            });

            const result = await client.assessCase(caseData);

            expect(result.diagnosis.confidence).toBeGreaterThanOrEqual(0);
            expect(result.diagnosis.confidence).toBeLessThanOrEqual(1);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Additional Invariants', () => {
    test('Processing time is always positive', async () => {
      const mockResponse = {
        success: true,
        analysis: 'Test analysis',
        processing_time: 1.5,
        model: 'dentalgemma-1.5-4b-it',
        type: 'xray_analysis',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.analyzeXray('data:image/jpeg;base64,test', 'general');

      expect(result.processingTime).toBeGreaterThan(0);
    });

    test('All array fields are actual arrays', async () => {
      const mockResponse = {
        success: true,
        analysis: 'Test analysis with findings',
        processing_time: 1.5,
        model: 'dentalgemma-1.5-4b-it',
        type: 'xray_analysis',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.analyzeXray('data:image/jpeg;base64,test', 'general');

      expect(Array.isArray(result.findings)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });
  });
});
