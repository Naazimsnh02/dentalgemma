'use client';

// ============================================================================
// Voice Interface Component
// Main interface for voice consultation with mode toggle and settings
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Settings, Loader2 } from 'lucide-react';
import { VoiceMode } from '@/types';

export interface VoiceInterfaceProps {
  mode: VoiceMode;
  onModeChange: (mode: VoiceMode) => void;
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  isSpeaking: boolean;
  isProcessing: boolean;
  settings: VoiceInterfaceSettings;
  onSettingsChange: (settings: Partial<VoiceInterfaceSettings>) => void;
  currentTranscript?: string;
  onSubmit?: () => void;
}

export interface VoiceInterfaceSettings {
  continuous: boolean;
  language: string;
  speechRate: number;
  pitch: number;
  volume: number;
}

export default function VoiceInterface({
  mode,
  onModeChange,
  isListening,
  onStartListening,
  onStopListening,
  isSpeaking,
  isProcessing,
  settings,
  onSettingsChange,
  currentTranscript,
  onSubmit,
}: VoiceInterfaceProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [isPushToTalk, setIsPushToTalk] = useState(!settings.continuous);

  // Update continuous mode when push-to-talk changes
  useEffect(() => {
    onSettingsChange({ continuous: !isPushToTalk });
  }, [isPushToTalk, onSettingsChange]);

  const handleMicClick = useCallback(() => {
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  }, [isListening, onStartListening, onStopListening]);

  const handleModeToggle = useCallback(() => {
    const newMode: VoiceMode = mode === 'standard' ? 'enhanced' : 'standard';
    onModeChange(newMode);
  }, [mode, onModeChange]);

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      {/* Mode Toggle - Hidden for now, keeping code for future use */}
      {false && (
        <div className="flex items-center space-x-4 bg-muted rounded-lg p-2">
          <button
            onClick={handleModeToggle}
            className={`px-4 py-2 rounded-md transition-colors font-medium ${
              mode === 'standard'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            }`}
          >
            Standard Mode
          </button>
          <button
            onClick={handleModeToggle}
            className={`px-4 py-2 rounded-md transition-colors font-medium ${
              mode === 'enhanced'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            }`}
          >
            Enhanced Mode
          </button>
        </div>
      )}

      <div className="text-center text-sm text-muted-foreground max-w-md">
        <p className="mt-2 text-xs opacity-75">
          {!settings.continuous ? "Push-to-Talk: Press and hold to speak. Release to send." : "Continuous: Click once to record. Click again to stop."}
        </p>
      </div>

      {/* Microphone Button */}
      <div className="relative">
        <button
          onClick={settings.continuous ? handleMicClick : undefined}
          onPointerDown={!settings.continuous ? onStartListening : undefined}
          onPointerUp={!settings.continuous ? onStopListening : undefined}
          onPointerLeave={!settings.continuous && isListening ? onStopListening : undefined}
          disabled={isProcessing}
          className={`
            relative w-32 h-32 rounded-full flex items-center justify-center
            transition-all duration-300 transform
            ${isListening 
              ? 'bg-red-500 hover:bg-red-600 scale-110 active:scale-95' 
              : 'bg-blue-500 hover:bg-blue-600 hover:scale-105 active:scale-95'
            }
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            shadow-lg hover:shadow-xl
            disabled:hover:scale-100
            touch-none
          `}
          aria-label={isListening ? 'Stop listening' : 'Start listening'}
        >
          {isProcessing ? (
            <Loader2 className="w-16 h-16 text-white animate-spin" />
          ) : isListening ? (
            <MicOff className="w-16 h-16 text-white" />
          ) : (
            <Mic className="w-16 h-16 text-white" />
          )}
        </button>

        {/* Listening indicator rings */}
        {isListening && !isProcessing && (
          <>
            <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-75 pointer-events-none" />
            <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-pulse pointer-events-none" />
          </>
        )}

        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-3 py-1 rounded-full">
            Speaking...
          </div>
        )}
      </div>

      {/* Status Text */}
      <div className="text-center">
        <p className="text-lg font-medium text-foreground">
          {isProcessing ? (
            'Processing...'
          ) : isListening ? (
             settings.continuous ? 'Listening (Click to stop)' : 'Listening (Release to stop)'
          ) : isSpeaking ? (
            'AI is speaking...'
          ) : (
            settings.continuous ? 'Click to start' : 'Hold to speak'
          )}
        </p>
        
        {/* Interim Transcript display */}
        {isListening && currentTranscript && (
          <p className="mt-2 text-sm text-blue-600 dark:text-blue-400 italic max-w-sm">
            "{currentTranscript}..."
          </p>
        )}

        {/* Manual Submit Button for non-continuous mode or when user wants to force send */}
        {isListening && !settings.continuous && currentTranscript && (
          <button
            onClick={onSubmit}
            className="mt-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            Send Now
          </button>
        )}
      </div>

      {/* Push-to-Talk / Continuous Mode Toggle */}
      <div className="flex items-center space-x-3">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!isPushToTalk}
            onChange={(e) => setIsPushToTalk(!e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-muted-foreground">Continuous Mode</span>
        </label>
      </div>

      {/* Settings Button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="flex items-center space-x-2 px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground"
      >
        <Settings className="w-4 h-4" />
        <span>Voice Settings</span>
      </button>

      {/* Settings Panel */}
      {showSettings && (
        <div className="w-full max-w-md bg-popover text-popover-foreground border border-border rounded-lg shadow-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold mb-4">Voice Settings</h3>

          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">Language</label>
            <select
              value={settings.language}
              onChange={(e) => onSettingsChange({ language: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            >
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="es-ES">Spanish</option>
              <option value="fr-FR">French</option>
              <option value="de-DE">German</option>
              <option value="it-IT">Italian</option>
              <option value="pt-BR">Portuguese (Brazil)</option>
              <option value="zh-CN">Chinese (Simplified)</option>
              <option value="ja-JP">Japanese</option>
              <option value="ko-KR">Korean</option>
            </select>
          </div>

          {/* Speech Rate */}
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              Speech Rate: {settings.speechRate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={settings.speechRate}
              onChange={(e) => onSettingsChange({ speechRate: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Pitch */}
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              Pitch: {settings.pitch.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={settings.pitch}
              onChange={(e) => onSettingsChange({ pitch: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Volume */}
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              Volume: {Math.round(settings.volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.volume}
              onChange={(e) => onSettingsChange({ volume: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Close Button */}
          <button
            onClick={() => setShowSettings(false)}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
