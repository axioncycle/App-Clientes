'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Customer, CustomerSKU, Tag } from '@/lib/types'
import CustomerCard from '@/components/CustomerCard'

type Tab = 'all' | 'interested' | 'purchased'
type CustomerWithSKUs = Customer & { customer_skus: CustomerSKU[]; tags?: Tag[] }

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerWithSKUs[]>([])
  const [filtered, setFiltered] = useState<CustomerWithSKUs[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('all')
  const [search, setSearch] = useState('')
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [tagFilter, setTagFilter] = useState<string>('all')

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const [{ data, error: err }, { data: tagsData }] = await Promise.all([
          supabase
            .from('customers')
            .select('*, customer_skus(*), customer_tags(tag_id, tags(*))')
            .order('created_at', { ascending: false }),
          supabase.from('tags').select('*').order('name'),
        ])

        if (err) throw err
        // Flatten tags from nested join
        const normalized = ((data ?? []) as (CustomerWithSKUs & {
          customer_tags?: { tag_id: string; tags: Tag }[]
        })[]).map((c) => ({
          ...c,
          tags: (c.customer_tags ?? []).map((ct) => ct.tags).filter(Boolean),
        }))
        setCustomers(normalized as CustomerWithSKUs[])
        if (tagsData) setAllTags(tagsData as Tag[])
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Erro ao carregar clientes')
      } finally {
        setLoading(false)
      }
    }
    fetchCustomers()
  }, [])

  const applyFilter = useCallback(() => {
    let result = customers

    if (tab === 'interested') result = result.filter((c) => c.status === 'interested')
    if (tab === 'purchased') result = result.filter((c) => c.status === 'purchased')

    if (tagFilter !== 'all') {
      result = result.filter((c) => c.tags?.some((t) => t.id === tagFilter))
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((c) => {
        const inName = c.name.toLowerCase().includes(q)
        const inPhone = c.phone?.toLowerCase().includes(q)
        const inEmail = c.email?.toLowerCase().includes(q)
        const inSKU = c.customer_skus?.some((s) => s.sku.toLowerCase().includes(q))
        return inName || inPhone || inEmail || inSKU
      })
    }

    setFiltered(result)
  }, [customers, tab, search, tagFilter])

  useEffect(() => {
    applyFilter()
  }, [applyFilter])

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'all', label: 'Todos', count: customers.length },
    { key: 'interested', label: 'Interessados', count: customers.filter((c) => c.status === 'interested').length },
    { key: 'purchased', label: 'Compraram', count: customers.filter((c) => c.status === 'purchased').length },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Clientes</h1>
          <p className="text-slate-400 text-sm mt-1">{customers.length} clientes cadastrados</p>
        </div>
        <Link href="/customers/new" className="btn-accent flex items-center gap-2 self-start">
          <span className="text-lg font-light">+</span> Novo Cliente
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, telefone, e-mail ou SKU..."
          className="input pl-10"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-slate-400 text-xs font-medium">Tags:</span>
          <button
            onClick={() => setTagFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
              tagFilter === 'all'
                ? 'border-[#1a8cff] bg-[#1a8cff]/20 text-[#1a8cff]'
                : 'border-slate-600 text-slate-400 hover:border-slate-400'
            }`}
          >
            Todas
          </button>
          {allTags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setTagFilter(tagFilter === tag.id ? 'all' : tag.id)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border-2 transition-all"
              style={{
                backgroundColor: tagFilter === tag.id ? tag.color + '33' : tag.color + '11',
                color: tag.color,
                borderColor: tagFilter === tag.id ? tag.color : 'transparent',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-blue-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {t.label}
            <span
              className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                tab === t.key ? 'bg-blue-700 text-blue-200' : 'bg-slate-700 text-slate-400'
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="flex flex-col items-center gap-3">
            <svg className="w-10 h-10 text-blue-500 spinner" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-slate-400">Carregando clientes...</p>
          </div>
        </div>
      ) : error ? (
        <div className="card border-red-700/50 bg-red-900/20 text-center py-10">
          <p className="text-red-400 font-medium">Erro ao carregar clientes</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">{search ? '🔍' : '👥'}</p>
          <p className="text-slate-300 font-medium">
            {search ? 'Nenhum cliente encontrado' : 'Nenhum cliente nesta categoria'}
          </p>
          <p className="text-slate-500 text-sm mt-1">
            {search ? `Sua busca por "${search}" não retornou resultados` : 'Adicione seu primeiro cliente'}
          </p>
          {!search && (
            <Link href="/customers/new" className="btn-accent inline-flex items-center gap-2 mt-4">
              <span>+</span> Novo Cliente
            </Link>
          )}
        </div>
      ) : (
        <>
          <p className="text-slate-400 text-sm">
            {filtered.length} {filtered.length === 1 ? 'cliente encontrado' : 'clientes encontrados'}
            {search && ` para "${search}"`}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((c) => (
              <CustomerCard key={c.id} customer={c} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
