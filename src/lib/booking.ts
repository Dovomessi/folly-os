import { addMinutes, format, isBefore, isAfter, startOfDay, endOfDay, addDays, setHours, setMinutes, parseISO } from 'date-fns'
import type { Availability, Appointment, EventType, BlockedDate } from '@/types'

export interface TimeSlot {
  start: Date
  end: Date
  formatted: string
}

/**
 * Calculate available time slots for a given date and event type.
 * Subtracts existing appointments + buffer from availabilities.
 */
export function getAvailableSlots(
  date: Date,
  eventType: EventType,
  availabilities: Availability[],
  appointments: Appointment[],
  blockedDates: BlockedDate[],
): TimeSlot[] {
  const dayOfWeek = date.getDay()

  // Check if date is blocked
  const dateStr = format(date, 'yyyy-MM-dd')
  if (blockedDates.some(bd => bd.date === dateStr)) return []

  // Get availabilities for this day of week
  const dayAvailabilities = availabilities.filter(a => a.day_of_week === dayOfWeek)
  if (dayAvailabilities.length === 0) return []

  // Check min notice
  const now = new Date()
  const minNotice = addMinutes(now, eventType.min_notice_hours * 60)

  // Check max days advance
  const maxDate = addDays(now, eventType.max_days_advance)
  if (isAfter(date, maxDate)) return []

  // Get existing appointments for this day
  const dayStart = startOfDay(date)
  const dayEnd = endOfDay(date)
  const dayAppointments = appointments.filter(apt => {
    const aptStart = parseISO(apt.start_time)
    return isAfter(aptStart, dayStart) && isBefore(aptStart, dayEnd) && apt.status !== 'cancelled'
  })

  const slots: TimeSlot[] = []

  for (const avail of dayAvailabilities) {
    const [startH, startM] = avail.start_time.split(':').map(Number)
    const [endH, endM] = avail.end_time.split(':').map(Number)

    let slotStart = setMinutes(setHours(date, startH), startM)
    const blockEnd = setMinutes(setHours(date, endH), endM)

    while (isBefore(addMinutes(slotStart, eventType.duration_minutes), blockEnd) ||
           addMinutes(slotStart, eventType.duration_minutes).getTime() === blockEnd.getTime()) {
      const slotEnd = addMinutes(slotStart, eventType.duration_minutes)

      // Check min notice
      if (isBefore(slotStart, minNotice)) {
        slotStart = addMinutes(slotStart, eventType.duration_minutes + eventType.buffer_minutes)
        continue
      }

      // Check conflicts with existing appointments (including buffer)
      const hasConflict = dayAppointments.some(apt => {
        const aptStart = parseISO(apt.start_time)
        const aptEnd = addMinutes(parseISO(apt.end_time), eventType.buffer_minutes)
        const bufferedSlotStart = addMinutes(slotStart, -eventType.buffer_minutes)
        return isBefore(bufferedSlotStart, aptEnd) && isAfter(slotEnd, aptStart)
      })

      if (!hasConflict) {
        slots.push({
          start: slotStart,
          end: slotEnd,
          formatted: format(slotStart, 'HH:mm'),
        })
      }

      slotStart = addMinutes(slotStart, eventType.duration_minutes + eventType.buffer_minutes)
    }
  }

  return slots
}
