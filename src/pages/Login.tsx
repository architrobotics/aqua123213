import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Droplet, ArrowRight, Mail, Lock, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

type AuthMode = 'signin' | 'signup' | 'forgot';

export function Login() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (!supabase) {
        // Fallback to local demo mode if Supabase is not configured
        setTimeout(() => {
          login(email);
          setIsLoading(false);
          navigate('/');
        }, 1000);
        return;
      }

      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Check your email for the confirmation link.');
      } else if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        login(email);
        navigate('/');
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setMessage('Password reset instructions sent to your email.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Droplet size={32} className="fill-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-800">
            {mode === 'signin' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
          </h1>
          <p className="mt-2 text-text-secondary">
            {mode === 'signin' ? 'Sign in to continue your hydration journey.' : 
             mode === 'signup' ? 'Join Aqua to track your hydration.' : 
             'Enter your email to receive reset instructions.'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-600 flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </motion.div>
          )}
          {message && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-600">
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-800 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                {mode === 'signin' && (
                  <button type="button" onClick={() => setMode('forgot')} className="text-xs font-medium text-primary hover:underline">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-800 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>
          )}

          <Button type="submit" size="lg" className="mt-4 w-full" isLoading={isLoading}>
            {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Sign Up' : 'Send Reset Link'}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-text-secondary">
          {mode === 'signin' ? (
            <>
              Don't have an account?{' '}
              <button className="font-bold text-primary hover:underline" onClick={() => setMode('signup')}>
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button className="font-bold text-primary hover:underline" onClick={() => setMode('signin')}>
                Sign in
              </button>
            </>
          )}
        </div>
        
        {!supabase && (
          <div className="mt-6 rounded-xl bg-slate-50 p-3 text-center text-xs text-slate-500">
            Running in local demo mode. Supabase is not configured.
          </div>
        )}
      </motion.div>
    </div>
  );
}
