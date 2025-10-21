import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { AuthContextType, UserProfile, UserRole } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile and role from profiles table
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setRole(data.role as UserRole);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setProfile(null);
      setRole(null);
    }
  };

  // Initialize auth state and listen for changes
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign up function
  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole
  ) => {
    try {
      // Create auth user with metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Check if user is confirmed (email confirmation disabled) or needs confirmation
        const isConfirmed = data.user.confirmed_at !== null || data.session !== null;
        
        if (isConfirmed) {
          // User is immediately confirmed - create profile
          // Wait a moment for the session to be established
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Create profile record
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              full_name: fullName,
              role: role,
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
            throw profileError;
          }
        }
        // If not confirmed, the profile will be created by a trigger when email is confirmed
      }
    } catch (error: any) {
      console.error('Error in signUp:', error);
      throw new Error(error.message || 'An error occurred during registration');
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await fetchUserProfile(data.user.id);
      }
    } catch (error: any) {
      console.error('Error in signIn:', error);
      throw new Error(error.message || 'Invalid email or password');
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setProfile(null);
      setRole(null);
    } catch (error: any) {
      console.error('Error in signOut:', error);
      throw new Error(error.message || 'An error occurred during logout');
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    role,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
