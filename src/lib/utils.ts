import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export const PROJECT_COLORS = [
  '#5E6AD2', // Primary purple
  '#F87171', // Red
  '#FBBF24', // Amber
  '#34D399', // Emerald
  '#60A5FA', // Blue
  '#A78BFA', // Violet
  '#F472B6', // Pink
  '#9CA3AF', // Gray
]
