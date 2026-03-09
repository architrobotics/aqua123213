import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Calendar, Droplets, Activity, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, GlassCard } from '../components/ui/Card';
import { ai } from '../lib/gemini';
import { useApp } from '../context/AppContext';
import { format, subDays } from 'date-fns';

const skinStatuses = [
  { id: 'Clear', label: 'Clear', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'Dry', label: 'Dry', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'Acne breakout', label: 'Breakout', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  { id: 'Irritated', label: 'Irritated', color: 'bg-orange-100 text-orange-700 border-orange-200' },
];

export function SkinHealth() {
  const { skinLogs, addSkinLog, hydrationLogs, profile } = useApp();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [insight, setInsight] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Check if already logged today
  const today = new Date().toISOString().split('T')[0];
  const todayLog = skinLogs.find(log => log.timestamp.startsWith(today));

  useEffect(() => {
    if (todayLog) {
      setSelectedStatus(todayLog.skin_status);
    }
  }, [todayLog]);

  const logSkinStatus = async (status: string) => {
    setSelectedStatus(status);
    setIsAnalyzing(true);
    
    if (!todayLog) {
      addSkinLog({ skin_status: status as any });
    }
    
    try {
      const prompt = `
        User logged their skin status today as: ${status}.
        Generate a short, personalized insight correlating their skin condition with their water intake.
        Keep it under 3 sentences. Be encouraging.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-preview',
        contents: prompt,
      });

      if (response.text) {
        setInsight(response.text);
      }
    } catch (error) {
      console.error('Failed to generate insight', error);
      setInsight("You tend to experience dryness on days following low water intake. Let's aim for your goal today!");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Format recent logs
  const recentLogs = [...skinLogs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 3)
    .map(log => {
      const dateStr = log.timestamp.split('T')[0];
      const waterForDay = hydrationLogs
        .filter(h => h.timestamp.startsWith(dateStr))
        .reduce((sum, h) => sum + h.amount_ml, 0);
      
      let dateLabel = format(new Date(log.timestamp), 'MMM d');
      if (dateStr === today) dateLabel = 'Today';
      else if (dateStr === format(subDays(new Date(), 1), 'yyyy-MM-dd')) dateLabel = 'Yesterday';

      return {
        date: dateLabel,
        status: log.skin_status,
        water: `${(waterForDay / 1000).toFixed(1)}L`,
        goal: `${((profile?.water_goal || 2500) / 1000).toFixed(1)}L`
      };
    });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-8"
    >
      <header>
        <h1 className="font-display text-3xl font-bold text-slate-800">Skin Health</h1>
        <p className="text-text-secondary">Track your glow and hydration impact.</p>
      </header>

      <section>
        <h2 className="mb-4 font-display text-xl font-bold text-slate-800">How's your skin today?</h2>
        <div className="grid grid-cols-2 gap-4">
          {skinStatuses.map((status) => (
            <Card
              key={status.id}
              className={`cursor-pointer border-2 p-4 text-center transition-all hover:scale-105 active:scale-95 ${
                selectedStatus === status.id ? status.color : 'border-slate-100 bg-white'
              }`}
              onClick={() => logSkinStatus(status.id)}
            >
              <div className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full ${
                selectedStatus === status.id ? 'bg-white/50' : 'bg-slate-50 text-slate-400'
              }`}>
                <Sparkles size={24} />
              </div>
              <span className="font-medium">{status.label}</span>
            </Card>
          ))}
        </div>
      </section>

      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border-4 border-primary border-t-transparent"
          />
          <p className="text-sm font-medium text-text-secondary">Analyzing patterns...</p>
        </div>
      )}

      {insight && !isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <GlassCard className="relative overflow-hidden p-6">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-secondary/20 blur-2xl" />
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Activity size={20} />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-800">AI Insight</h3>
            </div>
            <p className="text-slate-700 leading-relaxed">{insight}</p>
          </GlassCard>
        </motion.div>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-slate-800">Recent Logs</h2>
          <Button variant="ghost" size="sm" className="text-primary">View All <ChevronRight size={16} /></Button>
        </div>
        <div className="flex flex-col gap-3">
          {recentLogs.length > 0 ? recentLogs.map((log, i) => (
            <Card key={i} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <Calendar size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{log.date}</h4>
                  <p className="text-sm text-text-secondary">{log.status}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-primary">
                  <Droplets size={14} />
                  <span className="font-bold">{log.water}</span>
                </div>
                <p className="text-xs text-text-muted">Goal: {log.goal}</p>
              </div>
            </Card>
          )) : (
            <div className="py-8 text-center text-text-secondary">No logs yet.</div>
          )}
        </div>
      </section>
    </motion.div>
  );
}
