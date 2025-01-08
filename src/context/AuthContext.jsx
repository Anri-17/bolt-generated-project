import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [authError, setAuthError] = useState(null)
  const navigate = useNavigate()

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          setProfile(profile || null)
        }
      } catch (error) {
        setAuthError(error.message)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session?.user) {
            setUser(session.user)
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
            setProfile(profile || null)
          } else {
            setUser(null)
            setProfile(null)
          }
        } catch (error) {
          setAuthError(error.message)
        }
      }
    )

    return () => subscription?.unsubscribe()
  }, [navigate])

  // Admin login
  const adminLogin = async (email, password) => {
    try {
      setAuthError(null)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profile?.role !== 'admin') {
        await supabase.auth.signOut()
        throw new Error('Only admin users can access this page')
      }

      setUser(data.user)
      setProfile(profile)
      return { user: data.user }
    } catch (error) {
      setAuthError(error.message)
      return { error }
    }
  }

  // Regular sign in
  const signIn = async (email, password) => {
    try {
      setAuthError(null)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()
        
      setProfile(profile)
      return { user: data.user }
    } catch (error) {
      setAuthError(error.message)
      return { error }
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      navigate('/')
    } catch (error) {
      setAuthError(error.message)
    }
  }

  // Sign up
  const signUp = async (email, password, fullName) => {
    try {
      setAuthError(null)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })

      if (error) throw error

      const { data: profile } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email,
          full_name: fullName,
          role: 'user'
        })
        .select()
        .single()

      setUser(data.user)
      setProfile(profile)
      return { user: data.user }
    } catch (error) {
      setAuthError(error.message)
      return { error }
    }
  }

  // Check if user is admin
  const isAdmin = () => profile?.role === 'admin'

  const value = {
    user,
    profile,
    authError,
    setAuthError,
    isAdmin,
    adminLogin,
    signIn,
    signOut,
    signUp
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
