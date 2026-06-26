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
    let isResolving = false;
    let sessionResolved = false;

    const resolveUser = async (authUser) => {
      if (!authUser) {
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      // Prevent concurrent resolves
      if (isResolving) return;
      isResolving = true;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (!mounted) return;

        if (error) {
          console.warn('[Auth] Profile fetch warning:', error.message);
          const isTargetAdmin = authUser.email === '2bvision.2b.al@gmail.com';
          const defaultRole = isTargetAdmin ? 'admin' : 'client';
          const fallbackName = authUser.user_metadata?.full_name || authUser.email?.split('@')[0];

          const { data: newProfile, error: upsertErr } = await supabase
            .from('profiles')
            .upsert({ id: authUser.id, full_name: fallbackName, role: defaultRole })
            .select()
            .single();

          if (!upsertErr && newProfile) {
            setUser({ ...authUser, ...newProfile });
          } else {
            setUser({ ...authUser, role: defaultRole, full_name: fallbackName });
          }
        } else {
          setUser({ ...authUser, ...data });
        }
      } catch (err) {
        console.error('[Auth] resolveUser error:', err);
        if (mounted) {
          const isTargetAdmin = authUser.email === '2bvision.2b.al@gmail.com';
          setUser({ ...authUser, role: isTargetAdmin ? 'admin' : 'client' });
        }
      } finally {
        isResolving = false;
        if (mounted) setIsLoading(false);
      }
    };

    // Safety net — fires only if Supabase never responds
    const safetyTimeout = setTimeout(() => {
      if (mounted && !sessionResolved) {
        console.warn('[Auth] Safety timeout reached. Forcing isLoading to false.');
        setIsLoading(false);
      }
    }, 8000);

    supabase.auth.getSession()
      .then(({ data: { session: initialSession }, error }) => {
        sessionResolved = true;
        clearTimeout(safetyTimeout); // Got a response — no need for safety timeout
        if (!mounted) return;
        if (error) {
          console.error('[Auth] getSession error:', error);
          setIsLoading(false);
          return;
        }
        if (initialSession) {
          setSession(initialSession);
          resolveUser(initialSession.user);
        } else {
          setSession(null);
          setUser(null);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        sessionResolved = true;
        clearTimeout(safetyTimeout);
        if (mounted) setIsLoading(false);
        console.error('[Auth] Failed getSession:', err);
      });

    try {
      const { data } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if (!mounted) return;

        console.log('[Auth] Auth state change event:', event, currentSession?.user?.email);

        setSession(prev => prev?.access_token === currentSession?.access_token ? prev : currentSession);

        if (event === 'SIGNED_OUT' || !currentSession?.user) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        // Only re-resolve on SIGNED_IN if getSession didn't already handle it
        if (event === 'SIGNED_IN') {
          await resolveUser(currentSession.user);
        }
      });

      subscription = data.subscription;
    } catch (err) {
      console.error('[Auth] Auth subscription failed:', err);
      if (mounted) setIsLoading(false);
    }

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
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

      if (data.session) {
        toast.success('Regjistrimi ishte i suksesshëm!');
        return { success: true };
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;
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
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });
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
