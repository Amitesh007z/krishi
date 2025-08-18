import { NextRequest, NextResponse } from 'next/server'
import { getStorageFacilities } from '@/lib/api'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({} as any))
  const crop = body?.crop
  const location = body?.location
  const quantity = Number(body?.quantity || 0)
  try {
    if (!crop || !location || !quantity) {
      return NextResponse.json(
        { error: 'Missing required parameters: crop, location, quantity' },
        { status: 400 }
      )
    }

    // Mock nearby farmers around the same location
    const mockFarmers = [
      { name: 'Gurpreet Singh', village: 'Rampura', distanceKm: 6, quantity: 8 },
      { name: 'Harpreet Kaur', village: 'Rajpura', distanceKm: 12, quantity: 12 },
      { name: 'Manjot Singh', village: 'Sanaur', distanceKm: 18, quantity: 6 },
      { name: 'Simranjit Kaur', village: 'Samana', distanceKm: 22, quantity: 10 }
    ]

    // Choose 2-3 best matches based on distance
    const participants = mockFarmers
      .filter(f => f.distanceKm <= 25)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 3)

    const pooledQuantity = quantity + participants.reduce((sum, f) => sum + f.quantity, 0)

    // Discount tiers
    let discountPercent = 0
    if (pooledQuantity >= 60) discountPercent = 8
    else if (pooledQuantity >= 40) discountPercent = 6
    else if (pooledQuantity >= 25) discountPercent = 4
    else if (pooledQuantity >= 15) discountPercent = 3

    // Fetch nearby facilities and pick best two for recommendation
    const facilities = await getStorageFacilities(location)
    const sorted = facilities
      .slice()
      .sort((a: any, b: any) => (a.distance - b.distance) || (a.costPerTon - b.costPerTon))
    const recommended = sorted.slice(0, 2)

    const avgCost = recommended.length
      ? recommended.reduce((s: number, w: any) => s + w.costPerTon, 0) / recommended.length
      : 180
    const discountedRate = Math.max(100, Math.round(avgCost * (1 - discountPercent / 100)))

    const prioritySlot = pooledQuantity >= 40 ? 'Same-day intake window' : 'Within 24 hours'

    return NextResponse.json({
      crop,
      location,
      yourQuantity: quantity,
      participants,
      pooledQuantity,
      discountPercent,
      recommended,
      rates: {
        baseRatePerTon: Math.round(avgCost),
        discountedRatePerTon: discountedRate
      },
      expectedSavings: Math.max(0, Math.round((avgCost - discountedRate) * quantity)),
      prioritySlot
    })
  } catch (error) {
    console.error('Group storage quote error:', error)
    return NextResponse.json({ error: 'Failed to generate group storage quote' }, { status: 500 })
  }
}


