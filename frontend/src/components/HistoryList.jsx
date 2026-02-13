/**
 * ============================================
 * HISTORY LIST COMPONENT
 * ============================================
 */

import React from 'react'
import HistoryItem from './HistoryItem'
import LoadingSpinner from './LoadingSpinner'
import '../styles/components.css'

function HistoryList({ items, loading, error, onItemClick }) {
  
  if (loading) {
    return <LoadingSpinner message="Loading history..." />
  }
  
  if (error) {
    return (
      <div className="error-message">
        <p>❌ {error}</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    )
  }
  
  if (!items || items.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <h3>No Results Found</h3>
        <p>Try adjusting your filters or analyze some content first.</p>
      </div>
    )
  }
  
  return (
    <div className="history-list">
      {items.map((item) => (
        <HistoryItem
          key={item._id}
          item={item}
          onClick={() => onItemClick(item)}
        />
      ))}
    </div>
  )
}

export default HistoryList