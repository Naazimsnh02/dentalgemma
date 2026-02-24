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
  // Mode is locked to 'standard' for now, enhanced mode hidden but code kept for future use
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

  // Initialize clients based on mode
  useEffect(() => {
    const initClients = async () => {
      console.log(`🔧 Initializing clients for ${mode} mode...`);
      
      if (mode === 'enhanced') {
        // Stop Modal client if running
        if (modalClientRef.current) {
          console.log('🛑 Stopping Modal client...');
          modalClientRef.current.stopKeepAlive();
          modalClientRef.current = null;
        }

        // Initialize Gemini client for enhanced mode (if API key available)
        if (!geminiClientRef.current) {
          const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
          console.log('🔑 Gemini API key present:', !!apiKey);
          
          if (apiKey) {
            try {
              console.log('🔄 Creating Gemini Live client...');
              geminiClientRef.current = await createGeminiLiveClient(apiKey);
              console.log('✅ Enhanced mode: Using Gemini Live only');
            } catch (error) {
              console.error('❌ Failed to initialize Gemini client:', error);
              setError('Failed to initialize Gemini client. Switching to standard mode.');
              setMode('standard');
            }
          } else {
            console.error('❌ Gemini API key not configured');
            setError('Gemini API key not configured. Switching to standard mode.');
            setMode('standard');
          }
        } else {
          console.log('✅ Gemini client already initialized');
        }
      } else {
        // Stop Gemini client if running
        if (geminiClientRef.current) {
          console.log('🛑 Stopping Gemini client...');
          geminiClientRef.current.disconnect();
          geminiClientRef.current = null;
        }

        // Initialize Modal client for standard mode
        if (!modalClientRef.current) {
          console.log('🔄 Creating Modal client...');
          modalClientRef.current = new ModalClient();
          // Keep-alive disabled to save costs - Modal wakes on-demand
          // modalClientRef.current.startKeepAlive();
          console.log('✅ Standard mode: Using DentalGemma via Modal');
        } else {
          console.log('✅ Modal client already initialized');
        }
      }
    };

    initClients();

    return () => {
      modalClientRef.current?.stopKeepAlive();
      geminiClientRef.current?.disconnect();
    };
  }, [mode]);

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
        // In continuous mode, automatically restart recognition if still listening
        // This prevents the mic from stopping during pauses in speech
        if (settings.continuous && isListening) {
          console.log('🔄 Recognition ended, restarting in continuous mode...');
          try {
            recognition.start();
          } catch (error) {
            console.error('Failed to restart recognition:', error);
            setIsListening(false);
            if (audioStream) {
              audioStream.getTracks().forEach(track => track.stop());
              setAudioStream(null);
            }
          }
        } else {
          setIsListening(false);
          if (audioStream) {
            audioStream.getTracks().forEach(track => track.stop());
            setAudioStream(null);
          }
        }
      });

      recognitionRef.current = recognition;
    } catch (error) {
      console.error('Failed to initialize recognition:', error);
      setError('Failed to initialize speech recognition');
    }
  }, [settings.continuous, settings.language, audioStream, isListening]);

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

    // Capture current mode for error reporting
    const currentMode = mode;

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

      if (currentMode === 'enhanced') {
        // Enhanced mode: Use ONLY Gemini Live
        if (!geminiClientRef.current) {
          console.error('❌ Gemini client is null in enhanced mode');
          throw new Error('Gemini client not initialized. Please switch to standard mode or check your API key.');
        }
        console.log('🚀 Enhanced mode: Sending to Gemini Live...');
        aiResponse = await geminiClientRef.current.sendText(text);
        console.log('✅ Received response from Gemini Live');
      } else {
        // Standard mode: Use ONLY Modal.com DentalGemma
        if (!modalClientRef.current) {
          console.error('❌ Modal client is null in standard mode');
          throw new Error('Modal client not initialized');
        }
        console.log('🚀 Standard mode: Sending to DentalGemma via Modal...');
        aiResponse = await modalClientRef.current.chat(text, messages);
        console.log('✅ Received response from Modal');
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
      console.error(`❌ Error processing message in ${currentMode} mode:`, error);
      setError(`Failed to get AI response (${currentMode} mode). Please try again.`);
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

  // Handle mode change - kept for future use when enhanced mode is re-enabled
  const handleModeChange = useCallback((newMode: VoiceMode) => {
    // Mode switching disabled for now - always use standard mode
    if (newMode !== 'standard') {
      console.log('Enhanced mode is currently disabled');
      return;
    }

    if (isListening) {
      handleStopListening();
    }

    console.log(`🔄 Switching from ${mode} to ${newMode} mode...`);
    setMode(newMode);
  }, [isListening, handleStopListening, mode]);

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
          <div className="bg-card text-card-foreground rounded-lg shadow-lg p-6 border border-border">
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
              currentTranscript={currentTranscript}
              onSubmit={() => handleUserMessage(currentTranscript)}
            />
          </div>

          {/* Audio Visualizer */}
          <div className="bg-card text-card-foreground rounded-lg shadow-lg p-6 border border-border">
            <h3 className="text-lg font-semibold mb-4">Audio Visualization</h3>
            <AudioVisualizer
              isActive={isListening}
              audioStream={audioStream || undefined}
              height={120}
              barCount={64}
              barColor="#3b82f6"
              backgroundColor="transparent"
            />
          </div>

        </div>

        {/* Right Column: Transcript */}
        <div className="h-[600px] lg:h-[670px]">
          <TranscriptViewer
            messages={messages}
            currentTranscript={currentTranscript}
            isLive={isListening}
            onClear={handleClearTranscript}
            onSendMessage={handleUserMessage}
          />
        </div>
      </div>
    </div>
  );
}
