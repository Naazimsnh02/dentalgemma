'use client';

/**
 * Workflow Controls Component
 * 
 * Provides controls for pausing, resuming, and cancelling workflows
 * Also allows manual guidance and overrides
 * Requirements: 4.10
 */

import { useState } from 'react';
import { Pause, Play, X, Settings, AlertCircle } from 'lucide-react';

interface WorkflowControlsProps {
  status: 'running' | 'paused' | 'completed' | 'cancelled' | 'error';
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  onOverride?: (instruction: string) => void;
  className?: string;
}

export function WorkflowControls({
  status,
  onPause,
  onResume,
  onCancel,
  onOverride,
  className = '',
}: WorkflowControlsProps) {
  const [showOverride, setShowOverride] = useState(false);
  const [overrideInstruction, setOverrideInstruction] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const isRunning = status === 'running';
  const isPaused = status === 'paused';
  const isCompleted = status === 'completed';
  const isCancelled = status === 'cancelled';
  const isError = status === 'error';

  const handleOverride = () => {
    if (overrideInstruction.trim() && onOverride) {
      onOverride(overrideInstruction.trim());
      setOverrideInstruction('');
      setShowOverride(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
      setShowCancelConfirm(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Controls */}
      <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Status Indicator */}
        <div className="flex items-center gap-2 flex-1">
          <div
            className={`
            w-3 h-3 rounded-full
            ${isRunning ? 'bg-blue-500 animate-pulse' : ''}
            ${isPaused ? 'bg-yellow-500' : ''}
            ${isCompleted ? 'bg-green-500' : ''}
            ${isCancelled ? 'bg-gray-500' : ''}
            ${isError ? 'bg-red-500' : ''}
          `}
          />
          <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-2">
          {/* Pause/Resume Button */}
          {isRunning && onPause && (
            <button
              onClick={onPause}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors text-sm font-medium"
              title="Pause workflow"
            >
              <Pause className="h-4 w-4" />
              Pause
            </button>
          )}

          {isPaused && onResume && (
            <button
              onClick={onResume}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
              title="Resume workflow"
            >
              <Play className="h-4 w-4" />
              Resume
            </button>
          )}

          {/* Override Button */}
          {(isRunning || isPaused) && onOverride && (
            <button
              onClick={() => setShowOverride(!showOverride)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
              title="Manual override"
            >
              <Settings className="h-4 w-4" />
              Override
            </button>
          )}

          {/* Cancel Button */}
          {(isRunning || isPaused) && onCancel && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
              title="Cancel workflow"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Override Panel */}
      {showOverride && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3 mb-3">
            <Settings className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Manual Override</h3>
              <p className="text-xs text-blue-700">
                Provide specific instructions to guide the workflow. The agents will consider your
                input in their decision-making.
              </p>
            </div>
          </div>

          <textarea
            value={overrideInstruction}
            onChange={e => setOverrideInstruction(e.target.value)}
            placeholder="Enter your instructions (e.g., 'Focus on endodontic treatment options', 'Skip specialist referral')"
            className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            rows={3}
          />

          <div className="flex items-center gap-2">
            <button
              onClick={handleOverride}
              disabled={!overrideInstruction.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
            >
              Apply Override
            </button>
            <button
              onClick={() => {
                setShowOverride(false);
                setOverrideInstruction('');
              }}
              className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Cancel Confirmation */}
      {showCancelConfirm && (
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-start gap-3 mb-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900 mb-1">Cancel Workflow?</h3>
              <p className="text-xs text-red-700">
                This will stop the workflow immediately. Any progress will be lost and you'll need
                to start over.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Yes, Cancel Workflow
            </button>
            <button
              onClick={() => setShowCancelConfirm(false)}
              className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg transition-colors text-sm font-medium"
            >
              No, Keep Running
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {isError && (
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900 mb-1">Workflow Error</h3>
              <p className="text-xs text-red-700">
                The workflow encountered an error and has stopped. Please review the logs and try
                again.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Completion Message */}
      {isCompleted && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-green-900 mb-1">Workflow Completed</h3>
              <p className="text-xs text-green-700">
                All agents have finished their tasks. Review the comprehensive report below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cancelled Message */}
      {isCancelled && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <X className="h-5 w-5 text-gray-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Workflow Cancelled</h3>
              <p className="text-xs text-gray-700">
                The workflow was cancelled by the user. Start a new workflow to continue.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact Workflow Controls (for smaller spaces)
 */
interface CompactWorkflowControlsProps {
  status: 'running' | 'paused' | 'completed' | 'cancelled' | 'error';
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function CompactWorkflowControls({
  status,
  onPause,
  onResume,
  onCancel,
  className = '',
}: CompactWorkflowControlsProps) {
  const isRunning = status === 'running';
  const isPaused = status === 'paused';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isRunning && onPause && (
        <button
          onClick={onPause}
          className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors"
          title="Pause"
        >
          <Pause className="h-4 w-4" />
        </button>
      )}

      {isPaused && onResume && (
        <button
          onClick={onResume}
          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
          title="Resume"
        >
          <Play className="h-4 w-4" />
        </button>
      )}

      {(isRunning || isPaused) && onCancel && (
        <button
          onClick={onCancel}
          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
          title="Cancel"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
