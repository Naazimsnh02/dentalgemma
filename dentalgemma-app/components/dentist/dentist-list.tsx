'use client';

/**
 * Dentist List Component
 * 
 * Displays list of dentists with all required fields
 * Requirements: 5.6, 5.8, 5.9
 */

import { useState } from 'react';
import type { DentistInfo } from '@/types';
import { DentistCard } from './dentist-card';
import { Search } from 'lucide-react';

interface DentistListProps {
  dentists: DentistInfo[];
  selectedDentist?: string | null;
  onDentistClick?: (placeId: string) => void;
  isLoading?: boolean;
}

export function DentistList({
  dentists,
  selectedDentist,
  onDentistClick,
  isLoading = false,
}: DentistListProps) {
  const [favoriteDentists, setFavoriteDentists] = useState<Set<string>>(() => {
    // Initialize from localStorage
    try {
      const stored = localStorage.getItem('dentalgemma:favorites-dentists');
      if (stored) {
        const favorites: DentistInfo[] = JSON.parse(stored);
        return new Set(favorites.map((d) => d.placeId));
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
    return new Set();
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Save favorites to localStorage
  const saveFavorites = (placeIds: Set<string>) => {
    try {
      const favoriteDentistsList = dentists.filter((d) => placeIds.has(d.placeId));
      localStorage.setItem(
        'dentalgemma:favorites-dentists',
        JSON.stringify(favoriteDentistsList)
      );
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  };

  // Toggle favorite
  const handleToggleFavorite = (placeId: string) => {
    setFavoriteDentists((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(placeId)) {
        newFavorites.delete(placeId);
      } else {
        newFavorites.add(placeId);
      }
      saveFavorites(newFavorites);
      return newFavorites;
    });
  };

  // Filter dentists by search query
  const filteredDentists = dentists.filter((dentist) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      dentist.name.toLowerCase().includes(query) ||
      dentist.specialty.toLowerCase().includes(query) ||
      dentist.address.toLowerCase().includes(query)
    );
  });

  // Sort: favorites first, then by distance
  const sortedDentists = [...filteredDentists].sort((a, b) => {
    const aIsFavorite = favoriteDentists.has(a.placeId);
    const bIsFavorite = favoriteDentists.has(b.placeId);
    
    if (aIsFavorite && !bIsFavorite) return -1;
    if (!aIsFavorite && bIsFavorite) return 1;
    
    return a.distance - b.distance;
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Searching for dentists...</p>
        </div>
      </div>
    );
  }

  if (dentists.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Search size={48} className="mx-auto mb-4 opacity-50" />
          <p className="font-semibold">No dentists found</p>
          <p className="text-sm mt-2">Try adjusting your search filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search bar */}
      <div className="p-4 border-b bg-white">
        <div className="relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by name, specialty, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Results count */}
      <div className="px-4 py-2 bg-gray-50 border-b">
        <p className="text-sm text-gray-600">
          {filteredDentists.length === dentists.length ? (
            <>
              <span className="font-semibold">{dentists.length}</span> dentist
              {dentists.length !== 1 ? 's' : ''} found
            </>
          ) : (
            <>
              Showing <span className="font-semibold">{filteredDentists.length}</span> of{' '}
              <span className="font-semibold">{dentists.length}</span> dentist
              {dentists.length !== 1 ? 's' : ''}
            </>
          )}
        </p>
      </div>

      {/* Dentist list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sortedDentists.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No dentists match your search</p>
          </div>
        ) : (
          sortedDentists.map((dentist) => (
            <DentistCard
              key={dentist.placeId}
              dentist={dentist}
              isSelected={selectedDentist === dentist.placeId}
              isFavorite={favoriteDentists.has(dentist.placeId)}
              onClick={() => onDentistClick?.(dentist.placeId)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))
        )}
      </div>
    </div>
  );
}
