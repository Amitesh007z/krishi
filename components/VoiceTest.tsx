'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mic, MicOff, Volume2, AlertCircle, CheckCircle, Activity } from 'lucide-react'
import toast from 'react-hot-toast'
import SpeechRecognitionService from '@/lib/speechRecognitionService'
import VoiceVisualizer from './VoiceVisualizer'

export default function VoiceTest() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState('')
  const [voiceActivity, setVoiceActivity] = useState(0)

  useEffect(() => {
    // Check if speech recognition is supported
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      setIsSupported(!!SpeechRecognition)
      if (!SpeechRecognition) {
        setError('Speech recognition not supported in this browser')
      }
    }
  }, [])

  const startListening = () => {
    if (!isSupported) return

    const service = SpeechRecognitionService.getInstance()
    const success = service.startRecognition({
      onStart: () => {
        setIsListening(true)
        setError('')
        console.log('Test: Speech recognition started')
        toast.success('🎤 Listening...')
      },
             onResult: (transcript, isFinal) => {
         setTranscript(transcript)
         // Simulate voice activity based on transcript length
         setVoiceActivity(Math.min(transcript.length / 50, 1))
         
         if (isFinal) {
           console.log('Test: Final transcript:', transcript)
           toast.success(`✅ Heard: "${transcript}"`)
           setVoiceActivity(0) // Reset activity after final transcript
         }
       },
      onError: (error) => {
        console.error('Test: Speech recognition error:', error)
        setIsListening(false)
        setError(error)
        
        if (error === 'no-speech') {
          toast.error('No speech detected. Please try again.')
        } else if (error === 'not-allowed') {
          toast.error('Microphone access denied. Please allow microphone permissions.')
        } else {
          toast.error(`Speech recognition error: ${error}`)
        }
      },
             onEnd: () => {
         setIsListening(false)
         setVoiceActivity(0)
         console.log('Test: Speech recognition ended')
       }
         }, 'VoiceTest')

         if (!success) {
       toast.error('Failed to start speech recognition')
     }
  }

  const stopListening = () => {
    if (isListening) {
      const service = SpeechRecognitionService.getInstance()
      service.stopRecognition()
    }
  }

  if (!isSupported) {
    return (
      <div className="fixed top-4 left-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
        <div className="flex items-center space-x-2 mb-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold text-gray-900">Voice Test</h3>
        </div>
        <p className="text-sm text-red-600">{error}</p>
        <p className="text-xs text-gray-500 mt-2">
          Try using Chrome, Edge, or Safari for speech recognition support.
        </p>
      </div>
    )
  }

  return (
    <div className="fixed top-4 left-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
      <div className="flex items-center space-x-2 mb-3">
        <CheckCircle className="w-5 h-5 text-green-500" />
        <h3 className="font-semibold text-gray-900">Voice Test</h3>
      </div>
      
             <div className="mb-3">
         <button
           onClick={isListening ? stopListening : startListening}
           className={`w-full py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all ${
             isListening
               ? 'bg-red-500 text-white animate-pulse'
               : 'bg-green-500 text-white hover:bg-green-600'
           }`}
         >
           {isListening ? (
             <>
               <MicOff className="w-4 h-4" />
               <span>Stop Listening</span>
             </>
           ) : (
             <>
               <Mic className="w-4 h-4" />
               <span>Start Listening</span>
             </>
           )}
         </button>
         
         {/* Voice Activity Visualizer */}
         <div className="mt-3 p-3 bg-gray-50 rounded-lg">
           <div className="flex items-center justify-between mb-2">
             <div className="flex items-center space-x-2">
               <Activity className="w-4 h-4 text-gray-600" />
               <span className="text-sm font-medium text-gray-700">Voice Activity</span>
             </div>
             <span className="text-xs text-gray-500">
               {isListening ? 'Listening...' : 'Idle'}
             </span>
           </div>
                       <VoiceVisualizer 
              isListening={isListening} 
              isSpeaking={false}
              volume={voiceActivity}
              className="h-8"
              useRealAnalysis={true}
            />
         </div>
       </div>
      
      {transcript && (
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-700">Transcript:</p>
          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
            {transcript}
          </p>
        </div>
      )}
      
      {error && (
        <div className="mb-3">
          <p className="text-sm font-medium text-red-700">Error:</p>
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded border">
            {error}
          </p>
        </div>
      )}
      
      <div className="text-xs text-gray-500">
        <p>• Click the button to test speech recognition</p>
        <p>• Speak clearly into your microphone</p>
        <p>• Check browser console for detailed logs</p>
      </div>
    </div>
  )
}
