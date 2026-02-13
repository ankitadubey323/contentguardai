/**
 * ============================================
 * STATS PAGE - Analytics Dashboard
 * ============================================
 * 
 * WHY WE NEED THIS:
 * Provides overview of all analyzed content.
 * Shows aggregated statistics and trends.
 * 
 * WHAT IT DOES:
 * 1. Fetches statistics from API
 * 2. Displays key metrics in cards
 * 3. Shows recent flagged items
 * 4. Calculates percentages and trends
 * 
 * REACT CONCEPTS LEARNED:
 * - useEffect for data fetching
 * - Complex state management
 * - Conditional rendering based on loading state
 * - Helper functions for calculations
 */

import React, { useState, useEffect } from 'react'
import StatsCard from '../components/StatusCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { getStats, getContentList } from '../services/api'
import { calculatePercentage } from '../utils/helpers'
import '../styles/Stats.css'

function Stats() {
  // State for statistics data
  const [stats, setStats] = useState(null)
  const [recentFlagged, setRecentFlagged] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  /**
   * Fetch statistics on component mount
   */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        
        // Fetch main statistics
        const statsResponse = await getStats()
        setStats(statsResponse.data)
        
        // Fetch recent flagged items
        const flaggedResponse = await getContentList({
          isFlagged: true,
          limit: 5,
          page: 1
        })
        setRecentFlagged(flaggedResponse.data)
        
        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch stats:', err)
        setError('Failed to load statistics. Please try again.')
        setLoading(false)
      }
    }
    
    fetchStats()
  }, []) // ← Empty array: run once on mount
  
  // Show loading spinner
  if (loading) {
    return (
      <div className="container stats-page">
        <LoadingSpinner message="Loading statistics..." />
      </div>
    )
  }
  
  // Show error message
  if (error) {
    return (
      <div className="container stats-page">
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    )
  }
  
  // Show empty state if no data
  if (!stats) {
    return (
      <div className="container stats-page">
        <div className="empty-state">
          <h2>No Data Available</h2>
          <p>Start analyzing content to see statistics here.</p>
        </div>
      </div>
    )
  }
  
  // Calculate derived metrics
  const flaggedPercentage = calculatePercentage(
    stats.flagged || 0,
    stats.total || 1
  )
  
  const completedPercentage = calculatePercentage(
    stats.completed || 0,
    stats.total || 1
  )
  
  return (
    <div className="container stats-page">
      <div className="stats-header">
        <h1>Analytics Dashboard</h1>
        <p className="stats-subtitle">
          Overview of all analyzed content
        </p>
      </div>
      
      {/* Main stats grid */}
      <div className="stats-grid">
        <StatsCard
          title="Total Analyzed"
          value={stats.total?.toLocaleString() || 0}
          subtitle="All time"
          icon="📊"
          color="primary"
        />
        
        <StatsCard
          title="Flagged Content"
          value={`${flaggedPercentage}%`}
          subtitle={`${stats.flagged || 0} items flagged`}
          icon="🚩"
          color="danger"
        />
        
        <StatsCard
          title="Average Toxicity"
          value={Math.round(stats.avgToxicityScore || 0)}
          subtitle="Out of 100"
          icon="🛡️"
          color="warning"
        />
        
        <StatsCard
          title="Completion Rate"
          value={`${completedPercentage}%`}
          subtitle={`${stats.completed || 0} completed`}
          icon="✅"
          color="success"
        />
      </div>
      
      {/* Sentiment distribution */}
      <div className="stats-section">
        <h2>Sentiment Distribution</h2>
        <div className="sentiment-bars">
          <div className="sentiment-bar">
            <div className="sentiment-bar-label">
              <span>😊 Positive</span>
              <span className="sentiment-bar-value">
                {stats.sentimentDistribution?.positive || 0}
              </span>
            </div>
            <div className="sentiment-bar-track">
              <div 
                className="sentiment-bar-fill positive"
                style={{ 
                  width: `${calculatePercentage(
                    stats.sentimentDistribution?.positive || 0,
                    stats.total || 1
                  )}%`
                }}
              />
            </div>
          </div>
          
          <div className="sentiment-bar">
            <div className="sentiment-bar-label">
              <span>😐 Neutral</span>
              <span className="sentiment-bar-value">
                {stats.sentimentDistribution?.neutral || 0}
              </span>
            </div>
            <div className="sentiment-bar-track">
              <div 
                className="sentiment-bar-fill neutral"
                style={{ 
                  width: `${calculatePercentage(
                    stats.sentimentDistribution?.neutral || 0,
                    stats.total || 1
                  )}%`
                }}
              />
            </div>
          </div>
          
          <div className="sentiment-bar">
            <div className="sentiment-bar-label">
              <span>😞 Negative</span>
              <span className="sentiment-bar-value">
                {stats.sentimentDistribution?.negative || 0}
              </span>
            </div>
            <div className="sentiment-bar-track">
              <div 
                className="sentiment-bar-fill negative"
                style={{ 
                  width: `${calculatePercentage(
                    stats.sentimentDistribution?.negative || 0,
                    stats.total || 1
                  )}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent flagged items */}
      {recentFlagged.length > 0 && (
        <div className="stats-section">
          <h2>Recently Flagged Content</h2>
          <div className="recent-flagged-list">
            {recentFlagged.map(item => (
              <div key={item._id} className="recent-flagged-item">
                <div className="flagged-item-text">
                  {item.text.substring(0, 100)}...
                </div>
                <div className="flagged-item-score">
                  Toxicity: {item.analysis?.toxicity?.toxicity_score || 0}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Stats

/**
 * TRY THIS TO LEARN:
 * 1. Add refresh button to reload stats
 * 2. Add date range filter for statistics
 * 3. Create pie chart using div elements and CSS
 * 4. Add export to CSV functionality
 * 5. Show loading skeleton instead of spinner
 */