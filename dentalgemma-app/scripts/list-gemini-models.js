// List available Gemini models
// Run with: node scripts/list-gemini-models.js

require('dotenv').config({ path: '.env.local' });

async function listModels() {
  console.log('🔍 Listing available Gemini models...\n');
  
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ NEXT_PUBLIC_GEMINI_API_KEY not found in .env.local');
    return false;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    
    if (!response.ok) {
      console.error('❌ API request failed:', response.status, response.statusText);
      return false;
    }
    
    const data = await response.json();
    
    console.log(`✅ Found ${data.models?.length || 0} models\n`);
    
    // Filter for Gemini models that support generateContent
    const geminiModels = data.models?.filter(m => 
      m.name.includes('gemini') && 
      m.supportedGenerationMethods?.includes('generateContent')
    ) || [];
    
    console.log('📋 Gemini models supporting generateContent:');
    geminiModels.forEach(model => {
      console.log(`  - ${model.name}`);
      console.log(`    Display: ${model.displayName}`);
      console.log(`    Methods: ${model.supportedGenerationMethods?.join(', ')}`);
      console.log('');
    });
    
    // Check for Live API models
    const liveModels = data.models?.filter(m => 
      m.name.includes('native-audio') || m.name.includes('live')
    ) || [];
    
    if (liveModels.length > 0) {
      console.log('\n🎙️ Live API / Native Audio models:');
      liveModels.forEach(model => {
        console.log(`  - ${model.name}`);
        console.log(`    Display: ${model.displayName}`);
        console.log(`    Methods: ${model.supportedGenerationMethods?.join(', ')}`);
        console.log('');
      });
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error listing models:', error.message);
    return false;
  }
}

listModels()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
