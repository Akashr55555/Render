import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User as UserIcon, Check, AlertCircle } from 'lucide-react';
import { User } from '../types';
import { PdfSketchLogo } from './PdfSketchLogo';
import { 
  auth, 
  googleProvider, 
  facebookProvider, 
  microsoftProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from '../lib/firebase';

interface AuthModalProps {
  initialMode?: 'login' | 'signup' | 'forgot';
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

const PROVIDER_INFO = {
  google: {
    name: 'Google / Gmail',
    shortName: 'Google',
    url: 'https://accounts.google.com/ServiceLogin',
  },
  facebook: {
    name: 'Facebook',
    shortName: 'Facebook',
    url: 'https://www.facebook.com/login.php',
  },
  microsoft: {
    name: 'Microsoft',
    shortName: 'Microsoft',
    url: 'https://login.live.com/',
  },
};

export const AuthModal: React.FC<AuthModalProps> = ({
  initialMode = 'login',
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const validateEmail = (emailStr: string) => {
    return /\S+@\S+\.\S+/.test(emailStr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'forgot') {
      if (!email.trim()) {
        setError('Please enter your email address');
        return;
      }
      if (!validateEmail(email)) {
        setError('Please enter a valid email address');
        return;
      }
      setLoading(true);
      try {
        await sendPasswordResetEmail(auth, email);
        setResetSent(true);
      } catch (err: any) {
        if (err.code === 'auth/user-not-found') {
          setError('No account found with this email address');
        } else if (err.code === 'auth/invalid-email') {
          setError('Invalid email address format');
        } else {
          setResetSent(true);
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCred.user;
        const user: User = {
          id: fbUser.uid || 'usr_' + Date.now(),
          name: name || fbUser.displayName || email.split('@')[0],
          email: fbUser.email || email,
          provider: 'email',
          isPremium: false,
        };
        onLoginSuccess(user);
        onClose();
      } else {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const fbUser = userCred.user;
        const user: User = {
          id: fbUser.uid || 'usr_' + Date.now(),
          name: fbUser.displayName || email.split('@')[0],
          email: fbUser.email || email,
          provider: 'email',
          isPremium: false,
        };
        onLoginSuccess(user);
        onClose();
      }
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait and try again.');
      } else {
        setError(err?.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (providerName: 'google' | 'facebook' | 'microsoft') => {
    setLoading(true);
    setError(null);

    const info = PROVIDER_INFO[providerName];

    let providerObj;
    if (providerName === 'google') providerObj = googleProvider;
    else if (providerName === 'facebook') providerObj = facebookProvider;
    else providerObj = microsoftProvider;

    try {
      window.open(info.url, '_blank');
    } catch (e) {
      console.error('Failed to open provider window:', e);
    }

    try {
      const result = await signInWithPopup(auth, providerObj);
      if (result && result.user) {
        const fbUser = result.user;
        const user: User = {
          id: fbUser.uid || 'usr_' + providerName + '_' + Date.now(),
          name: fbUser.displayName || (info.shortName + ' User'),
          email: fbUser.email || `user@${providerName}.com`,
          avatar: fbUser.photoURL || undefined,
          provider: providerName,
          isPremium: false,
        };
        onLoginSuccess(user);
        onClose();
        return;
      }
    } catch (err: any) {
      setError(err?.message || `${info.shortName} authentication failed. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-6 sm:p-8"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo Header: PDFSketch Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="mb-2">
              <PdfSketchLogo size="md" showTagline={false} />
            </div>
            
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 text-center tracking-tight">
              {mode === 'login' && 'Login to your account'}
              {mode === 'signup' && 'Create new account'}
              {mode === 'forgot' && 'Reset your password'}
            </h2>
          </div>

          {/* Error / Success Banners */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {resetSent ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Check your inbox</h3>
              <p className="text-xs text-slate-600 mb-6">
                We sent password reset instructions to <span className="font-semibold">{email}</span>.
              </p>
              <button
                onClick={() => {
                  setResetSent(false);
                  setMode('login');
                }}
                className="text-xs font-bold text-[#ea2f3a] hover:underline"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <>
              {/* Social Login Row (Facebook, Google, SSO) */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
                {/* Facebook button */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin('facebook')}
                  className="flex items-center justify-center gap-1.5 bg-[#3b5998] hover:bg-[#314a82] text-white font-bold text-xs sm:text-sm py-2.5 px-2 rounded-xl transition-all shadow-xs"
                >
                  <span className="w-4 h-4 bg-white text-[#3b5998] rounded-full flex items-center justify-center text-[10px] font-black leading-none">
                    f
                  </span>
                  <span>Facebook</span>
                </button>

                {/* Google button */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  className="flex items-center justify-center gap-1.5 bg-white border-2 border-[#ea4335] text-slate-800 hover:bg-red-50/60 font-bold text-xs sm:text-sm py-2 px-2 rounded-xl transition-all shadow-xs"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                {/* Microsoft button */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin('microsoft')}
                  className="flex items-center justify-center gap-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs sm:text-sm py-2.5 px-2 rounded-xl transition-all shadow-xs"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 23 23">
                    <path fill="#f35325" d="M1 1h10v10H1z" />
                    <path fill="#81bc06" d="M12 1h10v10H12z" />
                    <path fill="#05a6f0" d="M1 12h10v10H1z" />
                    <path fill="#ffba08" d="M12 12h10v10H12z" />
                  </svg>
                  <span>Microsoft</span>
                </button>
              </div>

              {/* Form Input Fields */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Name field (for Signup mode) */}
                {mode === 'signup' && (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Name"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-300 focus:border-slate-500 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-colors"
                    />
                  </div>
                )}

                {/* Email field */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={mode === 'login' ? 'Enter your email' : 'Email'}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-300 focus:border-slate-500 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-colors"
                  />
                </div>

                {/* Password field (not for Forgot password mode) */}
                {mode !== 'forgot' && (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-300 focus:border-slate-500 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-colors"
                    />
                  </div>
                )}

                {/* Forgot password link */}
                {mode === 'login' && (
                  <div className="text-center py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setMode('forgot');
                      }}
                      className="text-xs font-semibold text-[#009b8d] hover:underline"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}

                {/* Primary Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full max-w-[180px] mx-auto block bg-[#009b8d] hover:bg-[#00867a] text-white font-bold py-2.5 px-6 rounded-lg shadow-xs hover:shadow-md transition-all text-sm sm:text-base disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Please wait...</span>
                      </span>
                    ) : (
                      <>
                        {mode === 'login' && 'Log in'}
                        {mode === 'signup' && 'Sign up'}
                        {mode === 'forgot' && 'Send link'}
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Mode Toggle Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
                {mode === 'login' && (
                  <p>
                    Don't have an account?{' '}
                    <button
                      onClick={() => {
                        setError(null);
                        setMode('signup');
                      }}
                      className="text-[#009b8d] font-bold underline hover:text-[#00867a]"
                    >
                      Create an account
                    </button>
                  </p>
                )}

                {mode === 'signup' && (
                  <div className="space-y-3">
                    <p>
                      Already member?{' '}
                      <button
                        onClick={() => {
                          setError(null);
                          setMode('login');
                        }}
                        className="text-[#009b8d] font-bold underline hover:text-[#00867a]"
                      >
                        Log in
                      </button>
                    </p>
                    <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                      By creating an account, you agree to PDFSketch{' '}
                      <span className="text-[#ea2f3a] hover:underline cursor-pointer">
                        Terms of Service
                      </span>{' '}
                      and{' '}
                      <span className="text-[#ea2f3a] hover:underline cursor-pointer">
                        Privacy Policy
                      </span>
                    </p>
                  </div>
                )}

                {mode === 'forgot' && (
                  <p>
                    Remembered password?{' '}
                    <button
                      onClick={() => {
                        setError(null);
                        setMode('login');
                      }}
                      className="text-[#ea2f3a] font-bold underline hover:text-[#c9202a]"
                    >
                      Log in
                    </button>
                  </p>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

