'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, BellOff, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, X, Plus } from 'lucide-react'
import { getMarketPrices } from '@/lib/api'

interface PriceAlert {
  id: string
  crop: string
  targetPrice: number
  condition: 'above' | 'below'
  isActive: boolean
  createdAt: string
  triggered?: boolean
  triggeredAt?: string
}

export default function PriceAlerts({ 
  location, 
  isValidLocation 
}: { 
  location: string; 
  isValidLocation: boolean 
}) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newAlert, setNewAlert] = useState({
    crop: '',
    targetPrice: '',
    condition: 'above' as 'above' | 'below'
  })
  const [marketData, setMarketData] = useState<any[]>([])

  useEffect(() => {
    if (location && isValidLocation) {
      fetchMarketData()
    }
  }, [location, isValidLocation])

  const fetchMarketData = async () => {
    if (!location || !isValidLocation) return
    
    try {
      const data = await getMarketPrices('wheat', location) // Default to wheat for demo
      setMarketData(data)
    } catch (error) {
      console.error('Failed to fetch market data:', error)
    }
  }

  const createAlert = () => {
    if (!newAlert.crop || !newAlert.targetPrice) {
      if (typeof window !== 'undefined') window.alert('Please fill all required fields')
      return
    }

    const newPriceAlert: PriceAlert = {
      id: `alert_${Date.now()}`,
      crop: newAlert.crop,
      targetPrice: parseFloat(newAlert.targetPrice),
      condition: newAlert.condition,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0]
    }

    setAlerts([newPriceAlert, ...alerts])
    setShowCreateForm(false)
    setNewAlert({ crop: '', targetPrice: '', condition: 'above' })
  }

  const toggleAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, isActive: !alert.isActive } : alert
    ))
  }

  const deleteAlert = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId))
  }

  const checkAlerts = () => {
    if (!marketData.length) return

    const currentPrice = marketData[0].price
    setAlerts(alerts.map(alert => {
      if (!alert.isActive || alert.triggered) return alert

      const shouldTrigger = alert.condition === 'above' 
        ? currentPrice >= alert.targetPrice 
        : currentPrice <= alert.targetPrice

      if (shouldTrigger) {
        return {
          ...alert,
          triggered: true,
          triggeredAt: new Date().toISOString().split('T')[0]
        }
      }
      return alert
    }))
  }

  useEffect(() => {
    const interval = setInterval(checkAlerts, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [alerts, marketData])

  if (!isValidLocation) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Price Alerts</h3>
          <p className="text-gray-500">Enter a valid Punjab location to set up price alerts</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Price Alerts</h2>
            <p className="text-gray-600">Get notified when prices reach your target</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Alert</span>
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6"
          >
            <h3 className="font-medium text-blue-800 mb-4">Create New Price Alert</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Crop</label>
                <select
                  value={newAlert.crop}
                  onChange={(e) => setNewAlert({...newAlert, crop: e.target.value})}
                  className="input-field"
                >
                  <option value="">Select crop</option>
                  <option value="wheat">Wheat</option>
                  <option value="rice">Rice</option>
                  <option value="cotton">Cotton</option>
                  <option value="sugarcane">Sugarcane</option>
                  <option value="pulses">Pulses</option>
                  <option value="maize">Maize</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Price (₹/ton)</label>
                <input
                  type="number"
                  placeholder="Enter target price"
                  value={newAlert.targetPrice}
                  onChange={(e) => setNewAlert({...newAlert, targetPrice: e.target.value})}
                  className="input-field"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                <select
                  value={newAlert.condition}
                  onChange={(e) => setNewAlert({...newAlert, condition: e.target.value as 'above' | 'below'})}
                  className="input-field"
                >
                  <option value="above">Above</option>
                  <option value="below">Below</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-4 mt-4">
              <button
                onClick={createAlert}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create Alert
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Current Market Price */}
        {marketData.length > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-green-800">Current Market Price</h4>
                <p className="text-2xl font-bold text-green-900">₹{marketData[0].price}/ton</p>
                <p className="text-sm text-green-700">{marketData[0].mandi} • {marketData[0].date}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-600">Last Updated</p>
                <p className="text-sm text-green-700">{new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.map((alert) => (
          <motion.div 
            key={alert.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`card border-l-4 ${
              alert.triggered 
                ? 'border-red-500 bg-red-50' 
                : alert.isActive 
                  ? 'border-green-500' 
                  : 'border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  alert.triggered 
                    ? 'bg-red-100' 
                    : alert.isActive 
                      ? 'bg-green-100' 
                      : 'bg-gray-100'
                }`}>
                  {alert.triggered ? (
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  ) : alert.isActive ? (
                    <Bell className="w-6 h-6 text-green-600" />
                  ) : (
                    <BellOff className="w-6 h-6 text-gray-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">
                    {alert.crop.charAt(0).toUpperCase() + alert.crop.slice(1)} Price Alert
                  </h3>
                  <p className="text-sm text-gray-600">
                    {alert.condition === 'above' ? 'Above' : 'Below'} ₹{alert.targetPrice}/ton
                  </p>
                  <p className="text-xs text-gray-500">Created: {alert.createdAt}</p>
                  {alert.triggered && (
                    <p className="text-xs text-red-600">Triggered: {alert.triggeredAt}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleAlert(alert.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    alert.isActive 
                      ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {alert.isActive ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => deleteAlert(alert.id)}
                  className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Alert Status */}
            {alert.triggered && (
              <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">
                    Alert Triggered! Current price is {alert.condition === 'above' ? 'above' : 'below'} your target.
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {alerts.length === 0 && (
        <div className="card text-center py-12">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Price Alerts</h3>
          <p className="text-gray-500 mb-4">Create your first price alert to get notified</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Create First Alert
          </button>
        </div>
      )}

      {/* Alert Statistics */}
      {alerts.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Alert Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600">Total Alerts</p>
                  <p className="text-2xl font-bold text-blue-800">{alerts.length}</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-green-600">Active Alerts</p>
                  <p className="text-2xl font-bold text-green-800">
                    {alerts.filter(a => a.isActive).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm text-red-600">Triggered Alerts</p>
                  <p className="text-2xl font-bold text-red-800">
                    {alerts.filter(a => a.triggered).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
