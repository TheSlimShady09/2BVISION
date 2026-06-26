import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let subscription;

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
          const isAdmin = authUser.email === '2bvision.2b.al@gmail.com';
          const role = isAdmin ? 'admin' : 'client';
          const full_name = authUser.user_metadata?.full_name || authUser.email?.split('@')[0];

          const { data: newProfile } = await supabase
            .from('profiles')
            .upsert({ id: authUser.id, full_name, role })
            .select()
            .single();

          setUser({ ...authUser, ...(newProfile || { role, full_name }) });
        } else {
          setUser({ ...authUser, ...data });
        }
      } catch (err) {
        console.error('[Auth] resolveUser error:', err);
        if (mounted) {
          const isAdmin = authUser.email === '2bvision.2b.al@gmail.com';
          setUser({ ...authUser, role: isAdmin ? 'admin' : 'client' });
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    try {
      // onAuthStateChange fires INITIAL_SESSION immediately from localStorage cache
      // — no need for a separate getSession() call
      const { data } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if (!mounted) return;

        setSession(currentSession);

        if (event === 'SIGNED_OUT' || !currentSession?.user) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        // INITIAL_SESSION = page load with cached session
        // SIGNED_IN = user just logged in
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
          await resolveUser(currentSession.user);
        }
      });

      subscription = data.subscription;
    } catch (err) {
      console.error('[Auth] Subscription failed:', err);
      if (mounted) setIsLoading(false);
    }

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('U loguat me sukses!');
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

      if (!data.session) {
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) throw loginError;
      }

      toast.success('Regjistrimi ishte i suksesshëm!');
      return { success: true };
    } catch (error) {
      console.error('[Signup] Error:', error);
      return { success: false, error: error.message || 'Gabim i panjohur. Provo sërish.' };
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
      toast.error('Hyrja me Google dështoi. Provo sërish.');
    }
  };

  const signInWithGoogleIdToken = async (idToken) => {
    try {
      const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken });
      if (error) throw error;
      toast.success('Mirë se erdhe me Google!');
      return { success: true };
    } catch (error) {
      console.error('Google ID Token Login Error:', error);
      toast.error('Hyrja me Google dështoi. Provo sërish.');
      return { success: false, error: error.message };
    }
  };

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
