/**
 * ============================================
 * APP COMPONENT - Main Application Router
 * ============================================
 * 
 * WHY WE NEED THIS:
 * The App component is the root of our application tree.
 * It sets up routing so users can navigate between different pages.
 * 
 * WHAT IT DOES:
 * - Wraps entire app in BrowserRouter for navigation
 * - Defines routes for Home, History, and Stats pages
 * - Shows Header on all pages
 * - Displays correct page based on URL
 * 
 * REACT CONCEPTS LEARNED:
 * - BrowserRouter: Enables client-side routing
 * - Routes: Container for all route definitions
 * - Route: Defines a single route (path → component)
 * - Component composition: Header + dynamic page content
 */

import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Import all page components
import Home from './pages/Home'
import History from './pages/History'
import Stats from './pages/Stats'

// Import shared header component
import Header from './components/Header'

// Import styles
import './styles/App.css'

function App() {
  return (
    // BrowserRouter enables navigation without page refreshes
    <BrowserRouter>
      <div className="app">
        {/* Header appears on ALL pages */}
        <Header />
        
        {/* Main content area */}
        <main className="main-content">
          {/* Routes defines which component shows for each URL */}
          <Routes>
            {/* Home page - path="/" means root URL */}
            <Route path="/" element={<Home />} />
            
            {/* History page - shows at /history */}
            <Route path="/history" element={<History />} />
            
            {/* Stats page - shows at /stats */}
            <Route path="/stats" element={<Stats />} />
            
            {/* 404 page - catches all other URLs */}
            <Route path="*" element={
              <div className="not-found">
                <h1>404 - Page Not Found</h1>
                <p>The page you're looking for doesn't exist.</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App

/**
 * TRY THIS TO LEARN:
 * 1. Add a new route: <Route path="/about" element={<div>About Page</div>} />
 * 2. Change path="/" to path="/home" and see what happens
 * 3. Move <Header /> inside <Routes> and observe the difference
 * 4. console.log('App rendered') to see when this runs
 */