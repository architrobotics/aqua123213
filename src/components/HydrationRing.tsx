import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface HydrationRingProps {
  current: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function HydrationRing({
  current,
  goal,
  size = 280,
  strokeWidth = 24,
  className,
}: HydrationRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(current / goal, 1);
  const strokeDashoffset = circumference - percentage * circumference;

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-primary/10"
        />
        {/* Progress Fill */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="text-primary drop-shadow-lg"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      
      {/* Inner Content */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-5xl font-bold tracking-tighter text-slate-800"
        >
          {current}
        </motion.span>
        <span className="mt-1 text-sm font-medium text-text-muted">
          / {goal} ml
        </span>
        
        {percentage >= 1 && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-3 rounded-full bg-secondary/20 px-3 py-1 text-xs font-bold text-secondary-dark"
          >
            Goal Reached! 🎉
          </motion.div>
        )}
      </div>
    </div>
  );
}
