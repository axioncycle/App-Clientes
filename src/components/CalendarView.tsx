'use client'

import { Customer } from '@/lib/types'
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  getDay,
  isToday,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

interface CalendarViewProps {
  customers: Customer[]
  currentMonth: Date
  selectedDay: Date | null
  onSelectDay: (day: Date | null) => void
}

export default function CalendarView({
  customers,
  currentMonth,
  selectedDay,
  onSelectDay,
}: CalendarViewProps) {
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad = getDay(monthStart)

  const customersOnDay = (day: Date) =>
    customers.filter((c) => c.service_date && isSameDay(parseISO(c.service_date), day))

  const selectedCustomers = selectedDay ? customersOnDay(selectedDay) : []

  return (
    <div>
      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
          <div key={d} className="text-center text-xs text-slate-500 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startPad }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map((day) => {
          const dayCustomers = customersOnDay(day)
          const hasCustomers = dayCustomers.length > 0
          const isSelected = selectedDay ? isSameDay(day, selectedDay) : false
          const todayDay = isToday(day)

          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDay(isSelected ? null : day)}
              className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all ${
                isSelected
                  ? 'bg-blue-700 text-white ring-2 ring-blue-400'
                  : todayDay
                  ? 'bg-amber-900/40 text-amber-300 ring-1 ring-amber-600/50'
                  : hasCustomers
                  ? 'bg-slate-700 text-white hover:bg-slate-600'
                  : 'text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span className="font-medium">{format(day, 'd')}</span>
              {hasCustomers && (
                <div className="flex gap-0.5 mt-0.5">
                  {Array.from({ length: Math.min(dayCustomers.length, 3) }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 h-1 rounded-full ${isSelected ? 'bg-blue-200' : 'bg-blue-400'}`}
                    />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day customers */}
      {selectedDay && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <h4 className="text-sm font-medium text-slate-400 mb-3 capitalize">
            {format(selectedDay, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </h4>
          {selectedCustomers.length === 0 ? (
            <p className="text-slate-500 text-sm">Nenhum atendimento</p>
          ) : (
            <div className="space-y-2">
              {selectedCustomers.map((c) => (
                <Link
                  key={c.id}
                  href={`/customers/${c.id}`}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                  <p className="text-white text-sm">{c.name}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
