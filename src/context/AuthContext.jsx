import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Mock Local Storage Auth Fallback
const getLocalUsers = () => JSON.parse(localStorage.getItem('mock_users') || '{}');
const saveLocalUsers = (users) => localStorage.setItem('mock_users', JSON.stringify(users));

const mockSignup = async (name, email, password) => {
  const users = getLocalUsers();
  if (users[email]) {
    return { success: false, error: 'Kjo adresë emaili është e regjistruar.' };
  }
  
  // Store pending registration
  const pendingUser = { id: Math.random().toString(36).substring(7), email, password, full_name: name, role: email === '2bvision.2b.al@gmail.com' ? 'admin' : 'client' };
  sessionStorage.setItem('mock_pending_user', JSON.stringify(pendingUser));
  sessionStorage.setItem('pending_signup_name', name);
  
  toast.success('Regjistrimi u krye (Mock Mode)! Kodi i verifikimit është 123456.');
  return { success: true, requiresOtp: true };
};

const mockVerifyOtp = async (email, token) => {
  if (token !== '123456') {
    return { success: false, error: 'Kodi është i gabuar ose ka skaduar. Provo sërish.' };
  }
  const pendingUserJson = sessionStorage.getItem('mock_pending_user');
  if (!pendingUserJson) {
    return { success: false, error: 'Nuk u gjet asnjë regjistrim në pritje.' };
  }
  const pendingUser = JSON.parse(pendingUserJson);
  const users = getLocalUsers();
  users[email] = pendingUser;
  saveLocalUsers(users);
  
  // Set current user & session
  const mockSession = { user: pendingUser, access_token: 'mock-token' };
  localStorage.setItem('mock_session', JSON.stringify(mockSession));
  
  toast.success('Llogaria u verifikua! Mirë se erdhe (Mock Mode)!');
  return { success: true, user: pendingUser, session: mockSession };
};

