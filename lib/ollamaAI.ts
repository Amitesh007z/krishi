// 🧠 Real AI Integration with Ollama
// This provides actual AI intelligence, not keyword matching!

export interface OllamaResponse {
  text: string
  confidence: number
  context: any
  model: string
  timestamp: string
}

export interface OllamaRequest {
  prompt: string
  context: {
    crop?: string
    location?: string
    quantity?: string
    currentTab?: string
    userData?: any
    conversationHistory?: string[]
  }
  language?: 'en' | 'hi' | 'pa'
}

// Ollama API configuration
const OLLAMA_BASE_URL = 'http://localhost:11434'
const DEFAULT_MODEL = 'llama2:7b'

// Check if Ollama is running
export async function checkOllamaStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    return response.ok
  } catch (error) {
    console.log('Ollama not running:', error)
    return false
  }
}

// Get available models
export async function getAvailableModels(): Promise<string[]> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`)
    if (response.ok) {
      const data = await response.json()
      return data.models?.map((m: any) => m.name) || []
    }
  } catch (error) {
    console.error('Error getting models:', error)
  }
  return []
}

// Generate AI response using Ollama
export async function generateAIResponse(request: OllamaRequest): Promise<OllamaResponse> {
  try {
    // Check if Ollama is available
    const isOllamaRunning = await checkOllamaStatus()
    if (!isOllamaRunning) {
      throw new Error('Ollama is not running. Please start Ollama and download a model.')
    }

    // Build context-aware prompt
    const contextPrompt = buildContextPrompt(request)
    
    console.log('🧠 Sending to Ollama:', contextPrompt)

    // Call Ollama API
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        prompt: contextPrompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 500
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.response || 'I apologize, but I could not generate a response at this time.'

    console.log('✅ Ollama response received:', aiResponse)

    return {
      text: aiResponse,
      confidence: 0.95,
      context: request.context,
      model: DEFAULT_MODEL,
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('❌ Ollama AI error:', error)
    
    // Fallback to intelligent response
    return generateFallbackResponse(request)
  }
}

// Build context-aware prompt for farming
function buildContextPrompt(request: OllamaRequest): string {
  const { prompt, context, language } = request
  
  let systemPrompt = `You are an expert AI farming assistant for Punjab, India. You provide intelligent, contextual advice about farming, crops, market prices, and agricultural practices.

Current Context:
- Crop: ${context.crop || 'Not specified'}
- Location: ${context.location || 'Punjab'}
- Quantity: ${context.quantity || 'Not specified'}
- Current Tab: ${context.currentTab || 'General'}

User Question: ${prompt}

Please provide:
1. Direct answer to the question
2. Context-specific advice based on the user's situation
3. Practical recommendations for Punjab farming
4. Market insights if relevant
5. Weather considerations if applicable

Respond in ${language === 'hi' ? 'Hindi' : language === 'pa' ? 'Punjabi' : 'English'} if the user asked in that language, otherwise respond in English.

Keep your response helpful, practical, and focused on the user's specific farming situation.`

  return systemPrompt
}

// Intelligent fallback when Ollama is not available
function generateFallbackResponse(request: OllamaRequest): OllamaResponse {
  const { prompt, context, language } = request
  
  // Analyze the question for better fallback
  const question = prompt.toLowerCase()
  const crop = context.crop || 'farming'
  const location = context.location || 'Punjab'
  
  let response = ''
  
  if (question.includes('price') || question.includes('forecast') || question.includes('market')) {
    response = `Based on current market trends for ${crop} in ${location}, I recommend monitoring local mandi prices. For accurate price forecasting, consider factors like seasonal demand, weather conditions, and government policies. You can check the Market Intelligence tab for real-time price data.`
  } else if (question.includes('yield') || question.includes('production')) {
    response = `To improve ${crop} yield in ${location}, focus on proper soil preparation, timely sowing, adequate irrigation, and pest management. Consider using recommended fertilizers and following crop rotation practices. The AI Insights tab can provide specific recommendations for your area.`
  } else if (question.includes('weather') || question.includes('climate')) {
    response = `Weather conditions significantly impact ${crop} farming in ${location}. Monitor local weather forecasts and adjust farming practices accordingly. Consider using weather-resistant varieties and implementing proper irrigation systems. Check the Weather tab for current conditions.`
  } else if (question.includes('pest') || question.includes('disease')) {
    response = `For ${crop} pest and disease management in ${location}, implement integrated pest management (IPM) strategies. Regular field monitoring, timely treatment, and using resistant varieties are key. Consider organic alternatives when possible and follow local agricultural extension recommendations.`
  } else {
    response = `I understand you're asking about ${crop} farming in ${location}. While I can provide general guidance, for the most accurate and up-to-date information, I recommend checking the relevant tabs in the app or consulting with local agricultural experts.`
  }
  
  return {
    text: response,
    confidence: 0.7,
    context: request.context,
    model: 'Fallback AI',
    timestamp: new Date().toISOString()
  }
}

// Test Ollama connection
export async function testOllamaConnection(): Promise<{ status: string; message: string }> {
  try {
    const isRunning = await checkOllamaStatus()
    if (!isRunning) {
      return {
        status: 'error',
        message: 'Ollama is not running. Please start Ollama and download a model.'
      }
    }
    
    const models = await getAvailableModels()
    if (models.length === 0) {
      return {
        status: 'warning',
        message: 'Ollama is running but no models found. Please download a model using: ollama pull llama2:7b'
      }
    }
    
    return {
      status: 'success',
      message: `Ollama is running with ${models.length} model(s): ${models.join(', ')}`
    }
    
  } catch (error) {
    return {
      status: 'error',
      message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// Get model information
export async function getModelInfo(): Promise<any> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/show`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: DEFAULT_MODEL })
    })
    
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('Error getting model info:', error)
  }
  
  return null
}
