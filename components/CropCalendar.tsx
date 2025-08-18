'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Sun, CloudRain, Thermometer } from 'lucide-react'

interface CropSeason {
  crop: string
  sowingStart: string
  sowingEnd: string
  harvestingStart: string
  harvestingEnd: string
  duration: number
  waterRequirement: string
  temperature: string
  description: string
  tips: string[]
}

interface CropCalendarProps {
  location: string
  isValidLocation: boolean
}

const CropCalendar = ({ location, isValidLocation }: CropCalendarProps) => {
  const [selectedCrop, setSelectedCrop] = useState('wheat')
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())

  const punjabCrops: CropSeason[] = [
    {
      crop: 'wheat',
      sowingStart: 'October',
      sowingEnd: 'December',
      harvestingStart: 'March',
      harvestingEnd: 'May',
      duration: 150,
      waterRequirement: 'Medium (400-500mm)',
      temperature: '15-25°C (Optimal)',
      description: 'Rabi season crop, Punjab\'s primary winter crop',
      tips: [
        'Sow when soil temperature is 15-20°C',
        'Ensure proper irrigation during tillering stage',
        'Monitor for yellow rust disease',
        'Harvest when grain moisture is 20-25%'
      ]
    },
    {
      crop: 'rice',
      sowingStart: 'May',
      sowingEnd: 'July',
      harvestingStart: 'September',
      harvestingEnd: 'November',
      duration: 120,
      waterRequirement: 'High (1000-1500mm)',
      temperature: '25-35°C (Optimal)',
      description: 'Kharif season crop, major summer crop in Punjab',
      tips: [
        'Transplant seedlings 25-30 days after sowing',
        'Maintain 5-7cm water level in field',
        'Apply nitrogen in split doses',
        'Harvest when 80% grains are golden yellow'
      ]
    },
    {
      crop: 'cotton',
      sowingStart: 'April',
      sowingEnd: 'May',
      harvestingStart: 'October',
      harvestingEnd: 'December',
      duration: 180,
      waterRequirement: 'Medium-High (600-800mm)',
      temperature: '25-35°C (Optimal)',
      description: 'Long duration crop, important cash crop',
      tips: [
        'Sow when soil temperature reaches 20°C',
        'Control bollworm with IPM practices',
        'Defoliate before harvesting',
        'Pick cotton in 2-3 rounds'
      ]
    },
    {
      crop: 'sugarcane',
      sowingStart: 'February',
      sowingEnd: 'March',
      harvestingStart: 'November',
      harvestingEnd: 'March',
      duration: 300,
      waterRequirement: 'High (1500-2000mm)',
      temperature: '25-35°C (Optimal)',
      description: 'Perennial crop, 12-18 month cycle',
      tips: [
        'Plant healthy 3-budded setts',
        'Maintain adequate soil moisture',
        'Apply micronutrients for better yield',
        'Harvest at proper maturity (10-12 months)'
      ]
    },
    {
      crop: 'pulses',
      sowingStart: 'June',
      sowingEnd: 'July',
      harvestingStart: 'September',
      harvestingEnd: 'October',
      duration: 90,
      waterRequirement: 'Low-Medium (300-400mm)',
      temperature: '20-30°C (Optimal)',
      description: 'Short duration crop, good for crop rotation',
      tips: [
        'Sow in well-drained soil',
        'Inoculate seeds with Rhizobium',
        'Control pod borer effectively',
        'Harvest when pods are dry'
      ]
    },
    {
      crop: 'maize',
      sowingStart: 'June',
      sowingEnd: 'July',
      harvestingStart: 'September',
      harvestingEnd: 'October',
      duration: 100,
      waterRequirement: 'Medium (500-600mm)',
      temperature: '25-30°C (Optimal)',
      description: 'Versatile crop, good for fodder and grain',
      tips: [
        'Sow in rows with proper spacing',
        'Apply balanced NPK fertilizers',
        'Control fall armyworm early',
        'Harvest when grain moisture is 20-25%'
      ]
    }
  ]

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const getCurrentSeason = () => {
    const month = new Date().getMonth()
    if (month >= 2 && month <= 5) return 'Rabi Harvest'
    if (month >= 6 && month <= 9) return 'Kharif Growing'
    if (month >= 10 && month <= 11) return 'Rabi Sowing'
    return 'Winter Season'
  }

  const getCropStatus = (crop: CropSeason) => {
    const currentMonth = new Date().getMonth()
    const monthName = months[currentMonth]
    
    if (crop.sowingStart === monthName || crop.sowingEnd === monthName) {
      return 'sowing'
    } else if (crop.harvestingStart === monthName || crop.harvestingEnd === monthName) {
      return 'harvesting'
    } else if (months.indexOf(crop.sowingEnd) < currentMonth && months.indexOf(crop.harvestingStart) > currentMonth) {
      return 'growing'
    } else {
      return 'dormant'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sowing': return 'bg-green-100 text-green-800 border-green-200'
      case 'growing': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'harvesting': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
              case 'sowing': return <Calendar className="w-4 h-4" />
        case 'growing': return <Sun className="w-4 h-4" />
        case 'harvesting': return <Thermometer className="w-4 h-4" />
      default: return <Calendar className="w-4 h-4" />
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
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Please enter a valid Punjab location to view crop calendar</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Crop Calendar</h3>
          <p className="text-gray-600">Seasonal planning for Punjab agriculture</p>
        </div>
        <Calendar className="w-6 h-6 text-primary" />
      </div>

      {/* Current Season */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary rounded-lg">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Current Season</h4>
            <p className="text-gray-600">{getCurrentSeason()} • {location}, Punjab</p>
          </div>
        </div>
      </div>

      {/* Crop Selection */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Select Crop</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {punjabCrops.map(crop => (
            <button
              key={crop.crop}
              onClick={() => setSelectedCrop(crop.crop)}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedCrop === crop.crop
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium capitalize">{crop.crop}</div>
              <div className="text-sm text-gray-600">{crop.duration} days</div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Crop Details */}
      {selectedCrop && (
        <div className="space-y-6">
          {punjabCrops.filter(crop => crop.crop === selectedCrop).map(crop => {
            const status = getCropStatus(crop)
            
            return (
              <div key={crop.crop} className="space-y-4">
                {/* Crop Status */}
                <div className={`p-4 rounded-lg border ${getStatusColor(status)}`}>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(status)}
                    <span className="font-semibold capitalize">
                      {crop.crop} - {status.charAt(0).toUpperCase() + status.slice(1)} Season
                    </span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-semibold mb-3">Growing Timeline</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Sowing Period</div>
                      <div className="font-medium">{crop.sowingStart} - {crop.sowingEnd}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Harvesting Period</div>
                      <div className="font-medium">{crop.harvestingStart} - {crop.harvestingEnd}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Duration</div>
                      <div className="font-medium">{crop.duration} days</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Water Requirement</div>
                      <div className="font-medium">{crop.waterRequirement}</div>
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Thermometer className="w-4 h-4 text-red-500" />
                      <span className="font-semibold">Temperature</span>
                    </div>
                    <p className="text-gray-600">{crop.temperature}</p>
                  </div>
                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <CloudRain className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold">Water Need</span>
                    </div>
                    <p className="text-gray-600">{crop.waterRequirement}</p>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-white border rounded-lg p-4">
                  <h5 className="font-semibold mb-2">Description</h5>
                  <p className="text-gray-600">{crop.description}</p>
                </div>

                {/* Tips */}
                <div className="bg-white border rounded-lg p-4">
                  <h5 className="font-semibold mb-3">Key Tips</h5>
                  <ul className="space-y-2">
                    {crop.tips.map((tip, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-600">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

export default CropCalendar
