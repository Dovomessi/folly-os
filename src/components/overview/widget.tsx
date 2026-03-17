import type { WidgetItem } from '@/types'

interface WidgetProps {
  title: string
  actionLabel?: string
  onAction?: () => void
  items: WidgetItem[]
  renderMeta?: (item: WidgetItem) => React.ReactNode
}

const priorityColors: Record<string, string> = {
  urgent: '#E5484D',
  high: '#E5484D',
  medium: '#F5A623',
  low: '#46A758',
}

export function Widget({ title, actionLabel, onAction, items, renderMeta }: WidgetProps) {
  return (
    <div className="bg-[#161922] border border-[#2A2D37] rounded-xl">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2A2D37]">
        <span className="text-sm font-semibold text-white">{title}</span>
        {actionLabel && onAction && (
          <button onClick={onAction} className="text-xs text-[#5E6AD2] font-medium hover:underline">
            {actionLabel} &rarr;
          </button>
        )}
      </div>
      <div className="py-1">
        {items.length === 0 ? (
          <div className="px-5 py-4 text-sm text-[#555A65] text-center">Aucun element</div>
        ) : (
          items.map(item => (
            <div key={item.id} className="flex items-center gap-3 px-5 py-2.5 text-sm border-b border-[#2A2D37]/50 last:border-b-0">
              {item.priority && (
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: priorityColors[item.priority] || '#555A65' }}
                />
              )}
              <span className="text-[#F7F8F8] flex-1">{item.title}</span>
              {renderMeta ? renderMeta(item) : (
                <span className="text-xs text-[#555A65]">{item.meta || item.subtitle}</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
