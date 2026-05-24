import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Fetch the profile row from Supabase and merge it with the auth user object.
    // This gives us role, name, etc. from the profiles table.
    const resolveUser = async (authUser) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (!mounted) return;

        if (error) {
          // Profile row may not exist yet — fall back gracefully
          console.warn('Profile fetch warning:', error.message);
          setUser({ ...authUser, role: 'client' });
        } else {
          setUser({ ...authUser, ...data });
        }
      } catch (err) {
        console.error('resolveUser error:', err);
        if (mounted) setUser({ ...authUser, role: 'client' });
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    let subscription;
    try {
      // onAuthStateChange fires immediately with the current session
      // (INITIAL_SESSION event), so we don't need a separate getSession() call.
      const { data } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if (!mounted) return;

        setSession(currentSession);

        if (event === 'SIGNED_OUT' || !currentSession?.user) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        // Upsert the profile row for brand-new sign-ins
        if (event === 'SIGNED_IN') {
          try {
            await supabase.from('profiles').upsert(
              {
                id: currentSession.user.id,
                name:
                  currentSession.user.user_metadata?.full_name ||
                  currentSession.user.email?.split('@')[0],
                email: currentSession.user.email,
                role: 'client',
              },
              { onConflict: 'id', ignoreDuplicates: true }
            );
          } catch (err) {
            console.warn('Profile upsert warning:', err);
          }
        }

        await resolveUser(currentSession.user);
      });

      subscription = data.subscription;
    } catch (err) {
      console.error('Auth subscription failed:', err);
      if (mounted) setIsLoading(false);
    }

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []); // ← MUST stay empty — re-running this effect causes the ping-pong loop

  // ── Auth actions ──────────────────────────────────────────────────────────
  // IMPORTANT: None of these functions call navigate() or manipulate routing.
  // Routing decisions are made declaratively in DashboardSection based on
  // the `user` and `isLoading` state values from this context.

  const login = async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Mirë se erdhe!');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) throw error;
      sessionStorage.setItem('pending_signup_name', name);
      toast.success('Kodi u dërgua në emailin tënd!');
      return { success: true, email };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const verifyOtp = async (email, token) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup',
      });
      if (error) throw error;

      const name =
        sessionStorage.getItem('pending_signup_name') || email.split('@')[0];
      const { error: profileError } = await supabase.from('profiles').upsert(
        { id: data.user.id, name, email, role: 'client' },
        { onConflict: 'id', ignoreDuplicates: true }
      );

      if (profileError) console.warn('Profile creation warning:', profileError.message);
      sessionStorage.removeItem('pending_signup_name');
      toast.success('Llogaria u verifikua! Mirë se erdhe!');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signInWithGoogle = async () => {
    console.log('signInWithGoogle: triggered');
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      console.log('signInWithGoogle result — data:', data, 'error:', error);
      if (error) throw error;
    } catch (error) {
      console.error('Google Login Error:', error);
      toast.error('Hyrja me Google dështoi. Provo sërish.');
    }
  };

  // logout: only calls supabase.auth.signOut().
  // DashboardSection reacts to user becoming null and shows <Auth /> automatically.
  // NO navigate() or window.location calls — those cause the ping-pong loop.
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('U çkyçe me sukses');
    } catch (error) {
      toast.error('Gabim gjatë çkyçjes');
      console.error(error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, session, isLoading, login, signup, verifyOtp, signInWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
