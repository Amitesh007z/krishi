'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
import toast from 'react-hot-toast'

// Add type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

interface VoiceInterfaceProps {
  onCommand: (command: string) => void
  isActive: boolean
  onToggle: () => void
}

const VoiceInterface = ({ onCommand, isActive, onToggle }: VoiceInterfaceProps) => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [suggestions] = useState([
    'मंडी में गेहूं की कीमत क्या है?',
    'मुझे कब फसल बेचनी चाहिए?',
    'स्टोरेज में कितना खर्च आएगा?',
    'मौसम कैसा रहेगा?',
    'सहकारी बिक्री के लिए कौन से किसान हैं?'
  ])

  const recognitionRef = useRef<any>(null)
  const synthesisRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    // Initialize main speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = getLanguageCode('english')

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript)
          processCommand(finalTranscript)
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        toast.error('Voice recognition error. Please try again.')
      }

      recognitionRef.current.onend = () => {
        if (isListening) {
          // Restart if still supposed to be listening
          setTimeout(() => {
            if (isListening) {
              try {
                recognitionRef.current?.start()
              } catch (error) {
                console.error('Failed to restart recognition:', error)
              }
            }
          }, 100)
        }
      }
    }

    // Initialize speech synthesis
    synthesisRef.current = window.speechSynthesis

    // Auto-start listening when interface appears
    setTimeout(() => {
      startMainRecognition()
    }, 500)

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synthesisRef.current && isSpeaking) {
        synthesisRef.current.cancel()
      }
    }
  }, [isListening])

  const startMainRecognition = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start()
        setIsListening(true)
        setTranscript('')
        toast.success('Voice assistant activated! Speak your command.')
      } catch (error) {
        console.error('Failed to start main recognition:', error)
        toast.error('Failed to start voice recognition')
      }
    }
  }

  const getLanguageCode = (lang: string) => {
    const languageCodes: { [key: string]: string } = {
      hindi: 'hi-IN',
      tamil: 'ta-IN',
      bengali: 'bn-IN',
      marathi: 'mr-IN',
      english: 'en-IN'
    }
    return languageCodes[lang] || 'en-IN'
  }

  const processCommand = (command: string) => {
    const lowerCommand = command.toLowerCase()
    
    // Process commands in multiple languages
    if (lowerCommand.includes('market') || lowerCommand.includes('price') || 
        lowerCommand.includes('मंडी') || lowerCommand.includes('कीमत')) {
      onCommand('Show market prices')
    } else if (lowerCommand.includes('storage') || lowerCommand.includes('warehouse') ||
               lowerCommand.includes('स्टोरेज') || lowerCommand.includes('गोदाम')) {
      onCommand('Show storage options')
    } else if (lowerCommand.includes('cooperative') || lowerCommand.includes('group') ||
               lowerCommand.includes('सहकारी') || lowerCommand.includes('समूह')) {
      onCommand('Show cooperative selling')
    } else if (lowerCommand.includes('weather') || lowerCommand.includes('मौसम')) {
      onCommand('Show weather forecast')
    } else {
      onCommand(command)
    }
  }

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current?.start()
        setIsListening(true)
        setTranscript('')
      } catch (error) {
        console.error('Speech recognition not available:', error)
        toast.error('Speech recognition not available in this browser')
      }
    }
  }

  const speak = (text: string) => {
    if (synthesisRef.current) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = getLanguageCode('english') // Default to English
      utterance.rate = 0.8
      utterance.pitch = 1
      
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      
      synthesisRef.current.speak(utterance)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    speak(suggestion)
    processCommand(suggestion)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">Voice Assistant</h3>
        <button
          onClick={onToggle}
          className="p-3 hover:bg-gray-100 rounded-full transition-colors"
        >
          <MicOff className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Status */}
      <div className="px-4 py-3 bg-green-50 border-b border-green-100">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm text-green-700">
            Voice assistant is active and ready!
          </span>
        </div>
      </div>

      {/* Voice Control */}
      <div className="p-4">
        <div className="flex items-center justify-center mb-4">
          <button
            onClick={toggleListening}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-primary-500 text-white hover:bg-primary-600'
            }`}
          >
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
        </div>
        
        <p className="text-center text-sm text-gray-600 mb-4">
          {isListening ? 'Listening... Speak now!' : 'Click to start voice input'}
        </p>

        {/* Instructions */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <span className="font-medium">💡 How to use:</span> 
          </p>
          <ul className="text-xs text-blue-600 mt-2 space-y-1">
            <li>• Say "Voice Assistant" to activate me</li>
            <li>• Click the microphone button to start listening</li>
            <li>• Speak your command clearly</li>
          </ul>
          <button
            onClick={() => {
              speak('Testing voice interface. I can hear you!')
              toast.success('Voice test successful!')
            }}
            className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 transition-colors"
          >
            Test Voice Output
          </button>
        </div>

        {/* Transcript */}
        {transcript && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-medium">You said:</span> {transcript}
            </p>
          </div>
        )}

        {/* Quick Suggestions */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 mb-2">Quick Questions:</p>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-3 bg-gray-50 rounded-b-2xl flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500' : 'bg-gray-400'}`} />
          <span className="text-xs text-gray-600">
            {isListening ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        <button
          onClick={() => speak('Voice assistant is ready to help you')}
          className="flex items-center space-x-1 text-xs text-gray-600 hover:text-gray-800"
        >
          {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span>Test Voice</span>
        </button>
      </div>
    </motion.div>
  )
}

export default VoiceInterface
