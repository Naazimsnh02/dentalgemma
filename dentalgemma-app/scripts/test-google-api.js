/**
 * Google Maps API Configuration Test
 * 
 * Run this script to verify your Google Maps API key is properly configured
 * Usage: node scripts/test-google-api.js
 */

require('dotenv').config({ path: '.env.local' });

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

async function testGeocoding() {
  console.log('\n🔍 Testing Google Geocoding API...\n');
  
  if (!GOOGLE_API_KEY) {
    console.error('❌ GOOGLE_PLACES_API_KEY not found in .env.local');
    console.log('\nPlease add your API key to .env.local:');
    console.log('GOOGLE_PLACES_API_KEY=your-api-key-here\n');
    return false;
  }
  
  console.log('✓ API key found:', GOOGLE_API_KEY.substring(0, 10) + '...');
  
  // Test geocoding with a simple address
  const testAddress = 'San Francisco, CA';
  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(testAddress)}&key=${GOOGLE_API_KEY}`;
  
  try {
    console.log(`\n📍 Testing geocoding for: "${testAddress}"`);
    const response = await fetch(geocodeUrl);
    const data = await response.json();
    
    console.log('\nAPI Response:');
    console.log('  Status:', data.status);
    
    if (data.error_message) {
      console.log('  Error:', data.error_message);
    }
    
    if (data.status === 'OK') {
      console.log('  ✅ Geocoding successful!');
      console.log('  Location:', data.results[0].geometry.location);
      console.log('  Formatted Address:', data.results[0].formatted_address);
      return true;
    } else if (data.status === 'REQUEST_DENIED') {
      console.log('\n❌ API Request Denied');
      console.log('\nPossible issues:');
      console.log('  1. API key is invalid');
      console.log('  2. Geocoding API is not enabled for this key');
      console.log('  3. API key restrictions are blocking the request');
      console.log('\nTo fix:');
      console.log('  1. Go to: https://console.cloud.google.com/apis/credentials');
      console.log('  2. Select your API key');
      console.log('  3. Enable "Geocoding API" in the API Library');
      console.log('  4. Check API restrictions (HTTP referrers, IP addresses)');
      return false;
    } else if (data.status === 'OVER_QUERY_LIMIT') {
      console.log('\n❌ API Quota Exceeded');
      console.log('\nPossible issues:');
      console.log('  1. Billing is not enabled for your Google Cloud project');
      console.log('  2. Daily quota has been exceeded');
      console.log('\nTo fix:');
      console.log('  1. Go to: https://console.cloud.google.com/billing');
      console.log('  2. Enable billing for your project');
      return false;
    } else {
      console.log(`\n❌ Geocoding failed with status: ${data.status}`);
      return false;
    }
  } catch (error) {
    console.error('\n❌ Network error:', error.message);
    return false;
  }
}

async function testPlacesAPI() {
  console.log('\n🏥 Testing Google Places API...\n');
  
  // Test places search
  const location = '37.7749,-122.4194'; // San Francisco
  const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=5000&keyword=dentist&type=dentist&key=${GOOGLE_API_KEY}`;
  
  try {
    console.log('📍 Searching for dentists near San Francisco...');
    const response = await fetch(placesUrl);
    const data = await response.json();
    
    console.log('\nAPI Response:');
    console.log('  Status:', data.status);
    
    if (data.error_message) {
      console.log('  Error:', data.error_message);
    }
    
    if (data.status === 'OK') {
      console.log('  ✅ Places search successful!');
      console.log('  Results found:', data.results.length);
      if (data.results.length > 0) {
        console.log('  First result:', data.results[0].name);
      }
      return true;
    } else if (data.status === 'REQUEST_DENIED') {
      console.log('\n❌ API Request Denied');
      console.log('\nTo fix:');
      console.log('  1. Go to: https://console.cloud.google.com/apis/library');
      console.log('  2. Search for "Places API"');
      console.log('  3. Enable "Places API (New)" or "Places API"');
      return false;
    } else {
      console.log(`\n❌ Places search failed with status: ${data.status}`);
      return false;
    }
  } catch (error) {
    console.error('\n❌ Network error:', error.message);
    return false;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Google Maps API Configuration Test');
  console.log('═══════════════════════════════════════════════════════');
  
  const geocodingOk = await testGeocoding();
  const placesOk = await testPlacesAPI();
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  Test Summary');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Geocoding API:', geocodingOk ? '✅ Working' : '❌ Failed');
  console.log('  Places API:', placesOk ? '✅ Working' : '❌ Failed');
  console.log('═══════════════════════════════════════════════════════\n');
  
  if (geocodingOk && placesOk) {
    console.log('🎉 All tests passed! Your API is configured correctly.\n');
  } else {
    console.log('⚠️  Some tests failed. Please follow the instructions above.\n');
  }
}

main();
