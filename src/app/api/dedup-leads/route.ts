import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, serviceKey)

  const { data: all, error } = await supabase
    .from('customers')
    .select('id, phone, created_at')
    .not('phone', 'is', null)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const seen = new Map<string, string>()
  const toDelete: string[] = []

  for (const row of all ?? []) {
    const phone = row.phone as string
    if (seen.has(phone)) {
      toDelete.push(row.id)
    } else {
      seen.set(phone, row.id)
    }
  }

  if (toDelete.length === 0) {
    return NextResponse.json({ deleted: 0, message: 'Nenhum duplicado encontrado' })
  }

  let deleted = 0
  for (let i = 0; i < toDelete.length; i += 100) {
    const batch = toDelete.slice(i, i + 100)
    const { error: delErr } = await supabase.from('customers').delete().in('id', batch)
    if (delErr) return NextResponse.json({ error: delErr.message, deletedSoFar: deleted }, { status: 500 })
    deleted += batch.length
  }

  return NextResponse.json({ deleted, message: `${deleted} duplicados removidos` })
}
