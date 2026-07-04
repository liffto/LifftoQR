import type { User } from '../types/auth'

export function getDisplayName(user: User | null | undefined): string {
  if (!user) return 'User'

  const first = user.first_name?.trim() ?? ''
  const last = user.last_name?.trim() ?? ''

  if (first || last) {
    if (first && last && first.toLowerCase() === last.toLowerCase()) {
      return first
    }
    const full = [first, last].filter(Boolean).join(' ')
    if (full) return full
  }

  if (user.name?.trim()) {
    const parts = user.name.trim().split(/\s+/).filter(Boolean)
    if (parts.length >= 2 && parts[0].toLowerCase() === parts[1].toLowerCase()) {
      return parts[0]
    }
    return user.name.trim()
  }

  if (user.email) return user.email.split('@')[0]
  return 'User'
}

export function getInitials(user: User | null | undefined): string {
  const displayName = getDisplayName(user)
  return (
    displayName
      .split(/[\s._-]/)
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U'
  )
}

export function getFirstName(user: User | null | undefined): string {
  if (!user) return ''
  if (user.first_name?.trim()) return user.first_name.trim()

  const parts = getDisplayName(user).split(/\s+/).filter(Boolean)
  return parts[0] ?? ''
}

export function getLastName(user: User | null | undefined): string {
  if (!user) return ''

  const first = user.first_name?.trim() ?? ''
  const last = user.last_name?.trim() ?? ''

  if (last) {
    if (first && first.toLowerCase() === last.toLowerCase()) return ''
    return last
  }

  const parts = getDisplayName(user).split(/\s+/).filter(Boolean)
  return parts.length > 1 ? parts.slice(1).join(' ') : ''
}
