/**
 * ============================================
 * HISTORY ITEM COMPONENT
 * ============================================
 */

import React from 'react'
import { truncateText, formatDate, getToxicityColor } from '../utils/helpers'
import '../styles/components.css'

function HistoryItem({ item, onClick }) {
  
  const {
    text,
    isFlagged,
    riskLevel,
    analysis = {},
    createdAt
  } = item
  
  const toxicityScore = analysis?.toxicity?.toxicity_score || 0
  const sentiment = analysis?.sentiment?.sentiment || 'neutral'
  
  return (
    <div 
      className={`history-item ${isFlagged ? 'flagged' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="history-item-content">
        <p className="history-item-text">
          {truncateText(text, 150)}
        </p>
        
        <div className="history-item-meta">
          <span className="history-date">{formatDate(createdAt)}</span>
          {isFlagged && <span className="flag-indicator">🚩 Flagged</span>}
        </div>
      </div>
      
      <div className="history-item-metrics">
        <div className="metric">
          <span className="metric-label">Toxicity</span>
          <span 
            className="metric-value"
            style={{ color: getToxicityColor(toxicityScore) }}
          >
            {toxicityScore}
          </span>
        </div>
        
        <div className="metric">
          <span className="metric-label">Sentiment</span>
          <span className="metric-value sentiment-value">
            {sentiment}
          </span>
        </div>
        
        <div className="metric">
          <span className="metric-label">Risk</span>
          <span className={`metric-value risk-${riskLevel}`}>
            {riskLevel}
          </span>
        </div>
      </div>
    </div>
  )
}

export default HistoryItem