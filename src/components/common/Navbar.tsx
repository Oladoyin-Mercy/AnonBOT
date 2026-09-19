import React, { useState, useEffect } from 'react';
import { botchainService } from '../../services/botchain';
import { storageService } from '../../services/storage';
import { WalletState } from '../../types';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Wallet, ChevronDown, LogOut, Plus, MessageSquare, ArrowRight } from 'lucide-react';
import { useToast } from '../ui/Toast';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { showToast } = useToast();
  const [walletState, setWalletState] = useState<WalletState>(botchainService.getWalletState());
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');

  useEffect(() => {
    return botchainService.subscribe(state => {
      setWalletState(state);
    });
  }, []);

  const handleConnectWallet = async () => {
    const res = await botchainService.connectWallet();
    if (res.isConnected) {
      showToast('Wallet connected', 'success');
    } else if (res.error) {
      showToast(res.error, 'error');
    }
  };

  const handleDisconnectWallet = () => {
    botchainService.disconnectWallet();
    setShowWalletMenu(false);
    showToast('Wallet disconnected', 'info');
  };

  const truncateAddress = (addr: string | null) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = joinCodeInput.trim().replace(/^.*#room=/, '').replace(/^.*\/f\//, '');
    if (!clean) {
      showToast('Please enter a room code', 'error');
      return;
    }
    const room = storageService.getRoomById(clean);
    if (!room) {
      showToast(`Room "${clean}" not found`, 'error');
      return;
    }
    setShowJoinModal(false);
    setJoinCodeInput('');
    onNavigate('submit', { roomId: room.id });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#0A0B0D]/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand with Favicon */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 text-ink-primary group focus:outline-none"
          >
            {/* AnonBOT Favicon */}
            <div className="w-6 h-6 rounded bg-[#121418] border border-white/[0.12] flex items-center justify-center text-botchain group-hover:border-botchain transition-colors">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M9 9h6" />
                <path d="M9 13h6" />
                <path d="M9 17h4" />
              </svg>
            </div>
            <span className="font-bold tracking-tight text-sm text-ink-primary group-hover:text-white transition-colors">
              AnonBOT
            </span>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs">
            <button
              onClick={() => onNavigate('landing')}
              className={`px-3 py-1.5 rounded transition-colors ${
                currentView === 'landing'
                  ? 'text-ink-primary bg-white/[0.08] font-medium'
                  : 'text-ink-secondary hover:text-ink-primary hover:bg-white/[0.04]'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
                currentView === 'submit'
                  ? 'text-ink-primary bg-white/[0.08] font-medium'
                  : 'text-ink-secondary hover:text-ink-primary hover:bg-white/[0.04]'
              }`}
            >
              <MessageSquare className="w-3 h-3 text-botchain" />
              <span>Give feedback</span>
            </button>
            <button
              onClick={() => onNavigate('create')}
              className={`px-3 py-1.5 rounded transition-colors ${
                currentView === 'create'
                  ? 'text-ink-primary bg-white/[0.08] font-medium'
                  : 'text-ink-secondary hover:text-ink-primary hover:bg-white/[0.04]'
              }`}
            >
              Create room
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3 py-1.5 rounded transition-colors ${
                currentView === 'dashboard'
                  ? 'text-ink-primary bg-white/[0.08] font-medium'
                  : 'text-ink-secondary hover:text-ink-primary hover:bg-white/[0.04]'
              }`}
            >
              Dashboard
            </button>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Quick Create CTA for desktop */}
          <button
            onClick={() => onNavigate('create')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-white/[0.04] border border-white/[0.08] text-ink-primary hover:bg-white/[0.08] hover:border-white/[0.15] transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-botchain" />
            <span>New Room</span>
          </button>

          {/* Wallet Connection */}
          {walletState.isConnected && walletState.address ? (
            <div className="relative">
              <button
                onClick={() => setShowWalletMenu(!showWalletMenu)}
                className="flex items-center gap-2 bg-[#121418] border border-white/[0.12] hover:border-white/[0.25] rounded px-3 py-1.5 text-xs font-mono text-ink-primary transition-colors select-none"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-botchain" />
                <span>{truncateAddress(walletState.address)}</span>
                <ChevronDown className="w-3 h-3 text-ink-muted" />
              </button>

              {showWalletMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-[#121418] border border-white/[0.12] rounded shadow-2xl py-2 text-xs z-50 animate-in fade-in duration-100">
                  <div className="px-3 py-2 border-b border-white/[0.06]">
                    <div className="flex items-center justify-between">
                      <span className="text-ink-muted text-[11px] font-mono uppercase">Connected</span>
                      <span className="text-[11px] font-mono text-botchain">{walletState.networkName}</span>
                    </div>
                    <p className="font-mono text-ink-primary font-medium mt-1 break-all text-[11px]">
                      {walletState.address}
                    </p>
                  </div>

                  <div className="px-1 pt-1 space-y-0.5">
                    <button
                      onClick={() => {
                        setShowWalletMenu(false);
                        onNavigate('dashboard');
                      }}
                      className="w-full text-left px-3 py-1.5 rounded text-ink-secondary hover:text-ink-primary hover:bg-white/[0.04] transition-colors"
                    >
                      My Feedback Rooms
                    </button>
                    <button
                      onClick={handleDisconnectWallet}
                      className="w-full text-left px-3 py-1.5 rounded text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Disconnect</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleConnectWallet}
              disabled={walletState.isConnecting}
              className="inline-flex items-center gap-1.5 bg-botchain text-black font-semibold px-3 py-1.5 rounded text-xs hover:bg-[#05F7A6] transition-colors focus:outline-none"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{walletState.isConnecting ? 'Connecting...' : 'Connect wallet'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Give Feedback Modal */}
      <Modal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        maxWidth="sm"
        title="Give Anonymous Feedback"
        description="Enter the feedback room code or select an active room below."
      >
        <form onSubmit={handleJoinSubmit} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-secondary mb-1.5">
              Room Identifier
            </label>
            <input
              type="text"
              autoFocus
              value={joinCodeInput}
              onChange={e => setJoinCodeInput(e.target.value)}
              placeholder="e.g. your-room-code"
              className="w-full bg-[#0A0B0D] border border-white/[0.1] rounded px-3 py-2 text-xs font-mono text-ink-primary focus:outline-none focus:border-white/[0.25]"
            />
          </div>

          {storageService.getRooms().filter(r => r.isActive).length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] text-ink-muted font-mono uppercase tracking-wider">Active public rooms:</p>
              <div className="space-y-1.5">
                {storageService.getRooms().filter(r => r.isActive).map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setShowJoinModal(false);
                      onNavigate('submit', { roomId: r.id });
                    }}
                    className="w-full p-2.5 rounded bg-[#0A0B0D] border border-white/[0.08] hover:border-botchain text-left transition-colors flex items-center justify-between"
                  >
                    <span className="text-xs font-medium text-ink-primary truncate max-w-[200px]">
                      {r.title}
                    </span>
                    <span className="text-[10px] font-mono text-botchain shrink-0">
                      {r.id}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowJoinModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Open Room
            </Button>
          </div>
        </form>
      </Modal>
    </header>
  );
};
