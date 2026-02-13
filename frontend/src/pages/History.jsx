/**
 * ============================================
 * HISTORY PAGE - Past Analyses List
 * ============================================
 */

import React, { useState, useEffect } from 'react'
import HistoryList from '../components/HistoryList'
import PaginationControls from '../components/PaginationControls'
import FilterBar from '../components/FilterBar'
import ResultCard from '../components/ResultCard'
import { getContentList } from '../services/api'
import { usePagination } from '../hooks/usePagination'
import '../styles/History.css'

function History() {
  // State for content items
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // State for filters
  const [filters, setFilters] = useState({
    status: '',
    isFlagged: undefined,
    moderationAction: ''
  })
  
  // State for modal (showing full details)
  const [selectedItem, setSelectedItem] = useState(null)
  
  // Pagination hook
  const pagination = usePagination(1)
  
  /**
   * Fetch content from API
   * This runs when:
   * - Component first mounts
   * - Page changes
   * - Filters change
   */
  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Build query parameters
        const params = {
          page: pagination.currentPage,
          limit: 20,
          ...filters // ← Spread filters into params
        }
        
        // Remove empty filter values
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === undefined) {
            delete params[key]
          }
        })
        
        console.log('Fetching content with params:', params)
        
        // Call API
        const response = await getContentList(params)
        
        // Update state with response
        setItems(response.data)
        pagination.setTotal(response.pagination.totalPages)
        setLoading(false)
        
      } catch (err) {
        console.error('Failed to fetch content:', err)
        setError('Failed to load history. Please try again.')
        setLoading(false)
      }
    }
    
    fetchContent()
    
    // Cleanup function (optional but good practice)
    return () => {
      // Cancel any pending requests here if needed
    }
  }, [pagination.currentPage, filters]) // ← Re-run when these change
  
  /**
   * Handle filter changes
   */
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    pagination.goToPage(1) // Reset to page 1 when filters change
  }
  
  /**
   * Clear all filters
   */
  const handleClearFilters = () => {
    setFilters({
      status: '',
      isFlagged: undefined,
      moderationAction: ''
    })
    pagination.goToPage(1)
  }
  
  /**
   * Handle item click - show modal with full details
   */
  const handleItemClick = (item) => {
    setSelectedItem(item)
  }
  
  /**
   * Close modal
   */
  const closeModal = () => {
    setSelectedItem(null)
  }
  
  return (
    <div className="container history-page">
      <div className="history-header">
        <h1>Analysis History</h1>
        <p className="history-subtitle">
          View and filter your past content analyses
        </p>
      </div>
      
      {/* Filters */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />
      
      {/* Content list */}
      <HistoryList
        items={items}
        loading={loading}
        error={error}
        onItemClick={handleItemClick}
      />
      
      {/* Pagination - only show if we have items */}
      {!loading && !error && items.length > 0 && (
        <PaginationControls
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPrevious={pagination.goToPrevPage}
          onNext={pagination.goToNextPage}
          onPageClick={pagination.goToPage}
          hasNext={pagination.hasNextPage}
          hasPrev={pagination.hasPrevPage}
        />
      )}
      
      {/* Modal for full details */}
      {selectedItem && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              ✕
            </button>
            <ResultCard data={selectedItem} />
          </div>
        </div>
      )}
    </div>
  )
}

export default History