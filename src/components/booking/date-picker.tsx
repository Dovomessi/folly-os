'use client'

import { useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isBefore,
  isAfter,
  startOfDay,
  addDays as addD,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Availability, BlockedDate, EventType } from '@/types'

interface DatePickerProps {
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
  availabilities: Availability[]
  blockedDates: BlockedDate[]
  eventType: EventType
}

export function DatePicker({ selectedDate, onSelectDate, availabilities, blockedDates, eventType }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const today = startOfDay(new Date())
  const maxDate = addD(today, eventType.max_days_advance)

  function isDateAvailable(date: Date): boolean {
    if (isBefore(date, today)) return false
    if (isAfter(date, maxDate)) return false

    const dateStr = format(date, 'yyyy-MM-dd')
    if (blockedDates.some(bd => bd.date === dateStr)) return false

    const dayOfWeek = date.getDay()
    return availabilities.some(a => a.day_of_week === dayOfWeek)
  }

  function renderCalendar() {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const rows: JSX.Element[] = []
    let days: JSX.Element[] = []
    let day = calStart

    const dayHeaders = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

    while (day <= calEnd) {
      for (let i = 0; i < 7; i++) {
        const currentDay = new Date(day)
        const isCurrentMonth = isSameMonth(currentDay, currentMonth)
        const isSelected = selectedDate ? isSameDay(currentDay, selectedDate) : false
        const isAvailable = isDateAvailable(currentDay)
        const isToday = isSameDay(currentDay, today)

        days.push(
          <button
            key={currentDay.toString()}
            onClick={() => isAvailable && onSelectDate(currentDay)}
            disabled={!isAvailable}
            className={`
              w-9 h-9 rounded-full text-sm font-medium transition-all mx-auto flex items-center justify-center
              ${!isCurrentMonth ? 'text-gray-300 cursor-default' : ''}
              ${isCurrentMonth && !isAvailable ? 'text-gray-300 cursor-not-allowed' : ''}
              ${isCurrentMonth && isAvailable && !isSelected ? 'text-gray-700 hover:bg-indigo-50 hover:text-[#5E6AD2] cursor-pointer' : ''}
              ${isSelected ? 'bg-[#5E6AD2] text-white shadow-md' : ''}
              ${isToday && !isSelected ? 'ring-2 ring-[#5E6AD2] ring-offset-1' : ''}
            `}
          >
            {format(currentDay, 'd')}
          </button>
        )

        day = addDays(day, 1)
      }

      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1 mb-1">
          {days}
        </div>
      )
      days = []
    }

    return (
      <div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayHeaders.map(h => (
            <div key={h} className="text-center text-xs font-semibold text-gray-400 py-1">{h}</div>
          ))}
        </div>
        {rows}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => setCurrentMonth(m => subMonths(m, 1))}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          disabled={isBefore(endOfMonth(subMonths(currentMonth, 1)), today)}
        >
          <ChevronLeft className="w-4 h-4 text-gray-500" />
        </button>
        <h3 className="text-sm font-semibold text-gray-800 capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </h3>
        <button
          onClick={() => setCurrentMonth(m => addMonths(m, 1))}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {renderCalendar()}
    </div>
  )
}
