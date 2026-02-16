// ============================================================================
// Web Speech API Client
// Wrapper for browser SpeechRecognition and SpeechSynthesis APIs
// ============================================================================

export interface SpeechRecognitionConfig {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  maxAlternatives?: number;
}

export interface SpeechSynthesisConfig {
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
  volume?: number;
  language?: string;
}

export interface RecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

// Check if Web Speech API is supported
export const isWebSpeechSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const hasSpeechRecognition = 
    'SpeechRecognition' in window || 
    'webkitSpeechRecognition' in window;
  
  const hasSpeechSynthesis = 'speechSynthesis' in window;
  
  return hasSpeechRecognition && hasSpeechSynthesis;
};

// ============================================================================
// Speech Recognition Wrapper
// ============================================================================

export class WebSpeechRecognition {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  
  constructor(config: SpeechRecognitionConfig = {}) {
    if (typeof window === 'undefined') {
      throw new Error('Web Speech API is only available in browser environment');
    }
    
    const SpeechRecognitionAPI = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      throw new Error('Speech Recognition is not supported in this browser');
    }
    
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = config.continuous ?? true;
    recognition.interimResults = config.interimResults ?? true;
    recognition.lang = config.language ?? 'en-US';
    recognition.maxAlternatives = config.maxAlternatives ?? 1;
    
    this.recognition = recognition;
  }
  
  start(): void {
    if (!this.recognition) {
      throw new Error('Speech Recognition not initialized');
    }
    
    if (this.isListening) {
      console.warn('Speech Recognition is already listening');
      return;
    }
    
    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      throw error;
    }
  }
  
  stop(): void {
    if (!this.recognition) return;
    
    try {
      this.recognition.stop();
      this.isListening = false;
    } catch (error) {
      console.error('Failed to stop speech recognition:', error);
    }
  }
  
  abort(): void {
    if (!this.recognition) return;
    
    try {
      this.recognition.abort();
      this.isListening = false;
    } catch (error) {
      console.error('Failed to abort speech recognition:', error);
    }
  }
  
  onResult(callback: (result: RecognitionResult) => void): void {
    if (!this.recognition) return;
    
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      const isFinal = result.isFinal;
      
      callback({ transcript, confidence, isFinal });
    };
  }
  
  onError(callback: (error: SpeechRecognitionErrorEvent) => void): void {
    if (!this.recognition) return;
    this.recognition.onerror = callback;
  }
  
  onStart(callback: () => void): void {
    if (!this.recognition) return;
    this.recognition.onstart = callback;
  }
  
  onEnd(callback: () => void): void {
    if (!this.recognition) return;
    this.recognition.onend = () => {
      this.isListening = false;
      callback();
    };
  }
  
  getIsListening(): boolean {
    return this.isListening;
  }
  
  updateConfig(config: Partial<SpeechRecognitionConfig>): void {
    if (!this.recognition) return;
    
    if (config.continuous !== undefined) {
      this.recognition.continuous = config.continuous;
    }
    if (config.interimResults !== undefined) {
      this.recognition.interimResults = config.interimResults;
    }
    if (config.language !== undefined) {
      this.recognition.lang = config.language;
    }
    if (config.maxAlternatives !== undefined) {
      this.recognition.maxAlternatives = config.maxAlternatives;
    }
  }
}

// ============================================================================
// Speech Synthesis Wrapper
// ============================================================================

export class WebSpeechSynthesis {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private config: SpeechSynthesisConfig;
  
  constructor(config: SpeechSynthesisConfig = {}) {
    if (typeof window === 'undefined') {
      throw new Error('Web Speech API is only available in browser environment');
    }
    
    if (!('speechSynthesis' in window)) {
      throw new Error('Speech Synthesis is not supported in this browser');
    }
    
    this.synth = window.speechSynthesis;
    this.config = {
      rate: config.rate ?? 1.0,
      pitch: config.pitch ?? 1.0,
      volume: config.volume ?? 1.0,
      language: config.language ?? 'en-US',
      voice: config.voice,
    };
  }
  
  speak(text: string): Promise<void> {
    if (!this.synth) {
      return Promise.reject(new Error('Speech Synthesis not initialized'));
    }
    
    // Cancel any ongoing speech
    this.cancel();
    
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Apply configuration
      utterance.rate = this.config.rate ?? 1.0;
      utterance.pitch = this.config.pitch ?? 1.0;
      utterance.volume = this.config.volume ?? 1.0;
      utterance.lang = this.config.language ?? 'en-US';
      
      if (this.config.voice) {
        utterance.voice = this.config.voice;
      }
      
      utterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };
      
      utterance.onerror = (event) => {
        this.currentUtterance = null;
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };
      
      this.currentUtterance = utterance;
      this.synth!.speak(utterance);
    });
  }
  
  pause(): void {
    if (!this.synth) return;
    this.synth.pause();
  }
  
  resume(): void {
    if (!this.synth) return;
    this.synth.resume();
  }
  
  cancel(): void {
    if (!this.synth) return;
    this.synth.cancel();
    this.currentUtterance = null;
  }
  
  isSpeaking(): boolean {
    return this.synth?.speaking ?? false;
  }
  
  isPaused(): boolean {
    return this.synth?.paused ?? false;
  }
  
  getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }
  
  setVoice(voice: SpeechSynthesisVoice): void {
    this.config.voice = voice;
  }
  
  setRate(rate: number): void {
    this.config.rate = Math.max(0.1, Math.min(10, rate));
  }
  
  setPitch(pitch: number): void {
    this.config.pitch = Math.max(0, Math.min(2, pitch));
  }
  
  setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1, volume));
  }
  
  setLanguage(language: string): void {
    this.config.language = language;
  }
  
  updateConfig(config: Partial<SpeechSynthesisConfig>): void {
    if (config.rate !== undefined) this.setRate(config.rate);
    if (config.pitch !== undefined) this.setPitch(config.pitch);
    if (config.volume !== undefined) this.setVolume(config.volume);
    if (config.language !== undefined) this.setLanguage(config.language);
    if (config.voice !== undefined) this.setVoice(config.voice);
  }
  
  getConfig(): SpeechSynthesisConfig {
    return { ...this.config };
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

// Wait for voices to be loaded (some browsers load voices asynchronously)
export const waitForVoices = (): Promise<SpeechSynthesisVoice[]> => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return Promise.resolve([]);
  }
  
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    
    // Wait for voiceschanged event
    const handleVoicesChanged = () => {
      const loadedVoices = window.speechSynthesis.getVoices();
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      resolve(loadedVoices);
    };
    
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    
    // Fallback timeout
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      resolve(window.speechSynthesis.getVoices());
    }, 1000);
  });
};

// Get voices filtered by language
export const getVoicesByLanguage = async (language: string): Promise<SpeechSynthesisVoice[]> => {
  const voices = await waitForVoices();
  return voices.filter(voice => voice.lang.startsWith(language));
};

// Get default voice for a language
export const getDefaultVoice = async (language: string = 'en'): Promise<SpeechSynthesisVoice | null> => {
  const voices = await getVoicesByLanguage(language);
  
  // Prefer default voice
  const defaultVoice = voices.find(voice => voice.default);
  if (defaultVoice) return defaultVoice;
  
  // Otherwise return first available voice
  return voices[0] || null;
};
