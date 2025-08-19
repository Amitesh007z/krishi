'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Brain, 
  MessageCircle,
  AlertCircle,
  CheckCircle,
  Loader2,
  Activity,
  Settings,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'
import SpeechRecognitionService from '@/lib/speechRecognitionService'
import VoiceVisualizer from './VoiceVisualizer'
import { getMarketPrices, getWeatherData, getStorageFacilities, getAIRecommendations } from '@/lib/api'
import { generateAIResponse as generateOpenAIResponse } from '@/lib/openaiPrimary'
import { generateAIResponse as generateLlamafileResponse } from '@/lib/llamafileAI'
import { processOfflineVoiceCommand } from '@/lib/offlineLLM'

interface VoiceMessage {
  id: string
  text: string
  type: 'user' | 'assistant'
  timestamp: Date
  intent?: string
  confidence?: number
}

interface UnifiedVoiceControlProps {
  onCommandAction: (command: string) => void
  location: string
  crop: string
  quantity: string
  isValidLocation: boolean
  uiLanguage?: 'en' | 'hi' | 'pa'
}

// Enhanced intent patterns for agricultural queries with more variations
const INTENT_PATTERNS = {
  'price_check': [
    'price', 'rate', 'cost', 'value', 'market price', 'mandi price', 'bhav', 'kitna', 'kya rate', 'current price',
    'कीमत', 'दर', 'मंडी', 'भाव', 'मूल्य', 'कितना', 'क्या रेट', 'वर्तमान कीमत', 'आज का भाव'
  ],
  'weather_check': [
    'weather', 'temperature', 'rain', 'humidity', 'forecast', 'climate', 'mausam', 'barish', 'pani',
    'मौसम', 'तापमान', 'बारिश', 'आर्द्रता', 'पूर्वानुमान', 'पानी', 'गर्मी', 'सर्दी'
  ],
  'storage_info': [
    'storage', 'warehouse', 'godown', 'store', 'preserve', 'shelf life', 'rakhna', 'sambhalna',
    'स्टोरेज', 'गोदाम', 'भंडारण', 'संरक्षण', 'रखना', 'संभालना', 'कहाँ रखें'
  ],
  'crop_advice': [
    'crop', 'farming', 'agriculture', 'sowing', 'harvesting', 'irrigation', 'fasal', 'kheti', 'bujai',
    'फसल', 'खेती', 'कृषि', 'बुवाई', 'कटाई', 'सिंचाई', 'बीज', 'खाद', 'दवा', 'कीटनाशक'
  ],
  'financial_calc': [
    'profit', 'loss', 'cost', 'expense', 'income', 'calculation', 'finance', 'laba', 'nuksan', 'kharcha',
    'लाभ', 'हानि', 'खर्च', 'आय', 'गणना', 'वित्त', 'कितना मिलेगा', 'कितना खर्च'
  ],
  'cooperative_info': [
    'cooperative', 'group', 'collective', 'union', 'society', 'farmer group', 'sahakari', 'samuh',
    'सहकारी', 'समूह', 'संघ', 'सोसायटी', 'फार्मर ग्रुप', 'मिलकर बेचना'
  ],
  'pest_disease': [
    'pest', 'disease', 'insect', 'fungus', 'virus', 'keeda', 'roga', 'bimari', 'treatment',
    'कीट', 'रोग', 'बीमारी', 'फंगस', 'वायरस', 'इलाज', 'दवा', 'छिड़काव'
  ],
  'fertilizer_info': [
    'fertilizer', 'manure', 'compost', 'khad', 'gobar', 'organic', 'chemical',
    'खाद', 'गोबर', 'कम्पोस्ट', 'रासायनिक', 'जैविक', 'यूरिया', 'डीएपी'
  ],
  'market_trends': [
    'trend', 'market trend', 'price trend', 'future', 'prediction', 'upcoming', 'next month',
    'ट्रेंड', 'बाजार ट्रेंड', 'भविष्य', 'अगले महीने', 'क्या होगा', 'अनुमान'
  ],
  'help': [
    'help', 'assist', 'support', 'guide', 'how to', 'what can you do', 'kya kar sakte ho',
    'मदद', 'सहायता', 'गाइड', 'कैसे', 'क्या कर सकते हो', 'क्या सिखा सकते हो'
  ],
  'navigate': [
    'go to', 'switch to', 'show', 'open', 'navigate', 'take me to', 'dikhao', 'kholo',
    'जाओ', 'दिखाओ', 'खोलो', 'ले जाओ', 'स्क्रीन बदलो', 'पेज खोलो'
  ]
}

