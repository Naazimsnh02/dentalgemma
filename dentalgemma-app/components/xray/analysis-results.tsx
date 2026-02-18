'use client';

import { Download, FileJson, FileText, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { MarkdownRenderer } from '@/components/shared/markdown-renderer';
import type { XRayAnalysis, UrgencyLevel } from '@/types';

interface AnalysisResultsProps {
  analysis: XRayAnalysis;
  onExportPDF?: () => void;
  onExportJSON?: () => void;
  className?: string;
}

const urgencyConfig: Record<
  UrgencyLevel,
  { color: string; bgColor: string; icon: React.ReactNode; label: string }
> = {
  emergency: {
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-card border-border',
    icon: <AlertTriangle className="w-5 h-5" />,
    label: 'Emergency',
  },
  urgent: {
    color: 'text-orange-700 dark:text-orange-400',
    bgColor: 'bg-card border-border',
    icon: <AlertTriangle className="w-5 h-5" />,
    label: 'Urgent',
  },
  routine: {
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-card border-border',
    icon: <Info className="w-5 h-5" />,
    label: 'Routine',
  },
  'home-care': {
    color: 'text-foreground',
    bgColor: 'bg-card border-border',
    icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    label: 'Home Care',
  },
};

export function AnalysisResults({
  analysis,
  onExportPDF,
  onExportJSON,
  className = '',
}: AnalysisResultsProps) {
  const urgency = urgencyConfig[analysis.urgency];

  const renderTypeSpecificInfo = () => {
    switch (analysis.type) {
      case 'photo':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Condition:
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                analysis.condition === 'decay'
                  ? 'bg-destructive text-destructive-foreground border-destructive'
                  : analysis.condition === 'other'
                  ? 'bg-orange-100 text-orange-800 border-orange-300'
                  : 'bg-success text-success-foreground border-success'
              }`}>
                {analysis.condition === 'decay' ? 'Decay Detected' 
                  : analysis.condition === 'other' ? 'Other Finding' 
                  : 'Healthy'}
              </span>
            </div>
            {analysis.severity && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Severity:
                </span>
                <span className="text-sm font-medium text-foreground capitalize">
                  {analysis.severity}
                </span>
              </div>
            )}
          </div>
        );

      case 'xray':
        return (
          <div className="space-y-2">
            {analysis.pathologyClass && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Primary Pathology:
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary text-primary-foreground border border-primary">
                  {analysis.pathologyClass}
                </span>
              </div>
            )}
            {analysis.differentialDiagnosis && analysis.differentialDiagnosis.length > 0 && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Differential Diagnosis:
                </span>
                <ul className="mt-1 space-y-1">
                  {analysis.differentialDiagnosis.map((dx, i) => (
                    <li key={i} className="text-sm text-foreground flex items-center gap-2">
                      <span className="text-muted-foreground">•</span> {dx}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with urgency indicator */}
      <div className={`p-4 rounded-lg border ${urgency.bgColor}`}>
        <div className="flex items-center space-x-3">
          <div className={urgency.color}>{urgency.icon}</div>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${urgency.color}`}>
              {urgency.label} Priority
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Analysis Type: {analysis.type === 'photo' ? 'Clinical Photo' : 'X-Ray Analysis'}
            </p>
          </div>
        </div>
      </div>

      {/* Type-specific information */}
      <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
        <h4 className="text-md font-semibold text-foreground mb-4">
          Analysis Details
        </h4>
        {renderTypeSpecificInfo()}
      </div>

      {/* Findings */}
      {analysis.findings.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
          <h4 className="text-md font-semibold text-foreground mb-3">
            Findings
          </h4>
          <div className="space-y-3">
            {analysis.findings.map((finding, index) => (
              <div key={index} className="flex items-start space-x-2">
                {/* Only show bullet if finding doesn't start with markdown header */}
                {!finding.trim().startsWith('#') && (
                  <span className="text-blue-500 mt-1.5 flex-shrink-0">•</span>
                )}
                <div className="flex-1 min-w-0">
                  <MarkdownRenderer content={finding} className="text-sm prose prose-sm dark:prose-invert max-w-none" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
          <h4 className="text-md font-semibold text-foreground mb-3">
            Recommendations
          </h4>
          <div className="space-y-3">
            {analysis.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-2">
                {/* Only show checkmark if recommendation doesn't start with markdown header */}
                {!recommendation.trim().startsWith('#') && (
                  <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <MarkdownRenderer content={recommendation} className="text-sm prose prose-sm dark:prose-invert max-w-none" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Processing time */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Processing time: {analysis.processingTime}ms
      </div>

      {/* Export buttons */}
      <div className="flex items-center justify-center space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
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
