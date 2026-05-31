'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Customer, CustomerSKU, PipelineStage } from '@/lib/types'
import * as XLSX from 'xlsx'

type CustomerWithSKUs = Customer & { customer_skus: CustomerSKU[] }

const STAGE_LABELS: Record<PipelineStage, string> = {
  contato_inicial: 'Contato Inicial ☎️',
  negociando: 'Negociando 🚴‍♂️',
  separando_envio: 'Separando Envio 🎁',
  enviado: 'ENVIADO 🚀',
}

export default function ExportarPage() {
  const [customers, setCustomers] = useState<CustomerWithSKUs[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'interested' | 'purchased'>('all')
  const [stageFilter, setStageFilter] = useState<PipelineStage | 'all'>('all')

  useEffect(() => {
    async function fetchAll() {
      try {
        const { data, error: err } = await supabase.from('customers').select('*, customer_skus(*)').order('created_at', { ascending: false })
        if (err) throw err
        setCustomers((data ?? []) as CustomerWithSKUs[])
      } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Erro ao carregar dados') } finally { setLoading(false) }
    }
    fetchAll()
  }, [])

  const filtered = useCallback(() => {
    let result = customers
    if (statusFilter !== 'all') result = result.filter((c) => c.status === statusFilter)
    if (stageFilter !== 'all') result = result.filter((c) => (c.pipeline_stage ?? 'contato_inicial') === stageFilter)
    if (dateFrom) result = result.filter((c) => c.service_date && c.service_date >= dateFrom)
    if (dateTo) result = result.filter((c) => c.service_date && c.service_date <= dateTo)
    return result
  }, [customers, statusFilter, stageFilter, dateFrom, dateTo])

  const exportedCustomers = filtered()

  const handleExcelExport = () => {
    const wb = XLSX.utils.book_new()
    const customersRows = exportedCustomers.map((c) => ({ Nome: c.name, Telefone: c.phone ?? '', Email: c.email ?? '', Status: c.status === 'purchased' ? 'Comprou' : 'Interessado', 'Funil (Estágio)': STAGE_LABELS[c.pipeline_stage ?? 'contato_inicial'], 'Data Atendimento': c.service_date ?? '', 'Data Compra': c.purchase_date ?? '', Notas: c.notes ?? '', 'Total SKUs': c.customer_skus?.length ?? 0, 'Cadastrado em': c.created_at ? c.created_at.slice(0, 10) : '' }))
    const wsCustomers = XLSX.utils.json_to_sheet(customersRows)
    XLSX.utils.book_append_sheet(wb, wsCustomers, 'Clientes')
    const skuRows: Record<string, string | number | null>[] = []
    for (const c of exportedCustomers) { for (const sku of c.customer_skus ?? []) { skuRows.push({ Cliente: c.name, Telefone: c.phone ?? '', SKU: sku.sku, Descrição: sku.description ?? '', Quantidade: sku.quantity, Tipo: sku.type === 'purchased' ? 'Comprado' : 'Interesse', 'Preço Unit. (R$)': sku.unit_price ?? '' }) } }
    if (skuRows.length > 0) { const wsSkus = XLSX.utils.json_to_sheet(skuRows); XLSX.utils.book_append_sheet(wb, wsSkus, 'SKUs') }
    XLSX.writeFile(wb, `clientes_axion_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  const handleCSVExport = () => {
    const header = ['Nome','Telefone','Email','Status','Funil','Data Atendimento','Data Compra','Notas','Total SKUs','Cadastrado em']
    const rows = exportedCustomers.map((c) => [c.name, c.phone ?? '', c.email ?? '', c.status === 'purchased' ? 'Comprou' : 'Interessado', STAGE_LABELS[c.pipeline_stage ?? 'contato_inicial'], c.service_date ?? '', c.purchase_date ?? '', (c.notes ?? '').replace(/"/g, '""'), String(c.customer_skus?.length ?? 0), c.created_at ? c.created_at.slice(0, 10) : ''])
    const csvContent = [header, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `clientes_axion_${new Date().toISOString().slice(0, 10)}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return (<div className="flex items-center justify-center min-h-64"><svg className="w-10 h-10 text-blue-500 spinner" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div>)
  if (error) return (<div className="card border-red-700/50 bg-red-900/20 text-center py-10"><p className="text-red-400">{error}</p></div>)

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white flex items-center gap-2"><span>📤</span> Exportar Relatório</h1><p className="text-slate-400 text-sm mt-1">Exporte a lista de clientes em diferentes formatos</p></div>
      <div className="card space-y-4">
        <h2 className="text-base font-semibold text-white border-b border-slate-700 pb-3">Filtros</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="label">Data atendimento — de</label><input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input" /></div>
          <div><label className="label">Data atendimento — até</label><input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input" /></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="label">Status</label><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="input"><option value="all">Todos</option><option value="interested">Interessado</option><option value="purchased">Comprou</option></select></div>
          <div><label className="label">Estágio do funil</label><select value={stageFilter} onChange={(e) => setStageFilter(e.target.value as typeof stageFilter)} className="input"><option value="all">Todos</option>{(Object.entries(STAGE_LABELS) as [PipelineStage, string][]).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}</select></div>
        </div>
        <div className="flex items-center gap-2 p-3 bg-[#1a8cff]/10 border border-[#1a8cff]/30 rounded-xl">
          <span className="text-[#1a8cff] text-lg">ℹ️</span>
          <p className="text-slate-300 text-sm"><span className="font-bold text-white">{exportedCustomers.length}</span> clientes serão exportados</p>
          {(dateFrom || dateTo || statusFilter !== 'all' || stageFilter !== 'all') && (<button onClick={() => { setDateFrom(''); setDateTo(''); setStatusFilter('all'); setStageFilter('all') }} className="ml-auto text-xs text-slate-400 hover:text-white underline">Limpar filtros</button>)}
        </div>
      </div>
      <div className="card space-y-4">
        <h2 className="text-base font-semibold text-white border-b border-slate-700 pb-3">Formato de exportação</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button onClick={handleExcelExport} disabled={exportedCustomers.length === 0} className="flex flex-col items-center gap-3 p-5 bg-[#0a0a0a] border border-[#2a2a2a] hover:border-green-500/50 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"><span className="text-4xl">📊</span><div className="text-center"><p className="text-white font-semibold group-hover:text-green-300 transition-colors">Excel (.xlsx)</p><p className="text-slate-500 text-xs mt-1">Planilha completa com clientes e SKUs</p></div></button>
          <button onClick={handleCSVExport} disabled={exportedCustomers.length === 0} className="flex flex-col items-center gap-3 p-5 bg-[#0a0a0a] border border-[#2a2a2a] hover:border-blue-500/50 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"><span className="text-4xl">📄</span><div className="text-center"><p className="text-white font-semibold group-hover:text-blue-300 transition-colors">CSV</p><p className="text-slate-500 text-xs mt-1">Compatível com qualquer planilha</p></div></button>
          <button onClick={() => window.print()} disabled={exportedCustomers.length === 0} className="flex flex-col items-center gap-3 p-5 bg-[#0a0a0a] border border-[#2a2a2a] hover:border-red-500/50 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"><span className="text-4xl">🖨️</span><div className="text-center"><p className="text-white font-semibold group-hover:text-red-300 transition-colors">PDF (impressão)</p><p className="text-slate-500 text-xs mt-1">Abre o diálogo de impressão</p></div></button>
        </div>
      </div>
    </div>
  )
}