// Enhanced response templates with more intelligent and contextual responses
const RESPONSES = {
  price_check: {
    en: "The current market price for {crop} in {location} is ₹{price} per quintal. {trend_info} {advice}",
    hi: "{location} में {crop} का वर्तमान बाजार भाव ₹{price} प्रति क्विंटल है। {trend_info} {advice}"
  },
  weather_check: {
    en: "The current weather in {location} is {temp}°C with {condition}. Humidity is {humidity}%. {advice}",
    hi: "{location} में वर्तमान मौसम {temp}°C है और {condition}। आर्द्रता {humidity}% है। {advice}"
  },
  storage_info: {
    en: "I found {count} storage facilities near {location}. The nearest warehouse is {name} with {capacity} tons capacity. {storage_advice}",
    hi: "मैंने {location} के पास {count} स्टोरेज सुविधाएं पाई हैं। निकटतम गोदाम {name} है जिसकी क्षमता {capacity} टन है। {storage_advice}"
  },
  crop_advice: {
    en: "For {crop} in {location}, I recommend {advice}. The optimal sowing time is {sowing_time}. {additional_tips}",
    hi: "{location} में {crop} के लिए, मैं {advice} सलाह देता हूं। बुवाई का सर्वोत्तम समय {sowing_time} है। {additional_tips}"
  },
  financial_calc: {
    en: "Based on current prices, your {quantity} tons of {crop} would fetch approximately ₹{revenue}. Estimated profit margin is {margin}%. {financial_advice}",
    hi: "वर्तमान कीमतों के आधार पर, आपके {quantity} टन {crop} से लगभग ₹{revenue} मिलेंगे। अनुमानित लाभ मार्जिन {margin}% है। {financial_advice}"
  },
  pest_disease: {
    en: "For {crop} in {location}, common pests include {pests}. I recommend {treatment}. {prevention_tips}",
    hi: "{location} में {crop} के लिए, सामान्य कीट {pests} हैं। मैं {treatment} सलाह देता हूं। {prevention_tips}"
  },
  fertilizer_info: {
    en: "For {crop}, I recommend {fertilizer} at {timing}. {application_method} {organic_alternatives}",
    hi: "{crop} के लिए, मैं {fertilizer} {timing} में सलाह देता हूं। {application_method} {organic_alternatives}"
  },
  market_trends: {
    en: "The market trend for {crop} shows {trend}. {prediction} {recommendation}",
    hi: "{crop} के लिए बाजार ट्रेंड {trend} दिखाता है। {prediction} {recommendation}"
  },
  cooperative_info: {
    en: "I found {count} cooperative societies near {location}. {coop_info} {benefits}",
    hi: "मैंने {location} के पास {count} सहकारी समितियां पाई हैं। {coop_info} {benefits}"
  },
  help: {
    en: "I'm your AI farming assistant! I can help with market prices, weather updates, storage information, crop advice, pest control, fertilizer recommendations, financial calculations, market trends, and cooperative selling. Just ask me anything about farming in natural language!",
    hi: "मैं आपका AI कृषि सहायक हूं! मैं मंडी की कीमतों, मौसम अपडेट, स्टोरेज जानकारी, फसल सलाह, कीट नियंत्रण, खाद सिफारिशें, वित्तीय गणना, बाजार ट्रेंड और सहकारी बिक्री में मदद कर सकता हूं। बस मुझसे खेती के बारे में प्राकृतिक भाषा में कुछ भी पूछें!"
  }
}

