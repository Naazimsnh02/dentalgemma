'use client';

/**
 * Research Filter Panel Component
 * 
 * Provides filters for research paper search
 * Requirements: 7.2, 7.3
 */

import { useState } from 'react';
import { Filter, Calendar, FileText, Hash } from 'lucide-react';
import { DateRange, ContentType } from '@/types';

export interface ResearchFilterValues {
  dateRange: DateRange;
  contentType: ContentType | 'all';
  maxResults: number;
}

interface FilterPanelProps {
  onFilterChange: (filters: ResearchFilterValues) => void;
  isLoading?: boolean;
}

const DATE_RANGE_OPTIONS: Array<{ label: string; value: DateRange | 'all' }> = [
  { label: 'All time', value: 'all' },
  { label: 'Last 6 months', value: 'last-6-months' },
  { label: 'Last year', value: '1-year' },
  { label: 'Last 5 years', value: '5-years' },
];

const CONTENT_TYPE_OPTIONS: Array<{ label: string; value: ContentType | 'all'; description: string }> = [
  { label: 'All types', value: 'all', description: 'All publication types' },
  { label: 'Research Papers', value: 'research', description: 'Original research articles' },
  { label: 'Clinical Trials', value: 'trial', description: 'Clinical trial studies' },
  { label: 'Systematic Reviews', value: 'review', description: 'Meta-analyses and reviews' },
  { label: 'Case Reports', value: 'case-report', description: 'Individual case studies' },
  { label: 'Guidelines', value: 'guideline', description: 'Clinical practice guidelines' },
];

const RESULT_COUNT_OPTIONS = [10, 20, 50, 100];

export function FilterPanel({ onFilterChange, isLoading = false }: FilterPanelProps) {
  const [filters, setFilters] = useState<ResearchFilterValues>(() => {
    // Initialize from localStorage
    try {
      const saved = localStorage.getItem('dentalgemma:research-filters');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load saved filters:', error);
    }
    return {
      dateRange: 'all',
      contentType: 'all',
      maxResults: 20,
    };
  });

  // Save filters to localStorage
  const saveFilters = (newFilters: ResearchFilterValues) => {
    try {
      localStorage.setItem('dentalgemma:research-filters', JSON.stringify(newFilters));
    } catch (error) {
      console.error('Failed to save filters:', error);
    }
  };

  // Update filter and notify parent
  const updateFilter = <K extends keyof ResearchFilterValues>(
    key: K,
    value: ResearchFilterValues[K]
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    saveFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Reset filters to defaults
  const resetFilters = () => {
    const defaultFilters: ResearchFilterValues = {
      dateRange: 'all',
      contentType: 'all',
      maxResults: 20,
    };
    setFilters(defaultFilters);
    saveFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 pb-4 border-b">
        <Filter size={20} className="text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Filter Results</h2>
      </div>

      {/* Date Range Picker */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
          <Calendar size={16} />
          Publication Date
        </label>
        <div className="space-y-2">
          {DATE_RANGE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="radio"
                name="dateRange"
                checked={filters.dateRange === option.value}
                onChange={() => updateFilter('dateRange', option.value as DateRange)}
                disabled={isLoading}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Content Type Radio Buttons */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
          <FileText size={16} />
          Content Type
        </label>
        <div className="space-y-3">
          {CONTENT_TYPE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-start gap-2 cursor-pointer group"
            >
              <input
                type="radio"
                name="contentType"
                checked={filters.contentType === option.value}
                onChange={() => updateFilter('contentType', option.value as ContentType | 'all')}
                disabled={isLoading}
                className="w-4 h-4 mt-0.5 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
              />
              <div className="flex-1">
                <div className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">
                  {option.label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {option.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Number of Results Slider */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
          <Hash size={16} />
          Number of Results: {filters.maxResults}
        </label>
        
        {/* Slider */}
        <div className="space-y-3">
          <input
            type="range"
            min="10"
            max="100"
            step="10"
            value={filters.maxResults}
            onChange={(e) => updateFilter('maxResults', parseInt(e.target.value))}
            disabled={isLoading}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((filters.maxResults - 10) / 90) * 100}%, #e5e7eb ${((filters.maxResults - 10) / 90) * 100}%, #e5e7eb 100%)`
            }}
          />
          
          {/* Quick select buttons */}
          <div className="flex gap-2">
            {RESULT_COUNT_OPTIONS.map((count) => (
              <button
                key={count}
                onClick={() => updateFilter('maxResults', count)}
                disabled={isLoading}
                className={`flex-1 px-3 py-1.5 text-xs rounded-md transition-colors ${
                  filters.maxResults === count
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          More results may take longer to load
        </p>
      </div>

      {/* Active Filters Summary */}
      {(filters.dateRange !== 'all' || filters.contentType !== 'all' || filters.maxResults !== 20) && (
        <div className="pt-4 border-t">
          <h3 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
            Active Filters
          </h3>
          <div className="flex flex-wrap gap-2">
            {filters.dateRange !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                <Calendar size={12} />
                {DATE_RANGE_OPTIONS.find(o => o.value === filters.dateRange)?.label}
              </span>
            )}
            {filters.contentType !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                <FileText size={12} />
                {CONTENT_TYPE_OPTIONS.find(o => o.value === filters.contentType)?.label}
              </span>
            )}
            {filters.maxResults !== 20 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                <Hash size={12} />
                {filters.maxResults} results
              </span>
            )}
          </div>
        </div>
      )}

      {/* Reset Button */}
      <button
        onClick={resetFilters}
        disabled={isLoading}
        className="w-full px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:cursor-not-allowed disabled:opacity-50 font-medium"
      >
        Reset Filters
      </button>
    </div>
  );
}
