/**
 * ============================================
 * VITE CONFIGURATION
 * ============================================
 * 
 * WHY WE NEED THIS:
 * Vite needs to know how to proxy API requests to our backend.
 * When frontend (localhost:5173) makes requests to /api, 
 * Vite forwards them to backend (localhost:3000).
 * This solves CORS issues during development.
 * 
 * WHAT IT DOES:
 * - Configures React plugin for fast refresh
 * - Sets up proxy to redirect /api calls to backend
 * - Allows us to use relative URLs like '/api/content'
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  server: {
    port: 5173, // Frontend runs on this port
    
    // Proxy configuration - IMPORTANT for API calls
    proxy: {
      '/api': {
        target: 'http://localhost:3000/api/content', // Backend server
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