export default function UnifiedVoiceControl({
  onCommandAction,
  location,
  crop,
  quantity,
  isValidLocation,
  uiLanguage
}: UnifiedVoiceControlProps) {
  const [isActive, setIsActive] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [messages, setMessages] = useState<VoiceMessage[]>([])
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'pa'>('hi')
  const [isProcessing, setIsProcessing] = useState(false)
  const [voiceActivity, setVoiceActivity] = useState(0)
  const [isSupported, setIsSupported] = useState(false)
  const [isListeningActive, setIsListeningActive] = useState(false)
  
  const synthesisRef = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Check browser support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      setIsSupported(!!SpeechRecognition)
      synthesisRef.current = window.speechSynthesis
    }
  }, [])

  // Keep speech recognition language in sync with selected UI language
  useEffect(() => {
    const service = SpeechRecognitionService.getInstance()
    service.setLanguage(selectedLanguage)
    console.log('Voice control: Language synced to', selectedLanguage)
  }, [selectedLanguage])

  // Sync external UI language from the page header
  useEffect(() => {
    if (uiLanguage && uiLanguage !== selectedLanguage) {
      setSelectedLanguage(uiLanguage)
      console.log('Voice control: UI language changed to', uiLanguage)
    }
  }, [uiLanguage, selectedLanguage])

  // Enhanced AI response generation: offline fast path (pattern) → Llamafile fallback
  const generateVoiceAIResponse = useCallback(async (userInput: string): Promise<string> => {
    try {
      // Offline fast path strictly in the selected language
      const offline = await processOfflineVoiceCommand({
        text: userInput,
        language: selectedLanguage,
        context: {
          location: location || 'Punjab',
          crop: crop || 'wheat',
          quantity: quantity || '10',
          currentTab: 'market',
          lastUtterance: userInput
        }
      })

      if (offline.action !== 'fallback_llm' && offline.text && offline.confidence >= 0.4) {
        return offline.text
      }

      // Use OpenAI first; fallback to Llamafile
      let aiResponse = await generateOpenAIResponse({
        prompt: userInput,
        language: selectedLanguage,
        context: {
          location: location || 'Punjab',
          crop: crop || 'wheat',
          quantity: quantity || '10',
          currentTab: 'market'
        }
      })
      if (!aiResponse?.text) {
        aiResponse = await generateLlamafileResponse({
          prompt: userInput,
          language: selectedLanguage,
          context: {
            location: location || 'Punjab',
            crop: crop || 'wheat',
            quantity: quantity || '10',
            currentTab: 'market'
          }
        })
      }
      console.log('🧠 AI response:', aiResponse)
      return aiResponse.text
      
      } catch (error) {
      console.error('❌ Error generating AI response:', error)
      
      // Fallback response in selected language
      const fallbackText = {
        en: `I can help you with ${crop || 'farming'} in ${location || 'Punjab'}. Ask me anything naturally - I understand context and can provide intelligent advice.`,
        hi: `मैं ${location || 'पंजाब'} में ${crop || 'खेती'} में आपकी मदद कर सकता हूं। मुझसे कुछ भी प्राकृतिक तरीके से पूछें - मैं संदर्भ समझता हूं और बुद्धिमान सलाह दे सकता हूं।`,
        pa: `ਮੈਂ ${location || 'ਪੰਜਾਬ'} ਵਿੱਚ ${crop || 'ਕਿਸਾਨੀ'} ਵਿੱਚ ਤੁਹਾਡੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ। ਮੈਨੂੰ ਕੁਝ ਵੀ ਕੁਦਰਤੀ ਤਰੀਕੇ ਨਾਲ ਪੁੱਛੋ - ਮੈਂ ਸੰਦਰਭ ਸਮਝਦਾ ਹਾਂ ਅਤੇ ਬੁੱਧੀਜੀਵੀ ਸਲਾਹ ਦੇ ਸਕਦਾ ਹਾਂ।`
      }
      return fallbackText[selectedLanguage] || fallbackText.en
    }
  }, [selectedLanguage, location, crop, quantity, onCommandAction])

  // Text-to-speech function
  const speakText = useCallback((text: string) => {
    if (synthesisRef.current && !isSpeaking) {
      setIsSpeaking(true)
      
      utteranceRef.current = new SpeechSynthesisUtterance(text)
      // Set TTS language to match selected language
      const ttsLang = selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'pa' ? 'pa-IN' : 'en-IN'
      utteranceRef.current.lang = ttsLang
      console.log('Voice control: TTS language set to', ttsLang)
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
    if (!isSupported) {
      toast.error('Speech recognition not supported in this browser')
      return
    }

    if (!isListening) {
      const service = SpeechRecognitionService.getInstance()
      // Ensure speech recognition uses current selected language
      service.setLanguage(selectedLanguage)
      const success = service.startRecognition({
                 onStart: () => {
           setIsListening(true)
           setIsListeningActive(true)
           setCurrentTranscript('')
           setVoiceActivity(0.3) // Show initial activity
           console.log('Voice control: Speech recognition started in', selectedLanguage)
           toast.success('🎤 Continuous listening started...')
         },
                 onResult: (transcript, isFinal) => {
           // Real-time transcript display with better activity calculation
           setCurrentTranscript(transcript)
           
           // More responsive activity calculation - show activity even for short transcripts
           if (transcript.length > 0) {
             const activity = Math.min((transcript.length / 10) + 0.4, 1)
             setVoiceActivity(activity)
           } else {
             setVoiceActivity(0.2) // Keep some activity when listening
           }
          
          if (isFinal && transcript.trim().length > 0) {
            console.log('Voice control: Final transcript received:', transcript)
            
            // Process the final transcript
            const userMessage: VoiceMessage = {
              id: Date.now().toString(),
              text: transcript,
              type: 'user',
              timestamp: new Date()
            }
            
            setMessages(prev => [...prev, userMessage])
            
            // Short-circuit for navigation commands: perform action only, no AI reply
            const lower = transcript.toLowerCase()
            const isNavigation = (
              lower.includes('go to') ||
              lower.includes('switch to') ||
              lower.includes('show') ||
              lower.includes('open') ||
              lower.includes('navigate') ||
              lower.includes('take me to') ||
              // Hindi
              lower.includes('जाओ') ||
              lower.includes('दिखाओ') ||
              lower.includes('खोलो') ||
              lower.includes('ले जाओ') ||
              lower.includes('स्क्रीन बदलो') ||
              lower.includes('पेज खोलो') ||
              // Punjabi (Latin)
              lower.includes('dikhao') ||
              lower.includes('kholo') ||
              lower.includes('le jao') ||
              lower.includes('tab dikhao') ||
              // Punjabi (Gurmukhi)
              lower.includes('ਦਿਖਾਓ') ||
              lower.includes('ਖੋਲੋ') ||
              lower.includes('ਲੇ ਜਾਓ') ||
              lower.includes('ਟੈਬ ਦਿਖਾਓ') ||
              lower.includes('ਟੈਬ ਖੋਲੋ')
            )

            if (isNavigation) {
              console.log('Voice control: Navigation command detected, executing without AI reply')
              onCommandAction(transcript)
              // Clear transcript after processing
              setTimeout(() => setCurrentTranscript(''), 1000)
              return
            }

            // Generate AI response directly from user input
            console.log('Voice control: Generating AI response for:', transcript)
            
            // Generate response asynchronously
            setIsProcessing(true)
            generateVoiceAIResponse(transcript).then(response => {
              console.log('Voice control: Generated response:', response)
              
              // Add assistant message
              const assistantMessage: VoiceMessage = {
                id: (Date.now() + 1).toString(),
                text: response,
                type: 'assistant',
                timestamp: new Date(),
                intent: 'ai_response',
                confidence: 0.9
              }
              
              setMessages(prev => [...prev, assistantMessage])
              
              // Speak response
              speakText(response)
              
              // Execute command if needed (for navigation commands)
              if (transcript.toLowerCase().includes('go to') || transcript.toLowerCase().includes('show') || transcript.toLowerCase().includes('open')) {
                console.log('Voice control: Executing navigation command')
                onCommandAction(transcript)
              }
              
              setIsProcessing(false)
            }).catch(error => {
              console.error('Error generating response:', error)
              setIsProcessing(false)
              toast.error('Failed to generate response')
            })
            

            
                                   // Clear transcript after processing
            setTimeout(() => setCurrentTranscript(''), 1000)
          }
        },
        onError: (error) => {
          console.error('Voice control: Speech recognition error:', error)
          
          // Don't stop listening for no-speech errors, just restart
          if (error === 'no-speech') {
            console.log('Voice control: No speech detected, restarting...')
            // Auto-restart after a short delay
            setTimeout(() => {
              if (isListeningActive) {
                console.log('Voice control: Auto-restarting recognition...')
                startListening()
              }
            }, 500)
            return
          }
          
          if (error === 'not-allowed') {
            setIsListening(false)
            setIsListeningActive(false)
            setCurrentTranscript('')
            setVoiceActivity(0)
            toast.error('Microphone access denied. Please allow microphone permissions.')
          } else {
            // For other errors, try to restart
            console.log('Voice control: Error occurred, attempting restart...')
            setTimeout(() => {
              if (isListeningActive) {
                console.log('Voice control: Restarting after error...')
                startListening()
              }
            }, 1000)
          }
        },
        onEnd: () => {
          console.log('Voice control: Speech recognition ended')
          
          // Auto-restart if still supposed to be listening
          if (isListeningActive) {
            console.log('Voice control: Auto-restarting after end...')
            setTimeout(() => {
              if (isListeningActive) {
                startListening()
              }
            }, 300)
          } else {
            setIsListening(false)
            setVoiceActivity(0)
          }
        }
      }, 'UnifiedVoiceControl')

      if (!success) {
        toast.error('Failed to start speech recognition')
      }
    }
  }

  // Stop listening completely
  const stopListening = () => {
    if (isListening) {
      setIsListeningActive(false) // This will prevent auto-restart
      const service = SpeechRecognitionService.getInstance()
      service.stopRecognition()
      setIsListening(false)
      setVoiceActivity(0)
      setCurrentTranscript('')
      console.log('Voice control: Listening stopped by user')
    }
  }

  // Stop speaking
  const stopSpeaking = () => {
    if (synthesisRef.current && isSpeaking) {
      synthesisRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  // Toggle voice control
  const toggleVoiceControl = () => {
    if (isActive) {
      stopListening()
      stopSpeaking()
    }
    setIsActive(!isActive)
  }

  // Clear messages
  const clearMessages = () => {
    setMessages([])
  }

  // Continuous activity animation when listening
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isListeningActive && !isListening) {
      // Show continuous activity when listening is active but no transcript
      interval = setInterval(() => {
        setVoiceActivity(prev => {
          const newActivity = prev + (Math.random() - 0.5) * 0.2
          return Math.max(0.1, Math.min(0.8, newActivity))
        })
      }, 200)
         } else if (isActive && !isListeningActive && !isListening) {
       // Show more visible activity when voice control is open but not listening
       interval = setInterval(() => {
         setVoiceActivity(prev => {
           const newActivity = 0.2 + Math.sin(Date.now() * 0.01) * 0.15
           return Math.max(0.1, Math.min(0.4, newActivity))
         })
       }, 100)
     }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isListeningActive, isListening, isActive])

  if (!isSupported) {
    return (
      <div className="fixed bottom-6 right-6 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
        <div className="flex items-center space-x-2 mb-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold text-gray-900">Voice Control</h3>
        </div>
        <p className="text-sm text-red-600">Speech recognition not supported in this browser</p>
        <p className="text-xs text-gray-500 mt-2">
          Try using Chrome, Edge, or Safari for speech recognition support.
        </p>
      </div>
    )
  }

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
                     className="fixed bottom-6 right-6 w-[420px] h-[700px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">KrishiAI Voice Control</h3>
                  <p className="text-sm opacity-90">
                    {selectedLanguage === 'hi' ? 'हिंदी में बात करें' : 
                     selectedLanguage === 'pa' ? 'ਪੰਜਾਬੀ ਵਿੱਚ ਗੱਲ ਕਰੋ' : 
                     'Speak in English'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleVoiceControl}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

                     {/* Messages */}
           <div className="flex-1 p-4 overflow-y-auto h-[350px]">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">
                  {selectedLanguage === 'hi' 
                    ? 'मुझसे कुछ भी प्राकृतिक तरीके से पूछें - मैं संदर्भ समझता हूं और बुद्धिमान सलाह देता हूं'
                    : selectedLanguage === 'pa'
                    ? 'ਮੈਨੂੰ ਕੁਝ ਵੀ ਕੁਦਰਤੀ ਤਰੀਕੇ ਨਾਲ ਪੁੱਛੋ - ਮੈਂ ਸੰਦਰਭ ਸਮਝਦਾ ਹਾਂ ਅਤੇ ਬੁੱਧੀਜੀਵੀ ਸਲਾਹ ਦਿੰਦਾ ਹਾਂ'
                    : 'Ask me anything naturally - I understand context and provide intelligent advice'
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

                     {/* Real-time Transcript Display */}
           {isListeningActive && (
             <div className="px-4 py-3 bg-blue-50 border-t border-blue-200">
               <div className="flex items-center space-x-2 mb-1">
                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                 <span className="text-xs font-medium text-blue-700">Listening...</span>
               </div>
               {currentTranscript ? (
                 <p className="text-sm text-blue-800 font-medium">
                   {currentTranscript}
                 </p>
               ) : (
                 <p className="text-sm text-blue-600 italic">
                   Speak now...
                 </p>
               )}
             </div>
           )}

                     {/* Controls */}
           <div className="p-6 border-t bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setSelectedLanguage('en')}
                    className={`px-2 py-1 text-xs border rounded-lg transition-colors ${
                      selectedLanguage === 'en' 
                        ? 'bg-blue-500 text-white border-blue-500' 
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setSelectedLanguage('hi')}
                    className={`px-2 py-1 text-xs border rounded-lg transition-colors ${
                      selectedLanguage === 'hi' 
                        ? 'bg-blue-500 text-white border-blue-500' 
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    हिं
                  </button>
                <button
                    onClick={() => setSelectedLanguage('pa')}
                    className={`px-2 py-1 text-xs border rounded-lg transition-colors ${
                      selectedLanguage === 'pa' 
                        ? 'bg-blue-500 text-white border-blue-500' 
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    ਪੰ
                </button>
                </div>
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
             <div className="mb-4 p-4 bg-gray-100 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Voice Activity</span>
                </div>
                                 <span className="text-xs text-gray-500">
                   {isListeningActive ? 'Listening...' : isSpeaking ? 'Speaking...' : isActive ? 'Ready' : 'Idle'}
                 </span>
              </div>
                             <VoiceVisualizer 
                 isListening={isListeningActive} 
                 isSpeaking={isSpeaking}
                 volume={voiceActivity}
                 className="h-8"
               />
            </div>

                         {/* Main Control Button */}
             <div className="flex justify-center mb-4">
               <button
                 onClick={isListening ? stopListening : startListening}
                 disabled={isProcessing}
                 className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200 shadow-xl border-4 border-white ${
                   isListening
                     ? 'bg-red-500 text-white animate-pulse'
                     : 'bg-green-500 text-white hover:bg-green-600 hover:scale-105'
                 } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
               >
                 {isProcessing ? (
                   <Loader2 className="w-10 h-10 animate-spin" />
                 ) : isListening ? (
                   <MicOff className="w-10 h-10" />
                 ) : (
                   <Mic className="w-10 h-10" />
                 )}
               </button>
             </div>
            
                         <div className="text-center">
               <p className="text-lg font-bold text-gray-800 mb-2">
                 {isListening ? '🎤 Listening...' : '🎤 Ready to Listen'}
               </p>
               <p className="text-sm text-gray-600">
                 {isListening 
                   ? 'Click to stop listening'
                   : 'Click the microphone to start listening'
                 }
               </p>
               <p className="text-xs text-gray-500 mt-1">
                 Language: {selectedLanguage === 'hi' ? 'हिंदी' : selectedLanguage === 'pa' ? 'ਪੰਜਾਬੀ' : 'English'}
               </p>
             </div>
          </div>
        </motion.div>
      )}

             {/* Floating Toggle Button */}
       {!isActive && (
         <motion.button
           initial={{ opacity: 0, scale: 0.8 }}
           animate={{ opacity: 1, scale: 1 }}
           onClick={toggleVoiceControl}
           className="fixed bottom-6 right-6 w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 z-50 flex items-center justify-center border-2 border-white"
         >
           <Mic className="w-8 h-8" />
         </motion.button>
       )}
    </AnimatePresence>
  )
}
