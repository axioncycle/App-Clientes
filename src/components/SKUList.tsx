'use client'

import { useState, useRef, useEffect } from 'react'
import { SKUFormItem, SKUType } from '@/lib/types'
import { searchSKU, SKUItem } from '@/lib/skuCatalog'

interface SKUListProps {
  skus: SKUFormItem[]
  onChange: (skus: SKUFormItem[]) => void
}

const emptySKU = (): SKUFormItem => ({ sku: '', description: '', quantity: 1, type: 'interest', unit_price: '' })

function SKUAutocomplete({ value, onChange }: { value: string; onChange: (name: string) => void }) {
  const [results, setResults] = useState<SKUItem[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setResults(searchSKU(value))
    setOpen(!!value.trim())
  }, [value])

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => value.trim() && setOpen(true)}
        placeholder="Digite para buscar produto..."
        className="input text-sm w-full"
      />
      {open && results.length > 0 && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
          {results.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => { onChange(item.name); setOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#252525] text-left transition-colors"
            >
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1a8cff]/20 text-[#1a8cff] flex-shrink-0">{item.category}</span>
              <span className="text-sm text-white truncate">{item.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SKUList({ skus, onChange }: SKUListProps) {
  const addSKU = () => onChange([...skus, emptySKU()])
  const removeSKU = (i: number) => onChange(skus.filter((_, idx) => idx !== i))
  const updateSKU = (i: number, field: keyof SKUFormItem, value: string | number) =>
    onChange(skus.map((s, idx) => idx === i ? { ...s, [field]: value } : s))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300">SKUs / Produtos</h3>
        <button type="button" onClick={addSKU} className="flex items-center gap-1.5 text-sm text-[#1a8cff] hover:text-blue-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-900/20">
          <span className="text-lg font-light">+</span> Adicionar
        </button>
      </div>

      {skus.length === 0 && (
        <div className="text-center py-8 border border-dashed border-[#2a2a2a] rounded-xl">
          <p className="text-gray-500 text-sm">Nenhum produto adicionado</p>
          <button type="button" onClick={addSKU} className="mt-2 text-[#1a8cff] hover:text-blue-300 text-sm underline">Adicionar produto</button>
        </div>
      )}

      {skus.map((sku, index) => (
        <div key={index} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Produto {index + 1}</span>
            <button type="button" onClick={() => removeSKU(index)} className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-red-900/20 transition-colors">
              🗑 Remover
            </button>
          </div>

          <div>
            <label className="label">Produto *</label>
            <SKUAutocomplete value={sku.sku} onChange={(v) => updateSKU(index, 'sku', v)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Tipo</label>
              <select value={sku.type} onChange={(e) => updateSKU(index, 'type', e.target.value as SKUType)} className="input text-sm">
                <option value="interest">Interesse</option>
                <option value="purchased">Comprado</option>
              </select>
            </div>
            <div>
              <label className="label">Quantidade</label>
              <input type="number" min="1" value={sku.quantity} onChange={(e) => updateSKU(index, 'quantity', parseInt(e.target.value) || 1)} className="input text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Preço (R$)</label>
              <input type="text" value={sku.unit_price} onChange={(e) => updateSKU(index, 'unit_price', e.target.value)} placeholder="0,00" className="input text-sm" />
            </div>
            <div>
              <label className="label">Observação</label>
              <input type="text" value={sku.description} onChange={(e) => updateSKU(index, 'description', e.target.value)} placeholder="Opcional" className="input text-sm" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
