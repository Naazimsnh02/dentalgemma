'use client';

// ============================================================================
// Audio Visualizer Component
// Real-time waveform visualization using Web Audio API and Canvas
// ============================================================================

import { useEffect, useRef, useState } from 'react';

export interface AudioVisualizerProps {
  isActive: boolean;
  audioStream?: MediaStream;
  height?: number;
  barCount?: number;
  barColor?: string;
  backgroundColor?: string;
}

export default function AudioVisualizer({
  isActive,
  audioStream,
  height = 100,
  barCount = 64,
  barColor = '#3b82f6',
  backgroundColor = 'transparent',
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const audioContextRef = useRef<AudioContext | undefined>(undefined);
  const analyserRef = useRef<AnalyserNode | undefined>(undefined);
  const dataArrayRef = useRef<Uint8Array | undefined>(undefined);
  const sourceRef = useRef<MediaStreamAudioSourceNode | undefined>(undefined);

  const [noiseLevel, setNoiseLevel] = useState(0);

  useEffect(() => {
    if (!isActive || !audioStream) {
      // Clean up
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      return;
    }

    // Initialize Web Audio API
    const initAudio = async () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContextClass();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(audioStream);

        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        source.connect(analyser);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        dataArrayRef.current = dataArray;
        sourceRef.current = source;

        // Start visualization
        visualize();
      } catch (error) {
        console.error('Failed to initialize audio visualization:', error);
      }
    };

    initAudio();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isActive, audioStream]);

  const visualize = () => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    const bufferLength = analyser.frequencyBinCount;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      if (!dataArray) return;
      
      // @ts-ignore - TypeScript has issues with Uint8Array buffer types
      analyser.getByteFrequencyData(dataArray);

      // Calculate average noise level
      const average = Array.from(dataArray).reduce((sum, value) => sum + value, 0) / bufferLength;
      setNoiseLevel(Math.round((average / 255) * 100));

      // Clear canvas
      canvasCtx.fillStyle = backgroundColor;
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw bars
      const barWidth = canvas.width / barCount;
      let x = 0;

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * bufferLength);
        const barHeight = (dataArray[dataIndex] / 255) * canvas.height;

        // Create gradient for bars
        const gradient = canvasCtx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, barColor);
        gradient.addColorStop(1, adjustColorOpacity(barColor, 0.5));

        canvasCtx.fillStyle = gradient;
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);

        x += barWidth;
      }
    };

    draw();
  };

  // Helper function to adjust color opacity
  const adjustColorOpacity = (color: string, opacity: number): string => {
    // Simple implementation for hex colors
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
  };

  return (
    <div className="w-full space-y-2">
      {/* Canvas for waveform */}
      <div className="relative w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={height}
          className="w-full"
          style={{ height: `${height}px` }}
        />
        
        {/* Overlay when not active */}
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <p className="text-gray-400 dark:text-gray-400">Audio visualization inactive</p>
          </div>
        )}
      </div>

      {/* Noise level indicator */}
      {isActive && (
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">Noise Level:</span>
          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-200 ${
                noiseLevel > 70
                  ? 'bg-red-500'
                  : noiseLevel > 40
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${noiseLevel}%` }}
            />
          </div>
          <span className="text-sm font-medium w-12 text-right">
            {noiseLevel}%
          </span>
        </div>
      )}

      {/* Noise level warning */}
      {isActive && noiseLevel > 70 && (
        <div className="flex items-center space-x-2 text-sm text-yellow-600 dark:text-yellow-400">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>High background noise detected</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Simple Waveform Visualizer (Alternative)
// ============================================================================

export interface SimpleWaveformProps {
  isActive: boolean;
  amplitude?: number;
}

export function SimpleWaveform({ isActive, amplitude = 0.5 }: SimpleWaveformProps) {
  return (
    <div className="flex items-center justify-center space-x-1 h-16">
      {[...Array(20)].map((_, i) => {
        const height = isActive
          ? Math.random() * 100 * amplitude + 20
          : 20;
        
        return (
          <div
            key={i}
            className={`w-1 bg-blue-500 rounded-full transition-all duration-150 ${
              isActive ? 'animate-pulse' : ''
            }`}
            style={{
              height: `${height}%`,
              animationDelay: `${i * 50}ms`,
            }}
          />
        );
      })}
    </div>
  );
}
