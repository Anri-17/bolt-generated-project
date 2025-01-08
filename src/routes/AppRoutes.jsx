import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import AdminPage from '../pages/AdminPage'
import AdminLoginPage from '../pages/AdminLoginPage'
import ProductsPage from '../pages/ProductsPage'
import CartPage from '../pages/CartPage'
import ContactPage from '../pages/ContactPage'
import NotFoundPage from '../pages/NotFoundPage'
import { useAuth } from '../context/AuthContext'

function AppRoutes() {
  const { user, profile } = useAuth()

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          user && profile?.role === 'admin' ? (
            <AdminPage />
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Catch-all Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes
