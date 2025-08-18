import { NextRequest, NextResponse } from 'next/server'
import { getNearbyMandiPrices } from '@/lib/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { crop, location, currentPrice } = body

    if (!crop || !location || !currentPrice) {
      return NextResponse.json(
        { error: 'Missing required parameters: crop, location, currentPrice' },
        { status: 400 }
      )
    }

    console.log(`API: Fetching nearby mandis for ${crop} in ${location} with current price ${currentPrice}`)

    const nearbyMandis = await getNearbyMandiPrices(crop, location, currentPrice)

    return NextResponse.json(nearbyMandis)
  } catch (error) {
    console.error('API Error fetching nearby mandis:', error)
    return NextResponse.json(
      { error: 'Failed to fetch nearby mandi data' },
      { status: 500 }
    )
  }
}
