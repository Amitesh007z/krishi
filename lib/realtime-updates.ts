// Real-time update service for live agricultural data
import { EventEmitter } from 'events'

export interface LiveDataUpdate {
  type: 'price' | 'weather' | 'storage' | 'market'
  data: any
  timestamp: Date
  source: string
}

export interface PriceUpdate {
  crop: string
  location: string
  oldPrice: number
  newPrice: number
  change: number
  changePercent: number
  volume: number
}

export interface WeatherUpdate {
  location: string
  temperature: number
  humidity: number
  rainfall: number
  windSpeed: number
  condition: string
  alerts: string[]
}

export interface StorageUpdate {
  location: string
  warehouseId: string
  availableCapacity: number
  costPerTon: number
  status: 'available' | 'limited' | 'full'
}

class RealtimeUpdateService extends EventEmitter {
  private priceUpdateListeners: ((update: PriceUpdate) => void)[] = []
  private weatherUpdateListeners: ((update: WeatherUpdate) => void)[] = []
  private storageUpdateListeners: ((update: StorageUpdate) => void)[] = []
  
  private priceUpdateInterval: NodeJS.Timeout | null = null
  private weatherUpdateInterval: NodeJS.Timeout | null = null
  private storageUpdateInterval: NodeJS.Timeout | null = null
  
  private static instance: RealtimeUpdateService
  private updateInterval: NodeJS.Timeout | null = null
  private isRunning = false

  static getInstance(): RealtimeUpdateService {
    if (!RealtimeUpdateService.instance) {
      RealtimeUpdateService.instance = new RealtimeUpdateService()
    }
    return RealtimeUpdateService.instance
  }

  start() {
    if (this.isRunning) return
    
    this.isRunning = true
    this.updateInterval = setInterval(() => {
      this.generateMockUpdates()
    }, 30000) // Update every 30 seconds
    
    console.log('Real-time update service started')
  }

  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
    this.isRunning = false
    console.log('Real-time update service stopped')
  }

  private generateMockUpdates() {
    // Generate mock price updates
    const crops = ['wheat', 'rice', 'cotton', 'sugarcane', 'pulses']
    const locations = ['Amritsar', 'Jalandhar', 'Ludhiana', 'Patiala', 'Bathinda']
    
    crops.forEach(crop => {
      const location = locations[Math.floor(Math.random() * locations.length)]
      const oldPrice = 1500 + Math.random() * 1000
      const change = (Math.random() - 0.5) * 100
      const newPrice = Math.max(100, oldPrice + change)
      
      const priceUpdate: PriceUpdate = {
        crop,
        location,
        oldPrice: Math.round(oldPrice),
        newPrice: Math.round(newPrice),
        change: Math.round(change),
        changePercent: Math.round((change / oldPrice) * 100 * 100) / 100,
        volume: Math.floor(Math.random() * 1000) + 100
      }
      
      this.emit('priceUpdate', priceUpdate)
    })

    // Generate mock weather updates
    locations.forEach(location => {
      const weatherUpdate: WeatherUpdate = {
        location,
        temperature: 20 + (Math.random() - 0.5) * 20,
        humidity: 50 + Math.random() * 30,
        rainfall: Math.random() > 0.7 ? Math.random() * 20 : 0,
        windSpeed: 5 + Math.random() * 15,
        condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
        alerts: Math.random() > 0.8 ? ['High temperature alert'] : []
      }
      
      this.emit('weatherUpdate', weatherUpdate)
    })

    // Generate mock storage updates
    const warehouses = [
      { id: '1', name: 'Central Warehouse', location: 'Amritsar' },
      { id: '2', name: 'FCI Storage', location: 'Jalandhar' },
      { id: '3', name: 'Cold Storage', location: 'Ludhiana' }
    ]
    
    warehouses.forEach(warehouse => {
      const storageUpdate: StorageUpdate = {
        location: warehouse.location,
        warehouseId: warehouse.id,
        availableCapacity: Math.floor(Math.random() * 5000) + 1000,
        costPerTon: 100 + Math.random() * 100,
        status: Math.random() > 0.7 ? 'limited' : 'available'
      }
      
      this.emit('storageUpdate', storageUpdate)
    })
  }

  // Subscribe to specific update types
  onPriceUpdate(callback: (update: PriceUpdate) => void) {
    this.priceUpdateListeners.push(callback)
  }

  onWeatherUpdate(callback: (update: WeatherUpdate) => void) {
    this.weatherUpdateListeners.push(callback)
  }

  onStorageUpdate(callback: (update: StorageUpdate) => void) {
    this.storageUpdateListeners.push(callback)
  }

  // Unsubscribe from updates
  offPriceUpdate(callback: (update: PriceUpdate) => void) {
    this.priceUpdateListeners = this.priceUpdateListeners.filter(cb => cb !== callback)
  }

  offWeatherUpdate(callback: (update: WeatherUpdate) => void) {
    this.weatherUpdateListeners = this.weatherUpdateListeners.filter(cb => cb !== callback)
  }

  offStorageUpdate(callback: (update: StorageUpdate) => void) {
    this.storageUpdateListeners = this.storageUpdateListeners.filter(cb => cb !== callback)
  }
}

// Export singleton instance
export const realtimeService = RealtimeUpdateService.getInstance()

// WebSocket-like interface for real-time updates
export class RealtimeConnection {
  private service = realtimeService
  private callbacks: Map<string, Function[]> = new Map()

  connect() {
    this.service.start()
  }

  disconnect() {
    this.service.stop()
  }

  subscribe(type: string, callback: Function) {
    if (!this.callbacks.has(type)) {
      this.callbacks.set(type, [])
    }
    this.callbacks.get(type)!.push(callback)

    // Set up the appropriate listener
    switch (type) {
      case 'price':
        this.service.onPriceUpdate(callback as (update: PriceUpdate) => void)
        break
      case 'weather':
        this.service.onWeatherUpdate(callback as (update: WeatherUpdate) => void)
        break
      case 'storage':
        this.service.onStorageUpdate(callback as (update: StorageUpdate) => void)
        break
    }
  }

  unsubscribe(type: string, callback: Function) {
    const callbacks = this.callbacks.get(type)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }

    // Remove the listener
    switch (type) {
      case 'price':
        this.service.offPriceUpdate(callback as (update: PriceUpdate) => void)
        break
      case 'weather':
        this.service.offWeatherUpdate(callback as (update: WeatherUpdate) => void)
        break
      case 'storage':
        this.service.offStorageUpdate(callback as (update: StorageUpdate) => void)
        break
    }
  }
}

// Export connection class
export const createRealtimeConnection = () => new RealtimeConnection()
