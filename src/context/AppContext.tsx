import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, HydrationLog, Bottle, SkinLog } from '../types';

interface AppState {
  isAuthenticated: boolean;
  profile: UserProfile | null;
  hydrationLogs: HydrationLog[];
  bottles: Bottle[];
  skinLogs: SkinLog[];
  dailyAdjustments: { date: string; amount: number }[];
}

interface AppContextType extends AppState {
  login: (email: string) => void;
  logout: () => void;
  saveProfile: (profile: UserProfile) => void;
  addHydration: (amount: number, source: HydrationLog['source']) => void;
  addBottle: (bottle: Omit<Bottle, 'id' | 'user_id'>) => void;
  addSkinLog: (log: Omit<SkinLog, 'id' | 'user_id' | 'timestamp'>) => void;
  addDailyAdjustment: (amount: number) => void;
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

  const login = (email: string) => {
    setState(prev => ({ ...prev, isAuthenticated: true }));
  };

  const logout = () => {
    setState(defaultState);
    localStorage.removeItem('aquaglow_state');
  };

  const saveProfile = (profile: UserProfile) => {
    setState(prev => ({ ...prev, profile }));
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

  const addDailyAdjustment = (amount: number) => {
    const today = new Date().toISOString().split('T')[0];
    setState(prev => {
      const existing = prev.dailyAdjustments.find(a => a.date === today);
      if (existing) {
        return {
          ...prev,
          dailyAdjustments: prev.dailyAdjustments.map(a => 
            a.date === today ? { ...a, amount: a.amount + amount } : a
          )
        };
      } else {
        return {
          ...prev,
          dailyAdjustments: [...prev.dailyAdjustments, { date: today, amount }]
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
      addHydration,
      addBottle,
      addSkinLog,
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
