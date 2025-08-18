'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Settings, 
  Brain, 
  MessageCircle,
  AlertCircle,
  CheckCircle,
  Loader2,
  Activity
} from 'lucide-react'
import toast from 'react-hot-toast'
import SpeechRecognitionService from '@/lib/speechRecognitionService'
import VoiceVisualizer from './VoiceVisualizer'

interface VoiceMessage {
  id: string
  text: string
  type: 'user' | 'assistant'
  timestamp: Date
  intent?: string
  confidence?: number
}

interface VoiceAssistantProps {
  onCommand: (command: string) => void
  isActive: boolean
  onToggle: () => void
  location: string
  crop: string
  quantity: string
  isValidLocation: boolean
}

// Intent patterns for agricultural queries
const INTENT_PATTERNS = {
  // Market & Price Queries
  'price_check': [
    'price', 'rate', 'cost', 'value', 'market price', 'mandi price',
    'कीमत', 'दर', 'मंडी', 'भाव', 'मूल्य'
  ],
  'price_alert': [
    'alert', 'notification', 'notify', 'price alert', 'price notification',
    'अलर्ट', 'सूचना', 'नोटिफिकेशन'
  ],
  
  // Weather Queries
  'weather_check': [
    'weather', 'temperature', 'rain', 'humidity', 'forecast', 'climate',
    'मौसम', 'तापमान', 'बारिश', 'आर्द्रता', 'पूर्वानुमान'
  ],
  
  // Storage Queries
  'storage_info': [
    'storage', 'warehouse', 'godown', 'store', 'preserve', 'shelf life',
    'स्टोरेज', 'गोदाम', 'भंडारण', 'संरक्षण'
  ],
  
  // Crop Management
  'crop_advice': [
    'crop', 'farming', 'agriculture', 'sowing', 'harvesting', 'irrigation',
    'फसल', 'खेती', 'कृषि', 'बुवाई', 'कटाई', 'सिंचाई'
  ],
  
  // Financial Queries
  'financial_calc': [
    'profit', 'loss', 'cost', 'expense', 'income', 'calculation', 'finance',
    'लाभ', 'हानि', 'खर्च', 'आय', 'गणना', 'वित्त'
  ],
  
  // Cooperative Queries
  'cooperative_info': [
    'cooperative', 'group', 'collective', 'union', 'society', 'farmer group',
    'सहकारी', 'समूह', 'संघ', 'सोसायटी'
  ],
  
  // General Help
  'help': [
    'help', 'assist', 'support', 'guide', 'how to', 'what can you do',
    'मदद', 'सहायता', 'गाइड', 'कैसे'
  ],
  
  // Navigation
  'navigate': [
    'go to', 'switch to', 'show', 'open', 'navigate', 'take me to',
    'जाओ', 'दिखाओ', 'खोलो', 'ले जाओ'
  ]
}

// Response templates in Hindi and English
const RESPONSES = {
  price_check: {
    en: "The current market price for {crop} in {location} is ₹{price} per quintal. Would you like me to set up a price alert?",
    hi: "{location} में {crop} का वर्तमान बाजार भाव ₹{price} प्रति क्विंटल है। क्या आप प्राइस अलर्ट सेट करना चाहते हैं?"
  },
  weather_check: {
    en: "The current weather in {location} is {temp}°C with {condition}. {advice}",
    hi: "{location} में वर्तमान मौसम {temp}°C है और {condition}। {advice}"
  },
  storage_info: {
    en: "I found {count} storage facilities near {location}. The nearest warehouse is {name} with {capacity} tons capacity.",
    hi: "मैंने {location} के पास {count} स्टोरेज सुविधाएं पाई हैं। निकटतम गोदाम {name} है जिसकी क्षमता {capacity} टन है।"
  },
  crop_advice: {
    en: "For {crop} in {location}, I recommend {advice}. The optimal sowing time is {sowing_time}.",
    hi: "{location} में {crop} के लिए, मैं {advice} सलाह देता हूं। बुवाई का सर्वोत्तम समय {sowing_time} है।"
  },
  financial_calc: {
    en: "Based on current prices, your {quantity} tons of {crop} would fetch approximately ₹{revenue}. Estimated profit margin is {margin}%.",
    hi: "वर्तमान कीमतों के आधार पर, आपके {quantity} टन {crop} से लगभग ₹{revenue} मिलेंगे। अनुमानित लाभ मार्जिन {margin}% है।"
  },
  help: {
    en: "I can help you with market prices, weather updates, storage information, crop advice, financial calculations, and cooperative selling. Just ask me anything about farming!",
    hi: "मैं आपकी मंडी की कीमतों, मौसम अपडेट, स्टोरेज जानकारी, फसल सलाह, वित्तीय गणना और सहकारी बिक्री में मदद कर सकता हूं। बस मुझसे खेती के बारे में कुछ भी पूछें!"
  }
}

