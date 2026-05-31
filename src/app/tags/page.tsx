'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Tag } from '@/lib/types'

const PRESET_COLORS = [
  '#1a8cff',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#f97316',
  '#6b7280',
]

interface TagWithCount extends Tag {
  count: number
}

export default function TagsPage() {
  const [tags, setTags] = useState<TagWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#1a8cff')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchTags = async () => {
    try {
      const { data: tagsData, error: tagsErr } = await supabase
        .from('tags')
        .select('*')
        .order('name')
      if (tagsErr) throw tagsErr

      // Count customers per tag
      const { data: ctData, error: ctErr } = await supabase
        .from('customer_tags')
        .select('tag_id')
      if (ctErr) throw ctErr

      const counts: Record<string, number> = {}
      for (const row of ctData ?? []) {
        counts[row.tag_id] = (counts[row.tag_id] ?? 0) + 1
      }

      setTags((tagsData ?? []).map((t: Tag) => ({ ...t, count: counts[t.id] ?? 0 })))
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('does not exist') || msg.includes('42P01')) {
        setError('MIGRATION_NEEDED')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTags()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    setError(null)
    try {
      const { error: err } = await supabase
        .from('tags')
        .insert({ name: newName.trim(), color: newColor })
      if (err) throw err
      setNewName('')
      setNewColor('#1a8cff')
      await fetchTags()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg.includes('does not exist') || msg.includes('42P01') ? 'MIGRATION_NEEDED' : msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const { error: err } = await supabase.from('tags').delete().eq('id', id)
      if (err) throw err
      setTags((prev) => prev.filter((t) => t.id !== id))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao excluir tag')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>🏷️</span> Tags
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Organize seus clientes com etiquetas coloridas
        </p>
      </div>

      {/* Create tag form */}
      <div className="card space-y-4">
        <h2 className="text-base font-semibold text-white border-b border-slate-700 pb-3">
          Nova Tag
        </h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Nome da tag</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex: VIP, Bicicleta Montanha, Revisão..."
              className="input"
              maxLength={40}
            />
          </div>
          <div>
            <label className="label">Cor</label>
            <div className="flex items-center gap-3 flex-wrap">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    newColor === color ? 'border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-8 h-8 rounded-full cursor-pointer border border-slate-600 bg-transparent"
                title="Cor personalizada"
              />
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: newColor }}
              >
                {newName || 'Prévia'}
              </span>
            </div>
          </div>
          {error === 'MIGRATION_NEEDED' && (
            <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: 'color-mix(in srgb, #f59e0b 10%, transparent)', border: '1px solid #f59e0b55' }}>
              <p className="text-amber-400 font-bold text-sm">⚠️ Tabelas não encontradas no banco</p>
              <p className="text-amber-300 text-xs">Execute o SQL abaixo no <strong>SQL Editor</strong> do Supabase:</p>
              <pre className="text-xs rounded-lg p-3 overflow-x-auto" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>{`alter table customers add column if not exists pipeline_stage text not null default 'primeiro_contato';

create table if not exists tags (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  color text not null default '#1a8cff',
  created_at timestamptz default now()
);

create table if not exists customer_tags (
  customer_id uuid references customers(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (customer_id, tag_id)
);

alter table tags disable row level security;
alter table customer_tags disable row level security;`}</pre>
            </div>
          )}
          {error && error !== 'MIGRATION_NEEDED' && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
          <button
            type="submit"
            disabled={saving || !newName.trim()}
            className="btn-primary flex items-center gap-2"
          >
            {saving ? 'Criando...' : <><span>+</span> Criar Tag</>}
          </button>
        </form>
      </div>

      {/* Tags list */}
      <div className="card space-y-3">
        <h2 className="text-base font-semibold text-white border-b border-slate-700 pb-3">
          Tags existentes
        </h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <svg className="w-8 h-8 text-blue-500 spinner" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : tags.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-6">
            Nenhuma tag criada ainda
          </p>
        ) : (
          <div className="space-y-2">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="text-white font-medium">{tag.name}</span>
                  <span className="text-slate-500 text-xs">
                    {tag.count} {tag.count === 1 ? 'cliente' : 'clientes'}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(tag.id)}
                  disabled={deletingId === tag.id}
                  className="text-slate-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-900/20 text-sm"
                  title="Excluir tag"
                >
                  {deletingId === tag.id ? '...' : '🗑'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
