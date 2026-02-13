import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Get the root HTML element from index.html
const rootElement = document.getElementById('root')

// Create a React root and render our App component
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {/* StrictMode helps catch bugs during development */}
    <App />
  </React.StrictMode>,
)