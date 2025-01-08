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
    const sessionCheck = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        console.error("Error checking session:", sessionError)
        setError("An unexpected error occurred while checking your session. Please try again later.")
      } else if (session) {
        setUser(session.user)
        try {
          await fetchProfile(session.user.id)
        } catch (profileError) {
          console.error("Error fetching profile:", profileError)
          //Handle profile fetch error without displaying a generic message.  Consider redirecting to profile creation or showing a custom message.
        }
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    }

    let authListener = null;

    const setupAuthListener = () => {
      authListener = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
          setUser(session.user)
          fetchProfile(session.user.id)
            .then(profileData => {
              if (profileData) {
                setProfile(profileData);
                navigate('/');
              } else {
                console.warn("No profile found for user:", session.user.id);
                //Handle missing profile (e.g., redirect to profile creation)
                setError("Your profile could not be found. Please contact support.");
              }
            })
            .catch(profileError => {
              console.error("Error fetching profile after sign-in:", profileError)
              //Handle profile fetch error without displaying a generic message
              //You might want to redirect to a profile creation page or show a custom message
              //For now, we'll just log the error and continue
            })
          
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
          navigate('/account')
        }
      })
    }

    setupAuthListener()
    sessionCheck()

    return () => {
      if (authListener?.unsubscribe) {
        authListener.unsubscribe()
      }
    }
  }, [navigate])

  const fetchProfile = async (userId) => {
    try {
      console.log("Fetching profile for userId:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*, roles(*)') // Select the role from the roles table
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        // Handle specific error scenarios (as before)
        throw error;
      }
      // Extract the role from the roles relationship
      const role = data.roles?.[0]?.name || 'customer'; // Default to 'customer' if no role is found

      setProfile({ ...data, role }); // Add the role to the profile object
      return { ...data, role };
    } catch (error) {
      console.error("Unexpected error in fetchProfile:", error);
      throw error;
    }
  };

const signIn = async (email, password) => {
  try {
    setLoading(true);
    setError(null);
    const { user, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      console.error("Supabase Auth Error:", authError);
      // Handle specific Supabase auth errors
      if (authError.message.includes("Incorrect credentials")) {
        setError("Incorrect email or password.");
      } else if (authError.message.includes("Email not found")) {
        setError("Email not found.");
      } else if (authError.message.includes("User is blocked")) {
        setError("Your account is blocked. Please contact support.");
      } else {
        setError("An unexpected Supabase authentication error occurred. Please try again later.");
      }
      return; // Stop execution if there's a Supabase auth error
    }

    //Successful authentication, now fetch the profile
    const profileData = await fetchProfile(user.id);
    if (profileData) {
      setProfile(profileData);
      navigate('/');
    } else {
      console.warn("No profile found for user:", user.id);
      // Handle missing profile (e.g., redirect to profile creation)
      setError("Your profile could not be found. Please contact support.");
    }
  } catch (error) {
    console.error("Unexpected error during sign-in:", error);
    //This catch block should only execute if there's an unexpected error outside the Supabase auth call
    //Consider logging the error to a service like Sentry for more detailed analysis
  } finally {
    setLoading(false);
  }
};

  const signUp = async (email, password, fullName) => {
    try {
      setLoading(true)
      setError(null)
      const { user, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        console.error("Supabase Sign-up Error:", error)
        setError("Sign-up failed. Please try again later.")
        throw error;
      }
      await supabase
        .from('profiles')
        .insert([{ id: user.id, email, full_name: fullName }])
        .then(() => fetchProfile(user.id))
        .catch((error) => {
          console.error("Error creating profile:", error)
          setError("An unexpected error occurred while creating your profile.")
        })
    } catch (error) {
      console.error("Sign-up Error:", error)
      setError("An unexpected error occurred during sign-up.")
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Supabase Sign-out Error:", error)
      setError("Sign-out failed. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, error, setError, setLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
