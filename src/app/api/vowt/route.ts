import { NextRequest, NextResponse } from 'next/server'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Store, Accept',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function POST(req: NextRequest) {
  try {
    const { url, method = 'GET', headers = {}, body } = await req.json()

    if (!url || !url.startsWith('https://api.vowtecommerce.com.br/')) {
      return NextResponse.json({ error: 'URL inválida' }, { status: 400, headers: CORS })
    }

    const fetchOpts: RequestInit = {
      method,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...headers },
    }
    if (body) fetchOpts.body = typeof body === 'string' ? body : JSON.stringify(body)

    const response = await fetch(url, fetchOpts)
    const rawText = await response.text()
    let data: unknown
    try {
      data = JSON.parse(rawText)
    } catch {
      data = { error: 'Resposta não-JSON do servidor', raw: rawText.slice(0, 500), status: response.status }
    }

    return NextResponse.json(data, { status: response.status, headers: CORS })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500, headers: CORS })
  }
}
