// Test script to verify Gemini Live client initialization
// Run with: node scripts/test-gemini-client.js

require('dotenv').config({ path: '.env.local' });

async function testGeminiClient() {
  console.log('🔍 Testing Gemini Live Client Initialization...\n');
  
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ NEXT_PUBLIC_GEMINI_API_KEY not found in .env.local');
    return false;
  }

  console.log('✅ API Key found:', apiKey.substring(0, 10) + '...');
  
  try {
    // Import the Gemini SDK
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    
    console.log('✅ @google/generative-ai package loaded');
    
    // Initialize the client
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log('✅ GoogleGenerativeAI instance created');
    
    // Get a model - using gemini-2.5-flash for text-based chat
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: 'You are a helpful dental assistant.',
    });
    console.log('✅ Model instance created (gemini-2.5-flash)');
    
    // Test a simple chat
    console.log('\n🔄 Testing chat functionality...');
    const chat = model.startChat({
      history: [],
    });
    
    const result = await chat.sendMessage('Hello, can you help with dental questions?');
    const response = result.response.text();
    
    console.log('✅ Chat response received:');
    console.log('   ', response.substring(0, 100) + '...\n');
    
    console.log('✅ All tests passed! Gemini Live client is working correctly.');
    return true;
    
  } catch (error) {
    console.error('❌ Error testing Gemini client:', error.message);
    console.error('   Stack:', error.stack);
    return false;
  }
}

testGeminiClient()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
