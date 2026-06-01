'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Tag } from '@/lib/types'

const PRESET_COLORS = ['#1a8cff','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#f97316','#6b7280']

interface TagWithCount extends Tag { count: number }

export default function TagsPage() {
  const [tags, setTags] = useState<TagWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#1a8cff')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('#1a8cff')
  const [editSaving, setEditSaving] = useState(false)

  const fetchTags = async () => {
    try {
      const { data: tagsData, error: tagsErr } = await supabase.from('tags').select('*').order('name')
      if (tagsErr) throw tagsErr
      const { data: ctData, error: ctErr } = await supabase.from('customer_tags').select('tag_id')
      if (ctErr) throw ctErr
      const counts: Record<string, number> = {}
      for (const row of ctData ?? []) { counts[row.tag_id] = (counts[row.tag_id] ?? 0) + 1 }
      setTags((tagsData ?? []).map((t: Tag) => ({ ...t, count: counts[t.id] ?? 0 })))
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('does not exist') || msg.includes('42P01')) { setError('MIGRATION_NEEDED') } else { setError(msg) }
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchTags() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true); setError(null)
    const { error: err } = await supabase.from('tags').insert({ name: newName.trim(), color: newColor })
    if (err) { setError(`${err.message} (${err.code})`) } else { setNewName(''); setNewColor('#1a8cff'); await fetchTags() }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const { error: err } = await supabase.from('tags').delete().eq('id', id)
    if (err) { setError(`${err.message} (${err.code})`) } else { setTags((prev) => prev.filter((t) => t.id !== id)) }
    setDeletingId(null)
  }

  const startEdit = (tag: TagWithCount) => { setEditingId(tag.id); setEditName(tag.name); setEditColor(tag.color) }
  const cancelEdit = () => { setEditingId(null) }

  const handleEditSave = async (id: string) => {
    if (!editName.trim()) return
    setEditSaving(true)
    const { error: err } = await supabase.from('tags').update({ name: editName.trim(), color: editColor }).eq('id', id)
    if (err) {
      setError(`${err.message} (${err.code})`)
    } else {
      setTags((prev) => prev.map((t) => t.id === id ? { ...t, name: editName.trim(), color: editColor } : t))
      cancelEdit()
    }
    setEditSaving(false)
  }

  const btnSave: React.CSSProperties = {
    background: '#1a8cff', color: '#fff', border: 'none',
    borderRadius: '10px', padding: '10px 20px',
    fontWeight: 700, fontSize: '14px', cursor: 'pointer',
  }
  const btnCancel: React.CSSProperties = {
    background: '#1a1a1a', color: '#aaa', border: '1px solid #333',
    borderRadius: '10px', padding: '10px 20px',
    fontWeight: 700, fontSize: '14px', cursor: 'pointer',
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6" style={{ paddingBottom: '80px' }}>
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><span>🏷️</span> Tags</h1>
        <p className="text-slate-400 text-sm mt-1">Organize seus clientes com etiquetas coloridas</p>
      </div>

      <div className="card space-y-4">
        <h2 className="text-base font-semibold text-white border-b border-slate-700 pb-3">Nova Tag</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Nome da tag</label>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex: VIP, Bicicleta Montanha, Revisão..." className="input" maxLength={40} />
          </div>
          <div>
            <label className="label">Cor</label>
            <div className="flex items-center gap-3 flex-wrap">
              {PRESET_COLORS.map((color) => (
                <button key={color} type="button" onClick={() => setNewColor(color)} className={`w-8 h-8 rounded-full border-2 transition-all ${newColor === color ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: color }} />
              ))}
              <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="w-8 h-8 rounded-full cursor-pointer border border-slate-600 bg-transparent" />
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: newColor }}>{newName || 'Prévia'}</span>
            </div>
          </div>
          {error && error !== 'MIGRATION_NEEDED' && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={saving || !newName.trim()} className="btn-primary flex items-center gap-2">
            {saving ? 'Criando...' : <><span>+</span> Criar Tag</>}
          </button>
        </form>
      </div>

      <div className="card space-y-3">
        <h2 className="text-base font-semibold text-white border-b border-slate-700 pb-3">Tags existentes</h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <svg className="w-8 h-8 text-blue-500 spinner" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : tags.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-6">Nenhuma tag criada ainda</p>
        ) : (
          <div className="space-y-2">
            {tags.map((tag) => (
              <div key={tag.id}>
                {editingId === tag.id ? (
                  <div className="p-4 bg-[#0a0a0a] border border-[#1a8cff]/40 rounded-xl space-y-3">
                    <div>
                      <label className="label">Nome</label>
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="input" maxLength={40} autoFocus />
                    </div>
                    <div>
                      <label className="label">Cor</label>
                      <div className="flex items-center gap-2 flex-wrap">
                        {PRESET_COLORS.map((color) => (
                          <button key={color} type="button" onClick={() => setEditColor(color)}
                            className={`w-7 h-7 rounded-full border-2 transition-all ${editColor === color ? 'border-white scale-110' : 'border-transparent'}`}
                            style={{ backgroundColor: color }} />
                        ))}
                        <input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)} className="w-7 h-7 rounded-full cursor-pointer border border-slate-600 bg-transparent" />
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: editColor }}>
                          {editName || 'Prévia'}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-500 text-xs">Alteração aplicada em todos os {tag.count} cliente(s) com esta tag.</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => handleEditSave(tag.id)}
                        disabled={editSaving || !editName.trim()}
                        style={{ ...btnSave, opacity: editSaving || !editName.trim() ? 0.5 : 1 }}
                      >
                        {editSaving ? 'Salvando...' : 'Salvar'}
                      </button>
                      <button type="button" onClick={cancelEdit} style={btnCancel}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                      <span className="text-white font-medium">{tag.name}</span>
                      <span className="text-slate-500 text-xs">{tag.count} {tag.count === 1 ? 'cliente' : 'clientes'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEdit(tag)} className="text-slate-400 hover:text-[#1a8cff] transition-colors p-1.5 rounded-lg hover:bg-[#1a8cff]/10 text-sm" title="Editar">✏️</button>
                      <button onClick={() => handleDelete(tag.id)} disabled={deletingId === tag.id} className="text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-900/20 text-sm" title="Excluir">{deletingId === tag.id ? '...' : '🗑'}</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
