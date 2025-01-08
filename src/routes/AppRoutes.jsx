import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import ProductsPage from '../pages/ProductsPage'
import ContactPage from '../pages/ContactPage'
import CartPage from '../pages/CartPage'
import AccountPage from '../pages/AccountPage'
import AdminPage from '../pages/AdminPage'
import LearnMorePage from '../pages/LearnMorePage'
import NotFoundPage from '../pages/NotFoundPage'
import { useAuth } from '../context/AuthContext'

function AppRoutes() {
  const { isAdmin } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/about" element={<LearnMorePage />} />
      
      {/* Protected Admin Route */}
      <Route 
        path="/admin" 
        element={isAdmin() ? <AdminPage /> : <Navigate to="/" />} 
      />
      
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes
