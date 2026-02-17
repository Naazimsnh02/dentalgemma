'use client';

/**
 * Research Results Component
 * 
 * Displays search results with grid/list view toggle
 * Requirements: 7.4, 7.5, 7.6
 */

import { useState } from 'react';
import { Grid, List, AlertCircle, Loader2 } from 'lucide-react';
import { ResearchPaper } from '@/types';
import { PaperCard } from './paper-card';

interface ResearchResultsProps {
  papers: ResearchPaper[];
  isLoading?: boolean;
  error?: string | null;
  searchQuery?: string;
  onSavePaper: (paper: ResearchPaper) => void;
  onUnsavePaper: (pmid: string) => void;
  onExportCitation: (paper: ResearchPaper) => void;
}

export function ResearchResults({
  papers,
  isLoading = false,
  error = null,
  searchQuery = '',
  onSavePaper,
  onUnsavePaper,
  onExportCitation,
}: ResearchResultsProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    // Load view preference from localStorage
    try {
      const saved = localStorage.getItem('dentalgemma:research-view-mode');
      return (saved as 'grid' | 'list') || 'list';
    } catch {
      return 'list';
    }
  });

  // Save view mode preference
  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    try {
      localStorage.setItem('dentalgemma:research-view-mode', mode);
    } catch (error) {
      console.error('Failed to save view mode:', error);
    }
  };

  // Extract search terms for highlighting
  const searchTerms = searchQuery
    .split(/\s+/)
    .filter(term => term.length > 2 && !['AND', 'OR', 'NOT'].includes(term.toUpperCase()));

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
        <p className="text-lg text-gray-600 mb-2">Searching PubMed...</p>
        <p className="text-sm text-gray-500">This may take a few moments</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-start gap-3">
            <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Search Error</h3>
              <p className="text-sm text-red-700 mb-4">{error}</p>
              <p className="text-xs text-red-600">
                Please try again or modify your search query.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (papers.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md text-center">
          <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
          <p className="text-sm text-gray-600 mb-4">
            {searchQuery
              ? `No research papers found for &quot;${searchQuery}&quot;`
              : 'Enter a search query to find research papers'}
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>Try:</p>
            <ul className="list-disc list-inside text-left">
              <li>Using different keywords</li>
              <li>Removing filters</li>
              <li>Checking your spelling</li>
              <li>Using broader search terms</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {papers.length} {papers.length === 1 ? 'Result' : 'Results'}
          </h2>
          {searchQuery && (
            <p className="text-sm text-gray-600 mt-1">
              for &quot;{searchQuery}&quot;
            </p>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => handleViewModeChange('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            aria-label="List view"
            title="List view"
          >
            <List size={18} />
          </button>
          <button
            onClick={() => handleViewModeChange('grid')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            aria-label="Grid view"
            title="Grid view"
          >
            <Grid size={18} />
          </button>
        </div>
      </div>

      {/* Results Grid/List */}
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-4'
        }
      >
        {papers.map((paper) => (
          <PaperCard
            key={paper.pmid}
            paper={paper}
            onSave={onSavePaper}
            onUnsave={onUnsavePaper}
            onExportCitation={onExportCitation}
            searchTerms={searchTerms}
            viewMode={viewMode}
          />
        ))}
      </div>

      {/* Results Footer */}
      {papers.length > 0 && (
        <div className="pt-4 border-t text-center">
          <p className="text-sm text-gray-500">
            Showing {papers.length} {papers.length === 1 ? 'paper' : 'papers'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Results are sorted by relevance
          </p>
        </div>
      )}
    </div>
  );
}
