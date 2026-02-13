import React from 'react'
import ToxicityMeter from './ToxicityMeter'
import SentimentBadge from './SentimentBadge'
import KeywordList from './KeywordList'  // ← Make sure this is correct (capital K, capital L)
import { formatDate } from '../utils/helpers'
import '../styles/components.css'

function ResultCard({ data }) {
  
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
      <div className="result-header">
        <h2>Analysis Results</h2>
        
        <div className="result-badges">
          {isFlagged && (
            <span className="badge badge-danger">
              🚩 Flagged
            </span>
          )}
          
          <span className={`badge badge-${riskLevel}`}>
            Risk: {riskLevel}
          </span>
          
          {moderationAction !== 'none' && (
            <span className="badge badge-warning">
              Action: {moderationAction}
            </span>
          )}
        </div>
      </div>
      
      <div className="result-section">
        <h3>Analyzed Text</h3>
        <div className="analyzed-text">
          {text}
        </div>
      </div>
      
      <div className="result-section">
        <ToxicityMeter score={toxicity.toxicity_score || 0} />
      </div>
      
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
            {language.language || language || 'Unknown'}
          </div>
        </div>
      </div>
      
      <div className="result-section">
        <KeywordList keywords={keywords} />
      </div>
      
      <div className="result-footer">
        <span className="result-date">
          Analyzed: {formatDate(createdAt)}
        </span>
      </div>
    </div>
  )
}

export default ResultCard