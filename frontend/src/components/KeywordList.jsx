import React from 'react'
import '../styles/components.css'

function KeywordList({ keywords, maxDisplay = 10 }) {
  
  if (!keywords || keywords.length === 0) {
    return (
      <div className="keywords-empty">
        No keywords detected
      </div>
    )
  }
  
  const displayKeywords = keywords.slice(0, maxDisplay)
  const hiddenCount = keywords.length - displayKeywords.length
  
  return (
    <div className="keyword-list">
      <div className="keyword-list-header">
        <span className="keyword-list-title">Keywords</span>
        <span className="keyword-count">{keywords.length}</span>
      </div>
      
      <div className="keyword-pills">
        {displayKeywords.map((keyword, index) => (
          <span 
            key={index}
            className="keyword-pill"
          >
            {keyword}
          </span>
        ))}
        
        {hiddenCount > 0 && (
          <span className="keyword-pill keyword-more">
            +{hiddenCount} more
          </span>
        )}
      </div>
    </div>
  )
}

export default KeywordList