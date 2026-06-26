import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Camera, Mail, Lock, User, Loader2, KeyRound, ArrowLeft } from 'lucide-react';
import { useCursor } from '../context/CursorContext';
import ReCAPTCHA from 'react-google-recaptcha';
import toast from 'react-hot-toast';

// 6-box OTP input component
function OtpInput({ value, onChange }) {
  const inputs = useRef([]);

  const handleChange = (idx, e) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    
    // Reconstruct the 6 characters array, defaulting to ' ' for empty slots
    const chars = Array.from({ length: 6 }, (_, i) => {
      const char = value[i];
      return (char && char !== ' ') ? char : ' ';
    });
    
    chars[idx] = val || ' ';
    onChange(chars.join(''));

    // Auto-advance
    if (val && idx < 5) {
      inputs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace') {
      const chars = Array.from({ length: 6 }, (_, i) => {
        const char = value[i];
        return (char && char !== ' ') ? char : ' ';
      });

      if (chars[idx] !== ' ') {
        return;
      }

      if (idx > 0) {
        chars[idx - 1] = ' ';
        onChange(chars.join(''));
        inputs.current[idx - 1]?.focus();
        e.preventDefault();
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      inputs.current[idx - 1]?.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowRight' && idx < 5) {
      inputs.current[idx + 1]?.focus();
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted.padEnd(6, ' '));
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
          value={value[idx] && value[idx] !== ' ' ? value[idx] : ''}
          onChange={(e) => handleChange(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          className={`w-12 h-14 text-center text-2xl font-bold text-[#2d2d2d] border-b-2 bg-transparent outline-none transition-all ${
            value[idx] && value[idx] !== ' '
              ? 'border-[#2d2d2d] text-[#2d2d2d]'
              : 'border-zinc-300 focus:border-[#2d2d2d]'
          }`}
        />
      ))}
    </div>
  );
}

