const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

export async function sendTelegramNotification(message: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return false

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    )
    return res.ok
  } catch {
    return false
  }
}

export function formatTaskNotification(task: {
  title: string
  priority: string
  due_date?: string | null
  next_due_at?: string | null
  project_name?: string
}): string {
  const priorityEmoji: Record<string, string> = {
    urgent: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🟢',
  }
  const emoji = priorityEmoji[task.priority] || '📋'
  const due = task.next_due_at || task.due_date
  const dueDate = due ? new Date(due) : null
  const dueStr = dueDate
    ? `\n📅 ${dueDate.toLocaleDateString('fr-FR')} à ${dueDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
    : ''
  const project = task.project_name ? `\n📁 ${task.project_name}` : ''

  return `${emoji} <b>Rappel tâche</b>\n\n${task.title}${dueStr}${project}`
}
