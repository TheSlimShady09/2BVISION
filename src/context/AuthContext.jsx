import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const ADMIN_EMAILS = ['2bvision.2b.al@gmail.com', 'roanballa6@gmail.com'];

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Safety net: if auth hasn't resolved in 6 seconds, force-clear loading.
    const safetyTimer = setTimeout(() => {
      if (mounted) setIsLoading(false);
    }, 6000);

    const resolveUser = async (authUser) => {
      if (!authUser) {
        if (mounted) { setUser(null); setIsLoading(false); }
        return;
      }
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (!mounted) return;

        if (error) {
          const role = ADMIN_EMAILS.includes(authUser.email) ? 'admin' : 'client';
          const full_name = authUser.user_metadata?.full_name || authUser.email?.split('@')[0];
          const { data: newProfile } = await supabase
            .from('profiles')
            .upsert({ id: authUser.id, full_name, role })
            .select()
            .single();
          if (mounted) setUser({ ...authUser, ...(newProfile || { role, full_name }) });
        } else {
          const role = ADMIN_EMAILS.includes(authUser.email) ? 'admin' : (data.role || 'client');
          if (mounted) setUser({ ...authUser, ...data, role });
        }
      } catch (err) {
        console.error('[Auth] resolveUser error:', err);
        if (mounted) {
          const role = ADMIN_EMAILS.includes(authUser.email) ? 'admin' : 'client';
          setUser({ ...authUser, role });
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    let subscription;
    try {
      const { data } = supabase.auth.onAuthStateChange((event, currentSession) => {
        if (!mounted) return;

        setSession(currentSession);

        if (!currentSession?.user || event === 'SIGNED_OUT') {
          setUser(null);
          setIsLoading(false);
          return;
        }

        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          // Fire-and-forget — resolveUser manages its own state + loading
          resolveUser(currentSession.user);
        } else {
          // TOKEN_REFRESHED etc. — session refreshed, user unchanged
          setIsLoading(false);
        }
      });
      subscription = data.subscription;
    } catch (err) {
      console.error('[Auth] onAuthStateChange failed:', err);
      if (mounted) setIsLoading(false);
    }

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Logged in successfully!');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) throw error;

      if (!data.session && data.user?.identities?.length === 0) {
        return { success: false, error: 'This email is already registered. Try signing in.' };
      }
      if (!data.session) {
        return { success: false, error: 'Please check your email to confirm your account.' };
      }

      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      console.error('[Signup] Error:', error);
      return { success: false, error: error.message || 'Unknown error. Please try again.' };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Google Login Error:', error);
      toast.error('Google sign-in failed. Please try again.');
    }
  };

  const signInWithGoogleIdToken = async (idToken) => {
    try {
      const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken });
      if (error) throw error;
      toast.success('Welcome with Google!');
      return { success: true };
    } catch (error) {
      console.error('Google ID Token Login Error:', error);
      toast.error('Google sign-in failed. Please try again.');
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[Auth] signOut error (ignored):', err);
    }
    // Always clear state and redirect regardless of API success
    setUser(null);
    setSession(null);
    toast.success('Signed out successfully');
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider
      value={{ user, session, isLoading, login, signup, signInWithGoogle, signInWithGoogleIdToken, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
