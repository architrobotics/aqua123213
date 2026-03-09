import React from 'react';
import { cn } from '../../lib/utils';

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-3xl bg-surface shadow-sm border border-slate-100 overflow-hidden", className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

export const GlassCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-3xl glass shadow-sm overflow-hidden", className)}
      {...props}
    />
  )
);
GlassCard.displayName = "GlassCard";
