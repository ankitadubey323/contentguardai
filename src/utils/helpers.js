/**
 * ============================================
 * HELPERS.JS — ContentGuard AI
 * ============================================
 * Reusable utility functions used across the app
 * Import specific functions as needed
 */

import crypto from 'crypto'

// ─────────────────────────────────────────────────────────────────
// TEXT UTILITIES
// ─────────────────────────────────────────────────────────────────

/**
 * Clean user input text
 * Removes extra spaces, trims, normalizes line breaks
 */
export function sanitizeText(text) {
    if (!text || typeof text !== 'string') return ''
    
    return text
        .trim()                          // Remove leading/trailing spaces
        .replace(/\s+/g, ' ')           // Multiple spaces → single space
        .replace(/[\r\n]+/g, '\n')      // Normalize line breaks
}

/**
 * Truncate text for previews
 * Example: truncateText("Long text here...", 50) → "Long text here..."
 */
export function truncateText(text, maxLength = 100) {
    if (!text || typeof text !== 'string') return ''
    if (text.length <= maxLength) return text
    
    return text.substring(0, maxLength).trim() + '...'
}

/**
 * Remove HTML tags from text (security)
 */
export function stripHtml(text) {
    if (!text || typeof text !== 'string') return ''
    return text.replace(/<[^>]*>/g, '')
}

// ─────────────────────────────────────────────────────────────────
// DATE UTILITIES
// ─────────────────────────────────────────────────────────────────

/**
 * Format date to readable string
 * Example: 2024-01-15 10:30:45
 */
export function formatDate(date) {
    if (!date) return ''
    
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date) {
    if (!date) return ''
    
    const now = new Date()
    const past = new Date(date)
    const diffMs = now - past
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)
    
    if (diffSec < 60) return 'just now'
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`
    
    return formatDate(date)
}

// ─────────────────────────────────────────────────────────────────
// ID & HASH GENERATION
// ─────────────────────────────────────────────────────────────────

/**
 * Generate random ID
 * Example: generateId(16) → "a3f5b2c1d4e6f7g8"
 */
export function generateId(length = 16) {
    return crypto
        .randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length)
}

/**
 * Generate UUID v4
 * Example: "550e8400-e29b-41d4-a716-446655440000"
 */
export function generateUUID() {
    return crypto.randomUUID()
}

/**
 * Hash text using SHA256
 * Use for cache keys, checksums
 */
export function hashText(text) {
    return crypto
        .createHash('sha256')
        .update(text)
        .digest('hex')
}

// ─────────────────────────────────────────────────────────────────
// VALIDATION HELPERS
// ─────────────────────────────────────────────────────────────────

/**
 * Check if string is valid email
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * Check if string is valid URL
 */
export function isValidUrl(url) {
    try {
        new URL(url)
        return true
    } catch {
        return false
    }
}

/**
 * Check if string is valid MongoDB ObjectId
 */
export function isValidObjectId(id) {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/
    return objectIdRegex.test(id)
}

// ─────────────────────────────────────────────────────────────────
// NUMBER UTILITIES
// ─────────────────────────────────────────────────────────────────

/**
 * Format number with commas
 * Example: 1000000 → "1,000,000"
 */
export function formatNumber(num) {
    return num.toLocaleString()
}

/**
 * Calculate percentage
 * Example: calculatePercentage(25, 100) → "25.00"
 */
export function calculatePercentage(part, total) {
    if (total === 0) return '0.00'
    return ((part / total) * 100).toFixed(2)
}

// ─────────────────────────────────────────────────────────────────
// OBJECT UTILITIES
// ─────────────────────────────────────────────────────────────────

/**
 * Pick specific fields from object
 * Example: pick(user, ['name', 'email']) → { name: '...', email: '...' }
 */
export function pick(obj, fields) {
    const result = {}
    fields.forEach(field => {
        if (obj.hasOwnProperty(field)) {
            result[field] = obj[field]
        }
    })
    return result
}

/**
 * Omit specific fields from object
 * Example: omit(user, ['password']) → user without password
 */
export function omit(obj, fields) {
    const result = { ...obj }
    fields.forEach(field => {
        delete result[field]
    })
    return result
}

// ─────────────────────────────────────────────────────────────────
// ASYNC UTILITIES
// ─────────────────────────────────────────────────────────────────

/**
 * Sleep/delay for milliseconds
 * Example: await sleep(1000) → waits 1 second
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry function with exponential backoff
 * Useful for Groq API calls that might fail
 */
export async function retry(fn, maxRetries = 3, delay = 1000) {
    let lastError
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn()
        } catch (error) {
            lastError = error
            
            if (i < maxRetries - 1) {
                // Wait before retrying (exponential backoff)
                await sleep(delay * Math.pow(2, i))
            }
        }
    }
    
    throw lastError
}

// ─────────────────────────────────────────────────────────────────
// ENVIRONMENT CHECKS
// ─────────────────────────────────────────────────────────────────

export function isProduction() {
    return process.env.NODE_ENV === 'production'
}

export function isDevelopment() {
    return process.env.NODE_ENV === 'development'
}

// ─────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────

export default {
    // Text
    sanitizeText,
    truncateText,
    stripHtml,
    
    // Dates
    formatDate,
    getRelativeTime,
    
    // IDs
    generateId,
    generateUUID,
    hashText,
    
    // Validation
    isValidEmail,
    isValidUrl,
    isValidObjectId,
    
    // Numbers
    formatNumber,
    calculatePercentage,
    
    // Objects
    pick,
    omit,
    
    // Async
    sleep,
    retry,
    
    // Environment
    isProduction,
    isDevelopment,
}