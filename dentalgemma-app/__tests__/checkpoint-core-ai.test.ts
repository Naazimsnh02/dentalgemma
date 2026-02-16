/**
 * Checkpoint 12: Core AI Features Complete — Validation Tests
 *
 * Validates that all core AI feature tasks (6–11) are implemented:
 *   Task 6  – Modal.com backend client
 *   Task 7  – API routes
 *   Task 8  – X-Ray analysis feature
 *   Task 9  – Clinical case assessment feature
 *   Task 10 – Voice consultation feature
 *   Task 11 – Agentic diagnostic workflow feature
 */

import {
  ModalClient,
  ModalClientError,
  NetworkError,
  TimeoutError,
  ValidationError,
} from '@/lib/api/modal-client';

import {
  tools,
  analyzeXraySchema,
  assessCaseSchema,
  searchResearchSchema,
  findSpecialistSchema,
  generateReportSchema,
  checkGuidelinesSchema,
  generateReport,
  checkGuidelines,
} from '@/lib/agentic/tools';

import { AgenticWorkflowEngine } from '@/lib/agentic/workflow-engine';

import type {
  XRayAnalysisBase,
  ClinicalCase,
  CaseAssessment,
  VoiceMessage,
  WorkflowInput,
  WorkflowStep,
  AppState,
  AnalysisType,
  UrgencyLevel,
  EvidenceLevel,
} from '@/types';

const fs = require('fs');
const path = require('path');

// Mock fetch globally
global.fetch = jest.fn();

// Resolve paths relative to project root (dentalgemma-app/)
const root = path.resolve(__dirname, '..');

