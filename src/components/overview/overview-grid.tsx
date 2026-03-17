'use client'

import { StatCard } from './stat-card'
import { Widget } from './widget'
import type { StatCard as StatCardType, WidgetItem } from '@/types'

interface OverviewGridProps {
  stats: StatCardType[]
  recentTasks: WidgetItem[]
  upcomingEvents: WidgetItem[]
  recentNotes: WidgetItem[]
  onNavigate: (tab: string) => void
}

export function OverviewGrid({
  stats,
  recentTasks,
  upcomingEvents,
  recentNotes,
  onNavigate,
}: OverviewGridProps) {
  return (
    <div className="p-7 overflow-y-auto flex-1">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {stats.map((s, i) => (
          <StatCard key={i} label={s.label} value={s.value} sub={s.sub} />
        ))}
      </div>

      <div className="mb-5">
        <Widget
          title="Taches recentes"
          actionLabel="Voir tout"
          onAction={() => onNavigate('tasks')}
          items={recentTasks}
          renderMeta={(item) => (
            <span className={`text-xs px-2 py-0.5 rounded bg-[#1F232E] ${
              item.priority === 'urgent' || item.priority === 'high'
                ? 'text-[#E5484D]'
                : 'text-[#8A8F98]'
            }`}>
              {item.status || item.meta}
            </span>
          )}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Widget
          title="Prochains RDV"
          actionLabel="Voir tout"
          onAction={() => onNavigate('calendar')}
          items={upcomingEvents}
        />
        <Widget
          title="Notes recentes"
          actionLabel="Voir tout"
          onAction={() => onNavigate('notes')}
          items={recentNotes}
        />
      </div>
    </div>
  )
}
