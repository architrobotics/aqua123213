import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Droplets, Sparkles, MessageCircle, Flame, X, Edit2, Trash2, CloudRain, Thermometer, Zap } from 'lucide-react';
import { HydrationRing } from '../components/HydrationRing';
import { Card, GlassCard } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { ai } from '../lib/gemini';
import { useApp } from '../context/AppContext';
import { Bottle } from '../types';

export function Dashboard() {
  const navigate = useNavigate();
  const { profile, hydrationLogs, bottles, addHydration, removeHydration, addDailyAdjustment, dailyAdjustments, weather, setWeather } = useApp();
  
  const [coachTip, setCoachTip] = useState("Drink a glass of water before your next meal to boost digestion and skin clarity.");
  const [showBottleManager, setShowBottleManager] = useState(false);
  const [showSweatMode, setShowSweatMode] = useState(false);
  const [showEditProgress, setShowEditProgress] = useState(false);

  // Calculate today's total
  const today = new Date().toISOString().split('T')[0];
  const current = hydrationLogs
    .filter(log => log.timestamp.startsWith(today))
    .reduce((sum, log) => sum + log.amount_ml, 0);

  // Calculate today's goal
  const todayAdjustments = dailyAdjustments.filter(a => a.date === today);
  const totalAdjustment = todayAdjustments.reduce((sum, a) => sum + a.amount, 0);
  const goal = (profile?.water_goal || 2500) + totalAdjustment;

  // Calculate streak
  const calculateStreak = () => {
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
    
    return streak;
  };

  const streak = calculateStreak();

  const handleAddWater = (amount: number, source: 'manual' | 'bottle' = 'manual') => {
    addHydration(amount, source);
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

  // Weather integration (Hyderabad, India)
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Coordinates for Hyderabad, India
        const latitude = 17.3850;
        const longitude = 78.4867;
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m`);
        const data = await res.json();
        const temp = data.current.temperature_2m;
        const humidity = data.current.relative_humidity_2m;
        
        let adjustment = 0;
        if (temp > 25) adjustment += 500;
        else if (temp > 20) adjustment += 250;
        
        if (humidity > 70) adjustment += 200;

        setWeather({ temp, humidity, adjustment });
        
        // Add weather adjustment if not already added today
        const hasWeatherAdjustment = dailyAdjustments.some(a => a.date === today && a.source === 'weather');
        if (adjustment > 0 && !hasWeatherAdjustment) {
          addDailyAdjustment(adjustment, 'weather');
        }
      } catch (e) {
        console.error("Weather fetch failed", e);
      }
    };
    
    if (!weather) {
      fetchWeather();
    }
  }, [addDailyAdjustment, dailyAdjustments, today, weather, setWeather]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-8 pb-20"
    >
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl font-bold text-slate-800">Today</h1>
            <button onClick={() => setShowEditProgress(true)} className="text-slate-400 hover:text-primary">
              <Edit2 size={18} />
            </button>
          </div>
          <p className="text-text-secondary">Let's reach your hydration goal.</p>
        </div>
        <div className="flex gap-2">
          {streak > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-600" title={`${streak} Day Streak!`}>
              <Zap size={16} className="fill-orange-500" />
              {streak}
            </div>
          )}
          <Button variant="glass" size="icon" onClick={() => setShowSweatMode(true)} className="rounded-full text-orange-500 hover:bg-orange-50" title="Sweat Mode">
            <Flame size={20} />
          </Button>
          <Button variant="glass" size="icon" onClick={() => navigate('/coach')} className="rounded-full">
            <MessageCircle size={20} />
          </Button>
        </div>
      </header>

      {/* Weather Widget */}
      {weather && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <Card className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-blue-100">
            <div className="flex items-center gap-4">
              <div className="flex gap-2 text-blue-600">
                <Thermometer size={20} />
                <span className="font-medium">{weather.temp}°C</span>
              </div>
              <div className="flex gap-2 text-blue-600">
                <CloudRain size={20} />
                <span className="font-medium">{weather.humidity}%</span>
              </div>
            </div>
            {weather.adjustment > 0 && (
              <div className="text-sm font-medium text-blue-800">
                +{weather.adjustment}ml for weather
              </div>
            )}
          </Card>
        </motion.div>
      )}

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
          <Button variant="ghost" size="sm" className="text-primary" onClick={() => setShowBottleManager(true)}>Manage</Button>
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
          <Card 
            className="flex min-w-[120px] shrink-0 cursor-pointer flex-col items-center justify-center border-dashed border-slate-300 bg-transparent p-4 hover:bg-slate-50"
            onClick={() => setShowBottleManager(true)}
          >
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <Plus size={20} className="text-text-muted" />
            </div>
            <span className="text-sm font-medium text-text-secondary">New Bottle</span>
          </Card>
        </div>
      </section>

      {/* Recent Logs */}
      <section>
        <h2 className="mb-4 font-display text-xl font-bold text-slate-800">Recent Logs</h2>
        <div className="flex flex-col gap-3">
          {hydrationLogs
            .filter(log => log.timestamp.startsWith(today))
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5)
            .map(log => (
              <div key={log.id} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Droplets size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">+{log.amount_ml} ml</p>
                    <p className="text-xs text-text-secondary capitalize">{log.source.replace('_', ' ')} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <button 
                  onClick={() => removeHydration(log.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          {hydrationLogs.filter(log => log.timestamp.startsWith(today)).length === 0 && (
            <p className="text-sm text-text-secondary text-center py-4">No water logged today yet.</p>
          )}
        </div>
      </section>

      {/* Modals */}
      <AnimatePresence>
        {showBottleManager && (
          <BottleManagerModal onClose={() => setShowBottleManager(false)} />
        )}
        {showSweatMode && (
          <SweatModeModal onClose={() => setShowSweatMode(false)} />
        )}
        {showEditProgress && (
          <EditProgressModal 
            current={current} 
            goal={goal} 
            onClose={() => setShowEditProgress(false)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function BottleManagerModal({ onClose }: { onClose: () => void }) {
  const { bottles, addBottle, updateBottle, deleteBottle } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [volume, setVolume] = useState('');

  const handleSave = () => {
    if (!name || !volume) return;
    if (editingId) {
      updateBottle(editingId, { name, volume_ml: parseInt(volume) });
    } else {
      addBottle({ name, volume_ml: parseInt(volume) });
    }
    setEditingId(null);
    setName('');
    setVolume('');
  };

  const handleEdit = (b: Bottle) => {
    setEditingId(b.id);
    setName(b.name);
    setVolume(b.volume_ml.toString());
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
          <h2 className="font-display text-2xl font-bold text-slate-800">Manage Bottles</h2>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 flex flex-col gap-3 max-h-[40vh] overflow-y-auto pr-2">
          {bottles.map(b => (
            <div key={b.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
              <div>
                <p className="font-medium text-slate-800">{b.name}</p>
                <p className="text-sm text-text-secondary">{b.volume_ml} ml</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(b)} className="p-2 text-slate-400 hover:text-primary">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => deleteBottle(b.id)} className="p-2 text-slate-400 hover:text-rose-500">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="mb-3 font-medium text-slate-800">{editingId ? 'Edit Bottle' : 'Add New Bottle'}</h3>
          <div className="flex gap-3">
            <input 
              type="text" 
              placeholder="Name (e.g. Flask)" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <input 
              type="number" 
              placeholder="ml" 
              value={volume}
              onChange={e => setVolume(e.target.value)}
              className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="mt-3 flex gap-2">
            <Button onClick={handleSave} className="flex-1">{editingId ? 'Save' : 'Add'}</Button>
            {editingId && <Button variant="outline" onClick={() => { setEditingId(null); setName(''); setVolume(''); }}>Cancel</Button>}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function SweatModeModal({ onClose }: { onClose: () => void }) {
  const { addDailyAdjustment } = useApp();
  const [workoutType, setWorkoutType] = useState('Run');
  const [intensity, setIntensity] = useState('Moderate');
  const [duration, setDuration] = useState('30');
  const [distance, setDistance] = useState('');

  const workoutTypes = ['Run', 'Cycle', 'Yoga', 'HIIT', 'Weightlifting'];
  const intensities = [
    { label: 'Low', factor: 5 },
    { label: 'Moderate', factor: 10 },
    { label: 'High', factor: 15 },
    { label: 'Extreme', factor: 20 }
  ];

  const handleApply = () => {
    const factor = intensities.find(i => i.label === intensity)?.factor || 10;
    let amount = parseInt(duration) * factor;
    
    // Add extra hydration for distance if applicable
    if (distance && (workoutType === 'Run' || workoutType === 'Cycle')) {
      const dist = parseFloat(distance);
      if (!isNaN(dist)) {
        amount += workoutType === 'Run' ? dist * 50 : dist * 20; // 50ml per km run, 20ml per km cycle
      }
    }
    
    addDailyAdjustment(amount, 'sweat_mode');
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
          <div className="flex items-center gap-2">
            <Flame className="text-orange-500" size={24} />
            <h2 className="font-display text-2xl font-bold text-slate-800">Sweat Mode</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Workout Type</label>
            <div className="flex flex-wrap gap-2">
              {workoutTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setWorkoutType(type)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    workoutType === type 
                      ? 'bg-orange-100 text-orange-700 border-orange-200 border' 
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Intensity</label>
            <div className="grid grid-cols-2 gap-2">
              {intensities.map(i => (
                <button
                  key={i.label}
                  onClick={() => setIntensity(i.label)}
                  className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    intensity === i.label 
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {i.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Duration (minutes)</label>
            <input 
              type="number" 
              value={duration}
              onChange={e => setDuration(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {(workoutType === 'Run' || workoutType === 'Cycle') && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Distance (km) - Optional</label>
              <input 
                type="number" 
                value={distance}
                onChange={e => setDistance(e.target.value)}
                placeholder="e.g. 5"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          )}

          <Button 
            className="mt-4 bg-orange-500 hover:bg-orange-600 focus:ring-orange-500/20" 
            size="lg"
            onClick={handleApply}
          >
            Apply Adjustment
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function EditProgressModal({ current, goal, onClose }: { current: number, goal: number, onClose: () => void }) {
  const { addHydration, updateProfile, profile } = useApp();
  const [newCurrent, setNewCurrent] = useState(current.toString());
  const [newGoal, setNewGoal] = useState(goal.toString());

  const handleSave = () => {
    const parsedCurrent = parseInt(newCurrent);
    const parsedGoal = parseInt(newGoal);
    
    if (!isNaN(parsedCurrent) && parsedCurrent !== current) {
      const diff = parsedCurrent - current;
      addHydration(diff, 'manual');
    }
    
    if (!isNaN(parsedGoal) && parsedGoal !== goal) {
      if (profile) {
        const diff = parsedGoal - goal;
        updateProfile({ water_goal: profile.water_goal + diff });
      }
    }
    
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
          <h2 className="font-display text-2xl font-bold text-slate-800">Edit Progress</h2>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Current Intake (ml)</label>
            <input 
              type="number" 
              value={newCurrent}
              onChange={e => setNewCurrent(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Daily Goal (ml)</label>
            <input 
              type="number" 
              value={newGoal}
              onChange={e => setNewGoal(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <Button 
            className="mt-4" 
            size="lg"
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

