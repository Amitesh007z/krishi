'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  DollarSign, 
  MapPin, 
  Clock, 
  Truck, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  MessageCircle,
  Phone,
  TrendingUp,
  HeartHandshake,
  Target
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

interface CooperativeSellingProps {
  crop: string
  location: string
  quantity: string
  isValidLocation: boolean
}

interface Farmer {
  id: string
  name: string
  location: string
  distance: number
  crop: string
  quantity: number
  harvestDate: string
  contact: string
  rating: number
  isOnline: boolean
}

interface CooperativeGroup {
  id: string
  name: string
  totalQuantity: number
  farmers: Farmer[]
  estimatedPrice: number
  buyers: string[]
  status: 'forming' | 'ready' | 'negotiating' | 'sold'
  createdAt: string
}

const CooperativeSelling = ({ crop, location, quantity }: CooperativeSellingProps) => {
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [cooperativeGroups, setCooperativeGroups] = useState<CooperativeGroup[]>([])
  const [selectedGroup, setSelectedGroup] = useState<CooperativeGroup | null>(null)
  const [loading, setLoading] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [realtimeNotifications, setRealtimeNotifications] = useState<any[]>([])

  // Mock data - in real app, this would come from APIs
  const mockFarmers: Farmer[] = [
    {
      id: '1',
      name: 'Gurpreet Singh',
      location: 'Amritsar',
      distance: 5,
      crop: 'wheat',
      quantity: 15,
      harvestDate: '2024-01-15',
      contact: '+91-98765-43210',
      rating: 4.8,
      isOnline: true
    },
    {
      id: '2',
      name: 'Rajinder Kaur',
      location: 'Amritsar',
      distance: 8,
      crop: 'wheat',
      quantity: 12,
      harvestDate: '2024-01-18',
      contact: '+91-98765-43211',
      rating: 4.6,
      isOnline: false
    },
    {
      id: '3',
      name: 'Balwinder Singh',
      location: 'Amritsar',
      distance: 12,
      crop: 'wheat',
      quantity: 20,
      harvestDate: '2024-01-20',
      contact: '+91-98765-43212',
      rating: 4.9,
      isOnline: true
    },
    {
      id: '4',
      name: 'Kuldeep Kaur',
      location: 'Amritsar',
      distance: 15,
      crop: 'wheat',
      quantity: 18,
      harvestDate: '2024-01-22',
      contact: '+91-98765-43213',
      rating: 4.7,
      isOnline: false
    }
  ]

  const mockGroups: CooperativeGroup[] = [
    {
      id: '1',
      name: 'Amritsar Wheat Cooperative',
      totalQuantity: 65,
      farmers: mockFarmers,
      estimatedPrice: 2050,
      buyers: ['Punjab State Food Corporation', 'Private Traders Association'],
      status: 'ready',
      createdAt: '2024-01-10'
    }
  ]

  useEffect(() => {
    if (crop && location) {
      setLoading(true)
      // Simulate API call
      setTimeout(() => {
        setFarmers(mockFarmers)
        setCooperativeGroups(mockGroups)
        setLoading(false)
      }, 1000)
    }
  }, [crop, location])

  // Subscribe to realtime notifications (demo for 2-demo-users scenario)
  useEffect(() => {
    if (!supabase) return
    const channel = supabase
      .channel('public:coop_notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'coop_notifications' },
        (payload) => {
          setRealtimeNotifications((prev) => [payload.new, ...prev].slice(0, 20))
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'forming':
        return 'text-blue-600 bg-blue-100'
      case 'ready':
        return 'text-green-600 bg-green-100'
      case 'negotiating':
        return 'text-yellow-600 bg-yellow-100'
      case 'sold':
        return 'text-purple-600 bg-purple-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'forming':
        return <Users className="w-4 h-4" />
      case 'ready':
        return <CheckCircle className="w-4 h-4" />
      case 'negotiating':
        return <HeartHandshake className="w-4 h-4" />
      case 'sold':
        return <TrendingUp className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const calculateCollectiveBenefits = (group: CooperativeGroup) => {
    const individualPrice = 1950 // Current market price
    const collectivePrice = group.estimatedPrice
    const totalRevenue = group.totalQuantity * collectivePrice
    const individualRevenue = group.totalQuantity * individualPrice
    const benefit = totalRevenue - individualRevenue
    
    return {
      totalRevenue,
      individualRevenue,
      benefit,
      benefitPerTon: benefit / group.totalQuantity
    }
  }

  if (!crop || !location) {
    return (
      <div className="card text-center py-12">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Select Crop & Location</h3>
        <p className="text-gray-500">Choose your crop and location to see cooperative opportunities</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="card text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Finding cooperative opportunities...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cooperative Overview */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Cooperative Selling</h2>
          <button
            onClick={() => setShowCreateGroup(!showCreateGroup)}
            className="btn-primary"
          >
            Create New Group
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Available Farmers</p>
            <p className="text-3xl font-bold text-blue-700">{farmers.length}</p>
            <p className="text-sm text-gray-500">in your area</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
            <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Total Quantity</p>
            <p className="text-3xl font-bold text-green-700">{farmers.reduce((sum, f) => sum + f.quantity, 0)} tons</p>
            <p className="text-sm text-gray-500">available</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
            <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Price Premium</p>
            <p className="text-2xl font-bold text-purple-700">+5.1%</p>
            <p className="text-sm text-gray-500">collective selling</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
            <HeartHandshake className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Active Groups</p>
            <p className="text-3xl font-bold text-orange-700">{cooperativeGroups.length}</p>
            <p className="text-sm text-gray-500">ready to sell</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-4 rounded-lg border border-primary-200">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-primary-800 mb-1">Why Cooperative Selling?</h4>
              <p className="text-primary-700 text-sm">
                Pool your produce with other farmers to achieve better prices, reduce transportation costs, 
                and gain stronger bargaining power with buyers. Collective selling typically yields 3-8% higher prices.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Create Group Form */}
      {showCreateGroup && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="card"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Create New Cooperative Group</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., Amritsar Wheat Cooperative"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Quantity (tons)</label>
              <input
                type="number"
                className="input-field"
                placeholder="e.g., 50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Price (₹/quintal)</label>
              <input
                type="number"
                className="input-field"
                placeholder="e.g., 2100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Deadline to Join</label>
              <input
                type="date"
                className="input-field"
              />
            </div>
          </div>
          
          <div className="mt-4 flex space-x-3">
            <button
              className="btn-primary"
              onClick={async () => {
                try {
                  await fetch('/api/coop/notify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      groupId: 'new',
                      groupName: 'New Cooperative Group',
                      message: 'New group created'
                    })
                  })
                } catch (e) {
                  console.error(e)
                }
              }}
            >
              Create Group
            </button>
            <button 
              onClick={() => setShowCreateGroup(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Available Farmers */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Available Farmers in Your Area</h3>
        
        <div className="space-y-4">
          {farmers.map((farmer) => (
            <div
              key={farmer.id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {farmer.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{farmer.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{farmer.location} ({farmer.distance} km)</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Harvest: {new Date(farmer.harvestDate).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm text-gray-600">{farmer.rating}</span>
                    <div className={`w-2 h-2 rounded-full ${farmer.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                  </div>
                  <p className="font-semibold text-gray-800">{farmer.quantity} tons</p>
                  <p className="text-sm text-gray-600">{farmer.crop}</p>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700">
                    <MessageCircle className="w-4 h-4" />
                    <span>Message</span>
                  </button>
                  <button className="flex items-center space-x-2 text-sm text-green-600 hover:text-green-700">
                    <Phone className="w-4 h-4" />
                    <span>Call</span>
                  </button>
                </div>
                <button className="btn-primary text-sm py-2 px-4">
                  Invite to Group
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Cooperative Groups */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Active Cooperative Groups</h3>
        
        <div className="space-y-4">
          {cooperativeGroups.map((group) => {
            const benefits = calculateCollectiveBenefits(group)
            return (
              <div
                key={group.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedGroup?.id === group.id 
                    ? 'border-primary-300 bg-primary-50' 
                    : 'border-gray-200 hover:border-primary-200'
                }`}
                onClick={() => setSelectedGroup(group)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">{group.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{group.farmers.length} farmers</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Target className="w-4 h-4" />
                        <span>{group.totalQuantity} tons</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>₹{group.estimatedPrice}/quintal</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(group.status)}`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(group.status)}
                        <span className="capitalize">{group.status}</span>
                      </div>
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Created: {new Date(group.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-600 mb-1">Total Revenue</p>
                    <p className="text-lg font-bold text-green-700">₹{benefits.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-600 mb-1">Collective Benefit</p>
                    <p className="text-lg font-bold text-blue-700">₹{benefits.benefit.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-purple-600 mb-1">Per Ton Benefit</p>
                    <p className="text-lg font-bold text-purple-700">₹{benefits.benefitPerTon.toFixed(0)}</p>
                  </div>
                </div>

                {/* Buyers */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Interested Buyers:</p>
                  <div className="flex flex-wrap gap-2">
                    {group.buyers.map((buyer, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        {buyer}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <button className="btn-secondary text-sm py-2 px-4">
                    View Details
                  </button>
                  <button
                    className="btn-primary text-sm py-2 px-4"
                    onClick={async () => {
                      try {
                        await fetch('/api/coop/notify', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            groupId: group.id,
                            groupName: group.name,
                            message: `Join request for ${group.name}`
                          })
                        })
                      } catch (e) {
                        console.error(e)
                      }
                    }}
                  >
                    Join Group
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Realtime Notifications */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="card"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Notifications</h3>
        {realtimeNotifications.length === 0 ? (
          <p className="text-sm text-gray-500">No notifications yet. Actions from another user will appear here.</p>
        ) : (
          <div className="space-y-2">
            {realtimeNotifications.map((n, idx) => (
              <div key={idx} className="p-3 border border-gray-200 rounded text-sm">
                <div className="font-medium">{n.group_name}</div>
                <div className="text-gray-700">{n.message}</div>
                <div className="text-xs text-gray-500">{new Date(n.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Benefits Explanation */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">How Cooperative Selling Works</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700 text-lg">Benefits</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h5 className="font-medium text-gray-800">Better Prices</h5>
                  <p className="text-sm text-gray-600">Collective bargaining power leads to 3-8% higher prices</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h5 className="font-medium text-gray-800">Reduced Costs</h5>
                  <p className="text-sm text-gray-600">Shared transportation and logistics costs</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h5 className="font-medium text-gray-800">Market Access</h5>
                  <p className="text-sm text-gray-600">Access to larger buyers and export markets</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700 text-lg">Process</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                <p className="text-sm text-gray-600">Farmers join or create a cooperative group</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                <p className="text-sm text-gray-600">Group negotiates with buyers collectively</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                <p className="text-sm text-gray-600">Coordinated delivery and payment distribution</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default CooperativeSelling
