// ============================================================================
// Gemini Live API Client
// Native audio processing with Gemini 2.5 Flash for enhanced voice consultation
// ============================================================================

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeminiLiveConfig {
  apiKey: string;
  model?: string;
  systemPrompt?: string;
}

export interface AudioChunk {
  data: ArrayBuffer;
  timestamp: number;
}

export interface GeminiLiveResponse {
  text: string;
  audio?: ArrayBuffer;
  timestamp: number;
}

// Dental expertise system prompt for Gemini Live
const DENTAL_EXPERTISE_PROMPT = `You are DentalGemma, an expert dental clinician providing patient care. Provide clear, evidence-based dental guidance based on the patient's symptoms. Keep your response conversational but structured.`;

// ============================================================================
// Gemini Live Client
// ============================================================================

export class GeminiLiveClient {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private config: GeminiLiveConfig;
  private conversationHistory: Array<{ role: string; parts: any[] }> = [];
  private isConnected = false;
  
  constructor(config: GeminiLiveConfig) {
    if (!config.apiKey) {
      throw new Error('Gemini API key is required');
    }
    
    this.config = {
      // Note: Native audio model requires WebSocket Live API (bidiGenerateContent)
      // For now, using gemini-2.5-flash for text-based chat
      // TODO: Implement WebSocket Live API for true native audio support
      model: config.model || 'gemini-2.5-flash',
      systemPrompt: config.systemPrompt || DENTAL_EXPERTISE_PROMPT,
      ...config,
    };
    
    this.genAI = new GoogleGenerativeAI(config.apiKey);
  }
  
  /**
   * Initialize connection with Gemini Live
   */
  async connect(): Promise<void> {
    try {
      this.model = this.genAI.getGenerativeModel({
        model: this.config.model!,
        systemInstruction: this.config.systemPrompt,
      });
      
      this.isConnected = true;
      console.log('Connected to Gemini Live API');
    } catch (error) {
      console.error('Failed to connect to Gemini Live:', error);
      throw new Error('Failed to connect to Gemini Live API');
    }
  }
  
  /**
   * Disconnect from Gemini Live
   */
  disconnect(): void {
    this.isConnected = false;
    this.conversationHistory = [];
    console.log('Disconnected from Gemini Live API');
  }
  
  /**
   * Send text message and get response
   */
  async sendText(text: string): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Not connected to Gemini Live. Call connect() first.');
    }
    
    try {
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        parts: [{ text }],
      });
      
      // Generate response
      const chat = this.model.startChat({
        history: this.conversationHistory.slice(0, -1), // Exclude the last message
      });
      
      const result = await chat.sendMessage(text);
      const response = result.response.text();
      
      // Add assistant response to history
      this.conversationHistory.push({
        role: 'model',
        parts: [{ text: response }],
      });
      
      return response;
    } catch (error) {
      console.error('Error sending text to Gemini Live:', error);
      throw new Error('Failed to get response from Gemini Live');
    }
  }
  
  /**
   * Send audio and get text response
   * Note: Full native audio streaming requires Gemini Live API access
   * This implementation uses audio-to-text conversion
   */
  async sendAudio(audioData: ArrayBuffer): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Not connected to Gemini Live. Call connect() first.');
    }
    
    try {
      // Convert audio to base64
      const base64Audio = this.arrayBufferToBase64(audioData);
      
      // Send audio with multimodal prompt
      const result = await this.model.generateContent([
        {
          inlineData: {
            mimeType: 'audio/wav',
            data: base64Audio,
          },
        },
        { text: 'Please transcribe and respond to this audio message.' },
      ]);
      
      const response = result.response.text();
      
      // Add to conversation history
      this.conversationHistory.push({
        role: 'user',
        parts: [{ text: '[Audio message]' }],
      });
      
      this.conversationHistory.push({
        role: 'model',
        parts: [{ text: response }],
      });
      
      return response;
    } catch (error) {
      console.error('Error sending audio to Gemini Live:', error);
      throw new Error('Failed to process audio with Gemini Live');
    }
  }
  
  /**
   * Stream audio response (placeholder for future native audio streaming)
   * Currently returns text that can be converted to speech using Web Speech API
   */
  async streamAudioResponse(text: string): Promise<AsyncGenerator<string, void, unknown>> {
    if (!this.isConnected) {
      throw new Error('Not connected to Gemini Live. Call connect() first.');
    }
    
    const self = this;
    
    async function* generator() {
      try {
        const chat = self.model.startChat({
          history: self.conversationHistory,
        });
        
        const result = await chat.sendMessageStream(text);
        
        let fullResponse = '';
        
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          fullResponse += chunkText;
          yield chunkText;
        }
        
        // Add to history
        self.conversationHistory.push({
          role: 'user',
          parts: [{ text }],
        });
        
        self.conversationHistory.push({
          role: 'model',
          parts: [{ text: fullResponse }],
        });
      } catch (error) {
        console.error('Error streaming from Gemini Live:', error);
        throw new Error('Failed to stream response from Gemini Live');
      }
    }
    
    return generator();
  }
  
  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }
  
  /**
   * Get conversation history
   */
  getHistory(): Array<{ role: string; parts: any[] }> {
    return [...this.conversationHistory];
  }
  
  /**
   * Check if connected
   */
  getIsConnected(): boolean {
    return this.isConnected;
  }
  
  /**
   * Update system prompt
   */
  updateSystemPrompt(prompt: string): void {
    this.config.systemPrompt = prompt;
    // Reconnect to apply new system prompt
    if (this.isConnected) {
      this.disconnect();
      this.connect();
    }
  }
  
  /**
   * Helper: Convert ArrayBuffer to base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  
  /**
   * Helper: Convert base64 to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

// ============================================================================
// Audio Processing Utilities
// ============================================================================

/**
 * Convert audio blob to ArrayBuffer
 */
export const blobToArrayBuffer = (blob: Blob): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
};

/**
 * Record audio from microphone
 */
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  
  async start(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.start();
    } catch (error) {
      console.error('Failed to start audio recording:', error);
      throw new Error('Failed to access microphone');
    }
  }
  
  async stop(): Promise<ArrayBuffer> {
    if (!this.mediaRecorder) {
      throw new Error('MediaRecorder not initialized');
    }
    
    return new Promise((resolve, reject) => {
      this.mediaRecorder!.onstop = async () => {
        try {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
          const arrayBuffer = await blobToArrayBuffer(audioBlob);
          
          // Clean up
          if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
          }
          
          resolve(arrayBuffer);
        } catch (error) {
          reject(error);
        }
      };
      
      this.mediaRecorder!.stop();
    });
  }
  
  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create and initialize Gemini Live client
 */
export const createGeminiLiveClient = async (
  apiKey: string,
  config?: Partial<GeminiLiveConfig>
): Promise<GeminiLiveClient> => {
  const client = new GeminiLiveClient({
    apiKey,
    ...config,
  });
  
  await client.connect();
  return client;
};
