'use client'

import { format, parseISO } from 'date-fns'
import type { Appointment } from '@/types'

const TYPE_COLORS: Record<string, string> = {
  meeting: '#5E6AD2',
  call: '#46A758',
  demo: '#F5A623',
  personal: '#E5484D',
  other: '#8A8F98',
}

const TYPE_LABELS: Record<string, string> = {
  meeting: 'Réunion',
  call: 'Call',
  demo: 'Démo',
  personal: 'Personnel',
  other: 'Autre',
}

interface TimeSlotProps {
  appointment: Appointment
  onClick?: (appointment: Appointment) => void
  compact?: boolean
  style?: React.CSSProperties
}

export function TimeSlot({ appointment, onClick, compact = false, style }: TimeSlotProps) {
  const color = appointment.color || TYPE_COLORS[appointment.type] || '#5E6AD2'
  const startTime = format(parseISO(appointment.start_time), 'HH:mm')
  const endTime = format(parseISO(appointment.end_time), 'HH:mm')

  const statusOpacity =
    appointment.status === 'cancelled'
      ? 'opacity-50 line-through'
      : appointment.status === 'pending'
      ? 'opacity-75'
      : ''

  if (compact) {
    return (
      <button
        onClick={() => onClick?.(appointment)}
        className="w-full text-left px-1.5 py-0.5 rounded text-xs font-medium truncate transition-opacity hover:opacity-80"
        style={{ backgroundColor: `${color}25`, borderLeft: `2px solid ${color}`, color }}
        title={`${appointment.title} — ${startTime}-${endTime}`}
      >
        <span className={statusOpacity}>{appointment.title}</span>
      </button>
    )
  }

  return (
    <button
      onClick={() => onClick?.(appointment)}
      className="w-full text-left px-2 py-1 rounded-md transition-opacity hover:opacity-80 overflow-hidden"
      style={{
        backgroundColor: `${color}20`,
        borderLeft: `3px solid ${color}`,
        ...style,
      }}
    >
      <div className={`text-xs font-semibold truncate ${statusOpacity}`} style={{ color }}>
        {appointment.title}
      </div>
      <div className="text-xs text-[#8A8F98] mt-0.5">
        {startTime} - {endTime}
      </div>
      {appointment.guest_name && (
        <div className="text-xs text-[#555A65] truncate">{appointment.guest_name}</div>
      )}
      {!compact && (
        <div
          className="mt-1 text-[10px] font-medium px-1 py-0.5 rounded inline-block"
          style={{ backgroundColor: `${color}30`, color }}
        >
          {TYPE_LABELS[appointment.type] || appointment.type}
        </div>
      )}
    </button>
  )
}

export { TYPE_COLORS, TYPE_LABELS }
