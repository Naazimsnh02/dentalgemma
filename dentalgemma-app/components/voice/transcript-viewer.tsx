'use client';

// ============================================================================
// Transcript Viewer Component
// Display live transcription with timestamps and export functionality
// ============================================================================

import { useEffect, useRef, useState } from 'react';
import { Download, Copy, Trash2, User, Bot } from 'lucide-react';
import { MarkdownRenderer } from '@/components/shared/markdown-renderer';
import { VoiceMessage } from '@/types';

export interface TranscriptViewerProps {
  messages: VoiceMessage[];
  currentTranscript?: string;
  isLive?: boolean;
  onExport?: () => void;
  onClear?: () => void;
}

export default function TranscriptViewer({
  messages,
  currentTranscript,
  isLive = false,
  onExport,
  onClear,
}: TranscriptViewerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentTranscript]);

  const formatTimestamp = (date: Date): string => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleCopyMessage = async (message: VoiceMessage) => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopiedId(message.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const handleExportTranscript = () => {
    if (!onExport) return;
    onExport();
  };

  const handleClearTranscript = () => {
    if (!onClear) return;
    if (confirm('Are you sure you want to clear the transcript?')) {
      onClear();
    }
  };

  const exportAsText = () => {
    const text = messages
      .map((msg) => {
        const speaker = msg.speaker === 'user' ? 'You' : 'AI Assistant';
        const timestamp = formatTimestamp(msg.timestamp);
        return `[${timestamp}] ${speaker}: ${msg.text}`;
      })
      .join('\n\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Conversation Transcript</h3>
          {isLive && (
            <span className="flex items-center space-x-1 text-sm text-red-500">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span>Live</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportAsText}
            disabled={messages.length === 0}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export transcript"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={handleClearTranscript}
            disabled={messages.length === 0}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            title="Clear transcript"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !currentTranscript ? (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-400">
            <p>No messages yet. Start speaking to begin the conversation.</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onCopy={handleCopyMessage}
                isCopied={copiedId === message.id}
              />
            ))}

            {/* Current live transcript */}
            {currentTranscript && (
              <div className="flex items-start space-x-3 opacity-60">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
                    <p className="text-sm italic">{currentTranscript}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Listening...</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>{messages.length} messages</span>
          <span>
            {messages.filter((m) => m.speaker === 'user').length} from you,{' '}
            {messages.filter((m) => m.speaker === 'ai').length} from AI
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Message Bubble Component
// ============================================================================

interface MessageBubbleProps {
  message: VoiceMessage;
  onCopy: (message: VoiceMessage) => void;
  isCopied: boolean;
}

function MessageBubble({ message, onCopy, isCopied }: MessageBubbleProps) {
  const isUser = message.speaker === 'user';

  const formatTimestamp = (date: Date): string => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`flex items-start space-x-3 ${isUser ? '' : 'flex-row-reverse space-x-reverse'}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-blue-100 dark:bg-blue-900'
            : 'bg-green-100 dark:bg-green-900'
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        ) : (
          <Bot className="w-5 h-5 text-green-600 dark:text-green-400" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 ${isUser ? '' : 'flex flex-col items-end'}`}>
        <div
          className={`rounded-lg p-3 max-w-[80%] ${
            isUser
              ? 'bg-blue-50 dark:bg-blue-900/30'
              : 'bg-green-50 dark:bg-green-900/30'
          }`}
        >
          <MarkdownRenderer 
            content={message.text} 
            className={`text-sm ${isUser ? 'text-blue-900 dark:text-blue-100' : 'text-green-900 dark:text-green-100'}`} 
          />
        </div>

        {/* Timestamp and Actions */}
        <div className={`flex items-center space-x-2 mt-1 ${isUser ? '' : 'flex-row-reverse space-x-reverse'}`}>
          <span className="text-xs text-gray-400">
            {formatTimestamp(message.timestamp)}
          </span>
          <button
            onClick={() => onCopy(message)}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Copy message"
          >
            {isCopied ? (
              <span className="text-green-500">Copied!</span>
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Export Options Component
// ============================================================================

export interface ExportOptionsProps {
  messages: VoiceMessage[];
  onClose: () => void;
}

export function ExportOptions({ messages, onClose }: ExportOptionsProps) {
  const exportAsText = () => {
    const text = messages
      .map((msg) => {
        const speaker = msg.speaker === 'user' ? 'You' : 'AI Assistant';
        const timestamp = new Date(msg.timestamp).toLocaleString();
        return `[${timestamp}] ${speaker}: ${msg.text}`;
      })
      .join('\n\n');

    downloadFile(text, 'text/plain', 'transcript.txt');
  };

  const exportAsJSON = () => {
    const json = JSON.stringify(messages, null, 2);
    downloadFile(json, 'application/json', 'transcript.json');
  };

  const exportAsMarkdown = () => {
    const markdown = messages
      .map((msg) => {
        const speaker = msg.speaker === 'user' ? '**You**' : '**AI Assistant**';
        const timestamp = new Date(msg.timestamp).toLocaleString();
        return `### ${speaker} - ${timestamp}\n\n${msg.text}\n`;
      })
      .join('\n---\n\n');

    downloadFile(markdown, 'text/markdown', 'transcript.md');
  };

  const downloadFile = (content: string, mimeType: string, filename: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Export Transcript</h3>
        
        <div className="space-y-3">
          <button
            onClick={exportAsText}
            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-left transition-colors"
          >
            <div className="font-medium">Plain Text (.txt)</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Simple text format with timestamps
            </div>
          </button>

          <button
            onClick={exportAsJSON}
            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-left transition-colors"
          >
            <div className="font-medium">JSON (.json)</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Structured data format for processing
            </div>
          </button>

          <button
            onClick={exportAsMarkdown}
            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-left transition-colors"
          >
            <div className="font-medium">Markdown (.md)</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Formatted text with headers
            </div>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
