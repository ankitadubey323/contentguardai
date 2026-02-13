/**
 * ============================================
 * HELPER FUNCTIONS - Utility Functions
 * ============================================
 */

/**
 * Format ISO date string to readable format
 * 
 */
export const formatDate = (isoString) => {
  if (!isoString) return 'N/A'
  
  const date = new Date(isoString)
  
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  
  return date.toLocaleDateString('en-US', options)
}

/**
 * Get color based on toxicity score
 * 0-39: Green (safe)
 * 40-59: Yellow (medium)
 * 60+: Red (high/danger)
 */
export const getToxicityColor = (score) => {
  if (score < 40) return 'var(--success)'
  if (score < 60) return 'var(--warning)'
  return 'var(--danger)'
}

/**
 * Get toxicity level label
 */
export const getToxicityLevel = (score) => {
  if (score < 40) return 'Low'
  if (score < 60) return 'Medium'
  return 'High'
}

/**
 * Truncate text to specified length with ellipsis
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Calculate percentage with specified decimal places
 */
export const calculatePercentage = (part, total, decimals = 1) => {
  if (total === 0) return 0
  return Number(((part / total) * 100).toFixed(decimals))
}

/**
 * Get sentiment emoji based on sentiment type
 */
export const getSentimentEmoji = (sentiment) => {
  const emojiMap = {
    'positive': '😊',
    'negative': '😞',
    'neutral': '😐'
  }
  return emojiMap[sentiment?.toLowerCase()] || '😐'
}

/**
 * Get sentiment color
 */
export const getSentimentColor = (sentiment) => {
  const colorMap = {
    'positive': 'var(--success)',
    'negative': 'var(--danger)',
    'neutral': 'var(--gray-600)'
  }
  return colorMap[sentiment?.toLowerCase()] || 'var(--gray-600)'
}

/**
 * Validate text input
 */
export const validateText = (text, maxLength = 10000) => {
  if (!text || text.trim().length === 0) {
    return {
      isValid: false,
      error: 'Please enter some text to analyze'
    }
  }
  
  if (text.length > maxLength) {
    return {
      isValid: false,
      error: `Text exceeds maximum length of ${maxLength} characters`
    }
  }
  
  return {
    isValid: true,
    error: null
  }
}