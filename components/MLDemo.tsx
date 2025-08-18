'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  BarChart3,
  Play,
  Pause,
  RotateCcw,
  Zap,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react'
import { getMLMarketPrediction, getMLModelPerformance } from '@/lib/api'

interface MLDemoProps {
  className?: string
}

const MLDemo = ({ className = '' }: MLDemoProps) => {
  const [isRunning, setIsRunning] = useState(false)
  const [currentDemo, setCurrentDemo] = useState(0)
  const [predictions, setPredictions] = useState<any[]>([])
  const [modelInfo, setModelInfo] = useState<any>(null)

  const demoScenarios = [
    {
      crop: 'Potato',
      mandi: 'Kot ise Khan',
      currentPrice: 1200,
      description: 'High supply season with moderate demand'
    },
    {
      crop: 'Green Chilli',
      mandi: 'Patti',
      currentPrice: 1500,
      description: 'Peak season with strong export demand'
    },
    {
      crop: 'Banana',
      mandi: 'Patti',
      currentPrice: 2400,
      description: 'Stable supply with growing domestic demand'
    },
    {
      crop: 'Onion',
      mandi: 'Patti',
      currentPrice: 2000,
      description: 'Post-harvest period with storage decisions'
    }
  ]

  useEffect(() => {
    const fetchModelInfo = async () => {
      try {
        const info = await getMLModelPerformance()
        setModelInfo(info)
      } catch (error) {
        console.error('Failed to fetch model info:', error)
      }
    }

    fetchModelInfo()
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning) {
      interval = setInterval(() => {
        setCurrentDemo(prev => (prev + 1) % demoScenarios.length)
      }, 4000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, demoScenarios.length])

  const runPrediction = async (scenario: any) => {
    try {
      const prediction = await getMLMarketPrediction(
        scenario.crop,
        scenario.mandi,
        scenario.currentPrice
      )

      const newPrediction = {
        ...prediction,
        scenario,
        timestamp: new Date().toISOString(),
        id: Date.now()
      }

      setPredictions(prev => [newPrediction, ...prev.slice(0, 4)])
    } catch (error) {
      console.error('Prediction failed:', error)
    }
  }

  const runAllPredictions = async () => {
    setIsRunning(true)
    setPredictions([])
    
    for (const scenario of demoScenarios) {
      await runPrediction(scenario)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    setIsRunning(false)
  }

  const stopDemo = () => {
    setIsRunning(false)
  }

  const resetDemo = () => {
    setIsRunning(false)
    setCurrentDemo(0)
    setPredictions([])
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising':
        return <TrendingUp className="w-5 h-5 text-green-600" />
      case 'falling':
        return <TrendingDown className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-blue-600" />
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8 text-purple-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">ML Model Demo</h2>
              <p className="text-gray-600">Interactive demonstration of XGBoost market predictions</p>
            </div>
          </div>
          
          {modelInfo && (
            <div className="text-right">
              <div className="text-sm text-gray-600">Model Accuracy</div>
              <div className="text-2xl font-bold text-purple-600">
                {(modelInfo.r2Score * 100).toFixed(1)}%
              </div>
            </div>
          )}
        </div>

        {/* Demo Controls */}
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={runAllPredictions}
            disabled={isRunning}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>Run All Predictions</span>
          </button>
          
          <button
            onClick={stopDemo}
            disabled={!isRunning}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <Pause className="w-4 h-4" />
            <span>Stop Demo</span>
          </button>
          
          <button
            onClick={resetDemo}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>

        {/* Current Scenario */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Current Scenario</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-blue-600">Crop</div>
              <div className="font-bold text-lg">{demoScenarios[currentDemo].crop}</div>
            </div>
            <div>
              <div className="text-sm text-blue-600">Market</div>
              <div className="font-bold text-lg">{demoScenarios[currentDemo].mandi}</div>
            </div>
            <div>
              <div className="text-sm text-blue-600">Current Price</div>
              <div className="font-bold text-lg text-green-600">
                ₹{demoScenarios[currentDemo].currentPrice}
              </div>
            </div>
          </div>
          <p className="text-blue-700 mt-3">{demoScenarios[currentDemo].description}</p>
          
          <button
            onClick={() => runPrediction(demoScenarios[currentDemo])}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Zap className="w-4 h-4" />
            <span>Predict Now</span>
          </button>
        </div>
      </motion.div>

      {/* Live Predictions */}
      {predictions.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Live Predictions</h3>
          
          <div className="space-y-4">
            {predictions.map((prediction, index) => (
              <motion.div
                key={prediction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {prediction.scenario.crop} @ {prediction.scenario.mandi}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Current: ₹{prediction.scenario.currentPrice} → Predicted: ₹{prediction.nextDayPrice}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      {getTrendIcon(prediction.priceTrend)}
                      <span className="text-sm font-medium text-gray-700">
                        {prediction.priceTrend.toUpperCase()}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(prediction.riskLevel)}`}>
                      {prediction.riskLevel.toUpperCase()} RISK
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Next Day:</span>
                    <p className="font-semibold text-green-600">₹{prediction.nextDayPrice}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Next Week:</span>
                    <p className="font-semibold text-blue-600">₹{prediction.nextWeekPrice}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Next Month:</span>
                    <p className="font-semibold text-purple-600">₹{prediction.nextMonthPrice}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Confidence:</span>
                    <p className="font-semibold text-orange-600">
                      {(prediction.predictionConfidence * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    {prediction.action === 'sell_now' ? (
                      <AlertTriangle className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Action: {prediction.action.replace('_', ' ').toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-600">{prediction.reasoning}</p>
                      {prediction.expectedGain > 0 && (
                        <p className="text-sm text-green-600 font-medium">
                          Expected Gain: ₹{prediction.expectedGain}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  Predicted at {new Date(prediction.timestamp).toLocaleTimeString()}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Model Performance */}
      {modelInfo && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Model Performance</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className="flex items-center space-x-3 mb-2">
                <Target className="w-6 h-6 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">R² Score</span>
              </div>
              <p className="text-3xl font-bold text-purple-700">
                {(modelInfo.r2Score * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-purple-600">Variance explained</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="flex items-center space-x-3 mb-2">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">MAE</span>
              </div>
              <p className="text-3xl font-bold text-blue-700">
                ₹{modelInfo.meanAbsoluteError.toFixed(0)}
              </p>
              <p className="text-xs text-blue-600">Average error</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="flex items-center space-x-3 mb-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <span className="text-sm font-medium text-green-700">RMSE</span>
              </div>
              <p className="text-3xl font-bold text-green-700">
                ₹{modelInfo.rootMeanSquareError.toFixed(0)}
              </p>
              <p className="text-xs text-green-600">Root mean square error</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
              <div className="flex items-center space-x-3 mb-2">
                <Clock className="w-6 h-6 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">MAPE</span>
              </div>
              <p className="text-3xl font-bold text-orange-700">
                {modelInfo.meanAbsolutePercentageError.toFixed(1)}%
              </p>
              <p className="text-xs text-orange-600">Percentage error</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
              modelInfo.r2Score >= 0.9 ? 'bg-green-100 text-green-800' :
              modelInfo.r2Score >= 0.8 ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              Overall Grade: {modelInfo.overallGrade}
            </div>
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">How to Use</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <Play className="w-6 h-6 text-blue-600" />
              <h4 className="font-semibold text-blue-800">1. Start Demo</h4>
            </div>
            <p className="text-blue-700 text-sm">
              Click "Run All Predictions" to see the ML model in action across different scenarios
            </p>
          </div>
          
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <Target className="w-6 h-6 text-green-600" />
              <h4 className="font-semibold text-green-800">2. Watch Predictions</h4>
            </div>
            <p className="text-green-700 text-sm">
              Observe real-time predictions with confidence intervals and risk assessments
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <Brain className="w-6 h-6 text-purple-600" />
              <h4 className="font-semibold text-purple-800">3. Analyze Results</h4>
            </div>
            <p className="text-purple-700 text-sm">
              Compare predictions across crops and understand the model's decision-making process
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default MLDemo
