/**
 * ============================================
 * FILTER BAR COMPONENT
 * ============================================
 */

import React from 'react'
import '../styles/components.css'

function FilterBar({ filters, onFilterChange, onClearFilters }) {
  
  const handleChange = (filterName, value) => {
    onFilterChange({
      ...filters,
      [filterName]: value
    })
  }
  
  const hasActiveFilters = 
    filters.status || 
    filters.isFlagged !== undefined || 
    filters.moderationAction
  
  return (
    <div className="filter-bar">
      <div className="filter-bar-title">
        <span>Filter Results</span>
        {hasActiveFilters && (
          <button 
            className="clear-filters-btn"
            onClick={onClearFilters}
          >
            Clear Filters
          </button>
        )}
      </div>
      
      <div className="filter-controls">
        <div className="filter-group">
          <label htmlFor="status-filter">Status</label>
          <select
            id="status-filter"
            value={filters.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="">All</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="flagged-filter">Flagged</label>
          <select
            id="flagged-filter"
            value={filters.isFlagged ?? ''}
            onChange={(e) => {
              const value = e.target.value === '' ? undefined : e.target.value === 'true'
              handleChange('isFlagged', value)
            }}
            className="filter-select"
          >
            <option value="">All</option>
            <option value="true">Flagged Only</option>
            <option value="false">Not Flagged</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="action-filter">Moderation Action</label>
          <select
            id="action-filter"
            value={filters.moderationAction || ''}
            onChange={(e) => handleChange('moderationAction', e.target.value)}
            className="filter-select"
          >
            <option value="">All</option>
            <option value="none">None</option>
            <option value="review">Review</option>
            <option value="block">Block</option>
            <option value="remove">Remove</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default FilterBar