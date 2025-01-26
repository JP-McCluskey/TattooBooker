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
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

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
        .single();

      if (roleError && roleError.code !== 'PGRST116') {
        throw roleError;
      }

      // If no role exists, assign default user role
      if (!roleData) {
        const { data: defaultRole } = await supabase
          .from('roles')
          .select('id')
          .eq('name', 'user')
          .single();

        if (defaultRole) {
          await supabase
            .from('user_roles')
            .insert([
              {
                user_id: user.id,
                role_id: defaultRole.id
              }
            ]);
        }
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error);
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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
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