'use client';

/**
 * Treatment Card Component
 * 
 * Displays individual treatment with color-coded indicators:
 * - Red: Overdue treatments
 * - Yellow: Upcoming treatments (within 7 days)
 * - Green: Completed treatments
 * 
 * Requirements: 6.4, 6.5, 6.6
 */

import type { Treatment } from '@/types';

// ============================================================================
// Component Props
// ============================================================================

interface TreatmentCardProps {
  treatment: Treatment;
  onEdit?: (treatment: Treatment) => void;
  onDelete?: (id: string) => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getIndicatorColor(treatment: Treatment): {
  bg: string;
  border: string;
  text: string;
  label: string;
} {
  // Completed treatments - Green
  if (treatment.status === 'completed') {
    return {
      bg: 'bg-green-50',
      border: 'border-green-500',
      text: 'text-green-700',
      label: 'Completed',
    };
  }

  // Check if overdue - Red
  if (treatment.nextAppointment) {
    const now = new Date();
    const appointmentDate = new Date(treatment.nextAppointment);

    if (appointmentDate < now) {
      return {
        bg: 'bg-red-50',
        border: 'border-red-500',
        text: 'text-red-700',
        label: 'Overdue',
      };
    }

    // Check if upcoming (within 7 days) - Yellow
    const daysUntil = Math.ceil((appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 7) {
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-500',
        text: 'text-yellow-700',
        label: 'Upcoming',
      };
    }
  }

  // Default for in-progress or not-started without urgent appointments
  if (treatment.status === 'in-progress') {
    return {
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      text: 'text-blue-700',
      label: 'In Progress',
    };
  }

  return {
    bg: 'bg-gray-50',
    border: 'border-gray-300',
    text: 'text-gray-700',
    label: 'Not Started',
  };
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getDaysUntilAppointment(date: Date): number {
  const now = new Date();
  const appointmentDate = new Date(date);
  return Math.ceil((appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// ============================================================================
// Main Component
// ============================================================================

export function TreatmentCard({ treatment, onEdit, onDelete }: TreatmentCardProps) {
  const indicator = getIndicatorColor(treatment);
  const daysUntil = treatment.nextAppointment ? getDaysUntilAppointment(treatment.nextAppointment) : null;

  return (
    <div
      className={`
        ${indicator.bg} ${indicator.border}
        border-l-4 rounded-lg shadow-md p-6
        hover:shadow-lg transition-shadow
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">{treatment.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{treatment.phase}</p>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(treatment)}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(treatment.id)}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        <span
          className={`
            inline-block px-3 py-1 rounded-full text-sm font-semibold
            ${indicator.text} ${indicator.bg} border ${indicator.border}
          `}
        >
          {indicator.label}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-bold text-gray-900">{treatment.completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`
              h-full transition-all duration-500
              ${treatment.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}
            `}
            style={{ width: `${treatment.completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Next Appointment */}
      {treatment.nextAppointment && (
        <div className="mb-4 p-3 bg-white rounded border">
          <p className="text-sm font-medium text-gray-700 mb-1">Next Appointment</p>
          <p className="text-base font-semibold text-gray-900">
            {formatDate(treatment.nextAppointment)}
          </p>
          {daysUntil !== null && (
            <p
              className={`
                text-sm mt-1 font-medium
                ${daysUntil < 0 ? 'text-red-600' : daysUntil <= 7 ? 'text-yellow-600' : 'text-gray-600'}
              `}
            >
              {daysUntil < 0
                ? `${Math.abs(daysUntil)} days overdue`
                : daysUntil === 0
                ? 'Today'
                : daysUntil === 1
                ? 'Tomorrow'
                : `In ${daysUntil} days`}
            </p>
          )}
        </div>
      )}

      {/* Cost */}
      {treatment.cost !== undefined && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">Cost</p>
          <p className="text-lg font-bold text-gray-900">${treatment.cost.toFixed(2)}</p>
        </div>
      )}

      {/* Notes */}
      {treatment.notes && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1">Notes</p>
          <p className="text-sm text-gray-600 line-clamp-3">{treatment.notes}</p>
        </div>
      )}

      {/* Documents */}
      {treatment.documents.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Documents ({treatment.documents.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {treatment.documents.slice(0, 3).map((doc, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded truncate max-w-[150px]"
                title={doc.name}
              >
                {doc.name}
              </span>
            ))}
            {treatment.documents.length > 3 && (
              <span className="inline-block px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
                +{treatment.documents.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t text-xs text-gray-500">
        <p>Created: {formatDate(treatment.createdAt)}</p>
        <p>Last updated: {formatDate(treatment.updatedAt)}</p>
      </div>
    </div>
  );
}
