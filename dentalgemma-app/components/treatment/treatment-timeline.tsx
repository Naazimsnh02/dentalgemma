'use client';

/**
 * Treatment Timeline Component
 * 
 * Horizontal timeline visualization with milestones
 * Interactive markers for each treatment phase
 * 
 * Requirements: 6.2
 */

import { useMemo } from 'react';
import type { Treatment } from '@/types';

// ============================================================================
// Component Props
// ============================================================================

interface TreatmentTimelineProps {
  treatments: Treatment[];
  onTreatmentClick?: (treatment: Treatment) => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getStatusColor(status: Treatment['status']): string {
  switch (status) {
    case 'completed':
      return 'bg-green-500';
    case 'in-progress':
      return 'bg-yellow-500';
    case 'not-started':
      return 'bg-gray-400';
    default:
      return 'bg-gray-400';
  }
}

function getStatusTextColor(status: Treatment['status']): string {
  switch (status) {
    case 'completed':
      return 'text-green-600';
    case 'in-progress':
      return 'text-yellow-600';
    case 'not-started':
      return 'text-muted-foreground';
    default:
      return 'text-gray-600';
  }
}

function isOverdue(treatment: Treatment): boolean {
  if (!treatment.nextAppointment) return false;
  return new Date(treatment.nextAppointment) < new Date() && treatment.status !== 'completed';
}

// ============================================================================
// Main Component
// ============================================================================

export function TreatmentTimeline({ treatments, onTreatmentClick }: TreatmentTimelineProps) {
  // Sort treatments by creation date
  const sortedTreatments = useMemo(() => {
    return [...treatments].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }, [treatments]);

  if (sortedTreatments.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No treatments to display</p>
        <p className="text-sm mt-2">Add your first treatment to see the timeline</p>
      </div>
    );
  }

  return (
    <div className="relative py-8">
      {/* Timeline Container */}
      <div className="relative">
        {/* Horizontal Line */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-border" />

        {/* Treatment Milestones */}
        <div className="relative flex justify-between items-start">
          {sortedTreatments.map((treatment, index) => {
            const overdue = isOverdue(treatment);
            const statusColor = getStatusColor(treatment.status);
            const statusTextColor = getStatusTextColor(treatment.status);

            return (
              <div
                key={treatment.id}
                className="flex flex-col items-center"
                style={{ width: `${100 / sortedTreatments.length}%` }}
              >
                {/* Milestone Marker */}
                <button
                  onClick={() => onTreatmentClick?.(treatment)}
                  className={`
                    relative z-10 w-12 h-12 rounded-full flex items-center justify-center
                    ${statusColor} text-white font-bold text-sm
                    hover:scale-110 transition-transform cursor-pointer
                    ${overdue ? 'ring-4 ring-red-500 ring-offset-2 ring-offset-card' : ''}
                    shadow-lg
                  `}
                  title={treatment.name}
                >
                  {treatment.completionPercentage}%
                </button>

                {/* Treatment Info */}
                <div className="mt-4 text-center max-w-[150px]">
                  <p className="font-semibold text-sm truncate text-foreground" title={treatment.name}>
                    {treatment.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{treatment.phase}</p>
                  <p className={`text-xs font-medium mt-1 ${statusTextColor}`}>
                    {treatment.status === 'not-started' && 'Not Started'}
                    {treatment.status === 'in-progress' && 'In Progress'}
                    {treatment.status === 'completed' && 'Completed'}
                  </p>
                  {treatment.nextAppointment && (
                    <p className={`text-xs mt-1 ${overdue ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}>
                      {overdue ? 'Overdue: ' : 'Next: '}
                      {new Date(treatment.nextAppointment).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Connecting Line (except for last item) */}
                {index < sortedTreatments.length - 1 && (
                  <div className="absolute top-6 left-1/2 w-full h-1 bg-border" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-12 flex justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-400" />
          <span>Not Started</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-yellow-500" />
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500 ring-4 ring-red-500 ring-offset-2 ring-offset-card" />
          <span>Overdue</span>
        </div>
      </div>
    </div>
  );
}
