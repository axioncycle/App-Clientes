import { NextRequest, NextResponse } from 'next/server'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { url, method = 'GET', headers = {}, formBody } = body

    if (!url || !url.startsWith('https://api.mercadolibre.com')) {
      return NextResponse.json({ error: 'URL inválida' }, { status: 400, headers: CORS })
    }

    const fetchOpts: RequestInit = { method, headers }
    if (formBody) fetchOpts.body = formBody

    const mlRes = await fetch(url, fetchOpts)
    const data = await mlRes.json().catch(() => ({ error: 'Resposta inválida' }))

    return NextResponse.json(data, { status: mlRes.status, headers: CORS })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500, headers: CORS })
  }
}
