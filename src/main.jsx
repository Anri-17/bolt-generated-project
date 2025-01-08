import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Context Providers
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { LanguageProvider } from './context/LanguageContext'

// Initialize React root
const root = ReactDOM.createRoot(document.getElementById('root'))

// Main application render
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* Ensure AuthProvider wraps AppRoutes */}
        <LanguageProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
