import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Parse message like:
// "novo cliente: Nome: João Silva | Telefone: 11999998888 | SKU: BIKE-001 | Observação: Interessado na bike azul"
function parseMessage(text: string) {
  const lower = text.toLowerCase()
  if (!lower.includes('cliente') && !lower.includes('nome')) return null

  const name = text.match(/nome[:\s]+([^|\n]+)/i)?.[1]?.trim()
  const phone = text.match(/(?:telefone|tel|fone|whatsapp)[:\s]+([^|\n]+)/i)?.[1]?.trim()
  const sku = text.match(/sku[:\s]+([^|\n]+)/i)?.[1]?.trim()
  const notes = text.match(/(?:obs|observa[çc][ãa]o|nota)[:\s]+([^|\n]+)/i)?.[1]?.trim()

  if (!name) return null
  return { name, phone, sku, notes }
}

export async function POST(req: NextRequest) {
  const secret = process.env.WHATSAPP_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ ok: false, error: 'WHATSAPP_WEBHOOK_SECRET não configurado' }, { status: 503 })
  }
  const token = req.nextUrl.searchParams.get('token') || req.headers.get('x-webhook-token')
  if (token !== secret) {
    return NextResponse.json({ ok: false, error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await req.json()

    // Z-API format
    const text = body.text?.message || body.message || body.body || ''
    const senderPhone = body.phone || body.from || ''

    const parsed = parseMessage(text)
    if (!parsed) {
      return NextResponse.json({ ok: false, reason: 'message not recognized' })
    }

    const supabase = getSupabase()
    const { data: customer, error } = await supabase
      .from('customers')
      .insert({
        name: parsed.name,
        phone: parsed.phone || senderPhone,
        status: 'interested',
        notes: parsed.notes || null,
        service_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single()

    if (error) throw error

    if (parsed.sku && customer) {
      await supabase.from('customer_skus').insert({
        customer_id: customer.id,
        sku: parsed.sku,
        type: 'interest',
        quantity: 1,
      })
    }

    return NextResponse.json({ ok: true, customer_id: customer?.id })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'WhatsApp webhook ativo' })
}
