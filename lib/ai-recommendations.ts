// AI-powered agricultural recommendation system
export interface AIRecommendation {
  type: 'market' | 'storage' | 'weather' | 'financial' | 'general'
  confidence: number
  reasoning: string
  action: string
  expectedBenefit: string
  riskFactors: string[]
  priority: 'high' | 'medium' | 'low'
}

export interface CropData {
  name: string
  season: string[]
  optimalTemp: { min: number; max: number }
  waterRequirement: 'low' | 'medium' | 'high'
  marketDemand: 'low' | 'medium' | 'high'
  storageLife: number
  commonDiseases: string[]
}

export interface MarketCondition {
  currentPrice: number
  priceTrend: 'rising' | 'falling' | 'stable'
  demandLevel: 'low' | 'medium' | 'high'
  supplyLevel: 'low' | 'medium' | 'high'
  seasonality: 'peak' | 'off-peak' | 'normal'
}

export interface WeatherCondition {
  temperature: number
  humidity: number
  rainfall: number
  windSpeed: number
  forecast: 'good' | 'moderate' | 'poor'
}

// Crop database with agricultural knowledge
const cropDatabase: { [key: string]: CropData } = {
  wheat: {
    name: 'Wheat',
    season: ['Rabi'],
    optimalTemp: { min: 15, max: 25 },
    waterRequirement: 'medium',
    marketDemand: 'high',
    storageLife: 365,
    commonDiseases: ['Rust', 'Smut', 'Powdery Mildew']
  },
  rice: {
    name: 'Rice',
    season: ['Kharif', 'Rabi'],
    optimalTemp: { min: 20, max: 35 },
    waterRequirement: 'high',
    marketDemand: 'high',
    storageLife: 730,
    commonDiseases: ['Blight', 'Tungro', 'Bacterial Leaf Blight']
  },
  cotton: {
    name: 'Cotton',
    season: ['Kharif'],
    optimalTemp: { min: 20, max: 30 },
    waterRequirement: 'medium',
    marketDemand: 'medium',
    storageLife: 180,
    commonDiseases: ['Bollworm', 'Leaf Curl Virus', 'Bacterial Blight']
  },
  sugarcane: {
    name: 'Sugarcane',
    season: ['Kharif'],
    optimalTemp: { min: 25, max: 35 },
    waterRequirement: 'high',
    marketDemand: 'medium',
    storageLife: 30,
    commonDiseases: ['Red Rot', 'Smut', 'Wilt']
  },
  pulses: {
    name: 'Pulses',
    season: ['Kharif', 'Rabi'],
    optimalTemp: { min: 20, max: 30 },
    waterRequirement: 'low',
    marketDemand: 'high',
    storageLife: 365,
    commonDiseases: ['Wilt', 'Root Rot', 'Leaf Spot']
  }
}

// AI recommendation engine
export class AgriculturalAI {
  private static instance: AgriculturalAI

  static getInstance(): AgriculturalAI {
    if (!AgriculturalAI.instance) {
      AgriculturalAI.instance = new AgriculturalAI()
    }
    return AgriculturalAI.instance
  }

