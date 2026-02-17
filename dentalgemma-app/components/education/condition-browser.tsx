'use client';

/**
 * Condition Browser Component
 * 
 * Displays 98 dental conditions with search and category filters
 * Requirements: 8.1, 8.2
 */

import { useState, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { DentalCondition, ConditionCategory } from '@/types';
import { dentalConditions, categories } from '@/lib/data/dental-conditions';
import { ConditionCard } from './condition-card';

interface ConditionBrowserProps {
  onSelectCondition: (condition: DentalCondition) => void;
}

export function ConditionBrowser({ onSelectCondition }: ConditionBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showFilters, setShowFilters] = useState(false);

  // Filter conditions based on search and category
  const filteredConditions = useMemo(() => {
    let filtered = dentalConditions;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        c =>
          c.name.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.symptoms.some(s => s.toLowerCase().includes(query)) ||
          c.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  // Group conditions by category for display
  const conditionsByCategory = useMemo(() => {
    const grouped: Record<string, DentalCondition[]> = {};
    
    filteredConditions.forEach(condition => {
      if (!grouped[condition.category]) {
        grouped[condition.category] = [];
      }
      grouped[condition.category].push(condition);
    });

    return grouped;
  }, [filteredConditions]);

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search conditions, symptoms, or treatments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
              showFilters || selectedCategory !== 'All'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter size={18} />
            Filters
            {selectedCategory !== 'All' && (
              <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                1
              </span>
            )}
          </button>
        </div>

        {/* Category Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Category</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === 'All'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({dentalConditions.length})
              </button>
              {categories.map((category) => {
                const count = dentalConditions.filter(c => c.category === category).length;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredConditions.length}</span> condition
          {filteredConditions.length !== 1 && 's'}
          {selectedCategory !== 'All' && (
            <span> in <span className="font-semibold">{selectedCategory}</span></span>
          )}
        </p>
        {(searchQuery || selectedCategory !== 'All') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Conditions Grid */}
      {filteredConditions.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Search size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No conditions found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search or filters to find what you're looking for.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(conditionsByCategory).map(([category, conditions]) => (
            <div key={category}>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                {category}
                <span className="text-sm font-normal text-gray-500">
                  ({conditions.length})
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {conditions.map((condition) => (
                  <ConditionCard
                    key={condition.id}
                    condition={condition}
                    onClick={() => onSelectCondition(condition)}
                    searchQuery={searchQuery}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
