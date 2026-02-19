// Test script to verify Gemini API key configuration
// Run with: node scripts/test-gemini-api.js

require('dotenv').config({ path: '.env.local' });

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

async function testGeminiAPI() {
  console.log('🔍 Testing Gemini API Configuration...\n');
  
  if (!GEMINI_API_KEY) {
    console.error('❌ NEXT_PUBLIC_GEMINI_API_KEY not found in .env.local');
    console.log('\nPlease add your API key to .env.local:');
    console.log('NEXT_PUBLIC_GEMINI_API_KEY=your-api-key-here\n');
    return false;
  }

  console.log('✅ API Key found:', GEMINI_API_KEY.substring(0, 10) + '...');
  
  // Test API call
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
    );
    
    if (!response.ok) {
      console.error('❌ API request failed:', response.status, response.statusText);
      const error = await response.text();
      console.error('Error details:', error);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ API is working! Available models:', data.models?.length || 0);
    
    // Check for Gemini Live support
    const liveModels = data.models?.filter(m => m.name.includes('gemini')) || [];
    console.log('✅ Gemini models available:', liveModels.length);
    
    return true;
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    return false;
  }
}

testGeminiAPI()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
