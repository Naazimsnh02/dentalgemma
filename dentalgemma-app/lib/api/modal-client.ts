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
const KEEP_ALIVE_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours (once per day)

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
 * Convert File or image path/URL to base64
 */
const toBase64 = async (input: File | string): Promise<string> => {
  if (typeof input === 'string') {
    // 1. Check if it's already a data URL or base64
    if (input.startsWith('data:')) {
      return input.split(',')[1];
    }

    // 2. Check if it's a regular string that looks like base64 (no spaces, starts with alphabetic)
    // but avoid matching paths like "/analysis/image.jpg"
    if (!input.includes('/') && !input.includes('.') && input.length > 100) {
      return input;
    }

    // 3. Assume it's a URL or path and fetch it
    try {
      const response = await fetch(input);
      if (!response.ok) {
        throw new Error(`Failed to fetch image from ${input}: ${response.statusText}`);
      }
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error fetching/converting URL to base64:', error);
      throw new ModalClientError(`Failed to process image source: ${(error as Error).message}`, 'IMAGE_PROCESS_ERROR');
    }
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

    console.log('Keep-alive pings started (once per day)');
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
        photo: 'Analyze this clinical dental photograph. Describe the condition of the teeth and gums visible. Note any signs of decay, discoloration, or other abnormalities. Assess the severity and recommend follow-up actions. Provide a clear, professional clinical description.',
        xray: 'Analyze this dental radiograph. Describe any pathological findings and their locations using dental region terminology (e.g., "right mandibular region", "anterior maxillary region"). Provide your assessment of the condition, possible differential diagnoses, and clinical recommendations.',
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
            max_tokens: 1024,
          }),
        }
      );

      const processingTime = Math.max(Date.now() - startTime, 1);

      // Clean the response text (remove thought traces, special tokens)
      const cleanedAnalysis = this.cleanResponseText(response.analysis);

      // Build base analysis object
      const baseAnalysis = {
        id: crypto.randomUUID(),
        imageId: crypto.randomUUID(),
        rawAnalysis: cleanedAnalysis,
        findings: this.extractFindings(cleanedAnalysis),
        confidence: this.extractConfidence(cleanedAnalysis),
        urgency: this.determineUrgency(cleanedAnalysis, analysisType),
        recommendations: this.extractRecommendations(cleanedAnalysis),
        processingTime,
        timestamp: new Date(),
      };

      // Return type-specific analysis
      if (analysisType === 'photo') {
        return {
          ...baseAnalysis,
          type: 'photo' as const,
          condition: this.extractPhotoConditionFromText(cleanedAnalysis),
          severity: this.extractSeverityFromText(cleanedAnalysis),
        };
      } else {
        return {
          ...baseAnalysis,
          type: 'xray' as const,
          pathologyClass: this.extractOPGClass(cleanedAnalysis),
          differentialDiagnosis: this.extractDifferentialDiagnosis(cleanedAnalysis),
        };
      }
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
      // Helper to ensure values are strings (handles arrays from old data shapes)
      const ensureString = (val: any, fallback = 'None specified'): string => {
        if (!val || val.length === 0) return fallback;
        if (Array.isArray(val)) return val.join(', ') || fallback;
        if (typeof val === 'object') return JSON.stringify(val);
        return String(val);
      };

      // Make API request
      // Modal creates separate URLs for each function: baseUrl-functionname.modal.run
      const response = await fetchWithRetry<AssessCaseResponse>(
        `${this.baseUrl}-assess-case.modal.run`,
        {
          method: 'POST',
          body: JSON.stringify({
            patient: {
              age: Number(caseData.patient?.age) || 30,
              gender: String(caseData.patient?.gender || 'other'),
              occupation: caseData.patient?.occupation ? String(caseData.patient.occupation) : 'Not specified',
            },
            chief_complaint: ensureString(caseData.chiefComplaint?.description),
            history: ensureString(caseData.history),
            clinical_findings: ensureString(caseData.clinicalFindings?.description),
            radiographic_findings: ensureString(caseData.radiographicFindings?.description),
            medical_history: ensureString(caseData.medicalHistory?.systemicConditions, 'None significant'),
            current_medications: ensureString(caseData.medicalHistory?.medications, 'None'),
            habits: ensureString(caseData.medicalHistory?.habits, 'None reported'),
            max_tokens: 2048,
          }),
        }
      );

      const processingTime = Math.max(Date.now() - startTime, 1);

      // Clean the response text (remove thought traces, special tokens)
      const cleanedAssessment = this.cleanResponseText(response.assessment);

      // Parse markdown response into structured format
      return this.parseMarkdownAssessment(cleanedAssessment, processingTime);
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

      return this.cleanResponseText(response.message || (response as any).response || '');
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
   * Clean response text by removing thought blocks and special tokens
   */
  private cleanResponseText(text: string): string {
    if (!text) return '';

    let clean = text.trim();

    // 1. Remove <unusedXX>thought ... <unusedXX> blocks (common in Gemma fine-tunes)
    // This handles both closed blocks and unclosed ones if they have the start tag
    clean = clean.replace(/<unused\d+>thought[\s\S]*?<unused\d+>/gi, '');
    clean = clean.replace(/<unused\d+>thought[\s\S]*?(?=\n\n|$)/gi, '');

    // 2. Remove standard XML-style thought blocks
    clean = clean.replace(/<thought>[\s\S]*?<\/thought>/gi, '');
    clean = clean.replace(/<thought>[\s\S]*$/gi, ''); // Unclosed tag

    // 3. Remove standalone special tokens and formatting markers
    clean = clean.replace(/<unused\d+>/gi, '');
    clean = clean.replace(/<start_of_turn>/gi, '');
    clean = clean.replace(/<end_of_turn>/gi, '');
    clean = clean.replace(/<\|im_start\|>/gi, '');
    clean = clean.replace(/<\|im_end\|>/gi, '');
    clean = clean.replace(/<\|assistant\|>/gi, '');
    clean = clean.replace(/<\|user\|>/gi, '');

    // 4. Handle leading "thought" or "reasoning" words (case-insensitive)
    // This handles the specific case reported where the text starts with the word "thought"
    // We remove the word "thought" followed by any combination of :, -, or whitespace
    clean = clean.replace(/^(?:thought|reasoning|analysis)[:\s\-\n]*/i, '');

    return clean.trim();
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
      case 'photo':
        return {
          ...base,
          type: 'photo',
          condition: this.extractPhotoCondition(jsonData, base.findings),
          severity: this.extractSeverity(jsonData, base.findings),
        };

      default: // 'xray'
        return {
          ...base,
          type: 'xray',
          pathologyClass: this.validateOPGClass(jsonData.pathologyClass) || undefined,
          differentialDiagnosis: Array.isArray(jsonData.differentialDiagnosis)
            ? jsonData.differentialDiagnosis
            : undefined,
        };
    }
  }

  private validateOPGClass(pathologyClass: any): 'Healthy' | 'Caries' | 'Impacted' | 'BDC-BDR' | 'Infection' | 'Fractured' | null {
    const validClasses = ['Healthy', 'Caries', 'Impacted', 'BDC-BDR', 'Infection', 'Fractured'];
    if (typeof pathologyClass === 'string' && validClasses.includes(pathologyClass)) {
      return pathologyClass as any;
    }
    return null;
  }

  private extractPhotoCondition(data: any, findings: string[]): 'healthy' | 'decay' | 'other' {
    const text = [data?.condition, ...findings].join(' ').toLowerCase();
    if (text.includes('decay') || text.includes('caries') || text.includes('cavity')) return 'decay';
    if (text.includes('healthy') || text.includes('normal') || text.includes('no abnormalities')) return 'healthy';
    return 'other';
  }

  private extractSeverity(data: any, findings: string[]): 'mild' | 'moderate' | 'severe' | undefined {
    const text = [data?.severity, ...findings].join(' ').toLowerCase();
    if (text.includes('severe')) return 'severe';
    if (text.includes('moderate')) return 'moderate';
    if (text.includes('mild')) return 'mild';
    return undefined;
  }

  private extractFindings(text: string): string[] {
    // The model outputs natural language, not structured lists
    // Extract sentences that describe findings
    const findings: string[] = [];
    const seen = new Set<string>();
    
    // Split into sentences
    const sentences = text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20); // Meaningful sentences only
    
    // Look for sentences that describe findings (contain dental terminology)
    const findingKeywords = /\b(caries|decay|cavity|cavitation|impacted|infection|abscess|fracture|radiolucency|radiopacity|periapical|tooth|teeth|molar|incisor|canine|premolar|mandibular|maxillary|anterior|posterior|enamel|dentin|pulp|crown|root|gingiva|periodontal)\b/i;
    
    for (const sentence of sentences) {
      if (findingKeywords.test(sentence)) {
        const normalized = sentence.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
        if (!seen.has(normalized) && sentence.length > 30) {
          findings.push(sentence);
          seen.add(normalized);
          if (findings.length >= 5) break; // Limit to 5 key findings
        }
      }
    }
    
    // Fallback: if no findings extracted, use first few meaningful sentences
    if (findings.length === 0) {
      return sentences.slice(0, 3).filter(s => s.length > 30);
    }
    
    return findings;
  }

  /**
   * Deduplicate items by normalizing and comparing content
   */
  private deduplicateItems(items: string[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    
    for (const item of items) {
      // Normalize: lowercase, remove extra whitespace, remove punctuation
      const normalized = item
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Skip if we've seen this content before
      if (!seen.has(normalized) && normalized.length > 0) {
        seen.add(normalized);
        result.push(item);
      }
    }
    
    return result;
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
    // Extract recommendation sentences from natural language
    const recommendations: string[] = [];
    const seen = new Set<string>();
    
    // Split into sentences
    const sentences = text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20);
    
    // Look for sentences with recommendation keywords
    const recKeywords = /\b(recommend|advised|should|suggested|consultation|treatment|follow-up|evaluation|referral|intervention|therapy|restoration|extraction|monitoring)\b/i;
    
    for (const sentence of sentences) {
      if (recKeywords.test(sentence)) {
        const normalized = sentence.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
        if (!seen.has(normalized) && sentence.length > 30) {
          recommendations.push(sentence);
          seen.add(normalized);
          if (recommendations.length >= 4) break; // Limit to 4 recommendations
        }
      }
    }
    
    // Fallback
    if (recommendations.length === 0) {
      return ['Consult with a dental professional for proper diagnosis and treatment.'];
    }
    
    return recommendations;
  }

  private createTypedAnalysis(
    type: AnalysisType,
    base: any,
    rawText: string
  ): XRayAnalysis {
    switch (type) {
      case 'photo':
        return {
          ...base,
          type: 'photo',
          condition: this.extractPhotoConditionFromText(rawText),
          severity: this.extractSeverityFromText(rawText),
        };

      case 'xray':
        return {
          ...base,
          type: 'xray',
          pathologyClass: this.extractOPGClass(rawText),
          differentialDiagnosis: this.extractDifferentialDiagnosis(rawText),
        };

      default:
        return {
          ...base,
          type: 'xray',
          pathologyClass: undefined,
          differentialDiagnosis: undefined,
        };
    }
  }

  private extractPhotoConditionFromText(text: string): 'healthy' | 'decay' | 'other' {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('decay') || lowerText.includes('caries') || lowerText.includes('cavity')) return 'decay';
    if (lowerText.includes('healthy') || lowerText.includes('normal') || lowerText.includes('no abnormalities')) return 'healthy';
    return 'other';
  }

  private extractSeverityFromText(text: string): 'mild' | 'moderate' | 'severe' | undefined {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('severe')) return 'severe';
    if (lowerText.includes('moderate')) return 'moderate';
    if (lowerText.includes('mild')) return 'mild';
    return undefined;
  }

  private extractDifferentialDiagnosis(text: string): string[] | undefined {
    // Use robust list extraction for Differential Diagnosis
    const results = this.extractSectionList(text, 'Differential\\s+Diagnosis', "Findings|Recommendations|Analysis|Conclusion|Clinical|Key|Priority|Plan");
    if (results.length > 0) return results;
    
    // Fallback to single line extraction if no list found
    const match = text.match(/differential\s+diagnos(?:is|es)[:\s]+([^\n]+)/i);
    if (match) {
      // Check if it captured just metadata characters
      const candidate = match[1].trim();
      if (candidate.length > 3 && !candidate.match(/^[*_#]+$/)) {
        return candidate.split(/[,;]/).map(d => d.trim()).filter(d => d.length > 0);
      }
    }
    return undefined;
  }

  private extractOPGClass(text: string): 'Healthy' | 'Caries' | 'Impacted' | 'BDC-BDR' | 'Infection' | 'Fractured' | undefined {
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
    
    return undefined;
  }

  /**
   * Helper to extract a list of items from a named section
   */
  private extractSectionList(text: string, sectionNameRegex: string, stopKeywords: string): string[] {
    // Regex matches "## Section" or "**Section**" followed by anything on the line (to handle : inside/outside bold)
    const regex = new RegExp(`(?:##|\\*\\*)\\s*${sectionNameRegex}.*?\\n([\\s\\S]*?)(?=\\n(?:##|\\*\\*\\s*(?:${stopKeywords}))|$)`, 'i');
    
    const sectionMatch = text.match(regex);
    let targetText = '';
    
    if (sectionMatch) {
      targetText = sectionMatch[1].trim();
      
      // Secondary stop check: search for likely next headers within the captured block
      const stopRegex = new RegExp(`(?:##|\\*\\*)\\s*(?:${stopKeywords})`, 'i');
      const stopIndex = targetText.search(stopRegex);
      if (stopIndex > 0) {
        targetText = targetText.substring(0, stopIndex);
      }
    } else {
        // Fallback: Try to find the section without fancy headers
        const looseRegex = new RegExp(`${sectionNameRegex}[:\\s]*\\n([\\s\\S]*?)(?=\\n(?:##|\\*\\*)|$)`, 'i');
        const looseMatch = text.match(looseRegex);
        if (looseMatch) {
            targetText = looseMatch[1].trim();
        }
    }
    
    if (!targetText) return [];

    const items: string[] = [];
    const seen = new Set<string>(); // For deduplication
    const lines = targetText.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Match bullet points, numbered lists, or lines starting with ** (key-value pairs)
      if (trimmed.match(/^[-*•]\s+/) || trimmed.match(/^\d+\.\s+/) || trimmed.startsWith('**')) {
        let cleaned = trimmed;
        // Remove bullet point chars
        if (trimmed.match(/^[-*•]\s+/) || trimmed.match(/^\d+\.\s+/)) {
          cleaned = trimmed.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '');
        }
        
        // Remove leading/trailing markdown bold if present on the whole line
        // e.g. **Findings:** should be ignored if it matches section name or similar
        const plainText = cleaned.replace(/^\*\*/, '').replace(/\*\*[:\s]*$/, '').replace(/:$/, '').trim();
        
        // Validation:
        // 1. Must be long enough
        // 2. Must not be a sub-header (e.g. "Findings:", "Severity:") unless it has a value
        // 3. Must not be a duplicate
        const isHeaderLike = plainText.length < 25 && (plainText.match(/findings|diagnosis|analysis|recommendations?|assessment/i)); 
        
        // 4. Special check: if we are in Findings, ignore lines that explicitly start with "Recommendation" or "Assessment"
        // since those belong in their own sections/fields.
        const isCrossSection = (sectionNameRegex.includes('Findings') && (plainText.match(/^(?:Recommendation|Assessment|Diagnosis):/i)));

        if (cleaned.length > 3 && !seen.has(cleaned) && !isHeaderLike && !isCrossSection && !cleaned.endsWith(':')) {
             items.push(cleaned);
             seen.add(cleaned);
        }
      }
    }
    
    return items;
  }

  /**
   * Parse markdown-formatted assessment (matches training format)
   * Expected format:
   * ## Patient Assessment
   * **Diagnosis:** ...
   * **Etiology:** ...
   * **Urgency:** Elective (0) | Moderate (1) | Urgent (2)
   * 
   * ## Management Plan
   * 1. Step 1
   * 2. Step 2
   * 
   * ## Antibiotic Considerations
   * **Antibiotics Indicated:** Yes/No
   * **Reason:** ...
   * 
   * ## Follow-up Recommendations
   * **Next Appointment:** ...
   * **Monitoring:** ...
   * 
   * ## Patient Counseling
   * 1. Point 1
   * 2. Point 2
   */
  private parseMarkdownAssessment(text: string, processingTime: number): CaseAssessment {
    // Extract diagnosis
    const diagnosisMatch = text.match(/\*\*Diagnosis:\*\*\s*([^\n]+)/i);
    const primaryDiagnosis = diagnosisMatch ? diagnosisMatch[1].trim() : 'Diagnosis pending';

    // Extract differential diagnosis (if present)
    const differential = this.extractDifferential(text);

    // Extract etiology
    const etiologyMatch = text.match(/\*\*Etiology:\*\*\s*([^\n]+)/i);
    const rootCause = etiologyMatch ? etiologyMatch[1].trim() : 'To be determined';

    // Extract urgency - handle both formats: "Elective (0)" or just "routine"
    let urgency: UrgencyLevel = 'routine';
    const urgencyMatch = text.match(/\*\*Urgency:\*\*\s*([^\n]+)/i);
    if (urgencyMatch) {
      const urgencyText = urgencyMatch[1].toLowerCase();
      if (urgencyText.includes('urgent (2)') || urgencyText.includes('emergency')) {
        urgency = 'emergency';
      } else if (urgencyText.includes('moderate (1)') || urgencyText.includes('urgent')) {
        urgency = 'urgent';
      } else if (urgencyText.includes('elective (0)') || urgencyText.includes('routine')) {
        urgency = 'routine';
      } else if (urgencyText.includes('home-care') || urgencyText.includes('home care')) {
        urgency = 'home-care';
      }
    }

    // Extract management plan - look for numbered list after "## Management Plan"
    const managementSection = text.match(/##\s*Management\s+Plan\s*\n([\s\S]*?)(?=\n##|\n\*\*|$)/i);
    let protocol: string[] = [];
    if (managementSection) {
      const lines = managementSection[1].split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.match(/^\d+\.\s+/) || trimmed.match(/^[-*•]\s+/)) {
          const cleaned = trimmed.replace(/^\d+\.\s+/, '').replace(/^[-*•]\s+/, '').trim();
          if (cleaned.length > 5) {
            protocol.push(cleaned);
          }
        }
      }
    }

    // Fallback: extract any numbered/bulleted list if no management section found
    if (protocol.length === 0) {
      const lines = text.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.match(/^\d+\.\s+/) || trimmed.match(/^[-*•]\s+/)) {
          const cleaned = trimmed.replace(/^\d+\.\s+/, '').replace(/^[-*•]\s+/, '').trim();
          if (cleaned.length > 10 && !cleaned.toLowerCase().includes('maintain excellent')) {
            protocol.push(cleaned);
            if (protocol.length >= 5) break;
          }
        }
      }
    }

    // Extract antibiotics
    const antibioticsIndicatedMatch = text.match(/\*\*Antibiotics\s+Indicated:\*\*\s*(Yes|No|Conditional)/i);
    const antibioticsReasonMatch = text.match(/\*\*Reason:\*\*\s*([^\n]+)/i);
    
    let antibiotics: { indicated: boolean; reason: string } | undefined;
    if (antibioticsIndicatedMatch) {
      const indicated = antibioticsIndicatedMatch[1].toLowerCase();
      antibiotics = {
        indicated: indicated === 'yes',
        reason: antibioticsReasonMatch ? antibioticsReasonMatch[1].trim() : (indicated === 'conditional' ? 'Only if systemic signs present' : 'Not indicated'),
      };
    }

    // Extract follow-up
    const nextApptMatch = text.match(/\*\*Next\s+Appointment:\*\*\s*([^\n]+)/i);
    const monitoringMatch = text.match(/\*\*Monitoring:\*\*\s*([^\n]+)/i);
    
    const followUp = {
      timing: nextApptMatch ? nextApptMatch[1].trim() : '1-2 weeks',
      monitoring: monitoringMatch ? [monitoringMatch[1].trim()] : [],
    };

    // Extract patient counseling - look for numbered list after "## Patient Counseling"
    const counselingSection = text.match(/##\s*Patient\s+Counseling\s*\n([\s\S]*?)(?=\n##|$)/i);
    let counselingPoints: string[] = [];
    if (counselingSection) {
      const lines = counselingSection[1].split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.match(/^\d+\.\s+/) || trimmed.match(/^[-*•]\s+/)) {
          const cleaned = trimmed.replace(/^\d+\.\s+/, '').replace(/^[-*•]\s+/, '').trim();
          if (cleaned.length > 5) {
            counselingPoints.push(cleaned);
          }
        }
      }
    }

    const patientExplanation = counselingPoints.length > 0 
      ? counselingPoints.join(' ') 
      : 'Please consult your dentist for a detailed explanation of your condition and treatment options.';

    return {
      success: true,
      diagnosis: {
        primary: primaryDiagnosis,
        differential: differential.length > 0 ? differential : [],
      },
      etiology: {
        rootCause,
      },
      urgency,
      managementPlan: {
        protocol: protocol.length > 0 ? protocol : ['Refer to clinical assessment for treatment details'],
      },
      antibiotics,
      followUp,
      patientCounseling: {
        explanation: patientExplanation,
      },
      processingTime,
    };
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

  private extractDiagnosisFromText(text: string): string {
    const patterns = [
      /(?:diagnosis|diagnosed with|condition)[:\s]+(.+?)(?:\.|$)/i,
      /(?:patient (?:has|presents with|suffering from))[:\s]+(.+?)(?:\.|$)/i,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1].trim().length > 3) {
        return match[1].trim();
      }
    }
    return 'Diagnosis pending';
  }

  private extractEtiologyFromText(text: string): string {
    const patterns = [
      /(?:etiology|cause|caused by|due to)[:\s]+(.+?)(?:\.|$)/i,
      /(?:result of|resulting from)[:\s]+(.+?)(?:\.|$)/i,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1].trim().length > 3) {
        return match[1].trim();
      }
    }
    return 'To be determined';
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
