/**
 * ============================================
 * STATS CARD COMPONENT - Single Statistic Display
 * ============================================
 * 
 * WHY WE NEED THIS:
 * Reusable card for displaying one statistic.
 * Used multiple times on Stats dashboard.
 * 
 * WHAT IT DOES:
 * - Shows icon, label, and value
 * - Supports optional subtitle
 * - Color-coded based on type
 * - Animated number on mount
 * 
 * REACT CONCEPTS LEARNED:
 * - Reusable presentational component
 * - Props for customization
 * - CSS classes based on props
 */

import React from 'react'
import '../styles/components.css'

/**
 * StatsCard Component
 * 
 * @param {Object} props
 * @param {string} props.title - Card title/label
 * @param {string|number} props.value - Main value to display
 * @param {string} props.subtitle - Optional subtitle
 * @param {string} props.icon - Emoji or icon
 * @param {string} props.color - Color theme (primary/success/warning/danger)
 */
function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon,
  color = 'primary' 
}) {
  
  return (
    <div className={`stats-card stats-card-${color}`}>
      {/* Icon */}
      {icon && (
        <div className="stats-icon">
          {icon}
        </div>
      )}
      
      {/* Content */}
      <div className="stats-content">
        <h3 className="stats-title">{title}</h3>
        <div className="stats-value">{value}</div>
        {subtitle && (
          <p className="stats-subtitle">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

export default StatsCard

/**
 * USAGE EXAMPLES:
 * 
 * <StatsCard 
 *   title="Total Analyzed"
 *   value={1000}
 *   icon="📊"
 *   color="primary"
 * />
 * 
 * <StatsCard 
 *   title="Flagged Content"
 *   value="15%"
 *   subtitle="150 items"
 *   icon="🚩"
 *   color="danger"
 * />
 */

/**
 * TRY THIS TO LEARN:
 * 1. Add trend indicator: <span>↑ 12%</span>
 * 2. Add onClick prop for interactive cards
 * 3. Animate value with counting effect
 * 4. Add loading skeleton state
 */