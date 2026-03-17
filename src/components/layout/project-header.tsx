'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Project } from '@/types'
import { LayoutGrid, CheckSquare, Calendar, FileText, Lock } from 'lucide-react'

interface ProjectHeaderProps {
  project: Project
}

const tabs = [
  { id: 'overview', label: "Vue d'ensemble", icon: LayoutGrid, href: '' },
  { id: 'tasks', label: 'Taches', icon: CheckSquare, href: '/tasks' },
  { id: 'calendar', label: 'Calendrier', icon: Calendar, href: '/calendar' },
  { id: 'notes', label: 'Notes', icon: FileText, href: '/notes' },
  { id: 'passwords', label: 'Passwords', icon: Lock, href: '/passwords' },
]

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const pathname = usePathname()
  const basePath = `/projects/${project.id}`

  const getActiveTab = () => {
    for (const t of tabs) {
      if (t.href && pathname.endsWith(t.href)) return t.id
    }
    if (pathname === basePath) return 'overview'
    return 'overview'
  }

  const activeTab = getActiveTab()

  return (
    <div className="border-b border-[#2A2D37] bg-[#0F1115]">
      <div className="px-7 pt-5 pb-0">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <h1 className="text-xl font-semibold text-white">{project.name}</h1>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
            project.status === 'active'
              ? 'bg-[#46A758]/15 text-[#46A758]'
              : 'bg-[#F5A623]/15 text-[#F5A623]'
          }`}>
            {project.status === 'active' ? 'Actif' : 'En pause'}
          </span>
        </div>
        {project.description && (
          <p className="text-sm text-[#8A8F98] mb-4">{project.description}</p>
        )}
      </div>

      <div className="flex px-7">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = tab.id === activeTab
          return (
            <Link
              key={tab.id}
              href={`${basePath}${tab.href}`}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'text-white border-[#5E6AD2]'
                  : 'text-[#8A8F98] border-transparent hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
