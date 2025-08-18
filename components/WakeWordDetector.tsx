'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import SpeechRecognitionService from '@/lib/speechRecognitionService'

interface WakeWordDetectorProps {
  onWakeWordDetected: () => void
  isEnabled: boolean
  onToggle: () => void
}

const WAKE_WORDS = [
  'voice assistant',
  'hey assistant', 
  'hello assistant',
  'assistant',
  'hey krishi',
  'hello krishi',
  'krishi ai',
  'krishi assistant',
  'कृषि एआई',
  'कृषि असिस्टेंट',
  'वॉइस असिस्टेंट'
]

export default function WakeWordDetector({
  onWakeWordDetected,
  isEnabled,
  onToggle
}: WakeWordDetectorProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastWakeWord, setLastWakeWord] = useState('')
  const [confidence, setConfidence] = useState(0)
  
  const serviceRef = useRef<SpeechRecognitionService | null>(null)

  useEffect(() => {
    if (isEnabled) {
      serviceRef.current = SpeechRecognitionService.getInstance()
      
      const startWakeWordDetection = () => {
        if (!serviceRef.current) return
        
        const success = serviceRef.current.startRecognition({
          onStart: () => {
            setIsListening(true)
            console.log('Wake word detection started')
          },
          onResult: (transcript, isFinal) => {
            // Check for wake words in the transcript
            const lowerTranscript = transcript.toLowerCase()
            console.log('Wake word detector: Checking transcript:', lowerTranscript)
            
            for (const wakeWord of WAKE_WORDS) {
              if (lowerTranscript.includes(wakeWord.toLowerCase())) {
                const confidence = wakeWord.length / transcript.length
                console.log('Wake word detector: Wake word detected:', wakeWord, 'confidence:', confidence)
                setLastWakeWord(wakeWord)
                setConfidence(confidence)
                
                // Trigger wake word detection
                handleWakeWordDetected(wakeWord, confidence)
                break
              }
            }
          },
          onError: (error) => {
            console.error('Wake word recognition error:', error)
            setIsListening(false)
            
            // Don't restart for no-speech errors to prevent infinite loops
            if (error !== 'no-speech' && isEnabled) {
              setTimeout(() => {
                if (isEnabled && serviceRef.current) {
                  startWakeWordDetection()
                }
              }, 2000) // Increased delay to prevent rapid restarts
            }
          },
          onEnd: () => {
            setIsListening(false)
            
            // Restart continuous recognition only if enabled and not due to error
            if (isEnabled && serviceRef.current) {
              setTimeout(() => {
                startWakeWordDetection()
              }, 500) // Increased delay to prevent rapid restarts
            }
          }
        }, 'WakeWordDetector')
        
        if (!success) {
          console.log('Wake word detection failed to start')
        }
      }
      
      startWakeWordDetection()
    }
    
    return () => {
      if (serviceRef.current) {
        serviceRef.current.stopRecognition()
      }
    }
  }, [isEnabled])

  const handleWakeWordDetected = (wakeWord: string, confidence: number) => {
    setIsProcessing(true)
    
    // Visual feedback
    toast.success(`🎤 Wake word detected: "${wakeWord}"`)
    
    // Trigger the callback
    onWakeWordDetected()
    
    // Reset after a short delay
    setTimeout(() => {
      setIsProcessing(false)
      setLastWakeWord('')
      setConfidence(0)
    }, 2000)
  }

  const toggleWakeWordDetection = () => {
    if (isEnabled) {
      // Stop detection
      if (serviceRef.current) {
        serviceRef.current.stopRecognition()
      }
    } else {
      // Start detection - this will be handled by the useEffect when isEnabled changes
      console.log('Wake word detection will start when enabled')
    }
    
    onToggle()
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <AnimatePresence>
        {/* Wake Word Detection Status */}
        {isEnabled && (
          <motion.div
            key="wake-word-status"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 mb-2"
          >
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-600">
                {isListening ? 'Listening for wake word...' : 'Wake word detection paused'}
              </span>
            </div>
            
            {lastWakeWord && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                <p className="text-xs text-green-800">
                  Last detected: "{lastWakeWord}" ({Math.round(confidence * 100)}% confidence)
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Wake Word Detection Toggle */}
        <motion.button
          key="wake-word-toggle"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={toggleWakeWordDetection}
          disabled={isProcessing}
          className={`p-3 rounded-full shadow-lg transition-all duration-200 ${
            isEnabled
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-500 text-white hover:bg-gray-600'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isProcessing ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : isEnabled ? (
            <Mic className="w-6 h-6" />
          ) : (
            <MicOff className="w-6 h-6" />
          )}
        </motion.button>
      </AnimatePresence>

      {/* Wake Word Detection Indicator */}
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap"
        >
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4" />
            <span>Wake word detected!</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
