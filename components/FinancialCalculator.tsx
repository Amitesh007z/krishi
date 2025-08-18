'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calculator, TrendingUp, TrendingDown, DollarSign, Percent, Package, Truck } from 'lucide-react'
import { getMarketPrices, getStorageFacilities } from '@/lib/api'

interface FinancialCalculatorProps {
  location: string
  isValidLocation: boolean
}

const FinancialCalculator = ({ location, isValidLocation }: FinancialCalculatorProps) => {
  const [crop, setCrop] = useState('wheat')
  const [area, setArea] = useState(10)
  const [yieldPerAcre, setYieldPerAcre] = useState(20)
  const [currentPrice, setCurrentPrice] = useState(2200)
  const [costs, setCosts] = useState({
    seeds: 800,
    fertilizers: 1200,
    pesticides: 600,
    irrigation: 800,
    labor: 1500,
    machinery: 1000,
    storage: 200,
    transportation: 300
  })
  const [marketData, setMarketData] = useState<any[]>([])
  const [storageData, setStorageData] = useState<any[]>([])

  const crops = ['wheat', 'rice', 'cotton', 'sugarcane', 'pulses', 'maize']

  useEffect(() => {
    if (isValidLocation && location) {
      fetchMarketData()
      fetchStorageData()
    }
  }, [location, isValidLocation, crop])

  const fetchMarketData = async () => {
    try {
      const data = await getMarketPrices(crop, location)
      setMarketData(data)
      if (data.length > 0) {
        setCurrentPrice(data[0].price)
      }
    } catch (error) {
      console.error('Error fetching market data:', error)
    }
  }

  const fetchStorageData = async () => {
    try {
      const data = await getStorageFacilities(location)
      setStorageData(data)
    } catch (error) {
      console.error('Error fetching storage data:', error)
    }
  }

  const calculateTotalCost = () => {
    return Object.values(costs).reduce((sum, cost) => sum + cost, 0)
  }

  const calculateTotalRevenue = () => {
    return area * yieldPerAcre * currentPrice
  }

  const calculateProfit = () => {
    return calculateTotalRevenue() - (calculateTotalCost() * area)
  }

  const calculateProfitMargin = () => {
    const revenue = calculateTotalRevenue()
    const totalCost = calculateTotalCost() * area
    return revenue > 0 ? ((revenue - totalCost) / revenue) * 100 : 0
  }

  const calculateROI = () => {
    const totalCost = calculateTotalCost() * area
    return totalCost > 0 ? (calculateProfit() / totalCost) * 100 : 0
  }

  const getStorageCost = () => {
    if (storageData.length > 0) {
      return storageData[0].costPerTon * yieldPerAcre * area * 0.01 // Convert to tons
    }
    return costs.storage
  }

  const getPriceTrend = () => {
    if (marketData.length >= 2) {
      const current = marketData[0].price
      const previous = marketData[1].price
      return ((current - previous) / previous) * 100
    }
    return 0
  }

  const getRecommendation = () => {
    const profit = calculateProfit()
    const margin = calculateProfitMargin()
    const trend = getPriceTrend()

    if (profit < 0) {
      return {
        action: 'Consider alternative crops or reduce costs',
        color: 'text-red-600',
        icon: <TrendingDown className="w-5 h-5" />
      }
    } else if (margin < 20) {
      return {
        action: 'Monitor costs and consider price optimization',
        color: 'text-yellow-600',
        icon: <TrendingUp className="w-5 h-5" />
      }
    } else {
      return {
        action: 'Good profit potential, consider expanding',
        color: 'text-green-600',
        icon: <TrendingUp className="w-5 h-5" />
      }
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
          <Calculator className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Please enter a valid Punjab location to calculate finances</p>
        </div>
      </motion.div>
    )
  }

  const recommendation = getRecommendation()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Financial Calculator</h3>
          <p className="text-gray-600">Profit analysis and cost optimization</p>
        </div>
        <Calculator className="w-6 h-6 text-primary" />
      </div>

      {/* Input Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Crop</label>
          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            className="input-field"
          >
            {crops.map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Area (Acres)</label>
          <input
            type="number"
            value={area}
            onChange={(e) => setArea(Number(e.target.value))}
            className="input-field"
            min="1"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Yield per Acre (Quintal)</label>
          <input
            type="number"
            value={yieldPerAcre}
            onChange={(e) => setYieldPerAcre(Number(e.target.value))}
            className="input-field"
            min="1"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Price per Quintal (₹)</label>
          <input
            type="number"
            value={currentPrice}
            onChange={(e) => setCurrentPrice(Number(e.target.value))}
            className="input-field"
            min="1"
          />
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Cost Breakdown (per acre)</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Seeds</label>
            <input
              type="number"
              value={costs.seeds}
              onChange={(e) => setCosts(prev => ({ ...prev, seeds: Number(e.target.value) }))}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Fertilizers</label>
            <input
              type="number"
              value={costs.fertilizers}
              onChange={(e) => setCosts(prev => ({ ...prev, fertilizers: Number(e.target.value) }))}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Pesticides</label>
            <input
              type="number"
              value={costs.pesticides}
              onChange={(e) => setCosts(prev => ({ ...prev, pesticides: Number(e.target.value) }))}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Irrigation</label>
            <input
              type="number"
              value={costs.irrigation}
              onChange={(e) => setCosts(prev => ({ ...prev, irrigation: Number(e.target.value) }))}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Labor</label>
            <input
              type="number"
              value={costs.labor}
              onChange={(e) => setCosts(prev => ({ ...prev, labor: Number(e.target.value) }))}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Machinery</label>
            <input
              type="number"
              value={costs.machinery}
              onChange={(e) => setCosts(prev => ({ ...prev, machinery: Number(e.target.value) }))}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Storage</label>
            <input
              type="number"
              value={costs.storage}
              onChange={(e) => setCosts(prev => ({ ...prev, storage: Number(e.target.value) }))}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Transportation</label>
            <input
              type="number"
              value={costs.transportation}
              onChange={(e) => setCosts(prev => ({ ...prev, transportation: Number(e.target.value) }))}
              className="input-field text-sm"
            />
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="font-semibold">Total Revenue</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            ₹{calculateTotalRevenue().toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">
            {area} acres × {yieldPerAcre} quintals × ₹{currentPrice}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Package className="w-5 h-5 text-red-600" />
            <span className="font-semibold">Total Cost</span>
          </div>
          <div className="text-2xl font-bold text-red-600">
            ₹{(calculateTotalCost() * area).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">
            ₹{calculateTotalCost()} per acre × {area} acres
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="font-semibold">Net Profit</span>
          </div>
          <div className={`text-2xl font-bold ${calculateProfit() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₹{calculateProfit().toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">
            Revenue - Total Cost
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Percent className="w-5 h-5 text-purple-600" />
            <span className="font-semibold">Profit Margin</span>
          </div>
          <div className={`text-2xl font-bold ${calculateProfitMargin() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {calculateProfitMargin().toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">
            ROI: {calculateROI().toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Market Insights */}
      {marketData.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold mb-3">Market Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600">Current Price</div>
              <div className="font-bold text-lg">₹{marketData[0].price}/quintal</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Price Trend</div>
              <div className={`font-bold text-lg ${getPriceTrend() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {getPriceTrend() >= 0 ? '+' : ''}{getPriceTrend().toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Market</div>
              <div className="font-bold text-lg">{marketData[0].mandi}</div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendation */}
      <div className={`bg-white border rounded-lg p-4 ${recommendation.color.replace('text-', 'border-')}`}>
        <div className="flex items-center space-x-2 mb-2">
          {recommendation.icon}
          <span className="font-semibold">Recommendation</span>
        </div>
        <p className={recommendation.color}>{recommendation.action}</p>
      </div>

      {/* Storage Options */}
      {storageData.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold mb-3">Storage Options</h4>
          <div className="space-y-2">
            {storageData.slice(0, 3).map((facility, index) => (
              <div key={index} className="bg-white border rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{facility.name}</div>
                    <div className="text-sm text-gray-600">
                      {facility.distance}km away • ₹{facility.costPerTon}/ton
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Available</div>
                    <div className="font-medium">{facility.availableCapacity} tons</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default FinancialCalculator
