/**
 * ============================================
 * CUSTOM HOOK - usePagination
 * ============================================
 * 
 * WHY WE NEED THIS:
 * Pagination logic is complex (current page, next/prev, total pages).
 * This hook centralizes all pagination logic so History page
 * just calls simple functions like goToNextPage().
 * 
 * WHAT IT DOES:
 * - Tracks current page number
 * - Provides next/previous functions
 * - Calculates if next/prev buttons should be disabled
 * - Handles going to specific page
 * 
 * REACT CONCEPTS LEARNED:
 * - Custom hooks for reusable logic
 * - useState: Managing page state
 * - Computed values: hasNext, hasPrev
 * - Callback functions
 */

import { useState, useCallback } from 'react'

/**
 * Custom hook for pagination logic
 * 
 * @param {number} initialPage - Starting page (default: 1)
 * @returns {Object} - Pagination state and functions
 */
export const usePagination = (initialPage = 1) => {
  // Current page number (starts at 1)
  const [currentPage, setCurrentPage] = useState(initialPage)
  
  // Total pages (updated from API response)
  const [totalPages, setTotalPages] = useState(1)
  
  /**
   * Go to next page
   * useCallback ensures function reference doesn't change on every render
   * This is important for performance when passing to child components
   */
  const goToNextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }, [totalPages])
  
  /**
   * Go to previous page
   */
  const goToPrevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }, [])
  
  /**
   * Go to specific page number
   * 
   * @param {number} page - Page number to go to
   */
  const goToPage = useCallback((page) => {
    const pageNum = Number(page)
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum)
    }
  }, [totalPages])
  
  /**
   * Update total pages (called after API response)
   * 
   * @param {number} total - Total number of pages from API
   */
  const setTotal = useCallback((total) => {
    setTotalPages(total)
  }, [])
  
  /**
   * Reset pagination to page 1
   */
  const reset = useCallback(() => {
    setCurrentPage(1)
    setTotalPages(1)
  }, [])
  
  // Computed values
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1
  
  // Return all pagination utilities
  return {
    currentPage,     // Current page number
    totalPages,      // Total number of pages
    goToNextPage,    // Function: go to next page
    goToPrevPage,    // Function: go to previous page
    goToPage,        // Function: go to specific page
    setTotal,        // Function: update total pages
    reset,           // Function: reset to page 1
    hasNextPage,     // Boolean: can go to next page?
    hasPrevPage      // Boolean: can go to previous page?
  }
}

/**
 * USAGE EXAMPLE:
 * 
 * function HistoryPage() {
 *   const pagination = usePagination()
 *   
 *   useEffect(() => {
 *     // Fetch data for current page
 *     fetchData(pagination.currentPage).then(response => {
 *       pagination.setTotal(response.pagination.totalPages)
 *     })
 *   }, [pagination.currentPage])
 *   
 *   return (
 *     <div>
 *       <button 
 *         onClick={pagination.goToPrevPage}
 *         disabled={!pagination.hasPrevPage}
 *       >
 *         Previous
 *       </button>
 *       
 *       <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
 *       
 *       <button 
 *         onClick={pagination.goToNextPage}
 *         disabled={!pagination.hasNextPage}
 *       >
 *         Next
 *       </button>
 *     </div>
 *   )
 * }
 */

/**
 * TRY THIS TO LEARN:
 * 1. Remove useCallback and see if anything breaks
 * 2. Add: const [itemsPerPage, setItemsPerPage] = useState(20)
 * 3. console.log every time currentPage changes
 * 4. Add validation: prevent negative page numbers
 */