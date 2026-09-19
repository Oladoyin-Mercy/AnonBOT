import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'botchain' | 'positive' | 'constructive' | 'question' | 'outline' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'default',
  size = 'md',
  dot = false,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full select-none';

  const variants = {
    default: 'bg-white/[0.06] text-ink-primary border border-white/[0.08]',
    botchain: 'bg-botchain-tint text-botchain border border-botchain-border',
    positive: 'bg-feedback-positive-bg text-feedback-positive border border-feedback-positive-border',
    constructive: 'bg-feedback-constructive-bg text-feedback-constructive border border-feedback-constructive-border',
    question: 'bg-feedback-question-bg text-feedback-question border border-feedback-question-border',
    outline: 'bg-transparent text-ink-secondary border border-panel-border',
    neutral: 'bg-panel-subtle text-ink-muted border border-panel-border-subtle',
  };

  const dotColors = {
    default: 'bg-ink-secondary',
    botchain: 'bg-botchain',
    positive: 'bg-feedback-positive',
    constructive: 'bg-feedback-constructive',
    question: 'bg-feedback-question',
    outline: 'bg-ink-muted',
    neutral: 'bg-ink-muted',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))} {...props}>
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0 animate-pulse', dotColors[variant])} />
      )}
      {children}
    </span>
  );
};
