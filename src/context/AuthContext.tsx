import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        ensureUserProfile(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await ensureUserProfile(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const ensureUserProfile = async (user: User) => {
    try {
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle instead of single to handle no results gracefully

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
        .maybeSingle(); // Use maybeSingle instead of single

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
      // Only log actual errors, not "no rows returned" messages
      if (error instanceof Error && !error.message.includes('PGRST116')) {
        console.error('Error ensuring user profile:', error);
      }
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
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

    if (signUpError) throw signUpError;
    if (!user) throw new Error('No user returned after signup');

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: user.id,
          full_name: `${userData.firstName} ${userData.lastName}`,
          phone: userData.phone,
          address: userData.address,
          bio: userData.bio || '',
          avatar_url: userData.avatar_url || '',
        }
      ]);

    if (profileError) throw profileError;

    // Get appropriate role
    const { data: roleData } = await supabase
      .from('roles')
      .select('id')
      .eq('name', userData.is_artist ? 'artist' : 'user')
      .single();

    if (roleData) {
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([
          {
            user_id: user.id,
            role_id: roleData.id
          }
        ]);

      if (roleError) throw roleError;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data: { session }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    if (session?.user) {
      setUser(session.user);
      await ensureUserProfile(session.user);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear user state immediately
      setUser(null);
      
      // Clear any stored session data
      localStorage.removeItem('supabase.auth.token');
      
      // Force reload the page to clear any cached state
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
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