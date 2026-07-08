import React, { useState } from 'react';
import { Leaf, Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: { name: string; email: string }) => void;
}

type Mode = 'login' | 'signup';

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
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
    // Simulate async auth (replace with real API later)
    await new Promise(r => setTimeout(r, 800));

    if (mode === 'signup') {
      // Save to localStorage (mock persistence)
      const users = JSON.parse(localStorage.getItem('ecopick_users') || '[]');
      if (users.find((u: any) => u.email === email)) {
        setError('An account with this email already exists. Please log in.');
        setIsLoading(false);
        return;
      }
      users.push({ name: name.trim(), email: email.trim(), password });
      localStorage.setItem('ecopick_users', JSON.stringify(users));
      onLogin({ name: name.trim(), email: email.trim() });
    } else {
      const users = JSON.parse(localStorage.getItem('ecopick_users') || '[]');
      const user = users.find((u: any) => u.email === email && u.password === password);
      if (!user) {
        setError('Incorrect email or password.');
        setIsLoading(false);
        return;
      }
      onLogin({ name: user.name, email: user.email });
    }
    setIsLoading(false);
  };

  const features = [
    'AI-powered product sustainability analysis',
    'Carbon footprint estimation (LOW / MEDIUM / HIGH)',
    'Eco-friendly alternative recommendations',
    'Side-by-side comparison table',
    'Live pricing via web search',
  ];

  return (
    <div className="min-h-screen flex bg-[#f0faf4]">

      {/* ── Left panel — branding ──────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-600 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-teal-500/10" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Eco<span className="text-emerald-300">Pick</span>
            </h1>
            <p className="text-[10px] text-emerald-300 font-bold tracking-widest uppercase">
              AI Sustainability Agent
            </p>
          </div>
        </div>

        {/* Headline */}
        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <h2 className="text-4xl font-extrabold text-white leading-tight">
              Shop smarter.<br />
              <span className="text-emerald-300">Choose greener.</span>
            </h2>
            <p className="text-emerald-100 text-base leading-relaxed max-w-sm">
              EcoPick uses AI to analyze any product's environmental impact and recommend eco-friendlier alternatives with live pricing.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-2.5">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-emerald-100">
                <CheckCircle className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-emerald-300/60 text-xs">
          © {new Date().getFullYear()} EcoPick · Built for a sustainable tomorrow
        </p>
      </div>

      {/* ── Right panel — form ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <div className="bg-emerald-600 p-2 rounded-xl text-white shadow">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800">
              Eco<span className="text-emerald-600">Pick</span>
            </h1>
            <p className="text-[9px] font-bold text-emerald-600 tracking-widest uppercase -mt-0.5">
              AI Sustainability Agent
            </p>
          </div>
        </div>

        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-8 space-y-6">

            {/* Heading */}
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-800">
                {mode === 'login' ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-slate-500 text-sm">
                {mode === 'login'
                  ? 'Sign in to continue to EcoPick'
                  : 'Join EcoPick and start shopping sustainably'}
              </p>
            </div>

            {/* Mode toggle */}
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
              {(['login', 'signup'] as Mode[]).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setError(''); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                    mode === m
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {m === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      disabled={isLoading}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none text-sm bg-slate-50 placeholder-slate-400 transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none text-sm bg-slate-50 placeholder-slate-400 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button type="button" className="text-xs text-emerald-600 hover:underline font-medium">
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none text-sm bg-slate-50 placeholder-slate-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl px-4 py-3 font-medium">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
            </form>

            {/* Switch mode */}
            <p className="text-center text-xs text-slate-500">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
                className="text-emerald-600 font-bold hover:underline"
              >
                {mode === 'login' ? 'Sign up free' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Terms note */}
          <p className="text-center text-[11px] text-slate-400 mt-5 leading-relaxed px-4">
            By continuing, you agree to EcoPick's{' '}
            <span className="text-emerald-600 cursor-pointer hover:underline">Terms of Service</span>{' '}
            and{' '}
            <span className="text-emerald-600 cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
