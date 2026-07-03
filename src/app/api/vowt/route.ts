import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// Proxy same-origin para a API Vowt (evita CORS no browser).
// Sem headers CORS: só aceita chamadas da própria origem.
export async function POST(req: NextRequest) {
  try {
    const { url, method = 'GET', headers = {}, body } = await req.json()

    if (!url || !url.startsWith('https://api.vowtecommerce.com.br/')) {
      return NextResponse.json({ error: 'URL inválida' }, { status: 400 })
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

    return NextResponse.json(data, { status: response.status })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
