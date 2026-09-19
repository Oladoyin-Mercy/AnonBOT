import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, error, leftElement, rightElement, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium uppercase tracking-wider text-ink-secondary">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftElement && (
            <div className="absolute left-3 flex items-center pointer-events-none text-ink-muted">
              {leftElement}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={twMerge(
              clsx(
                'w-full bg-panel border border-panel-border rounded-md px-3.5 py-2 text-sm text-ink-primary placeholder:text-ink-muted transition-colors duration-150',
                'focus:outline-none focus:border-panel-border-focus focus:ring-1 focus:ring-panel-border-focus',
                'disabled:opacity-50 disabled:bg-panel-subtle disabled:cursor-not-allowed',
                leftElement && 'pl-10',
                rightElement && 'pr-10',
                error && 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30',
                className
              )
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 flex items-center text-ink-muted">
              {rightElement}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-red-400">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-ink-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  characterCount?: number;
  maxCharacters?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helperText, error, characterCount, maxCharacters, id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        <div className="flex justify-between items-center">
          {label && (
            <label htmlFor={textareaId} className="block text-xs font-medium uppercase tracking-wider text-ink-secondary">
              {label}
            </label>
          )}
          {maxCharacters && (
            <span className="text-xs text-ink-muted font-mono">
              {characterCount || 0}/{maxCharacters}
            </span>
          )}
        </div>
        <textarea
          id={textareaId}
          ref={ref}
          className={twMerge(
            clsx(
              'w-full bg-panel border border-panel-border rounded-md px-3.5 py-2.5 text-sm text-ink-primary placeholder:text-ink-muted transition-colors duration-150 resize-y min-h-[120px]',
              'focus:outline-none focus:border-panel-border-focus focus:ring-1 focus:ring-panel-border-focus',
              'disabled:opacity-50 disabled:bg-panel-subtle disabled:cursor-not-allowed',
              error && 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30',
              className
            )
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs text-red-400">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-ink-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
