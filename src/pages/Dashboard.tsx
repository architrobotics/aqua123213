import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Droplets, Sparkles, MessageCircle, Flame } from 'lucide-react';
import { HydrationRing } from '../components/HydrationRing';
import { Card, GlassCard } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { ai } from '../lib/gemini';
import { useApp } from '../context/AppContext';

export function Dashboard() {
  const navigate = useNavigate();
  const { profile, hydrationLogs, bottles, addHydration, addDailyAdjustment, dailyAdjustments } = useApp();
  
  const [coachTip, setCoachTip] = useState("Drink a glass of water before your next meal to boost digestion and skin clarity.");

  // Calculate today's total
  const today = new Date().toISOString().split('T')[0];
  const current = hydrationLogs
    .filter(log => log.timestamp.startsWith(today))
    .reduce((sum, log) => sum + log.amount_ml, 0);

  // Calculate today's goal
  const todayAdjustment = dailyAdjustments.find(a => a.date === today)?.amount || 0;
  const goal = (profile?.water_goal || 2500) + todayAdjustment;

  const handleAddWater = (amount: number, source: 'manual' | 'bottle' = 'manual') => {
    addHydration(amount, source);
  };

  const activateSweatMode = () => {
    addDailyAdjustment(500);
    alert("Sweat Mode Activated! Goal increased by 500ml.");
  };

  useEffect(() => {
    const fetchTip = async () => {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-preview',
          contents: "Give a short, encouraging 1-sentence tip about drinking water for skin health or general wellness.",
        });
        if (response.text) {
          setCoachTip(response.text.replace(/["']/g, ''));
        }
      } catch (error) {
        console.error("Failed to fetch tip", error);
      }
    };
    fetchTip();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-8"
    >
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-800">Today</h1>
          <p className="text-text-secondary">Let's reach your hydration goal.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="glass" size="icon" onClick={activateSweatMode} className="rounded-full text-orange-500 hover:bg-orange-50" title="Sweat Mode">
            <Flame size={20} />
          </Button>
          <Button variant="glass" size="icon" onClick={() => navigate('/coach')} className="rounded-full">
            <MessageCircle size={20} />
          </Button>
        </div>
      </header>

      {/* Hydration Ring Section */}
      <section className="flex justify-center py-4">
        <HydrationRing current={current} goal={goal} />
      </section>

      {/* AI Coach Tip */}
      <GlassCard className="relative overflow-hidden p-5">
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-secondary/20 blur-2xl" />
        <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
        <div className="relative flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
            <Sparkles size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-display text-sm font-bold text-slate-800">AI Coach</h3>
            <p className="mt-1 text-sm leading-relaxed text-text-secondary">
              {coachTip}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Quick Add */}
      <section>
        <h2 className="mb-4 font-display text-xl font-bold text-slate-800">Quick Add</h2>
        <div className="grid grid-cols-3 gap-3">
          {[100, 250, 500].map((amount) => (
            <Button
              key={amount}
              variant="outline"
              className="flex flex-col gap-1 h-auto py-3 bg-white"
              onClick={() => handleAddWater(amount, 'manual')}
            >
              <Droplets size={20} className="text-primary" />
              <span className="font-bold">+{amount}</span>
              <span className="text-[10px] text-text-muted uppercase">ml</span>
            </Button>
          ))}
        </div>
      </section>

      {/* Custom Bottles */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-slate-800">Your Bottles</h2>
          <Button variant="ghost" size="sm" className="text-primary">Manage</Button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
          {bottles.map((bottle) => (
            <Card 
              key={bottle.id} 
              className="min-w-[120px] shrink-0 cursor-pointer p-4 transition-transform hover:scale-105 active:scale-95"
              onClick={() => handleAddWater(bottle.volume_ml, 'bottle')}
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                <Droplets size={24} className="text-primary" />
              </div>
              <h3 className="font-bold text-slate-800">{bottle.name}</h3>
              <p className="text-sm text-text-muted">{bottle.volume_ml} ml</p>
            </Card>
          ))}
          <Card className="flex min-w-[120px] shrink-0 cursor-pointer flex-col items-center justify-center border-dashed border-slate-300 bg-transparent p-4 hover:bg-slate-50">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <Plus size={20} className="text-text-muted" />
            </div>
            <span className="text-sm font-medium text-text-secondary">New Bottle</span>
          </Card>
        </div>
      </section>
    </motion.div>
  );
}
