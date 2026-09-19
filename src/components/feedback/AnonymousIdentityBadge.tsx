import React from 'react';
import { Shield, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';

interface AnonymousIdentityBadgeProps {
  anonymousId: string;
  onRegenerate?: () => void;
  showExplanation?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AnonymousIdentityBadge: React.FC<AnonymousIdentityBadgeProps> = ({
  anonymousId,
  onRegenerate,
  showExplanation = false,
  size = 'md',
  className,
}) => {
  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5 font-semibold',
  };

  return (
    <div className={clsx('inline-flex flex-col gap-1', className)}>
      <div className="inline-flex items-center gap-1.5">
        <div
          className={clsx(
            'inline-flex items-center gap-2 bg-panel-subtle border border-panel-border rounded-md font-mono text-ink-primary select-none',
            sizes[size]
          )}
        >
          <Shield className="w-3.5 h-3.5 text-botchain shrink-0" />
          <span className="tracking-wider">{anonymousId}</span>
        </div>

        {onRegenerate && (
          <button
            type="button"
            onClick={onRegenerate}
            title="Roll a different anonymous identity for this room"
            className="p-1 text-ink-muted hover:text-ink-primary hover:bg-white/[0.05] rounded transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {showExplanation && (
        <span className="text-[11px] text-ink-muted">
          Your identity is generated specifically for this room. Your wallet address is hidden.
        </span>
      )}
    </div>
  );
};
