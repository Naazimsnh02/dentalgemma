/**
 * Agentic Workflow Engine
 * 
 * Multi-agent diagnostic workflow orchestration
 * Uses a simplified agent pattern (Vercel AI SDK 6 would be used in production)
 * Requirements: 4.1-4.6
 */

import type { WorkflowInput, WorkflowStep, WorkflowResult } from '@/types';
import {
  analyzeXray,
  assessCase,
  searchResearch,
  findSpecialist,
  generateReport,
  checkGuidelines,
  type AnalyzeXrayInput,
  type AssessCaseInput,
  type SearchResearchInput,
  type FindSpecialistInput,
  type GenerateReportInput,
  type CheckGuidelinesInput,
} from './tools';

// ============================================================================
// Agent Definitions
// ============================================================================

/**
 * Agent types in the workflow
 */
export type AgentType =
  | 'Coordinator'
  | 'X-Ray Analyzer'
  | 'Clinical Assessor'
  | 'Research Synthesizer'
  | 'Referral Agent'
  | 'Report Generator';

/**
 * Workflow state
 */
interface WorkflowState {
  input: WorkflowInput;
  steps: WorkflowStep[];
  xrayAnalysis?: any;
  caseAssessment?: any;
  researchPapers?: any[];
  specialists?: any[];
  finalReport?: string;
  status: 'running' | 'paused' | 'completed' | 'cancelled' | 'error';
  error?: string;
}

// ============================================================================
// Workflow Engine Class
// ============================================================================

export class AgenticWorkflowEngine {
  private state: WorkflowState;
  private pauseRequested = false;
  private cancelRequested = false;

  constructor(input: WorkflowInput) {
    this.state = {
      input,
      steps: [],
      status: 'running',
    };
  }

  /**
   * Execute the complete workflow
   */
  async *execute(): AsyncGenerator<WorkflowStep, WorkflowResult> {
    try {
      // Step 1: Coordinator Agent - Analyze input and plan workflow
      yield* this.coordinatorAgent();

      // Step 2: X-Ray Analyzer Agent (if image present)
      if (this.state.input.image) {
        yield* this.xrayAnalyzerAgent();
      }

      // Step 3: Clinical Assessor Agent (if text present)
      if (this.state.input.text) {
        yield* this.clinicalAssessorAgent();
      }

      // Step 4: Research Synthesizer Agent
      yield* this.researchSynthesizerAgent();

      // Step 5: Referral Agent (if location present or specialist needed)
      if (this.state.input.location || this.needsSpecialist()) {
        yield* this.referralAgent();
      }

      // Step 6: Report Generator Agent
      yield* this.reportGeneratorAgent();

      // Mark workflow as completed
      this.state.status = 'completed';

      // Return final result
      return {
        steps: this.state.steps,
        finalReport: this.state.finalReport || '',
        recommendations: this.extractRecommendations(),
        referrals: this.state.specialists,
        research: this.state.researchPapers,
      };
    } catch (error) {
      this.state.status = 'error';
      this.state.error = (error as Error).message;
      throw error;
    }
  }

  /**
   * Pause the workflow
   */
  pause() {
    this.pauseRequested = true;
    this.state.status = 'paused';
  }

  /**
   * Resume the workflow
   */
  resume() {
    this.pauseRequested = false;
    this.state.status = 'running';
  }

  /**
   * Cancel the workflow
   */
  cancel() {
    this.cancelRequested = true;
    this.state.status = 'cancelled';
  }

  /**
   * Get current workflow state
   */
  getState(): WorkflowState {
    return { ...this.state };
  }

  // ==========================================================================
  // Agent Implementations
  // ==========================================================================

