/**
 * ============================================
 * HEADER COMPONENT - Navigation Bar
 * ============================================
 * 
 * WHY WE NEED THIS:
 * Header provides navigation links visible on every page.
 * Users can click to switch between Home, History, and Stats.
 * 
 * WHAT IT DOES:
 * - Shows app logo/title
 * - Displays navigation links
 * - Highlights current active page
 * - Responsive on mobile (hamburger menu would go here)
 * 
 * REACT CONCEPTS LEARNED:
 * - NavLink: Special Link that knows if it's active
 * - Component without state (presentational component)
 * - CSS-in-JS className usage
 */

import React from 'react'
import { NavLink } from 'react-router-dom'
import '../styles/Header.css'

/**
 * Header Component
 * No props needed - just displays navigation
 */
function Header() {
  return (
    <header className="header">
      <div className="container header-content">
        {/* App logo/title */}
        <div className="logo">
          <h1>
            <span className="logo-icon">🛡️</span>
            ContentGuard AI
          </h1>
        </div>
        
        {/* Navigation links */}
        <nav className="nav">
          {/* 
            NavLink automatically adds 'active' class to current page
            This lets us highlight which page user is on
          */}
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Analyze
          </NavLink>
          
          <NavLink 
            to="/history" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            History
          </NavLink>
          
          <NavLink 
            to="/stats" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Dashboard
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

export default Header

/**
 * TRY THIS TO LEARN:
 * 1. Add a new NavLink for an About page
 * 2. Remove className function and use just className="nav-link"
 * 3. Add onClick={() => console.log('Clicked!')} to a NavLink
 * 4. Try using <Link> instead of <NavLink> and see the difference
 */