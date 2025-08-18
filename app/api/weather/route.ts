import { NextRequest, NextResponse } from 'next/server'
import { getWeatherData } from '@/lib/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { location } = body

    if (!location) {
      return NextResponse.json(
        { error: 'Missing required parameter: location' },
        { status: 400 }
      )
    }

    const weather = await getWeatherData(location)
    return NextResponse.json(weather)
  } catch (error) {
    console.error('API Error fetching weather:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    )
  }
}


