'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface WelcomeSetupProps {
  onSetupComplete: () => void
  onDemoMode: () => void
}

export default function WelcomeSetup({ onSetupComplete, onDemoMode }: WelcomeSetupProps) {
  const [selectedOption, setSelectedOption] = useState<'setup' | 'demo' | 'learn' | null>(null)
  const [showTutorial, setShowTutorial] = useState(false)

  const handleQuickStart = () => {
    setSelectedOption('setup')
    window.open('https://github.com/Mozilla-Ocho/llamafile', '_blank')
  }

  const handleDemoMode = () => {
    setSelectedOption('demo')
    onDemoMode()
  }

  const handleLearnMore = () => {
    setSelectedOption('learn')
    setShowTutorial(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold text-gray-800 mb-4"
          >
            🧠 AI Farming Assistant
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600"
          >
            Get intelligent farming advice powered by real AI
          </motion.p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Option 1: Quick Start */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className={`p-6 bg-white rounded-xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
              selectedOption === 'setup' ? 'border-green-500 bg-green-50' : 'border-gray-200'
            }`}
          >
            <div className="text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Quick Start</h3>
              <p className="text-gray-600 mb-6">
                Install Llamafile for the full AI experience. Get real, intelligent responses to all your farming questions.
              </p>
              <button
                onClick={handleQuickStart}
                className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Download Llamafile
              </button>
              <p className="text-sm text-gray-500 mt-3">
                ~4GB download, one-time setup
              </p>
            </div>
          </motion.div>

          {/* Option 2: Try Demo */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className={`p-6 bg-white rounded-xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
              selectedOption === 'demo' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            <div className="text-center">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Try Demo</h3>
              <p className="text-gray-600 mb-6">
                Experience the AI without installation. See how it works with sample responses.
              </p>
              <button
                onClick={handleDemoMode}
                className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Start Demo
              </button>
              <p className="text-sm text-gray-500 mt-3">
                No installation required
              </p>
            </div>
          </motion.div>

          {/* Option 3: Learn More */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 }}
            className={`p-6 bg-white rounded-xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
              selectedOption === 'learn' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
            }`}
          >
            <div className="text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Learn More</h3>
              <p className="text-gray-600 mb-6">
                Understand how the AI works, what it can do, and how to get the most out of it.
              </p>
              <button
                onClick={handleLearnMore}
                className="w-full px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
              >
                View Tutorial
              </button>
              <p className="text-sm text-gray-500 mt-3">
                Interactive guide
              </p>
            </div>
          </motion.div>
        </div>

        {/* Features */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="bg-white rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">🌟 What You Get</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✅</span>
              <span>Real AI Intelligence (not keyword matching)</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✅</span>
              <span>100% Offline Operation</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✅</span>
              <span>Context-Aware Responses</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✅</span>
              <span>Multi-Language Support</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✅</span>
              <span>Free Forever (no monthly costs)</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✅</span>
              <span>Privacy (all data stays local)</span>
            </div>
          </div>
        </motion.div>

        {/* Tutorial Modal */}
        {showTutorial && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">🧠 How AI Farming Assistant Works</h2>
                <button
                  onClick={() => setShowTutorial(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">🤖 What is Llamafile?</h3>
                  <p className="text-gray-600">
                    Llamafile is a fast, portable AI server that runs locally with OpenAI-compatible APIs. It's like having ChatGPT 
                    but completely private and offline.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">🌾 How It Helps Farmers</h3>
                  <p className="text-gray-600">
                    The AI understands farming context and provides intelligent advice about:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 ml-4 mt-2">
                    <li>Crop management and best practices</li>
                    <li>Market price trends and timing</li>
                    <li>Weather impact on farming</li>
                    <li>Pest and disease management</li>
                    <li>Soil health and fertilization</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">💬 Example Questions</h3>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-700">
                      "What's the forecasted price for wheat in Patiala?"<br/>
                      "How to increase rice yield in Punjab?"<br/>
                      "Best time to sell potatoes this year?"<br/>
                      "Weather impact on cotton farming?"
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">🔒 Privacy & Security</h3>
                  <p className="text-gray-600">
                    All AI processing happens on your computer. No data is sent to external servers, 
                    ensuring complete privacy and security.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setShowTutorial(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Close
                </button>
                <button
                  onClick={handleQuickStart}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
