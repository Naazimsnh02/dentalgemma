'use client';

/**
 * Tool Call Log Component
 * 
 * Displays detailed logs of all tool calls with inputs and outputs
 * Requirements: 4.8
 */

import { useState } from 'react';
import { WorkflowStep } from '@/types';
import { ChevronDown, ChevronRight, Code, Terminal } from 'lucide-react';

interface ToolCallLogProps {
  steps: WorkflowStep[];
  className?: string;
}

export function ToolCallLog({ steps, className = '' }: ToolCallLogProps) {
  const toolSteps = steps.filter(step => step.tool);

  if (toolSteps.length === 0) {
    return (
      <div className={`text-center p-8 text-gray-500 ${className}`}>
        <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No tool calls yet</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {toolSteps.map((step, index) => (
        <ToolCallItem key={index} step={step} index={index} />
      ))}
    </div>
  );
}

/**
 * Individual Tool Call Item
 */
interface ToolCallItemProps {
  step: WorkflowStep;
  index: number;
}

function ToolCallItem({ step, index }: ToolCallItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isFailed = !!step.output?.error;

  return (
    <div
      className={`
        border rounded-lg overflow-hidden transition-all
        ${isFailed ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}
      `}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
      >
        {/* Expand Icon */}
        <div className="flex-shrink-0">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
        </div>

        {/* Tool Icon */}
        <div
          className={`
          flex-shrink-0 w-8 h-8 rounded flex items-center justify-center
          ${isFailed ? 'bg-red-500' : 'bg-blue-500'}
        `}
        >
          <Code className="h-4 w-4 text-white" />
        </div>

        {/* Tool Info */}
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm font-semibold text-gray-900">{step.tool}</span>
            <span className="text-xs text-gray-500">#{index + 1}</span>
          </div>
          <p className="text-xs text-gray-600 truncate">{step.action}</p>
        </div>

        {/* Status */}
        <div className="flex-shrink-0">
          {isFailed ? (
            <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">
              Failed
            </span>
          ) : (
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
              Success
            </span>
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50">
          {/* Input Section */}
          {step.input && (
            <div className="p-4 border-b border-gray-200">
              <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Input
              </h4>
              <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">
                <code>{JSON.stringify(step.input, null, 2)}</code>
              </pre>
            </div>
          )}

          {/* Output Section */}
          {step.output && (
            <div className="p-4">
              <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${isFailed ? 'bg-red-500' : 'bg-green-500'}`}
                />
                Output
              </h4>
              <pre
                className={`
                text-xs p-3 rounded border overflow-x-auto
                ${isFailed ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}
              `}
              >
                <code>{JSON.stringify(step.output, null, 2)}</code>
              </pre>
            </div>
          )}

          {/* Metadata */}
          <div className="px-4 pb-4 flex items-center gap-4 text-xs text-gray-500">
            <div>
              <span className="font-medium">Agent:</span> {step.agent}
            </div>
            <div>
              <span className="font-medium">Time:</span>{' '}
              {new Date(step.timestamp).toLocaleTimeString()}
            </div>
            {step.confidence > 0 && (
              <div>
                <span className="font-medium">Confidence:</span>{' '}
                {Math.round(step.confidence * 100)}%
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact Tool Call Summary
 */
interface ToolCallSummaryProps {
  steps: WorkflowStep[];
  className?: string;
}

export function ToolCallSummary({ steps, className = '' }: ToolCallSummaryProps) {
  const toolSteps = steps.filter(step => step.tool);
  const successCount = toolSteps.filter(step => !step.output?.error).length;
  const failureCount = toolSteps.filter(step => step.output?.error).length;

  return (
    <div className={`flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 ${className}`}>
      <Terminal className="h-5 w-5 text-gray-500" />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">Tool Calls</p>
        <p className="text-xs text-gray-600">
          {toolSteps.length} total • {successCount} successful • {failureCount} failed
        </p>
      </div>
      <div className="flex gap-2">
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{successCount}</div>
          <div className="text-xs text-gray-500">Success</div>
        </div>
        {failureCount > 0 && (
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{failureCount}</div>
            <div className="text-xs text-gray-500">Failed</div>
          </div>
        )}
      </div>
    </div>
  );
}
