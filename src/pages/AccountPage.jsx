import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

export default function AccountPage() {
  const { t } = useLanguage()
  const { user, signIn, signUp, signOut, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error(t('passwords_dont_match'))
        }
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
      navigate('/')
    } catch (err) {
      console.error('Error during login/signup:', err)
      // Handle error appropriately (e.g., display error message)
    }
  }

  if (user) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-black">{t('account')}</h1>
        <div className="max-w-md mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-black">{t('account_settings')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('email')}
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="input-field bg-gray-100 text-black"
                />
              </div>
              <button
                onClick={signOut}
                className="btn-outline-black w-full"
              >
                {t('sign_out')}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-black">{t('account')}</h1>
      <div className="max-w-md mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-black">
            {isSignUp ? t('sign_up') : t('sign_in')}
          </h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field text-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field text-black"
                required
              />
            </div>
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('confirm_password')}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field text-black"
                  required
                />
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-outline-black w-full"
            >
              {loading ? t('loading') : isSignUp ? t('sign_up') : t('sign_in')}
            </button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-black hover:text-gray-700 underline"
            >
              {isSignUp ? t('already_have_account') : t('create_account')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
