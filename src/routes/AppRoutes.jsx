import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import ProductsPage from '../pages/ProductsPage'
import ContactPage from '../pages/ContactPage'
import CartPage from '../pages/CartPage'
import AccountPage from '../pages/AccountPage'
import AdminPage from '../pages/AdminPage'
import AdminLoginPage from '../pages/AdminLoginPage'
import LearnMorePage from '../pages/LearnMorePage'
import NotFoundPage from '../pages/NotFoundPage'
import { useAuth } from '../context/AuthContext'

function AppRoutes() {
  const { profile } = useAuth()

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/about" element={<LearnMorePage />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          profile?.role === 'admin' ? (
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
