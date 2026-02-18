/**
 * Modal.com Cloud Inference Client
 * 
 * Handles communication with DentalGemma model deployed on Modal.com
 * Features:
 * - Exponential backoff retry (max 3 attempts)
 * - Keep-alive ping mechanism (every 5 minutes)
 * - Comprehensive error handling
 * - Type-safe API calls
 */

import type {
  AnalysisType,
  XRayAnalysis,
  CaseAssessment,
  ClinicalCase,
  VoiceMessage,
  AnalyzeXRayResponse,
  AssessCaseResponse,
  ChatResponse,
  UrgencyLevel,
} from '@/types';

// Configuration
const MODAL_BASE_URL = process.env.NEXT_PUBLIC_MODAL_BASE_URL || '';
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const KEEP_ALIVE_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Error types
export class ModalClientError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ModalClientError';
  }
}

export class NetworkError extends ModalClientError {
  constructor(message: string, details?: any) {
    super(message, 'NETWORK_ERROR', details);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends ModalClientError {
  constructor(message: string, details?: any) {
    super(message, 'TIMEOUT_ERROR', details);
    this.name = 'TimeoutError';
  }
}

export class ValidationError extends ModalClientError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay
 */
const getRetryDelay = (attempt: number): number => {
  return INITIAL_RETRY_DELAY * Math.pow(2, attempt);
};

/**
 * Convert File or base64 string to base64
 */
const toBase64 = async (input: File | string): Promise<string> => {
  if (typeof input === 'string') {
    // Already base64 or data URL
    if (input.startsWith('data:')) {
      return input.split(',')[1];
    }
    return input;
  }

  // Convert File to base64
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(input);
  });
};

/**
 * Make HTTP request with retry logic
 */
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ModalClientError(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          `HTTP_${response.status}`,
          errorData
        );
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new ModalClientError(
          data.error || 'Request failed',
          data.code,
          data.details
        );
      }

      return data as T;
    } catch (error) {
      lastError = error as Error;

      // Don't retry on validation errors
      if (error instanceof ValidationError) {
        throw error;
      }

      // Don't retry on 4xx errors (except 429 rate limit)
      if (error instanceof ModalClientError && error.code?.startsWith('HTTP_4')) {
        if (error.code !== 'HTTP_429') {
          throw error;
        }
      }

      // If this was the last attempt, throw the error
      if (attempt === retries - 1) {
        throw new NetworkError(
          `Failed after ${retries} attempts: ${lastError.message}`,
          { originalError: lastError }
        );
      }

      // Wait before retrying with exponential backoff
      const delay = getRetryDelay(attempt);
      console.warn(`Retry attempt ${attempt + 1}/${retries} after ${delay}ms...`);
      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Unknown error');
}

/**
 * Keep-alive ping manager
 */
class KeepAliveManager {
  private intervalId: NodeJS.Timeout | null = null;
  private isActive = false;

  start() {
    if (this.isActive) return;

    this.isActive = true;
    this.intervalId = setInterval(async () => {
      try {
        await this.ping();
      } catch (error) {
        console.error('Keep-alive ping failed:', error);
      }
    }, KEEP_ALIVE_INTERVAL);

    console.log('Keep-alive pings started (every 5 minutes)');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isActive = false;
    console.log('Keep-alive pings stopped');
  }

  private async ping() {
    if (!MODAL_BASE_URL) return;

    try {
      // Modal creates separate URLs for each function: baseUrl-functionname.modal.run
      const response = await fetch(`${MODAL_BASE_URL}-health.modal.run`, {
        method: 'GET',
      });
      
      if (response.ok) {
        console.log('Keep-alive ping successful');
      }
    } catch (error) {
      // Silently fail - this is just a keep-alive
      console.debug('Keep-alive ping failed:', error);
    }
  }
}

// Global keep-alive manager instance
const keepAliveManager = new KeepAliveManager();

/**
 * Modal.com Client Class
 */
