import React from 'react';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-panel-border bg-panel-subtle py-8 text-ink-muted text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-botchain" />
          <span className="font-semibold text-ink-primary">AnonBOT</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-botchain-tint text-botchain border border-botchain-border/50">
            BOTChain
          </span>
          <span className="text-ink-secondary text-xs ml-2 hidden md:inline">
            Anonymous feedback. Verified on-chain.
          </span>
        </div>

        <div className="text-[11px] text-ink-muted font-mono">
          Built for BOTChain • Decentralized & Private
        </div>
      </div>
    </footer>
  );
};
