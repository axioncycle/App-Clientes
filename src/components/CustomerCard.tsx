import Link from 'next/link'
import { Customer, CustomerSKU } from '@/lib/types'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface CustomerCardProps {
  customer: Customer & { customer_skus?: CustomerSKU[] }
}

export default function CustomerCard({ customer }: CustomerCardProps) {
  const skuCount = customer.customer_skus?.length ?? 0
  const interestSkus = customer.customer_skus?.filter(s => s.type === 'interest') ?? []
  const purchasedSkus = customer.customer_skus?.filter(s => s.type === 'purchased') ?? []

  return (
    <Link href={`/customers/${customer.id}`}>
      <div className="card hover:border-blue-600 hover:bg-slate-750 transition-all duration-200 cursor-pointer group">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
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
          </div>

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
            <svg
              className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {customer.notes && (
          <p className="mt-3 text-slate-500 text-sm line-clamp-2 border-t border-slate-700 pt-3">
            {customer.notes}
          </p>
        )}
      </div>
    </Link>
  )
}
