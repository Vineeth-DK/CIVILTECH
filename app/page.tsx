'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Building2,
  Eye,
  EyeOff,
  LogIn,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
  User,
  Lock,
} from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { CREDENTIALS } from '@/lib/auth';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithCredentials, isDarkMode, toggleDarkMode } = useProjectStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }
    setError('');
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 700)); // simulate network

    const ok = loginWithCredentials(username.trim(), password);
    if (!ok) {
      setError('Invalid username or password. Please try again.');
      setIsLoading(false);
      return;
    }

    const cred = CREDENTIALS[username.trim().toLowerCase()];
    router.push(cred.role === 'admin' ? '/admin' : `/${cred.role}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-400/8 dark:bg-blue-600/6 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-400/8 dark:bg-violet-600/6 rounded-full blur-3xl translate-y-1/2" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.018] dark:opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(circle, #64748b 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* Dark mode toggle — fixed top-right */}
      <motion.button
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        onClick={toggleDarkMode}
        className={cn(
          'fixed top-5 right-5 z-50 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium',
          'glass border border-slate-200/70 dark:border-white/10',
          'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white',
          'transition-colors duration-200'
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDarkMode ? (
            <motion.div key="sun" initial={{ rotate: -80, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 80, opacity: 0 }} transition={{ duration: 0.18 }}>
              <Sun className="w-4 h-4 text-amber-400" />
            </motion.div>
          ) : (
            <motion.div key="moon" initial={{ rotate: 80, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -80, opacity: 0 }} transition={{ duration: 0.18 }}>
              <Moon className="w-4 h-4 text-blue-500" />
            </motion.div>
          )}
        </AnimatePresence>
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </motion.button>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-10 mt-4">
          <div className="relative w-full h-32 max-w-[400px] mx-auto dark:bg-white/95 dark:backdrop-blur-md rounded-2xl dark:shadow-xl dark:shadow-white/5 transition-all duration-300">
            <Image src="/logo.png" alt="CivilTech Logo" fill className="object-contain p-0 dark:p-3" priority />
          </div>
        </div>

        {/* Login form card */}
        <div className="glass rounded-2xl p-7 space-y-5">
          <div>
            <h2 className="font-display font-semibold text-lg text-slate-900 dark:text-white">
              Sign in to your account
            </h2>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
              Enter your department credentials to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(''); }}
                  placeholder="e.g. admin, sales, survey…"
                  autoComplete="username"
                  className={cn(
                    'input-base pl-9',
                    error && 'border-red-400 dark:border-red-500/70 ring-2 ring-red-400/20'
                  )}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={cn(
                    'input-base pl-9 pr-10',
                    error && 'border-red-400 dark:border-red-500/70 ring-2 ring-red-400/20'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-red-500 dark:text-red-400 px-1"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm',
                'bg-gradient-to-r from-blue-600 to-violet-600 text-white',
                'shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40',
                'transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0',
                'disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0'
              )}
            >
              {isLoading ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="border-t border-slate-200/60 dark:border-white/8 pt-4">
            <button
              onClick={() => setShowDemo(!showDemo)}
              className="w-full flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <span>Demo credentials</span>
              {showDemo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <AnimatePresence>
              {showDemo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-1.5 overflow-hidden"
                >
                  {Object.entries(CREDENTIALS).map(([user, cred]) => (
                    <button
                      key={user}
                      type="button"
                      onClick={() => { setUsername(user); setPassword(cred.password); setError(''); }}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs',
                        'bg-slate-50 dark:bg-white/4 hover:bg-blue-50 dark:hover:bg-blue-500/10',
                        'border border-slate-200/60 dark:border-white/8 hover:border-blue-300 dark:hover:border-blue-500/30',
                        'text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-300',
                        'transition-all duration-150 cursor-pointer'
                      )}
                    >
                      <span className="font-semibold capitalize">{user}</span>
                      <span className="text-slate-400 dark:text-slate-500 font-mono">{cred.password}</span>
                    </button>
                  ))}
                  <p className="text-center text-slate-400 dark:text-slate-600 text-xs pt-1">
                    Click any row to auto-fill credentials
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="text-center text-slate-400 dark:text-slate-600 text-xs mt-6">
          CivilTech Workflow Platform · Demo Mode
        </p>
      </motion.div>
    </div>
  );
}
