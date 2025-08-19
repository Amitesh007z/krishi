'use client'

export interface OpenAIRequest {
  prompt: string
  context?: Record<string, any>
  language?: 'en' | 'hi' | 'pa'
}

export interface OpenAIResponse {
  text: string
  confidence?: number
  context?: Record<string, any>
  model?: string
  timestamp?: string
}

// Client helper to call our server route first, fallback to empty response
export async function generateAIResponse(req: OpenAIRequest): Promise<OpenAIResponse> {
  try {
    const res = await fetch('/api/openai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    })
    if (!res.ok) throw new Error('OpenAI route failed')
    const data = await res.json()
    return data
  } catch (e) {
    console.error('OpenAI primary error:', e)
    return { text: '' }
  }
}


