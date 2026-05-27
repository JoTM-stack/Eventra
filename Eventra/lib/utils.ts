import { clsx, type ClassValue } from 'clsx'
import { format, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function uniqueSlug(name: string): string {
  const base = slugify(name)
  const suffix = Math.random().toString(36).slice(2, 7)
  return `${base}-${suffix}`
}

export function formatEventDate(date: string | null, time?: string | null): string {
  if (!date) return 'Date TBC'
  try {
    const d = parseISO(date)
    const datePart = format(d, 'EEEE, d MMMM yyyy')
    return time ? `${datePart} · ${time}` : datePart
  } catch {
    return date
  }
}

export function formatDateShort(date: string | null): { month: string; day: string } {
  if (!date) return { month: 'TBD', day: '--' }
  try {
    const d = parseISO(date)
    return { month: format(d, 'MMM').toUpperCase(), day: format(d, 'd') }
  } catch {
    return { month: 'TBD', day: '--' }
  }
}

export function formatPrice(price: number): string {
  if (price === 0) return 'Free'
  return `R${Math.round(price).toLocaleString('en-ZA')}`
}

export const EVENT_CATEGORIES = [
  'Music & Concerts',
  'Sports & Fitness',
  'Arts & Culture',
  'Food & Drink',
  'Business & Networking',
  'Comedy & Entertainment',
  'Tech & Innovation',
  'Wellness & Health',
  'Fashion & Beauty',
  'Education',
]
