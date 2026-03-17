'use client'

import { useState } from 'react'
import { Eye, EyeOff, Copy, Check, MoreHorizontal, Pencil, Trash2, ExternalLink } from 'lucide-react'
import type { VaultItem } from '@/types'

const CATEGORY_COLORS: Record<VaultItem['category'], string> = {
  pro: '#5E6AD2',
  personal: '#F472B6',
  api_keys: '#FBBF24',
  crypto: '#34D399',
  other: '#9CA3AF',
}

const CATEGORY_LABELS: Record<VaultItem['category'], string> = {
  pro: 'Pro',
  personal: 'Personnel',
  api_keys: 'API Keys',
  crypto: 'Crypto',
  other: 'Autre',
}

export interface VaultItemRow extends VaultItem {
  password: string
}

interface VaultItemProps {
  item: VaultItemRow
  onEdit: (item: VaultItemRow) => void
  onDelete: (item: VaultItemRow) => void
  onToast: (message: string) => void
}

function getFaviconUrl(url: string | null): string | null {
  if (!url) return null
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
  } catch {
    return null
  }
}

export function VaultItemRow({ item, onEdit, onDelete, onToast }: VaultItemProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [copiedField, setCopiedField] = useState<'username' | 'password' | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [faviconError, setFaviconError] = useState(false)

  const faviconUrl = !faviconError ? getFaviconUrl(item.url) : null
  const categoryColor = CATEGORY_COLORS[item.category]
  const categoryLabel = CATEGORY_LABELS[item.category]

  const copyToClipboard = async (text: string, field: 'username' | 'password') => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    onToast('Copié !')
    setTimeout(() => setCopiedField(null), 1500)
  }

  return (
    <div className="group flex items-center gap-4 px-4 py-3.5 bg-[#161922] border border-[#2A2D37] rounded-xl hover:border-[#3A3D47] transition-all">
      {/* Favicon / Icon */}
      <div className="flex-none w-9 h-9 rounded-lg bg-[#1F232E] border border-[#2A2D37] flex items-center justify-center overflow-hidden">
        {faviconUrl ? (
          <img
            src={faviconUrl}
            alt=""
            width={20}
            height={20}
            onError={() => setFaviconError(true)}
            className="w-5 h-5 object-contain"
          />
        ) : (
          <span className="text-sm font-semibold text-[#8A8F98]">
            {item.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Name + URL */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#F7F8F8] truncate">{item.name}</span>
          <span
            className="flex-none text-[10px] font-medium px-1.5 py-0.5 rounded-full"
            style={{ color: categoryColor, backgroundColor: `${categoryColor}18` }}
          >
            {categoryLabel}
          </span>
        </div>
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-[#555A65] hover:text-[#8A8F98] transition-colors mt-0.5 max-w-xs truncate"
            onClick={e => e.stopPropagation()}
          >
            <ExternalLink className="w-3 h-3 flex-none" />
            <span className="truncate">{item.url.replace(/^https?:\/\//, '')}</span>
          </a>
        )}
      </div>

      {/* Username */}
      <div className="hidden sm:flex items-center gap-2 min-w-0 w-44">
        <span className="text-sm text-[#8A8F98] truncate flex-1">
          {item.username || <span className="text-[#555A65]">—</span>}
        </span>
        {item.username && (
          <button
            type="button"
            onClick={() => copyToClipboard(item.username!, 'username')}
            className="flex-none p-1 rounded text-[#555A65] hover:text-[#8A8F98] opacity-0 group-hover:opacity-100 transition-all"
            title="Copier l'identifiant"
          >
            {copiedField === 'username'
              ? <Check className="w-3.5 h-3.5 text-[#46A758]" />
              : <Copy className="w-3.5 h-3.5" />
            }
          </button>
        )}
      </div>

      {/* Password */}
      <div className="flex items-center gap-1.5">
        <span className={`text-sm font-mono w-28 truncate ${showPassword ? 'text-[#F7F8F8]' : 'text-[#555A65]'}`}>
          {showPassword ? item.password : '••••••••••••'}
        </span>
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="flex-none p-1 rounded text-[#555A65] hover:text-[#8A8F98] opacity-0 group-hover:opacity-100 transition-all"
          title={showPassword ? 'Masquer' : 'Afficher'}
        >
          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
        <button
          type="button"
          onClick={() => copyToClipboard(item.password, 'password')}
          className="flex-none p-1 rounded text-[#555A65] hover:text-[#8A8F98] opacity-0 group-hover:opacity-100 transition-all"
          title="Copier le mot de passe"
        >
          {copiedField === 'password'
            ? <Check className="w-3.5 h-3.5 text-[#46A758]" />
            : <Copy className="w-3.5 h-3.5" />
          }
        </button>
      </div>

      {/* Actions menu */}
      <div className="relative flex-none">
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-1.5 rounded-lg text-[#555A65] hover:text-[#F7F8F8] hover:bg-[#2A2D37] opacity-0 group-hover:opacity-100 transition-all"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 top-full mt-1 z-20 w-40 bg-[#1F232E] border border-[#2A2D37] rounded-lg shadow-xl py-1 overflow-hidden">
              <button
                type="button"
                onClick={() => { setMenuOpen(false); onEdit(item) }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-[#8A8F98] hover:text-[#F7F8F8] hover:bg-[#2A2D37] transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                Modifier
              </button>
              <button
                type="button"
                onClick={() => { setMenuOpen(false); onDelete(item) }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-[#E5484D] hover:bg-[#E5484D]/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Supprimer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
