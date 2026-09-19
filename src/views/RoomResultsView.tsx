import React, { useState, useEffect } from 'react';
import { FeedbackCategory, FeedbackRoom, AnonymousFeedback, WalletState } from '../types';
import { storageService } from '../services/storage';
import { botchainService } from '../services/botchain';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { FeedbackCard } from '../components/feedback/FeedbackCard';
import { QrCodeModal } from '../components/feedback/QrCodeModal';
import { useToast } from '../components/ui/Toast';
import {
  ArrowLeft,
  Share2,
  Lock,
  Unlock,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Send,
} from 'lucide-react';

interface RoomResultsViewProps {
  roomId: string;
  onNavigate: (view: string, params?: any) => void;
}

export const RoomResultsView: React.FC<RoomResultsViewProps> = ({ roomId, onNavigate }) => {
  const { showToast } = useToast();
  const [room, setRoom] = useState<FeedbackRoom | null>(null);
  const [feedbackList, setFeedbackList] = useState<AnonymousFeedback[]>([]);
  const [walletState, setWalletState] = useState<WalletState>(botchainService.getWalletState());
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const loadData = () => {
      const r = storageService.getRoomById(roomId);
      setRoom(r);
      if (r) {
        const list = storageService.getFeedbackForRoom(roomId);
        setFeedbackList(list);
      }
    };

    loadData();
    const unsubStorage = storageService.subscribe(loadData);
    const unsubWallet = botchainService.subscribe(state => setWalletState(state));
    return () => {
      unsubStorage();
      unsubWallet();
    };
  }, [roomId]);

  const isCreator = room && walletState.address
    ? room.creatorAddress.toLowerCase() === walletState.address.toLowerCase()
    : false;

  const handleToggleStatus = () => {
    if (!room) return;
    if (!isCreator) {
      showToast('Only the room creator can modify room status', 'error');
      return;
    }
    const nextStatus = storageService.toggleRoomStatus(room.id);
    showToast(`Room status updated to ${nextStatus ? 'active' : 'closed'}`, 'info');
  };

  const handleExport = (format: 'json' | 'csv') => {
    if (!room) return;
    const content = storageService.exportFeedback(room.id, format);
    const blob = new Blob([content], {
      type: format === 'json' ? 'application/json' : 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${room.id}-feedback.${format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${feedbackList.length} feedback items as ${format.toUpperCase()}`, 'success');
  };

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/#room=${roomId}`;
    }
    return `https://anonbot.app/f/${roomId}`;
  };

  const truncate = (str: string) => {
    if (!str || str.length <= 10) return str;
    return `${str.slice(0, 6)}...${str.slice(-4)}`;
  };

  if (!room) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-ink-primary">Room Not Found</h2>
        <Button variant="secondary" size="sm" onClick={() => onNavigate('landing')}>
          Return Home
        </Button>
      </div>
    );
  }

  const filteredFeedback = feedbackList.filter(item => {
    if (selectedFilter === 'all') return true;
    return item.category === selectedFilter;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate(isCreator ? 'dashboard' : 'landing')}
          className="inline-flex items-center gap-1.5 text-xs text-ink-secondary hover:text-ink-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isCreator ? 'Back to Dashboard' : 'Back to Home'}</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={() => onNavigate('submit', { roomId: room.id })}
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            Give Feedback
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowShareModal(true)}
            leftIcon={<Share2 className="w-3.5 h-3.5 text-ink-secondary" />}
          >
            Share
          </Button>
        </div>
      </div>

      {/* Room Header Info */}
      <div className="bg-panel border border-panel-border rounded-xl p-6 sm:p-8 space-y-4 shadow-subtle-card">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-mono text-ink-muted uppercase">ID: {room.id}</span>
              <Badge variant={room.isActive ? 'botchain' : 'neutral'} size="sm" dot={room.isActive}>
                {room.isActive ? 'Active' : 'Closed'}
              </Badge>
              <span className="text-xs font-mono text-ink-muted">
                Created by {truncate(room.creatorAddress)}
              </span>
              {isCreator && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-botchain-tint text-botchain border border-botchain-border">
                  You are Creator
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-primary">
              {room.title}
            </h1>

            <p className="text-sm sm:text-base text-ink-secondary italic pt-1">
              "{room.question}"
            </p>
          </div>

          {isCreator && (
            <div className="flex items-center gap-2 self-start">
              <Button
                size="sm"
                variant={room.isActive ? 'outline' : 'secondary'}
                onClick={handleToggleStatus}
                className="text-xs"
              >
                {room.isActive ? (
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> Close Room
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-botchain">
                    <Unlock className="w-3.5 h-3.5" /> Reopen Room
                  </span>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Quick Stats & Export Bar */}
        <div className="pt-4 border-t border-panel-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-mono text-ink-primary">
            <MessageSquare className="w-4 h-4 text-botchain" />
            <span className="font-semibold text-base">{feedbackList.length}</span>
            <span className="text-ink-secondary">responses recorded on BOTChain</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-ink-muted">Export:</span>
            <button
              onClick={() => handleExport('json')}
              className="px-2 py-1 bg-white/[0.04] hover:bg-white/[0.08] rounded text-ink-secondary hover:text-ink-primary font-mono transition-colors"
            >
              JSON
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="px-2 py-1 bg-white/[0.04] hover:bg-white/[0.08] rounded text-ink-secondary hover:text-ink-primary font-mono transition-colors"
            >
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-panel-border-subtle pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {[
            { id: 'all', label: 'All Responses', count: feedbackList.length },
            { id: 'positive', label: 'Positive', count: feedbackList.filter(f => f.category === 'positive').length },
            { id: 'constructive', label: 'Constructive', count: feedbackList.filter(f => f.category === 'constructive').length },
            { id: 'question', label: 'Questions', count: feedbackList.filter(f => f.category === 'question').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                selectedFilter === tab.id
                  ? 'bg-panel-hover text-ink-primary border border-panel-border-focus'
                  : 'text-ink-secondary hover:text-ink-primary hover:bg-white/[0.02]'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] font-mono px-1 rounded bg-panel text-ink-muted">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Feed */}
      {filteredFeedback.length === 0 ? (
        <div className="bg-panel border border-panel-border rounded-xl p-10 text-center space-y-3">
          <p className="text-sm font-semibold text-ink-primary">No feedback recorded yet</p>
          <p className="text-xs text-ink-secondary">
            Share the room link or be the first to leave honest feedback.
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <Button
              size="sm"
              variant="primary"
              onClick={() => onNavigate('submit', { roomId: room.id })}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Give Feedback
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowShareModal(true)}
              leftIcon={<Share2 className="w-3.5 h-3.5" />}
            >
              Share Link
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFeedback.map(item => (
            <FeedbackCard key={item.id} feedback={item} />
          ))}
        </div>
      )}

      {/* Share QR Code Modal */}
      <QrCodeModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        url={getShareUrl()}
        roomTitle={room.title}
      />
    </div>
  );
};
