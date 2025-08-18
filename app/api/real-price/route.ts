import { NextRequest, NextResponse } from 'next/server'
import { getRealCurrentPricesWithFallback } from '@/lib/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { crop, district, market, state } = body

    if (!crop || !district || !market) {
      return NextResponse.json(
        { error: 'Missing required parameters: crop, district, market' },
        { status: 400 }
      )
    }

    const data = await getRealCurrentPricesWithFallback(crop, district, market, state || 'Punjab')
    return NextResponse.json(data)
  } catch (error) {
    console.error('API Error fetching real price:', error)
    // Fallback mock for development
    try {
      const body = await request.json().catch(() => ({}))
      const crop = body?.crop || 'Wheat'
      const market = body?.market || 'Ludhiana'
      const district = body?.district || 'Ludhiana'
      const base = crop.toLowerCase().includes('wheat') ? 2050 : crop.toLowerCase().includes('rice') ? 2300 : 1800
      const price = base + Math.floor(Math.random() * 100) - 50
      const today = new Date()
      const date = `${String(today.getDate()).padStart(2,'0')}/${String(today.getMonth()+1).padStart(2,'0')}/${today.getFullYear()}`
      return NextResponse.json({
        price,
        date,
        market,
        commodity: crop,
        variety: 'FAQ',
        grade: 'Fair Average Quality',
        state: 'Punjab',
        district,
        source: 'Mock Fallback',
        timestamp: new Date().toISOString()
      })
    } catch {}
    return NextResponse.json({ error: 'Failed to fetch real price data' }, { status: 500 })
  }
}


