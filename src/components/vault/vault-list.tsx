'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, Plus, SortAsc, Lock, X } from 'lucide-react'
import { VaultItemRow, type VaultItemRow as VaultItemRowType } from './vault-item'
import { VaultForm } from './vault-form'
import type { VaultItem } from '@/types'

type Category = VaultItem['category'] | 'all'
type SortOption = 'name' | 'updated_at' | 'created_at' | 'category'

const CATEGORY_FILTERS: { value: Category; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'pro', label: 'Pro' },
  { value: 'personal', label: 'Personnel' },
  { value: 'api_keys', label: 'Clés API' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'other', label: 'Autre' },
]

interface ToastState {
  id: number
  message: string
}

interface VaultListProps {
  projectId: string
}

export function VaultList({ projectId }: VaultListProps) {
  const [items, setItems] = useState<VaultItemRowType[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<Category>('all')
  const [sortBy, setSortBy] = useState<SortOption>('name')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<VaultItemRowType | null>(null)
  const [deleteItem, setDeleteItem] = useState<VaultItemRowType | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [toasts, setToasts] = useState<ToastState[]>([])
  const toastIdRef = useRef(0)

  const showToast = useCallback((message: string) => {
    const id = ++toastIdRef.current
    setToasts(prev => [...prev, { id, message }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2000)
  }, [])

  const fetchItems = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/vault?project_id=${projectId}`)
    if (res.ok) {
      const json = await res.json()
      setItems(json.data || [])
    }
    setLoading(false)
  }, [projectId])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const handleDelete = async () => {
    if (!deleteItem) return
    setDeleting(true)
    const res = await fetch(`/api/vault/${deleteItem.id}`, { method: 'DELETE' })
    if (res.ok) {
      setItems(prev => prev.filter(i => i.id !== deleteItem.id))
      showToast('Entrée supprimée')
    }
    setDeleting(false)
    setDeleteItem(null)
  }

  const handleSaved = () => {
    setShowForm(false)
    setEditItem(null)
    fetchItems()
  }

  // Filter + sort
  const filtered = items
    .filter(item => {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          item.name.toLowerCase().includes(q) ||
          (item.url?.toLowerCase().includes(q) ?? false) ||
          (item.username?.toLowerCase().includes(q) ?? false)
        )
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'fr')
      if (sortBy === 'category') return a.category.localeCompare(b.category)
      if (sortBy === 'created_at') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-7 py-4 border-b border-[#2A2D37] flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555A65]" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#161922] border border-[#2A2D37] rounded-lg text-sm text-[#F7F8F8] placeholder:text-[#555A65] focus:outline-none focus:border-[#5E6AD2] transition-colors"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5">
          <SortAsc className="w-4 h-4 text-[#555A65]" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortOption)}
            className="bg-[#161922] border border-[#2A2D37] rounded-lg text-sm text-[#8A8F98] px-2 py-2 focus:outline-none focus:border-[#5E6AD2] cursor-pointer"
          >
            <option value="name">Nom</option>
            <option value="updated_at">Date modif.</option>
            <option value="created_at">Date création</option>
            <option value="category">Catégorie</option>
          </select>
        </div>

        {/* Add button */}
        <button
          onClick={() => { setEditItem(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-[#5E6AD2] hover:bg-[#6B76E0] text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle entrée
        </button>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-2 px-7 py-3 border-b border-[#2A2D37] overflow-x-auto scrollbar-thin">
        {CATEGORY_FILTERS.map(cat => (
          <button
            key={cat.value}
            onClick={() => setCategoryFilter(cat.value)}
            className={`flex-none px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              categoryFilter === cat.value
                ? 'bg-[#5E6AD2] border-[#5E6AD2] text-white'
                : 'bg-[#161922] border-[#2A2D37] text-[#8A8F98] hover:border-[#5E6AD2] hover:text-[#F7F8F8]'
            }`}
          >
            {cat.label}
          </button>
        ))}
        {(categoryFilter !== 'all' || search) && (
          <button
            onClick={() => { setCategoryFilter('all'); setSearch('') }}
            className="flex-none flex items-center gap-1 px-2 py-1.5 text-xs text-[#555A65] hover:text-[#8A8F98] transition-colors"
          >
            <X className="w-3 h-3" />
            Effacer filtres
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-7 py-6">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-[#161922] border border-[#2A2D37] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Lock className="w-14 h-14 text-[#2A2D37] mb-4" />
            <h3 className="text-base font-medium text-[#8A8F98] mb-1">
              {search || categoryFilter !== 'all' ? 'Aucune entrée trouvée' : 'Aucune entrée'}
            </h3>
            <p className="text-sm text-[#555A65]">
              {search || categoryFilter !== 'all'
                ? 'Essayez un autre terme ou filtre'
                : 'Ajoutez votre premier mot de passe sécurisé'
              }
            </p>
            {!search && categoryFilter === 'all' && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#5E6AD2] hover:bg-[#6B76E0] text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nouvelle entrée
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(item => (
              <VaultItemRow
                key={item.id}
                item={item}
                onEdit={i => { setEditItem(i); setShowForm(true) }}
                onDelete={i => setDeleteItem(i)}
                onToast={showToast}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit form */}
      {showForm && (
        <VaultForm
          projectId={projectId}
          item={editItem ?? undefined}
          onClose={() => { setShowForm(false); setEditItem(null) }}
          onSave={handleSaved}
        />
      )}

      {/* Delete confirmation */}
      {deleteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteItem(null)} />
          <div className="relative bg-[#161922] border border-[#2A2D37] rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-semibold text-[#F7F8F8] mb-2">Supprimer l'entrée</h3>
            <p className="text-sm text-[#8A8F98] mb-5">
              Supprimer <span className="font-medium text-[#F7F8F8]">{deleteItem.name}</span> ? Cette action est irréversible.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteItem(null)}
                className="px-4 py-2 text-sm font-medium text-[#8A8F98] hover:text-[#F7F8F8] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-[#E5484D] hover:bg-[#F05055] disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="px-4 py-2.5 bg-[#1F232E] border border-[#2A2D37] rounded-full text-sm font-medium text-[#F7F8F8] shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  )
}
