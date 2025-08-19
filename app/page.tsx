'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  Warehouse,
  Users,
  Mic,
  MicOff,
  Globe,
  BarChart3,
  Calendar,
  MapPin,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Thermometer,
  Droplets,
  Sun,
  Brain,
  Truck
} from 'lucide-react'
import toast from 'react-hot-toast'
import UnifiedVoiceControl from '@/components/UnifiedVoiceControl'
import { processVoiceCommand } from '@/lib/voiceProcessor'
import MarketForecast from '@/components/MarketForecast'
import StorageOptimizer from '@/components/StorageOptimizer'
import CooperativeSelling from '@/components/CooperativeSelling'
import WeatherWidget from '@/components/WeatherWidget'
import PriceChart from '@/components/PriceChart'
import AIInsights from '@/components/AIInsights'
import LiveUpdates from '@/components/LiveUpdates'
import { supabase } from '@/lib/supabaseClient'
import { useLanguage } from '@/components/LanguageProvider'
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'
import CropCalendar from '@/components/CropCalendar'
import FinancialCalculator from '@/components/FinancialCalculator'
import SupplyChainTracker from '@/components/SupplyChainTracker'
import { isValidPunjabLocation, getNearestPunjabDistrict } from '@/lib/api'
import AuthGate from '@/components/AuthGate'

// Punjab districts for dropdown
const PUNJAB_DISTRICTS = [
  'Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib',
  'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar', 'Kapurthala',
  'Ludhiana', 'Mansa', 'Moga', 'Muktsar', 'Pathankot',
  'Patiala', 'Rupnagar', 'Sahibzada Ajit Singh Nagar', 'Sangrur', 'Shahid Bhagat Singh Nagar'
]

