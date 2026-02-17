'use client';

/**
 * Research Search Bar Component
 * 
 * Provides search functionality for PubMed research papers
 * Requirements: 7.1
 */

import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, ChevronUp, Clock, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  initialQuery?: string;
}

const RECENT_SEARCHES_KEY = 'dentalgemma:recent-searches';
const MAX_RECENT_SEARCHES = 10;

export function SearchBar({ onSearch, isLoading = false, initialQuery = '' }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [autocompleteTerms, setAutocompleteTerms] = useState<string[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setRecentSearches(parsed);
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save search to recent searches
  const saveToRecentSearches = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    try {
      const updated = [
        searchQuery,
        ...recentSearches.filter(s => s !== searchQuery)
      ].slice(0, MAX_RECENT_SEARCHES);
      
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save recent search:', error);
    }
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
      console.error('Failed to clear recent searches:', error);
    }
  };

  // Handle search submission
  const handleSearch = (searchQuery: string = query) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;
    
    saveToRecentSearches(trimmedQuery);
    onSearch(trimmedQuery);
    setShowRecentSearches(false);
    setShowAutocomplete(false);
  };

  // Handle input change with autocomplete
  const handleInputChange = (value: string) => {
    setQuery(value);
    
    // Generate autocomplete suggestions based on common dental terms
    if (value.length > 2) {
      const dentalTerms = [
        'dental caries',
        'periodontal disease',
        'endodontic treatment',
        'orthodontic',
        'dental implants',
        'root canal',
        'gingivitis',
        'periodontitis',
        'tooth extraction',
        'dental restoration',
        'oral surgery',
        'dental hygiene',
        'fluoride treatment',
        'dental radiography',
        'temporomandibular joint',
      ];
      
      const matches = dentalTerms.filter(term =>
        term.toLowerCase().includes(value.toLowerCase())
      );
      
      setAutocompleteTerms(matches.slice(0, 5));
      setShowAutocomplete(matches.length > 0);
    } else {
      setShowAutocomplete(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowRecentSearches(false);
        setShowAutocomplete(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full space-y-4">
      {/* Main Search Bar */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search dental research (e.g., 'dental caries treatment')"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => {
              if (recentSearches.length > 0 && !query) {
                setShowRecentSearches(true);
              }
            }}
            disabled={isLoading}
            className="w-full pl-12 pr-32 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
            aria-label="Search research papers"
          />
          
          {/* Clear button */}
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setShowAutocomplete(false);
                searchInputRef.current?.focus();
              }}
              className="absolute right-28 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
          
          {/* Search button */}
          <button
            onClick={() => handleSearch()}
            disabled={isLoading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Autocomplete Dropdown */}
        {showAutocomplete && autocompleteTerms.length > 0 && (
          <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            {autocompleteTerms.map((term, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(term);
                  handleSearch(term);
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <Search size={16} className="text-gray-400" />
                <span className="text-gray-700">{term}</span>
              </button>
            ))}
          </div>
        )}

        {/* Recent Searches Dropdown */}
        {showRecentSearches && recentSearches.length > 0 && (
          <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <Clock size={16} />
                <span>Recent Searches</span>
              </div>
              <button
                onClick={clearRecentSearches}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Clear all
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(search);
                    handleSearch(search);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <Clock size={16} className="text-gray-400" />
                  <span className="text-gray-700">{search}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Advanced Options Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {showAdvanced ? (
            <>
              <ChevronUp size={16} />
              Hide advanced options
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              Show advanced options
            </>
          )}
        </button>
        
        {recentSearches.length > 0 && !showRecentSearches && (
          <button
            onClick={() => setShowRecentSearches(true)}
            className="text-sm text-gray-600 hover:text-gray-700 flex items-center gap-1"
          >
            <Clock size={14} />
            Recent searches
          </button>
        )}
      </div>

      {/* Advanced Search Tips */}
      {showAdvanced && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-blue-900">Search Tips</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>
              <span className="font-medium">AND:</span> Use to combine terms (e.g., &quot;caries AND prevention&quot;)
            </li>
            <li>
              <span className="font-medium">OR:</span> Use to find either term (e.g., &quot;gingivitis OR periodontitis&quot;)
            </li>
            <li>
              <span className="font-medium">NOT:</span> Use to exclude terms (e.g., &quot;dental NOT pediatric&quot;)
            </li>
            <li>
              <span className="font-medium">Quotes:</span> Use for exact phrases (e.g., &quot;root canal treatment&quot;)
            </li>
            <li>
              <span className="font-medium">Wildcards:</span> Use * for variations (e.g., &quot;dent*&quot; finds dental, dentist, dentistry)
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
