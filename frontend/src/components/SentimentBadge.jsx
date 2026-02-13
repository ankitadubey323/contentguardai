/**
 * ============================================
 * SENTIMENT BADGE COMPONENT
 * ============================================
 * 
 * WHY WE NEED THIS:
 * Displays sentiment (positive/negative/neutral) as a
 * colorful badge with emoji. More engaging than plain text.
 * 
 * WHAT IT DOES:
 * - Shows sentiment with appropriate color
 * - Displays emoji that matches sentiment
 * - Shows confidence score if provided
 * 
 * REACT CONCEPTS LEARNED:
 * - Props with default values
 * - Helper function usage
 * - Conditional rendering: {confidence && ...}
 */

import React from 'react'
import { getSentimentColor, getSentimentEmoji } from '../utils/helpers'
import '../styles/components.css'

/**
 * SentimentBadge Component
 * 
 * @param {Object} props
 * @param {string} props.sentiment - Sentiment type (positive/negative/neutral)
 * @param {number} props.confidence - Confidence score (0-1) - optional
 */
function SentimentBadge({ sentiment, confidence }) {
  
  // Get color for this sentiment
  const color = getSentimentColor(sentiment)
  
  // Get emoji for this sentiment
  const emoji = getSentimentEmoji(sentiment)
  
  // Format confidence as percentage
  const confidencePercent = confidence 
    ? `${Math.round(confidence * 100)}%` 
    : null
  
  return (
    <div className="sentiment-badge" style={{ backgroundColor: color }}>
      {/* Emoji */}
      <span className="sentiment-emoji">{emoji}</span>
      
      {/* Sentiment text (capitalize first letter) */}
      <span className="sentiment-text">
        {sentiment?.charAt(0).toUpperCase() + sentiment?.slice(1)}
      </span>
      
      {/* Confidence if provided */}
      {confidence && (
        <span className="sentiment-confidence">
          ({confidencePercent})
        </span>
      )}
    </div>
  )
}

export default SentimentBadge

/**
 * USAGE EXAMPLES:
 * 
 * <SentimentBadge sentiment="positive" />
 * <SentimentBadge sentiment="negative" confidence={0.95} />
 * <SentimentBadge sentiment="neutral" confidence={0.60} />
 */

/**
 * TRY THIS TO LEARN:
 * 1. Pass invalid sentiment like "happy" and add error handling
 * 2. Add size prop: size="small" | "large"
 * 3. Make emoji optional with prop: showEmoji={false}
 * 4. Add animation on hover
 */