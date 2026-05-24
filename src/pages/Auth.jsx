import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Camera, Mail, Lock, User, Loader2, KeyRound, ArrowLeft } from 'lucide-react';
import { useCursor } from '../context/CursorContext';
import ReCAPTCHA from 'react-google-recaptcha';
import toast from 'react-hot-toast';

// Inline Google SVG icon (no external dependency needed)
function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// 6-box OTP input component
function OtpInput({ value, onChange }) {
  const inputs = useRef([]);

  const handleChange = (idx, e) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    const chars = value.split('');
    chars[idx] = val;
    onChange(chars.join(''));

    // Auto-advance
    if (val && idx < 5) {
      inputs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !value[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted.padEnd(6, '').slice(0, 6));
    // Focus last filled
    const lastIdx = Math.min(pasted.length, 5);
    inputs.current[lastIdx]?.focus();
  };

  return (
    <div className="flex justify-center gap-3" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => (inputs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[idx] || ''}
          onChange={(e) => handleChange(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          className={`w-12 h-14 text-center text-2xl font-bold text-slate-900 border-b-2 bg-transparent outline-none transition-all ${
            value[idx]
              ? 'border-slate-800 text-slate-900'
              : 'border-zinc-300 focus:border-slate-800'
          }`}
        />
      ))}
    </div>
  );
}

export function Auth() {
  // Modes: 'login' | 'signup' | 'verifying'
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);

  const { login, signup, verifyOtp, signInWithGoogle } = useAuth();
  const { setHovering, setDefault } = useCursor();

  const resetCaptcha = () => {
    setCaptchaToken(null);
    recaptchaRef.current?.reset();
  };

  // ── Main form submit (login or signup) ──────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!captchaToken) {
      toast.error('Të lutem konfirmo që nuk je robot (CAPTCHA).');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        const result = await login(formData.email, formData.password);
        if (!result.success) setError(result.error);
      } else {
        const result = await signup(formData.name, formData.email, formData.password);
        if (result.success) {
          setMode('verifying');
          resetCaptcha();
        } else {
          setError(result.error);
        }
      }
    } catch {
      setError('Ndodhi një gabim i papritur. Provo sërish.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── OTP verification submit ─────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpCode.length < 6) {
      toast.error('Shkruaj kodin 6-shifror.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const result = await verifyOtp(formData.email, otpCode);
      if (!result.success) setError(result.error);
    } catch {
      setError('Kodi është i gabuar ose ka skaduar. Provo sërish.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setOtpCode('');
    resetCaptcha();
  };

  // ── OTP Verification View ───────────────────────────────────────────────
  if (mode === 'verifying') {
    return (
      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          key="verifying"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white p-10 border border-zinc-200 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-800" />

          <div className="text-center mb-8">
            <div className="mx-auto w-14 h-14 bg-slate-50 border border-zinc-200 rounded-full flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6 text-slate-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-widest mb-2">Verifiko Emailin</h2>
            <p className="text-sm text-slate-500 font-light">
              Dërguam një kod 6-shifror te<br />
              <span className="font-semibold text-slate-700">{formData.email}</span>
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 text-sm text-center">
                {error}
              </div>
            )}

            <OtpInput value={otpCode} onChange={setOtpCode} />

            <button
              type="submit"
              disabled={isLoading || otpCode.length < 6}
              onMouseEnter={setHovering}
              onMouseLeave={setDefault}
              className="w-full flex justify-center py-3 px-4 text-sm font-bold uppercase tracking-widest text-white bg-slate-800 hover:bg-slate-900 transition-all disabled:opacity-50 disabled:bg-slate-400"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Konfirmo Kodin'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => switchMode('signup')}
                onMouseEnter={setHovering}
                onMouseLeave={setDefault}
                className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Kthehu mbrapa
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  // ── Login / Signup View ─────────────────────────────────────────────────
  return (
    <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="max-w-md w-full bg-white p-10 border border-zinc-200 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-800" />

          {/* Header */}
          <div className="text-center mb-8">
            <Camera className="mx-auto h-10 w-10 text-slate-800 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-widest">
              {mode === 'login' ? 'Client Portal' : 'Krijo Llogari'}
            </h2>
            <p className="mt-2 text-sm text-slate-500 font-light">
              {mode === 'login' ? 'Hyr për të parë galeritë dhe rezervimet.' : 'Regjistrohu për të menaxhuar seancat.'}
            </p>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={async () => {
              try {
                console.log('Google button clicked');
                await signInWithGoogle();
              } catch (err) {
                console.error('Google Login Error (button handler):', err);
              }
            }}
            onMouseEnter={setHovering}
            onMouseLeave={setDefault}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-slate-700 font-semibold text-sm transition-all mb-6"
          >
            <GoogleIcon />
            Vazhdo me Google
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-xs font-bold uppercase tracking-widest text-slate-400">Ose</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {mode === 'signup' && (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="name" name="name" type="text" required
                    placeholder="Emri i plotë"
                    className="block w-full pl-10 pr-3 py-3 border border-zinc-200 bg-zinc-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 sm:text-sm transition-all"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email" name="email" type="email" autoComplete="email" required
                  placeholder="Adresa e emailit"
                  className="block w-full pl-10 pr-3 py-3 border border-zinc-200 bg-zinc-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 sm:text-sm transition-all"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password" name="password" type="password" autoComplete="current-password" required
                  placeholder="Fjalëkalimi"
                  className="block w-full pl-10 pr-3 py-3 border border-zinc-200 bg-zinc-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 sm:text-sm transition-all"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              onMouseEnter={setHovering}
              onMouseLeave={setDefault}
              className="w-full flex justify-center py-3 px-4 text-sm font-bold uppercase tracking-widest text-white bg-slate-800 hover:bg-slate-900 transition-all disabled:opacity-70 disabled:bg-slate-400"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'login' ? 'Hyr' : 'Regjistrohu')}
            </button>

            {/* reCAPTCHA */}
            <div className="flex justify-center">
              <div className="border border-zinc-200 p-2 bg-zinc-50">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
                  onChange={setCaptchaToken}
                  onExpired={() => setCaptchaToken(null)}
                  theme="light"
                />
              </div>
            </div>

            {/* Toggle mode */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                onMouseEnter={setHovering}
                onMouseLeave={setDefault}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                {mode === 'login'
                  ? "Nuk ke llogari? Regjistrohu"
                  : "Ke llogari? Hyr"}
              </button>
            </div>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
