'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Truck, 
  Warehouse, 
  Store, 
  MapPin, 
  Clock, 
  Package, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react'

interface SupplyChainStep {
  id: string
  name: string
  location: string
  status: 'completed' | 'in_progress' | 'pending' | 'delayed'
  timestamp: string
  description: string
  icon: any
  color: string
}

interface SupplyChainTrackerProps {
  crop: string
  location: string
  quantity: string
  isValidLocation: boolean
}

const SupplyChainTracker = ({ 
  crop, 
  location, 
  quantity, 
  isValidLocation 
}: SupplyChainTrackerProps) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const supplyChainSteps: SupplyChainStep[] = [
    {
      id: 'harvest',
      name: 'Harvesting',
      location: location || 'Farm',
      status: 'completed',
      timestamp: '2024-01-15 08:00',
      description: 'Crop harvested and prepared for transport',
      icon: Package,
      color: 'text-green-600'
    },
    {
      id: 'transport',
      name: 'Transport to Mandi',
      location: `${location || 'Farm'} → ${location || 'Punjab'} Mandi`,
      status: 'in_progress',
      timestamp: '2024-01-15 10:30',
      description: 'Transporting crop to nearest mandi',
      icon: Truck,
      color: 'text-blue-600'
    },
    {
      id: 'mandi',
      name: 'Mandi Processing',
      location: `${location || 'Punjab'} Central Mandi`,
      status: 'pending',
      timestamp: '2024-01-15 14:00',
      description: 'Quality check and grading at mandi',
      icon: Store,
      color: 'text-purple-600'
    },
    {
      id: 'warehouse',
      name: 'Warehouse Storage',
      location: 'Punjab State Warehousing Corporation',
      status: 'pending',
      timestamp: '2024-01-16 09:00',
      description: 'Storage in government warehouse',
      icon: Warehouse,
      color: 'text-orange-600'
    },
    {
      id: 'distribution',
      name: 'Distribution',
      location: 'Various Markets',
      status: 'pending',
      timestamp: '2024-01-18 12:00',
      description: 'Distribution to retail markets',
      icon: TrendingUp,
      color: 'text-red-600'
    }
  ]

  useEffect(() => {
    // Simulate supply chain progress
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < supplyChainSteps.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [supplyChainSteps.length])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'delayed': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5" />
      case 'in_progress': return <Loader2 className="w-5 h-5 animate-spin" />
      case 'delayed': return <AlertTriangle className="w-5 h-5" />
      default: return <Clock className="w-5 h-5" />
    }
  }

  if (!isValidLocation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="text-center text-gray-500">
          <Truck className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Please enter a valid Punjab location to track supply chain</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      {/* Coming Soon banner - enlarged like a stamp */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-3 px-4 py-2 border-4 border-dashed border-blue-400 bg-blue-50 rounded-2xl shadow-sm">
          <Clock className="w-6 h-6 text-blue-600" />
          <span className="text-xl font-extrabold uppercase tracking-widest text-blue-800">Coming Soon</span>
        </div>
        <div className="mt-2 text-blue-800 text-sm">Live logistics partners, real-time GPS tracking, and automated quality checkpoints.</div>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Supply Chain Tracker</h3>
          <p className="text-gray-600">Track your {crop || 'crop'} from farm to market</p>
        </div>
        <Truck className="w-6 h-6 text-primary" />
      </div>

      {/* Supply Chain Overview */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600">Crop</div>
            <div className="font-bold text-lg capitalize">{crop || 'Wheat'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Quantity</div>
            <div className="font-bold text-lg">{quantity || '10'} tons</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Origin</div>
            <div className="font-bold text-lg">{location || 'Punjab'}</div>
          </div>
        </div>
      </div>

      {/* Supply Chain Timeline */}
      <div className="space-y-4">
        {supplyChainSteps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`border rounded-lg p-4 ${getStatusColor(step.status)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-white/50`}>
                  <step.icon className={`w-6 h-6 ${step.color}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">{step.name}</h4>
                  <p className="text-sm opacity-80">{step.location}</p>
                  <p className="text-sm opacity-70">{step.description}</p>
                  <p className="text-xs opacity-60">{step.timestamp}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(step.status)}
                <span className="text-sm font-medium capitalize">
                  {step.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Supply Chain Progress</span>
          <span className="text-sm text-gray-500">
            {Math.round(((currentStep + 1) / supplyChainSteps.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / supplyChainSteps.length) * 100}%` }}
            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
          />
        </div>
      </div>

      {/* Estimated Timeline */}
      <div className="mt-6 bg-white border rounded-lg p-4">
        <h4 className="font-semibold mb-3">Estimated Timeline</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">Current Location</div>
            <div className="font-medium">{supplyChainSteps[currentStep]?.location}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Next Step</div>
            <div className="font-medium">
              {currentStep < supplyChainSteps.length - 1 
                ? supplyChainSteps[currentStep + 1]?.name 
                : 'Completed'
              }
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Estimated Completion</div>
            <div className="font-medium">3-5 days</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Distance</div>
            <div className="font-medium">~150 km</div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="mt-6">
        <h4 className="font-semibold mb-3">Supply Chain Alerts</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Weather Alert</p>
              <p className="text-xs text-yellow-700">Light rain expected during transport</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">Quality Check Passed</p>
              <p className="text-xs text-green-700">Crop meets Grade A standards</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default SupplyChainTracker
