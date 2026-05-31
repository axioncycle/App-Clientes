import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('https://financeiro-ten-kappa.vercel.app/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AxionProxy/1.0)',
        'Accept': 'text/html',
      },
      cache: 'no-store',
    })

    let html = await res.text()

    // Fix 1: saveMeta usa parseFloat em vez de parseBRL — quebra formato 1.050,66
    html = html.replace(
      'function saveMeta(val){\n  var m=parseFloat(val)||0;',
      'function saveMeta(val){\n  var m=parseBRL(String(val))||0;'
    )

    // Fix 2: renderMetaBar usa parseFloat em vez de parseBRL no input meta
    html = html.replace(
      'var typed=parseFloat(metaInput.value)||0;',
      'var typed=parseBRL(metaInput.value||"0")||0;'
    )

    // Fix 3: salvarVenda usa parseFloat em vez de parseBRL no campo v-venda
    html = html.replace(
      "var venda=parseFloat(document.getElementById('v-venda').value)||0;",
      "var venda=parseBRL(document.getElementById('v-venda').value||'0')||0;"
    )

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache',
        'X-Frame-Options': 'SAMEORIGIN',
      },
    })
  } catch (e) {
    return new NextResponse('Erro ao carregar módulo Financeiro: ' + String(e), { status: 500 })
  }
}
