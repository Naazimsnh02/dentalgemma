/**
 * Google Places API Configuration
 * 
 * Reads API key from .env file
 */

import Config from 'react-native-config';

// Read from environment variable (.env file)
export const GOOGLE_PLACES_API_KEY = Config.GOOGLE_PLACES_API_KEY || '';

export const GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place';
