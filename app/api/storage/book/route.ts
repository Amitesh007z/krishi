import { NextRequest, NextResponse } from 'next/server'

// In-memory capacity tracker (dev/demo). In production, persist in a database.
const capacityByWarehouseId: Record<string, number> = {}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { warehouseId, quantity, availableCapacity, farmerName, phone, fromDate, toDate } = body || {}

    if (!warehouseId || !quantity || !availableCapacity) {
      return NextResponse.json(
        { error: 'Missing required parameters: warehouseId, quantity, availableCapacity' },
        { status: 400 }
      )
    }

    const qty = Number(quantity)
    if (Number.isNaN(qty) || qty <= 0) {
      return NextResponse.json(
        { error: 'Invalid quantity' },
        { status: 400 }
      )
    }

    // Initialize capacity from client-provided snapshot if not known yet
    if (capacityByWarehouseId[warehouseId] === undefined) {
      capacityByWarehouseId[warehouseId] = Number(availableCapacity) || 0
    }

    const currentCapacity = capacityByWarehouseId[warehouseId]
    if (currentCapacity < qty) {
      return NextResponse.json(
        { error: 'Insufficient capacity', availableCapacity: currentCapacity },
        { status: 409 }
      )
    }

    // Deduct and create a simple booking confirmation
    capacityByWarehouseId[warehouseId] = currentCapacity - qty
    const bookingId = `${warehouseId}-${Date.now()}`

    return NextResponse.json({
      ok: true,
      bookingId,
      updatedAvailableCapacity: capacityByWarehouseId[warehouseId],
      farmerName,
      phone,
      fromDate,
      toDate
    })
  } catch (error) {
    console.error('API Error booking storage:', error)
    return NextResponse.json(
      { error: 'Failed to book storage' },
      { status: 500 }
    )
  }
}


