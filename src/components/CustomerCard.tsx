'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Customer, CustomerSKU, Tag } from '@/lib/types'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'

interface CustomerCardProps {
  customer: Customer & { customer_skus?: CustomerSKU[]; tags?: Tag[] }
  onDelete?: (id: string) => void
}

function formatWhatsAppNumber(phone: string): string | null {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return null
  const withoutLeadingZero = digits.startsWith('0') ? digits.slice(1) : digits
  if (withoutLeadingZero.startsWith('55')) return withoutLeadingZero
  return '55' + withoutLeadingZero
}

export default function CustomerCard({ customer, onDelete }: CustomerCardProps) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirming) { setConfirming(true); setTimeout(() => setConfirming(false), 3000); return }
    setDeleting(true)
    await supabase.from('customers').delete().eq('id', customer.id)
    onDelete?.(customer.id)
    setDeleting(false)
  }

  const skuCount = customer.customer_skus?.length ?? 0
  const interestSkus = customer.customer_skus?.filter(s => s.type === 'interest') ?? []
  const purchasedSkus = customer.customer_skus?.filter(s => s.type === 'purchased') ?? []
  const waNumber = customer.phone ? formatWhatsAppNumber(customer.phone) : null

  return (
    <div className="card hover:border-blue-600 hover:bg-slate-750 transition-all duration-200 group">
      <div className="flex items-start justify-between gap-3">
        <Link href={`/customers/${customer.id}`} className="flex-1 min-w-0 cursor-pointer">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors truncate">
              {customer.name}
            </h3>
            <span className={customer.status === 'purchased' ? 'badge-purchased' : 'badge-interested'}>
              {customer.status === 'purchased' ? 'Comprou' : 'Interessado'}
            </span>
          </div>

          <div className="mt-2 space-y-1">
            {customer.phone && (
              <p className="text-slate-400 text-sm flex items-center gap-1.5">
                <span>📱</span> {customer.phone}
              </p>
            )}
              {customer.email && (
                <p className="text-slate-400 text-sm flex items-center gap-1.5 truncate">
                  <span>✉️</span> {customer.email}
                </p>
              )}
              {customer.service_date && (
                <p className="text-slate-400 text-sm flex items-center gap-1.5">
                  <span>📅</span>{' '}
                  {format(parseISO(customer.service_date), "d 'de' MMM 'de' yyyy", { locale: ptBR })}
                </p>
              )}
          </div>
        </Link>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {skuCount > 0 && (
            <div className="text-right">
              {interestSkus.length > 0 && (
                <p className="text-xs text-amber-400">
                  {interestSkus.length} SKU{interestSkus.length !== 1 ? 's' : ''} interesse
                </p>
              )}
              {purchasedSkus.length > 0 && (
                <p className="text-xs text-green-400">
                  {purchasedSkus.length} SKU{purchasedSkus.length !== 1 ? 's' : ''} comprado{purchasedSkus.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}
          <div className="flex items-center gap-1.5">
            {waNumber && (
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-900/40 hover:bg-green-800/60 text-green-400 transition-colors"
                title="WhatsApp"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            )}
            <Link
              href={`/customers/${customer.id}?edit=1`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[#1a8cff]/20 text-gray-400 hover:text-[#1a8cff] transition-colors"
              title="Editar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                confirming
                  ? 'bg-red-600 text-white'
                  : 'hover:bg-red-900/30 text-gray-500 hover:text-red-400'
              }`}
              title={confirming ? 'Confirmar exclusão?' : 'Apagar'}
            >
              {deleting
                ? <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                : confirming ? <span className="text-xs font-bold">!</span>
                : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              }
            </button>
          </div>
        </div>
      </div>

      {customer.tags && customer.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-700 pt-3">
          {customer.tags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ backgroundColor: tag.color + '33', color: tag.color }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
              {tag.name}
            </span>
          ))}
        </div>
      )}
      {customer.notes && (
        <p className="mt-3 text-slate-500 text-sm line-clamp-2 border-t border-slate-700 pt-3">
          {customer.notes}
        </p>
      )}
    </div>
  )
}
