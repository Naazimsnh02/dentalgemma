'use client';

/**
 * Research Dashboard Page
 * 
 * Search and browse dental research from PubMed
 * Requirements: 7.1-7.10
 */

import { useState, useEffect } from 'react';
import { BookOpen, Bookmark, AlertCircle } from 'lucide-react';
import { SearchBar } from '@/components/research/search-bar';
import { FilterPanel, ResearchFilterValues } from '@/components/research/filter-panel';
import { ResearchResults } from '@/components/research/research-results';
import { CitationExport } from '@/components/research/citation-export';
import { useAppStore } from '@/store/app-store';
import type { ResearchPaper, SearchOptions } from '@/types';

export default function ResearchPage() {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ResearchFilterValues>({
    dateRange: 'all',
    contentType: 'all',
    maxResults: 20,
  });
  const [selectedPaperForCitation, setSelectedPaperForCitation] = useState<ResearchPaper | null>(null);
  const [showSavedPapers, setShowSavedPapers] = useState(false);

  // Get saved papers from store
  const savedPapers = useAppStore((state) => state.savedPapers);
  const savePaper = useAppStore((state) => state.savePaper);
  const unsavePaper = useAppStore((state) => state.unsavePaper);
  const updateDashboardStats = useAppStore((state) => state.updateDashboardStats);

  // Perform search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setShowSavedPapers(false);
    setIsLoading(true);
    setError(null);

    try {
      // Build search options
      const options: SearchOptions = {
        maxResults: filters.maxResults,
      };

      // Only add filters if they're not 'all'
      if (filters.dateRange !== 'all') {
        options.dateRange = filters.dateRange;
      }
      if (filters.contentType !== 'all') {
        options.contentType = filters.contentType;
      }

      // Call API
      const response = await fetch('/api/research/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          options,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Search failed');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Search failed');
      }

      // Mark papers as saved if they're in savedPapers
      const papersWithSavedStatus = data.papers.map((paper: ResearchPaper) => ({
        ...paper,
        saved: savedPapers.some((p) => p.pmid === paper.pmid),
      }));

      setPapers(papersWithSavedStatus);

      // Update dashboard stats
      updateDashboardStats({
        papersFound: data.totalResults,
      });
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setPapers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle filter changes - re-run search if we have a query
  const handleFilterChange = (newFilters: ResearchFilterValues) => {
    setFilters(newFilters);
    if (searchQuery) {
      handleSearch(searchQuery);
    }
  };

  // Handle save paper
  const handleSavePaper = (paper: ResearchPaper) => {
    savePaper(paper);
    // Update papers list to reflect saved status
    setPapers((prev) =>
      prev.map((p) => (p.pmid === paper.pmid ? { ...p, saved: true } : p))
    );
  };

  // Handle unsave paper
  const handleUnsavePaper = (pmid: string) => {
    unsavePaper(pmid);
    // Update papers list to reflect saved status
    setPapers((prev) =>
      prev.map((p) => (p.pmid === pmid ? { ...p, saved: false } : p))
    );
  };

  // Handle export citation
  const handleExportCitation = (paper: ResearchPaper) => {
    setSelectedPaperForCitation(paper);
  };

  // Toggle saved papers view
  const handleToggleSavedPapers = () => {
    setShowSavedPapers(!showSavedPapers);
    if (!showSavedPapers) {
      setPapers(savedPapers);
      setSearchQuery('');
      setError(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <BookOpen size={28} className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Research Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  Search evidence-based dental research from PubMed
                </p>
              </div>
            </div>

            {/* Saved Papers Button */}
            <button
              onClick={handleToggleSavedPapers}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showSavedPapers
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Bookmark size={18} />
              <span className="font-medium">
                Saved Papers ({savedPapers.length})
              </span>
            </button>
          </div>

          {/* Search Bar */}
          <SearchBar
            onSearch={handleSearch}
            isLoading={isLoading}
            initialQuery={searchQuery}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <FilterPanel
                onFilterChange={handleFilterChange}
                isLoading={isLoading}
              />

              {/* Info Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">About PubMed</p>
                    <p className="text-xs leading-relaxed">
                      PubMed comprises over 36 million citations for biomedical literature
                      from MEDLINE, life science journals, and online books.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content - Results */}
          <main className="lg:col-span-3">
            {showSavedPapers ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Saved Papers ({savedPapers.length})
                  </h2>
                </div>
                {savedPapers.length === 0 ? (
                  <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <Bookmark size={48} className="text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Saved Papers
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Papers you save will appear here for easy access
                    </p>
                    <button
                      onClick={handleToggleSavedPapers}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Search for Papers
                    </button>
                  </div>
                ) : (
                  <ResearchResults
                    papers={savedPapers}
                    isLoading={false}
                    error={null}
                    searchQuery=""
                    onSavePaper={handleSavePaper}
                    onUnsavePaper={handleUnsavePaper}
                    onExportCitation={handleExportCitation}
                  />
                )}
              </div>
            ) : (
              <ResearchResults
                papers={papers}
                isLoading={isLoading}
                error={error}
                searchQuery={searchQuery}
                onSavePaper={handleSavePaper}
                onUnsavePaper={handleUnsavePaper}
                onExportCitation={handleExportCitation}
              />
            )}
          </main>
        </div>
      </div>

      {/* Citation Export Modal */}
      {selectedPaperForCitation && (
        <CitationExport
          paper={selectedPaperForCitation}
          isOpen={!!selectedPaperForCitation}
          onClose={() => setSelectedPaperForCitation(null)}
        />
      )}
    </div>
  );
}