export default function Home() {
  const { language, setLanguage, t } = useLanguage()
  const [activeTab, setActiveTab] = useState('market')
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'hindi' | 'punjabi'>(language === 'hi' ? 'hindi' : language === 'pa' ? 'punjabi' : 'english')
  useEffect(() => {
    setSelectedLanguage(language === 'hi' ? 'hindi' : language === 'pa' ? 'punjabi' : 'english')
  }, [language])
  const [marketTriggerKey, setMarketTriggerKey] = useState<number>(0)
  const [insightsTriggerKey, setInsightsTriggerKey] = useState<number>(0)
  
  // Form state
  const [userLocation, setUserLocation] = useState('')
  const [userMarket, setUserMarket] = useState('')
  const [currentCrop, setCurrentCrop] = useState('')
  const [cropQuantity, setCropQuantity] = useState('')
  
  // Validation state
  const [locationError, setLocationError] = useState('')
  const [isValidLocation, setIsValidLocation] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  // Handle location input with validation - now accepts any state/district
  const handleLocationChange = (location: string) => {
    setUserLocation(location)
    setLocationError('')
    
    if (location.trim()) {
      // Accept any location for real market data
        setIsValidLocation(true)
        setLocationError('')
    } else {
      setIsValidLocation(false)
      setLocationError('')
    }
  }

  // Handle Enter key press
  const handleEnterPress = () => {
    if (currentCrop && userLocation && userMarket) {
      // Trigger market analysis
      setActiveTab('market')
      toast.success('Starting market analysis...')
      setMarketTriggerKey(Date.now())
      setInsightsTriggerKey(Date.now())
    }
  }

  // Basic auth state (Supabase)
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => setUser(data.user || null))
    const { data: sub } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user || null)
    })
    return () => {
      sub.subscription.unsubscribe()
    }
  }, [])

  // Handle voice commands with enhanced processing and multi-language support
  const handleVoiceCommand = (command: string) => {
    console.log('Processing voice command:', command)
    
    // Enhanced voice command handling with better pattern matching
    const lowerCommand = command.toLowerCase()
    
    // Navigation commands
    if (lowerCommand.includes('go to') || lowerCommand.includes('switch to') || lowerCommand.includes('show') || lowerCommand.includes('open')) {
      if (lowerCommand.includes('market') || lowerCommand.includes('price') || lowerCommand.includes('mandi') || lowerCommand.includes('bhav') || lowerCommand.includes('भाव')) {
        setActiveTab('market')
        toast.success('🎯 Switched to Market Intelligence')
      } else if (lowerCommand.includes('storage') || lowerCommand.includes('warehouse') || lowerCommand.includes('godown') || lowerCommand.includes('गोदाम') || lowerCommand.includes('ਸਟੋਰੇਜ')) {
        setActiveTab('storage')
        toast.success('🏭 Switched to Storage Optimization')
      } else if (lowerCommand.includes('cooperative') || lowerCommand.includes('group') || lowerCommand.includes('sahakari') || lowerCommand.includes('सहकारी') || lowerCommand.includes('ਸਹਕਾਰੀ')) {
        setActiveTab('cooperative')
        toast.success('👥 Switched to Cooperative Selling')
      } else if (lowerCommand.includes('weather') || lowerCommand.includes('climate') || lowerCommand.includes('mausam') || lowerCommand.includes('मौसम') || lowerCommand.includes('ਮੌਸਮ')) {
        setActiveTab('weather')
        toast.success('🌤️ Switched to Weather & Climate')
      } else if (lowerCommand.includes('ai') || lowerCommand.includes('insights') || lowerCommand.includes('intelligence') || lowerCommand.includes('इनसाइट्स') || lowerCommand.includes('ਇਨਸਾਈਟਸ')) {
        setActiveTab('ai')
        toast.success('🧠 Switched to AI Insights')
      } else if (lowerCommand.includes('calendar') || lowerCommand.includes('crop') || lowerCommand.includes('fasal') || lowerCommand.includes('फसल') || lowerCommand.includes('ਫਸਲ')) {
        setActiveTab('calendar')
        toast.success('📅 Switched to Crop Calendar')
      } else if (lowerCommand.includes('finance') || lowerCommand.includes('calculator') || lowerCommand.includes('hisaab') || lowerCommand.includes('हिसाब') || lowerCommand.includes('ਹਿਸਾਬ')) {
        setActiveTab('finance')
        toast.success('💰 Switched to Financial Calculator')
      } else if (lowerCommand.includes('supply') || lowerCommand.includes('chain') || lowerCommand.includes('logistics') || lowerCommand.includes('सप्लाई') || lowerCommand.includes('ਸਪਲਾਈ')) {
        setActiveTab('supplychain')
        toast.success('🚚 Switched to Supply Chain Tracker')
      }
    }
    
    // Action commands
    if (lowerCommand.includes('start analysis') || lowerCommand.includes('analyze') || lowerCommand.includes('shuru karo') || lowerCommand.includes('शुरू करो') || lowerCommand.includes('ਸ਼ੁਰੂ ਕਰੋ')) {
      if (currentCrop && userLocation && userMarket) {
        setActiveTab('market')
        toast.success('🚀 Starting market analysis...')
        // Trigger the analysis
        setTimeout(() => {
          handleEnterPress()
        }, 500)
      } else {
        toast.error('Please fill in crop, district, and market first')
      }
    }
    
    // Help commands
    if (lowerCommand.includes('help') || lowerCommand.includes('what can you do') || lowerCommand.includes('kya kar sakte ho') || lowerCommand.includes('क्या कर सकते हो') || lowerCommand.includes('ਕੀ ਕਰ ਸਕਦੇ ਹੋ')) {
      toast.success('🎤 I can help with navigation, market analysis, weather info, and more! Try saying "go to market" or "start analysis"')
    }
    
    // Fallback to old voice processor for other commands
    try {
    const response = processVoiceCommand(command, 'hi', {
      location: userLocation,
      crop: currentCrop,
      quantity: cropQuantity
    })
    
      if (response.action && !lowerCommand.includes('go to') && !lowerCommand.includes('start analysis')) {
      const action = response.action.toLowerCase()
      if (action.includes('market') || action.includes('price')) {
        setActiveTab('market')
        toast.success('Switched to Market Intelligence')
      } else if (action.includes('storage') || action.includes('warehouse')) {
        setActiveTab('storage')
        toast.success('Switched to Storage Optimization')
      } else if (action.includes('cooperative') || action.includes('group')) {
        setActiveTab('cooperative')
        toast.success('Switched to Cooperative Selling')
      } else if (action.includes('weather')) {
        setActiveTab('weather')
        toast.success('Switched to Weather & Climate')
      } else if (action.includes('ai') || action.includes('insights')) {
        setActiveTab('ai')
        toast.success('Switched to AI Insights')
      } else if (action.includes('calendar') || action.includes('crop')) {
        setActiveTab('calendar')
        toast.success('Switched to Crop Calendar')
      } else if (action.includes('finance') || action.includes('calculator')) {
        setActiveTab('finance')
        toast.success('Switched to Financial Calculator')
      }
      }
    } catch (error) {
      console.log('Voice command processing error:', error)
    }
  }



  const tabs = [
    { id: 'market', label: t('tab.market'), icon: TrendingUp, color: 'text-primary-600' },
    { id: 'storage', label: t('tab.storage'), icon: Warehouse, color: 'text-harvest-600' },
    { id: 'cooperative', label: t('tab.cooperative'), icon: Users, color: 'text-earth-600' },
    { id: 'weather', label: t('tab.weather'), icon: Sun, color: 'text-blue-600' },
    { id: 'ai', label: t('tab.ai'), icon: Brain, color: 'text-purple-600' },
    { id: 'calendar', label: t('tab.calendar'), icon: Calendar, color: 'text-green-600' },
    { id: 'finance', label: t('tab.finance'), icon: DollarSign, color: 'text-yellow-600' },
    { id: 'supplychain', label: t('tab.supply'), icon: Truck, color: 'text-orange-600' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('app.title')}</h1>
                <p className="text-sm text-gray-600">{t('app.subtitle')}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>{t('voice.active')}</span>
              </div>
              {/* Language Selector */}
              <div className="flex items-center space-x-1 text-sm">
                <button
                  onClick={() => { setSelectedLanguage('english'); setLanguage('en') }}
                  className={`px-2 py-1 rounded ${selectedLanguage === 'english' ? 'bg-gray-200' : 'bg-white border'}`}
                >EN</button>
                <button
                  onClick={() => { setSelectedLanguage('hindi'); setLanguage('hi') }}
                  className={`px-2 py-1 rounded ${selectedLanguage === 'hindi' ? 'bg-gray-200' : 'bg-white border'}`}
                >हिं</button>
                <button
                  onClick={() => { setSelectedLanguage('punjabi'); setLanguage('pa') }}
                  className={`px-2 py-1 rounded ${selectedLanguage === 'punjabi' ? 'bg-gray-200' : 'bg-white border'}`}
                >ਪੰ</button>
              </div>
              <AuthGate />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Input Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('enter.details')}</h2>
          
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('field.district')}</label>
              <div className="relative">
                <input
                  type="text"
                   placeholder="Enter district (e.g., Patiala, Ludhiana)"
                  value={userLocation}
                  onChange={(e) => handleLocationChange(e.target.value)}
                   onKeyPress={(e) => e.key === 'Enter' && handleEnterPress()}
                  className={`input-field ${locationError ? 'border-red-300' : isValidLocation ? 'border-green-300' : ''}`}
                />
                {locationError && (
                  <p className="text-red-500 text-sm mt-1">{locationError}</p>
                )}
                {isValidLocation && (
                  <p className="text-green-500 text-sm mt-1 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                     Ready for market analysis
                  </p>
                )}
              </div>
            </div>
            
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">{t('field.crop.any')}</label>
               <input
                 type="text"
                 placeholder="e.g., Wheat, Rice, Potato, Tomato, Banana..."
                value={currentCrop}
                onChange={(e) => setCurrentCrop(e.target.value)}
                 onKeyPress={(e) => e.key === 'Enter' && handleEnterPress()}
                 className="input-field"
               />
               <small className="text-gray-500 text-xs mt-1">Enter any crop name for real market data</small>
             </div>
             
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">{t('field.market')}</label>
               <input
                 type="text"
                 placeholder="e.g., Rajpura, Ghanaur, Amritsar Mandi..."
                 value={userMarket}
                 onChange={(e) => setUserMarket(e.target.value)}
                 onKeyPress={(e) => e.key === 'Enter' && handleEnterPress()}
                className="input-field"
               />
               <small className="text-gray-500 text-xs mt-1">Enter specific market/mandi name</small>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('field.quantity.tons')}</label>
              <input
                type="number"
                placeholder="Enter quantity"
                value={cropQuantity}
                onChange={(e) => setCropQuantity(e.target.value)}
                 onKeyPress={(e) => e.key === 'Enter' && handleEnterPress()}
                className="input-field"
                min="1"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 text-center">
            <button
              onClick={handleEnterPress}
              disabled={!currentCrop || !userLocation || !userMarket}
              className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                !currentCrop || !userLocation || !userMarket
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>🚀</span>
                <span>{t('cta.start')}</span>
              </div>
            </button>
            <p className="text-sm text-gray-500 mt-2">
              {t('hint.press.enter')}
            </p>
          </div>

          {!isValidLocation && userLocation && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                <div>
                  <h4 className="font-medium text-yellow-800">Location Required</h4>
                  <p className="text-yellow-700 text-sm">
                    Please enter a valid location (district and state) to get real market data.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-lg border-2 border-green-300'
                  : 'bg-white/70 text-gray-600 hover:bg-white hover:text-gray-900'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${tab.color}`} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'market' && (
            <MarketForecast
              crop={currentCrop}
               location={`${userLocation},${userMarket},Punjab`}
              quantity={cropQuantity}
              isValidLocation={isValidLocation}
              triggerFetchKey={marketTriggerKey}
            />
          )}
          {activeTab === 'storage' && (
            <StorageOptimizer
              crop={currentCrop}
              location={userLocation}
              quantity={cropQuantity}
              isValidLocation={isValidLocation}
            />
          )}
          {activeTab === 'cooperative' && (
            user ? (
              <CooperativeSelling
                crop={currentCrop}
                location={userLocation}
                quantity={cropQuantity}
                isValidLocation={isValidLocation}
              />
            ) : (
              <div className="card text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Sign in required</h3>
                <p className="text-gray-500">Please sign in from the header to view and use Cooperative Selling.</p>
              </div>
            )
          )}
          {activeTab === 'weather' && (
            <WeatherWidget
              location={userLocation}
              isValidLocation={isValidLocation}
            />
          )}
          {activeTab === 'ai' && (
            <AIInsights
              crop={currentCrop}
              location={userLocation}
              quantity={cropQuantity}
              isValidLocation={isValidLocation}
              selectedLanguage={selectedLanguage as 'english' | 'hindi' | 'punjabi'}
              triggerKey={insightsTriggerKey}
            />
          )}
          {activeTab === 'calendar' && (
            <CropCalendar
              location={userLocation}
              isValidLocation={isValidLocation}
            />
          )}
          {activeTab === 'finance' && (
            <FinancialCalculator
              location={userLocation}
              isValidLocation={isValidLocation}
            />
          )}
          {activeTab === 'supplychain' && (
            <SupplyChainTracker
              crop={currentCrop}
              location={userLocation}
              quantity={cropQuantity}
              isValidLocation={isValidLocation}
            />
          )}
        </motion.div>

        {/* Live Updates */}
        <LiveUpdates />
      </main>

      {/* Unified Voice Control */}
                      <UnifiedVoiceControl
                  onCommandAction={handleVoiceCommand}
                  location={userLocation}
                  crop={currentCrop}
                  quantity={cropQuantity}
                  isValidLocation={isValidLocation}
                  uiLanguage={selectedLanguage === 'hindi' ? 'hi' : selectedLanguage === 'punjabi' ? 'pa' : 'en'}
                />
    </div>
  )
}
