import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

export type School = {
  id: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
};

export type User = {
  id: string;
  email: string;
  role: 'admin' | 'teacher' | 'student' | 'parent' | 'platform_admin';
  school?: School;
};

type AuthContextType = {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, schoolName: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Check active session and subscribe to auth changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadUserData(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        loadUserData(session.user.id);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      // Get user's school and role
      const { data: schoolUser, error: schoolUserError } = await supabase
        .from('school_users')
        .select(`
          role,
          schools (
            id,
            name,
            status
          )
        `)
        .eq('user_id', userId)
        .single();

      if (schoolUserError) throw schoolUserError;

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      setUser({
        id: userId,
        email: userData.email,
        role: schoolUser?.role || 'platform_admin',
        school: schoolUser?.schools,
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      const inAuthGroup = segments[0] === '(auth)';
      
      if (!user && !inAuthGroup) {
        router.replace('/login');
      } else if (user && inAuthGroup) {
        router.replace('/');
      }
    }
  }, [user, segments, isLoading]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, schoolName: string) => {
    try {
      // Create user account
      const { data: { user: newUser }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;
      if (!newUser) throw new Error('User creation failed');

      // Create school entry
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .insert([
          {
            name: schoolName,
            admin_id: newUser.id,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (schoolError) throw schoolError;

      // Create school_user entry for admin
      const { error: schoolUserError } = await supabase
        .from('school_users')
        .insert([
          {
            user_id: newUser.id,
            school_id: school.id,
            role: 'admin',
            status: 'pending',
          },
        ]);

      if (schoolUserError) throw schoolUserError;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
