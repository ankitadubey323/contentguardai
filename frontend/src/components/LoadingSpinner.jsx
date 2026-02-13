import React from 'react'
import '../styles/components.css'

function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="loading-spinner-container">
      <div className="spinner"></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  )
}

export default LoadingSpinner
