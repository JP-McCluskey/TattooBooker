import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { checkRateLimit } from '../lib/validation';

const RESET_RATE_LIMIT_KEY = 'password_reset_requests';
const MAX_RESET_ATTEMPTS = 3;
const RESET_WINDOW_MS = 60 * 60 * 1000; // 1 hour

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Check active sessions
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            await ensureUserProfile(session.user);
          } else {
            setUser(null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    // Initialize auth state
    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      try {
        if (session?.user) {
          setUser(session.user);
          await ensureUserProfile(session.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setUser(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const ensureUserProfile = async (user: User) => {
    try {
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      // If profile doesn't exist, create it
      if (!profile) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              full_name: user.user_metadata.full_name || '',
              avatar_url: user.user_metadata.avatar_url || '',
            }
          ]);

        if (insertError) throw insertError;
      }

      // Check if user has a role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (roleError) throw roleError;

      // If no role exists, assign default user role
      if (!roleData) {
        const { data: defaultRole, error: defaultRoleError } = await supabase
          .from('roles')
          .select('id')
          .eq('name', 'user')
          .single();

        if (defaultRoleError) throw defaultRoleError;

        if (defaultRole) {
          const { error: insertRoleError } = await supabase
            .from('user_roles')
            .insert([
              {
                user_id: user.id,
                role_id: defaultRole.id
              }
            ]);

          if (insertRoleError) throw insertRoleError;
        }
      }
    } catch (error) {
      if (error instanceof Error && !error.message.includes('PGRST116')) {
        console.error('Error ensuring user profile:', error);
      }
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      setLoading(true);
      
      // First create the auth user
      const { data: { user: newUser }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            full_name: `${userData.firstName} ${userData.lastName}`,
            is_artist: userData.is_artist || false,
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
          throw new Error('This email is already registered. Please sign in instead.');
        }
        throw signUpError;
      }
      if (!newUser) throw new Error('No user returned after signup');

      try {
        // Check if profile already exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', newUser.id)
          .maybeSingle();

        // Only create profile if it doesn't exist
        if (!existingProfile) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: newUser.id,
                full_name: `${userData.firstName} ${userData.lastName}`,
                phone: userData.phone,
                address: userData.address,
                bio: userData.bio || '',
                avatar_url: userData.avatar_url || '',
              }
            ]);

          if (profileError) throw profileError;
        }

        // Get appropriate role
        const { data: roleData } = await supabase
          .from('roles')
          .select('id')
          .eq('name', userData.is_artist ? 'artist' : 'user')
          .single();

        if (roleData) {
          // Check if role already assigned
          const { data: existingRole } = await supabase
            .from('user_roles')
            .select('role_id')
            .eq('user_id', newUser.id)
            .maybeSingle();

          if (!existingRole) {
            const { error: roleError } = await supabase
              .from('user_roles')
              .insert([
                {
                  user_id: newUser.id,
                  role_id: roleData.id
                }
              ]);

            if (roleError) throw roleError;
          }
        }
      } catch (error) {
        // If profile/role creation fails, delete the auth user
        await supabase.auth.admin.deleteUser(newUser.id);
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password');
        }
        throw error;
      }
      
      if (session?.user) {
        setUser(session.user);
        await ensureUserProfile(session.user);
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);

      // First clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Remove any cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear user state
      setUser(null);
      
      // Force a complete page reload and redirect to login
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
      
      // If normal signout fails, force a hard reset
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    // Check rate limiting
    if (!checkRateLimit(RESET_RATE_LIMIT_KEY, MAX_RESET_ATTEMPTS, RESET_WINDOW_MS)) {
      throw new Error('Too many reset attempts. Please try again later.');
    }

    try {
      // Request password reset
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      // Log the reset request
      await supabase.from('auth_logs').insert({
        event: 'password_reset_request',
        status: 'success',
        email,
        ip_address: null, // We can't get this in the browser
        user_agent: navigator.userAgent
      });

    } catch (err) {
      // Log failed attempt
      await supabase.from('auth_logs').insert({
        event: 'password_reset_request',
        status: 'failed',
        email,
        error: err instanceof Error ? err.message : 'Unknown error',
        ip_address: null,
        user_agent: navigator.userAgent
      });

      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signUp, 
      signIn, 
      signOut,
      resetPassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};