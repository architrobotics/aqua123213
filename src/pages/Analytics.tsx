import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { Card, GlassCard } from '../components/ui/Card';
import { Flame, Trophy, TrendingUp, CalendarDays } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format, subDays, eachDayOfInterval } from 'date-fns';

export function Analytics() {
  const { hydrationLogs, skinLogs, profile, dailyAdjustments } = useApp();

  // Calculate weekly data
  const weeklyData = useMemo(() => {
    const today = new Date();
    const last7Days = eachDayOfInterval({
      start: subDays(today, 6),
      end: today
    });

    return last7Days.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      const intake = hydrationLogs
        .filter(log => log.timestamp.startsWith(dateStr))
        .reduce((sum, log) => sum + log.amount_ml, 0);
      
      const adjustment = dailyAdjustments.find(a => a.date === dateStr)?.amount || 0;
      const goal = (profile?.water_goal || 2500) + adjustment;

      return {
        name: format(date, 'EEE'),
        dateStr,
        intake,
        goal,
        metGoal: intake >= goal && goal > 0
      };
    });
  }, [hydrationLogs, profile, dailyAdjustments]);

  // Calculate stats
  const goalsMet = weeklyData.filter(d => d.metGoal).length;
  
  // Calculate streak
  let streak = 0;
  for (let i = weeklyData.length - 1; i >= 0; i--) {
    if (weeklyData[i].metGoal) {
      streak++;
    } else if (i !== weeklyData.length - 1) {
      // Break streak if not met, unless it's today (still have time)
      break;
    }
  }

  // Calculate skin vs water data
  const skinData = useMemo(() => {
    return weeklyData.map(day => {
      const skinLog = skinLogs.find(log => log.timestamp.startsWith(day.dateStr));
      let skinScore = 0;
      if (skinLog) {
        switch (skinLog.skin_status) {
          case 'Clear': skinScore = 5; break;
          case 'Dry': skinScore = 3; break;
          case 'Irritated': skinScore = 2; break;
          case 'Acne breakout': skinScore = 1; break;
        }
      }

      return {
        day: day.name,
        water: Number((day.intake / 1000).toFixed(1)),
        skin: skinScore
      };
    }).filter(d => d.skin > 0 || d.water > 0); // Only show days with some data
  }, [weeklyData, skinLogs]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-8"
    >
      <header>
        <h1 className="font-display text-3xl font-bold text-slate-800">Analytics</h1>
        <p className="text-text-secondary">Your hydration journey in numbers.</p>
      </header>

      {/* Streaks & Stats */}
      <section className="grid grid-cols-2 gap-4">
        <GlassCard className="flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-500">
            <Flame size={24} />
          </div>
          <h3 className="font-display text-3xl font-bold text-slate-800">{streak}</h3>
          <p className="text-sm font-medium text-text-secondary">Day Streak</p>
        </GlassCard>
        
        <GlassCard className="flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20 text-secondary-dark">
            <Trophy size={24} />
          </div>
          <h3 className="font-display text-3xl font-bold text-slate-800">{goalsMet}</h3>
          <p className="text-sm font-medium text-text-secondary">Goals Met (7d)</p>
        </GlassCard>
      </section>

      {/* Weekly Progress */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-slate-800">Weekly Progress</h2>
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <CalendarDays size={16} />
            <span>This Week</span>
          </div>
        </div>
        <Card className="p-6">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#A0AEC0', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A0AEC0', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#F7FAFC' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="intake" fill="#3AA6FF" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="goal" fill="#E2E8F0" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      {/* Water vs Skin Health */}
      {skinData.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-slate-800">Water vs Skin Clarity</h2>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <TrendingUp size={16} />
              <span>Correlation</span>
            </div>
          </div>
          <Card className="p-6">
            <p className="mb-6 text-sm text-text-secondary">
              Notice how your skin clarity (green area) improves on days you drink more water (blue line).
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={skinData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSkin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7CE7C9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#7CE7C9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#A0AEC0', fontSize: 12 }} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#A0AEC0', fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#A0AEC0', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area yAxisId="right" type="monotone" dataKey="skin" stroke="#7CE7C9" fillOpacity={1} fill="url(#colorSkin)" />
                  <Area yAxisId="left" type="monotone" dataKey="water" stroke="#3AA6FF" fill="none" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>
      )}
    </motion.div>
  );
}
