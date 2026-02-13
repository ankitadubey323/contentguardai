/**
 * ============================================
 * CUSTOM HOOK - useAnalysis
 * ============================================
 * 
 * WHY WE NEED THIS:
 * Custom hooks let us reuse stateful logic across components.
 * This hook handles the entire analysis workflow (submit → poll → result)
 * so Home page component doesn't need to know these details.
 * 
 * WHAT IT DOES:
 * 1. Manages loading/error states
 * 2. Submits text for analysis
 * 3. Polls backend until analysis completes
 * 4. Returns result or error
 * 
 * REACT CONCEPTS LEARNED:
 * - Custom hooks: Functions that use other hooks
 * - useState: Managing multiple pieces of state
 * - Async operations in hooks
 * - Error handling patterns
 */

import { useState } from 'react'
import { submitContent, pollForResult } from '../services/api'

/**
 * Custom hook for content analysis workflow
 * 
 * @returns {Object} - { analyze, loading, error, result, reset }
 */
export const useAnalysis = () => {
  // State for tracking analysis status
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  
  /**
   * Main analysis function
   * Called when user clicks "Analyze" button
   * 
   * @param {string} text - Text to analyze
   */
  const analyze = async (text) => {
    // Reset previous state
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      // Step 1: Submit content to backend
      console.log('Submitting content for analysis...')
      const submitResponse = await submitContent(text)
      
      // Extract content ID from response
      const contentId = submitResponse.contentId
      console.log('Content submitted, ID:', contentId)
      
      // Step 2: Poll for result (checks every 1 second, max 10 times)
      console.log('Polling for analysis result...')
      const pollResponse = await pollForResult(contentId, 10)
      
      // Step 3: Set result when completed
      console.log('Analysis completed!', pollResponse.data)
      setResult(pollResponse.data)
      setLoading(false)
      
    } catch (err) {
      // Handle any errors from submission or polling
      console.error('Analysis error:', err)
      
      // Set user-friendly error message
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Failed to analyze content. Please try again.'
      
      setError(errorMessage)
      setLoading(false)
    }
  }
  
  /**
   * Reset all state (useful for "Analyze Another" button)
   */
  const reset = () => {
    setLoading(false)
    setError(null)
    setResult(null)
  }
  
  // Return object with all functions and state
  // Components can destructure what they need: const { analyze, loading } = useAnalysis()
  return {
    analyze,      // Function to call with text
    loading,      // Boolean: is analysis in progress?
    error,        // String: error message if failed
    result,       // Object: analysis result if successful
    reset         // Function: reset to initial state
  }
}

/**
 * USAGE EXAMPLE IN COMPONENT:
 * 
 * function MyComponent() {
 *   const { analyze, loading, error, result } = useAnalysis()
 *   
 *   const handleSubmit = () => {
 *     analyze('Some text to analyze')
 *   }
 *   
 *   if (loading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error}</div>
 *   if (result) return <div>Result: {result}</div>
 * }
 */

/**
 * TRY THIS TO LEARN:
 * 1. Add console.log in analyze() to see the workflow
 * 2. Change pollForResult maxAttempts to 3 and test with slow backend
 * 3. Add a new state: const [attempts, setAttempts] = useState(0)
 * 4. Create similar hook: useContentList() for fetching history
 */