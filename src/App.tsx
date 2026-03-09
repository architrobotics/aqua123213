import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Onboarding } from './pages/Onboarding';
import { MealScanner } from './pages/MealScanner';
import { SkinHealth } from './pages/SkinHealth';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { Chatbot } from './pages/Chatbot';
import { Login } from './pages/Login';
import { AppProvider, useApp } from './context/AppContext';

function AppRoutes() {
  const { isAuthenticated, profile } = useApp();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (!profile) {
    return (
      <Routes>
        <Route path="*" element={<Onboarding />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="scan" element={<MealScanner />} />
        <Route path="skin" element={<SkinHealth />} />
        <Route path="stats" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="coach" element={<Chatbot />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
