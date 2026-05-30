'use client'

import Link from 'next/link'
import { Customer, FollowUp } from '@/lib/types'
import { format, parseISO, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type CustomerWithFollowUps = Customer & { follow_ups: FollowUp[] }

interface FollowUpListProps {
  customers: CustomerWithFollowUps[]
  onRegisterContact?: (customerId: string, note: string) => void
  compact?: boolean
}

export default function FollowUpList({ customers, onRegisterContact, compact = false }: FollowUpListProps) {
  if (customers.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-slate-500 text-sm">Nenhum cliente pendente de follow-up</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {customers.map((c) => {
        const sortedFU = [...(c.follow_ups ?? [])].sort(
          (a, b) => new Date(b.contact_date).getTime() - new Date(a.contact_date).getTime()
        )
        const lastContact = sortedFU[0]?.contact_date ?? null
        const daysSince = lastContact
          ? differenceInDays(new Date(), parseISO(lastContact))
          : differenceInDays(new Date(), parseISO(c.created_at))

        const urgency = daysSince >= 90 ? 'red' : daysSince >= 60 ? 'orange' : 'amber'
        const badgeClass =
          urgency === 'red'
            ? 'bg-red-900/40 text-red-400'
            : urgency === 'orange'
            ? 'bg-orange-900/40 text-orange-400'
            : 'bg-amber-900/40 text-amber-400'

        return (
          <div
            key={c.id}
            className="flex items-center justify-between gap-3 p-3 bg-slate-700/30 rounded-xl border border-slate-700/50"
          >
            <div className="flex-1 min-w-0">
              <Link href={`/customers/${c.id}`} className="font-medium text-white hover:text-blue-300 transition-colors text-sm">
                {c.name}
              </Link>
              {!compact && (
                <p className="text-slate-500 text-xs mt-0.5">
                  {lastContact
                    ? `Contato em ${format(parseISO(lastContact), "d MMM yyyy", { locale: ptBR })}`
                    : 'Nunca contatado'}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeClass}`}>
                {daysSince}d
              </span>
              {onRegisterContact && (
                <button
                  onClick={() => onRegisterContact(c.id, '')}
                  className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded hover:bg-blue-900/20 transition-colors"
                >
                  Contatar
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
