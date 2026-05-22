/**
 * Formats a JS Date as a relative "time ago" string.
 * Falls back to absolute time if older than 24h.
 *
 * @param {Date|null} date
 * @returns {string}
 */
export function timeAgo(date) {
    if (!date) return '—'
    const diff = Math.floor((Date.now() - date.getTime()) / 1000) // seconds

    if (diff < 10)   return 'Just now'
    if (diff < 60)   return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

/**
 * Returns a status string based on lastSeen date.
 * 'online'  < 5 min
 * 'warning' < 30 min
 * 'offline' >= 30 min or null
 *
 * @param {Date|null} date
 * @returns {'online'|'warning'|'offline'}
 */
export function nodeStatus(date) {
    if (!date) return 'offline'
    const minutes = (Date.now() - date.getTime()) / 60000
    if (minutes < 5)  return 'online'
    if (minutes < 30) return 'warning'
    return 'offline'
}