  /**
   * Coordinator Agent - Analyzes input and determines workflow steps
   */
  private async *coordinatorAgent(): AsyncGenerator<WorkflowStep> {
    const step: WorkflowStep = {
      agent: 'Coordinator',
      action: 'Analyzing input and planning workflow',
      tool: undefined,
      input: this.state.input,
      output: null,
      confidence: 1.0,
      timestamp: Date.now(),
    };

    // Analyze input to determine required steps
    const plan = {
      hasImage: !!this.state.input.image,
      hasText: !!this.state.input.text,
      hasLocation: !!this.state.input.location,
      requiredAgents: [] as string[],
    };

    if (plan.hasImage) {
      plan.requiredAgents.push('X-Ray Analyzer');
    }
    if (plan.hasText) {
      plan.requiredAgents.push('Clinical Assessor');
    }
    plan.requiredAgents.push('Research Synthesizer');
    if (plan.hasLocation) {
      plan.requiredAgents.push('Referral Agent');
    }
    plan.requiredAgents.push('Report Generator');

    step.output = {
      plan,
      message: `Workflow planned: ${plan.requiredAgents.length} agents will execute`,
    };

    this.state.steps.push(step);
    yield step;

    await this.checkPauseOrCancel();
  }

  /**
   * X-Ray Analyzer Agent - Analyzes dental X-ray images
   */
  private async *xrayAnalyzerAgent(): AsyncGenerator<WorkflowStep> {
    const step: WorkflowStep = {
      agent: 'X-Ray Analyzer',
      action: 'Analyzing X-ray image',
      tool: 'analyzeXray',
      input: null,
      output: null,
      confidence: 0,
      timestamp: Date.now(),
    };

    try {
      // Determine analysis type from input text
      const analysisType = this.determineAnalysisType(this.state.input.text);

      const toolInput: AnalyzeXrayInput = {
        image: await this.convertImageToBase64(this.state.input.image!),
        analysisType,
      };

      step.input = toolInput;

      // Execute tool
      const result = await analyzeXray(toolInput);

      if (result.success && result.analysis) {
        this.state.xrayAnalysis = result.analysis;
        step.output = result;
        step.confidence = result.analysis.confidence;
      } else {
        step.output = result;
        step.confidence = 0;
      }

      this.state.steps.push(step);
      yield step;

      await this.checkPauseOrCancel();
    } catch (error) {
      step.output = { error: (error as Error).message };
      step.confidence = 0;
      this.state.steps.push(step);
      yield step;
    }
  }

  /**
   * Clinical Assessor Agent - Assesses clinical cases
   */
  private async *clinicalAssessorAgent(): AsyncGenerator<WorkflowStep> {
    const step: WorkflowStep = {
      agent: 'Clinical Assessor',
      action: 'Assessing clinical case',
      tool: 'assessCase',
      input: null,
      output: null,
      confidence: 0,
      timestamp: Date.now(),
    };

    try {
      // Parse clinical information from text
      const clinicalData = this.parseClinicalData(this.state.input.text);

      const toolInput: AssessCaseInput = {
        patientAge: clinicalData.age || 30,
        patientGender: clinicalData.gender || 'other',
        chiefComplaint: clinicalData.complaint || this.state.input.text,
        duration: clinicalData.duration || 'Unknown',
        painLevel: clinicalData.painLevel || 5,
        clinicalFindings: clinicalData.findings || this.state.input.text,
        radiographicFindings: this.state.xrayAnalysis
          ? `X-ray findings: ${this.state.xrayAnalysis.findings.join(', ')}`
          : undefined,
        medicalHistory: clinicalData.history,
      };

      step.input = toolInput;

      // Execute tool
      const result = await assessCase(toolInput);

      if (result.success && result.assessment) {
        this.state.caseAssessment = result.assessment;
        step.output = result;
        step.confidence = 0.95; // High confidence on successful clinical assessment
      } else {
        step.output = result;
        step.confidence = 0;
      }

      this.state.steps.push(step);
      yield step;

      await this.checkPauseOrCancel();
    } catch (error) {
      step.output = { error: (error as Error).message };
      step.confidence = 0;
      this.state.steps.push(step);
      yield step;
    }
  }

