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
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-500 dark:border-green-600',
      text: 'text-green-700 dark:text-green-300',
      label: 'Completed',
    };
  }

  // Check if overdue - Red
  if (treatment.nextAppointment) {
    const now = new Date();
    const appointmentDate = new Date(treatment.nextAppointment);

    if (appointmentDate < now) {
      return {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-500 dark:border-red-600',
        text: 'text-red-700 dark:text-red-300',
        label: 'Overdue',
      };
    }

    // Check if upcoming (within 7 days) - Yellow
    const daysUntil = Math.ceil((appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 7) {
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-500 dark:border-yellow-600',
        text: 'text-yellow-700 dark:text-yellow-300',
        label: 'Upcoming',
      };
    }
  }

  // Default for in-progress or not-started without urgent appointments
  if (treatment.status === 'in-progress') {
    return {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-500 dark:border-blue-600',
      text: 'text-blue-700 dark:text-blue-300',
      label: 'In Progress',
    };
  }

  return {
    bg: 'bg-muted/50 dark:bg-muted/20',
    border: 'border-border',
    text: 'text-muted-foreground',
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
        hover:shadow-lg transition-shadow bg-card text-card-foreground border border-border
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-foreground">{treatment.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{treatment.phase}</p>
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
          <span className="text-sm font-medium text-muted-foreground">Progress</span>
          <span className="text-sm font-bold text-foreground">{treatment.completionPercentage}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
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
        <div className="mb-4 p-3 bg-muted/20 rounded border border-border">
          <p className="text-sm font-medium text-muted-foreground mb-1">Next Appointment</p>
          <p className="text-base font-semibold text-foreground">
            {formatDate(treatment.nextAppointment)}
          </p>
          {daysUntil !== null && (
            <p
              className={`
                text-sm mt-1 font-medium
                ${daysUntil < 0 ? 'text-destructive' : daysUntil <= 7 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}
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
          <p className="text-sm text-muted-foreground">Cost</p>
          <p className="text-lg font-bold text-foreground">${treatment.cost.toFixed(2)}</p>
        </div>
      )}

      {/* Notes */}
      {treatment.notes && (
        <div className="mb-4">
          <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
          <p className="text-sm text-muted-foreground line-clamp-3">{treatment.notes}</p>
        </div>
      )}

      {/* Documents */}
      {treatment.documents.length > 0 && (
        <div>
          <p className="text-sm font-medium text-foreground mb-2">
            Documents ({treatment.documents.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {treatment.documents.slice(0, 3).map((doc, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 text-xs bg-muted text-muted-foreground rounded truncate max-w-[150px] border border-border"
                title={doc.name}
              >
                {doc.name}
              </span>
            ))}
            {treatment.documents.length > 3 && (
              <span className="inline-block px-2 py-1 text-xs bg-muted text-muted-foreground rounded border border-border">
                +{treatment.documents.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
        <p>Created: {formatDate(treatment.createdAt)}</p>
        <p>Last updated: {formatDate(treatment.updatedAt)}</p>
      </div>
    </div>
  );
}
