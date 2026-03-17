import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendTelegramNotification, formatTaskNotification } from '@/lib/notifications'

function getNextDueDate(currentDue: Date, recurrence: string): Date {
  const next = new Date(currentDue)
  switch (recurrence) {
    case 'daily': next.setDate(next.getDate() + 1); break
    case 'weekly': next.setDate(next.getDate() + 7); break
    case 'biweekly': next.setDate(next.getDate() + 14); break
    case 'monthly': next.setMonth(next.getMonth() + 1); break
    case 'quarterly': next.setMonth(next.getMonth() + 3); break
    case 'yearly': next.setFullYear(next.getFullYear() + 1); break
  }
  return next
}

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel Cron sends this header)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const now = new Date()
  let notified = 0
  let recycled = 0

  // 1. Send notifications for tasks due soon
  const notifyWindow = new Date(now.getTime() + 60 * 60 * 1000) // 1h window
  const { data: tasksToNotify } = await supabase
    .from('tasks')
    .select('*, projects(name)')
    .not('notify_before_minutes', 'is', null)
    .neq('status', 'done')
    .not('next_due_at', 'is', null)
    .lte('next_due_at', notifyWindow.toISOString())
    .or('last_notified_at.is.null,last_notified_at.lt.' + new Date(now.getTime() - 60 * 60 * 1000).toISOString())

  for (const task of tasksToNotify || []) {
    const dueAt = new Date(task.next_due_at)
    const notifyAt = new Date(dueAt.getTime() - (task.notify_before_minutes || 0) * 60 * 1000)

    if (now >= notifyAt) {
      const projectName = (task.projects as { name: string } | null)?.name
      const message = formatTaskNotification({
        title: task.title,
        priority: task.priority,
        next_due_at: task.next_due_at,
        project_name: projectName || undefined,
      })
      await sendTelegramNotification(message)

      await supabase
        .from('tasks')
        .update({ last_notified_at: now.toISOString() })
        .eq('id', task.id)

      notified++
    }
  }

  // 2. Recycle completed recurring tasks
  const { data: completedRecurring } = await supabase
    .from('tasks')
    .select('*')
    .eq('status', 'done')
    .not('recurrence', 'is', null)
    .not('next_due_at', 'is', null)

  for (const task of completedRecurring || []) {
    const nextDue = getNextDueDate(new Date(task.next_due_at), task.recurrence)

    // Check if past recurrence end date
    if (task.recurrence_end_date && nextDue > new Date(task.recurrence_end_date)) {
      continue
    }

    // Reset task to todo with next due date
    await supabase
      .from('tasks')
      .update({
        status: 'todo',
        next_due_at: nextDue.toISOString(),
        due_date: nextDue.toISOString().split('T')[0],
        last_notified_at: null,
        updated_at: now.toISOString(),
      })
      .eq('id', task.id)

    recycled++
  }

  return NextResponse.json({
    ok: true,
    timestamp: now.toISOString(),
    notified,
    recycled,
  })
}
