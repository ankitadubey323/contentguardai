/**
 * ============================================
 * TEXT INPUT COMPONENT
 * ============================================
 */

import React from 'react'
import '../styles/components.css'

function TextInput({ 
  value, 
  onChange, 
  maxLength = 10000,
  placeholder = "Enter your text here for analysis..." 
}) {
  
  const isNearLimit = value.length > maxLength * 0.9
  const percentageUsed = (value.length / maxLength) * 100
  
  return (
    <div className="text-input-container">
      <textarea
        className="text-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={8}
      />
      
      <div className="input-footer">
        <div className="character-counter">
          <span className={isNearLimit ? 'count-warning' : 'count-normal'}>
            {value.length} / {maxLength.toLocaleString()}
          </span>
        </div>
        
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${percentageUsed}%`,
              backgroundColor: isNearLimit ? 'var(--danger)' : 'var(--gradient-start)'
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default TextInput