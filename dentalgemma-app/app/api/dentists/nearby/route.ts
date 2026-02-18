/**
 * Dentist Search API Route
 * 
 * Proxies Google Places API to find nearby dentists
 * Requirements: 5.2, 17.1, 17.2
 */

import { NextRequest, NextResponse } from 'next/server';
import type { Location, DentistInfo } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Google Places API configuration
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';
const GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place';

interface SearchDentistsRequestBody {
  location: string | Location;
  radius: number;
  specialty?: string;
  rating?: number;
  priceLevel?: number;
  openNow?: boolean;
}

/**
 * Geocode address to coordinates
 */
async function geocodeAddress(address: string): Promise<Location> {
  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_PLACES_API_KEY}`;
  
  const response = await fetch(geocodeUrl);
  
  if (!response.ok) {
    throw new Error(`Geocoding failed: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Log the actual response for debugging
  console.log('Geocoding API response:', {
    status: data.status,
    error_message: data.error_message,
    results_count: data.results?.length || 0,
  });
  
  if (data.status !== 'OK' || !data.results || data.results.length === 0) {
    // Provide more specific error messages based on status
    const errorMessages: Record<string, string> = {
      'ZERO_RESULTS': 'No results found for this address. Please try a different location.',
      'OVER_QUERY_LIMIT': 'API quota exceeded. Please try again later.',
      'REQUEST_DENIED': 'API request denied. Please check your API key configuration.',
      'INVALID_REQUEST': 'Invalid address format. Please check your input.',
      'UNKNOWN_ERROR': 'Geocoding service error. Please try again.',
    };
    
    const errorMsg = errorMessages[data.status] || `Unable to geocode address (${data.status})`;
    throw new Error(errorMsg + (data.error_message ? `: ${data.error_message}` : ''));
  }
  
  const location = data.results[0].geometry.location;
  return {
    lat: location.lat,
    lng: location.lng,
  };
}

/**
 * Search for dentists using Google Places API
 */
async function searchDentists(
  location: Location,
  radius: number,
  specialty?: string,
  rating?: number,
  openNow?: boolean
): Promise<DentistInfo[]> {
  // Build search query
  let keyword = 'dentist';
  if (specialty && specialty !== 'General') {
    keyword = `${specialty} dentist`;
  }

  // Build Places API URL
  const searchUrl = new URL(`${GOOGLE_PLACES_BASE_URL}/nearbysearch/json`);
  searchUrl.searchParams.append('location', `${location.lat},${location.lng}`);
  searchUrl.searchParams.append('radius', (radius * 1609.34).toString()); // Convert miles to meters
  searchUrl.searchParams.append('keyword', keyword);
  searchUrl.searchParams.append('type', 'dentist');
  searchUrl.searchParams.append('key', GOOGLE_PLACES_API_KEY);
  
  if (openNow) {
    searchUrl.searchParams.append('opennow', 'true');
  }

  const response = await fetch(searchUrl.toString());
  
  if (!response.ok) {
    throw new Error(`Places search failed: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(`Places API error: ${data.status}`);
  }
  
  const results = data.results || [];
  
  // Filter by rating if specified
  const filteredResults = rating
    ? results.filter((place: any) => place.rating >= rating)
    : results;
  
  // Convert to DentistInfo format
  const dentists: DentistInfo[] = filteredResults.map((place: any) => {
    // Calculate distance
    const distance = calculateDistance(
      location.lat,
      location.lng,
      place.geometry.location.lat,
      place.geometry.location.lng
    );
    
    return {
      placeId: place.place_id,
      name: place.name,
      specialty: specialty || 'General',
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
  
  return dentists;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in miles
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!GOOGLE_PLACES_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'Google Places API key not configured',
          code: 'CONFIG_ERROR',
        },
        { status: 500 }
      );
    }

    // Parse request body
    const body: SearchDentistsRequestBody = await request.json();

    // Validate required fields
    if (!body.location) {
      return NextResponse.json(
        {
          success: false,
          error: 'Location is required',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (!body.radius || typeof body.radius !== 'number' || body.radius <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Valid radius (in miles) is required',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Convert location to coordinates if it's a string
    let coordinates: Location;
    
    if (typeof body.location === 'string') {
      coordinates = await geocodeAddress(body.location);
    } else {
      // Validate coordinates
      if (
        typeof body.location.lat !== 'number' ||
        typeof body.location.lng !== 'number' ||
        body.location.lat < -90 ||
        body.location.lat > 90 ||
        body.location.lng < -180 ||
        body.location.lng > 180
      ) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid coordinates',
            code: 'VALIDATION_ERROR',
          },
          { status: 400 }
        );
      }
      coordinates = body.location;
    }

    // Search for dentists
    const dentists = await searchDentists(
      coordinates,
      body.radius,
      body.specialty,
      body.rating,
      body.openNow
    );

    // Return results
    return NextResponse.json({
      success: true,
      results: dentists,
    });
  } catch (error: any) {
    console.error('Dentist search API error:', error);

    // Handle geocoding errors
    if (error.message?.includes('geocode')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to find location. Please check the address and try again.',
          code: 'GEOCODING_ERROR',
        },
        { status: 400 }
      );
    }

    // Handle API quota errors
    if (error.message?.includes('OVER_QUERY_LIMIT')) {
      return NextResponse.json(
        {
          success: false,
          error: 'API quota exceeded. Please try again later.',
          code: 'QUOTA_ERROR',
        },
        { status: 429 }
      );
    }

    // Handle network errors
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to connect to Google Places API. Please try again.',
          code: 'NETWORK_ERROR',
        },
        { status: 503 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred during search',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
