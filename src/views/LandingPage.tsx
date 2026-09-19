import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { AnonymousIdentityBadge } from '../components/feedback/AnonymousIdentityBadge';
import { VerificationBadge } from '../components/feedback/VerificationBadge';
import { ArrowRight, EyeOff, ExternalLink, Terminal, Shield } from 'lucide-react';
import { VerificationInspectorModal } from '../components/feedback/VerificationInspectorModal';
import { AnonymousFeedback, FeedbackRoom } from '../types';
import { storageService } from '../services/storage';
import { useToast } from '../components/ui/Toast';

interface LandingPageProps {
  onNavigate: (view: string, params?: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [activeRooms, setActiveRooms] = useState<FeedbackRoom[]>([]);

  useEffect(() => {
    const loadRooms = () => {
      setActiveRooms(storageService.getRooms().filter(r => r.isActive));
    };
    loadRooms();
    const unsub = storageService.subscribe(loadRooms);
    return () => unsub();
  }, []);

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = roomCodeInput.trim().replace(/^.*#room=/, '').replace(/^.*\/f\//, '');
    if (!clean) {
      showToast('Please enter a room code or link', 'error');
      return;
    }
    const target = storageService.getRoomById(clean);
    if (!target) {
      showToast(`Room "${clean}" not found. Please check the identifier.`, 'error');
      return;
    }
    onNavigate('submit', { roomId: target.id });
  };

  const demoFeedbackItem: AnonymousFeedback = {
    id: 'demo-sample-1',
    roomId: 'presentation-7x2k',
    anonymousId: 'ANON-7F3A91',
    content: 'Your presentation was clear, but the introduction could be shorter to allow more time for questions.',
    category: 'positive',
    createdAt: Date.now() - 1000 * 60 * 45,
    verification: {
      network: 'BOTChain Testnet',
      contractAddress: '0x7B891A4089c16Fe9e18b6dB390F8e3a2414A0b88',
      transactionHash: '0x7a839f912049581948392019485720193fa88921e405bd8848d8a7c290119e04',
      blockNumber: 14892318,
      blockTimestamp: Date.now() - 1000 * 60 * 45,
      payloadHash: '0x9a88c2e1f4095a1288fbc98231c498ae23984180492817498192837491029384',
      gasUsed: 48210,
      verified: true,
      status: 'confirmed',
    },
  };

  const [inspectorOpen, setInspectorOpen] = useState(false);

  return (
    <div className="space-y-20 py-10 md:py-16">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Mission & Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#F3F4F6] leading-[1.12]">
                Anonymous feedback. <br />
                <span className="text-botchain">Verified on-chain.</span>
              </h1>

              <p className="text-sm sm:text-base text-ink-secondary leading-relaxed max-w-lg">
                Create a private feedback room and hear what people really think — without revealing who they are.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                size="md"
                onClick={() => onNavigate('create')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create a feedback room
              </Button>
              <Button
                size="md"
                variant="outline"
                onClick={() => {
                  const el = document.getElementById('how-it-works');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                See how it works
              </Button>
            </div>

            {/* Direct Room Submitter Input */}
            <div className="pt-3 border-t border-white/[0.08] max-w-md">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1.5">
                Have a room link or code?
              </label>
              <form onSubmit={handleJoinRoom} className="flex items-center gap-2">
                <input
                  type="text"
                  value={roomCodeInput}
                  onChange={e => setRoomCodeInput(e.target.value)}
                  placeholder="e.g. presentation-7x2k"
                  className="flex-1 bg-[#121418] border border-white/[0.1] rounded px-3 py-2 text-xs font-mono text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-white/[0.25]"
                />
                <Button type="submit" size="sm" variant="secondary" className="text-xs shrink-0">
                  Give Feedback
                </Button>
              </form>
            </div>
          </div>

          {/* Right Column: Realistic Live Verification Terminal */}
          <div className="lg:col-span-5">
            <div className="bg-[#121418] border border-white/[0.1] rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 text-xs font-mono">
                <span className="text-ink-muted flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-botchain" />
                  <span>ROOM: presentation-7x2k</span>
                </span>
                <span className="text-[11px] text-botchain">ACTIVE</span>
              </div>

              <div>
                <p className="text-[10px] font-mono text-ink-muted uppercase">Prompt</p>
                <p className="text-xs font-semibold text-ink-primary mt-0.5">
                  "What could I improve about my presentation?"
                </p>
              </div>

              {/* Verified Feedback Entry */}
              <div className="bg-[#0A0B0D] border border-white/[0.08] rounded p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AnonymousIdentityBadge anonymousId="ANON-7F3A91" size="sm" />
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-feedback-positive border border-feedback-positive/20">
                      Positive
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-ink-muted">45m ago</span>
                </div>

                <p className="text-xs text-ink-primary leading-relaxed">
                  "Your presentation was clear, but the introduction could be shorter."
                </p>

                <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
                  <VerificationBadge
                    onClick={() => setInspectorOpen(true)}
                    networkName="BOTChain"
                  />
                </div>
              </div>

              <div className="text-[11px] font-mono text-ink-muted text-center pt-1">
                Recipient sees anonymous identity only.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Active Public Rooms Section (Direct Access for Submitters) */}
      {activeRooms.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="border-t border-white/[0.08] pt-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-ink-primary">
                  Open Feedback Rooms
                </h2>
                <p className="text-xs text-ink-secondary">
                  Choose a room to submit your anonymous thoughts.
                </p>
              </div>
              <span className="text-xs font-mono text-ink-muted">
                {activeRooms.length} active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeRooms.map(room => (
                <div
                  key={room.id}
                  className="bg-[#121418] border border-white/[0.08] hover:border-white/[0.2] rounded-lg p-5 flex flex-col justify-between gap-4 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-ink-muted">ID: {room.id}</span>
                      <span className="text-botchain">Open</span>
                    </div>
                    <h3 className="text-sm font-semibold text-ink-primary">{room.title}</h3>
                    <p className="text-xs text-ink-secondary italic">"{room.question}"</p>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-xs font-mono text-ink-muted">
                      {room.responseCount} {room.responseCount === 1 ? 'response' : 'responses'}
                    </span>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => onNavigate('submit', { roomId: room.id })}
                      rightIcon={<ExternalLink className="w-3 h-3" />}
                    >
                      Leave Feedback
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="border-t border-white/[0.08] pt-10">
          <div className="mb-8 space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-ink-primary">
              How it works
            </h2>
            <p className="text-xs text-ink-secondary">
              Three simple steps to collecting honest, verifiable feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 01 */}
            <div className="bg-[#121418] border border-white/[0.08] rounded-lg p-6 space-y-3">
              <div className="text-xs font-mono text-botchain font-bold">[ 01 ]</div>
              <h3 className="text-sm font-semibold text-ink-primary">Create a room</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Connect your wallet and create a feedback room with your specific question.
              </p>
            </div>

            {/* Step 02 */}
            <div className="bg-[#121418] border border-white/[0.08] rounded-lg p-6 space-y-3">
              <div className="text-xs font-mono text-botchain font-bold">[ 02 ]</div>
              <h3 className="text-sm font-semibold text-ink-primary">Share the link</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Send your unique feedback link or QR code to your audience or team.
              </p>
            </div>

            {/* Step 03 */}
            <div className="bg-[#121418] border border-white/[0.08] rounded-lg p-6 space-y-3">
              <div className="text-xs font-mono text-botchain font-bold">[ 03 ]</div>
              <h3 className="text-sm font-semibold text-ink-primary">Hear honest feedback</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                People respond using a randomly generated anonymous identity.
              </p>
              <div className="pt-2 border-t border-white/[0.04] flex items-center gap-1 text-[11px] text-ink-muted">
                <EyeOff className="w-3 h-3 text-botchain" />
                <span>Their wallet address stays hidden.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Inspection Modal */}
      <VerificationInspectorModal
        feedback={demoFeedbackItem}
        isOpen={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
      />
    </div>
  );
};
