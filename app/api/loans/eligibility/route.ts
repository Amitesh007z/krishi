import { NextRequest, NextResponse } from 'next/server'

// Mock microfinance eligibility + offer generator
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({} as any))
  const { farmerName, phone, crop, location, storedQuantity, warehouseId, currentMarketPrice } = body || {}
  try {
    if (!farmerName || !phone || !crop || !location || !storedQuantity || !warehouseId) {
      return NextResponse.json(
        { error: 'Missing required parameters: farmerName, phone, crop, location, storedQuantity, warehouseId' },
        { status: 400 }
      )
    }

    const qty = Number(storedQuantity)
    const price = Number(currentMarketPrice || 2000)
    const collateralValue = qty * price

    // Policy: LTV based on crop stability
    const cropStability: Record<string, number> = { wheat: 0.6, rice: 0.55, cotton: 0.45, maize: 0.5 }
    const ltv = cropStability[crop?.toLowerCase()] ?? 0.5

    // Base APR by crop and risk
    let apr = 16
    if (ltv >= 0.6) apr = 14
    if (ltv <= 0.45) apr = 18

    const maxLoan = Math.floor(collateralValue * ltv)
    const minLoan = Math.floor(maxLoan * 0.25)

    // Tenor options in months
    const tenorOptions = [3, 6, 9]

    const offers = tenorOptions.map(months => {
      const monthlyRate = apr / 12 / 100
      const principal = Math.min(maxLoan, Math.max(minLoan, Math.floor(collateralValue * 0.4)))
      const interest = Math.floor(principal * monthlyRate * months)
      const processingFee = Math.max(500, Math.floor(principal * 0.01))
      return {
        months,
        principal,
        apr,
        monthlyRate: Number(monthlyRate.toFixed(4)),
        interest,
        processingFee,
        totalRepayable: principal + interest + processingFee,
        disbursalETA: 'within 24 hours',
        requiredDocs: ['Aadhaar', 'Bank passbook', 'J-Form / crop receipt', 'Storage receipt']
      }
    })

    return NextResponse.json({
      farmerName,
      phone,
      crop,
      location,
      warehouseId,
      storedQuantity: qty,
      currentMarketPrice: price,
      collateralValue,
      ltv,
      offers
    })
  } catch (error) {
    console.error('Loan eligibility error:', error)
    return NextResponse.json({ error: 'Failed to check loan eligibility' }, { status: 500 })
  }
}