export default function VoiceAssistant({
  onCommand,
  isActive,
  onToggle,
  location,
  crop,
  quantity,
  isValidLocation
}: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [messages, setMessages] = useState<VoiceMessage[]>([])
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi'>('hi')
  const [isProcessing, setIsProcessing] = useState(false)
  const [voiceActivity, setVoiceActivity] = useState(0)
  
  const synthesisRef = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthesisRef.current = window.speechSynthesis
    }
  }, [])

  // Intent recognition function
  const detectIntent = useCallback((text: string): { intent: string; confidence: number } => {
    const lowerText = text.toLowerCase()
    let bestIntent = 'unknown'
    let bestConfidence = 0
    
    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
      for (const pattern of patterns) {
        if (lowerText.includes(pattern.toLowerCase())) {
          const confidence = pattern.length / text.length
          if (confidence > bestConfidence) {
            bestConfidence = confidence
            bestIntent = intent
          }
        }
      }
    }
    
    return { intent: bestIntent, confidence: bestConfidence }
  }, [])

  // Generate response based on intent
  const generateResponse = useCallback((intent: string, userInput: string): string => {
    const lang = selectedLanguage
    
    switch (intent) {
      case 'price_check':
        const price = Math.floor(Math.random() * 1000) + 1500 // Mock price
        return RESPONSES.price_check[lang]
          .replace('{crop}', crop || 'wheat')
          .replace('{location}', location || 'Punjab')
          .replace('{price}', price.toString())
          
             case 'weather_check':
         const temp = Math.floor(Math.random() * 15) + 20
         const conditions = ['sunny', 'cloudy', 'partly cloudy']
         const condition = conditions[Math.floor(Math.random() * conditions.length)]
         const weatherAdvice = 'Good conditions for farming activities.'
         return RESPONSES.weather_check[lang]
           .replace('{temp}', temp.toString())
           .replace('{condition}', condition)
           .replace('{advice}', weatherAdvice)
           
       case 'storage_info':
         return RESPONSES.storage_info[lang]
           .replace('{count}', '3')
           .replace('{location}', location || 'Punjab')
           .replace('{name}', 'Punjab State Warehousing Corporation')
           .replace('{capacity}', '50000')
           
       case 'crop_advice':
         const cropAdvice = 'Ensure proper irrigation and monitor for pests'
         const sowingTime = 'October to December'
         return RESPONSES.crop_advice[lang]
           .replace('{crop}', crop || 'wheat')
           .replace('{location}', location || 'Punjab')
           .replace('{advice}', cropAdvice)
           .replace('{sowing_time}', sowingTime)
          
      case 'financial_calc':
        const revenue = Math.floor(Math.random() * 50000) + 100000
        const margin = Math.floor(Math.random() * 20) + 15
        return RESPONSES.financial_calc[lang]
          .replace('{quantity}', quantity || '10')
          .replace('{crop}', crop || 'wheat')
          .replace('{revenue}', revenue.toString())
          .replace('{margin}', margin.toString())
          
      case 'help':
        return RESPONSES.help[lang]
        
      default:
        return lang === 'hi' 
          ? "माफ़ करें, मैं आपकी बात समझ नहीं पाया। कृपया दोबारा कहें।"
          : "Sorry, I didn't understand that. Please try again."
    }
  }, [selectedLanguage, location, crop, quantity])



  // Text-to-speech function
  const speakText = useCallback((text: string) => {
    if (synthesisRef.current && !isSpeaking) {
      setIsSpeaking(true)
      
      utteranceRef.current = new SpeechSynthesisUtterance(text)
      utteranceRef.current.lang = selectedLanguage === 'hi' ? 'hi-IN' : 'en-IN'
      utteranceRef.current.rate = 0.9
      utteranceRef.current.pitch = 1
      utteranceRef.current.volume = 1
      
      utteranceRef.current.onend = () => {
        setIsSpeaking(false)
      }
      
      utteranceRef.current.onerror = () => {
        setIsSpeaking(false)
        toast.error('Speech synthesis failed')
      }
      
      synthesisRef.current.speak(utteranceRef.current)
    }
  }, [selectedLanguage, isSpeaking])

  // Start listening
  const startListening = () => {
    console.log('Voice assistant: startListening called, isListening:', isListening)
    
    if (!isListening) {
      const service = SpeechRecognitionService.getInstance()
      const success = service.startRecognition({
        onStart: () => {
          setIsListening(true)
          setCurrentTranscript('')
          console.log('Voice assistant: Speech recognition started')
        },
                 onResult: (transcript, isFinal) => {
           setCurrentTranscript(transcript)
           // Simulate voice activity based on transcript length
           setVoiceActivity(Math.min(transcript.length / 50, 1))
           
           if (isFinal) {
             console.log('Voice assistant: Final transcript received:', transcript)
            
            // Process the final transcript
            const userMessage: VoiceMessage = {
              id: Date.now().toString(),
              text: transcript,
              type: 'user',
              timestamp: new Date()
            }
            
            setMessages(prev => [...prev, userMessage])
            
            // Detect intent and generate response
            const { intent, confidence } = detectIntent(transcript)
            console.log('Voice assistant: Intent detected:', intent, 'confidence:', confidence)
            
            const response = generateResponse(intent, transcript)
            console.log('Voice assistant: Generated response:', response)
            
            // Add assistant message
            const assistantMessage: VoiceMessage = {
              id: (Date.now() + 1).toString(),
              text: response,
              type: 'assistant',
              timestamp: new Date(),
              intent,
              confidence
            }
            
            setMessages(prev => [...prev, assistantMessage])
            
            // Speak response
            speakText(response)
            
            // Execute command if needed
            if (intent === 'navigate') {
              console.log('Voice assistant: Executing navigation command')
              onCommand(transcript)
            }
          }
        },
        onError: (error) => {
          console.error('Voice assistant: Speech recognition error:', error)
          setIsListening(false)
          if (error === 'no-speech') {
            toast.error('No speech detected. Please try again.')
          }
        },
                 onEnd: () => {
           setIsListening(false)
           setVoiceActivity(0)
         }
             }, 'VoiceAssistant')
      
             if (!success) {
         toast.error('Failed to start speech recognition')
       }
    }
  }

  // Stop listening
  const stopListening = () => {
    if (isListening) {
      const service = SpeechRecognitionService.getInstance()
      service.stopRecognition()
    }
  }

  // Stop speaking
  const stopSpeaking = () => {
    if (synthesisRef.current && isSpeaking) {
      synthesisRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  // Toggle voice assistant
  const toggleVoiceAssistant = () => {
    if (isActive) {
      stopListening()
      stopSpeaking()
    }
    onToggle()
  }

  // Clear messages
  const clearMessages = () => {
    setMessages([])
  }

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">KrishiAI Voice Assistant</h3>
                  <p className="text-sm opacity-90">
                    {selectedLanguage === 'hi' ? 'हिंदी में बात करें' : 'Speak in English'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleVoiceAssistant}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <MicOff className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto h-[400px]">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">
                  {selectedLanguage === 'hi' 
                    ? 'मुझसे कुछ भी पूछें - कीमत, मौसम, स्टोरेज, या फसल सलाह'
                    : 'Ask me anything - prices, weather, storage, or crop advice'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      {message.intent && message.intent !== 'unknown' && (
                        <div className="flex items-center space-x-1 mt-1">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-gray-500">
                            Intent: {message.intent} ({Math.round((message.confidence || 0) * 100)}%)
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-gray-600">Processing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Current Transcript */}
          {isListening && currentTranscript && (
            <div className="px-4 py-2 bg-blue-50 border-t">
              <p className="text-sm text-blue-600">
                <span className="font-medium">Listening:</span> {currentTranscript}
              </p>
            </div>
          )}

          {/* Controls */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedLanguage(selectedLanguage === 'hi' ? 'en' : 'hi')}
                  className="px-3 py-1 text-xs bg-white border rounded-lg hover:bg-gray-50"
                >
                  {selectedLanguage === 'hi' ? 'English' : 'हिंदी'}
                </button>
                <button
                  onClick={clearMessages}
                  className="px-3 py-1 text-xs bg-white border rounded-lg hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                {isSpeaking && (
                  <button
                    onClick={stopSpeaking}
                    className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                  >
                    <VolumeX className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

                         {/* Voice Activity Visualizer */}
             <div className="mb-3 p-3 bg-gray-100 rounded-lg">
               <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center space-x-2">
                   <Activity className="w-4 h-4 text-gray-600" />
                   <span className="text-sm font-medium text-gray-700">Voice Activity</span>
                 </div>
                 <span className="text-xs text-gray-500">
                   {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Idle'}
                 </span>
               </div>
               <VoiceVisualizer 
                 isListening={isListening} 
                 isSpeaking={isSpeaking}
                 volume={voiceActivity}
                 className="h-6"
               />
             </div>

             {/* Main Control Button */}
             <div className="flex justify-center">
               <button
                 onClick={isListening ? stopListening : startListening}
                 disabled={isProcessing}
                 className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                   isListening
                     ? 'bg-red-500 text-white animate-pulse'
                     : 'bg-green-500 text-white hover:bg-green-600'
                 } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
               >
                 {isProcessing ? (
                   <Loader2 className="w-6 h-6 animate-spin" />
                 ) : isListening ? (
                   <MicOff className="w-6 h-6" />
                 ) : (
                   <Mic className="w-6 h-6" />
                 )}
               </button>
             </div>
            
            <p className="text-center text-xs text-gray-500 mt-2">
              {isListening 
                ? 'Click to stop listening'
                : 'Click to start listening'
              }
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