export class ModalClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || MODAL_BASE_URL;

    if (!this.baseUrl) {
      console.warn('NEXT_PUBLIC_MODAL_BASE_URL not set. Modal client will not work.');
    }
  }

  /**
   * Start keep-alive pings to maintain warm containers
   */
  startKeepAlive() {
    keepAliveManager.start();
  }

  /**
   * Stop keep-alive pings
   */
  stopKeepAlive() {
    keepAliveManager.stop();
  }

  /**
   * Analyze X-ray image
   */
  async analyzeXray(
    image: File | string,
    analysisType: AnalysisType
  ): Promise<XRayAnalysis> {
    if (!this.baseUrl) {
      throw new ModalClientError(
        'Modal.com base URL not configured',
        'CONFIG_ERROR'
      );
    }

    const startTime = Date.now();

    try {
      // Convert image to base64
      const base64Image = await toBase64(image);

      // Determine the question based on analysis type
      const questions: Record<AnalysisType, string> = {
        cavity: 'Analyze this dental X-ray for cavities. Provide cavity count (0, 1, 2, or 3+), classification (normal or cavity), and confidence scores.',
        opg: 'Classify this OPG (panoramic) X-ray into one of these categories: Healthy, Caries, Impacted, BDC-BDR, Infection, or Fractured. Provide detailed findings.',
        'tooth-id': 'Identify and count all teeth in this X-ray. Provide total tooth count and classify each tooth type.',
        general: 'Provide a comprehensive systematic evaluation of this dental X-ray. Include quality assessment and all clinical findings.',
      };

      const question = questions[analysisType];

      // Make API request
      // Modal creates separate URLs for each function: baseUrl-functionname.modal.run
      const response = await fetchWithRetry<AnalyzeXRayResponse>(
        `${this.baseUrl}-analyze-xray.modal.run`,
        {
          method: 'POST',
          body: JSON.stringify({
            image: base64Image,
            question,
            max_tokens: 512,
          }),
        }
      );

      // Parse response into structured format
      const processingTime = Math.max(Date.now() - startTime, 1); // Ensure at least 1ms

      // Create base analysis object
      const baseAnalysis = {
        id: crypto.randomUUID(),
        imageId: crypto.randomUUID(),
        findings: this.extractFindings(response.analysis),
        confidence: this.extractConfidence(response.analysis),
        urgency: this.determineUrgency(response.analysis, analysisType),
        recommendations: this.extractRecommendations(response.analysis),
        processingTime,
        timestamp: new Date(),
      };

      // Return type-specific analysis
      return this.createTypedAnalysis(analysisType, baseAnalysis, response.analysis);
    } catch (error) {
      if (error instanceof ModalClientError) {
        throw error;
      }
      throw new ModalClientError(
        `X-ray analysis failed: ${(error as Error).message}`,
        'ANALYSIS_ERROR',
        { error }
      );
    }
  }

  /**
   * Assess clinical case
   */
  async assessCase(caseData: ClinicalCase): Promise<CaseAssessment> {
    if (!this.baseUrl) {
      throw new ModalClientError(
        'Modal.com base URL not configured',
        'CONFIG_ERROR'
      );
    }

    const startTime = Date.now();

    try {
      // Make API request
      // Modal creates separate URLs for each function: baseUrl-functionname.modal.run
      const response = await fetchWithRetry<AssessCaseResponse>(
        `${this.baseUrl}-assess-case.modal.run`,
        {
          method: 'POST',
          body: JSON.stringify({
            patient: {
              age: caseData.patient.age,
              gender: caseData.patient.gender,
            },
            chief_complaint: caseData.chiefComplaint.description,
            clinical_findings: `Intraoral: ${caseData.clinicalFindings.intraoral}\nExtraoral: ${caseData.clinicalFindings.extraoral}\nSoft Tissue: ${caseData.clinicalFindings.softTissue}\nPeriodontal: ${caseData.clinicalFindings.periodontal}`,
            radiographic_findings: caseData.radiographicFindings.description,
            medical_history: `Medications: ${caseData.medicalHistory.medications.join(', ')}\nAllergies: ${caseData.medicalHistory.allergies.join(', ')}\nConditions: ${caseData.medicalHistory.systemicConditions.join(', ')}`,
            max_tokens: 1024,
          }),
        }
      );

      const processingTime = Math.max(Date.now() - startTime, 1); // Ensure at least 1ms

      // Prefer structured JSON from backend; fall back to text parsing
      if ((response as any).case_assessment) {
        const ca = (response as any).case_assessment;
        return {
          success: true,
          diagnosis: {
            primary: ca.diagnosis?.primary || 'Diagnosis pending',
            icd10: ca.diagnosis?.icd10 || 'K00-K14',
            confidence: ca.diagnosis?.confidence || 0.8,
            differential: ca.diagnosis?.differential || [],
          },
          etiology: {
            rootCause: ca.etiology?.rootCause || 'To be determined',
            contributingFactors: ca.etiology?.contributingFactors || [],
            riskFactors: ca.etiology?.riskFactors || [],
          },
          urgency: ca.urgency || 'routine',
          managementPlan: {
            immediate: ca.managementPlan?.immediate || [],
            protocol: ca.managementPlan?.protocol || [],
            alternatives: ca.managementPlan?.alternatives || [],
            expectedOutcomes: ca.managementPlan?.expectedOutcomes || 'Favorable with proper treatment',
            duration: ca.managementPlan?.duration || 'Variable',
          },
          followUp: {
            initialTiming: ca.followUp?.initialTiming || '1-2 weeks',
            monitoring: ca.followUp?.monitoring || [],
            longTerm: ca.followUp?.longTerm || 'Regular dental checkups',
            redFlags: ca.followUp?.redFlags || [],
          },
          patientCounseling: {
            explanation: ca.patientCounseling?.explanation || '',
            homeCare: ca.patientCounseling?.homeCare || [],
            dietary: ca.patientCounseling?.dietary || [],
            painManagement: ca.patientCounseling?.painManagement || 'As directed by dentist',
            emergencyTriggers: ca.patientCounseling?.emergencyTriggers || [],
          },
          guidelines: {
            relevant: ca.guidelines?.relevant || [],
            references: ca.guidelines?.references || [],
            evidenceLevel: ca.guidelines?.evidenceLevel || 'B',
          },
          processingTime,
        };
      }

      // Fallback: parse free-form text (legacy)
      return this.parseAssessment(response.assessment, processingTime);
    } catch (error) {
      if (error instanceof ModalClientError) {
        throw error;
      }
      throw new ModalClientError(
        `Case assessment failed: ${(error as Error).message}`,
        'ASSESSMENT_ERROR',
        { error }
      );
    }
  }

  /**
   * Chat with the model (for voice consultation)
   */
  async chat(message: string, history?: VoiceMessage[]): Promise<string> {
    if (!this.baseUrl) {
      throw new ModalClientError(
        'Modal.com base URL not configured',
        'CONFIG_ERROR'
      );
    }

    try {
      // Convert history to API format
      const formattedHistory = history?.map(msg => ({
        role: msg.speaker === 'user' ? 'user' : 'assistant',
        content: msg.text,
      })) || [];

      // Make API request
      // Modal creates separate URLs for each function: baseUrl-functionname.modal.run
      const response = await fetchWithRetry<ChatResponse>(
        `${this.baseUrl}-chat.modal.run`,
        {
          method: 'POST',
          body: JSON.stringify({
            message,
            history: formattedHistory,
            max_tokens: 512,
          }),
        }
      );

      return response.message || (response as any).response || '';
    } catch (error) {
      if (error instanceof ModalClientError) {
        throw error;
      }
      throw new ModalClientError(
        `Chat failed: ${(error as Error).message}`,
        'CHAT_ERROR',
        { error }
      );
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; model: string }> {
    if (!this.baseUrl) {
      throw new ModalClientError(
        'Modal.com base URL not configured',
        'CONFIG_ERROR'
      );
    }

    try {
      // Modal creates separate URLs for each function: baseUrl-functionname.modal.run
      const response = await fetch(`${this.baseUrl}-health.modal.run`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new ModalClientError(
          `Health check failed: ${response.statusText}`,
          `HTTP_${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ModalClientError) {
        throw error;
      }
      throw new ModalClientError(
        `Health check failed: ${(error as Error).message}`,
        'HEALTH_CHECK_ERROR',
        { error }
      );
    }
  }

  // Helper methods for parsing responses

  private extractFindings(text: string): string[] {
    // If the text contains markdown headers, preserve the structure
    if (text.includes('##') || text.includes('###')) {
      return [text.trim()];
    }

    // Extract bullet points or numbered lists
    const findings: string[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^[-*•]\s+/) || trimmed.match(/^\d+\.\s+/)) {
        findings.push(trimmed.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, ''));
      }
    }

    return findings.length > 0 ? findings : [text.trim()];
  }

  private extractConfidence(text: string): number {
    // Look for confidence mentions
    const confidenceMatch = text.match(/confidence[:\s]+(\d+)%/i);
    if (confidenceMatch) {
      return parseInt(confidenceMatch[1]) / 100;
    }

    // Default confidence based on text certainty
    if (text.toLowerCase().includes('definite') || text.toLowerCase().includes('clear')) {
      return 0.9;
    }
    if (text.toLowerCase().includes('likely') || text.toLowerCase().includes('probable')) {
      return 0.7;
    }
    if (text.toLowerCase().includes('possible') || text.toLowerCase().includes('may')) {
      return 0.5;
    }

    return 0.8; // Default
  }

  private determineUrgency(text: string, analysisType: AnalysisType): UrgencyLevel {
    const lowerText = text.toLowerCase();

    if (
      lowerText.includes('emergency') ||
      lowerText.includes('urgent') ||
      lowerText.includes('immediate') ||
      lowerText.includes('severe')
    ) {
      return 'urgent';
    }

    if (
      lowerText.includes('moderate') ||
      lowerText.includes('attention') ||
      lowerText.includes('monitor')
    ) {
      return 'routine';
    }

    return 'home-care';
  }

  private extractRecommendations(text: string): string[] {
    // If the text contains markdown headers in the recommendations section, preserve it
    if ((text.includes('##') || text.includes('###')) && text.toLowerCase().includes('recommend')) {
      // Find where recommendations start
      const lines = text.split('\n');
      let recStartIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes('recommend')) {
          recStartIndex = i;
          break;
        }
      }
      
      if (recStartIndex !== -1) {
        return [lines.slice(recStartIndex).join('\n').trim()];
      }
    }

    const recommendations: string[] = [];
    const lines = text.split('\n');
    let inRecommendations = false;

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.toLowerCase().includes('recommend')) {
        inRecommendations = true;
        continue; // Skip the "Recommendations:" header line if it matches bullet pattern
      }

      if (inRecommendations && (trimmed.match(/^[-*•]\s+/) || trimmed.match(/^\d+\.\s+/))) {
        recommendations.push(trimmed.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, ''));
      }
    }

    return recommendations.length > 0 ? recommendations : ['Consult with a dental professional for proper diagnosis and treatment.'];
  }

  private createTypedAnalysis(
    type: AnalysisType,
    base: any,
    rawText: string
  ): XRayAnalysis {
    switch (type) {
      case 'cavity':
        return {
          ...base,
          type: 'cavity',
          cavityCount: this.extractCavityCount(rawText),
          classification: this.extractCavityClassification(rawText),
        };

      case 'opg':
        return {
          ...base,
          type: 'opg',
          pathologyClass: this.extractOPGClass(rawText),
        };

      case 'tooth-id':
        return {
          ...base,
          type: 'tooth-id',
          toothCount: this.extractToothCount(rawText),
          toothTypes: this.extractToothTypes(rawText),
        };

      case 'general':
        return {
          ...base,
          type: 'general',
          reportSections: this.extractReportSections(rawText),
          qualityAssessment: this.extractQualityAssessment(rawText),
        };
    }
  }

  private extractCavityCount(text: string): '0' | '1' | '2' | '3+' {
    const match = text.match(/(\d+)\s*cav/i);
    if (match) {
      const count = parseInt(match[1]);
      if (count === 0) return '0';
      if (count === 1) return '1';
      if (count === 2) return '2';
      return '3+';
    }
    return '0';
  }

  private extractCavityClassification(text: string): 'normal' | 'cavity' {
    return text.toLowerCase().includes('cavity') || text.toLowerCase().includes('caries')
      ? 'cavity'
      : 'normal';
  }

  private extractOPGClass(text: string): 'Healthy' | 'Caries' | 'Impacted' | 'BDC-BDR' | 'Infection' | 'Fractured' {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('impacted')) return 'Impacted';
    if (lowerText.includes('caries') || lowerText.includes('cavity')) return 'Caries';
    if (lowerText.includes('infection') || lowerText.includes('abscess')) return 'Infection';
    if (lowerText.includes('fracture') || lowerText.includes('broken')) return 'Fractured';
    if (lowerText.includes('bdc') || lowerText.includes('bdr')) return 'BDC-BDR';
    return 'Healthy';
  }

  private extractToothCount(text: string): number {
    const match = text.match(/(\d+)\s*teeth/i);
    return match ? parseInt(match[1]) : 32;
  }

  private extractToothTypes(text: string): Array<{ tooth: string; type: string }> {
    // Simplified extraction - in production, this would be more sophisticated
    return [];
  }

  private extractReportSections(text: string): string[] {
    return text.split('\n\n').filter(s => s.trim().length > 0);
  }

  private extractQualityAssessment(text: string): string {
    const match = text.match(/quality[:\s]+([^\n]+)/i);
    return match ? match[1] : 'Good quality image';
  }

  private parseAssessment(text: string, processingTime: number): CaseAssessment {
    // Improved parser that handles free-form text better
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // Extract diagnosis - look for common patterns
    let primaryDiagnosis = 'Diagnosis pending';
    const diagnosisPatterns = [
      /(?:diagnosis|diagnosed with|condition)[:\s]+(.+?)(?:\.|$)/i,
      /(?:patient (?:has|presents with|suffering from))[:\s]+(.+?)(?:\.|$)/i,
      /^(?:likely|probable|suspected)[:\s]+(.+?)(?:\.|$)/i,
    ];
    
    for (const pattern of diagnosisPatterns) {
      const match = text.match(pattern);
      if (match && match[1].trim().length > 3) {
        primaryDiagnosis = match[1].trim();
        break;
      }
    }
    
    // If still no diagnosis, use first substantial sentence
    if (primaryDiagnosis === 'Diagnosis pending' && lines.length > 0) {
      primaryDiagnosis = lines[0].substring(0, 200);
    }

    // Extract etiology/root cause
    let rootCause = 'To be determined';
    const etiologyPatterns = [
      /(?:etiology|cause|caused by|due to)[:\s]+(.+?)(?:\.|$)/i,
      /(?:result of|resulting from)[:\s]+(.+?)(?:\.|$)/i,
    ];
    
    for (const pattern of etiologyPatterns) {
      const match = text.match(pattern);
      if (match && match[1].trim().length > 3) {
        rootCause = match[1].trim();
        break;
      }
    }

    // Extract management/treatment protocol
    const protocolLines: string[] = [];
    const managementPatterns = [
      /(?:treatment|management|recommend|protocol)[:\s]+(.+?)(?:\n|$)/gi,
      /(?:should|must|need to)[:\s]+(.+?)(?:\n|$)/gi,
    ];
    
    for (const pattern of managementPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 5) {
          protocolLines.push(match[1].trim());
        }
      }
    }
    
    // If no specific protocol found, extract bullet points or numbered lists
    if (protocolLines.length === 0) {
      for (const line of lines) {
        if (line.match(/^[-*•]\s+/) || line.match(/^\d+\.\s+/)) {
          const cleaned = line.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '');
          if (cleaned.length > 5) {
            protocolLines.push(cleaned);
          }
        }
      }
    }

    // Extract patient explanation - use full text if no specific section
    let patientExplanation = text.substring(0, 500);
    const explanationMatch = text.match(/(?:patient (?:should|must|needs to) (?:know|understand))[:\s]+(.+?)(?:\n\n|$)/i);
    if (explanationMatch) {
      patientExplanation = explanationMatch[1].trim();
    }

    return {
      success: true,
      diagnosis: {
        primary: primaryDiagnosis,
        icd10: this.extractICD10(text),
        confidence: this.extractConfidence(text),
        differential: this.extractDifferential(text),
      },
      etiology: {
        rootCause: rootCause,
        contributingFactors: this.extractListItems(text, 'contributing factors?|risk factors?'),
        riskFactors: this.extractListItems(text, 'risk factors?'),
      },
      urgency: this.extractUrgencyLevel(text),
      managementPlan: {
        immediate: this.extractListItems(text, 'immediate|urgent|emergency'),
        protocol: protocolLines.length > 0 ? protocolLines : [text.substring(0, 200)],
        alternatives: this.extractListItems(text, 'alternative|option'),
        expectedOutcomes: this.extractSection(text, 'outcome|prognosis') || 'Favorable with proper treatment',
        duration: this.extractSection(text, 'duration|timeline') || 'Variable',
      },
      followUp: {
        initialTiming: this.extractSection(text, 'follow.?up') || '1-2 weeks',
        monitoring: this.extractListItems(text, 'monitor|watch for'),
        longTerm: this.extractSection(text, 'long.?term') || 'Regular dental checkups',
        redFlags: this.extractListItems(text, 'red flag|warning sign|seek (?:immediate|emergency)'),
      },
      patientCounseling: {
        explanation: patientExplanation,
        homeCare: this.extractListItems(text, 'home care|self.?care|at home'),
        dietary: this.extractListItems(text, 'diet|food|avoid eating'),
        painManagement: this.extractSection(text, 'pain (?:management|relief|control)') || 'As directed by dentist',
        emergencyTriggers: this.extractListItems(text, 'emergency|seek (?:immediate|urgent) care'),
      },
      guidelines: {
        relevant: this.extractListItems(text, 'guideline|standard|protocol'),
        references: [],
        evidenceLevel: 'B',
      },
      processingTime,
    };
  }

  private extractListItems(text: string, pattern: string): string[] {
    const items: string[] = [];
    const regex = new RegExp(`${pattern}[:\\s]+(.+?)(?:\\n\\n|$)`, 'i');
    const match = text.match(regex);
    
    if (match && match[1]) {
      const section = match[1];
      const lines = section.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.match(/^[-*•]\s+/) || trimmed.match(/^\d+\.\s+/)) {
          const cleaned = trimmed.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '');
          if (cleaned.length > 3) {
            items.push(cleaned);
          }
        }
      }
    }
    
    return items;
  }

  private extractSection(text: string, section: string): string {
    // More flexible regex that handles variations
    const regex = new RegExp(`(?:${section})[:\\s]+([^\\n]+)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  }

  private extractICD10(text: string): string {
    const match = text.match(/ICD-10[:\s]+([A-Z]\d{2}\.?\d*)/i);
    return match ? match[1] : 'K00-K14';
  }

  private extractDifferential(text: string): string[] {
    const section = this.extractSection(text, 'differential');
    return section ? section.split(',').map(s => s.trim()) : [];
  }

  private extractUrgencyLevel(text: string): 'emergency' | 'urgent' | 'routine' | 'home-care' {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('emergency')) return 'emergency';
    if (lowerText.includes('urgent')) return 'urgent';
    if (lowerText.includes('routine')) return 'routine';
    return 'routine';
  }

  private extractProtocol(text: string): string[] {
    const section = this.extractSection(text, 'management') || this.extractSection(text, 'protocol');
    return section ? [section] : [];
  }
}

// Export singleton instance
export const modalClient = new ModalClient();

// Auto-start keep-alive in browser environment
if (typeof window !== 'undefined') {
  modalClient.startKeepAlive();
}
