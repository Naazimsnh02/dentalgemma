'use client';

import { Download, FileJson, FileText, AlertTriangle, CheckCircle, Info } from 'lucide-react';
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
    bgColor: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
    icon: <AlertTriangle className="w-5 h-5" />,
    label: 'Emergency',
  },
  urgent: {
    color: 'text-orange-700 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800',
    icon: <AlertTriangle className="w-5 h-5" />,
    label: 'Urgent',
  },
  routine: {
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
    icon: <Info className="w-5 h-5" />,
    label: 'Routine',
  },
  'home-care': {
    color: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
    icon: <CheckCircle className="w-5 h-5" />,
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
      case 'cavity':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Cavity Count:
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {analysis.cavityCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Classification:
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  analysis.classification === 'cavity'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                }`}
              >
                {analysis.classification === 'cavity' ? 'Cavity Detected' : 'Normal'}
              </span>
            </div>
          </div>
        );

      case 'opg':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Pathology Class:
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                {analysis.pathologyClass}
              </span>
            </div>
          </div>
        );

      case 'tooth-id':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Teeth:
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {analysis.toothCount}
              </span>
            </div>
            {analysis.toothTypes.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tooth Types:
                </p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {analysis.toothTypes.map((tooth, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm py-1 px-2 bg-gray-50 dark:bg-gray-800 rounded"
                    >
                      <span className="text-gray-600 dark:text-gray-400">{tooth.tooth}</span>
                      <span className="text-gray-900 dark:text-gray-100">{tooth.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'general':
        return (
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quality Assessment:
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {analysis.qualityAssessment}
              </p>
            </div>
            {analysis.reportSections.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Report Sections:
                </p>
                <div className="space-y-2">
                  {analysis.reportSections.map((section, index) => (
                    <div
                      key={index}
                      className="text-sm text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-800 rounded"
                    >
                      {section}
                    </div>
                  ))}
                </div>
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
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Analysis Type: {analysis.type.toUpperCase()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Confidence</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {Math.round(analysis.confidence * 100)}%
            </p>
          </div>
        </div>
      </div>

      {/* Type-specific information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Analysis Details
        </h4>
        {renderTypeSpecificInfo()}
      </div>

      {/* Findings */}
      {analysis.findings.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Findings
          </h4>
          <ul className="space-y-2">
            {analysis.findings.map((finding, index) => (
              <li
                key={index}
                className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <span className="text-blue-500 mt-1">•</span>
                <span>{finding}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Recommendations
          </h4>
          <ul className="space-y-2">
            {analysis.recommendations.map((recommendation, index) => (
              <li
                key={index}
                className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
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
