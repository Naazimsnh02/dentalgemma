'use client';

/**
 * Filter Panel Component
 * 
 * Provides filters for dentist search
 * Requirements: 5.1, 5.3, 5.4
 */

import { useState, useEffect, useRef } from 'react';
import { MapPin, Sliders, Search } from 'lucide-react';

export interface FilterValues {
  location: string;
  radius: number;
  specialty: string;
  rating: number | null;
  priceLevel: number | null;
  openNow: boolean;
}

interface FilterPanelProps {
  onFilterChange: (filters: FilterValues) => void;
  isLoading?: boolean;
}

const SPECIALTIES = [
  'General',
  'Orthodontics',
  'Endodontics',
  'Periodontics',
  'Oral Surgery',
  'Pediatric',
  'Prosthodontics',
  'Cosmetic',
];

const RATING_OPTIONS = [
  { label: 'Any rating', value: null },
  { label: '4.0+ stars', value: 4.0 },
  { label: '4.5+ stars', value: 4.5 },
];

const PRICE_LEVELS = [
  { label: 'Any price', value: null },
  { label: '$', value: 1 },
  { label: '$$', value: 2 },
  { label: '$$$', value: 3 },
  { label: '$$$$', value: 4 },
];

export function FilterPanel({ onFilterChange, isLoading = false }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterValues>({
    location: '',
    radius: 5,
    specialty: 'General',
    rating: null,
    priceLevel: null,
    openNow: false,
  });
  const [isClient, setIsClient] = useState(false);

  // Load saved filters only on client side
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('dentalgemma:dentist-filters');
        if (saved) {
          setFilters(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Failed to load saved filters:', error);
      }
    }
  }, []);

  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Save filters to localStorage
  const saveFilters = (newFilters: FilterValues) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('dentalgemma:dentist-filters', JSON.stringify(newFilters));
    } catch (error) {
      console.error('Failed to save filters:', error);
    }
  };

  // Update filter (without triggering search)
  const updateFilterLocal = <K extends keyof FilterValues>(
    key: K,
    value: FilterValues[K]
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    saveFilters(newFilters);
  };

  // Trigger search manually
  const handleSearch = () => {
    onFilterChange(filters);
  };

  // Auto-search for non-location filter changes
  const updateFilter = <K extends keyof FilterValues>(
    key: K,
    value: FilterValues[K]
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    saveFilters(newFilters);
    
    // Only auto-search if location is already set and we're changing other filters
    if (key !== 'location' && filters.location.trim() !== '') {
      onFilterChange(newFilters);
    }
  };

  // Get current location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = `${position.coords.latitude},${position.coords.longitude}`;
        updateFilter('location', location);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to get your location. Please check your browser permissions.');
      }
    );
  };

  // Simple location autocomplete (mock implementation)
  // In production, you would use Google Places Autocomplete API
  const handleLocationChange = (value: string) => {
    updateFilterLocal('location', value);
    
    // Mock suggestions
    if (value.length > 2) {
      const mockSuggestions = [
        `${value}, CA`,
        `${value}, NY`,
        `${value}, TX`,
      ];
      setLocationSuggestions(mockSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    updateFilterLocal('location', suggestion);
    setShowSuggestions(false);
  };

  // Handle Enter key in location input
  const handleLocationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setShowSuggestions(false);
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 pb-4 border-b">
        <Sliders size={20} className="text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Search Filters</h2>
      </div>

      {/* Location Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location
        </label>
        <div className="relative">
          <MapPin
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Enter city, address, or ZIP code"
            value={filters.location}
            onChange={(e) => handleLocationChange(e.target.value)}
            onKeyDown={handleLocationKeyDown}
            onFocus={() => filters.location.length > 2 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            disabled={isLoading}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          
          {/* Autocomplete suggestions */}
          {showSuggestions && locationSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
              {locationSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <button
          onClick={handleGetCurrentLocation}
          disabled={isLoading}
          className="mt-2 text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Use my current location
        </button>
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        disabled={isLoading || !filters.location.trim()}
        className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Search size={20} />
        {isLoading ? 'Searching...' : 'Search Dentists'}
      </button>

      {/* Radius Slider */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Radius: {filters.radius} miles
        </label>
        <input
          type="range"
          min="1"
          max="25"
          step="1"
          value={filters.radius}
          onChange={(e) => updateFilter('radius', parseInt(e.target.value))}
          disabled={isLoading}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1 mi</span>
          <span>25 mi</span>
        </div>
      </div>

      {/* Specialty Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Specialty
        </label>
        <select
          value={filters.specialty}
          onChange={(e) => updateFilter('specialty', e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          {SPECIALTIES.map((specialty) => (
            <option key={specialty} value={specialty}>
              {specialty}
            </option>
          ))}
        </select>
      </div>

      {/* Rating Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Minimum Rating
        </label>
        <div className="space-y-2">
          {RATING_OPTIONS.map((option) => (
            <label
              key={option.label}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="rating"
                checked={filters.rating === option.value}
                onChange={() => updateFilter('rating', option.value)}
                disabled={isLoading}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Level Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price Level
        </label>
        <div className="space-y-2">
          {PRICE_LEVELS.map((option) => (
            <label
              key={option.label}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="priceLevel"
                checked={filters.priceLevel === option.value}
                onChange={() => updateFilter('priceLevel', option.value)}
                disabled={isLoading}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Open Now Checkbox */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.openNow}
            onChange={(e) => updateFilter('openNow', e.target.checked)}
            disabled={isLoading}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
          />
          <span className="text-sm font-medium text-gray-700">Open now</span>
        </label>
      </div>

      {/* Reset Button */}
      <button
        onClick={() => {
          const defaultFilters: FilterValues = {
            location: '',
            radius: 5,
            specialty: 'General',
            rating: null,
            priceLevel: null,
            openNow: false,
          };
          setFilters(defaultFilters);
          saveFilters(defaultFilters);
          onFilterChange(defaultFilters);
        }}
        disabled={isLoading}
        className="w-full px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        Reset Filters
      </button>
    </div>
  );
}
