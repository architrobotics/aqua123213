import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, HydrationLog, Bottle, SkinLog } from '../types';
import { supabase } from '../lib/supabase';

interface AppState {
  isAuthenticated: boolean;
  profile: UserProfile | null;
  hydrationLogs: HydrationLog[];
  bottles: Bottle[];
  skinLogs: SkinLog[];
  meals: Meal[];
  dailyAdjustments: { date: string; amount: number; source: string }[];
}

interface AppContextType extends AppState {
  login: (email: string) => void;
  logout: () => void;
  saveProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addHydration: (amount: number, source: HydrationLog['source']) => void;
  updateHydration: (id: string, amount: number) => void;
  removeHydration: (id: string) => void;
  addBottle: (bottle: Omit<Bottle, 'id' | 'user_id'>) => void;
  updateBottle: (id: string, updates: Partial<Bottle>) => void;
  deleteBottle: (id: string) => void;
  addSkinLog: (log: Omit<SkinLog, 'id' | 'user_id' | 'timestamp'>) => void;
  updateSkinLog: (id: string, updates: Partial<SkinLog>) => void;
  removeSkinLog: (id: string) => void;
  addMeal: (meal: Omit<Meal, 'id' | 'user_id' | 'timestamp'>) => void;
  updateMeal: (id: string, updates: Partial<Meal>) => void;
  removeMeal: (id: string) => void;
  addDailyAdjustment: (amount: number, source: string) => void;
}

const defaultState: AppState = {
  isAuthenticated: false,
  profile: null,
  hydrationLogs: [],
  bottles: [
    { id: '1', user_id: '1', name: 'Glass', volume_ml: 250 },
    { id: '2', user_id: '1', name: 'Bottle', volume_ml: 500 },
    { id: '3', user_id: '1', name: 'Flask', volume_ml: 750 },
  ],
  skinLogs: [],
  meals: [],
  dailyAdjustments: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('aquaglow_state');
    if (saved) {
      try {
        return { ...defaultState, ...JSON.parse(saved) };
      } catch (e) {
        console.error("Failed to parse state", e);
      }
    }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem('aquaglow_state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setState(prev => ({ ...prev, isAuthenticated: true }));
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          setState(prev => ({ ...prev, isAuthenticated: true }));
        } else {
          setState(prev => ({ ...prev, isAuthenticated: false }));
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const login = (email: string) => {
    setState(prev => ({ ...prev, isAuthenticated: true }));
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setState(defaultState);
    localStorage.removeItem('aquaglow_state');
  };

  const saveProfile = (profile: UserProfile) => {
    setState(prev => ({ ...prev, profile }));
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setState(prev => ({ ...prev, profile: prev.profile ? { ...prev.profile, ...updates } : null }));
  };

  const addHydration = (amount: number, source: HydrationLog['source']) => {
    const newLog: HydrationLog = {
      id: Date.now().toString(),
      user_id: state.profile?.id || '1',
      amount_ml: amount,
      timestamp: new Date().toISOString(),
      source,
    };
    setState(prev => ({
      ...prev,
      hydrationLogs: [...prev.hydrationLogs, newLog],
    }));
  };

  const updateHydration = (id: string, amount: number) => {
    setState(prev => ({
      ...prev,
      hydrationLogs: prev.hydrationLogs.map(log => log.id === id ? { ...log, amount_ml: amount } : log)
    }));
  };

  const removeHydration = (id: string) => {
    setState(prev => ({
      ...prev,
      hydrationLogs: prev.hydrationLogs.filter(log => log.id !== id)
    }));
  };

  const addBottle = (bottle: Omit<Bottle, 'id' | 'user_id'>) => {
    const newBottle: Bottle = {
      ...bottle,
      id: Date.now().toString(),
      user_id: state.profile?.id || '1',
    };
    setState(prev => ({
      ...prev,
      bottles: [...prev.bottles, newBottle],
    }));
  };

  const updateBottle = (id: string, updates: Partial<Bottle>) => {
    setState(prev => ({
      ...prev,
      bottles: prev.bottles.map(b => b.id === id ? { ...b, ...updates } : b)
    }));
  };

  const deleteBottle = (id: string) => {
    setState(prev => ({
      ...prev,
      bottles: prev.bottles.filter(b => b.id !== id)
    }));
  };

  const addSkinLog = (log: Omit<SkinLog, 'id' | 'user_id' | 'timestamp'>) => {
    const newLog: SkinLog = {
      ...log,
      id: Date.now().toString(),
      user_id: state.profile?.id || '1',
      timestamp: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      skinLogs: [...prev.skinLogs, newLog],
    }));
  };

  const updateSkinLog = (id: string, updates: Partial<SkinLog>) => {
    setState(prev => ({
      ...prev,
      skinLogs: prev.skinLogs.map(log => log.id === id ? { ...log, ...updates } : log)
    }));
  };

  const removeSkinLog = (id: string) => {
    setState(prev => ({
      ...prev,
      skinLogs: prev.skinLogs.filter(log => log.id !== id)
    }));
  };

  const addMeal = (meal: Omit<Meal, 'id' | 'user_id' | 'timestamp'>) => {
    const newMeal: Meal = {
      ...meal,
      id: Date.now().toString(),
      user_id: state.profile?.id || '1',
      timestamp: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      meals: [...prev.meals, newMeal],
    }));
  };

  const updateMeal = (id: string, updates: Partial<Meal>) => {
    setState(prev => ({
      ...prev,
      meals: prev.meals.map(meal => meal.id === id ? { ...meal, ...updates } : meal)
    }));
  };

  const removeMeal = (id: string) => {
    setState(prev => ({
      ...prev,
      meals: prev.meals.filter(meal => meal.id !== id)
    }));
  };

  const addDailyAdjustment = (amount: number, source: string) => {
    const today = new Date().toISOString().split('T')[0];
    setState(prev => {
      const existing = prev.dailyAdjustments.find(a => a.date === today && a.source === source);
      if (existing) {
        return {
          ...prev,
          dailyAdjustments: prev.dailyAdjustments.map(a => 
            (a.date === today && a.source === source) ? { ...a, amount: a.amount + amount } : a
          )
        };
      } else {
        return {
          ...prev,
          dailyAdjustments: [...prev.dailyAdjustments, { date: today, amount, source }]
        };
      }
    });
  };

  return (
    <AppContext.Provider value={{
      ...state,
      login,
      logout,
      saveProfile,
      updateProfile,
      addHydration,
      updateHydration,
      removeHydration,
      addBottle,
      updateBottle,
      deleteBottle,
      addSkinLog,
      updateSkinLog,
      removeSkinLog,
      addMeal,
      updateMeal,
      removeMeal,
      addDailyAdjustment
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
