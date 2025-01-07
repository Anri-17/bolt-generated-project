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

  useEffect(() => {
    let authSubscription

    const initializeAuth = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) {
          console.error("Error getting session:", sessionError)
          throw sessionError
        }

        // Set user and profile only if session exists
        if (session?.user) {
          setUser(session.user)
          await handleProfile(session.user)
        } else {
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        setError(error.message)
        console.error('Error initializing auth:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          setLoading(true)
          setError(null)

          if (session?.user) {
            setUser(session.user)
            await handleProfile(session.user)
            if (event === 'SIGNED_IN') navigate('/')
          } else {
            setUser(null)
            setProfile(null)
            navigate('/account')
          }
        } catch (error) {
          setError(error.message)
          console.error('Auth state change error:', error)
        } finally {
          setLoading(false)
        }
      }
    )

    authSubscription = subscription

    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe()
      }
    }
  }, [navigate])

  const handleProfile = async (user) => {
    try {
      if (!user) return null

      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (fetchError || !existingProfile) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            email: user.email,
            full_name: '',
            avatar_url: '',
            role: 'customer'
          }])
          .select()
          .single()

        if (createError) throw createError
        setProfile(newProfile)
        return newProfile
      }

      setProfile(existingProfile)
      return existingProfile
    } catch (error) {
      setError(error.message)
      console.error('Error handling profile:', error)
      throw error
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return data
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email, password) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) throw error
      return data
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)

      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      navigate('/account')
    } catch (error) {
      setError(error.message)
      console.error('Error signing out:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
