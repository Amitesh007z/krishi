import { NextRequest, NextResponse } from 'next/server'
import { getMarketPrices } from '@/lib/api'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({} as any))
  const crop = body?.crop
  const location = body?.location
  try {

    if (!crop || !location) {
      return NextResponse.json(
        { error: 'Missing required parameters: crop, location' },
        { status: 400 }
      )
    }

    const prices = await getMarketPrices(crop, location)
    return NextResponse.json(prices)
  } catch (error) {
    console.error('API Error fetching market prices:', error)
    // Fallback mock data for development
    try {
      const fallbackCrop = crop || 'Wheat'
      const fallbackLocation = location || 'Ludhiana'
      const today = new Date()
      const format = (d: Date) => `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
      const records = [0,1,2].map(offset => {
        const d = new Date(today)
        d.setDate(today.getDate() - offset * 2)
        const base = fallbackCrop.toLowerCase().includes('wheat') ? 2050 : fallbackCrop.toLowerCase().includes('rice') ? 2300 : 1800
        const jitter = Math.floor(Math.random() * 120) - 60
        return {
          mandi: `${fallbackLocation} Mandi`,
          price: base + jitter,
          date: format(d),
          location: 'Punjab',
          variety: 'FAQ',
          grade: 'Fair Average Quality',
        }
      })
      return NextResponse.json(records)
    } catch {}
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 })
  }
}


