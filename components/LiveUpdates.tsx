'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, TrendingUp, TrendingDown, AlertTriangle, X, Clock } from 'lucide-react'
import { createRealtimeConnection, PriceUpdate, WeatherUpdate, StorageUpdate } from '@/lib/realtime-updates'

interface LiveUpdate {
  id: string
  type: 'price' | 'weather' | 'storage'
  title: string
  message: string
  timestamp: Date
  priority: 'low' | 'medium' | 'high'
}

const LiveUpdates = () => {
  const [updates, setUpdates] = useState<LiveUpdate[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [connection, setConnection] = useState<any>(null)

  useEffect(() => {
    const conn = createRealtimeConnection()
    setConnection(conn)
    conn.connect()

    // Subscribe to different types of updates
    conn.subscribe('price', (update: PriceUpdate) => {
      const liveUpdate: LiveUpdate = {
        id: `price-${Date.now()}`,
        type: 'price',
        title: `${update.crop} Price Update`,
        message: `${update.crop} price in ${update.location}: ₹${update.newPrice} (${update.change >= 0 ? '+' : ''}${update.changePercent}%)`,
        timestamp: new Date(),
        priority: Math.abs(update.changePercent) > 5 ? 'high' : Math.abs(update.changePercent) > 2 ? 'medium' : 'low'
      }
      addUpdate(liveUpdate)
    })

    conn.subscribe('weather', (update: WeatherUpdate) => {
      if (update.alerts.length > 0) {
        const liveUpdate: LiveUpdate = {
          id: `weather-${Date.now()}`,
          type: 'weather',
          title: `Weather Alert in ${update.location}`,
          message: update.alerts.join(', '),
          timestamp: new Date(),
          priority: 'high'
        }
        addUpdate(liveUpdate)
      }
    })

    conn.subscribe('storage', (update: StorageUpdate) => {
      if (update.status === 'limited') {
        const liveUpdate: LiveUpdate = {
          id: `storage-${Date.now()}`,
          type: 'storage',
          title: `Storage Alert in ${update.location}`,
          message: `Warehouse ${update.warehouseId} has limited capacity: ${update.availableCapacity} tons available`,
          timestamp: new Date(),
          priority: 'medium'
        }
        addUpdate(liveUpdate)
      }
    })

    return () => {
      if (conn) {
        conn.disconnect()
      }
    }
  }, [])

  const addUpdate = (update: LiveUpdate) => {
    setUpdates(prev => [update, ...prev.slice(0, 4)]) // Keep only last 5 updates
    setIsVisible(true)
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      removeUpdate(update.id)
    }, 10000)
  }

  const removeUpdate = (id: string) => {
    setUpdates(prev => prev.filter(update => update.id !== id))
    if (updates.length <= 1) {
      setIsVisible(false)
    }
  }

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'price':
        return <TrendingUp className="w-5 h-5" />
      case 'weather':
        return <AlertTriangle className="w-5 h-5" />
      case 'storage':
        return <Clock className="w-5 h-5" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  const getUpdateColor = (type: string, priority: string) => {
    if (priority === 'high') {
      return 'bg-red-50 border-red-200 text-red-800'
    } else if (priority === 'medium') {
      return 'bg-yellow-50 border-yellow-200 text-yellow-800'
    } else {
      return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  if (!isVisible || updates.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {updates.map((update) => (
          <motion.div
            key={update.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            className={`max-w-sm p-4 rounded-lg border shadow-lg ${getUpdateColor(update.type, update.priority)}`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getUpdateIcon(update.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium mb-1">{update.title}</h4>
                <p className="text-sm mb-2">{update.message}</p>
                <p className="text-xs text-gray-500">
                  {update.timestamp.toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => removeUpdate(update.id)}
                className="flex-shrink-0 p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default LiveUpdates
