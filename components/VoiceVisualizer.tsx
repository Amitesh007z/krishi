'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import VoiceAnalyzer from '@/lib/voiceAnalyzer'

interface VoiceVisualizerProps {
  isListening: boolean
  isSpeaking: boolean
  volume?: number // 0-1
  className?: string
  useRealAnalysis?: boolean
}

export default function VoiceVisualizer({ 
  isListening, 
  isSpeaking, 
  volume = 0.5, 
  className = "",
  useRealAnalysis = false
}: VoiceVisualizerProps) {
  const [bars, setBars] = useState<number[]>([])
  const animationRef = useRef<number>()
  const analyzerRef = useRef<VoiceAnalyzer | null>(null)

  useEffect(() => {
    if (useRealAnalysis && isListening) {
      // Use real voice analysis
      if (!analyzerRef.current) {
        analyzerRef.current = new VoiceAnalyzer()
      }
      
      analyzerRef.current.start((activity, frequencies) => {
        // Use frequency data for visualization
        const frequencyBars = frequencies.slice(0, 8).map(freq => freq * 100 + 10)
        setBars(frequencyBars)
      })
         } else if (isListening || isSpeaking) {
       // Use simulated animation with better responsiveness
       const animate = () => {
         setBars(Array.from({ length: 8 }, (_, i) => {
           // Create more dynamic and responsive bars
           const baseHeight = volume * 100 + 20
           const variation = Math.sin(Date.now() * 0.02 + i * 0.3) * 30
           return Math.max(15, Math.min(100, baseHeight + variation))
         }))
         animationRef.current = requestAnimationFrame(animate)
       }
       animate()
    } else {
      setBars(Array.from({ length: 8 }, () => 10))
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (analyzerRef.current && useRealAnalysis) {
        analyzerRef.current.stop()
      }
    }
  }, [isListening, isSpeaking, volume, useRealAnalysis])

  if (!isListening && !isSpeaking) {
    return (
      <div className={`flex items-center justify-center space-x-1 ${className}`}>
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="w-1 bg-gray-300 rounded-full"
            style={{ height: '10px' }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
      {bars.map((height, i) => (
        <motion.div
          key={i}
          className={`w-1 rounded-full ${
            isListening ? 'bg-green-500' : 'bg-blue-500'
          }`}
          animate={{
            height: `${height}px`,
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 0.3,
            repeat: Infinity,
            delay: i * 0.1
          }}
          style={{ height: `${height}px` }}
        />
      ))}
    </div>
  )
}
