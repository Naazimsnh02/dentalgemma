'use client';

/**
 * Dentist Finder Page
 * 
 * Main page for finding nearby dentists with map and list views
 * Requirements: 5.1-5.10
 */

import './leaflet-styles.css';
import { useState } from 'react';
import type { DentistInfo, Location } from '@/types';
import { FilterPanel, type FilterValues } from '@/components/dentist/filter-panel';
import { DentistMap } from '@/components/dentist/dentist-map';
import { DentistList } from '@/components/dentist/dentist-list';
import { searchNearby } from '@/lib/api/places-client';
import { AlertCircle, Search } from 'lucide-react';

export default function DentistFinderPage() {
  const [dentists, setDentists] = useState<DentistInfo[]>([]);
  const [selectedDentist, setSelectedDentist] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<Location>({ lat: 37.7749, lng: -122.4194 }); // Default: San Francisco
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Handle filter changes and trigger search
  const handleFilterChange = async (filters: FilterValues) => {
    // Validate location
    if (!filters.location || filters.location.trim() === '') {
      setError('Please enter a location to search');
      setDentists([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // Parse location (could be coordinates or address)
      let searchLocation: Location | string = filters.location;
      let centerLocation: Location | null = null;

      // Check if it's coordinates (lat,lng format)
      const coordMatch = filters.location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
      if (coordMatch) {
        centerLocation = {
          lat: parseFloat(coordMatch[1]),
          lng: parseFloat(coordMatch[2]),
        };
        searchLocation = centerLocation;
        setMapCenter(centerLocation);
      }

      // Search for dentists
      const results = await searchNearby({
        location: searchLocation,
        radius: filters.radius,
        specialty: filters.specialty !== 'General' ? filters.specialty : undefined,
        rating: filters.rating || undefined,
        priceLevel: filters.priceLevel || undefined,
        openNow: filters.openNow,
      });

      setDentists(results);

      // Update map center if we got results
      if (results.length > 0) {
        // Calculate center of all results
        const avgLat = results.reduce((sum, d) => sum + d.location.lat, 0) / results.length;
        const avgLng = results.reduce((sum, d) => sum + d.location.lng, 0) / results.length;
        setMapCenter({ lat: avgLat, lng: avgLng });
      }

      // Clear selection
      setSelectedDentist(null);
    } catch (err) {
      console.error('Search error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to search for dentists. Please try again.';
      setError(errorMessage);
      setDentists([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle dentist selection
  const handleDentistClick = (placeId: string) => {
    setSelectedDentist(placeId === selectedDentist ? null : placeId);
  };

  // Handle map marker click
  const handleMarkerClick = (placeId: string) => {
    setSelectedDentist(placeId);
    
    // Scroll to dentist in list
    const element = document.getElementById(`dentist-${placeId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Find a Dentist</h1>
        <p className="text-gray-600 mt-1">
          Search for nearby dental professionals and specialists
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col lg:flex-row">
          {/* Filter Panel - Sidebar on desktop, top on mobile */}
          <div className="lg:w-80 lg:border-r bg-gray-50 overflow-y-auto">
            <div className="p-4">
              <FilterPanel
                onFilterChange={handleFilterChange}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Map and List Container */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Map View - 60% on desktop, top on mobile */}
            <div className="lg:w-[60%] h-64 lg:h-full border-b lg:border-b-0 lg:border-r">
              {!hasSearched ? (
                <div className="h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center text-gray-500 px-4">
                    <Search size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="font-semibold">Enter a location to start searching</p>
                    <p className="text-sm mt-2">
                      Use the filters on the left to find dentists near you
                    </p>
                  </div>
                </div>
              ) : error ? (
                <div className="h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center text-red-600 px-4">
                    <AlertCircle size={48} className="mx-auto mb-4" />
                    <p className="font-semibold">Search Error</p>
                    <p className="text-sm mt-2">{error}</p>
                  </div>
                </div>
              ) : dentists.length === 0 && !isLoading ? (
                <div className="h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center text-gray-500 px-4">
                    <Search size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="font-semibold">No dentists found</p>
                    <p className="text-sm mt-2">
                      Try adjusting your search filters or expanding the search radius
                    </p>
                  </div>
                </div>
              ) : (
                <DentistMap
                  dentists={dentists}
                  center={mapCenter}
                  selectedDentist={selectedDentist}
                  onMarkerClick={handleMarkerClick}
                />
              )}
            </div>

            {/* List View - 40% on desktop, bottom on mobile */}
            <div className="lg:w-[40%] flex-1 lg:flex-none lg:h-full bg-white">
              <DentistList
                dentists={dentists}
                selectedDentist={selectedDentist}
                onDentistClick={handleDentistClick}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
