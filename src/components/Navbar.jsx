import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const { t, language, setLanguage } = useLanguage()
  const { totalItems } = useCart()
  const { profile } = useAuth()
  const location = useLocation()
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const languageDropdownRef = useRef(null)
  const mobileMenuRef = useRef(null)

  // Close dropdowns when route changes
  useEffect(() => {
    setShowLanguageDropdown(false)
    setMobileMenuOpen(false)
  }, [location.pathname])

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
        setShowLanguageDropdown(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    setShowLanguageDropdown(false)
  }

  const getCurrentFlag = () => {
    return language === 'en' ? '🇬🇧' : '🇬🇪'
  }

  const CartIcon = ({ totalItems, onClick }) => (
    <Link
      to="/cart"
      onClick={onClick}
      className="relative text-black hover:text-hero transition-colors"
      aria-label={t('cart')}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-hero text-white text-xs rounded-full px-2 py-1">
          {totalItems}
        </span>
      )}
    </Link>
  )

  const AccountIcon = ({ onClick }) => (
    <Link
      to="/account"
      onClick={onClick}
      className="text-black hover:text-hero transition-colors"
      aria-label={t('account')}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </Link>
  )

  const NavLink = ({ to, text, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className="text-black hover:text-hero transition-colors font-medium"
    >
      {text}
    </Link>
  )

  const MobileNavLink = ({ to, text, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className="text-black hover:text-hero transition-colors text-lg font-medium"
    >
      {text}
    </Link>
  )

  const mobileMenuVariants = {
    hidden: { x: '100%' },
    visible: { x: 0 },
    exit: { x: '100%' }
  }

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-black hover:text-hero transition-colors">
          ANSA
        </Link>

        <div className="flex items-center space-x-6">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-6">
              <NavLink to="/" text={t('home')} />
              <NavLink to="/products" text={t('products')} />
              <NavLink to="/contact" text={t('contact')} />
              {profile?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="btn-outline-black flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  {t('admin_panel')}
                </Link>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <CartIcon totalItems={totalItems} />
              <AccountIcon />
            </div>
          </div>

          {/* Language Selector */}
          <div className="relative" ref={languageDropdownRef}>
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="flex items-center focus:outline-none hover:opacity-80 transition-opacity"
              aria-label="Change language"
            >
              <span className="text-2xl">{getCurrentFlag()}</span>
            </button>
            <AnimatePresence>
              {showLanguageDropdown && (
                <motion.div
                  className="absolute right-0 mt-2 w-16 bg-white rounded-lg shadow-lg"
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <button
                    onClick={() => handleLanguageChange('ka')}
                    className={`w-full p-2 flex justify-center hover:bg-gray-100 rounded-t-lg ${
                      language === 'ka' ? 'bg-gray-100' : ''
                    }`}
                  >
                    <span className="text-2xl">🇬🇪</span>
                  </button>
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`w-full p-2 flex justify-center hover:bg-gray-100 rounded-b-lg ${
                      language === 'en' ? 'bg-gray-100' : ''
                    }`}
                  >
                    <span className="text-2xl">🇬🇧</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 focus:outline-none hover:opacity-80 transition-opacity"
            aria-label="Toggle mobile menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="fixed inset-0 bg-white z-50 p-4"
              ref={mobileMenuRef}
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="flex justify-end">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 focus:outline-none hover:opacity-80 transition-opacity"
                  aria-label="Close mobile menu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col space-y-4 mt-4">
                <MobileNavLink to="/" text={t('home')} onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink to="/products" text={t('products')} onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink to="/contact" text={t('contact')} onClick={() => setMobileMenuOpen(false)} />
                {profile?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-black hover:text-hero transition-colors text-lg font-medium flex items-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    {t('admin_panel')}
                  </Link>
                )}
                <div className="flex items-center space-x-4 mt-6">
                  <CartIcon totalItems={totalItems} onClick={() => setMobileMenuOpen(false)} />
                  <AccountIcon onClick={() => setMobileMenuOpen(false)} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
