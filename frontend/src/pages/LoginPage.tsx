import React, { useState } from 'react';
import { Leaf, Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle, Ghost } from 'lucide-react';
import { login as loginApi, signup as signupApi } from '../api/client';

interface LoginPageProps {
  onLogin: (user: { name: string; email: string }) => void;
  onGuest: () => void;
}

type Mode = 'login' | 'signup';

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onGuest }) => {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    if (mode === 'signup' && !name.trim()) return 'Please enter your name.';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const err = validate();
    if (err) { setError(err); return; }

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const response = await signupApi(name.trim(), email.trim(), password);
        onLogin({ name: response.user.name, email: response.user.email });
      } else {
        const response = await loginApi(email.trim(), password);
        onLogin({ name: response.user.name, email: response.user.email });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    'AI-powered product sustainability analysis',
    'Carbon footprint estimation (LOW / MEDIUM / HIGH)',
    'Eco-friendly alternative recommendations',
    'Side-by-side comparison table',
    'Live pricing via web search',
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 transition-colors">

      {/* ── Left panel — branding ──────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Animated Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 animate-pulse" />
          <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-emerald-500/10 animate-bounce" style={{ animationDuration: '7s' }} />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-teal-500/10 animate-ping opacity-20" style={{ animationDuration: '10s' }} />
          <div className="absolute inset-0 gradient-mesh opacity-20 mix-blend-overlay"></div>
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3 animate-fade-in-up">
          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/20 shadow-xl">
            <Leaf className="w-8 h-8 text-emerald-300" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Eco<span className="text-emerald-400">Pick</span>
            </h1>
            <p className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase">
              AI Sustainability Agent
            </p>
          </div>
        </div>

        {/* Headline */}
        <div className="relative z-10 space-y-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="space-y-4">
            <h2 className="text-5xl font-black text-white leading-tight tracking-tight">
              Shop smarter.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300">Choose greener.</span>
            </h2>
            <p className="text-emerald-100/80 text-lg leading-relaxed max-w-md font-medium">
              EcoPick uses AI to analyze any product's environmental impact and recommend eco-friendlier alternatives with live pricing.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-sm font-medium text-emerald-100/90 bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-sm w-fit">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-emerald-400/60 text-xs font-semibold">
          © {new Date().getFullYear()} EcoPick · Built for a sustainable tomorrow
        </p>
      </div>

      {/* ── Right panel — form ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <div className="absolute inset-0 gradient-mesh opacity-20 lg:hidden pointer-events-none" />

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8 relative z-10">
          <div className="bg-emerald-600 p-2.5 rounded-xl text-white shadow-lg shadow-emerald-600/30">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">
              Eco<span className="text-emerald-600 dark:text-emerald-400">Pick</span>
            </h1>
            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-widest uppercase -mt-0.5">
              AI Sustainability Agent
            </p>
          </div>
        </div>

        <div className="w-full max-w-md relative z-10 animate-fade-in-up">
          {/* Card */}
          <div className="glass-panel dark:dark-glass-panel bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 dark:border-slate-800 p-8 space-y-8 relative overflow-hidden">
            
            {/* Top right decoration */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />

            {/* Heading */}
            <div className="space-y-2 text-center relative z-10">
              <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                {mode === 'login' ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                {mode === 'login'
                  ? 'Sign in to continue to EcoPick'
                  : 'Join EcoPick and start shopping sustainably'}
              </p>
            </div>

            {/* Mode toggle */}
            <div className="flex bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-2xl gap-1 relative z-10">
              {(['login', 'signup'] as Mode[]).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setError(''); }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    mode === m
                      ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {m === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1">
                    Full Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      disabled={isLoading}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus:ring-0 focus:border-emerald-500 bg-white/50 dark:bg-slate-800/50 outline-none text-sm placeholder-slate-400 transition-all font-medium text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus:ring-0 focus:border-emerald-500 bg-white/50 dark:bg-slate-800/50 outline-none text-sm placeholder-slate-400 transition-all font-medium text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button type="button" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold">
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-11 pr-12 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus:ring-0 focus:border-emerald-500 bg-white/50 dark:bg-slate-800/50 outline-none text-sm placeholder-slate-400 transition-all font-medium text-slate-800 dark:text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs rounded-xl px-4 py-3 font-bold flex items-start gap-2">
                  <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                  </>
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Guest Divider */}
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase tracking-widest">or</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
              </div>

              {/* Continue as Guest */}
              <button
                type="button"
                onClick={onGuest}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 font-bold text-sm transition-all"
              >
                <Ghost className="w-4 h-4" />
                Continue as Guest
              </button>
            </form>
          </div>

          {/* Terms note */}
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6 leading-relaxed px-4 font-medium relative z-10">
            By continuing, you agree to EcoPick's{' '}
            <button className="text-emerald-600 dark:text-emerald-400 hover:underline">Terms of Service</button>{' '}
            and{' '}
            <button className="text-emerald-600 dark:text-emerald-400 hover:underline">Privacy Policy</button>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
