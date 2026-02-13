
import React from 'react'
import ToxicityMeter from './ToxicityMeter'
import SentimentBadge from './SentimentBadge'
import keywordList from './keywordList'

import { formatDate } from '../utils/helpers'
import '../styles/components.css'

/**
 * ResultCard Component
 * 
 * @param {Object} props
 * @param {Object} props.data - Analysis result data from API
 */
function ResultCard({ data }) {
  
  // Destructure data with safe defaults
  const {
    text,
    isFlagged,
    moderationAction,
    riskLevel,
    analysis = {},
    createdAt
  } = data || {}
  
  const {
    toxicity = {},
    sentiment = {},
    keywords = [],
    language = {}
  } = analysis
  
  return (
    <div className={`result-card ${isFlagged ? 'flagged' : ''}`}>
      {/* Header with status badges */}
      <div className="result-header">
        <h2>Analysis Results</h2>
        
        <div className="result-badges">
          {/* Flagged badge if content is flagged */}
          {isFlagged && (
            <span className="badge badge-danger">
                Flagged
            </span>
          )}
          
          {/* Risk level badge */}
          <span className={`badge badge-${riskLevel}`}>
            Risk: {riskLevel}
          </span>
          
          {/* Moderation action badge */}
          {moderationAction !== 'none' && (
            <span className="badge badge-warning">
              Action: {moderationAction}
            </span>
          )}
        </div>
      </div>
      
      {/* Analyzed text */}
      <div className="result-section">
        <h3>Analyzed Text</h3>
        <div className="analyzed-text">
          {text}
        </div>
      </div>
      
      {/* Toxicity analysis */}
      <div className="result-section">
        <ToxicityMeter score={toxicity.toxicity_score || 0} />
      </div>
      
      {/* Sentiment and Language in row */}
      <div className="result-section result-row">
        <div className="result-col">
          <h3>Sentiment</h3>
          <SentimentBadge 
            sentiment={sentiment.sentiment} 
            confidence={sentiment.confidence}
          />
        </div>
        
        <div className="result-col">
          <h3>Language</h3>
          <div className="language-badge">
            {language.language || 'Unknown'}
          </div>
        </div>
      </div>
      
      {/* Keywords */}
      <div className="result-section">
        <KeywordList keywords={keywords} />
      </div>
      
      {/* Footer with metadata */}
      <div className="result-footer">
        <span className="result-date">
          Analyzed: {formatDate(createdAt)}
        </span>
      </div>
    </div>
  )
}

export default ResultCard

/**
 * USAGE EXAMPLE:
 * 
 * <ResultCard data={analysisResult} />
 */

/**
 * TRY THIS TO LEARN:
 * 1. Pass empty object {} and see what happens
 * 2. Add print button: <button onClick={() => window.print()}>Print</button>
 * 3. Add export to PDF functionality
 * 4. Make sections collapsible with useState
 */