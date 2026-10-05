import React from 'react';
import { ExternalLink, Globe, Search, Shield, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#0A0B0D]/90 py-10 text-ink-muted text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/[0.06]">
          {/* AnonBOT Brand */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="AnonBOT Logo"
              className="w-7 h-7 rounded-md object-cover border border-botchain-border/40 shadow-sm shadow-botchain/10"
              onError={(e) => {
                // Fallback to icon if image fails
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-sm text-ink-primary">AnonBOT</span>
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-botchain-tint text-botchain border border-botchain-border/40">
                  BOTChain Native
                </span>
              </div>
              <span className="text-ink-secondary text-[11px] mt-0.5">
                Privacy-preserving anonymous feedback. Verified cryptographically on-chain.
              </span>
            </div>
          </div>

          {/* BOTChain Ecosystem Links */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <div className="text-[11px] text-ink-muted flex items-center gap-1.5 mr-1 font-mono uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5 text-botchain" />
              <span>Powered by BOTChain</span>
            </div>

            {/* Official Website Link */}
            <a
              href="https://botchain.ai"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit official BOTChain website (opens in new tab)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-botchain/50 text-ink-secondary hover:text-white transition-all group"
            >
              <Globe className="w-3.5 h-3.5 text-botchain group-hover:scale-110 transition-transform" />
              <span className="font-medium text-[11px]">botchain.ai</span>
              <ExternalLink className="w-3 h-3 text-ink-muted group-hover:text-botchain transition-colors" />
            </a>

            {/* Mainnet Explorer Link */}
            <a
              href="https://scan.botchain.ai"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open BOTChain Explorer on scan.botchain.ai (opens in new tab)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-botchain/50 text-ink-secondary hover:text-white transition-all group"
            >
              <Search className="w-3.5 h-3.5 text-botchain group-hover:scale-110 transition-transform" />
              <span className="font-medium text-[11px]">scan.botchain.ai</span>
              <ExternalLink className="w-3 h-3 text-ink-muted group-hover:text-botchain transition-colors" />
            </a>

            {/* Testnet Explorer Link */}
            <a
              href="https://scan.bohr.life"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open BOTChain Testnet Explorer on scan.bohr.life (opens in new tab)"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] hover:border-white/[0.15] text-ink-muted hover:text-ink-secondary transition-all group"
            >
              <span className="text-[10px] font-mono">Testnet Scan</span>
              <ExternalLink className="w-2.5 h-2.5 text-ink-muted group-hover:text-ink-secondary transition-colors" />
            </a>
          </div>
        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-ink-muted font-mono">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-botchain/70" />
            <span>Room-isolated pseudonyms • Zero wallet correlation</span>
          </div>
          <div>
            Decentralized &amp; Cryptographically Proven
          </div>
        </div>
      </div>
    </footer>
  );
};