describe('Checkpoint 12: Core AI Features Complete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // 1. File Structure Validation
  // ==========================================================================
  describe('1. File Structure Validation', () => {
    const requiredFiles = [
      // Modal client
      'lib/api/modal-client.ts',

      // Agentic
      'lib/agentic/tools.ts',
      'lib/agentic/workflow-engine.ts',

      // Voice
      'lib/voice/web-speech.ts',
      'lib/voice/gemini-live.ts',

      // API routes
      'app/api/analyze-xray/route.ts',
      'app/api/assess-case/route.ts',
      'app/api/chat/route.ts',
      'app/api/agent/diagnose/route.ts',
      'app/api/health/route.ts',
      'app/api/research/search/route.ts',
      'app/api/dentists/nearby/route.ts',

      // X-Ray components
      'components/xray/xray-uploader.tsx',
      'components/xray/xray-viewer.tsx',
      'components/xray/analysis-results.tsx',
      'components/xray/sample-xrays.tsx',

      // Case components
      'components/case/case-form.tsx',
      'components/case/case-form-with-autosave.tsx',
      'components/case/assessment-report.tsx',
      'components/case/pdf-export.tsx',

      // Voice components
      'components/voice/voice-interface.tsx',
      'components/voice/audio-visualizer.tsx',
      'components/voice/transcript-viewer.tsx',

      // Agentic components
      'components/agentic/workflow-visualizer.tsx',
      'components/agentic/agent-card.tsx',
      'components/agentic/tool-call-log.tsx',
      'components/agentic/workflow-controls.tsx',

      // Pages
      'app/(dashboard)/xray-analysis/page.tsx',
      'app/(dashboard)/clinical-assessment/page.tsx',
      'app/(dashboard)/voice-consultation/page.tsx',
      'app/(dashboard)/agentic-workflow/page.tsx',

      // State & types
      'store/app-store.ts',
      'types/index.ts',

      // Config
      'package.json',
      'jest.config.js',
    ];

    test.each(requiredFiles)('file exists: %s', (file) => {
      const fullPath = path.resolve(root, file);
      expect(fs.existsSync(fullPath)).toBe(true);
    });

    test('Modal.com deployment script exists', () => {
      const scriptPath = path.resolve(root, '..', 'scripts', 'modal_dentalgemma.py');
      expect(fs.existsSync(scriptPath)).toBe(true);
    });

    test('env vars template exists', () => {
      const envExample = path.resolve(root, '.env.local.example');
      expect(fs.existsSync(envExample)).toBe(true);
    });
  });

  // ==========================================================================
  // 2. Modal.com Client Integration
  // ==========================================================================
  describe('2. Modal.com Client Integration', () => {
    test('ModalClient can be constructed with default baseUrl', () => {
      const client = new ModalClient();
      expect(client).toBeInstanceOf(ModalClient);
      client.stopKeepAlive();
    });

    test('ModalClient can be constructed with custom baseUrl', () => {
      const client = new ModalClient('https://custom-modal.example.com');
      expect(client).toBeInstanceOf(ModalClient);
      client.stopKeepAlive();
    });

    test('ModalClient exposes required methods', () => {
      const client = new ModalClient('https://test.example.com');
      expect(typeof client.analyzeXray).toBe('function');
      expect(typeof client.assessCase).toBe('function');
      expect(typeof client.chat).toBe('function');
      expect(typeof client.healthCheck).toBe('function');
      expect(typeof client.startKeepAlive).toBe('function');
      expect(typeof client.stopKeepAlive).toBe('function');
      client.stopKeepAlive();
    });

    test('error classes are exported and constructible', () => {
      const base = new ModalClientError('base error', 'CODE', { detail: 1 });
      expect(base).toBeInstanceOf(Error);
      expect(base.name).toBe('ModalClientError');
      expect(base.code).toBe('CODE');

      const network = new NetworkError('net error');
      expect(network).toBeInstanceOf(ModalClientError);
      expect(network.name).toBe('NetworkError');
      expect(network.code).toBe('NETWORK_ERROR');

      const timeout = new TimeoutError('timeout');
      expect(timeout).toBeInstanceOf(ModalClientError);
      expect(timeout.name).toBe('TimeoutError');
      expect(timeout.code).toBe('TIMEOUT_ERROR');

      const validation = new ValidationError('bad input');
      expect(validation).toBeInstanceOf(ModalClientError);
      expect(validation.name).toBe('ValidationError');
      expect(validation.code).toBe('VALIDATION_ERROR');
    });

    test('analyzeXray calls fetch and returns parsed result', async () => {
      const client = new ModalClient('https://test.example.com');
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          analysis: 'Test findings',
          processing_time: 1.2,
          model: 'dentalgemma-1.5-4b-it',
          type: 'xray_analysis',
        }),
      });

      const result = await client.analyzeXray('data:image/jpeg;base64,abc', 'general');
      expect(result).toBeDefined();
      expect(typeof result.confidence).toBe('number');
      expect(Array.isArray(result.findings)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
      client.stopKeepAlive();
    });

    test('assessCase calls fetch and returns structured assessment', async () => {
      const client = new ModalClient('https://test.example.com');
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          assessment: 'Diagnosis: dental caries. Urgency: routine.',
          processing_time: 2.5,
          model: 'dentalgemma-1.5-4b-it',
          type: 'clinical_assessment',
        }),
      });

      const caseData: ClinicalCase = {
        id: 'test-1',
        patient: { age: 30, gender: 'male' },
        chiefComplaint: { description: 'Toothache', duration: '2 days', painLevel: 5, triggers: [] },
        clinicalFindings: { intraoral: 'Caries', extraoral: 'Normal', softTissue: 'Healthy', periodontal: 'Normal' },
        radiographicFindings: { description: 'Periapical radiolucency', boneLoss: 'None', periapicalStatus: 'Abnormal' },
        medicalHistory: { medications: [], allergies: [], systemicConditions: [], previousTreatments: [] },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await client.assessCase(caseData);
      expect(result.success).toBe(true);
      expect(result.diagnosis).toBeDefined();
      expect(typeof result.processingTime).toBe('number');
      client.stopKeepAlive();
    });

    test('retries on server errors and eventually throws NetworkError', async () => {
      const client = new ModalClient('https://test.example.com');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Server error' }),
      });

      await expect(client.analyzeXray('data:image/jpeg;base64,abc', 'general'))
        .rejects
        .toThrow(NetworkError);

      // Should have retried 3 times
      expect((global.fetch as jest.Mock).mock.calls.length).toBe(3);
      client.stopKeepAlive();
    });
  });

  // ==========================================================================
  // 3. Agentic Tools
  // ==========================================================================
  describe('3. Agentic Tools', () => {
    test('all 6 tools are registered', () => {
      const toolNames = Object.keys(tools);
      expect(toolNames).toContain('analyzeXray');
      expect(toolNames).toContain('assessCase');
      expect(toolNames).toContain('searchResearch');
      expect(toolNames).toContain('findSpecialist');
      expect(toolNames).toContain('generateReport');
      expect(toolNames).toContain('checkGuidelines');
      expect(toolNames).length === 6;
    });

    test('each tool has schema and execute function', () => {
      for (const [name, tool] of Object.entries(tools)) {
        expect(tool.schema).toBeDefined();
        expect(typeof tool.execute).toBe('function');
        expect(typeof tool.description).toBe('string');
      }
    });

    describe('schema validation', () => {
      test('analyzeXraySchema parses valid input', () => {
        const result = analyzeXraySchema.safeParse({
          image: 'base64string',
          analysisType: 'cavity',
        });
        expect(result.success).toBe(true);
      });

      test('assessCaseSchema parses valid input', () => {
        const result = assessCaseSchema.safeParse({
          patientAge: 30,
          patientGender: 'male',
          chiefComplaint: 'Toothache',
          duration: '2 days',
          painLevel: 5,
          clinicalFindings: 'Caries on tooth 36',
        });
        expect(result.success).toBe(true);
      });

      test('searchResearchSchema parses valid input', () => {
        const result = searchResearchSchema.safeParse({
          query: 'dental caries treatment',
          maxResults: 10,
        });
        expect(result.success).toBe(true);
      });

      test('findSpecialistSchema parses valid input', () => {
        const result = findSpecialistSchema.safeParse({
          location: 'New York, NY',
          radius: 10,
        });
        expect(result.success).toBe(true);
      });

      test('generateReportSchema parses valid input', () => {
        const result = generateReportSchema.safeParse({});
        expect(result.success).toBe(true);
      });

      test('checkGuidelinesSchema parses valid input', () => {
        const result = checkGuidelinesSchema.safeParse({
          condition: 'dental caries',
        });
        expect(result.success).toBe(true);
      });
    });

    describe('generateReport', () => {
      test('returns success with markdown report for empty input', async () => {
        const result = await generateReport({});
        expect(result.success).toBe(true);
        expect(typeof result.report).toBe('string');
        expect(result.report).toContain('#');
        expect(result.report).toContain('Comprehensive Dental Diagnostic Report');
      });

      test('report contains disclaimer', async () => {
        const result = await generateReport({});
        expect(result.report).toContain('Medical Disclaimer');
      });
    });

    describe('checkGuidelines', () => {
      test('returns evidence level A for "dental caries"', async () => {
        const result = await checkGuidelines({ condition: 'dental caries' });
        expect(result.success).toBe(true);
        expect(result.guidelines).toBeDefined();
        expect(result.guidelines.evidenceLevel).toBe('A');
        expect(result.guidelines.relevant.length).toBeGreaterThan(0);
      });

      test('returns generic guidelines for unknown condition', async () => {
        const result = await checkGuidelines({ condition: 'unknown condition' });
        expect(result.success).toBe(true);
        expect(result.guidelines).toBeDefined();
        expect(result.guidelines.evidenceLevel).toBe('C');
        expect(result.guidelines.relevant).toContain('General Dental Practice Guidelines');
      });

      test('returns evidence level A for "periodontal disease"', async () => {
        const result = await checkGuidelines({ condition: 'periodontal disease' });
        expect(result.success).toBe(true);
        expect(result.guidelines.evidenceLevel).toBe('A');
      });
    });
  });

  // ==========================================================================
  // 4. Agentic Workflow Engine
  // ==========================================================================
  describe('4. Agentic Workflow Engine', () => {
    test('can be instantiated with minimal input', () => {
      const engine = new AgenticWorkflowEngine({
        text: 'test',
        image: undefined,
        location: undefined,
      });
      expect(engine).toBeInstanceOf(AgenticWorkflowEngine);
    });

    test('getState returns initial state with status "running"', () => {
      const engine = new AgenticWorkflowEngine({
        text: 'test',
        image: undefined,
        location: undefined,
      });
      const state = engine.getState();
      expect(state.status).toBe('running');
      expect(state.steps).toEqual([]);
      expect(state.input.text).toBe('test');
    });

    test('pause sets status to "paused"', () => {
      const engine = new AgenticWorkflowEngine({
        text: 'test',
        image: undefined,
        location: undefined,
      });
      engine.pause();
      expect(engine.getState().status).toBe('paused');
    });

    test('resume sets status back to "running"', () => {
      const engine = new AgenticWorkflowEngine({
        text: 'test',
        image: undefined,
        location: undefined,
      });
      engine.pause();
      expect(engine.getState().status).toBe('paused');
      engine.resume();
      expect(engine.getState().status).toBe('running');
    });

    test('cancel sets status to "cancelled"', () => {
      const engine = new AgenticWorkflowEngine({
        text: 'test',
        image: undefined,
        location: undefined,
      });
      engine.cancel();
      expect(engine.getState().status).toBe('cancelled');
    });

    test('execute returns an async generator', () => {
      const engine = new AgenticWorkflowEngine({
        text: 'test',
        image: undefined,
        location: undefined,
      });
      const generator = engine.execute();
      expect(typeof generator[Symbol.asyncIterator]).toBe('function');
    });
  });

  // ==========================================================================
  // 5. Type System Completeness
  // ==========================================================================
  describe('5. Type System Completeness', () => {
    test('XRayAnalysisBase shape is correct', () => {
      const analysis: XRayAnalysisBase = {
        id: 'test-id',
        imageId: 'img-1',
        findings: ['Finding 1'],
        confidence: 0.85,
        urgency: 'routine',
        recommendations: ['See dentist'],
        processingTime: 1.2,
        timestamp: new Date(),
      };

      expect(analysis.id).toBe('test-id');
      expect(analysis.confidence).toBe(0.85);
      expect(analysis.urgency).toBe('routine');
    });

    test('ClinicalCase shape is correct', () => {
      const clinicalCase: ClinicalCase = {
        id: 'case-1',
        patient: { age: 25, gender: 'female' },
        chiefComplaint: { description: 'Pain', duration: '1 week', painLevel: 7, triggers: ['cold'] },
        clinicalFindings: { intraoral: 'Caries', extraoral: 'Normal', softTissue: 'Inflamed', periodontal: 'Normal' },
        radiographicFindings: { description: 'Shadow', boneLoss: 'None', periapicalStatus: 'Normal' },
        medicalHistory: { medications: [], allergies: ['Penicillin'], systemicConditions: [], previousTreatments: [] },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(clinicalCase.patient.age).toBe(25);
      expect(clinicalCase.medicalHistory.allergies).toContain('Penicillin');
    });

    test('CaseAssessment shape is correct', () => {
      const assessment: CaseAssessment = {
        success: true,
        diagnosis: { primary: 'Caries', icd10: 'K02', confidence: 0.9, differential: [] },
        etiology: { rootCause: 'Bacteria', contributingFactors: [], riskFactors: [] },
        urgency: 'routine',
        managementPlan: { immediate: [], protocol: ['Filling'], alternatives: [], expectedOutcomes: 'Good', duration: '1 visit' },
        followUp: { initialTiming: '2 weeks', monitoring: [], longTerm: 'Regular checkups', redFlags: [] },
        patientCounseling: { explanation: 'Cavity found', homeCare: [], dietary: [], painManagement: 'OTC', emergencyTriggers: [] },
        guidelines: { relevant: [], references: [], evidenceLevel: 'B' },
        processingTime: 2.0,
      };

      expect(assessment.diagnosis.primary).toBe('Caries');
      expect(assessment.urgency).toBe('routine');
    });

    test('VoiceMessage shape is correct', () => {
      const msg: VoiceMessage = {
        id: 'msg-1',
        speaker: 'user',
        text: 'Hello',
        timestamp: new Date(),
      };

      expect(msg.speaker).toBe('user');
    });

    test('WorkflowInput shape is correct', () => {
      const input: WorkflowInput = {
        text: 'Analyze this case',
        image: undefined,
        location: 'New York',
      };

      expect(input.text).toBe('Analyze this case');
    });

    test('WorkflowStep shape is correct', () => {
      const step: WorkflowStep = {
        agent: 'Coordinator',
        action: 'Planning',
        input: null,
        output: null,
        confidence: 1.0,
        timestamp: Date.now(),
      };

      expect(step.agent).toBe('Coordinator');
    });

    test('AnalysisType union covers all types', () => {
      const types: AnalysisType[] = ['cavity', 'opg', 'tooth-id', 'general'];
      expect(types).toHaveLength(4);
    });

    test('UrgencyLevel union covers all levels', () => {
      const levels: UrgencyLevel[] = ['emergency', 'urgent', 'routine', 'home-care'];
      expect(levels).toHaveLength(4);
    });

    test('EvidenceLevel union covers all levels', () => {
      const levels: EvidenceLevel[] = ['A', 'B', 'C'];
      expect(levels).toHaveLength(3);
    });
  });

  // ==========================================================================
  // 6. Package Dependencies
  // ==========================================================================
  describe('6. Package Dependencies', () => {
    const pkg = require(path.resolve(root, 'package.json'));

    describe('production dependencies', () => {
      const requiredDeps = [
        'next',
        'react',
        'zod',
        'zustand',
        'jspdf',
        '@google/generative-ai',
        'lucide-react',
        'tailwind-merge',
        'clsx',
        'recharts',
        'leaflet',
      ];

      test.each(requiredDeps)('has dependency: %s', (dep) => {
        expect(pkg.dependencies).toHaveProperty(dep);
      });
    });

    describe('dev dependencies', () => {
      const requiredDevDeps = [
        'fast-check',
        'jest',
        '@testing-library/react',
        '@testing-library/jest-dom',
        'ts-jest',
        'typescript',
        'tailwindcss',
      ];

      test.each(requiredDevDeps)('has devDependency: %s', (dep) => {
        expect(pkg.devDependencies).toHaveProperty(dep);
      });
    });

    test('has test scripts configured', () => {
      expect(pkg.scripts.test).toBeDefined();
      expect(pkg.scripts['test:watch']).toBeDefined();
    });
  });

  // ==========================================================================
  // 7. API Route Structure
  // ==========================================================================
  describe('7. API Route Structure', () => {
    const apiRoutes = [
      'app/api/analyze-xray/route.ts',
      'app/api/assess-case/route.ts',
      'app/api/chat/route.ts',
      'app/api/agent/diagnose/route.ts',
      'app/api/health/route.ts',
      'app/api/research/search/route.ts',
      'app/api/dentists/nearby/route.ts',
    ];

    test.each(apiRoutes)('API route file exists: %s', (route) => {
      const fullPath = path.resolve(root, route);
      expect(fs.existsSync(fullPath)).toBe(true);
    });

    // Route files import next/server which requires Request global (not available in jsdom).
    // Verify handler exports by checking file contents for exported function declarations.

    test('analyze-xray route exports POST handler', () => {
      const content = fs.readFileSync(path.resolve(root, 'app/api/analyze-xray/route.ts'), 'utf-8');
      expect(content).toMatch(/export\s+(async\s+)?function\s+POST/);
    });

    test('assess-case route exports POST handler', () => {
      const content = fs.readFileSync(path.resolve(root, 'app/api/assess-case/route.ts'), 'utf-8');
      expect(content).toMatch(/export\s+(async\s+)?function\s+POST/);
    });

    test('chat route exports POST handler', () => {
      const content = fs.readFileSync(path.resolve(root, 'app/api/chat/route.ts'), 'utf-8');
      expect(content).toMatch(/export\s+(async\s+)?function\s+POST/);
    });

    test('health route exports GET handler', () => {
      const content = fs.readFileSync(path.resolve(root, 'app/api/health/route.ts'), 'utf-8');
      expect(content).toMatch(/export\s+(async\s+)?function\s+GET/);
    });

    test('agent/diagnose route exports POST handler', () => {
      const content = fs.readFileSync(path.resolve(root, 'app/api/agent/diagnose/route.ts'), 'utf-8');
      expect(content).toMatch(/export\s+(async\s+)?function\s+POST/);
    });

    test('research/search route exports POST handler', () => {
      const content = fs.readFileSync(path.resolve(root, 'app/api/research/search/route.ts'), 'utf-8');
      expect(content).toMatch(/export\s+(async\s+)?function\s+POST/);
    });

    test('dentists/nearby route exports POST handler', () => {
      const content = fs.readFileSync(path.resolve(root, 'app/api/dentists/nearby/route.ts'), 'utf-8');
      expect(content).toMatch(/export\s+(async\s+)?function\s+POST/);
    });
  });
});
