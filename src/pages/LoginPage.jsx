import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

export default function LoginPage() {
  const { t } = useLanguage()
  const { signIn, error, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setError(null) // Clear any previous errors
      setLoading(true) // Set loading state to true
      await signIn(email, password)
      navigate('/') // Redirect to home page after successful login
    } catch (err) {
      setError(err.message) // Set error message from AuthContext
    } finally {
      setLoading(false) // Set loading state to false
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">{t('login')}</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              {t('email')}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field w-full"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              {t('password')}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field w-full"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-outline-black w-full"
          >
            {loading ? t('loading') : t('login')}
          </button>
        </form>
        <div className="mt-4 text-center">
          <a href="/account" className="text-blue-500 hover:underline">
            {t('forgot_password')}
          </a>
        </div>
      </div>
    </div>
  )
}
