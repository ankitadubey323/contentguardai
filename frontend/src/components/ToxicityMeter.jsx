/**
 * ============================================
 * TOXICITY METER COMPONENT
 * ============================================
 */

import React from 'react'
import { getToxicityColor, getToxicityLevel } from '../utils/helpers'
import '../styles/components.css'

function ToxicityMeter({ score }) {
  
  const color = getToxicityColor(score)
  const level = getToxicityLevel(score)
  
  return (
    <div className="toxicity-meter">
      <div className="meter-header">
        <span className="meter-label">Toxicity Score</span>
        <span className="meter-score" style={{ color }}>
          {score} / 100
        </span>
      </div>
      
      <div className="meter-bar">
        <div 
          className="meter-fill"
          style={{ 
            width: `${score}%`,
            backgroundColor: color
          }}
        >
          <span className="meter-fill-label">{level}</span>
        </div>
      </div>
      
      <div className="meter-labels">
        <span className="meter-label-item" style={{ color: 'var(--success)' }}>
          Safe (0-39)
        </span>
        <span className="meter-label-item" style={{ color: 'var(--warning)' }}>
          Medium (40-59)
        </span>
        <span className="meter-label-item" style={{ color: 'var(--danger)' }}>
          High (60+)
        </span>
      </div>
    </div>
  )
}

export default ToxicityMeter