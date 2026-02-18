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
      // Note: The actual structured prompts are in the Modal backend
      // These are fallback questions if the backend doesn't apply structured prompts
      const questions: Record<AnalysisType, string> = {
        cavity: 'Analyze this dental X-ray for cavities. Respond ONLY in JSON format: { "findings": ["..."], "confidence": 0.0-1.0, "cavityCount": "0"|"1"|"2"|"3+", "classification": "normal"|"cavity", "recommendations": ["..."] }.',
        opg: 'Classify this OPG (panoramic) X-ray. Respond ONLY in JSON format: { "findings": ["..."], "confidence": 0.0-1.0, "pathologyClass": "Healthy"|"Caries"|"Impacted"|"BDC-BDR"|"Infection"|"Fractured", "recommendations": ["..."] }.',
        'tooth-id': 'Identify all teeth in this X-ray and classify each. Respond ONLY in JSON format: { "findings": ["..."], "confidence": 0.0-1.0, "toothCount": number, "toothTypes": [{"tooth": "number", "type": "string"}], "recommendations": ["..."] }.',
        general: 'Provide a comprehensive systematic evaluation of this dental X-ray. Respond ONLY in JSON format: { "findings": ["..."], "confidence": 0.0-1.0, "urgency": "emergency"|"urgent"|"routine"|"home-care", "qualityAssessment": "string", "reportSections": ["..."], "recommendations": ["..."] }.',
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

      // Check if we have structured JSON response from backend (direct object)
      if ((response as any).xray_analysis) {
        const xrayData = (response as any).xray_analysis;
        return this.createAnalysisFromData(analysisType, xrayData, response.analysis, processingTime);
      }

      // Try to parse JSON from the analysis string (which might contain thought traces)
      const parsedJSON = this.cleanAndParseResponse(response.analysis);

      if (parsedJSON) {
        console.log('Using parsed JSON data for X-Ray analysis');
        return this.createAnalysisFromData(analysisType, parsedJSON, response.analysis, processingTime);
      }

      // Fallback: Parse plain text response (legacy)
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
   * Clean and parse JSON from AI response, handling thought traces and markdown
   */
  private cleanAndParseResponse(text: string): any {
    try {
      if (!text) return null;

      // 1. Remove <thought>...</thought> or <unused94>thought... blocks
      // This regex matches <unused94>thought... and keeps non-greedy until it finds valid JSON start
      let cleanText = text.replace(/<unused\d+>thought[\s\S]*?(?=\{)/, '').trim();
      
      // Also remove standard xml-style thought tags if present
      cleanText = cleanText.replace(/<thought>[\s\S]*?<\/thought>/gi, '').trim();

      // 2. Extract JSON block if marked with markdown code blocks
      const jsonBlockMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonBlockMatch) {
        cleanText = jsonBlockMatch[1].trim();
      }

      // 3. Find the first '{' and last '}' to isolate the JSON object
      const jsonStart = cleanText.indexOf('{');
      const jsonEnd = cleanText.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const jsonStr = cleanText.substring(jsonStart, jsonEnd + 1);
        return JSON.parse(jsonStr);
      }
      
      return null;
    } catch (e) {
      console.warn('Failed to parse JSON from analysis text:', e);
      return null;
    }
  }

  private createAnalysisFromData(analysisType: AnalysisType, data: any, originalText: string, processingTime: number): XRayAnalysis {
    const baseAnalysis = {
      id: crypto.randomUUID(),
      imageId: crypto.randomUUID(),
      findings: Array.isArray(data.findings) ? data.findings : this.extractFindings(originalText),
      confidence: (typeof data.confidence === 'number' && data.confidence >= 0 && data.confidence <= 1) 
        ? data.confidence 
        : this.extractConfidence(originalText),
      urgency: this.validateUrgency(data.urgency) || this.determineUrgency(originalText, analysisType),
      recommendations: Array.isArray(data.recommendations) ? data.recommendations : this.extractRecommendations(originalText),
      processingTime,
      timestamp: new Date(),
    };

    return this.createTypedAnalysisFromJSON(analysisType, baseAnalysis, data);
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
            differential: ca.diagnosis?.differential || [],
          },
          etiology: {
            rootCause: ca.etiology?.rootCause || 'To be determined',
          },
          urgency: ca.urgency || 'routine',
          managementPlan: {
            protocol: ca.managementPlan?.protocol || [],
          },
          antibiotics: ca.antibiotics ? {
            indicated: !!ca.antibiotics.indicated,
            reason: ca.antibiotics.reason || 'Not specified',
          } : undefined,
          followUp: {
            timing: ca.followUp?.timing || 'To be determined',
            monitoring: ca.followUp?.monitoring || [],
          },
          patientCounseling: {
            explanation: ca.patientCounseling?.explanation || '',
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

  private validateUrgency(urgency: any): UrgencyLevel | null {
    const validLevels: UrgencyLevel[] = ['emergency', 'urgent', 'routine', 'home-care'];
    if (typeof urgency === 'string' && validLevels.includes(urgency as UrgencyLevel)) {
      return urgency as UrgencyLevel;
    }
    return null;
  }

  private createTypedAnalysisFromJSON(
    type: AnalysisType,
    base: any,
    jsonData: any
  ): XRayAnalysis {
    switch (type) {
      case 'cavity':
        return {
          ...base,
          type: 'cavity',
          cavityCount: this.validateCavityCount(jsonData.cavityCount) || '0',
          classification: this.validateClassification(jsonData.classification) || 'normal',
        };

      case 'opg':
        return {
          ...base,
          type: 'opg',
          pathologyClass: this.validateOPGClass(jsonData.pathologyClass) || 'Healthy',
        };

      case 'tooth-id':
        return {
          ...base,
          type: 'tooth-id',
          toothCount: typeof jsonData.toothCount === 'number' ? jsonData.toothCount : 0,
          toothTypes: Array.isArray(jsonData.toothTypes) ? jsonData.toothTypes : [],
        };

      default:
        // Fallback for general or unexpected types
        return {
          ...base,
          type: 'general',
          reportSections: Array.isArray(jsonData.reportSections) ? jsonData.reportSections : [],
          qualityAssessment: jsonData.qualityAssessment || 'Analysis completed',
        };
    }
  }

  private validateCavityCount(count: any): '0' | '1' | '2' | '3+' | null {
    const validCounts = ['0', '1', '2', '3+'];
    if (typeof count === 'string' && validCounts.includes(count)) {
      return count as '0' | '1' | '2' | '3+';
    }
    return null;
  }

  private validateClassification(classification: any): 'normal' | 'cavity' | null {
    if (classification === 'normal' || classification === 'cavity') {
      return classification;
    }
    return null;
  }

  private validateOPGClass(pathologyClass: any): 'Healthy' | 'Caries' | 'Impacted' | 'BDC-BDR' | 'Infection' | 'Fractured' | null {
    const validClasses = ['Healthy', 'Caries', 'Impacted', 'BDC-BDR', 'Infection', 'Fractured'];
    if (typeof pathologyClass === 'string' && validClasses.includes(pathologyClass)) {
      return pathologyClass as any;
    }
    return null;
  }

  private extractFindings(text: string): string[] {
    // 1. Try to isolate the "Findings" section
    // Regex matches "## Findings" or "**Findings**" until the next header or end of string
    const sectionMatch = text.match(/(?:##|\*\*)\s*Findings?(?:Details)?(?:\*\*)?[:\s]*\n([\s\S]*?)(?=\n(?:##|\*\*)|$)/i);
    
    let targetText = text;
    if (sectionMatch) {
      targetText = sectionMatch[1].trim();
    } else {
      // If no specific subsection, try to avoid the Recommendations section if it exists
      const recStart = text.search(/(?:##|\*\*)\s*Recommendations?/i);
      if (recStart > 0) {
        targetText = text.substring(0, recStart);
      }
    }

    // 2. Extract bullet points
    const findings: string[] = [];
    const lines = targetText.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Match bullet points, numbered lists, or lines starting with - or *
      if (trimmed.match(/^[-*•]\s+/) || trimmed.match(/^\d+\.\s+/)) {
        const cleaned = trimmed.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '');
        // Filtering out empty or very short lines, and header-like lines
        if (cleaned.length > 5 && !cleaned.startsWith('**') && !cleaned.endsWith(':')) {
          findings.push(cleaned);
        }
      }
    }
    
    // If we found specific section bullets, return them
    if (findings.length > 0) return findings;

    // Fallback: If no bullets found in section, return the whole section text as one item (if not too long)
    if (sectionMatch && targetText.length > 0) {
      return [targetText];
    }

    // Final Fallback: If original text structure was used and failed to parse
    return [text.substring(0, 500) + '...']; 
  }

  private extractConfidence(text: string): number {
    // Look for confidence mentions in various formats
    const patterns = [
      /confidence[:\s]+(\d+)%/i,
      /confidence[:\s]+(\d+\.\d+)/i,
      /\*\*Confidence\*\*[:\s]+(\d+)%/i, // Matches **Confidence**: 85%
      /\*\*Confidence:\*\*[:\s]*(\d+)%/i, // Matches **Confidence:** 85%
      /\*\*confidence\*\*[:\s]+(\d+)%/i,
      /Confidence[:\s]+(?:\w+\s+)?\((\d+)%\)/i, // Matches Confidence: High (85%)
      /confidence\s*score[:\s]+(\d+)%/i,
      /confidence[:\s]+\[?(\d+)%\]?/i,
      /"confidence":\s*(\d+\.?\d*)/i,  // JSON format
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        let value = parseFloat(match[1]);
        // Normalize 0-100 to 0-1
        if (value > 1) value = value / 100;
        return value;
      }
    }

    // Default confidence based on text certainty keywords (only if no explicit confidence found)
    const lowerText = text.toLowerCase();
    if (lowerText.includes('definite') || lowerText.includes('clear') || lowerText.includes('certain')) {
      return 0.9;
    }
    if (lowerText.includes('likely') || lowerText.includes('probable') || lowerText.includes('consistent with')) {
      return 0.75;
    }
    // Only use 0.6 for "possible" or "may", not for "suggest" which is too common
    if (lowerText.includes('possible') || lowerText.includes('may be') || lowerText.includes('suspicious for')) {
      return 0.6;
    }

    // Default to a reasonable high confidence if nothing else found but analysis succeeded
    return 0.8; 
  }

  private determineUrgency(text: string, analysisType: AnalysisType): UrgencyLevel {
    const lowerText = text.toLowerCase();

    // Look for explicit urgency level mentions in structured format
    const urgencyMatch = text.match(/\*\*urgency\s+level\*\*[:\s]+(\w+(?:-\w+)?)/i);
    if (urgencyMatch) {
      const level = urgencyMatch[1].toLowerCase();
      if (level === 'emergency') return 'emergency';
      if (level === 'urgent') return 'urgent';
      if (level === 'routine') return 'routine';
      if (level === 'home-care' || level === 'home care') return 'home-care';
    }

    // Keyword-based urgency detection
    if (
      lowerText.includes('emergency') ||
      lowerText.includes('immediate attention') ||
      lowerText.includes('severe pain') ||
      lowerText.includes('acute infection')
    ) {
      return 'emergency';
    }

    if (
      lowerText.includes('urgent') ||
      lowerText.includes('prompt treatment') ||
      lowerText.includes('soon as possible')
    ) {
      return 'urgent';
    }

    if (
      lowerText.includes('routine') ||
      lowerText.includes('schedule appointment') ||
      lowerText.includes('moderate')
    ) {
      return 'routine';
    }

    return 'home-care';
  }

  private extractRecommendations(text: string): string[] {
    // 1. Try to isolate the "Recommendations" section
    const sectionMatch = text.match(/(?:##|\*\*)\s*(?:Clinical\s+)?(?:Priority\s+)?Recommendations?\s*(?:Details)?(?:\*\*)?[:\s]*\n([\s\S]*?)(?=\n(?:##|\*\*)|$)/i);
    
    let targetText = '';
    if (sectionMatch) {
      targetText = sectionMatch[1].trim();
    } else {
      // Look for any part starting with "Recommendations" even without fancy headers
      const match = text.match(/Recommendations?[:\s]*\n([\s\S]*)/i);
      if (match) {
        targetText = match[1].trim();
      }
    }

    if (!targetText) return [];

    const recommendations: string[] = [];
    const lines = targetText.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Match bullet points, numbered lists
      if (trimmed.match(/^[-*•]\s+/) || trimmed.match(/^\d+\.\s+/)) {
        const cleaned = trimmed.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '');
        if (cleaned.length > 5 && !cleaned.startsWith('**') && !cleaned.endsWith(':')) {
          recommendations.push(cleaned);
        }
      }
    }
    
    return recommendations.length > 0 ? recommendations : ['Consult with a dental professional for proper diagnosis and treatment.'];

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
    // Look for structured cavity count in markdown format
    const patterns = [
      /(?:Count\s*cavities|Cavity\s*Count)[:\s]+(\d+|\d+\+)/i,
      /\*\*cavity\s+count\*\*[:\s]+(\d+|\d+\+)/i,
      /cavity\s+count[:\s]+\[?(\d+|\d+\+)\]?/i,
      /(\d+)\s+cav(?:ity|ities)\s+detected/i,
      /detected\s+(\d+)\s+cav/i,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const countStr = match[1];
        if (countStr.includes('+')) {
          return '3+';
        }
        const count = parseInt(countStr);
        if (count === 0) return '0';
        if (count === 1) return '1';
        if (count === 2) return '2';
        if (count >= 3) return '3+';
      }
    }
    
    // Fallback: check for "no cavities" or "normal"
    const lowerText = text.toLowerCase();
    if (lowerText.includes('no cav') || lowerText.includes('0 cav')) {
      return '0';
    }
    
    return '0';
  }

  private extractCavityClassification(text: string): 'normal' | 'cavity' {
    // Look for structured classification in markdown format
    const patterns = [
      /(?:Classify|Classification)[:\s]+(normal|cavity\s+detected|cavity)/i,
      /\*\*classification\*\*[:\s]+(normal|cavity\s+detected|cavity)/i,
      /classification[:\s]+\[?"?(normal|cavity\s+detected|cavity)"?\]?/i,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const classification = match[1].toLowerCase();
        if (classification.includes('cavity')) return 'cavity';
        if (classification.includes('normal')) return 'normal';
      }
    }
    
    // Fallback: keyword search
    const lowerText = text.toLowerCase();
    return lowerText.includes('cavity') || lowerText.includes('caries') || lowerText.includes('decay')
      ? 'cavity'
      : 'normal';
  }

  private extractOPGClass(text: string): 'Healthy' | 'Caries' | 'Impacted' | 'BDC-BDR' | 'Infection' | 'Fractured' {
    // Look for structured classification in markdown format
    const patterns = [
      /\*\*primary\s+classification\*\*[:\s]+(healthy|caries|impacted|bdc-bdr|infection|fractured)/i,
      /classification[:\s]+\[?"?(healthy|caries|impacted|bdc-bdr|infection|fractured)"?\]?/i,
      /opg\s+classification[:\s]+(healthy|caries|impacted|bdc-bdr|infection|fractured)/i,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const classification = match[1].toLowerCase();
        if (classification === 'healthy') return 'Healthy';
        if (classification === 'caries') return 'Caries';
        if (classification === 'impacted') return 'Impacted';
        if (classification === 'bdc-bdr') return 'BDC-BDR';
        if (classification === 'infection') return 'Infection';
        if (classification === 'fractured') return 'Fractured';
      }
    }
    
    // Fallback: keyword search with priority order
    const lowerText = text.toLowerCase();
    if (lowerText.includes('impacted')) return 'Impacted';
    if (lowerText.includes('caries') || lowerText.includes('cavity') || lowerText.includes('decay')) return 'Caries';
    if (lowerText.includes('infection') || lowerText.includes('abscess') || lowerText.includes('periapical')) return 'Infection';
    if (lowerText.includes('fracture') || lowerText.includes('broken') || lowerText.includes('fractured')) return 'Fractured';
    if (lowerText.includes('bdc') || lowerText.includes('bdr')) return 'BDC-BDR';
    if (lowerText.includes('healthy') || lowerText.includes('normal') || lowerText.includes('no significant')) return 'Healthy';
    
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
    // Split by markdown headers (## or ###)
    const sections: string[] = [];
    const headerRegex = /^#{2,3}\s+(.+)$/gm;
    const matches = [...text.matchAll(headerRegex)];
    
    if (matches.length > 0) {
      for (let i = 0; i < matches.length; i++) {
        const currentMatch = matches[i];
        const nextMatch = matches[i + 1];
        
        const startIndex = currentMatch.index! + currentMatch[0].length;
        const endIndex = nextMatch ? nextMatch.index! : text.length;
        
        const sectionContent = text.substring(startIndex, endIndex).trim();
        
        if (sectionContent.length > 0) {
          // Include the header with the content
          sections.push(`## ${currentMatch[1]}\n\n${sectionContent}`);
        }
      }
      
      return sections;
    }
    
    // Fallback: split by double newlines
    return text.split('\n\n').filter(s => s.trim().length > 20);
  }

  private extractQualityAssessment(text: string): string {
    // Look for Image Quality Assessment section
    const qualityMatch = text.match(/##\s*Image\s+Quality\s+Assessment\s*\n([\s\S]*?)(?=\n##|$)/i);
    if (qualityMatch) {
      return qualityMatch[1].trim();
    }
    
    // Look for technical quality mentions
    const patterns = [
      /\*\*technical\s+quality\*\*[:\s]+([^\n]+)/i,
      /quality[:\s]+([^\n]+?)(?:\.|$)/i,
      /image\s+quality[:\s]+([^\n]+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1].trim().length > 5) {
        return match[1].trim();
      }
    }
    
    return 'Good quality image suitable for diagnostic purposes';
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
        differential: this.extractDifferential(text),
      },
      etiology: {
        rootCause: rootCause,
      },
      urgency: this.extractUrgencyLevel(text),
      managementPlan: {
        protocol: protocolLines.length > 0 ? protocolLines : [text.substring(0, 200)],
      },
      antibiotics: text.toLowerCase().includes('antibiotic') ? {
        indicated: !text.toLowerCase().includes('not indicated'),
        reason: this.extractSection(text, 'antibiotic') || 'Refer to assessment',
      } : undefined,
      followUp: {
        timing: this.extractSection(text, 'follow.?up') || '1-2 weeks',
        monitoring: this.extractListItems(text, 'monitor|watch for'),
      },
      patientCounseling: {
        explanation: patientExplanation,
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
