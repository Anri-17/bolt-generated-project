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
            
          if (profile) {
            setProfile(profile)
          }
        }
      } catch (error) {
        console.error('Initialization error:', error)
        setAuthError(error.message)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session?.user) {
            setUser(session.user)
            
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (!profile || profileError) {
              const { data: newProfile } = await supabase
                .from('profiles')
                .insert({
                  id: session.user.id,
                  email: session.user.email,
                  role: 'user'
                })
                .select()
                .single()

              setProfile(newProfile)
            } else {
              setProfile(profile)
            }
          } else {
            setUser(null)
            setProfile(null)
          }
        } catch (error) {
          console.error('Auth state change error:', error)
          setAuthError(error.message)
        }
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  // Regular sign in
  const signIn = async (email, password) => {
    setAuthError(null)
    try {
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
      navigate('/')
      return { user: data.user }
    } catch (error) {
      setAuthError(error.message)
      return { error }
    }
  }

  // Admin login - uses same logic as signIn but with role check
  const adminLogin = async (email, password) => {
    setAuthError(null)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError) throw profileError

      // Only difference: check for admin role
      if (profile.role !== 'admin') {
        await supabase.auth.signOut()
        throw new Error('Only admin users can access this page')
      }

      setUser(data.user)
      setProfile(profile)
      navigate('/admin')
      return { user: data.user }
    } catch (error) {
      setAuthError(error.message)
      return { error }
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      setUser(null)
      setProfile(null)
      await supabase.auth.signOut()
      navigate('/')
    } catch (error) {
      console.error('Sign out error:', error)
      setAuthError(error.message)
    }
  }

  // Sign up
  const signUp = async (email, password, fullName) => {
    setAuthError(null)
    try {
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

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email,
          full_name: fullName,
          role: 'user'
        })
        .select()
        .single()

      if (profileError) throw profileError

      setUser(data.user)
      setProfile(profile)
      navigate('/')
      return { user: data.user }
    } catch (error) {
      console.error('Sign up error:', error)
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
