/**
 * ============================================
 * HOME PAGE - Main Analysis Page
 * ============================================
 * 
 * WHY WE NEED THIS:
 * This is the main page where users submit text for analysis.
 * It orchestrates the entire analysis workflow.
 * 
 * WHAT IT DOES:
 * 1. Renders text input area
 * 2. Validates user input
 * 3. Submits to API using custom hook
 * 4. Shows loading state while analyzing
 * 5. Displays results when complete
 * 6. Handles errors gracefully
 * 
 * REACT CONCEPTS LEARNED:
 * - useState: Managing component state
 * - Custom hook: useAnalysis for business logic
 * - Conditional rendering: Different UI based on state
 * - Event handlers: Form submission
 * - Component composition: Using multiple components
 */

import React, { useState } from 'react'
import TextInput from '../components/TextInput'
import LoadingSpinner from '../components/LoadingSpinner'
import ResultCard from '../components/ResultCard'
import { useAnalysis } from '../hooks/useAnalysis'
import { validateText } from '../utils/helpers'
import '../styles/Home.css'

function Home() {
  // Local state for text input
  const [text, setText] = useState('')
  
  // Validation error state
  const [validationError, setValidationError] = useState(null)
  
  // Use custom hook for analysis logic
  // This hook handles: submitting, polling, loading states
  const { analyze, loading, error, result, reset } = useAnalysis()
  
  /**
   * Handle form submission
   * Called when user clicks "Analyze Content" button
   */
  const handleSubmit = async (e) => {
    e.preventDefault() // ← Prevent page refresh
    
    // Validate text first
    const validation = validateText(text)
    
    if (!validation.isValid) {
      setValidationError(validation.error)
      return
    }
    
    // Clear validation error and analyze
    setValidationError(null)
    await analyze(text)
  }
  
  /**
   * Handle "Analyze Another" button click
   * Resets everything to initial state
   */
  const handleReset = () => {
    setText('')
    setValidationError(null)
    reset()
  }
  
  return (
    <div className="container home-page">
      <div className="home-header">
        <h1>Content Analysis</h1>
        <p className="home-subtitle">
          Analyze text content for toxicity, sentiment, and more using AI
        </p>
      </div>
      
      {/* Show input form if no result yet */}
      {!result && !loading && (
        <div className="analysis-form-card">
          <form onSubmit={handleSubmit}>
            {/* Text input component */}
            <TextInput
              value={text}
              onChange={setText}
              maxLength={10000}
              placeholder="Enter text to analyze (e.g., comments, reviews, messages)..."
            />
            
            {/* Validation error message */}
            {validationError && (
              <div className="error-message">
                {validationError}
              </div>
            )}
            
            {/* Submit button */}
            <button 
              type="submit" 
              className="btn btn-primary btn-large"
              disabled={text.length === 0}
            >
              Analyze Content
            </button>
          </form>
          
          {/* Info cards */}
          <div className="info-section">
            <h3>What We Analyze:</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-icon">🛡️</span>
                <h4>Toxicity Detection</h4>
                <p>Identifies harmful or offensive content with severity levels</p>
              </div>
              <div className="info-item">
                <span className="info-icon">😊</span>
                <h4>Sentiment Analysis</h4>
                <p>Determines if content is positive, negative, or neutral</p>
              </div>
              <div className="info-item">
                <span className="info-icon">🔑</span>
                <h4>Keyword Extraction</h4>
                <p>Identifies important words and phrases in the text</p>
              </div>
              <div className="info-item">
                <span className="info-icon">🌍</span>
                <h4>Language Detection</h4>
                <p>Automatically detects the language of your content</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Show loading spinner during analysis */}
      {loading && (
        <div className="analysis-loading">
          <LoadingSpinner message="Analyzing your content..." />
          <p className="loading-subtext">
            This may take a few seconds. Please wait...
          </p>
        </div>
      )}
      
      {/* Show error if analysis failed */}
      {error && !loading && (
        <div className="analysis-error-card">
          <div className="error-icon">❌</div>
          <h2>Analysis Failed</h2>
          <p className="error-text">{error}</p>
          <button 
            className="btn btn-primary"
            onClick={handleReset}
          >
            Try Again
          </button>
        </div>
      )}
      
      {/* Show results when analysis completes */}
      {result && !loading && !error && (
        <div className="analysis-results">
          <ResultCard data={result} />
          
          {/* Action buttons */}
          <div className="result-actions">
            <button 
              className="btn btn-primary"
              onClick={handleReset}
            >
              Analyze Another
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => window.location.href = '/history'}
            >
              View History
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home

/**
 * STATE FLOW DIAGRAM:
 * 
 * Initial State:
 * text = ''
 * result = null
 * loading = false
 * error = null
 * 
 * User types → setText('hello') → text = 'hello'
 * 
 * User clicks Analyze:
 * → Validate text
 * → Call analyze(text)
 * → loading = true
 * → Submit to API
 * → Poll for result
 * → loading = false, result = {...data}
 * 
 * User clicks "Analyze Another":
 * → Reset all state back to initial
 */

/**
 * TRY THIS TO LEARN:
 * 1. Add character count requirement: minimum 10 characters
 * 2. Add sample texts users can click to auto-fill
 * 3. Save text to localStorage before submitting
 * 4. Add "Share Results" button
 * 5. console.log(text) in TextInput onChange to see live updates
 */