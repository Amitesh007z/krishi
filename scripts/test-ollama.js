#!/usr/bin/env node

const fetch = require('node-fetch');

async function testOllama() {
  console.log('🔍 Testing Ollama connection...\n');
  
  try {
    // Test if Ollama is running
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      const models = data.models || [];
      
      console.log('✅ Ollama is running successfully!');
      console.log(`📦 Available models: ${models.length}`);
      
      if (models.length > 0) {
        console.log('📋 Models:');
        models.forEach(model => {
          console.log(`   - ${model.name} (${model.size || 'Unknown size'})`);
        });
        
        // Test if llama2:7b is available
        const hasLlama2 = models.some(m => m.name.includes('llama2:7b'));
        if (hasLlama2) {
          console.log('\n🎉 Perfect! llama2:7b is available and ready to use.');
          return true;
        } else {
          console.log('\n⚠️  Warning: llama2:7b not found. Please run: ollama pull llama2:7b');
          return false;
        }
      } else {
        console.log('\n⚠️  No models found. Please run: ollama pull llama2:7b');
        return false;
      }
    } else {
      console.log('❌ Ollama responded but with error:', response.status);
      return false;
    }
    
  } catch (error) {
    console.log('❌ Ollama is not running or not accessible');
    console.log('💡 To fix this:');
    console.log('   1. Install Ollama: https://ollama.ai/download');
    console.log('   2. Start Ollama: ollama serve');
    console.log('   3. Download model: ollama pull llama2:7b');
    return false;
  }
}

// Run the test
testOllama().then(success => {
  process.exit(success ? 0 : 1);
});
