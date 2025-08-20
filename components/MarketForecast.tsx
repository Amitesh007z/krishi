'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Target,
  Brain
} from 'lucide-react'
import PriceChart from './PriceChart'
import { getAIRecommendations, getMLMarketPrediction, getMLMarketPredictionWithRealPrices, getMLModelPerformance, getNearbyMandiPrices, checkMLAPIHealth } from '@/lib/api'

interface MarketForecastProps {
  crop: string
  location: string
  quantity: string
  isValidLocation: boolean
  triggerFetchKey?: number
}

interface PriceData {
  date: string
  price: number
  confidence: number
  volume: number
}

interface MarketInsight {
  type: 'positive' | 'negative' | 'neutral'
  message: string
  impact: string
}

interface MLPrediction {
  nextDayPrice: number
  nextWeekPrice: number
  nextMonthPrice: number
  predictionConfidence: number
  priceRange: {
    min: number
    max: number
    confidence: number
  }
  priceTrend: 'rising' | 'falling' | 'stable'
  trendStrength: number
  volatilityIndex: number
  action: 'sell_now' | 'hold' | 'store' | 'buy'
  reasoning: string
  expectedGain: number
  riskLevel: 'low' | 'medium' | 'high'
  dataSource: string
  modelAccuracy: string
  trainingDataPoints: number
  lastModelUpdate: string
  modelVersion: string
  realCurrentPrice?: number
  realPriceData?: {
    price: number
    date: string
    market: string
    commodity: string
    variety: string
    grade: string
    state: string
    district: string
    source: string
    timestamp: string
  }
  originalRequest?: {
    crop: string;
    location: string;
    quantity: string;
    currentPrice?: number;
  };
  matchedLocation?: string;
  marketInsights?: {
    priceTrend: number;
    volatility: number;
    seasonalFactor: number;
    weatherFactor: number;
  };
  riskFactors?: string[];
  currentPrice?: number;
  isMockData?: boolean;
  mockReason?: string;
}

