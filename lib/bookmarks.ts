const STORAGE_KEY = 'vibe_bookmarks'

export function getBookmarkIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function isBookmarked(id: string): boolean {
  return getBookmarkIds().includes(id)
}

export function toggleBookmark(id: string): boolean {
  const ids = getBookmarkIds()
  const exists = ids.includes(id)
  const updated = exists ? ids.filter((b) => b !== id) : [...ids, id]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return !exists
}
