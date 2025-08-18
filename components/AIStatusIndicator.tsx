'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { testLlamafileConnection } from '@/lib/llamafileAI'

interface AIStatusIndicatorProps {
  onSetupClick?: () => void
  showDetails?: boolean
}

export default function AIStatusIndicator({ onSetupClick, showDetails = false }: AIStatusIndicatorProps) {
  const [status, setStatus] = useState<'checking' | 'success' | 'warning' | 'error'>('checking')
  const [message, setMessage] = useState('')
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    setIsChecking(true)
    try {
      const result = await testLlamafileConnection()
      setStatus(result.status as any)
      setMessage(result.message)
    } catch (error) {
      setStatus('error')
      setMessage('Connection failed')
    } finally {
      setIsChecking(false)
    }
  }

  const statusConfig = {
    success: {
      icon: '✅',
      text: 'AI Ready',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    warning: {
      icon: '⚠️',
      text: 'Setup Required',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    error: {
      icon: '❌',
      text: 'AI Unavailable',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    checking: {
      icon: '🔄',
      text: 'Checking...',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    }
  }

  const config = statusConfig[status]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${config.bgColor} ${config.borderColor}`}
    >
      {/* Status Icon */}
      <motion.span
        animate={isChecking ? { rotate: 360 } : {}}
        transition={isChecking ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
        className={`text-lg ${config.color}`}
      >
        {config.icon}
      </motion.span>

      {/* Status Text */}
      <span className={`font-medium ${config.color}`}>
        {config.text}
      </span>

      {/* Action Buttons */}
      {status === 'warning' && onSetupClick && (
        <button
          onClick={onSetupClick}
          className="text-sm underline hover:no-underline ml-2"
        >
          Setup
        </button>
      )}

      {status === 'error' && (
        <button
          onClick={checkStatus}
          className="text-sm underline hover:no-underline ml-2"
          disabled={isChecking}
        >
          {isChecking ? 'Checking...' : 'Retry'}
        </button>
      )}

      {/* Details Panel */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 p-3 bg-white rounded border"
        >
          <h4 className="font-semibold mb-2">AI Status Details</h4>
          <p className="text-sm text-gray-600 mb-2">{message}</p>
          
          {status === 'success' && (
            <div className="text-sm text-green-600">
              ✅ Llamafile is running and ready to provide AI assistance
            </div>
          )}
          
          {status === 'warning' && (
            <div className="text-sm text-yellow-600">
              ⚠️ Llamafile needs to be set up. Click "Setup" to get started.
            </div>
          )}
          
          {status === 'error' && (
            <div className="text-sm text-red-600">
              ❌ Llamafile is not running. Please start the Llamafile server.
            </div>
          )}

          <div className="mt-3 text-xs text-gray-500">
            <p>• Local AI processing ensures privacy</p>
            <p>• No data sent to external servers</p>
            <p>• Works completely offline</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
