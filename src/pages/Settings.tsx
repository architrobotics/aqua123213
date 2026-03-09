import React from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, User, Bell, Shield, LogOut, Database } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { isSupabaseConfigured } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export function Settings() {
  const { logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-8"
    >
      <header>
        <h1 className="font-display text-3xl font-bold text-slate-800">Settings</h1>
        <p className="text-text-secondary">Manage your preferences and account.</p>
      </header>

      {!isSupabaseConfigured && (
        <Card className="border-orange-200 bg-orange-50 p-4">
          <div className="flex items-start gap-3">
            <Database className="mt-0.5 shrink-0 text-orange-500" size={20} />
            <div>
              <h3 className="font-bold text-orange-800">Supabase Not Configured</h3>
              <p className="mt-1 text-sm text-orange-700">
                To enable cloud sync and authentication, please add your Supabase URL and Anon Key to the AI Studio Secrets panel.
              </p>
            </div>
          </div>
        </Card>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-bold text-slate-800">Account</h2>
        <Card className="divide-y divide-slate-100 p-0">
          <div className="flex cursor-pointer items-center justify-between p-4 hover:bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User size={20} />
              </div>
              <div>
                <p className="font-medium text-slate-800">Profile</p>
                <p className="text-sm text-text-secondary">Update your details</p>
              </div>
            </div>
            <SettingsIcon size={16} className="text-slate-400" />
          </div>
          <div className="flex cursor-pointer items-center justify-between p-4 hover:bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/20 text-secondary-dark">
                <Bell size={20} />
              </div>
              <div>
                <p className="font-medium text-slate-800">Notifications</p>
                <p className="text-sm text-text-secondary">Manage reminders</p>
              </div>
            </div>
            <SettingsIcon size={16} className="text-slate-400" />
          </div>
          <div className="flex cursor-pointer items-center justify-between p-4 hover:bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <Shield size={20} />
              </div>
              <div>
                <p className="font-medium text-slate-800">Privacy</p>
                <p className="text-sm text-text-secondary">Data and permissions</p>
              </div>
            </div>
            <SettingsIcon size={16} className="text-slate-400" />
          </div>
        </Card>
      </section>

      <section className="mt-4">
        <Button variant="outline" className="w-full border-rose-200 text-rose-600 hover:bg-rose-50" onClick={handleLogout}>
          <LogOut className="mr-2" size={20} />
          Sign Out
        </Button>
      </section>
    </motion.div>
  );
}