  /**
   * Research Synthesizer Agent - Searches relevant research
   */
  private async *researchSynthesizerAgent(): AsyncGenerator<WorkflowStep> {
    const step: WorkflowStep = {
      agent: 'Research Synthesizer',
      action: 'Searching relevant research',
      tool: 'searchResearch',
      input: null,
      output: null,
      confidence: 0,
      timestamp: Date.now(),
    };

    try {
      // Determine search query from diagnosis or input
      const query = this.state.caseAssessment
        ? this.state.caseAssessment.diagnosis.primary
        : this.extractKeyTerms(this.state.input.text);

      const toolInput: SearchResearchInput = {
        query,
        maxResults: 5,
        dateRange: '5-years',
      };

      step.input = toolInput;

      // Execute tool
      const result = await searchResearch(toolInput);

      if (result.success && result.papers) {
        this.state.researchPapers = result.papers;
        step.output = result;
        step.confidence = 0.8;
      } else {
        step.output = result;
        step.confidence = 0;
      }

      this.state.steps.push(step);
      yield step;

      await this.checkPauseOrCancel();
    } catch (error) {
      step.output = { error: (error as Error).message };
      step.confidence = 0;
      this.state.steps.push(step);
      yield step;
    }
  }

  /**
   * Referral Agent - Finds nearby specialists
   */
  private async *referralAgent(): AsyncGenerator<WorkflowStep> {
    const step: WorkflowStep = {
      agent: 'Referral Agent',
      action: 'Finding nearby specialists',
      tool: 'findSpecialist',
      input: null,
      output: null,
      confidence: 0,
      timestamp: Date.now(),
    };

    try {
      // Determine specialty from diagnosis
      const specialty = this.determineSpecialty();

      const toolInput: FindSpecialistInput = {
        location: this.state.input.location || 'New York, NY',
        specialty,
        radius: 10,
        rating: 4.0,
      };

      step.input = toolInput;

      // Execute tool
      const result = await findSpecialist(toolInput);

      if (result.success && result.specialists) {
        this.state.specialists = result.specialists;
        step.output = result;
        step.confidence = 0.9;
      } else {
        step.output = result;
        step.confidence = 0;
      }

      this.state.steps.push(step);
      yield step;

      await this.checkPauseOrCancel();
    } catch (error) {
      step.output = { error: (error as Error).message };
      step.confidence = 0;
      this.state.steps.push(step);
      yield step;
    }
  }

  /**
   * Report Generator Agent - Generates comprehensive report
   */
  private async *reportGeneratorAgent(): AsyncGenerator<WorkflowStep> {
    const step: WorkflowStep = {
      agent: 'Report Generator',
      action: 'Generating comprehensive report',
      tool: 'generateReport',
      input: null,
      output: null,
      confidence: 0,
      timestamp: Date.now(),
    };

    try {
      const toolInput: GenerateReportInput = {
        xrayAnalysis: this.state.xrayAnalysis,
        caseAssessment: this.state.caseAssessment,
        researchPapers: this.state.researchPapers,
        specialists: this.state.specialists,
        additionalNotes: `Workflow completed with ${this.state.steps.length} steps.`,
      };

      step.input = toolInput;

      // Execute tool
      const result = await generateReport(toolInput);

      if (result.success && result.report) {
        this.state.finalReport = result.report;
        step.output = result;
        step.confidence = 1.0;
      } else {
        step.output = result;
        step.confidence = 0;
      }

      this.state.steps.push(step);
      yield step;

      await this.checkPauseOrCancel();
    } catch (error) {
      step.output = { error: (error as Error).message };
      step.confidence = 0;
      this.state.steps.push(step);
      yield step;
    }
  }

  // ==========================================================================
  // Helper Methods
  // ==========================================================================

  /**
   * Check if workflow should pause or cancel
   */
  private async checkPauseOrCancel() {
    if (this.cancelRequested) {
      throw new Error('Workflow cancelled by user');
    }

    while (this.pauseRequested) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * Determine if specialist referral is needed
   */
  private needsSpecialist(): boolean {
    if (!this.state.caseAssessment) return false;

    const urgency = this.state.caseAssessment.urgency;
    return urgency === 'emergency' || urgency === 'urgent';
  }

  /**
   * Extract recommendations from all analyses
   */
  private extractRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.state.xrayAnalysis?.recommendations) {
      recommendations.push(...this.state.xrayAnalysis.recommendations);
    }

