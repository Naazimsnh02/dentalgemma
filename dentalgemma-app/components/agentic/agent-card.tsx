'use client';

/**
 * Agent Card Component
 * 
 * Displays individual agent information and status
 * Requirements: 4.8
 */

import { WorkflowStep } from '@/types';
import { Bot, CheckCircle2, Loader2, XCircle } from 'lucide-react';

interface AgentCardProps {
  step: WorkflowStep;
  isActive?: boolean;
  className?: string;
}

export function AgentCard({ step, isActive = false, className = '' }: AgentCardProps) {
  const isFailed = !!step.output?.error;
  const isCompleted = !isActive && !isFailed && step.output;

  return (
    <div
      className={`
        p-4 rounded-lg border transition-all
        ${isActive ? 'border-blue-500 bg-blue-50 shadow-md' : ''}
        ${isCompleted ? 'border-green-500 bg-green-50' : ''}
        ${isFailed ? 'border-red-500 bg-red-50' : ''}
        ${!isActive && !isCompleted && !isFailed ? 'border-gray-200 bg-white' : ''}
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Agent Icon */}
        <div
          className={`
          flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
          ${isActive ? 'bg-blue-500' : ''}
          ${isCompleted ? 'bg-green-500' : ''}
          ${isFailed ? 'bg-red-500' : ''}
          ${!isActive && !isCompleted && !isFailed ? 'bg-gray-300' : ''}
        `}
        >
          {isFailed ? (
            <XCircle className="h-5 w-5 text-white" />
          ) : isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-white" />
          ) : isActive ? (
            <Loader2 className="h-5 w-5 text-white animate-spin" />
          ) : (
            <Bot className="h-5 w-5 text-white" />
          )}
        </div>

        {/* Agent Info */}
        <div className="flex-1 min-w-0">
          <h3
            className={`
            font-semibold text-sm mb-1
            ${isActive ? 'text-blue-700' : ''}
            ${isCompleted ? 'text-green-700' : ''}
            ${isFailed ? 'text-red-700' : ''}
            ${!isActive && !isCompleted && !isFailed ? 'text-gray-700' : ''}
          `}
          >
            {step.agent}
          </h3>
          <p className="text-xs text-gray-600">{step.action}</p>
        </div>

        {/* Status Badge */}
        <div>
          {isActive && (
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
              Running
            </span>
          )}
          {isCompleted && (
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
              Completed
            </span>
          )}
          {isFailed && (
            <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">
              Failed
            </span>
          )}
        </div>
      </div>

      {/* Tool Badge */}
      {step.tool && (
        <div className="mb-3">
          <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 font-mono">
            {step.tool}
          </span>
        </div>
      )}

      {/* Confidence Score */}
      {step.confidence > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Confidence:</span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`
                  h-full transition-all duration-500
                  ${step.confidence >= 0.8 ? 'bg-green-500' : ''}
                  ${step.confidence >= 0.5 && step.confidence < 0.8 ? 'bg-yellow-500' : ''}
                  ${step.confidence < 0.5 ? 'bg-red-500' : ''}
                `}
                style={{ width: `${step.confidence * 100}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-700">
              {Math.round(step.confidence * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* Output Summary */}
      {step.output && (
        <div className="mb-2">
          {step.output.error ? (
            <div className="text-xs text-red-700 bg-red-100 p-2 rounded border border-red-200">
              <strong>Error:</strong> {step.output.error}
            </div>
          ) : step.output.summary ? (
            <div className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-200">
              {step.output.summary}
            </div>
          ) : null}
        </div>
      )}

      {/* Timestamp */}
      <div className="text-xs text-gray-400">
        {new Date(step.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}

/**
 * Agent Grid - Display multiple agents in a grid
 */
interface AgentGridProps {
  steps: WorkflowStep[];
  currentStep?: number;
  className?: string;
}

export function AgentGrid({ steps, currentStep, className = '' }: AgentGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {steps.map((step, index) => (
        <AgentCard key={index} step={step} isActive={currentStep === index} />
      ))}
    </div>
  );
}
