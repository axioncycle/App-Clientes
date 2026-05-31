'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'

type ContactRaw = { name: string[]; tel: string[]; email: string[] }
type ImportRow = { name: string; phone: string; email: string; status: 'interested' | 'purchased'; selected: boolean }

function detectStatus(name: string): 'interested' | 'purchased' {
  const match = name.match(/cliente\s+(.+)/i)
  if (match) { const rest = match[1].trim(); if (/^\d+$/.test(rest)) return 'purchased'; return 'interested' }
  return 'interested'
}

function cleanPhone(raw: string) { return raw.replace(/\D/g, '').replace(/^0/, '') }

export default function ImportarPage() {
  const [rows, setRows] = useState<ImportRow[]>([])
  const [importing, setImporting] = useState(false)
  const [done, setDone] = useState(false)
  const [importedCount, setImportedCount] = useState(0)
  const [error, setError] = useState('')
  const [vcfError, setVcfError] = useState('')
  const [step, setStep] = useState<'idle' | 'preview' | 'done'>('idle')

  const supportsContacts = typeof navigator !== 'undefined' && 'contacts' in navigator

  const handlePickContacts = async () => {
    setError('')
    try {
      const contacts: ContactRaw[] = await (navigator as any).contacts.select(['name', 'tel', 'email'], { multiple: true })
      if (!contacts.length) return
      buildRows(contacts)
    } catch (e) { setError('Não foi possível acessar os contatos: ' + String(e)) }
  }

  function buildRows(contacts: ContactRaw[]) {
    const built: ImportRow[] = contacts.filter((c) => c.name?.[0]).map((c) => ({ name: c.name[0], phone: cleanPhone(c.tel?.[0] ?? ''), email: c.email?.[0] ?? '', status: detectStatus(c.name[0]), selected: true }))
    setRows(built); setStep('preview')
  }

  const handleVcf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setVcfError('')
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const contacts = parseVcf(text)
      if (!contacts.length) { setVcfError('Nenhum contato encontrado no arquivo.'); return }
      buildRows(contacts)
    }
    reader.readAsText(file)
  }

  function parseVcf(text: string): ContactRaw[] {
    const contacts: ContactRaw[] = []
    const cards = text.split(/BEGIN:VCARD/i).slice(1)
    for (const card of cards) {
      const nameMatch = card.match(/^FN[^:]*:(.+)$/m) || card.match(/^N[^:]*:(.+)$/m)
      const telMatches = Array.from(card.matchAll(/^TEL[^:]*:(.+)$/gm)).map((m) => m[1].trim())
      const emailMatches = Array.from(card.matchAll(/^EMAIL[^:]*:(.+)$/gm)).map((m) => m[1].trim())
      if (!nameMatch) continue
      let name = nameMatch[1].trim()
      if (name.includes(';')) { const parts = name.split(';').map((p) => p.trim()).filter(Boolean); name = parts.reverse().join(' ') }
      contacts.push({ name: [name], tel: telMatches, email: emailMatches })
    }
    return contacts
  }

  const toggleRow = (i: number) => setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, selected: !r.selected } : r))
  const toggleStatus = (i: number) => setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, status: r.status === 'interested' ? 'purchased' : 'interested' } : r))
  const toggleAll = (val: boolean) => setRows((prev) => prev.map((r) => ({ ...r, selected: val })))

  const handleImport = async () => {
    const selected = rows.filter((r) => r.selected)
    if (!selected.length) { setError('Selecione ao menos um contato.'); return }
    setImporting(true); setError('')
    const today = format(new Date(), 'yyyy-MM-dd')
    try {
      const { error: err } = await supabase.from('customers').insert(selected.map((r) => ({ name: r.name, phone: r.phone || null, email: r.email || null, status: r.status, service_date: today })))
      if (err) throw new Error(err.message)
      setImportedCount(selected.length); setDone(true); setStep('done')
    } catch (e) { setError(String(e)) } finally { setImporting(false) }
  }

  const selectedCount = rows.filter((r) => r.selected).length

  if (step === 'done') {
    return (
      <div className="max-w-lg mx-auto text-center py-16 space-y-6">
        <div className="text-6xl">✅</div>
        <h1 className="text-2xl font-bold text-white">{importedCount} clientes importados!</h1>
        <p className="text-slate-400">Todos os contatos foram salvos no banco de dados.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/clientes/customers" className="btn-primary">Ver clientes</Link>
          <button onClick={() => { setStep('idle'); setRows([]) }} className="btn-secondary">Importar mais</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <nav className="flex items-center gap-2 text-sm text-slate-400">
        <Link href="/clientes" className="hover:text-white transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-white">Importar Contatos</span>
      </nav>
      <div><h1 className="text-2xl font-bold text-white">Importar da Agenda</h1><p className="text-slate-400 text-sm mt-1">Detecta automaticamente: <span className="text-amber-400">Cliente X</span> → Interessado · <span className="text-green-400">Cliente 001</span> → Comprou</p></div>

      {step === 'idle' && (
        <div className="space-y-4">
          {supportsContacts && (<button onClick={handlePickContacts} className="w-full card border-blue-700/50 hover:border-blue-500 hover:bg-blue-900/10 transition-all flex items-center gap-4 p-5 cursor-pointer"><div className="w-12 h-12 rounded-2xl bg-blue-900/50 flex items-center justify-center text-2xl flex-shrink-0">📱</div><div className="text-left"><p className="font-semibold text-white">Abrir agenda do celular</p><p className="text-slate-400 text-sm mt-0.5">Selecione vários contatos de uma vez</p></div></button>)}
          <label className="w-full card border-slate-600 hover:border-slate-500 hover:bg-slate-700/30 transition-all flex items-center gap-4 p-5 cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-slate-700 flex items-center justify-center text-2xl flex-shrink-0">📂</div>
            <div className="text-left flex-1"><p className="font-semibold text-white">Importar arquivo .vcf</p><p className="text-slate-400 text-sm mt-0.5">Exporte seus contatos e importe aqui</p></div>
            <input type="file" accept=".vcf,text/vcard" onChange={handleVcf} className="hidden" />
          </label>
          {vcfError && <p className="text-red-400 text-sm">{vcfError}</p>}
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      )}

      {step === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2"><button onClick={() => toggleAll(true)} className="text-xs btn-secondary py-1 px-3">Todos</button><button onClick={() => toggleAll(false)} className="text-xs btn-secondary py-1 px-3">Nenhum</button></div>
            <p className="text-slate-400 text-sm">{selectedCount} de {rows.length} selecionados</p>
          </div>
          <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
            {rows.map((row, i) => (
              <div key={i} className={`card flex items-center gap-3 p-3 cursor-pointer transition-all ${row.selected ? 'border-slate-600' : 'border-slate-700/30 opacity-50'}`} onClick={() => toggleRow(i)}>
                <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center ${row.selected ? 'bg-blue-600 border-blue-600' : 'border-slate-600'}`}>{row.selected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}</div>
                <div className="flex-1 min-w-0"><p className="text-white font-medium text-sm truncate">{row.name}</p>{row.phone && <p className="text-slate-400 text-xs">{row.phone}</p>}</div>
                <button onClick={(e) => { e.stopPropagation(); toggleStatus(i) }} className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${row.status === 'purchased' ? 'bg-green-900/50 text-green-400 border border-green-700/50' : 'bg-amber-900/50 text-amber-400 border border-amber-700/50'}`}>{row.status === 'purchased' ? 'Comprou' : 'Interessado'}</button>
              </div>
            ))}
          </div>
          {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setStep('idle'); setRows([]) }} className="btn-secondary flex-1">Voltar</button>
            <button onClick={handleImport} disabled={importing || selectedCount === 0} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {importing ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Importando...</> : `Importar ${selectedCount} contatos`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
