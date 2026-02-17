'use client';

/**
 * Condition Card Component
 * 
 * Displays individual dental condition with icon and basic info
 * Requirements: 8.1, 8.2
 */

import { DentalCondition } from '@/types';
import { ChevronRight } from 'lucide-react';

interface ConditionCardProps {
  condition: DentalCondition;
  onClick: () => void;
  searchQuery?: string;
}

export function ConditionCard({ condition, onClick, searchQuery = '' }: ConditionCardProps) {
  // Highlight search terms in text
  const highlightText = (text: string): React.ReactNode => {
    if (!searchQuery.trim()) return text;

    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (part.toLowerCase() === searchQuery.toLowerCase()) {
        return (
          <mark key={index} className="bg-yellow-200 text-gray-900 px-0.5 rounded">
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all p-5 text-left w-full group"
    >
      {/* Icon and Title */}
      <div className="flex items-start gap-3 mb-3">
        <div className="text-3xl flex-shrink-0" role="img" aria-label={condition.name}>
          {condition.icon || '🦷'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
            {highlightText(condition.name)}
          </h3>
          <p className="text-xs text-gray-500 font-medium">
            {condition.category}
          </p>
        </div>
        <ChevronRight 
          size={20} 
          className="text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 mt-1" 
        />
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 line-clamp-2 mb-3">
        {highlightText(condition.description)}
      </p>

      {/* Quick Info */}
      <div className="space-y-1.5">
        {condition.symptoms.length > 0 && (
          <div className="flex items-start gap-2">
            <span className="text-xs font-medium text-gray-500 flex-shrink-0 mt-0.5">
              Symptoms:
            </span>
            <span className="text-xs text-gray-600 line-clamp-1">
              {condition.symptoms.slice(0, 3).join(', ')}
              {condition.symptoms.length > 3 && ` +${condition.symptoms.length - 3} more`}
            </span>
          </div>
        )}
        {condition.treatments.length > 0 && (
          <div className="flex items-start gap-2">
            <span className="text-xs font-medium text-gray-500 flex-shrink-0 mt-0.5">
              Treatments:
            </span>
            <span className="text-xs text-gray-600 line-clamp-1">
              {condition.treatments.slice(0, 2).join(', ')}
              {condition.treatments.length > 2 && ` +${condition.treatments.length - 2} more`}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
