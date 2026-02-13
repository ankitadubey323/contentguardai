/**
 * ============================================
 * PAGINATION CONTROLS COMPONENT
 * ============================================
 */

import React from 'react'
import '../styles/components.css'

function PaginationControls({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  onPageClick,
  hasNext,
  hasPrev
}) {
  
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let endPage = Math.min(totalPages, startPage + maxVisible - 1)
    
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1)
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    
    return pages
  }
  
  const pageNumbers = getPageNumbers()
  
  return (
    <div className="pagination-controls">
      <button
        className="pagination-btn"
        onClick={onPrevious}
        disabled={!hasPrev}
      >
        ← Previous
      </button>
      
      <div className="pagination-numbers">
        {pageNumbers[0] > 1 && (
          <>
            <button
              className="pagination-number"
              onClick={() => onPageClick(1)}
            >
              1
            </button>
            {pageNumbers[0] > 2 && <span className="pagination-ellipsis">...</span>}
          </>
        )}
        
        {pageNumbers.map(page => (
          <button
            key={page}
            className={`pagination-number ${page === currentPage ? 'active' : ''}`}
            onClick={() => onPageClick(page)}
          >
            {page}
          </button>
        ))}
        
        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <span className="pagination-ellipsis">...</span>
            )}
            <button
              className="pagination-number"
              onClick={() => onPageClick(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}
      </div>
      
      <button
        className="pagination-btn"
        onClick={onNext}
        disabled={!hasNext}
      >
        Next →
      </button>
      
      <div className="pagination-info">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  )
}

export default PaginationControls