  // Generate comprehensive recommendations
  async generateRecommendations(
    crop: string,
    location: string,
    quantity: number,
    marketCondition: MarketCondition,
    weatherCondition: WeatherCondition,
    storageCost: number
  ): Promise<AIRecommendation[]> {
    const recommendations: AIRecommendation[] = []
    const cropInfo = cropDatabase[crop.toLowerCase()]

    if (!cropInfo) {
      return [{
        type: 'general',
        confidence: 0.5,
        reasoning: 'Crop information not available in database',
        action: 'Consult local agricultural expert',
        expectedBenefit: 'Unknown',
        riskFactors: ['Limited crop data'],
        priority: 'medium'
      }]
    }

    // Market timing recommendation
    const marketRecommendation = this.analyzeMarketTiming(
      cropInfo,
      marketCondition,
      quantity
    )
    recommendations.push(marketRecommendation)

    // Storage recommendation
    const storageRecommendation = this.analyzeStorageDecision(
      cropInfo,
      marketCondition,
      storageCost,
      quantity
    )
    recommendations.push(storageRecommendation)

    // Weather-based recommendation
    const weatherRecommendation = this.analyzeWeatherImpact(
      cropInfo,
      weatherCondition
    )
    recommendations.push(weatherRecommendation)

    // Financial recommendation
    const financialRecommendation = this.analyzeFinancialAspects(
      cropInfo,
      marketCondition,
      storageCost,
      quantity
    )
    recommendations.push(financialRecommendation)

    // Sort by priority and confidence
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      return b.confidence - a.confidence
    })
  }

  private analyzeMarketTiming(
    crop: CropData,
    market: MarketCondition,
    quantity: number
  ): AIRecommendation {
    let action = 'hold'
    let reasoning = 'Market conditions are stable'
    let confidence = 0.7

    if (market.priceTrend === 'rising' && market.demandLevel === 'high') {
      action = 'sell_now'
      reasoning = 'Prices are rising with high demand - optimal selling time'
      confidence = 0.9
    } else if (market.priceTrend === 'falling' && market.supplyLevel === 'high') {
      action = 'hold'
      reasoning = 'Prices falling due to high supply - wait for better prices'
      confidence = 0.8
    } else if (market.seasonality === 'peak') {
      action = 'sell_now'
      reasoning = 'Peak season - prices typically highest now'
      confidence = 0.8
    }

    return {
      type: 'market',
      confidence,
      reasoning,
      action,
      expectedBenefit: action === 'sell_now' ? 
        `Immediate sale at current prices` : 
        `Potential higher prices in future`,
      riskFactors: ['Market volatility', 'Weather uncertainty'],
      priority: 'high'
    }
  }

  private analyzeStorageDecision(
    crop: CropData,
    market: MarketCondition,
    storageCost: number,
    quantity: number
  ): AIRecommendation {
    const monthlyStorageCost = storageCost * quantity
    const potentialPriceIncrease = market.priceTrend === 'rising' ? 0.15 : 0.05
    const potentialRevenue = market.currentPrice * quantity * potentialPriceIncrease

    let action = 'store'
    let reasoning = 'Storage costs are reasonable compared to potential gains'
    let confidence = 0.7

    if (monthlyStorageCost > potentialRevenue) {
      action = 'sell_now'
      reasoning = 'Storage costs exceed potential price gains'
      confidence = 0.9
    } else if (crop.storageLife < 30) {
      action = 'sell_now'
      reasoning = 'Crop has limited storage life'
      confidence = 0.8
    }

    return {
      type: 'storage',
      confidence,
      reasoning,
      action,
      expectedBenefit: action === 'store' ? 
        `Potential revenue: ₹${potentialRevenue.toFixed(0)}` : 
        `Avoid storage costs: ₹${monthlyStorageCost.toFixed(0)}`,
      riskFactors: ['Storage quality', 'Crop deterioration', 'Market changes'],
      priority: 'high'
    }
  }

  private analyzeWeatherImpact(
    crop: CropData,
    weather: WeatherCondition
  ): AIRecommendation {
    let action = 'monitor'
    let reasoning = 'Weather conditions are favorable'
    let confidence = 0.8

    if (weather.temperature < crop.optimalTemp.min || weather.temperature > crop.optimalTemp.max) {
      action = 'protect'
      reasoning = 'Temperature outside optimal range for crop growth'
      confidence = 0.9
    }

    if (weather.rainfall > 50 && crop.waterRequirement === 'low') {
      action = 'drain'
      reasoning = 'Excessive rainfall may damage crop'
      confidence = 0.8
    }

    if (weather.humidity > 80) {
      action = 'monitor'
      reasoning = 'High humidity increases disease risk'
      confidence = 0.7
    }

    return {
      type: 'weather',
      confidence,
      reasoning,
      action,
      expectedBenefit: action === 'monitor' ? 
        'Maintain current practices' : 
        'Prevent potential crop damage',
      riskFactors: ['Weather unpredictability', 'Disease development'],
      priority: 'medium'
    }
  }

  private analyzeFinancialAspects(
    crop: CropData,
    market: MarketCondition,
    storageCost: number,
    quantity: number
  ): AIRecommendation {
    const totalRevenue = market.currentPrice * quantity
    const totalCosts = storageCost * quantity
    const profitMargin = (totalRevenue - totalCosts) / totalRevenue

    let action = 'proceed'
    let reasoning = 'Financial analysis shows positive returns'
    let confidence = 0.8

    if (profitMargin < 0.1) {
      action = 'reconsider'
      reasoning = 'Low profit margin - consider alternative crops or timing'
      confidence = 0.9
    }

    if (market.demandLevel === 'low' && market.supplyLevel === 'high') {
      action = 'delay'
      reasoning = 'Low demand and high supply - consider delaying sale'
      confidence = 0.8
    }

    return {
      type: 'financial',
      confidence,
      reasoning,
      action,
      expectedBenefit: action === 'proceed' ? 
        `Profit margin: ${(profitMargin * 100).toFixed(1)}%` : 
        'Avoid potential losses',
      riskFactors: ['Price fluctuations', 'Cost increases', 'Market changes'],
      priority: 'medium'
    }
  }

  // Get crop-specific advice
  getCropAdvice(crop: string, weather: WeatherCondition): string {
    const cropInfo = cropDatabase[crop.toLowerCase()]
    if (!cropInfo) return 'Crop information not available'

    let advice = `For ${cropInfo.name}: `

    if (weather.temperature < cropInfo.optimalTemp.min) {
      advice += 'Temperature is below optimal. Consider protective measures. '
    } else if (weather.temperature > cropInfo.optimalTemp.max) {
      advice += 'Temperature is above optimal. Ensure adequate irrigation. '
    }

    if (weather.humidity > 80) {
      advice += 'High humidity detected. Monitor for disease development. '
    }

    if (cropInfo.waterRequirement === 'high' && weather.rainfall < 20) {
      advice += 'Low rainfall. Increase irrigation frequency. '
    }

    return advice
  }

  // Get seasonal recommendations
  getSeasonalAdvice(crop: string, currentMonth: number): string {
    const cropInfo = cropDatabase[crop.toLowerCase()]
    if (!cropInfo) return 'Seasonal advice not available'

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]

    let advice = `For ${cropInfo.name} in ${monthNames[currentMonth - 1]}: `

    if (cropInfo.season.includes('Rabi') && [10, 11, 12, 1, 2, 3].includes(currentMonth)) {
      advice += 'Optimal growing season. Focus on proper irrigation and pest control. '
    } else if (cropInfo.season.includes('Kharif') && [6, 7, 8, 9, 10].includes(currentMonth)) {
      advice += 'Optimal growing season. Monitor rainfall and drainage. '
    } else {
      advice += 'Off-season. Plan for next growing cycle or consider storage. '
    }

    return advice
  }
}

// Export singleton instance
export const agriculturalAI = AgriculturalAI.getInstance()
