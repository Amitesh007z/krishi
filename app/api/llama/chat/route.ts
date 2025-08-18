import { NextResponse } from 'next/server'

const LLAMAFILE_BASE_URL = process.env.NEXT_PUBLIC_LLAMAFILE_BASE_URL || 'http://localhost:8080'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const res = await fetch(`${LLAMAFILE_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store'
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to reach Llamafile' }, { status: 500 })
  }
}


