'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Customer, CustomerSKU, CustomerFormData, SKUFormItem } from '@/lib/types'
import SKUList from './SKUList'

interface CustomerFormProps {
  customer?: Customer & { customer_skus?: CustomerSKU[] }
  mode: 'create' | 'edit'
}

const emptyForm = (): CustomerFormData => ({
  name: '',
  phone: '',
  email: '',
  status: 'interested',
  service_date: '',
  purchase_date: '',
  notes: '',
  skus: [],
})

export default function CustomerForm({ customer, mode }: CustomerFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const initialForm: CustomerFormData = customer
    ? {
        name: customer.name,
        phone: customer.phone ?? '',
        email: customer.email ?? '',
        status: customer.status,
        service_date: customer.service_date ?? '',
        purchase_date: customer.purchase_date ?? '',
        notes: customer.notes ?? '',
        skus: (customer.customer_skus ?? []).map((s) => ({
          id: s.id,
          sku: s.sku,
          description: s.description ?? '',
          quantity: s.quantity,
          type: s.type,
          unit_price: s.unit_price !== null ? String(s.unit_price) : '',
        })),
      }
    : emptyForm()

  const [form, setForm] = useState<CustomerFormData>(initialForm)

  const updateField = <K extends keyof CustomerFormData>(key: K, value: CustomerFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('O nome do cliente é obrigatório.')
      return
    }
    setSaving(true)
    setError(null)

    try {
      const customerPayload = {
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        status: form.status,
        service_date: form.service_date || null,
        purchase_date: form.purchase_date || null,
        notes: form.notes.trim() || null,
        updated_at: new Date().toISOString(),
      }

      let customerId: string

      if (mode === 'create') {
        const { data, error: err } = await supabase
          .from('customers')
          .insert(customerPayload)
          .select('id')
          .single()
        if (err) throw err
        customerId = data.id
      } else {
        const { error: err } = await supabase
          .from('customers')
          .update(customerPayload)
          .eq('id', customer!.id)
        if (err) throw err
        customerId = customer!.id

        // Delete all existing SKUs for this customer and re-insert
        const { error: delErr } = await supabase
          .from('customer_skus')
          .delete()
          .eq('customer_id', customerId)
        if (delErr) throw delErr
      }

      // Insert SKUs
      const validSkus = form.skus.filter((s) => s.sku.trim())
      if (validSkus.length > 0) {
        const skuPayload = validSkus.map((s) => ({
          customer_id: customerId,
          sku: s.sku.trim(),
          description: s.description.trim() || null,
          quantity: s.quantity,
          type: s.type,
          unit_price: s.unit_price ? parseFloat(s.unit_price.replace(',', '.')) : null,
        }))

        const { error: skuErr } = await supabase.from('customer_skus').insert(skuPayload)
        if (skuErr) throw skuErr
      }

      router.push(`/customers/${customerId}`)
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar cliente')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!customer) return
    setDeleting(true)
    try {
      const { error: err } = await supabase.from('customers').delete().eq('id', customer.id)
      if (err) throw err
      router.push('/customers')
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao excluir cliente')
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-4 flex items-start gap-3">
          <span className="text-red-400 text-xl flex-shrink-0">⚠️</span>
          <div>
            <p className="text-red-300 font-medium text-sm">Erro</p>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Basic info */}
      <div className="card space-y-4">
        <h2 className="text-base font-semibold text-white border-b border-slate-700 pb-3">
          Informações do Cliente
        </h2>

        <div>
          <label className="label">Nome *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Nome completo do cliente"
            className="input"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Telefone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="(11) 99999-9999"
              className="input"
            />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="cliente@email.com"
              className="input"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="label">Status</label>
          <div className="flex gap-3">
            {[
              { value: 'interested', label: 'Interessado', icon: '🔍', color: 'amber' },
              { value: 'purchased', label: 'Comprou', icon: '✅', color: 'green' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateField('status', opt.value as 'interested' | 'purchased')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-medium text-sm ${
                  form.status === opt.value
                    ? opt.color === 'amber'
                      ? 'border-amber-500 bg-amber-900/30 text-amber-300'
                      : 'border-green-500 bg-green-900/30 text-green-300'
                    : 'border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500'
                }`}
              >
                <span>{opt.icon}</span> {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="card space-y-4">
        <h2 className="text-base font-semibold text-white border-b border-slate-700 pb-3">Datas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Data de Atendimento</label>
            <input
              type="date"
              value={form.service_date}
              onChange={(e) => updateField('service_date', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">Data de Compra</label>
            <input
              type="date"
              value={form.purchase_date}
              onChange={(e) => updateField('purchase_date', e.target.value)}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* SKUs */}
      <div className="card">
        <SKUList skus={form.skus} onChange={(skus: SKUFormItem[]) => updateField('skus', skus)} />
      </div>

      {/* Notes */}
      <div className="card space-y-3">
        <h2 className="text-base font-semibold text-white border-b border-slate-700 pb-3">
          Observações
        </h2>
        <div>
          <label className="label">Notas</label>
          <textarea
            value={form.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="Preferências, histórico, informações relevantes..."
            rows={4}
            className="input resize-none"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pb-6">
        <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
          {saving ? (
            <>
              <svg className="w-4 h-4 spinner" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Salvando...
            </>
          ) : (
            <>
              <span>💾</span> {mode === 'create' ? 'Cadastrar Cliente' : 'Salvar Alterações'}
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary flex items-center justify-center gap-2"
        >
          Cancelar
        </button>

        {mode === 'edit' && (
          <div>
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="btn-danger w-full flex items-center justify-center gap-2"
              >
                <span>🗑</span> Excluir
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="btn-danger flex items-center gap-2"
                >
                  {deleting ? 'Excluindo...' : 'Confirmar exclusão'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="btn-secondary"
                >
                  Não
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </form>
  )
}
