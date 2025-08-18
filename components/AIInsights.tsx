'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Thermometer,
  Droplets,
  Package,
  Target,
  Lightbulb,
  BarChart3
} from 'lucide-react'
import { agriculturalAI, AIRecommendation, MarketCondition, WeatherCondition } from '@/lib/ai-recommendations'
import { generateAIResponse } from '@/lib/llamafileAI'

interface AIInsightsProps {
  crop: string
  location: string
  quantity: string
  isValidLocation: boolean
  marketData?: any
  weatherData?: any
  selectedLanguage?: 'english' | 'hindi' | 'punjabi'
  triggerKey?: number
}

const AIInsights = ({ crop, location, quantity, marketData, weatherData, selectedLanguage, triggerKey }: AIInsightsProps) => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [llamaInsight, setLlamaInsight] = useState<string>('')

  useEffect(() => {
    const generateAIInsights = async () => {
      if (!triggerKey) return
      if (crop && location && quantity) {
        setLoading(true)
        try {
          // Create mock market and weather conditions if not provided
          const marketCondition: MarketCondition = marketData ? {
            currentPrice: marketData.currentPrice || 2000,
            priceTrend: marketData.priceChange > 0 ? 'rising' : marketData.priceChange < 0 ? 'falling' : 'stable',
            demandLevel: 'medium',
            supplyLevel: 'medium',
            seasonality: 'normal'
          } : {
            currentPrice: 2000,
            priceTrend: 'stable',
            demandLevel: 'medium',
            supplyLevel: 'medium',
            seasonality: 'normal'
          }

          const weatherCondition: WeatherCondition = weatherData ? {
            temperature: weatherData.current?.temp || 25,
            humidity: weatherData.current?.humidity || 60,
            rainfall: 0,
            windSpeed: 15,
            forecast: 'good'
          } : {
            temperature: 25,
            humidity: 60,
            rainfall: 0,
            windSpeed: 15,
            forecast: 'good'
          }

          const aiRecommendations = await agriculturalAI.generateRecommendations(
            crop,
            location,
            parseInt(quantity) || 0,
            marketCondition,
            weatherCondition,
            150 // Default storage cost per ton
          )

          setRecommendations(aiRecommendations)

          // Also fetch a narrative insight from Llamafile
          try {
            const llmLang = selectedLanguage === 'hindi' ? 'hi' : selectedLanguage === 'punjabi' ? 'pa' : 'en'
            const prompt = `Provide concise, practical AI insights for the farmer based on the following context.

Crop: ${crop}
Location: ${location}
Quantity (tons): ${quantity}
Market: current price ₹${marketCondition.currentPrice}, trend ${marketCondition.priceTrend}, demand ${marketCondition.demandLevel}, supply ${marketCondition.supplyLevel}
Weather: temp ${weatherCondition.temperature}°C, humidity ${weatherCondition.humidity}%, forecast ${weatherCondition.forecast}

Guidelines:
- 3-5 actionable bullets with reasons
- Include market timing, storage vs sell, and weather precautions if relevant
- Keep it specific to Punjab context and the crop
- Be brief and high-signal`

            const resp = await generateAIResponse({
              prompt,
              context: { crop, location, quantity, currentTab: 'AI Insights' },
              language: llmLang
            })
            setLlamaInsight(resp.text)
          } catch (e) {
            // ignore, fallback to rule-based only
            setLlamaInsight('')
          }
        } catch (error) {
          console.error('Error generating AI insights:', error)
          // Fallback to basic recommendations
          setRecommendations([
            {
              type: 'general',
              confidence: 0.7,
              reasoning: 'Unable to generate AI recommendations. Please check your input.',
              action: 'Verify crop and location details',
              expectedBenefit: 'Accurate recommendations',
              riskFactors: ['Limited data'],
              priority: 'medium'
            }
          ])
        } finally {
          setLoading(false)
        }
      }
    }

    generateAIInsights()
  }, [triggerKey, crop, location, quantity, marketData, weatherData])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'market':
        return <TrendingUp className="w-5 h-5" />
      case 'storage':
        return <Package className="w-5 h-5" />
      case 'weather':
        return <Thermometer className="w-5 h-5" />
      case 'financial':
        return <DollarSign className="w-5 h-5" />
      default:
        return <Lightbulb className="w-5 h-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'market':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'storage':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'weather':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'financial':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'low':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const filteredRecommendations = selectedType === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.type === selectedType)

  if (!crop || !location || !quantity) {
    return (
      <div className="card text-center py-12">
        <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">AI Insights</h3>
        <p className="text-gray-500">Select crop, location, and quantity to get AI-powered recommendations</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="card text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Analyzing with AI...</p>
      </div>
    )
  }

  // Not triggered yet
  if (!triggerKey) {
    return (
      <div className="card text-center py-12">
        <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">AI Insights</h3>
        <p className="text-gray-500">Click "Start Market Analysis" to generate insights for your inputs.</p>
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
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl">
              <Brain className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">AI-Powered Insights</h2>
              <p className="text-gray-600">Intelligent recommendations for {crop} in {location}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Confidence Score</p>
            <p className="text-2xl font-bold text-primary-600">
              {Math.round(recommendations.reduce((acc, rec) => acc + rec.confidence, 0) / recommendations.length * 100)}%
            </p>
          </div>
        </div>

        {/* Llamafile Narrative Insight */}
        {llamaInsight && (
          <div className="mb-4 p-4 rounded-lg border border-purple-200 bg-purple-50">
            <h4 className="font-semibold text-purple-800 mb-2">Llama Insight</h4>
            <div className="text-sm text-purple-900 whitespace-pre-line">{llamaInsight}</div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-6">
          {['all', 'market', 'storage', 'weather', 'financial'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedType === type
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Recommendations */}
      <div className="space-y-4">
        {filteredRecommendations.map((recommendation, index) => (
          <motion.div
            key={`${recommendation.type}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start space-x-4">
              {/* Icon */}
              <div className={`p-3 rounded-xl ${getTypeColor(recommendation.type)}`}>
                {getTypeIcon(recommendation.type)}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800 capitalize">
                    {recommendation.type} Recommendation
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(recommendation.priority)}`}>
                      {recommendation.priority} Priority
                    </span>
                    <span className="text-sm text-gray-500">
                      {Math.round(recommendation.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 mb-3">{recommendation.reasoning}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">Recommended Action</h4>
                    <p className="text-primary-700 font-medium">{recommendation.action}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">Expected Benefit</h4>
                    <p className="text-green-700">{recommendation.expectedBenefit}</p>
                  </div>
                </div>

                {recommendation.riskFactors.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-800 mb-2">Risk Factors</h4>
                    <div className="flex flex-wrap gap-2">
                      {recommendation.riskFactors.map((risk, riskIndex) => (
                        <span
                          key={riskIndex}
                          className="px-3 py-1 bg-red-50 text-red-700 text-sm rounded-full border border-red-200"
                        >
                          {risk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Target className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-800">AI Summary</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-white rounded-lg">
            <p className="text-gray-600">High Priority</p>
            <p className="text-xl font-bold text-red-600">
              {recommendations.filter(r => r.priority === 'high').length}
            </p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg">
            <p className="text-gray-600">Actions</p>
            <p className="text-xl font-bold text-primary-600">
              {recommendations.length}
            </p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg">
            <p className="text-gray-600">Avg Confidence</p>
            <p className="text-xl font-bold text-green-600">
              {Math.round(recommendations.reduce((acc, rec) => acc + rec.confidence, 0) / recommendations.length * 100)}%
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AIInsights