export function Auth({ isAdmin = false }) {
  // Modes: 'login' | 'signup' | 'verifying'
  const [mode, setMode] = useState('login');
  const [verifyingType, setVerifyingType] = useState('email'); // 'email' | 'signup'
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const recaptchaRef = useRef(null);

  const { login, signup, verifyOtp, signInWithGoogle, resendOtp } = useAuth();
  const { setHovering, setDefault } = useCursor();

  const resetCaptcha = useCallback(() => {
    setCaptchaToken(null);
    recaptchaRef.current?.reset();
  }, []);

  const handleExpired = useCallback(() => {
    setCaptchaToken(null);
  }, []);

  // Check for OAuth errors in the URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('error=')) {
      const params = new URLSearchParams(hash.substring(1));
      const errorDesc = params.get('error_description') || 'Gabim gjatë logimit me Google.';
      toast.error(errorDesc.replace(/\+/g, ' '));
      // Clean up only the error hash
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  // ── OTP Timer ───────────────────────────────────────────────────────────
  useEffect(() => {
    let timer;
    if (mode === 'verifying' && countdown > 0 && !canResend) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [mode, countdown, canResend]);

  const handleResendOtp = async () => {
    if (!canResend) return;
    setIsLoading(true);
    setError('');
    try {
      const result = await resendOtp(formData.email);
      if (result.success) {
        setCountdown(60);
        setCanResend(false);
      } else {
        setError(result.error);
      }
    } finally {
      setIsLoading(false);
    }
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
        if (!result.success) {
          setError(result.error);
        }
      } else {
        const result = await signup(formData.name, formData.email, formData.password);
        if (result.success) {
          if (result.requiresOtp) {
            setVerifyingType('signup');
            setMode('verifying');
            setCountdown(60);
            setCanResend(false);
            resetCaptcha();
          }
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
    const cleanedCode = otpCode.replace(/\s/g, '');
    if (cleanedCode.length < 6) {
      toast.error('Shkruaj kodin 6-shifror.');
      return;
    }
    setError('');

    setIsLoading(true);
    try {
      const result = await verifyOtp(formData.email, cleanedCode, verifyingType);
      if (!result.success) setError(result.error);
    } catch {
      setError('Kodi është i gabuar ose ka skaduar. Provo sërish.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setOtpCode('');
    setFormData(prev => ({ ...prev, password: '' }));
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
          className="max-w-md w-full bg-[#FAF9F6] p-10 border border-[#E5DCC5] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37]" />

          <div className="text-center mb-8">
            <div className="mx-auto w-14 h-14 bg-transparent border border-[#E5DCC5] rounded-full flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6 text-[#1C1C1C]" />
            </div>
            <h2 className="text-2xl font-serif text-[#1C1C1C] uppercase tracking-widest mb-2">Verifiko Emailin</h2>
            <p className="text-sm text-[#1C1C1C]/70 font-light">
              Dërguam një kod 6-shifror te<br />
              <span className="font-semibold text-[#444444]">{formData.email}</span>
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-8">
            {error && (
              <div className="text-[#8B0000] text-sm text-center tracking-wide font-medium">
                {error}
              </div>
            )}

            <OtpInput value={otpCode} onChange={(val) => { setOtpCode(val); if(error) setError(''); }} />

              <button
                type="submit"
                disabled={isLoading || otpCode.replace(/\s/g, '').length < 6}
                onMouseEnter={setHovering}
                onMouseLeave={setDefault}
                className="w-full flex justify-center py-3 px-4 text-sm font-bold uppercase tracking-widest text-[#FAF9F6] bg-[#1C1C1C] hover:bg-[#333333] transition-all disabled:opacity-50 disabled:bg-[#1C1C1C]/50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Konfirmo Kodin'}
              </button>

              <div className="flex flex-col items-center gap-4 mt-6 pt-6 border-t border-zinc-100">
                <div className="text-sm text-[#707070]">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="font-semibold text-[#2d2d2d] hover:text-[#555555] underline underline-offset-4 transition-colors disabled:opacity-50"
                    >
                      Dërgo një kod të ri
                    </button>
                  ) : (
                    <span>Mund të ridërgosh kodin pas <strong className="text-[#2d2d2d]">{countdown}s</strong></span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  onMouseEnter={setHovering}
                  onMouseLeave={setDefault}
                  className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-slate-400 hover:text-[#444444] transition-colors"
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
          className="max-w-md w-full bg-[#FAF9F6] p-10 border border-[#E5DCC5] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37]" />

          {/* Header */}
          <div className="text-center mb-8">
            <Camera className="mx-auto h-10 w-10 text-[#1C1C1C] mb-4" />
            <h2 className="text-2xl font-serif text-[#1C1C1C] uppercase tracking-widest">
              {mode === 'login' ? (isAdmin ? 'Admin Portal' : 'Client Portal') : 'Krijo Llogari'}
            </h2>
            <p className="mt-2 text-sm text-[#1C1C1C]/70 font-light">
              {mode === 'login' 
                ? (isAdmin ? 'Hyr për të menaxhuar studion.' : 'Hyr për të parë galeritë dhe rezervimet.') 
                : 'Regjistrohu për të menaxhuar seancat.'}
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <button
              type="button"
              onClick={signInWithGoogle}
              onMouseEnter={setHovering}
              onMouseLeave={setDefault}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-zinc-200 bg-white hover:bg-zinc-50 transition-all text-sm font-semibold text-[#444444]"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              {mode === 'login' ? 'Vazhdo me Google' : 'Regjistrohu me Google'}
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5DCC5]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#FAF9F6] px-4 text-xs font-bold uppercase tracking-widest text-[#1C1C1C]/50">Ose me Email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="text-[#8B0000] text-sm text-center tracking-wide font-medium">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {mode === 'signup' && (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-[#1C1C1C]/50" />
                  </div>
                  <input
                    id="name" name="name" type="text" required
                    placeholder="Emri i plotë"
                    className="block w-full pl-10 pr-3 py-3 border border-[#E5DCC5] bg-transparent text-[#1C1C1C] placeholder-[#1C1C1C]/40 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] sm:text-sm transition-all"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[#1C1C1C]/50" />
                </div>
                <input
                  id="email" name="email" type="email" autoComplete="email" required
                  placeholder="Adresa e emailit"
                  className="block w-full pl-10 pr-3 py-3 border border-[#E5DCC5] bg-transparent text-[#1C1C1C] placeholder-[#1C1C1C]/40 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] sm:text-sm transition-all"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#1C1C1C]/50" />
                </div>
                <input
                  id="password" name="password" type="password" required
                  placeholder="Fjalëkalimi"
                  className="block w-full pl-10 pr-3 py-3 border border-[#E5DCC5] bg-transparent text-[#1C1C1C] placeholder-[#1C1C1C]/40 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] sm:text-sm transition-all"
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
              className="w-full flex justify-center py-3 px-4 text-sm font-bold uppercase tracking-widest text-[#FAF9F6] bg-[#1C1C1C] hover:bg-[#333333] transition-all disabled:opacity-70 disabled:bg-[#1C1C1C]/50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : mode === 'login' ? (
                'Vazhdo'
              ) : (
                'Regjistrohu'
              )}
            </button>

            {/* reCAPTCHA */}
            <div className="flex justify-center">
              <div className="border border-zinc-200 p-2 bg-zinc-50">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
                  onChange={setCaptchaToken}
                  onExpired={handleExpired}
                  theme="light"
                />
              </div>
            </div>

            {/* Toggle mode */}
            {!isAdmin && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                  onMouseEnter={setHovering}
                  onMouseLeave={setDefault}
                  className="text-sm font-medium text-[#707070] hover:text-[#2d2d2d] transition-colors"
                >
                  {mode === 'login'
                    ? "Nuk ke llogari? Regjistrohu"
                    : "Ke llogari? Hyr"}
                </button>
              </div>
            )}
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
