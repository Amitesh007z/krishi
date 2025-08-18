import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { groupId, groupName, userId, message } = body || {}

    if (!supabaseServer) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    if (!groupId || !groupName) {
      return NextResponse.json({ error: 'Missing group info' }, { status: 400 })
    }

    const payload = {
      group_id: groupId,
      group_name: groupName,
      user_id: userId || null,
      message: message || 'New cooperative action submitted',
      created_at: new Date().toISOString()
    }

    const { error } = await supabaseServer.from('coop_notifications').insert(payload as any)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 })
  }
}


