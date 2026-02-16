'use client';

// ============================================================================
// Voice Consultation Page
// Hybrid voice consultation with Web Speech API and Gemini Live
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';
import VoiceInterface, { VoiceInterfaceSettings } from '@/components/voice/voice-interface';
import AudioVisualizer from '@/components/voice/audio-visualizer';
import TranscriptViewer from '@/components/voice/transcript-viewer';
import { VoiceMode, VoiceMessage, VoiceSession } from '@/types';
import { 
  WebSpeechRecognition, 
  WebSpeechSynthesis, 
  isWebSpeechSupported,
  waitForVoices 
} from '@/lib/voice/web-speech';
import { GeminiLiveClient, createGeminiLiveClient } from '@/lib/voice/gemini-live';
import { ModalClient } from '@/lib/api/modal-client';

export default function VoiceConsultationPage() {
  // State
  const [mode, setMode] = useState<VoiceMode>('standard');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<VoiceInterfaceSettings>({
    continuous: true,
    language: 'en-US',
    speechRate: 1.0,
    pitch: 1.0,
    volume: 1.0,
  });

  // Refs
  const recognitionRef = useRef<WebSpeechRecognition | null>(null);
  const synthesisRef = useRef<WebSpeechSynthesis | null>(null);
  const geminiClientRef = useRef<GeminiLiveClient | null>(null);
  const modalClientRef = useRef<ModalClient | null>(null);
  const sessionIdRef = useRef<string>(Date.now().toString());

  // Check browser support
  useEffect(() => {
    if (!isWebSpeechSupported()) {
      setError('Web Speech API is not supported in this browser. Please use Chrome, Edge, or Safari.');
    }
  }, []);

  // Initialize clients
  useEffect(() => {
    // Initialize Modal client for standard mode
    modalClientRef.current = new ModalClient();
    modalClientRef.current.startKeepAlive();

    // Initialize Gemini client for enhanced mode (if API key available)
    const initGemini = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (apiKey) {
        try {
          geminiClientRef.current = await createGeminiLiveClient(apiKey);
        } catch (error) {
          console.error('Failed to initialize Gemini client:', error);
        }
      }
    };

    initGemini();

    return () => {
      modalClientRef.current?.stopKeepAlive();
      geminiClientRef.current?.disconnect();
    };
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize speech recognition
  const initRecognition = useCallback(() => {
    try {
      const recognition = new WebSpeechRecognition({
        continuous: settings.continuous,
        interimResults: true,
        language: settings.language,
      });

      recognition.onResult((result) => {
        setCurrentTranscript(result.transcript);

        if (result.isFinal) {
          handleUserMessage(result.transcript);
          setCurrentTranscript('');
        }
      });

      recognition.onError((event) => {
        console.error('Speech recognition error:', event);
        setError(`Recognition error: ${event.error}`);
        setIsListening(false);
      });

      recognition.onEnd(() => {
        setIsListening(false);
        if (audioStream) {
          audioStream.getTracks().forEach(track => track.stop());
          setAudioStream(null);
        }
      });

      recognitionRef.current = recognition;
    } catch (error) {
      console.error('Failed to initialize recognition:', error);
      setError('Failed to initialize speech recognition');
    }
  }, [settings.continuous, settings.language, audioStream]);

  // Initialize speech synthesis
  const initSynthesis = useCallback(async () => {
    try {
      await waitForVoices();
      
      const synthesis = new WebSpeechSynthesis({
        rate: settings.speechRate,
        pitch: settings.pitch,
        volume: settings.volume,
        language: settings.language,
      });

      synthesisRef.current = synthesis;
    } catch (error) {
      console.error('Failed to initialize synthesis:', error);
      setError('Failed to initialize speech synthesis');
    }
  }, [settings.speechRate, settings.pitch, settings.volume, settings.language]);

  // Handle user message
  const handleUserMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: VoiceMessage = {
      id: Date.now().toString(),
      speaker: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      let aiResponse: string;

      if (mode === 'enhanced' && geminiClientRef.current) {
        // Use Gemini Live
        aiResponse = await geminiClientRef.current.sendText(text);
      } else {
        // Use standard mode with Modal.com
        if (!modalClientRef.current) {
          throw new Error('Modal client not initialized');
        }
        aiResponse = await modalClientRef.current.chat(text, messages);
      }

      // Add AI response
      const aiMessage: VoiceMessage = {
        id: (Date.now() + 1).toString(),
        speaker: 'ai',
        text: aiResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

      // Speak the response
      if (synthesisRef.current) {
        setIsSpeaking(true);
        await synthesisRef.current.speak(aiResponse);
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      setError('Failed to get AI response. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [mode, messages]);

  // Start listening
  const handleStartListening = useCallback(async () => {
    if (!isOnline && mode === 'enhanced') {
      setError('Enhanced mode requires internet connection');
      return;
    }

    setError(null);

    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);

      // Initialize recognition if needed
      if (!recognitionRef.current) {
        initRecognition();
      }

      // Initialize synthesis if needed
      if (!synthesisRef.current) {
        await initSynthesis();
      }

      // Start recognition
      recognitionRef.current?.start();
      setIsListening(true);
    } catch (error) {
      console.error('Failed to start listening:', error);
      setError('Failed to access microphone. Please check permissions.');
    }
  }, [isOnline, mode, initRecognition, initSynthesis]);

  // Stop listening
  const handleStopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);

    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
    }
  }, [audioStream]);

  // Handle mode change
  const handleModeChange = useCallback((newMode: VoiceMode) => {
    if (isListening) {
      handleStopListening();
    }

    setMode(newMode);

    if (newMode === 'enhanced' && !geminiClientRef.current) {
      setError('Enhanced mode is not available. Gemini API key not configured.');
      setMode('standard');
    }
  }, [isListening, handleStopListening]);

  // Handle settings change
  const handleSettingsChange = useCallback((newSettings: Partial<VoiceInterfaceSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));

    // Update recognition config
    if (recognitionRef.current && (newSettings.continuous !== undefined || newSettings.language !== undefined)) {
      recognitionRef.current.updateConfig({
        continuous: newSettings.continuous,
        language: newSettings.language,
      });
    }

    // Update synthesis config
    if (synthesisRef.current) {
      synthesisRef.current.updateConfig({
        rate: newSettings.speechRate,
        pitch: newSettings.pitch,
        volume: newSettings.volume,
        language: newSettings.language,
      });
    }
  }, []);

  // Clear transcript
  const handleClearTranscript = useCallback(() => {
    setMessages([]);
    sessionIdRef.current = Date.now().toString();
    
    // Clear Gemini history if in enhanced mode
    if (mode === 'enhanced' && geminiClientRef.current) {
      geminiClientRef.current.clearHistory();
    }
  }, [mode]);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Voice Consultation</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Hands-free dental consultation with AI assistance
        </p>
      </div>

      {/* Connection Status */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <>
              <Wifi className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-600 dark:text-green-400">Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-600 dark:text-red-400">Offline</span>
            </>
          )}
        </div>

        {!isOnline && (
          <div className="text-sm text-yellow-600 dark:text-yellow-400">
            Voice consultation requires internet connection
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Voice Interface and Visualizer */}
        <div className="space-y-6">
          {/* Voice Interface */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
            <VoiceInterface
              mode={mode}
              onModeChange={handleModeChange}
              isListening={isListening}
              onStartListening={handleStartListening}
              onStopListening={handleStopListening}
              isSpeaking={isSpeaking}
              isProcessing={isProcessing}
              settings={settings}
              onSettingsChange={handleSettingsChange}
            />
          </div>

          {/* Audio Visualizer */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Audio Visualization</h3>
            <AudioVisualizer
              isActive={isListening}
              audioStream={audioStream || undefined}
              height={120}
              barCount={64}
              barColor="#3b82f6"
            />
          </div>

        </div>

        {/* Right Column: Transcript */}
        <div className="h-full">
          <TranscriptViewer
            messages={messages}
            currentTranscript={currentTranscript}
            isLive={isListening}
            onClear={handleClearTranscript}
          />
        </div>
      </div>
    </div>
  );
}
