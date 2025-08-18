'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mic, MicOff, Activity } from 'lucide-react'
import SpeechRecognitionService from '@/lib/speechRecognitionService'

export default function SpeechStatusIndicator() {
  const [currentComponent, setCurrentComponent] = useState<string>('')
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const checkStatus = () => {
      const service = SpeechRecognitionService.getInstance()
      const active = service.isRecognitionActive()
      const component = service.getCurrentComponent()
      
      setIsActive(active)
      setCurrentComponent(component)
    }

    // Check status immediately
    checkStatus()

    // Check status every second
    const interval = setInterval(checkStatus, 1000)

    return () => clearInterval(interval)
  }, [])

  if (!isActive) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-2"
    >
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <Mic className="w-4 h-4 text-green-500" />
        <span className="text-sm font-medium text-gray-700">
          {currentComponent} is listening
        </span>
      </div>
    </motion.div>
  )
}
