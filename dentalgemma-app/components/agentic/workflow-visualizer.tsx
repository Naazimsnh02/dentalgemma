'use client';

/**
 * Workflow Visualizer Component
 * 
 * Displays animated step-by-step progress of the agentic workflow
 * Requirements: 4.7
 */

import { WorkflowStep } from '@/types';
import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react';

interface WorkflowVisualizerProps {
  steps: WorkflowStep[];
  currentStep?: number;
  className?: string;
}

export function WorkflowVisualizer({
  steps,
  currentStep,
  className = '',
}: WorkflowVisualizerProps) {
  if (steps.length === 0) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
          <p className="text-sm text-gray-600">Initializing workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {steps.map((step, index) => {
        const isActive = currentStep === index;
        const isCompleted = currentStep !== undefined && index < currentStep;
        const isFailed = step.output?.error;

        return (
          <div
            key={index}
            className={`
              relative flex items-start gap-4 p-4 rounded-lg border transition-all
              ${isActive ? 'border-blue-500 bg-blue-50 shadow-md' : ''}
              ${isCompleted ? 'border-green-500 bg-green-50' : ''}
              ${isFailed ? 'border-red-500 bg-red-50' : ''}
              ${!isActive && !isCompleted && !isFailed ? 'border-gray-200 bg-white' : ''}
            `}
          >
            {/* Step Icon */}
            <div className="flex-shrink-0 mt-1">
              {isFailed ? (
                <XCircle className="h-6 w-6 text-red-500" />
              ) : isCompleted ? (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              ) : isActive ? (
                <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
              ) : (
                <Circle className="h-6 w-6 text-gray-300" />
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0">
              {/* Agent Name */}
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className={`
                  font-semibold text-sm
                  ${isActive ? 'text-blue-700' : ''}
                  ${isCompleted ? 'text-green-700' : ''}
                  ${isFailed ? 'text-red-700' : ''}
                  ${!isActive && !isCompleted && !isFailed ? 'text-gray-700' : ''}
                `}
                >
                  {step.agent}
                </h3>
                {step.tool && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {step.tool}
                  </span>
                )}
              </div>

              {/* Action Description */}
              <p className="text-sm text-gray-600 mb-2">{step.action}</p>

              {/* Confidence Score */}
              {step.confidence > 0 && (
                <div className="mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Confidence:</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-xs">
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
                    <span className="text-xs font-medium text-gray-700">
                      {Math.round(step.confidence * 100)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Output Summary */}
              {step.output && (
                <div className="mt-2">
                  {step.output.error ? (
                    <div className="text-xs text-red-600 bg-red-100 p-2 rounded">
                      <strong>Error:</strong> {step.output.error}
                    </div>
                  ) : step.output.summary ? (
                    <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
                      {step.output.summary}
                    </div>
                  ) : null}
                </div>
              )}

              {/* Timestamp */}
              <div className="mt-2 text-xs text-gray-400">
                {new Date(step.timestamp).toLocaleTimeString()}
              </div>
            </div>

            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <div
                className={`
                  absolute left-7 top-12 w-0.5 h-8 -mb-8
                  ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Compact Workflow Progress Bar
 */
interface WorkflowProgressBarProps {
  steps: WorkflowStep[];
  currentStep?: number;
  className?: string;
}

export function WorkflowProgressBar({
  steps,
  currentStep = 0,
  className = '',
}: WorkflowProgressBarProps) {
  const totalSteps = steps.length || 1;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Progress Bar */}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const isActive = currentStep === index;
          const isCompleted = index < currentStep;
          const isFailed = step.output?.error;

          return (
            <div key={index} className="flex flex-col items-center gap-1">
              <div
                className={`
                  w-3 h-3 rounded-full transition-all
                  ${isFailed ? 'bg-red-500' : ''}
                  ${isCompleted && !isFailed ? 'bg-green-500' : ''}
                  ${isActive && !isFailed ? 'bg-blue-500 ring-4 ring-blue-200' : ''}
                  ${!isActive && !isCompleted && !isFailed ? 'bg-gray-300' : ''}
                `}
              />
              <span className="text-xs text-gray-500 text-center max-w-[60px] truncate">
                {step.agent.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Current Step Info */}
      {steps[currentStep] && (
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">{steps[currentStep].agent}</p>
          <p className="text-xs text-gray-500">{steps[currentStep].action}</p>
        </div>
      )}
    </div>
  );
}
