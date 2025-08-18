// 🧠 Real AI Integration with Llamafile (OpenAI-compatible API)
// This provides actual AI intelligence, not keyword matching!

export interface LlamafileResponse {
  text: string
  confidence: number
  context: any
  model: string
  timestamp: string
}

export interface LlamafileRequest {
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

// Llamafile server configuration (OpenAI-compatible)
// Default to localhost:8080; allow override via env var if provided
const LLAMAFILE_BASE_URL = process.env.NEXT_PUBLIC_LLAMAFILE_BASE_URL || 'http://localhost:8080'
const DEFAULT_MODEL = process.env.NEXT_PUBLIC_LLAMAFILE_MODEL || 'llama-2-7b-chat'
const DEFAULT_MAX_TOKENS = Number(process.env.NEXT_PUBLIC_LLAMAFILE_MAX_TOKENS || 200)
const DEFAULT_TEMPERATURE = Number(process.env.NEXT_PUBLIC_LLAMAFILE_TEMPERATURE || 0.7)
const DEFAULT_TOP_P = Number(process.env.NEXT_PUBLIC_LLAMAFILE_TOP_P || 0.9)
const REQUEST_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_LLAMAFILE_TIMEOUT_MS || 12000)

// Check if Llamafile server is running
export async function checkLlamafileStatus(): Promise<boolean> {
  try {
    const response = await fetch(`/api/llama/models`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    return response.ok
  } catch (error) {
    console.log('Llamafile not running:', error)
    return false
  }
}

// Get available models
export async function getAvailableModels(): Promise<string[]> {
  try {
    const response = await fetch(`${LLAMAFILE_BASE_URL}/v1/models`)
    if (response.ok) {
      const data = await response.json()
      // OpenAI-compatible format: { data: [{ id: 'model-id', ... }, ...] }
      const models = Array.isArray(data?.data) ? data.data : []
      return models.map((m: any) => m.id).filter(Boolean)
    }
  } catch (error) {
    console.error('Error getting models:', error)
  }
  return []
}

// Generate AI response using Llamafile (OpenAI chat completions)
export async function generateAIResponse(request: LlamafileRequest): Promise<LlamafileResponse> {
  try {
    // Check if Llamafile is available
    const isRunning = await checkLlamafileStatus()
    if (!isRunning) {
      throw new Error('Llamafile server is not running. Please start Llamafile and load a model.')
    }

    // Build context-aware message set
    const systemContent = buildContextPrompt(request)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    const response = await fetch(`/api/llama/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        stream: false,
        temperature: DEFAULT_TEMPERATURE,
        top_p: DEFAULT_TOP_P,
        max_tokens: DEFAULT_MAX_TOKENS,
        messages: [
          { role: 'system', content: systemContent },
          { role: 'user', content: request.prompt }
        ]
      }),
      signal: controller.signal
    })
    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`Llamafile API error: ${response.status}`)
    }

    const data = await response.json()
    const aiText = data?.choices?.[0]?.message?.content || 'I apologize, but I could not generate a response at this time.'

    return {
      text: aiText,
      confidence: 0.95,
      context: request.context,
      model: DEFAULT_MODEL,
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('❌ Llamafile AI error:', error)
    return generateFallbackResponse(request)
  }
}

// Build context-aware prompt for farming
function buildContextPrompt(request: LlamafileRequest): string {
  const { prompt, context, language } = request
  const languageName = language === 'hi' ? 'Hindi' : language === 'pa' ? 'Punjabi' : 'English'

  return `You are an expert AI farming assistant for Punjab, India. You provide intelligent, contextual advice about farming, crops, market prices, and agricultural practices.

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

Respond in ${languageName} if the user asked in that language, otherwise respond in English.

Keep your response helpful, practical, and focused on the user's specific farming situation.`
}

// Intelligent fallback when Llamafile is not available
function generateFallbackResponse(request: LlamafileRequest): LlamafileResponse {
  const { prompt, context } = request
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

// Test Llamafile connection
export async function testLlamafileConnection(): Promise<{ status: 'success' | 'warning' | 'error' | 'checking'; message: string }> {
  try {
    const isRunning = await checkLlamafileStatus()
    if (!isRunning) {
      return {
        status: 'error',
        message: 'Llamafile is not running. Please start the Llamafile server and load a model.'
      }
    }

    const models = await getAvailableModels()
    if (models.length === 0) {
      return {
        status: 'warning',
        message: 'Llamafile is running but no models found. Please ensure a model is available.'
      }
    }

    return {
      status: 'success',
      message: `Llamafile is running with ${models.length} model(s): ${models.join(', ')}`
    }
  } catch (error) {
    return {
      status: 'error',
      message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// Get model information (if supported by server)
export async function getModelInfo(): Promise<any> {
  try {
    // Some Llama.cpp-compatible servers expose /v1/models only; no per-model info route is standardized
    const models = await getAvailableModels()
    return { models }
  } catch (error) {
    console.error('Error getting model info:', error)
  }
  return null
}


