import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Droplet, Camera, BarChart3, Sparkles, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const navItems = [
  { icon: Droplet, label: 'Hydrate', path: '/' },
  { icon: Camera, label: 'Scan', path: '/scan' },
  { icon: Sparkles, label: 'Skin', path: '/skin' },
  { icon: BarChart3, label: 'Stats', path: '/stats' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Layout() {
  return (
    <div className="flex h-screen w-full flex-col bg-background md:flex-row">
      {/* Mobile Top Bar */}
      <header className="glass sticky top-0 z-50 flex h-16 items-center justify-between px-6 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Droplet size={20} className="fill-primary" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-slate-800">Aqua</span>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-surface p-6 md:flex">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Droplet size={24} className="fill-primary" />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight text-slate-800">Aqua</span>
        </div>
        
        <nav className="flex flex-1 flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all",
                  isActive 
                    ? "bg-primary text-white shadow-md shadow-primary/20" 
                    : "text-text-secondary hover:bg-slate-100 hover:text-text-primary"
                )
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
        <div className="mx-auto w-full max-w-md p-6 md:max-w-3xl md:p-10">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="glass fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around border-t border-slate-200/50 px-6 pb-safe md:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 rounded-xl p-2 transition-all",
                isActive ? "text-primary" : "text-text-muted hover:text-text-secondary"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <item.icon size={24} className={cn(isActive && "fill-primary/20")} />
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-4 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary"
                    />
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
