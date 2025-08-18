'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Warehouse, 
  DollarSign, 
  MapPin, 
  Clock, 
  Truck, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  Thermometer,
  Droplets,
  Package,
  Calculator
} from 'lucide-react'
import { getStorageFacilities, getAIRecommendations, bookStorageCapacity, getGroupStorageQuote, checkLoanEligibility } from '@/lib/api'

interface StorageOptimizerProps {
  crop: string
  location: string
  quantity: string
  isValidLocation: boolean
}

interface Warehouse {
  id: string
  name: string
  location: string
  distance: number
  capacity: number
  availableCapacity: number
  costPerTon: number
  facilities: string[]
  rating: number
  contact: string
}

interface StorageRecommendation {
  warehouse: Warehouse
  storageDuration: number
  totalCost: number
  riskScore: number
  recommendation: string
}

const StorageOptimizer = ({ crop, location, quantity }: StorageOptimizerProps) => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [recommendations, setRecommendations] = useState<StorageRecommendation[]>([])
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null)
  const [loading, setLoading] = useState(false)
  const [showBooking, setShowBooking] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null)
  const [farmerName, setFarmerName] = useState('')
  const [phone, setPhone] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  // Default to optimal sorting; remove Sort UI to declutter
  const [sortPreference, setSortPreference] = useState<'optimal' | 'cheapest' | 'nearest' | 'capacity'>('optimal')
  const [groupQuote, setGroupQuote] = useState<any | null>(null)
  const [loanOffers, setLoanOffers] = useState<any | null>(null)
  const [groupRefreshing, setGroupRefreshing] = useState<boolean>(false)
  const [loanRefreshing, setLoanRefreshing] = useState<boolean>(false)

  // Mock data - in real app, this would come from APIs
  const mockWarehouses: Warehouse[] = [
    {
      id: '1',
      name: 'Punjab State Warehousing Corporation',
      location: 'Amritsar',
      distance: 25,
      capacity: 10000,
      availableCapacity: 3500,
      costPerTon: 120,
      facilities: ['Temperature Control', 'Humidity Control', 'Pest Control', '24/7 Security'],
      rating: 4.8,
      contact: '+91-98765-43210'
    },
    {
      id: '2',
      name: 'FCI Storage Complex',
      location: 'Jalandhar',
      distance: 45,
      capacity: 15000,
      availableCapacity: 8000,
      costPerTon: 95,
      facilities: ['Basic Storage', 'Security', 'Loading Dock'],
      rating: 4.2,
      contact: '+91-98765-43211'
    },
    {
      id: '3',
      name: 'Private Cold Storage',
      location: 'Ludhiana',
      distance: 65,
      capacity: 5000,
      availableCapacity: 2000,
      costPerTon: 180,
      facilities: ['Cold Storage', 'Temperature Control', 'Humidity Control', 'Advanced Pest Control'],
      rating: 4.9,
      contact: '+91-98765-43212'
    }
  ]

  const cropShelfLife: { [key: string]: number } = {
    wheat: 365,
    rice: 730,
    cotton: 180,
    sugarcane: 30,
    potato: 120,
    tomato: 14
  }

  const cropStorageRequirements: { [key: string]: { temp: string, humidity: string } } = {
    wheat: { temp: '15-20°C', humidity: '12-14%' },
    rice: { temp: '10-15°C', humidity: '12-14%' },
    cotton: { temp: '20-25°C', humidity: '8-10%' },
    sugarcane: { temp: '5-10°C', humidity: '85-90%' },
    potato: { temp: '8-12°C', humidity: '85-90%' },
    tomato: { temp: '10-15°C', humidity: '90-95%' }
  }

  useEffect(() => {
    const fetchStorageData = async () => {
      if (crop && location && quantity) {
        setLoading(true)
        try {
          // Fetch real storage facility data
          const apiWarehouses = await getStorageFacilities(location)
          const aiRecommendation = await getAIRecommendations(crop, location, parseInt(quantity) || 0)
          
          // Transform API data to component format
          const transformedWarehouses = (apiWarehouses || []).map((warehouse: any) => ({
            ...warehouse,
            facilities: warehouse.facilities || ['Basic Storage', 'Security']
          }))
          
          const listToUse = transformedWarehouses.length > 0 ? transformedWarehouses : mockWarehouses
          setWarehouses(listToUse)

          // Generate recommendations with current list
          setTimeout(() => {
            generateRecommendationsFor(listToUse)
            setLoading(false)
          }, 200)
        } catch (error) {
          console.error('Error fetching storage data:', error)
          // Fallback to mock data
          setWarehouses(mockWarehouses)
          setTimeout(() => {
            generateRecommendationsFor(mockWarehouses)
            setLoading(false)
          }, 500)
        }
      }
    }
    
    fetchStorageData()
  }, [crop, location, quantity])

  // Auto-refresh group quote when crop/location/quantity change
  useEffect(() => {
    const refresh = async () => {
      try {
        setGroupRefreshing(true)
        const q = parseInt(quantity) || 0
        if (!q) {
          setGroupQuote(null)
          return
        }
        const quote = await getGroupStorageQuote({ crop, location, quantity: q })
        setGroupQuote(quote)
      } catch (e) {
        console.error(e)
      } finally {
        setGroupRefreshing(false)
      }
    }
    if (crop && location && quantity) refresh()
  }, [crop, location, quantity])

  // Auto-recalc loan offers when warehouse selection changes
  useEffect(() => {
    const recalcLoans = async () => {
      try {
        setLoanRefreshing(true)
        let target = selectedWarehouse || recommendations[0]?.warehouse || warehouses[0] || null
        const q = parseInt(quantity) || 0
        if (!target || !q) {
          setLoanOffers(null)
          return
        }
        const offers = await checkLoanEligibility({
          farmerName: farmerName || 'Punjab Farmer',
          phone: phone || '+91-99999-99999',
          crop,
          location,
          storedQuantity: q,
          warehouseId: target.id
        })
        setLoanOffers(offers)
      } catch (e) {
        console.error(e)
      } finally {
        setLoanRefreshing(false)
      }
    }
    if (crop && location && quantity) recalcLoans()
  }, [selectedWarehouse, recommendations, warehouses, crop, location, quantity])

  const generateRecommendationsFor = (list: Warehouse[]) => {
    const cropLife = cropShelfLife[crop] || 30
    const recs = list.map(warehouse => {
      const storageCost = parseInt(quantity) * warehouse.costPerTon
      const transportCost = warehouse.distance * 2 * parseInt(quantity) // ₹2 per km per ton
      const totalCost = storageCost + transportCost
      
      // Calculate optimal storage duration (considering shelf life and market conditions)
      const optimalDuration = Math.min(cropLife, 90) // Max 90 days for demo
      const riskScore = calculateRiskScore(warehouse, optimalDuration)
      
      let recommendation = ''
      if (riskScore < 30) {
        recommendation = 'Excellent choice for long-term storage'
      } else if (riskScore < 60) {
        recommendation = 'Good option with moderate risk'
      } else {
        recommendation = 'Consider alternatives or shorter storage period'
      }

      return {
        warehouse,
        storageDuration: optimalDuration,
        totalCost,
        riskScore,
        recommendation
      }
    })

    // Sort based on preference
    if (sortPreference === 'cheapest') {
      recs.sort((a, b) => a.totalCost - b.totalCost)
    } else if (sortPreference === 'nearest') {
      recs.sort((a, b) => a.warehouse.distance - b.warehouse.distance)
    } else if (sortPreference === 'capacity') {
      recs.sort((a, b) => b.warehouse.availableCapacity - a.warehouse.availableCapacity)
    } else {
      // optimal: composite score (lower is better)
      recs.sort((a, b) => (
        (a.totalCost + a.warehouse.distance * 50 - a.warehouse.availableCapacity * 0.05 + a.riskScore * 10)
        -
        (b.totalCost + b.warehouse.distance * 50 - b.warehouse.availableCapacity * 0.05 + b.riskScore * 10)
      ))
    }

    setRecommendations(recs)
  }
  const generateRecommendations = () => generateRecommendationsFor(warehouses)

  const calculateRiskScore = (warehouse: Warehouse, duration: number): number => {
    let score = 0
    
    // Distance risk (longer distance = higher risk)
    score += warehouse.distance * 0.5
    
    // Capacity risk (lower available capacity = higher risk)
    const capacityUtilization = (warehouse.capacity - warehouse.availableCapacity) / warehouse.capacity
    score += capacityUtilization * 30
    
    // Facility risk (missing critical facilities)
    if (!warehouse.facilities.includes('Temperature Control')) score += 15
    if (!warehouse.facilities.includes('Humidity Control')) score += 15
    if (!warehouse.facilities.includes('Pest Control')) score += 10
    
    // Duration risk (longer storage = higher risk)
    score += duration * 0.2
    
    return Math.min(score, 100)
  }

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-600 bg-green-100'
    if (score < 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  if (!crop || !location || !quantity) {
    return (
      <div className="card text-center py-12">
        <Warehouse className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Select Crop & Location</h3>
        <p className="text-gray-500">Choose your crop and location to see storage recommendations</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="card text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Analyzing storage options...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Storage Overview */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Storage Optimization</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Crop Shelf Life</p>
            <p className="text-2xl font-bold text-blue-700">{cropShelfLife[crop] || 30} days</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
            <Thermometer className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Optimal Temperature</p>
            <p className="text-lg font-bold text-green-700">{cropStorageRequirements[crop]?.temp || 'N/A'}</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
            <Droplets className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Optimal Humidity</p>
            <p className="text-lg font-bold text-purple-700">{cropStorageRequirements[crop]?.humidity || 'N/A'}</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-orange-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-orange-800 mb-1">Storage Advisory</h4>
              <p className="text-orange-700 text-sm">
                {crop} has a shelf life of {cropShelfLife[crop] || 30} days. 
                Consider market conditions and storage costs before deciding to store vs. sell immediately.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Warehouse Recommendations */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Recommended Storage Facilities</h3>
        
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div
              key={rec.warehouse.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedWarehouse?.id === rec.warehouse.id 
                  ? 'border-primary-300 bg-primary-50' 
                  : 'border-gray-200 hover:border-primary-200'
              }`}
              onClick={() => setSelectedWarehouse(rec.warehouse)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-800">{rec.warehouse.name}</h4>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm text-gray-600">{rec.warehouse.rating}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Location:</span>
                      <p className="font-medium">{rec.warehouse.location} ({rec.warehouse.distance} km)</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Cost:</span>
                      <p className="font-medium">₹{rec.warehouse.costPerTon}/ton/month</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Available:</span>
                      <p className="font-medium">{rec.warehouse.availableCapacity.toLocaleString()} tons</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Cost:</span>
                      <p className="font-medium text-primary-600">₹{rec.totalCost.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(rec.riskScore)}`}>
                        Risk: {rec.riskScore.toFixed(0)}%
                      </span>
                      <span className="text-sm text-gray-600">
                        Optimal Duration: {rec.storageDuration} days
                      </span>
                    </div>
                    <button
                      className="btn-primary text-sm py-2 px-4"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedWarehouse(rec.warehouse)
                        setShowBooking(true)
                        setBookingError(null)
                        setBookingSuccess(null)
                      }}
                    >
                      Select & Book
                    </button>
                  </div>
                </div>
              </div>

              {/* Facilities */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-600 mb-2">Facilities:</p>
                <div className="flex flex-wrap gap-2">
                  {rec.warehouse.facilities.map((facility, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                    >
                      {facility}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Removed Sort Controls for cleaner UI */}

      {/* Group Storage (Pooling) */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-800">Group Storage (Bulk Rates)</h3>
          <button
            className="btn-primary py-2 px-4"
            onClick={async () => {
              try {
                setGroupRefreshing(true)
                const q = parseInt(quantity) || 0
                if (q <= 0) return
                const quote = await getGroupStorageQuote({ crop, location, quantity: q })
                setGroupQuote(quote)
              } catch (e) {
                console.error(e)
              } finally {
                setGroupRefreshing(false)
              }
            }}
          >
            {groupRefreshing ? 'Refreshing…' : 'Get Group Quote'}
          </button>
        </div>
        {groupQuote && (
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Your Quantity</div>
                <div className="font-medium">{groupQuote.yourQuantity} tons</div>
              </div>
              <div>
                <div className="text-gray-600">Pooled Quantity</div>
                <div className="font-medium">{groupQuote.pooledQuantity} tons</div>
              </div>
              <div>
                <div className="text-gray-600">Discount</div>
                <div className="font-medium">{groupQuote.discountPercent}%</div>
              </div>
              <div>
                <div className="text-gray-600">Priority Slot</div>
                <div className="font-medium">{groupQuote.prioritySlot}</div>
              </div>
              <div>
                <div className="text-gray-600">Base Rate</div>
                <div className="font-medium">₹{groupQuote.rates.baseRatePerTon}/ton</div>
              </div>
              <div>
                <div className="text-gray-600">Discounted Rate</div>
                <div className="font-medium text-green-700">₹{groupQuote.rates.discountedRatePerTon}/ton</div>
              </div>
            </div>
            <div className="mt-3 text-sm text-green-700">Estimated Savings: ₹{groupQuote.expectedSavings.toLocaleString()}</div>
            <div className="mt-3">
              <div className="text-gray-700 font-medium mb-1">Nearby participants</div>
              <div className="flex flex-wrap gap-2">
                {groupQuote.participants.map((p: any, idx: number) => (
                  <span key={idx} className="px-2 py-1 bg-white border rounded text-gray-700">
                    {p.name} ({p.village}, {p.distanceKm} km, {p.quantity}t)
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">Request group booking</button>
              <span className="text-xs text-blue-800">Auto-updates when crop/location/quantity changes</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Collateralized Storage Loan */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-800">Collateralized Storage Loan</h3>
          <button
            className="btn-primary py-2 px-4"
            onClick={async () => {
              try {
                let target = selectedWarehouse || recommendations[0]?.warehouse || warehouses[0] || null
                if (!target) {
                  console.error('No warehouse available for loan eligibility')
                  return
                }
                const q = parseInt(quantity) || 0
                const offers = await checkLoanEligibility({
                  farmerName: farmerName || 'Punjab Farmer',
                  phone: phone || '+91-99999-99999',
                  crop,
                  location,
                  storedQuantity: q,
                  warehouseId: target.id
                })
                setLoanOffers(offers)
              } catch (e) {
                console.error(e)
              }
            }}
          >
            {loanRefreshing ? 'Recalculating…' : 'Check Eligibility'}
          </button>
        </div>
        {loanOffers && (
          <div className="bg-green-50 border border-green-200 rounded p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Max LTV</div>
                <div className="font-medium">{Math.round(loanOffers.ltv * 100)}%</div>
              </div>
              <div>
                <div className="text-gray-600">Collateral Value</div>
                <div className="font-medium">₹{loanOffers.collateralValue.toLocaleString()}</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              {loanOffers.offers.map((o: any, idx: number) => (
                <div key={idx} className="bg-white border rounded p-3 text-sm relative">
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xxs bg-green-100 text-green-700 border border-green-200">Eligible</span>
                  <div className="font-medium mb-1">{o.months} months</div>
                  <div>Principal: ₹{o.principal.toLocaleString()}</div>
                  <div>APR: {o.apr}%</div>
                  <div>Interest: ₹{o.interest.toLocaleString()}</div>
                  <div>Processing fee: ₹{o.processingFee.toLocaleString()}</div>
                  <div className="font-semibold mt-1">Total: ₹{o.totalRepayable.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 mt-1">Docs: {o.requiredDocs.join(', ')}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-gray-600">Disbursal: {loanOffers.offers[0]?.disbursalETA}</div>
          </div>
        )}
      </motion.div>

      {/* Booking Modal */}
      {showBooking && selectedWarehouse && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Book Storage</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowBooking(false)}>✕</button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-gray-600">Warehouse</div>
                <div className="font-medium">{selectedWarehouse.name}</div>
                <div className="text-gray-500">Available: {selectedWarehouse.availableCapacity.toLocaleString()} tons</div>
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Farmer Name</label>
                <input className="w-full border rounded px-3 py-2" value={farmerName} onChange={(e) => setFarmerName(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Phone</label>
                <input className="w-full border rounded px-3 py-2" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 mb-1">From</label>
                  <input type="date" className="w-full border rounded px-3 py-2" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">To</label>
                  <input type="date" className="w-full border rounded px-3 py-2" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                </div>
              </div>
              {bookingError && (
                <div className="text-sm text-red-600">{bookingError}</div>
              )}
              {bookingSuccess && (
                <div className="text-sm text-green-600">{bookingSuccess}</div>
              )}
              <button
                className={`w-full btn-primary py-2 ${isBooking ? 'opacity-70' : ''}`}
                disabled={isBooking}
                onClick={async () => {
                  try {
                    setIsBooking(true)
                    setBookingError(null)
                    setBookingSuccess(null)
                    const qty = parseInt(quantity) || 0
                    if (qty <= 0) {
                      setBookingError('Invalid quantity')
                      setIsBooking(false)
                      return
                    }
                    const result = await bookStorageCapacity({
                      warehouseId: selectedWarehouse.id,
                      quantity: qty,
                      availableCapacity: selectedWarehouse.availableCapacity,
                      farmerName,
                      phone,
                      fromDate,
                      toDate
                    })
                    // Update local capacity state
                    setWarehouses(prev => prev.map(w => w.id === selectedWarehouse.id ? { ...w, availableCapacity: result.updatedAvailableCapacity } : w))
                    setRecommendations(prev => prev.map(r => r.warehouse.id === selectedWarehouse.id ? { ...r, warehouse: { ...r.warehouse, availableCapacity: result.updatedAvailableCapacity } } : r))
                    setBookingSuccess(`Booked successfully. Booking ID: ${result.bookingId}`)
                  } catch (err: any) {
                    setBookingError(err?.message || 'Booking failed')
                  } finally {
                    setIsBooking(false)
                  }
                }}
              >
                {isBooking ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cost Analysis */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Cost-Benefit Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Storage Costs Breakdown</h4>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Storage Fee (3 months)</span>
                <span className="font-medium">₹{(parseInt(quantity) * 120 * 3).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Transportation</span>
                <span className="font-medium">₹{(parseInt(quantity) * 25 * 2).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Insurance</span>
                <span className="font-medium">₹{(parseInt(quantity) * 50).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 font-semibold text-lg">
                <span>Total Storage Cost</span>
                <span className="text-red-600">₹{((parseInt(quantity) * 120 * 3) + (parseInt(quantity) * 25 * 2) + (parseInt(quantity) * 50)).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Revenue Comparison</h4>
            <div className="space-y-3">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-green-800">Sell Now</span>
                  <span className="text-sm text-green-600">Immediate</span>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  ₹{(parseInt(quantity) * 1950).toLocaleString()}
                </p>
                <p className="text-sm text-green-600">Current market price</p>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-blue-800">Store & Sell Later</span>
                  <span className="text-sm text-blue-600">3 months</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">
                  ₹{(parseInt(quantity) * 2100).toLocaleString()}
                </p>
                <p className="text-sm text-blue-600">Expected future price</p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Net Profit from Storage</span>
                <span className="text-lg font-bold text-green-600">
                  ₹{((parseInt(quantity) * 2100) - (parseInt(quantity) * 1950) - ((parseInt(quantity) * 120 * 3) + (parseInt(quantity) * 25 * 2) + (parseInt(quantity) * 50))).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Storage Tips */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Storage Best Practices</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-800">Pre-storage Preparation</h4>
                <p className="text-sm text-gray-600">Ensure crop is properly dried and cleaned before storage</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-800">Regular Monitoring</h4>
                <p className="text-sm text-gray-600">Check temperature, humidity, and pest activity weekly</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-800">Insurance Coverage</h4>
                <p className="text-sm text-gray-600">Protect your stored crop against fire, theft, and natural disasters</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-800">Risk Factors</h4>
                <p className="text-sm text-gray-600">Market price fluctuations, storage quality, and crop deterioration</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-800">Exit Strategy</h4>
                <p className="text-sm text-gray-600">Have a plan to sell quickly if prices drop unexpectedly</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-800">Quality Maintenance</h4>
                <p className="text-sm text-gray-600">Poor storage can reduce crop quality and market value</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default StorageOptimizer
