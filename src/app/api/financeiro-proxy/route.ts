import { NextResponse } from 'next/server'

// Simple passthrough — all BRL fixes are applied directly in the Financeiro source repo
export async function GET() {
  return NextResponse.redirect('https://financeiro-ten-kappa.vercel.app/', { status: 302 })
}
