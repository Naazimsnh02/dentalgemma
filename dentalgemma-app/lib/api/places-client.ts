/**
 * Google Places API Client
 * 
 * Handles communication with Google Places API for dentist search
 * Includes rate limiting, caching, and error handling
 * Requirements: 5.2, 17.1, 17.2
 */

import type { Location, DentistInfo, PlacesSearchParams, PlaceDetails } from '@/types';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>();

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 1000; // 1 second
const MAX_REQUESTS_PER_WINDOW = 10;
const requestTimestamps: number[] = [];

/**
 * Check if rate limit is exceeded
 */
function checkRateLimit(): boolean {
  const now = Date.now();
  
  // Remove timestamps outside the window
  while (requestTimestamps.length > 0 && requestTimestamps[0] < now - RATE_LIMIT_WINDOW) {
    requestTimestamps.shift();
  }
  
  // Check if limit exceeded
  if (requestTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  // Add current timestamp
  requestTimestamps.push(now);
  return true;
}

/**
 * Get cached data if available and not expired
 */
function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  
  if (!cached) {
    return null;
  }
  
  const now = Date.now();
  if (now - cached.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

/**
 * Set cached data
 */
function setCachedData(key: string, data: unknown): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Generate cache key from search parameters
 */
function generateCacheKey(params: { location: Location | string; radius: number; specialty?: string; rating?: number | null; priceLevel?: number | null; openNow?: boolean }): string {
  const locationKey = typeof params.location === 'string' 
    ? params.location 
    : `${params.location.lat.toFixed(6)},${params.location.lng.toFixed(6)}`;
  
  return JSON.stringify({
    location: locationKey,
    radius: params.radius,
    specialty: params.specialty,
    rating: params.rating,
    priceLevel: params.priceLevel,
    openNow: params.openNow,
  });
}

/**
 * Search for nearby dentists
 * Note: location can be a Location object or a string (address)
 */
export async function searchNearby(params: Omit<PlacesSearchParams, 'location'> & { location: Location | string }): Promise<DentistInfo[]> {
  // Check cache first
  const cacheKey = generateCacheKey(params);
  const cachedResults = getCachedData<DentistInfo[]>(cacheKey);
  
  if (cachedResults) {
    return cachedResults;
  }
  
  // Check rate limit
  if (!checkRateLimit()) {
    throw new Error('Rate limit exceeded. Please wait a moment and try again.');
  }
  
  try {
    // Call our API route
    const response = await fetch('/api/dentists/nearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location: params.location,
        radius: params.radius,
        specialty: params.specialty,
        rating: params.rating,
        priceLevel: params.priceLevel,
        openNow: params.openNow,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Search failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Search failed');
    }
    
    const results = data.results || [];
    
    // Cache results
    setCachedData(cacheKey, results);
    
    return results;
  } catch (error) {
    console.error('Places API search error:', error);
    
    // Re-throw with user-friendly message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('rate limit')) {
      throw new Error('Too many requests. Please wait a moment and try again.');
    }
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    throw error;
  }
}

/**
 * Get detailed information about a specific place
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails> {
  // Check cache first
  const cacheKey = `details:${placeId}`;
  const cachedDetails = getCachedData<PlaceDetails>(cacheKey);
  
  if (cachedDetails) {
    return cachedDetails;
  }
  
  // Check rate limit
  if (!checkRateLimit()) {
    throw new Error('Rate limit exceeded. Please wait a moment and try again.');
  }
  
  try {
    // Note: This would require a separate API route for place details
    // For now, we'll throw an error indicating it's not implemented
    // In a full implementation, you would create /api/dentists/details/[placeId]
    
    throw new Error('Place details endpoint not yet implemented');
    
    // Future implementation would look like:
    // const response = await fetch(`/api/dentists/details/${placeId}`);
    // const data = await response.json();
    // setCachedData(cacheKey, data.details);
    // return data.details;
  } catch (error) {
    console.error('Places API details error:', error);
    throw error;
  }
}

/**
 * Clear all cached data
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Get cache statistics (for debugging)
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}