const MarketForecast = ({ crop, location, quantity, triggerFetchKey }: MarketForecastProps) => {
  const [priceData, setPriceData] = useState<PriceData[]>([])
  const [currentPrice, setCurrentPrice] = useState(0)
  const [forecastedPrice, setForecastedPrice] = useState(0)
  const [priceChange, setPriceChange] = useState(0)
  const [insights, setInsights] = useState<MarketInsight[]>([])
  const [recommendation, setRecommendation] = useState('')
  const [loading, setLoading] = useState(false)
  const [mlPrediction, setMlPrediction] = useState<MLPrediction | null>(null)
  const [mlModelInfo, setMlModelInfo] = useState<any>(null)
  const [mlApiHealth, setMlApiHealth] = useState<any>(null)
  const [useMLModel, setUseMLModel] = useState(true)
  const [nearbyMandis, setNearbyMandis] = useState<any[]>([])
  const [isUsingMockData, setIsUsingMockData] = useState(false)
  const [mockDataReason, setMockDataReason] = useState('')

  // Mock data - in real app, this would come from APIs
  const mockPriceData: PriceData[] = [
    { date: '2024-01-01', price: 1850, confidence: 85, volume: 1200 },
    { date: '2024-01-02', price: 1870, confidence: 87, volume: 1350 },
    { date: '2024-01-03', price: 1890, confidence: 89, volume: 1400 },
    { date: '2024-01-04', price: 1920, confidence: 91, volume: 1500 },
    { date: '2024-01-05', price: 1950, confidence: 93, volume: 1600 },
    { date: '2024-01-06', price: 1980, confidence: 95, volume: 1700 },
    { date: '2024-01-07', price: 2010, confidence: 97, volume: 1800 },
  ]

  const mockInsights: MarketInsight[] = [
    {
      type: 'positive',
      message: 'Strong demand from neighboring states expected next week',
      impact: 'High'
    },
    {
      type: 'positive',
      message: 'Export orders from Middle East increasing',
      impact: 'Medium'
    },
    {
      type: 'negative',
      message: 'New supply expected from Rajasthan in 2 weeks',
      impact: 'Medium'
    },
    {
      type: 'neutral',
      message: 'Weather conditions favorable for crop quality',
      impact: 'Low'
    }
  ]

    const [shouldFetch, setShouldFetch] = useState(false)

  // Check ML API health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await checkMLAPIHealth()
        setMlApiHealth(health)
        console.log('🔍 ML API Health:', health)
      } catch (error) {
        console.error('❌ ML API Health check failed:', error)
        setMlApiHealth({ status: 'unhealthy', error: 'Health check failed' })
      }
    }
    
    checkHealth()
  }, [])

  // Fetch market data when dependencies change
  useEffect(() => {
    const fetchMarketData = async () => {
      if (crop && location && shouldFetch) {
        setLoading(true)
        try {
          // Try ML prediction first (which fetches real current prices)
          let prediction: any
          let aiRecommendation: any
          
          if (useMLModel) {
            try {
              // Check if ML API is healthy first - wait for health check to complete
              if (!mlApiHealth || mlApiHealth.status !== 'healthy') {
                console.log('⚠️ ML API not healthy or health check pending, using AI recommendations')
                aiRecommendation = await getAIRecommendations(crop, location, parseInt(quantity) || 0)
                setMlPrediction(null)
                setIsUsingMockData(false)
                setMockDataReason('')
              } else {
                console.log('🤖 Attempting ML prediction with real prices for:', crop, 'in', location)
                prediction = await getMLMarketPredictionWithRealPrices(crop, location)
                console.log('✅ ML prediction with real prices successful:', prediction)
                setMlPrediction(prediction)
                
                // Check if this is mock data
                if (prediction.isMockData) {
                  setIsUsingMockData(true)
                  setMockDataReason(prediction.mockReason || 'ML API temporarily unavailable')
                  console.log('🔄 Using dynamic mock data:', prediction.mockReason)
                } else {
                  setIsUsingMockData(false)
                  setMockDataReason('')
                }
                
                // Get ML model info
                const modelInfo = await getMLModelPerformance()
                setMlModelInfo(modelInfo)
                console.log('📊 ML model info loaded:', modelInfo)
              }
            } catch (mlError) {
              console.log('❌ ML prediction failed, using AI recommendations:', mlError)
              aiRecommendation = await getAIRecommendations(crop, location, parseInt(quantity) || 0)
              setMlPrediction(null)
              setIsUsingMockData(false)
              setMockDataReason('')
            }
          } else {
            aiRecommendation = await getAIRecommendations(crop, location, parseInt(quantity) || 0)
            setIsUsingMockData(false)
            setMockDataReason('')
          }
          
          // Use ML prediction if available, otherwise use AI
          if (prediction && prediction.realCurrentPrice) {
            // Use current price from ML prediction (real market data)
            const mlCurrentPrice = prediction.realCurrentPrice || prediction.originalRequest?.currentPrice || 0
            setCurrentPrice(mlCurrentPrice)
            setForecastedPrice(prediction.nextDayPrice || 0)
            setPriceChange(((prediction.nextDayPrice || 0) - mlCurrentPrice) / mlCurrentPrice * 100)
            
            // Generate insights based on ML prediction
            const newInsights: MarketInsight[] = [
              {
                type: (prediction?.action === 'sell_now') ? 'positive' : 'neutral',
                message: prediction?.reasoning || 'ML prediction available',
                impact: 'High'
              },
              {
                type: 'neutral',
                message: `ML Confidence: ${((prediction?.predictionConfidence || 0) * 100).toFixed(0)}%`,
                impact: 'High'
              },
              {
                type: (prediction?.priceTrend || 'stable') === 'rising' ? 'positive' : 'negative',
                message: `${(prediction?.priceTrend ?? 'stable').toString().toUpperCase()} trend detected (strength: ${((prediction?.trendStrength ?? 0) * 100).toFixed(0)}%)`,
                impact: 'Medium'
              }
            ]
            
            setInsights(newInsights)
            setRecommendation(prediction?.reasoning || 'ML prediction suggests optimal selling strategy')
            
            // Create price chart data from ML prediction
            const priceChartData = [
              { date: new Date().toISOString().split('T')[0], price: mlCurrentPrice, confidence: 95, volume: 1500 },
              { date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], price: prediction?.nextDayPrice || 0, confidence: 90, volume: 1600 },
              { date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], price: prediction?.nextWeekPrice || 0, confidence: 85, volume: 1700 },
              { date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], price: prediction?.nextMonthPrice || 0, confidence: 80, volume: 1800 }
            ]
            setPriceData(priceChartData)
            
            // Fetch nearby mandi prices with real data
            try {
              const nearbyMandiData = await getNearbyMandiPrices(crop, location, mlCurrentPrice)
              setNearbyMandis(nearbyMandiData)
              console.log('✅ Nearby mandi data loaded:', nearbyMandiData)
            } catch (nearbyError) {
              console.log('❌ Nearby mandi data failed:', nearbyError)
              setNearbyMandis([])
            }
          } else {
            // Fallback to AI recommendations
            setForecastedPrice(aiRecommendation?.expectedGain || 0)
            setPriceChange(0)
          
          // Generate insights based on AI recommendation
          const newInsights: MarketInsight[] = [
            {
              type: (aiRecommendation?.action === 'sell_now') ? 'positive' : 'neutral',
              message: aiRecommendation?.reasoning || 'AI recommendation available',
              impact: 'High'
            },
            {
              type: 'neutral',
              message: `Confidence: ${((aiRecommendation?.confidence || 0) * 100).toFixed(0)}%`,
              impact: 'Medium'
            }
          ]
          
          setInsights(newInsights)
          setRecommendation(aiRecommendation?.reasoning || 'AI recommendation available')
            
            // Create basic price chart data
            const priceChartData = [
              { date: new Date().toISOString().split('T')[0], price: 0, confidence: 70, volume: 1000 },
              { date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], price: 0, confidence: 65, volume: 1100 }
            ]
            setPriceData(priceChartData)
          }
          
          setLoading(false)
          setShouldFetch(false) // Reset the flag
        } catch (error) {
          console.error('Error fetching market data:', error)
          // No fallback - show error message
          setPriceData([])
          setCurrentPrice(0)
          setForecastedPrice(0)
          setPriceChange(0)
          setInsights([])
          setNearbyMandis([])
          setRecommendation('No real market data available. Please try a different crop or market combination.')
          setLoading(false)
          setShouldFetch(false) // Reset the flag
        }
      }
    }
    
    if (shouldFetch) {
      fetchMarketData()
    }
  }, [crop, location, quantity, useMLModel, shouldFetch, mlApiHealth])

  // Trigger fetch when external "Start Market Analysis" button is clicked
  useEffect(() => {
    if (crop && location && triggerFetchKey !== undefined) {
      setShouldFetch(true)
    }
  }, [triggerFetchKey, crop, location])

   const handleAnalyze = () => {
     if (crop && location) {
       setShouldFetch(true)
     }
   }

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-5 h-5" />
    if (change < 0) return <TrendingDown className="w-5 h-5" />
    return <Clock className="w-5 h-5" />
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'negative':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-blue-500" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'border-green-200 bg-green-50'
      case 'negative':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  if (!crop || !location) {
    return (
      <div className="card text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Select Crop & Location</h3>
        <p className="text-gray-500">Choose your crop and location to see market insights</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="card text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Analyzing market data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">

       {/* ML Model Status Indicator */}
       {useMLModel && (
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl border border-blue-200"
         >
           <div className="flex items-center space-x-3">
             <div className={`w-3 h-3 rounded-full animate-pulse ${
               mlApiHealth?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
             }`}></div>
             <div className="flex items-center space-x-2">
               <span className="text-sm font-medium text-blue-800">ML Model Status</span>
               {mlApiHealth?.status === 'healthy' ? (
                 <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                   ✅ API Connected
                 </span>
               ) : (
                 <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                   ❌ API Disconnected
                 </span>
               )}
             </div>
           </div>
           
           {mlApiHealth?.status === 'healthy' ? (
             <div className="mt-2 text-xs text-blue-700">
               <span>ML API: {mlApiHealth.model_version} | Accuracy: {mlApiHealth.model_accuracy}</span>
               {mlPrediction && (
                 <span className="ml-2">• Using ML predictions for {mlPrediction.originalRequest?.crop} in {mlPrediction.matchedLocation || mlPrediction.originalRequest?.location}</span>
               )}
             </div>
           ) : (
             <div className="mt-2 text-xs text-red-700">
               <span>ML API Status: {mlApiHealth?.error || 'Connection failed'}</span>
               <span className="ml-2">• Using fallback predictions</span>
               <div className="mt-1 text-xs text-orange-600">
                 💡 To use ML predictions, ensure the Python ML API is running on port 5000
               </div>
             </div>
           )}
         </motion.div>
       )}

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Market Intelligence</h2>
          <div className="flex items-center space-x-4">
            {/* ML Model Toggle */}
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={useMLModel}
                  onChange={(e) => setUseMLModel(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-700">ML Model</span>
              </label>
              {mlModelInfo && mlApiHealth?.status === 'healthy' ? (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {mlModelInfo.r2Score * 100}% accuracy
                </span>
              ) : (
                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                  Fallback Mode
                </span>
              )}
            </div>
            
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
            </div>
          </div>
        </div>

        {/* Mock Data Indicator */}
        {isUsingMockData && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 text-lg">🔄</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-orange-800">
                  Using Dynamic Mock Data
                </h3>
                <p className="text-sm text-orange-700 mt-1">
                  {mockDataReason || 'ML API temporarily unavailable'}. 
                  Data is generated using intelligent algorithms based on market patterns, 
                  seasonal factors, and historical trends.
                </p>
              </div>
              <div className="flex-shrink-0">
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                  Mock Mode
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Price */}
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Current Price</p>
            <p className="text-3xl font-bold text-green-700">₹{currentPrice.toLocaleString()}</p>
            <p className="text-sm text-gray-500">per quintal</p>
          </div>

          {/* Forecasted Price */}
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Forecasted Price</p>
            <p className="text-3xl font-bold text-blue-700">₹{forecastedPrice.toLocaleString()}</p>
            <p className="text-sm text-gray-500">in 7 days</p>
          </div>

          {/* Price Change */}
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
            <div className="flex items-center justify-center mb-2">
              {getPriceChangeIcon(priceChange)}
            </div>
            <p className="text-sm text-gray-600 mb-1">Price Change</p>
            <p className={`text-3xl font-bold ${getPriceChangeColor(priceChange)}`}>
              {priceChange > 0 ? '+' : ''}{priceChange}%
            </p>
            <p className="text-sm text-gray-500">this week</p>
          </div>
        </div>
      </motion.div>

      {/* Price Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Price Trend Analysis</h3>
        <PriceChart data={priceData} />
      </motion.div>

      {/* AI Recommendations */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          {useMLModel && mlPrediction ? 'ML-Powered Recommendations' : 'AI Recommendations'}
        </h3>
        
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-6 rounded-xl border border-primary-200 mb-6">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="text-lg font-semibold text-primary-800 mb-2">Selling Strategy</h4>
              <p className="text-primary-700 mb-3">{recommendation}</p>
              
              {useMLModel && mlPrediction && (
                <div className="mb-4 p-3 bg-white rounded-lg border border-primary-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                      ML Model v{mlPrediction?.modelVersion || '1.0'}
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                      {mlPrediction?.modelAccuracy || '85'}% accuracy
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                    <div>
                      <span className="text-primary-800">Current:</span>
                      <p className="text-primary-700 font-semibold">₹{mlPrediction?.realCurrentPrice || mlPrediction?.currentPrice || currentPrice}</p>
                      {mlPrediction?.realPriceData && (
                        <p className="text-xs text-gray-500 mt-1">
                          Source: {mlPrediction?.realPriceData?.source}
                        </p>
                      )}
                    </div>
                    <div>
                      <span className="text-primary-800">Next Day:</span>
                      <p className="text-primary-700 font-semibold">₹{mlPrediction?.nextDayPrice || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-primary-800">Next Week:</span>
                      <p className="text-primary-700 font-semibold">₹{mlPrediction?.nextWeekPrice || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-primary-800">Next Month:</span>
                      <p className="text-primary-700 font-semibold">₹{mlPrediction?.nextMonthPrice || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-primary-800">Risk Level:</span>
                      <p className={`font-semibold ${
                        (mlPrediction?.riskLevel || 'unknown') === 'low' ? 'text-green-600' :
                        (mlPrediction?.riskLevel || 'unknown') === 'medium' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {(mlPrediction?.riskLevel || 'unknown').toString().toUpperCase()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Additional ML Insights */}
                  {mlPrediction?.marketInsights && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-800 mb-2">Market Insights</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-gray-600">Price Trend:</span>
                          <p className="font-medium">{mlPrediction?.marketInsights?.priceTrend > 0 ? '↗️ Rising' : mlPrediction?.marketInsights?.priceTrend < 0 ? '↘️ Falling' : '→ Stable'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Volatility:</span>
                          <p className="font-medium">{mlPrediction?.marketInsights?.volatility}%</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Seasonal Factor:</span>
                          <p className="font-medium">{mlPrediction?.marketInsights?.seasonalFactor}%</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Weather Factor:</span>
                          <p className="font-medium">{mlPrediction?.marketInsights?.weatherFactor}%</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Risk Factors */}
                  {mlPrediction?.riskFactors && mlPrediction?.riskFactors?.length > 0 && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg">
                      <h5 className="text-sm font-medium text-red-800 mb-2">Risk Factors</h5>
                      <ul className="text-xs text-red-700 space-y-1">
                        {mlPrediction?.riskFactors?.map((factor, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Expected Gain */}
                  {mlPrediction?.expectedGain && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <h5 className="text-sm font-medium text-green-800 mb-2">Expected Gain</h5>
                      <p className="text-lg font-bold text-green-700">₹{mlPrediction?.expectedGain?.toLocaleString()}</p>
                      <p className="text-xs text-green-600">Based on current market analysis</p>
                    </div>
                  )}
                </div>
                             )}
               
               {/* Current Price Details */}
               {mlPrediction?.realPriceData && (
                 <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                   <h5 className="text-sm font-medium text-blue-800 mb-2">Current Price Details</h5>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                     <div>
                       <span className="text-blue-700">Market:</span>
                       <p className="font-medium">{mlPrediction.realPriceData.market}</p>
                     </div>
                     <div>
                       <span className="text-blue-700">Date:</span>
                       <p className="font-medium">{mlPrediction.realPriceData.date}</p>
                     </div>
                     <div>
                       <span className="text-blue-700">Variety:</span>
                       <p className="font-medium">{mlPrediction.realPriceData.variety}</p>
                     </div>
                     <div>
                       <span className="text-blue-700">Source:</span>
                       <p className="font-medium text-green-600">{mlPrediction.realPriceData.source}</p>
                     </div>
                   </div>
                 </div>
               )}
               
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-primary-800">Expected Revenue:</span>
                   <p className="text-primary-700">
                     {quantity && forecastedPrice > 0 ? 
                       `₹${(parseInt(quantity) * forecastedPrice).toLocaleString()}` : 
                       'Enter quantity to calculate'
                     }
                   </p>
                </div>
                <div>
                  <span className="font-medium text-primary-800">Potential Gain:</span>
                   <p className="text-primary-700">
                     {quantity && forecastedPrice > 0 && currentPrice > 0 ? 
                       `₹${((forecastedPrice - currentPrice) * parseInt(quantity)).toLocaleString()}` : 
                       'Enter quantity to calculate'
                     }
                   </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Best Selling Window</h4>
            <p className="text-green-700 text-sm">Next 7-10 days show optimal pricing with high demand</p>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Risk Assessment</h4>
            <p className="text-blue-700 text-sm">Low risk - Strong market fundamentals support price stability</p>
          </div>
        </div>
      </motion.div>

      {/* Market Insights */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Market Insights & Trends</h3>
        
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 border rounded-lg ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start space-x-3">
                {getInsightIcon(insight.type)}
                <div className="flex-1">
                  <p className="text-gray-800 mb-1">{insight.message}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Impact: {insight.impact}</span>
                    <span className="text-xs text-gray-500">Updated: 2 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Mandi Comparison */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Nearby Mandi Prices</h3>
        
         {nearbyMandis.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Mandi</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Distance</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Price</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Difference</th>
                   <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
                 {nearbyMandis.map((mandi, index) => (
                   <tr key={index} className="border-b border-gray-100">
                     <td className="py-3 px-4 font-medium">{mandi.mandi}</td>
                     <td className="py-3 px-4 text-gray-600">{mandi.distance}</td>
                     <td className={`py-3 px-4 font-semibold ${
                       mandi.difference > 0 ? 'text-green-600' : 
                       mandi.difference < 0 ? 'text-red-600' : 'text-gray-600'
                     }`}>
                       ₹{mandi.price.toLocaleString()}
                     </td>
                     <td className={`py-3 px-4 ${
                       mandi.difference > 0 ? 'text-green-600' : 
                       mandi.difference < 0 ? 'text-red-600' : 'text-gray-600'
                     }`}>
                       {mandi.difference > 0 ? '+' : ''}₹{mandi.difference.toFixed(0)}
                     </td>
                     <td className="py-3 px-4 text-gray-500 text-sm">{mandi.date}</td>
              </tr>
                 ))}
            </tbody>
          </table>
             
             <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
               <p className="text-sm text-blue-700">
                 <strong>Source:</strong> Real-time data from Data.gov.in API • 
                 <strong>Last Updated:</strong> {nearbyMandis[0]?.date || 'N/A'}
               </p>
             </div>
           </div>
         ) : currentPrice > 0 ? (
           <div className="text-center py-8 text-gray-500">
             <p>No nearby mandi data available for this crop.</p>
             <p className="text-sm mt-2">Try a different crop or location.</p>
           </div>
         ) : (
           <div className="text-center py-8 text-gray-500">
             <p>No real market data available to show nearby mandi prices.</p>
             <p className="text-sm mt-2">Please try a different crop or market combination.</p>
        </div>
         )}
      </motion.div>
    </div>
  )
}

export default MarketForecast
