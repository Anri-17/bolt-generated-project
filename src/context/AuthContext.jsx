import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // Fetch user profile from Supabase
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      
      // Set profile with role (default to 'customer' if not set)
      setProfile({ ...data, role: data.role || 'customer' })
      return data
    } catch (error) {
      console.error('Error fetching profile:', error)
      throw error
    }
  }

  // Handle initial session check and auth state changes
  useEffect(() => {
    let authListener = null

    const checkSession = async () => {
      setLoading(true)
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) throw error
        
        if (session) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    const setupAuthListener = () => {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN') {
          setUser(session.user)
          await fetchProfile(session.user.id)
          navigate('/')
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
          navigate('/login')
        } else if (event === 'PASSWORD_RECOVERY') {
          navigate('/reset-password')
        }
      })
      authListener = data
    }

    checkSession()
    setupAuthListener()

    return () => {
      if (authListener?.unsubscribe) {
        authListener.unsubscribe()
      }
    }
  }, [navigate])

  // Sign in with email and password
  const signIn = async (email, password) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })
      
      if (error) throw error
      
      await fetchProfile(data.user.id)
      return data
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Sign up new user
  const signUp = async (email, password, fullName) => {
    setLoading(true)
    setError(null)
    
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })
      
      if (authError) throw authError
      
      // Create profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: authData.user.id,
          email,
          full_name: fullName,
          role: 'customer'
        }])
        
      if (profileError) throw profileError
      
      return authData
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Sign out user
  const signOut = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      
      setUser(null)
      setProfile(null)
      navigate('/login')
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Send password reset email
  const resetPassword = async (email) => {
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) throw error
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Update user password
  const updatePassword = async (newPassword) => {
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) throw error
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Check if user is admin
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
      isAdmin,
      setError
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