    if (this.state.caseAssessment?.managementPlan?.protocol) {
      recommendations.push(...this.state.caseAssessment.managementPlan.protocol);
    }

    return recommendations;
  }

  /**
   * Determine X-ray analysis type from text
   */
  private determineAnalysisType(text: string): 'photo' | 'xray' {
    const lowerText = text.toLowerCase();

    // Check for clinical photo indicators
    if (
      lowerText.includes('photograph') ||
      lowerText.includes('clinical photo') ||
      lowerText.includes('intraoral photo') ||
      lowerText.includes('picture of teeth')
    ) {
      return 'photo';
    }

    // Default to X-ray for radiographs
    return 'xray';
  }

  /**
   * Convert File to base64
   */
  private async convertImageToBase64(image: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(image);
    });
  }

  /**
   * Parse clinical data from text
   */
  private parseClinicalData(text: string): {
    age?: number;
    gender?: 'male' | 'female' | 'other';
    complaint?: string;
    duration?: string;
    painLevel?: number;
    findings?: string;
    history?: string;
  } {
    const data: any = {};

    // Extract age
    const ageMatch = text.match(/(\d+)\s*(?:year|yr|y\.o\.|years old)/i);
    if (ageMatch) {
      data.age = parseInt(ageMatch[1]);
    }

    // Extract gender
    if (text.match(/\b(male|man|boy)\b/i)) {
      data.gender = 'male';
    } else if (text.match(/\b(female|woman|girl)\b/i)) {
      data.gender = 'female';
    }

    // Extract pain level
    const painMatch = text.match(/pain\s*(?:level|score)?[:\s]*(\d+)(?:\/10)?/i);
    if (painMatch) {
      data.painLevel = parseInt(painMatch[1]);
    }

    // Extract duration
    const durationMatch = text.match(/(?:for|since|past)\s+(\d+\s+(?:day|week|month|year)s?)/i);
    if (durationMatch) {
      data.duration = durationMatch[1];
    }

    return data;
  }

  /**
   * Extract key terms for research query
   */
  private extractKeyTerms(text: string): string {
    // Simple keyword extraction - in production, use NLP
    const keywords = [
      'cavity',
      'caries',
      'periodontal',
      'endodontic',
      'orthodontic',
      'implant',
      'extraction',
      'root canal',
      'crown',
      'bridge',
    ];

    for (const keyword of keywords) {
      if (text.toLowerCase().includes(keyword)) {
        return keyword;
      }
    }

    return 'dental diagnosis';
  }

  /**
   * Determine specialty from diagnosis
   */
  private determineSpecialty(): string | undefined {
    if (!this.state.caseAssessment) return undefined;

    const diagnosis = this.state.caseAssessment.diagnosis.primary.toLowerCase();

    if (diagnosis.includes('ortho')) return 'Orthodontics';
    if (diagnosis.includes('endo') || diagnosis.includes('root canal')) return 'Endodontics';
    if (diagnosis.includes('perio') || diagnosis.includes('gum')) return 'Periodontics';
    if (diagnosis.includes('surgery') || diagnosis.includes('extraction')) return 'Oral Surgery';
    if (diagnosis.includes('child') || diagnosis.includes('pediatric')) return 'Pediatric';
    if (diagnosis.includes('prosth') || diagnosis.includes('crown') || diagnosis.includes('bridge'))
      return 'Prosthodontics';
    if (diagnosis.includes('cosmetic') || diagnosis.includes('whitening')) return 'Cosmetic';

    return undefined; // General dentistry
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a new workflow engine instance
 */
export function createWorkflowEngine(input: WorkflowInput): AgenticWorkflowEngine {
  return new AgenticWorkflowEngine(input);
}
