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
      {/* Mode Toggle */}
      <div className="flex items-center space-x-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
        <button
          onClick={handleModeToggle}
          className={`px-4 py-2 rounded-md transition-colors font-medium ${
            mode === 'standard'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Standard Mode
        </button>
        <button
          onClick={handleModeToggle}
          className={`px-4 py-2 rounded-md transition-colors font-medium ${
            mode === 'enhanced'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Enhanced Mode
        </button>
      </div>

      {/* Mode Description */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400 max-w-md">
        {mode === 'standard' ? (
          <p>Using Web Speech API for speech recognition and synthesis</p>
        ) : (
          <p>Using Gemini Live for native audio processing with sub-500ms latency</p>
        )}
      </div>

      {/* Microphone Button */}
      <div className="relative">
        <button
          onClick={handleMicClick}
          disabled={isProcessing}
          className={`
            relative w-32 h-32 rounded-full flex items-center justify-center
            transition-all duration-300 transform
            ${isListening 
              ? 'bg-red-500 hover:bg-red-600 scale-110 animate-pulse' 
              : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'
            }
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            shadow-lg hover:shadow-xl
            disabled:hover:scale-100
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
            <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-75" />
            <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-pulse" />
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
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {isProcessing ? (
            'Processing...'
          ) : isListening ? (
            isPushToTalk ? 'Listening (Release to stop)' : 'Listening...'
          ) : isSpeaking ? (
            'AI is speaking...'
          ) : (
            'Click to start'
          )}
        </p>
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
          <span className="text-sm text-gray-700 dark:text-gray-300">Continuous Mode</span>
        </label>
      </div>

      {/* Settings Button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
      >
        <Settings className="w-4 h-4" />
        <span>Voice Settings</span>
      </button>

      {/* Settings Panel */}
      {showSettings && (
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold mb-4">Voice Settings</h3>

          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Language</label>
            <select
              value={settings.language}
              onChange={(e) => onSettingsChange({ language: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
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
            <label className="block text-sm font-medium mb-2">
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
            <label className="block text-sm font-medium mb-2">
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
            <label className="block text-sm font-medium mb-2">
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
