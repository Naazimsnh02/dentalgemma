/**
 * Dentist Finder API Client
 * 
 * Calls Google Places API directly (no backend needed)
 */

import {GOOGLE_PLACES_API_KEY, GOOGLE_PLACES_BASE_URL} from '../config/googlePlaces';
import type {Location} from '../screens/DentistFinderScreen';

export type DentistInfo = {
  placeId: string;
  name: string;
  specialty: string;
  rating: number;
  distance: number;
  phone: string;
  website: string;
  hours: string;
  address: string;
  location: Location;
};

export type SearchParams = {
  location: Location;
  radius: number;
  specialty?: string;
  rating?: number;
  openNow?: boolean;
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in miles
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Search for nearby dentists using Google Places API
 */
export async function searchNearbyDentists(
  params: SearchParams,
): Promise<DentistInfo[]> {
  if (!GOOGLE_PLACES_API_KEY || GOOGLE_PLACES_API_KEY === 'YOUR_GOOGLE_PLACES_API_KEY_HERE') {
    throw new Error(
      'Google Places API key not configured. Please add your API key in src/config/googlePlaces.ts',
    );
  }

  try {
    // Build search query
    let keyword = 'dentist';
    if (params.specialty && params.specialty !== 'General') {
      keyword = `${params.specialty} dentist`;
    }

    // Build Places API URL
    const radiusMeters = Math.round(params.radius * 1609.34); // Convert miles to meters
    const searchUrl = `${GOOGLE_PLACES_BASE_URL}/nearbysearch/json?location=${params.location.lat},${params.location.lng}&radius=${radiusMeters}&keyword=${encodeURIComponent(keyword)}&type=dentist&key=${GOOGLE_PLACES_API_KEY}${params.openNow ? '&opennow=true' : ''}`;

    console.log('Searching Google Places API...');
    const response = await fetch(searchUrl);

    if (!response.ok) {
      throw new Error(`Places search failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Places API error:', data);
      throw new Error(`Places API error: ${data.status}${data.error_message ? ` - ${data.error_message}` : ''}`);
    }

    const results = data.results || [];

    // Filter by rating if specified
    const filteredResults = params.rating
      ? results.filter((place: any) => place.rating >= params.rating!)
      : results;

    // Convert to DentistInfo format
    const dentists: DentistInfo[] = filteredResults.map((place: any) => {
      // Calculate distance
      const distance = calculateDistance(
        params.location.lat,
        params.location.lng,
        place.geometry.location.lat,
        place.geometry.location.lng,
      );

      return {
        placeId: place.place_id,
        name: place.name,
        specialty: params.specialty || 'General',
        rating: place.rating || 0,
        distance: Math.round(distance * 10) / 10, // Round to 1 decimal
        phone: place.formatted_phone_number || 'Not available',
        website: place.website || '',
        hours: place.opening_hours?.weekday_text?.join(', ') || 'Hours not available',
        address: place.vicinity || place.formatted_address || 'Address not available',
        location: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        },
      };
    });

    // Sort by distance
    dentists.sort((a, b) => a.distance - b.distance);

    console.log(`Found ${dentists.length} dentists`);
    return dentists;
  } catch (error) {
    console.error('Dentist search error:', error);

    // Provide user-friendly error messages
    if (error instanceof Error) {
      if (error.message.includes('Network request failed')) {
        throw new Error(
          'Unable to connect to Google Places API. Please check your internet connection.',
        );
      }
      throw error;
    }

    throw new Error('An unexpected error occurred during search');
  }
}

