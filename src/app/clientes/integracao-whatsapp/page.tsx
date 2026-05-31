'use client'

import { useState } from 'react'

export default function IntegracaoWhatsAppPage() {
  const [testResult, setTestResult] = useState<string | null>(null)
  const [testing, setTesting] = useState(false)

  const webhookUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/webhook/whatsapp` : '/api/webhook/whatsapp'

  const testWebhook = async () => {
    setTesting(true); setTestResult(null)
    try {
      const res = await fetch('/api/webhook/whatsapp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: { message: 'Novo cliente: Nome: Teste Webhook | Telefone: 11999990000 | SKU: BIKE-TEST | Observação: Cliente de teste via webhook' }, phone: '5511999990000' }) })
      const data = await res.json()
      if (data.ok) { setTestResult(`✅ Webhook funcionando! Cliente criado com ID: ${data.customer_id}`) } else { setTestResult(`⚠️ Resposta: ${JSON.stringify(data)}`) }
    } catch (e) { setTestResult(`❌ Erro: ${String(e)}`) } finally { setTesting(false) }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold text-white flex items-center gap-3"><span className="text-3xl">💬</span> Integração WhatsApp (Z-API)</h1><p className="text-slate-400 text-sm mt-1">Configure o Z-API para cadastrar clientes automaticamente.</p></div>
      <div className="card space-y-3">
        <h2 className="text-base font-semibold text-white border-b border-slate-700 pb-3 flex items-center gap-2"><span>🔗</span> URL do Webhook</h2>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-green-400 text-sm font-mono break-all">{webhookUrl}</code>
          <button onClick={() => navigator.clipboard.writeText(webhookUrl)} className="btn-secondary text-sm flex-shrink-0">📋 Copiar</button>
        </div>
      </div>
      <div className="card space-y-3">
        <h2 className="text-base font-semibold text-white border-b border-slate-700 pb-3 flex items-center gap-2"><span>🧪</span> Testar Webhook</h2>
        <button onClick={testWebhook} disabled={testing} className="btn-primary flex items-center gap-2">{testing ? <><svg className="w-4 h-4 spinner" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Testando...</> : <><span>▶️</span> Testar Webhook</>}</button>
        {testResult && (<div className={`rounded-lg p-4 text-sm font-mono ${testResult.startsWith('✅') ? 'bg-green-900/20 border border-green-700/50 text-green-300' : 'bg-amber-900/20 border border-amber-700/50 text-amber-300'}`}>{testResult}</div>)}
      </div>
    </div>
  )
}