const mockLogin = async (email, password) => {
  const users = getLocalUsers();
  const user = users[email];
  if (!user || user.password !== password) {
    return { success: false, error: 'Email ose fjalëkalim i gabuar.' };
  }
  const mockSession = { user, access_token: 'mock-token' };
  localStorage.setItem('mock_session', JSON.stringify(mockSession));
  toast.success('U loguat me sukses (Mock Mode)!');
  return { success: true, user, session: mockSession };
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const mockSessionJson = localStorage.getItem('mock_session');
      return mockSessionJson ? JSON.parse(mockSessionJson) : null;
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState(() => {
    try {
      const mockSessionJson = localStorage.getItem('mock_session');
      return mockSessionJson ? JSON.parse(mockSessionJson)?.user : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(() => {
    try {
      return !localStorage.getItem('mock_session');
    } catch {
      return true;
    }
  });

  useEffect(() => {
    let mounted = true;
    let subscription;

    // Check mock session first
    const mockSessionJson = localStorage.getItem('mock_session');
    if (mockSessionJson) {
      return;
    }

    const resolveUser = async (authUser) => {
      if (!authUser) {
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      console.log('[Auth] Resolving user profile:', authUser.email);
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (!mounted) return;

        if (error) {
          console.warn('[Auth] Profile fetch warning:', error.message);
          // If no profile exists, create a default one
          const isTargetAdmin = authUser.email === '2bvision.2b.al@gmail.com';
          const defaultRole = isTargetAdmin ? 'admin' : 'client';
          const fallbackName = authUser.user_metadata?.full_name || authUser.email?.split('@')[0];

          const { data: newProfile, error: upsertErr } = await supabase
            .from('profiles')
            .upsert({
              id: authUser.id,
              full_name: fallbackName,
              role: defaultRole
            })
            .select()
            .single();

          if (!upsertErr && newProfile) {
            setUser({ ...authUser, ...newProfile });
          } else {
            setUser({ ...authUser, role: defaultRole, full_name: fallbackName });
          }
        } else {
          // Use profile role dynamically from the database
          setUser({ ...authUser, ...data });
        }
      } catch (err) {
        console.error('[Auth] resolveUser error:', err);
        if (mounted) {
          const isTargetAdmin = authUser.email === '2bvision.2b.al@gmail.com';
          setUser({ ...authUser, role: isTargetAdmin ? 'admin' : 'client' });
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    // Safety fallback timeout: ensure loading screen is dismissed eventually
    const safetyTimeout = setTimeout(() => {
      if (mounted) {
        setIsLoading(current => {
          if (current) {
            console.warn('[Auth] Safety timeout reached. Forcing isLoading to false.');
            return false;
          }
          return current;
        });
      }
    }, 5000);

    // Use getSession with .then() to avoid blocking async execution
    supabase.auth.getSession()
      .then(({ data: { session: initialSession }, error }) => {
        if (!mounted) return;
        if (error) {
          console.error('[Auth] getSession error:', error);
          setIsLoading(false);
          return;
        }
        if (initialSession) {
          console.log('[Auth] Initial session found from getSession:', initialSession.user?.email);
          setSession(initialSession);
          resolveUser(initialSession.user);
        } else {
          console.log('[Auth] No initial session found.');
          setSession(null);
          setUser(null);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) setIsLoading(false);
        console.error('[Auth] Failed getSession:', err);
      });
    // Subscribe to auth state changes
    try {
      const { data } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if (!mounted) return;

        console.log('[Auth] Auth state change event:', event, currentSession?.user?.email);

        setSession(prev => prev?.access_token === currentSession?.access_token ? prev : currentSession);

        if (event === 'SIGNED_OUT' || !currentSession?.user) {
          setUser(prev => prev === null ? prev : null);
          setIsLoading(false);
          return;
        }

        await resolveUser(currentSession.user);
      });

      subscription = data.subscription;
    } catch (err) {
      console.error('[Auth] Auth subscription failed:', err);
      if (mounted) setTimeout(() => setIsLoading(false), 0);
    }

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription?.unsubscribe();
    };
  }, []); // No dependencies, no navigate

  const login = async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('fetch') || error.message.includes('NetworkError') || error.message.includes('TypeError')) {
          const result = await mockLogin(email, password);
          if (result.success) {
            setSession(result.session);
            setUser(result.user);
          }
          return result;
        }
        throw error;
      }
      toast.success('U loguat me sukses!');
      return { success: true };
    } catch (error) {
      if (error.message && (error.message.includes('fetch') || error.message.includes('NetworkError') || error.message.includes('TypeError'))) {
        const result = await mockLogin(email, password);
        if (result.success) {
          setSession(result.session);
          setUser(result.user);
        }
        return result;
      }
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
      if (error) {
        const isEmailError = error.message.toLowerCase().includes('sending') ||
          error.message.toLowerCase().includes('email') ||
          error.code === 'unexpected_failure';
        const isNetworkError = error.message.includes('fetch') || error.message.includes('NetworkError') || error.message.includes('TypeError');
        if (isNetworkError || isEmailError) {
          toast('Email sending unavailable. Using demo mode — verification code is 123456.', { icon: '⚠️' });
          return await mockSignup(name, email, password);
        }
        throw error;
      }

      if (data.session) {
        toast.success('Regjistrimi ishte i suksesshëm!');
        return { success: true, requiresOtp: false };
      }

      sessionStorage.setItem('pending_signup_name', name);
      toast.success('Regjistrimi u krye! Kodi i verifikimit u dërgua.');
      return { success: true, requiresOtp: true };
    } catch (error) {
      if (error.message && (error.message.includes('fetch') || error.message.includes('NetworkError') || error.message.includes('TypeError'))) {
        return await mockSignup(name, email, password);
      }
      return { success: false, error: error.message };
    }
  };

  const verifyOtp = async (email, token, type = 'email') => {
    try {
      if (sessionStorage.getItem('mock_pending_user')) {
        const result = await mockVerifyOtp(email, token);
        if (result.success) {
          setSession(result.session);
          setUser(result.user);
        }
        return result;
      }

      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type,
      });
      if (error) {
        if (error.message.includes('fetch') || error.message.includes('NetworkError') || error.message.includes('TypeError')) {
          const result = await mockVerifyOtp(email, token);
          if (result.success) {
            setSession(result.session);
            setUser(result.user);
          }
          return result;
        }
        throw error;
      }

      sessionStorage.removeItem('pending_signup_name');
      toast.success('Llogaria u verifikua! Mirë se erdhe!');
      return { success: true };
    } catch (error) {
      if (error.message && (error.message.includes('fetch') || error.message.includes('NetworkError') || error.message.includes('TypeError'))) {
        const result = await mockVerifyOtp(email, token);
        if (result.success) {
          setSession(result.session);
          setUser(result.user);
        }
        return result;
      }
      return { success: false, error: error.message };
    }
  };

  const resendOtp = async (email) => {
    try {
      if (sessionStorage.getItem('mock_pending_user')) {
        toast.success('Kodi i ri u dërgua me sukses (Mock Mode: 123456)!');
        return { success: true };
      }
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) throw error;
      toast.success('Kodi i ri u dërgua me sukses!');
      return { success: true };
    } catch (error) {
      if (error.message && (error.message.includes('fetch') || error.message.includes('NetworkError') || error.message.includes('TypeError'))) {
        toast.success('Kodi i ri u dërgua me sukses (Mock Mode: 123456)!');
        return { success: true };
      }
      console.error('Resend OTP Error:', error);
      return { success: false, error: error.message };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Google Login Error:', error);
      const mockUser = {
        id: 'mock-google-id',
        name: 'Google User',
        email: 'googleuser@example.com',
        role: 'client',
      };
      const mockSession = { user: mockUser, access_token: 'mock-token' };
      localStorage.setItem('mock_session', JSON.stringify(mockSession));
      setSession(mockSession);
      setUser(mockUser);
      toast.success('U loguat me sukses me Google (Mock Mode)!');
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
      if (localStorage.getItem('mock_session')) {
        localStorage.removeItem('mock_session');
        setSession(null);
        setUser(null);
        toast.success('U çkyçe me sukses (Mock Mode)');
        return;
      }
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
      value={{ user, session, isLoading, login, signup, verifyOtp, resendOtp, signInWithGoogle, signInWithGoogleIdToken, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
