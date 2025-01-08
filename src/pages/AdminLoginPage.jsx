import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export default function AdminLoginPage() {
  const { t } = useLanguage()
  const { adminLogin, authError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      await adminLogin(email, password)
    } catch (error) {
      // Error is already handled in AuthContext
      console.error('Login error:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          {t('admin_login')}
        </h2>
        {authError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {authError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black">
              {t('email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field w-full text-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black">
              {t('password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field w-full text-black"
              required
            />
          </div>
          <button
            type="submit"
            className="btn-outline-black w-full text-black hover:bg-black hover:text-white"
          >
            {t('login')}
          </button>
        </form>
      </div>
    </div>
  )
}
