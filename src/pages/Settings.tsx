import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings as SettingsIcon, User, Bell, Shield, LogOut, Database, X } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { isSupabaseConfigured } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export function Settings() {
  const { logout, profile, updateProfile } = useApp();
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);

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
          <div className="flex cursor-pointer items-center justify-between p-4 hover:bg-slate-50" onClick={() => setShowProfileModal(true)}>
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

      <AnimatePresence>
        {showProfileModal && (
          <EditProfileModal onClose={() => setShowProfileModal(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function EditProfileModal({ onClose }: { onClose: () => void }) {
  const { profile, updateProfile } = useApp();
  const [name, setName] = useState(profile?.name || '');
  const [weight, setWeight] = useState(profile?.weight?.toString() || '');
  const [waterGoal, setWaterGoal] = useState(profile?.water_goal?.toString() || '');

  const handleSave = () => {
    updateProfile({
      name,
      weight: parseFloat(weight) || profile?.weight,
      water_goal: parseInt(waterGoal) || profile?.water_goal,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-slate-800">Edit Profile</h2>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Weight (kg)</label>
            <input 
              type="number" 
              value={weight}
              onChange={e => setWeight(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Base Daily Goal (ml)</label>
            <input 
              type="number" 
              value={waterGoal}
              onChange={e => setWaterGoal(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <Button 
            className="mt-4" 
            size="lg"
            onClick={handleSave}
          >
            Save Profile
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
