import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        await fetchProfile(session.user.id)
      }
      setLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
          navigate('/')
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription?.unsubscribe()
  }, [navigate])

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (!error) {
      setProfile(data)
    }
  }

  const createProfile = async (userId, email) => {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        id: userId,
        email,
        role: 'customer',
        language: 'ka' // Default language
      }])
      .select()
      .single()
    
    if (!error) {
      setProfile(data)
    }
    return { data, error }
  }

  const value = {
    user,
    profile,
    loading,
    signIn: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (!error) {
        await fetchProfile(data.user.id)
        navigate('/')
      }
      return { user: data?.user, error }
    },
    signOut: async () => {
      await supabase.auth.signOut()
      navigate('/')
    },
    signUp: async (email, password) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })
      if (!error) {
        await createProfile(data.user.id, email)
        navigate('/')
      }
      return { user: data?.user, error }
    },
    updateProfile: async (updates) => {
      if (!user) return
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()
      
      if (!error) {
        setProfile(data)
      }
      return { data, error }
    }
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
