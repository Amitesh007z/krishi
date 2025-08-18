'use client'

import { useState } from 'react'
import { generateAIResponse, testLlamafileConnection } from '@/lib/llamafileAI'

export default function LlamafileTest() {
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [crop, setCrop] = useState('wheat')
  const [location, setLocation] = useState('Patiala, Punjab')

  const testConnection = async () => {
    setIsLoading(true)
    try {
      const result = await testLlamafileConnection()
      setStatus(`${result.status}: ${result.message}`)
    } catch (error) {
      setStatus(`Error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const askAI = async () => {
    if (!question.trim()) return
    
    setIsLoading(true)
    setResponse('')
    
    try {
      const aiResponse = await generateAIResponse({
        prompt: question,
        language: 'en',
        context: {
          crop,
          location,
          quantity: '10',
          currentTab: 'market'
        }
      })
      
      setResponse(aiResponse.text)
    } catch (error) {
      setResponse(`Error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8 text-green-600">
        🧠 Llamafile AI Test Interface
      </h1>
      
      {/* Connection Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">🔌 Connection Status</h2>
        <button
          onClick={testConnection}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Llamafile Connection'}
        </button>
        {status && (
          <div className="mt-3 p-3 bg-white rounded border">
            <strong>Status:</strong> {status}
          </div>
        )}
      </div>

      {/* AI Chat Interface */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">🤖 Ask AI Farming Assistant</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Crop:</label>
            <input
              type="text"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="e.g., wheat, rice, potato"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Location:</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="e.g., Patiala, Punjab"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Your Question:</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full p-3 border rounded h-24"
            placeholder="Ask anything about farming, prices, weather, etc. For example: What's the forecasted price for wheat in Patiala?"
          />
        </div>

        <button
          onClick={askAI}
          disabled={isLoading || !question.trim()}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          {isLoading ? '🤔 Thinking...' : '🧠 Ask AI'}
        </button>
      </div>

      {/* AI Response */}
      {response && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold mb-2 text-green-700">🤖 AI Response:</h3>
          <div className="whitespace-pre-wrap text-gray-800">{response}</div>
        </div>
      )}

      {/* Example Questions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-blue-700">💡 Example Questions to Try:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => setQuestion("What's the forecasted price for wheat in Patiala?")}
            className="p-3 text-left bg-white rounded border hover:bg-gray-50"
          >
            "What's the forecasted price for wheat in Patiala?"
          </button>
          <button
            onClick={() => setQuestion("How to increase rice yield in Punjab?")}
            className="p-3 text-left bg-white rounded border hover:bg-gray-50"
          >
            "How to increase rice yield in Punjab?"
          </button>
          <button
            onClick={() => setQuestion("Best time to sell potatoes this year?")}
            className="p-3 text-left bg-white rounded border hover:bg-gray-50"
          >
            "Best time to sell potatoes this year?"
          </button>
          <button
            onClick={() => setQuestion("Weather impact on cotton farming?")}
            className="p-3 text-left bg-white rounded border hover:bg-gray-50"
          >
            "Weather impact on cotton farming?"
          </button>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h3 className="text-lg font-semibold mb-3 text-yellow-700">⚠️ Setup Required:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Download Llamafile from <a href="https://github.com/Mozilla-Ocho/llamafile" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">GitHub</a></li>
          <li>Run the Llamafile binary to start the local server (default: http://localhost:8080)</li>
          <li>Ensure a model is available/loaded for chat completions</li>
          <li>Test connection using the button above</li>
        </ol>
      </div>
    </div>
  )
}
