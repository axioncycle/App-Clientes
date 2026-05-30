'use client'

import { SKUFormItem, SKUType } from '@/lib/types'

interface SKUListProps {
  skus: SKUFormItem[]
  onChange: (skus: SKUFormItem[]) => void
}

const emptySKU = (): SKUFormItem => ({
  sku: '',
  description: '',
  quantity: 1,
  type: 'interest',
  unit_price: '',
})

export default function SKUList({ skus, onChange }: SKUListProps) {
  const addSKU = () => {
    onChange([...skus, emptySKU()])
  }

  const removeSKU = (index: number) => {
    onChange(skus.filter((_, i) => i !== index))
  }

  const updateSKU = (index: number, field: keyof SKUFormItem, value: string | number) => {
    const updated = skus.map((sku, i) =>
      i === index ? { ...sku, [field]: value } : sku
    )
    onChange(updated)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300">SKUs / Produtos</h3>
        <button
          type="button"
          onClick={addSKU}
          className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-900/30"
        >
          <span className="text-lg font-light">+</span> Adicionar SKU
        </button>
      </div>

      {skus.length === 0 && (
        <div className="text-center py-8 border border-dashed border-slate-600 rounded-xl">
          <p className="text-slate-500 text-sm">Nenhum SKU adicionado</p>
          <button
            type="button"
            onClick={addSKU}
            className="mt-2 text-blue-400 hover:text-blue-300 text-sm underline"
          >
            Adicionar primeiro SKU
          </button>
        </div>
      )}

      {skus.map((sku, index) => (
        <div
          key={index}
          className="bg-slate-750 border border-slate-600 rounded-xl p-4 space-y-3"
          style={{ backgroundColor: 'rgba(30,41,59,0.8)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Produto {index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeSKU(index)}
              className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-red-900/20 transition-colors"
            >
              <span>🗑</span> Remover
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* SKU Code */}
            <div>
              <label className="label">Código SKU *</label>
              <input
                type="text"
                value={sku.sku}
                onChange={(e) => updateSKU(index, 'sku', e.target.value)}
                placeholder="ex: BIKE-001"
                className="input text-sm"
              />
            </div>

            {/* Type */}
            <div>
              <label className="label">Tipo</label>
              <select
                value={sku.type}
                onChange={(e) => updateSKU(index, 'type', e.target.value as SKUType)}
                className="input text-sm"
              >
                <option value="interest">Interesse</option>
                <option value="purchased">Comprado</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label">Descrição</label>
            <input
              type="text"
              value={sku.description}
              onChange={(e) => updateSKU(index, 'description', e.target.value)}
              placeholder="ex: Bicicleta Speed 29"
              className="input text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Quantity */}
            <div>
              <label className="label">Quantidade</label>
              <input
                type="number"
                min="1"
                value={sku.quantity}
                onChange={(e) => updateSKU(index, 'quantity', parseInt(e.target.value) || 1)}
                className="input text-sm"
              />
            </div>

            {/* Price */}
            <div>
              <label className="label">Preço unitário (R$)</label>
              <input
                type="text"
                value={sku.unit_price}
                onChange={(e) => updateSKU(index, 'unit_price', e.target.value)}
                placeholder="0,00"
                className="input text-sm"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
