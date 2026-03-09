import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { Card, GlassCard } from '../components/ui/Card';
import { Flame, Trophy, TrendingUp, CalendarDays, RefreshCw, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { Button } from '../components/ui/Button';
import { ai } from '../lib/gemini';

export function Analytics() {
  const { hydrationLogs, skinLogs, profile, dailyAdjustments, updateProfile } = useApp();
  const [isResetting, setIsResetting] = useState(false);

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
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const logsByDate = hydrationLogs.reduce((acc, log) => {
    const date = log.timestamp.split('T')[0];
    acc[date] = (acc[date] || 0) + log.amount_ml;
    return acc;
  }, {} as Record<string, number>);

  const adjustmentsByDate = dailyAdjustments.reduce((acc, adj) => {
    acc[adj.date] = (acc[adj.date] || 0) + adj.amount;
    return acc;
  }, {} as Record<string, number>);

  const baseGoal = profile?.water_goal || 2500;
  const todayStr = currentDate.toISOString().split('T')[0];
  const todayTotal = logsByDate[todayStr] || 0;
  const todayGoal = baseGoal + (adjustmentsByDate[todayStr] || 0);
  
  let checkDate = new Date(currentDate);
  
  if (todayTotal >= todayGoal && todayGoal > 0) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const total = logsByDate[dateStr] || 0;
    const dayGoal = baseGoal + (adjustmentsByDate[dateStr] || 0);
    
    if (total >= dayGoal && dayGoal > 0) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
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

  const handleResetGoal = async () => {
    if (!profile) return;
    setIsResetting(true);
    try {
      const prompt = `
        User details:
        Weight: ${profile.weight}kg
        Height: ${profile.height}cm
        Age: ${profile.age}
        Activity: ${profile.activity_level}
        Climate: ${profile.climate}
        Skin goal: ${profile.skin_goal}

        Calculate the optimal daily water intake in ml.
        Return ONLY a JSON object with this exact structure:
        {
          "goal": 2600,
          "tips": [
            "Drink 400ml after waking up",
            "Sip water throughout the day for clear skin"
          ]
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      if (response.text) {
        const data = JSON.parse(response.text);
        updateProfile({ water_goal: data.goal });
      }
    } catch (error) {
      console.error('Failed to reset goal', error);
      // Fallback
      updateProfile({ water_goal: 2500 });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-8 pb-20"
    >
      <header className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-800">Analytics</h1>
          <p className="text-text-secondary">Your hydration journey in numbers.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleResetGoal} isLoading={isResetting} className="flex items-center gap-2">
          <RefreshCw size={16} />
          Reset Goal
        </Button>
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

      {/* Badges */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-slate-800">Badges</h2>
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Award size={16} />
            <span>Achievements</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <GlassCard className={`flex flex-col items-center justify-center p-4 text-center ${streak >= 3 ? 'opacity-100' : 'opacity-50 grayscale'}`}>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
              <Flame size={20} />
            </div>
            <p className="text-xs font-bold text-slate-800">3-Day</p>
          </GlassCard>
          <GlassCard className={`flex flex-col items-center justify-center p-4 text-center ${streak >= 7 ? 'opacity-100' : 'opacity-50 grayscale'}`}>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
              <Flame size={20} />
            </div>
            <p className="text-xs font-bold text-slate-800">7-Day</p>
          </GlassCard>
          <GlassCard className={`flex flex-col items-center justify-center p-4 text-center ${streak >= 30 ? 'opacity-100' : 'opacity-50 grayscale'}`}>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Flame size={20} />
            </div>
            <p className="text-xs font-bold text-slate-800">30-Day</p>
          </GlassCard>
        </div>
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
