import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  // ... (rest of your AuthContext code remains the same) ...

  const isAdmin = () => {
    return profile?.role === 'admin'
  }

  return (
    <AuthContext.Provider value={{ 
      user,
      profile,
      loading,
      error,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      isAdmin, // Ensure isAdmin is included in the context value
      setError
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  // ... (rest of your useAuth code remains the same) ...
}
