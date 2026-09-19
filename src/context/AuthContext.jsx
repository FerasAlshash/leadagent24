import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { API_BASE_URL } from '../lib/api';

const AuthContext = createContext({});
const FASTAPI_URL = API_BASE_URL;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. Listen for auth changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(prevUser => {
        // If user ID is the same (e.g. background TOKEN_REFRESHED on tab focus), preserve previous object reference
        if (newSession?.user?.id && prevUser?.id === newSession.user.id) {
          return prevUser;
        }
        return newSession?.user ?? null;
      });
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    try {
      // 1. Try signing in via FastAPI backend (which auto-confirms if unconfirmed)
      const res = await fetch(`${FASTAPI_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        // FastAPI confirmed or validated, now set session directly on Supabase client
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (!error && data?.session) {
          setSession(data.session);
          setUser(data.user);
          return data;
        }
      }
    } catch (backendErr) {
      console.warn("Backend login pre-check skipped:", backendErr);
    }

    // Direct fallback to Supabase client
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signUp = async (email, password) => {
    try {
      // 1. Call FastAPI backend which creates the user via Supabase Admin with email_confirm=True
      const res = await fetch(`${FASTAPI_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        // Automatically establish client Supabase session without email verification
        return await signIn(email, password);
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Registration failed');
      }
    } catch (err) {
      // If FastAPI is reachable and threw an error (like user already exists), propagate it
      if (err.message && !err.message.includes('Failed to fetch')) {
        throw err;
      }
      // Fallback directly to Supabase client
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      return data;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
