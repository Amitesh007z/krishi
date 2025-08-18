'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Clock,
  Database,
  Zap
} from 'lucide-react'
import { getMLModelPerformance, getAvailableMLCombinations } from '@/lib/api'

interface MLModelInsightsProps {
  crop?: string
  location?: string
}

interface MLModelPerformance {
  model_type: string
  version: string
  accuracy: string
  mae: number
  rmse: number
  mape: number
  r2Score: number
  last_training: string
  training_samples: number
  features_used: number
  model_status: string
}

interface AvailableCombination {
  crop: string
  mandi: string
  state: string
  recordCount: number
  lastUpdated: string
  averagePrice: number
  priceVolatility: number
}

const MLModelInsights = ({ crop, location }: MLModelInsightsProps) => {
  const [modelPerformance, setModelPerformance] = useState<MLModelPerformance | null>(null)
  const [availableCombinations, setAvailableCombinations] = useState<AvailableCombination[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchMLData = async () => {
      setLoading(true)
      try {
        const [performance, combinations] = await Promise.all([
          getMLModelPerformance(),
          getAvailableMLCombinations()
        ])
        
        setModelPerformance(performance)
        setAvailableCombinations(combinations)
      } catch (error) {
        console.error('Failed to fetch ML data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMLData()
  }, [])

  const getPerformanceColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600'
    if (score >= 0.8) return 'text-blue-600'
    if (score >= 0.7) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceBadge = (score: number) => {
    if (score >= 0.9) return 'bg-green-100 text-green-800'
    if (score >= 0.8) return 'bg-blue-100 text-blue-800'
    if (score >= 0.7) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getOverallGrade = (r2Score: number) => {
    if (r2Score >= 0.9) return 'A+ (Excellent)'
    if (r2Score >= 0.8) return 'A (Very Good)'
    if (r2Score >= 0.7) return 'B (Good)'
    if (r2Score >= 0.6) return 'C (Fair)'
    return 'D (Poor)'
  }

  if (loading) {
    return (
      <div className="card text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading ML model insights...</p>
      </div>
    )
  }

  if (!modelPerformance) {
    return (
      <div className="card text-center py-12">
        <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">ML Model Unavailable</h3>
        <p className="text-gray-500">ML model performance data is not available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ML Model Overview */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8 text-purple-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">ML Model Insights</h2>
              <p className="text-gray-600">XGBoost-powered market predictions</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPerformanceBadge(modelPerformance.r2Score)}`}>
            {getOverallGrade(modelPerformance.r2Score)}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">Mean Absolute Error</span>
            </div>
            <div className="text-2xl font-bold text-blue-700">
              ₹{modelPerformance.mae.toFixed(0)}
            </div>
            <div className="text-sm text-blue-600">Lower is better</div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">Root Mean Square Error</span>
            </div>
            <div className="text-2xl font-bold text-green-700">
              ₹{modelPerformance.rmse.toFixed(0)}
            </div>
            <div className="text-sm text-green-600">Lower is better</div>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-orange-800">Mean Absolute % Error</span>
            </div>
            <div className="text-2xl font-bold text-orange-700">
              {modelPerformance.mape.toFixed(1)}%
          </div>
            <div className="text-sm text-orange-600">Lower is better</div>
          </div>
        </div>

        {/* Model Details */}
        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Model Specifications</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Algorithm:</span>
              <p className="font-medium">{modelPerformance.model_type}</p>
            </div>
            <div>
              <span className="text-gray-600">Version:</span>
              <p className="font-medium">{modelPerformance.version}</p>
            </div>
            <div>
              <span className="text-gray-600">Features:</span>
              <p className="font-medium">{modelPerformance.features_used} features</p>
            </div>
            <div>
              <span className="text-gray-600">Training Samples:</span>
              <p className="font-medium">{modelPerformance.training_samples.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-gray-600">Last Training:</span>
              <p className="font-medium">{modelPerformance.last_training}</p>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <p className="font-medium">{modelPerformance.model_status}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Available Predictions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Available ML Predictions</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Crop</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Market</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Data Points</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Avg Price</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Volatility</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {availableCombinations.slice(0, 10).map((combo, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">
                    <div className="flex items-center space-x-2">
                      {crop && crop.toLowerCase() === combo.crop.toLowerCase() && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      <span>{combo.crop}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{combo.mandi}</td>
                  <td className="py-3 px-4 text-gray-600">{combo.recordCount}</td>
                  <td className="py-3 px-4 font-semibold text-green-600">₹{combo.averagePrice}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      combo.priceVolatility < 0.1 ? 'bg-green-100 text-green-800' :
                      combo.priceVolatility < 0.2 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {(combo.priceVolatility * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-sm">{combo.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Showing top 10 combinations by data availability. 
            Total: {availableCombinations.length} crop-market combinations
          </p>
        </div>
      </motion.div>

      {/* Feature Importance */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Key Price Drivers</h3>
        
        <div className="space-y-3">
          {[
            { feature: 'Current Price (modal_price)', importance: 0.8349, description: 'Most important predictor of future prices' },
            { feature: '7-Day Average Price', importance: 0.0305, description: 'Short-term price momentum indicator' },
            { feature: '1-Day Price Lag', importance: 0.0301, description: 'Yesterday\'s price influence' },
            { feature: 'Minimum Price', importance: 0.0197, description: 'Price floor indicator' },
            { feature: 'Maximum Price', importance: 0.0130, description: 'Price ceiling indicator' }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  index === 0 ? 'bg-purple-500' :
                  index === 1 ? 'bg-blue-500' :
                  index === 2 ? 'bg-green-500' :
                  index === 3 ? 'bg-yellow-500' : 'bg-orange-500'
                }`} />
                <div>
                  <p className="font-medium text-gray-800">{item.feature}</p>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-800">{item.importance.toFixed(4)}</p>
                <p className="text-xs text-gray-500">Importance</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Model Benefits */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Why ML Predictions?</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <Zap className="w-6 h-6 text-green-600" />
              <h4 className="font-semibold text-green-800">High Accuracy</h4>
            </div>
            <p className="text-green-700 text-sm">
              89.53% accuracy in predicting market prices, significantly better than traditional methods
            </p>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <Database className="w-6 h-6 text-blue-600" />
              <h4 className="font-semibold text-blue-800">Rich Data</h4>
            </div>
            <p className="text-blue-700 text-sm">
              Trained on 195K+ real government records with 63 engineered features
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <Clock className="w-6 h-6 text-purple-600" />
              <h4 className="font-semibold text-purple-800">Real-time Updates</h4>
            </div>
            <p className="text-purple-700 text-sm">
              Continuous learning from new market data for improved predictions
            </p>
          </div>
          
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              <h4 className="font-semibold text-orange-800">Risk Assessment</h4>
            </div>
            <p className="text-orange-700 text-sm">
              Built-in volatility analysis and confidence intervals for better decision making
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default MLModelInsights
