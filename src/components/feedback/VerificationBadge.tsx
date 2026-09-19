import React from 'react';
import { CheckCircle2, ExternalLink } from 'lucide-react';
import { clsx } from 'clsx';

interface VerificationBadgeProps {
  onClick?: () => void;
  networkName?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  onClick,
  networkName = 'BOTChain',
  size = 'sm',
  className,
}) => {
  const isClickable = !!onClick;

  return (
    <button
      type={isClickable ? 'button' : undefined}
      onClick={onClick}
      disabled={!isClickable}
      className={clsx(
        'inline-flex items-center gap-1.5 font-mono text-[11px] rounded transition-colors select-none text-left',
        'bg-botchain-tint text-botchain border border-botchain-border',
        isClickable
          ? 'hover:bg-botchain/15 hover:border-botchain/40 cursor-pointer px-2 py-0.5'
          : 'cursor-default px-2 py-0.5',
        size === 'md' && 'text-xs px-2.5 py-1',
        className
      )}
      title="Verified on BOTChain ledger"
    >
      <CheckCircle2 className="w-3.5 h-3.5 text-botchain shrink-0" />
      <span>Verified on {networkName}</span>
      {isClickable && <ExternalLink className="w-2.5 h-2.5 text-botchain/70 ml-0.5" />}
    </button>
  );
};
