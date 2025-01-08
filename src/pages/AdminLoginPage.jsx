import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

export default function AdminLoginPage() {
  const { t } = useLanguage()
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setError(null) // Clear any previous errors
      setLoading(true) // Show "Logging in..."
      
      // Perform login
      const { error: loginError } = await signIn(email, password)
      
      // If login fails, throw the error
      if (loginError) {
        throw loginError
      }
      
      // If login is successful, redirect to /admin immediately
      navigate('/admin', { replace: true }) // Use replace to prevent going back to login
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false) // Reset loading state
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          {t('admin_login')}
        </h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-black">
              {t('email')}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field w-full text-black"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-black">
              {t('password')}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field w-full text-black"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-outline-black w-full text-black hover:bg-black hover:text-white"
          >
            {loading ? t('logging_in') : t('login')}
          </button>
        </form>
      </div>
    </div>
  )
}
