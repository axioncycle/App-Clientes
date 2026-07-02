import { NextRequest, NextResponse } from 'next/server'

// Proxy same-origin para a API do Mercado Livre (evita CORS no browser).
// Sem headers CORS: só aceita chamadas da própria origem.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { url, method = 'GET', headers = {}, formBody } = body

    if (!url || !url.startsWith('https://api.mercadolibre.com/')) {
      return NextResponse.json({ error: 'URL inválida' }, { status: 400 })
    }

    const fetchOpts: RequestInit = { method, headers }
    if (formBody) fetchOpts.body = formBody

    const mlRes = await fetch(url, fetchOpts)
    const data = await mlRes.json().catch(() => ({ error: 'Resposta inválida' }))

    return NextResponse.json(data, { status: mlRes.status })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
