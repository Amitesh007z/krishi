'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  Thermometer, 
  Droplets, 
  Wind,
  Eye,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin
} from 'lucide-react'
import { getWeatherData } from '@/lib/api'

interface WeatherWidgetProps {
  location: string
  isValidLocation: boolean
}

interface WeatherData {
  date: string
  temperature: {
    min: number
    max: number
    current: number
  }
  humidity: number
  rainfall: number
  windSpeed: number
  visibility: number
  condition: string
  icon: string
}

interface WeatherAlert {
  type: 'warning' | 'info' | 'danger'
  message: string
  severity: 'low' | 'medium' | 'high'
}

const WeatherWidget = ({ location }: WeatherWidgetProps) => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([])
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null)
  const [alerts, setAlerts] = useState<WeatherAlert[]>([])
  const [loading, setLoading] = useState(false)

  // Mock data - in real app, this would come from weather APIs
  const mockWeatherData: WeatherData[] = [
    {
      date: '2024-01-15',
      temperature: { min: 8, max: 22, current: 18 },
      humidity: 65,
      rainfall: 0,
      windSpeed: 12,
      visibility: 10,
      condition: 'Partly Cloudy',
      icon: 'cloud'
    },
    {
      date: '2024-01-16',
      temperature: { min: 6, max: 20, current: 16 },
      humidity: 70,
      rainfall: 5,
      windSpeed: 15,
      visibility: 8,
      condition: 'Light Rain',
      icon: 'cloud-rain'
    },
    {
      date: '2024-01-17',
      temperature: { min: 4, max: 18, current: 14 },
      humidity: 75,
      rainfall: 15,
      windSpeed: 20,
      visibility: 6,
      condition: 'Moderate Rain',
      icon: 'cloud-rain'
    },
    {
      date: '2024-01-18',
      temperature: { min: 3, max: 16, current: 12 },
      humidity: 80,
      rainfall: 25,
      windSpeed: 25,
      visibility: 4,
      condition: 'Heavy Rain',
      icon: 'cloud-rain'
    },
    {
      date: '2024-01-19',
      temperature: { min: 2, max: 14, current: 10 },
      humidity: 85,
      rainfall: 30,
      windSpeed: 30,
      visibility: 3,
      condition: 'Storm',
      icon: 'cloud-rain'
    }
  ]

  const mockAlerts: WeatherAlert[] = [
    {
      type: 'warning',
      message: 'Heavy rainfall expected in next 48 hours. Consider delaying harvest operations.',
      severity: 'medium'
    },
    {
      type: 'info',
      message: 'Temperature dropping below 5°C in next week. Monitor crop health.',
      severity: 'low'
    },
    {
      type: 'danger',
      message: 'High wind speeds (25-30 km/h) may affect standing crops.',
      severity: 'high'
    }
  ]

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (location) {
        setLoading(true)
        try {
          // Fetch real weather data
          const apiWeatherData = await getWeatherData(location)
          
          // Transform API data to component format
          const transformedWeatherData: WeatherData[] = [
            {
              date: new Date().toISOString().split('T')[0],
              temperature: {
                min: apiWeatherData.current.temp - 5,
                max: apiWeatherData.current.temp + 5,
                current: apiWeatherData.current.temp
              },
              humidity: apiWeatherData.current.humidity,
              rainfall: 0, // API doesn't provide rainfall for current
              windSpeed: 15, // Default value
              visibility: 10, // Default value
              condition: apiWeatherData.current.description,
              icon: apiWeatherData.current.icon.includes('rain') ? 'cloud-rain' : 
                    apiWeatherData.current.icon.includes('cloud') ? 'cloud' : 'sun'
            },
            ...apiWeatherData.forecast.map((forecast: any, index: number) => ({
              date: forecast.date,
              temperature: {
                min: forecast.temp - 3,
                max: forecast.temp + 3,
                current: forecast.temp
              },
              humidity: forecast.humidity,
              rainfall: forecast.description.includes('rain') ? 10 + (index * 5) : 0,
              windSpeed: 10 + (index * 2),
              visibility: 8 - (index * 1),
              condition: forecast.description,
              icon: forecast.description.includes('rain') ? 'cloud-rain' : 
                    forecast.description.includes('cloud') ? 'cloud' : 'sun'
            }))
          ]
          
          setWeatherData(transformedWeatherData)
          setCurrentWeather(transformedWeatherData[0])
          
          // Generate alerts based on weather conditions
          const newAlerts: WeatherAlert[] = []
          if (apiWeatherData.current.temp > 35) {
            newAlerts.push({
              type: 'warning',
              message: 'High temperature alert - Protect crops from heat stress',
              severity: 'medium'
            })
          }
          if (apiWeatherData.current.humidity > 80) {
            newAlerts.push({
              type: 'info',
              message: 'High humidity - Monitor for disease development',
              severity: 'low'
            })
          }
          
          setAlerts(newAlerts)
          setLoading(false)
        } catch (error) {
          console.error('Error fetching weather data:', error)
          // Fallback to mock data
          setWeatherData(mockWeatherData)
          setCurrentWeather(mockWeatherData[0])
          setAlerts(mockAlerts)
          setLoading(false)
        }
      }
    }
    
    fetchWeatherData()
  }, [location])

  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case 'sun':
        return <Sun className="w-8 h-8 text-yellow-500" />
      case 'cloud':
        return <Cloud className="w-8 h-8 text-gray-500" />
      case 'cloud-rain':
        return <CloudRain className="w-8 h-8 text-blue-500" />
      default:
        return <Sun className="w-8 h-8 text-yellow-500" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'info':
        return 'border-blue-200 bg-blue-50'
      case 'danger':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'info':
        return <CheckCircle className="w-5 h-5 text-blue-600" />
      case 'danger':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'text-green-600 bg-green-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'high':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getAgriculturalImpact = (weather: WeatherData) => {
    const impacts = []
    
    if (weather.temperature.current < 5) {
      impacts.push('Risk of frost damage to sensitive crops')
    }
    if (weather.temperature.current > 35) {
      impacts.push('Heat stress may affect crop growth')
    }
    if (weather.rainfall > 20) {
      impacts.push('Heavy rain may cause waterlogging')
    }
    if (weather.windSpeed > 25) {
      impacts.push('Strong winds may damage standing crops')
    }
    if (weather.humidity > 80) {
      impacts.push('High humidity may increase disease risk')
    }
    
    return impacts.length > 0 ? impacts : ['Weather conditions favorable for agriculture']
  }

  if (!location) {
    return (
      <div className="card text-center py-12">
        <Sun className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Select Location</h3>
        <p className="text-gray-500">Choose your location to see weather information</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="card text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading weather data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Weather */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Weather & Climate</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
        </div>

        {currentWeather && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Conditions */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-blue-800">Current Weather</h3>
                  <p className="text-blue-600">{currentWeather.condition}</p>
                </div>
                {getWeatherIcon(currentWeather.icon)}
              </div>
              
              <div className="text-6xl font-bold text-blue-700 mb-4">
                {currentWeather.temperature.current}°C
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Thermometer className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-700">
                    {currentWeather.temperature.min}° - {currentWeather.temperature.max}°C
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Droplets className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-700">{currentWeather.humidity}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Wind className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-700">{currentWeather.windSpeed} km/h</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-700">{currentWeather.visibility} km</span>
                </div>
              </div>
            </div>

            {/* Agricultural Impact */}
            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <h3 className="text-xl font-semibold text-green-800 mb-4">Agricultural Impact</h3>
              
              <div className="space-y-3">
                {getAgriculturalImpact(currentWeather).map((impact, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <p className="text-sm text-green-700">{impact}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-3 bg-white rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Recommendations</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Monitor soil moisture levels</li>
                  <li>• Check for pest activity</li>
                  <li>• Adjust irrigation schedule</li>
                  <li>• Protect sensitive crops if needed</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Weather Alerts */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Weather Alerts & Warnings</h3>
        
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`p-4 border rounded-lg ${getAlertColor(alert.type)}`}
            >
              <div className="flex items-start space-x-3">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <p className="text-gray-800 mb-2">{alert.message}</p>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.severity.toUpperCase()} SEVERITY
                    </span>
                    <span className="text-xs text-gray-500">Updated: 2 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 5-Day Forecast */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">5-Day Weather Forecast</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {weatherData.map((day, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg text-center hover:shadow-md transition-shadow"
            >
              <p className="text-sm font-medium text-gray-600 mb-2">
                {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
              
              <div className="flex justify-center mb-3">
                {getWeatherIcon(day.icon)}
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{day.condition}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">High:</span>
                  <span className="font-medium text-red-600">{day.temperature.max}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Low:</span>
                  <span className="font-medium text-blue-600">{day.temperature.min}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rain:</span>
                  <span className="font-medium text-blue-600">{day.rainfall}mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Wind:</span>
                  <span className="font-medium text-gray-600">{day.windSpeed}km/h</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Climate Trends */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Climate Trends & Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
            <div className="flex items-center space-x-3 mb-3">
              <Thermometer className="w-6 h-6 text-purple-600" />
              <h4 className="font-semibold text-purple-800">Temperature Trend</h4>
            </div>
            <p className="text-purple-700 text-sm">
              Average temperature trending downward by 2°C this week. 
              Monitor for frost risk in early morning hours.
            </p>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <div className="flex items-center space-x-3 mb-3">
              <Droplets className="w-6 h-6 text-blue-600" />
              <h4 className="font-semibold text-blue-800">Precipitation Pattern</h4>
            </div>
            <p className="text-blue-700 text-sm">
              Rainfall intensity increasing over next 3 days. 
              Consider drainage preparation and harvest timing.
            </p>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
            <div className="flex items-center space-x-3 mb-3">
              <Wind className="w-6 h-6 text-green-600" />
              <h4 className="font-semibold text-green-800">Wind Conditions</h4>
            </div>
            <p className="text-green-700 text-sm">
              Wind speeds expected to increase. 
              Secure loose materials and protect vulnerable crops.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Historical Data */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Historical Weather Data</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Month</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Avg High</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Avg Low</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Rainfall</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Humidity</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium">January</td>
                <td className="py-3 px-4 text-gray-600">22°C</td>
                <td className="py-3 px-4 text-gray-600">8°C</td>
                <td className="py-3 px-4 text-gray-600">45mm</td>
                <td className="py-3 px-4 text-gray-600">65%</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium">February</td>
                <td className="py-3 px-4 text-gray-600">25°C</td>
                <td className="py-3 px-4 text-gray-600">10°C</td>
                <td className="py-3 px-4 text-gray-600">38mm</td>
                <td className="py-3 px-4 text-gray-600">60%</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">March</td>
                <td className="py-3 px-4 text-gray-600">30°C</td>
                <td className="py-3 px-4 text-gray-600">15°C</td>
                <td className="py-3 px-4 text-gray-600">25mm</td>
                <td className="py-3 px-4 text-gray-600">55%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

export default WeatherWidget
