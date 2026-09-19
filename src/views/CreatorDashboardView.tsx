import React, { useState, useEffect } from 'react';
import { FeedbackRoom, WalletState } from '../types';
import { storageService } from '../services/storage';
import { botchainService } from '../services/botchain';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { QrCodeModal } from '../components/feedback/QrCodeModal';
import { useToast } from '../components/ui/Toast';
import {
  PlusCircle,
  Share2,
  Lock,
  Unlock,
  MessageSquare,
  Calendar,
  Wallet,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface CreatorDashboardViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const CreatorDashboardView: React.FC<CreatorDashboardViewProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [allRooms, setAllRooms] = useState<FeedbackRoom[]>([]);
  const [walletState, setWalletState] = useState<WalletState>(botchainService.getWalletState());
  const [selectedShareRoom, setSelectedShareRoom] = useState<FeedbackRoom | null>(null);

  useEffect(() => {
    const updateRooms = () => {
      setAllRooms(storageService.getRooms());
    };
    updateRooms();

    const unsubStorage = storageService.subscribe(updateRooms);
    const unsubWallet = botchainService.subscribe(state => setWalletState(state));

    return () => {
      unsubStorage();
      unsubWallet();
    };
  }, []);

  // Filter rooms strictly created by the currently connected wallet
  const currentAddress = walletState.address?.toLowerCase();
  const creatorRooms = currentAddress
    ? allRooms.filter(r => r.creatorAddress.toLowerCase() === currentAddress)
    : [];

  const handleToggleRoomStatus = (roomId: string) => {
    const nextStatus = storageService.toggleRoomStatus(roomId);
    showToast(`Room is now ${nextStatus ? 'active' : 'closed'}`, 'info');
  };

  const getShareUrl = (roomId: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/#room=${roomId}`;
    }
    return `https://anonbot.app/f/${roomId}`;
  };

  const truncateAddress = (addr: string | null) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-panel-border-subtle pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-ink-primary">
              Your feedback rooms
            </h1>
            {walletState.isConnected && (
              <span className="px-2 py-0.5 rounded-full bg-panel text-xs font-mono text-ink-secondary border border-panel-border">
                {creatorRooms.length}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1">
            Manage your feedback rooms, inspect responses, and view on-chain proofs.
          </p>
        </div>

        <Button
          onClick={() => onNavigate('create')}
          leftIcon={<PlusCircle className="w-4 h-4 text-botchain" />}
        >
          Create feedback room
        </Button>
      </div>

      {/* Creator Wallet Status Banner */}
      <div className="bg-panel-subtle border border-panel-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-panel border border-panel-border flex items-center justify-center text-botchain shrink-0">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <span className="text-ink-muted">Connected Account:</span>
            <div className="font-mono text-ink-primary font-medium">
              {walletState.address ? walletState.address : 'No wallet connected'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-ink-secondary">
          {walletState.isConnected ? (
            <span className="flex items-center gap-1.5 font-mono text-botchain">
              <span className="w-1.5 h-1.5 rounded-full bg-botchain animate-pulse" />
              {walletState.networkName || 'BOTChain Testnet'}
            </span>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => botchainService.connectWallet()}
              className="text-xs"
            >
              Connect Creator Wallet
            </Button>
          )}
        </div>
      </div>

      {/* State A: Wallet Not Connected */}
      {!walletState.isConnected ? (
        <div className="bg-panel border border-panel-border rounded-xl p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-panel-border flex items-center justify-center text-ink-muted mx-auto">
            <Wallet className="w-5 h-5 text-botchain" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-ink-primary">Connect your wallet</h3>
            <p className="text-xs text-ink-secondary">
              Connect your Web3 wallet to access and manage your created feedback rooms.
            </p>
          </div>
          <Button
            onClick={() => botchainService.connectWallet()}
            size="sm"
            leftIcon={<Wallet className="w-3.5 h-3.5 text-botchain" />}
          >
            Connect Wallet
          </Button>
        </div>
      ) : creatorRooms.length === 0 ? (
        /* State B: Connected Wallet has 0 rooms */
        <div className="bg-panel border border-panel-border rounded-xl p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-panel-border flex items-center justify-center text-ink-muted mx-auto">
            <MessageSquare className="w-5 h-5 text-ink-muted" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-ink-primary">No feedback rooms yet</h3>
            <p className="text-xs text-ink-secondary">
              The connected address <span className="font-mono text-ink-primary">{truncateAddress(walletState.address)}</span> hasn't created any feedback rooms yet.
            </p>
          </div>
          <Button
            onClick={() => onNavigate('create')}
            size="sm"
            leftIcon={<PlusCircle className="w-3.5 h-3.5 text-botchain" />}
          >
            Create feedback room
          </Button>
        </div>
      ) : (
        /* State C: Rooms Grid for Connected Wallet */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {creatorRooms.map(room => (
            <div
              key={room.id}
              className="bg-panel border border-panel-border rounded-lg p-5 transition-all duration-150 hover:border-panel-border-focus flex flex-col justify-between gap-4"
            >
              {/* Header: Title + Status */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-mono text-ink-muted uppercase">
                    ID: {room.id}
                  </span>
                  <Badge variant={room.isActive ? 'botchain' : 'neutral'} size="sm" dot={room.isActive}>
                    {room.isActive ? 'Active' : 'Closed'}
                  </Badge>
                </div>

                <h3 className="text-base font-semibold text-ink-primary line-clamp-1">
                  {room.title}
                </h3>
                <p className="text-xs text-ink-secondary line-clamp-2 italic">
                  "{room.question}"
                </p>
              </div>

              {/* Stats Bar */}
              <div className="flex items-center gap-4 py-2 border-y border-white/[0.04] text-xs font-mono text-ink-secondary">
                <div className="flex items-center gap-1.5 text-ink-primary">
                  <MessageSquare className="w-3.5 h-3.5 text-botchain" />
                  <span className="font-semibold">{room.responseCount}</span>
                  <span>{room.responseCount === 1 ? 'response' : 'responses'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-ink-muted">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(room.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onNavigate('room-results', { roomId: room.id })}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    View feedback
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedShareRoom(room)}
                    title="Share room"
                  >
                    <Share2 className="w-3.5 h-3.5 text-ink-secondary" />
                  </Button>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleToggleRoomStatus(room.id)}
                  className="text-xs text-ink-muted hover:text-ink-primary"
                  title={room.isActive ? 'Close room to new feedback' : 'Reopen room'}
                >
                  {room.isActive ? (
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Close
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-botchain">
                      <Unlock className="w-3 h-3" /> Open
                    </span>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share Modal */}
      {selectedShareRoom && (
        <QrCodeModal
          isOpen={!!selectedShareRoom}
          onClose={() => setSelectedShareRoom(null)}
          url={getShareUrl(selectedShareRoom.id)}
          roomTitle={selectedShareRoom.title}
        />
      )}
    </div>
  );
};
