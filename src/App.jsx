import React from 'react'
import AppRoutes from './routes/AppRoutes'
import { CartProvider } from './context/CartContext'
import { LanguageProvider } from './context/LanguageContext'
import Navbar from './components/Navbar'

function App() {
  return (
    <LanguageProvider>
      <CartProvider>
        <Navbar />
        <AppRoutes />
      </CartProvider>
    </LanguageProvider>
  )
}

export default App
