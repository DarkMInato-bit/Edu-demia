'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  role: 'student' | 'teacher' | 'admin' | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: 'student' | 'teacher') => Promise<void>;
  signOut: () => Promise<void>;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'student' | 'teacher' | 'admin' | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const setData = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const userRole = session.user.user_metadata?.role || null;
        setRole(userRole);
        setToken(session.access_token);
      }
      setLoading(false);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setUser(session.user);
        const userRole = session.user.user_metadata?.role || null;
        setRole(userRole);
        setToken(session.access_token);
        
        // Auto redirect if on auth pages
        const authPaths = ['/login', '/signup', '/'];
        if (authPaths.includes(window.location.pathname)) {
          if (userRole === 'admin') router.push('/dashboard/admin');
          else if (userRole === 'teacher') router.push('/dashboard/teacher');
          else router.push('/dashboard/student');
        }
      } else {
        setUser(null);
        setRole(null);
        setToken(null);
        setLoading(false);
      }
    });

    setData();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    const userRole = data.user?.user_metadata?.role;
    if (userRole === 'admin') router.push('/dashboard/admin');
    else if (userRole === 'teacher') router.push('/dashboard/teacher');
    else router.push('/dashboard/student');
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'student' | 'teacher') => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
          is_approved: role === 'teacher' ? false : true
        },
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signIn, signUp, signOut, token }}>
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
