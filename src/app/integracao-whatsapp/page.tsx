'use client'

import { useState } from 'react'

export default function IntegracaoWhatsAppPage() {
  const [testResult, setTestResult] = useState<string | null>(null)
  const [testing, setTesting] = useState(false)

  const webhookUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/webhook/whatsapp`
      : '/api/webhook/whatsapp'

  const testWebhook = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/webhook/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: { message: 'Novo cliente: Nome: Teste Webhook | Telefone: 11999990000 | SKU: BIKE-TEST | Observação: Cliente de teste via webhook' },
          phone: '5511999990000',
        }),
      })
      const data = await res.json()
      if (data.ok) {
        setTestResult(`✅ Webhook funcionando! Cliente criado com ID: ${data.customer_id}`)
      } else {
        setTestResult(`⚠️ Resposta: ${JSON.stringify(data)}`)
      }
    } catch (e) {
      setTestResult(`❌ Erro: ${String(e)}`)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">💬</span> Integração WhatsApp (Z-API)
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Configure o Z-API para cadastrar clientes automaticamente a partir de mensagens do WhatsApp.
        </p>
      </div>

      {/* Webhook URL */}
      <div className="card space-y-3">
        <h2 className="text-base font-semibold text-white border-b border-slate-700 pb-3 flex items-center gap-2">
          <span>🔗</span> URL do Webhook
        </h2>
        <p className="text-slate-400 text-sm">
          Configure esta URL no painel do Z-API como webhook de mensagens recebidas:
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-green-400 text-sm font-mono break-all">
            {webhookUrl}
          </code>
          <button
            onClick={() => navigator.clipboard.writeText(webhookUrl)}
            className="btn-secondary text-sm flex-shrink-0"
            title="Copiar URL"
          >
            📋 Copiar
          </button>
        </div>
      </div>

      {/* Message format */}
      <div className="card space-y-3">
        <h2 className="text-base font-semibold text-white border-b border-slate-700 pb-3 flex items-center gap-2">
          <span>📝</span> Formato da Mensagem
        </h2>
        <p className="text-slate-400 text-sm">
          Envie uma mensagem no WhatsApp com o seguinte formato para cadastrar um novo cliente:
        </p>
        <div className="bg-slate-900 border border-slate-600 rounded-lg p-4">
          <code className="text-green-400 text-sm font-mono whitespace-pre-wrap">
            {`Novo cliente: Nome: [nome completo] | Telefone: [número] | SKU: [código do produto] | Observação: [anotações]`}
          </code>
        </div>
        <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-4">
          <p className="text-blue-300 text-sm font-medium mb-1">Exemplo:</p>
          <code className="text-blue-200 text-sm font-mono">
            {`Novo cliente: Nome: João Silva | Telefone: 11999998888 | SKU: BIKE-001 | Observação: Interessado na bike azul`}
          </code>
        </div>
        <div className="space-y-1 text-sm text-slate-400">
          <p><span className="text-white font-medium">Nome</span> — obrigatório</p>
          <p><span className="text-white font-medium">Telefone</span> — opcional (usa o número do remetente se omitido)</p>
          <p><span className="text-white font-medium">SKU</span> — opcional (código do produto de interesse)</p>
          <p><span className="text-white font-medium">Observação</span> — opcional (notas sobre o cliente)</p>
        </div>
      </div>

      {/* Z-API setup steps */}
      <div className="card space-y-4">
        <h2 className="text-base font-semibold text-white border-b border-slate-700 pb-3 flex items-center gap-2">
          <span>⚙️</span> Configuração no Z-API
        </h2>
        <ol className="space-y-4">
          {[
            {
              step: '1',
              title: 'Acesse o painel Z-API',
              desc: 'Entre em app.z-api.io e faça login na sua conta.',
            },
            {
              step: '2',
              title: 'Selecione a instância',
              desc: 'Clique na instância do WhatsApp que deseja integrar.',
            },
            {
              step: '3',
              title: 'Vá em "Webhooks"',
              desc: 'No menu lateral, clique em "Webhook" ou "Configurações de Webhook".',
            },
            {
              step: '4',
              title: 'Configure o webhook de mensagens recebidas',
              desc: 'No campo "On Message Received" (ou equivalente), cole a URL do webhook acima.',
            },
            {
              step: '5',
              title: 'Salve e teste',
              desc: 'Clique em Salvar. Use o botão abaixo para testar se o webhook está funcionando.',
            },
          ].map((item) => (
            <li key={item.step} className="flex gap-4">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-700 text-white text-sm font-bold flex items-center justify-center">
                {item.step}
              </div>
              <div>
                <p className="text-white font-medium text-sm">{item.title}</p>
                <p className="text-slate-400 text-sm mt-0.5">{item.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Test button */}
      <div className="card space-y-3">
        <h2 className="text-base font-semibold text-white border-b border-slate-700 pb-3 flex items-center gap-2">
          <span>🧪</span> Testar Webhook
        </h2>
        <p className="text-slate-400 text-sm">
          Clique no botão abaixo para enviar uma mensagem de teste e verificar se o webhook está funcionando corretamente.
          Isso criará um cliente de teste no sistema.
        </p>
        <button
          onClick={testWebhook}
          disabled={testing}
          className="btn-primary flex items-center gap-2"
        >
          {testing ? (
            <>
              <svg className="w-4 h-4 spinner" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Testando...
            </>
          ) : (
            <><span>▶️</span> Testar Webhook</>
          )}
        </button>
        {testResult && (
          <div className={`rounded-lg p-4 text-sm font-mono ${testResult.startsWith('✅') ? 'bg-green-900/20 border border-green-700/50 text-green-300' : 'bg-amber-900/20 border border-amber-700/50 text-amber-300'}`}>
            {testResult}
          </div>
        )}
      </div>
    </div>
  )
}
