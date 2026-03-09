import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Droplet, ArrowRight, Mail, Lock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function Login() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      login(email);
      setIsLoading(false);
      navigate('/');
    }, 1000);
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
            Welcome Back
          </h1>
          <p className="mt-2 text-text-secondary">
            Sign in to continue your hydration journey.
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
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

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
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

          <Button type="submit" size="lg" className="mt-4 w-full" isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-text-secondary">
          Don't have an account?{' '}
          <button className="font-bold text-primary hover:underline" onClick={(e) => {
            e.preventDefault();
            login('demo@example.com');
            navigate('/');
          }}>
            Create one
          </button>
        </div>
      </motion.div>
    </div>
  );
}
