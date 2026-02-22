'use client';

import { FileJson, FileText } from 'lucide-react';
import type { XRayAnalysis } from '@/types';

interface AnalysisResultsProps {
  analysis: XRayAnalysis;
  onExportPDF?: () => void;
  onExportJSON?: () => void;
  className?: string;
}

// Helper function to strip markdown formatting
function stripMarkdown(text: string): string {
  return text
    // Remove bold/italic markers
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bullet points and list markers
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`(.+?)`/g, '$1')
    // Remove links but keep text
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function AnalysisResults({
  analysis,
  onExportPDF,
  onExportJSON,
  className = '',
}: AnalysisResultsProps) {
  // Get the raw text and strip markdown
  const rawText = analysis.rawAnalysis || analysis.findings.join(' ');
  const plainText = stripMarkdown(rawText);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Single Clinical Analysis Card */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Clinical Analysis
        </h3>
        <div className="text-foreground leading-relaxed whitespace-pre-wrap text-base">
          {plainText}
        </div>
      </div>

      {/* Export buttons */}
      <div className="flex items-center justify-center space-x-4 pt-4 border-t border-border">
        <button
          onClick={onExportPDF}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <FileText className="w-4 h-4" />
          <span>Export PDF</span>
        </button>
        <button
          onClick={onExportJSON}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          <FileJson className="w-4 h-4" />
          <span>Export JSON</span>
        </button>
      </div>
    </div>
  );
}
