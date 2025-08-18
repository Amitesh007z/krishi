import { NextRequest, NextResponse } from 'next/server'
import { getStorageFacilities } from '@/lib/api'

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

    const facilities = await getStorageFacilities(location)
    return NextResponse.json(facilities)
  } catch (error) {
    console.error('API Error fetching storage facilities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch storage data' },
      { status: 500 }
    )
  }
}


