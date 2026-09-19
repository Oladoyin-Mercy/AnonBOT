import React, { useState, useEffect } from 'react';
import { FeedbackCategory, FeedbackRoom, AnonymousFeedback } from '../types';
import { storageService } from '../services/storage';
import { getOrCreateRoomIdentity, regenerateRoomIdentity } from '../services/identity';
import { computePayloadHash } from '../services/crypto';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Input';
import { AnonymousIdentityBadge } from '../components/feedback/AnonymousIdentityBadge';
import { VerificationBadge } from '../components/feedback/VerificationBadge';
import { VerificationInspectorModal } from '../components/feedback/VerificationInspectorModal';
import { useToast } from '../components/ui/Toast';
import { Send, Check, Lock, RefreshCw, AlertCircle } from 'lucide-react';

interface FeedbackSubmissionViewProps {
  roomId: string;
  onNavigate: (view: string, params?: any) => void;
}

export const FeedbackSubmissionView: React.FC<FeedbackSubmissionViewProps> = ({
  roomId,
  onNavigate,
}) => {
  const { showToast } = useToast();
  const [room, setRoom] = useState<FeedbackRoom | null>(null);
  const [anonymousId, setAnonymousId] = useState<string>('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<FeedbackCategory>('positive');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedFeedback, setSubmittedFeedback] = useState<AnonymousFeedback | null>(null);
  const [liveHash, setLiveHash] = useState<string>('');
  const [inspectorOpen, setInspectorOpen] = useState(false);

  useEffect(() => {
    const r = storageService.getRoomById(roomId);
    setRoom(r);
    if (r) {
      const id = getOrCreateRoomIdentity(roomId);
      setAnonymousId(id);
      if (r.settings.categories && r.settings.categories.length > 0) {
        setCategory(r.settings.categories[0]);
      }
    }
  }, [roomId]);

  useEffect(() => {
    if (content.trim() && room && anonymousId) {
      computePayloadHash(content, roomId, anonymousId, Date.now()).then(hash => {
        setLiveHash(hash);
      });
    } else {
      setLiveHash('');
    }
  }, [content, roomId, anonymousId, room]);

  const handleRegenerateIdentity = () => {
    const newId = regenerateRoomIdentity(roomId);
    setAnonymousId(newId);
    showToast(`New anonymous pseudonym generated: ${newId}`, 'info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      showToast('Please enter your feedback', 'error');
      return;
    }
    if (!room) {
      showToast('Room not found', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await storageService.submitFeedback({
        roomId,
        anonymousId,
        content: content.trim(),
        category,
      });

      setSubmittedFeedback(result);
      showToast('Feedback submitted and recorded on-chain', 'success');
    } catch (err: any) {
      showToast(err.message || 'Something went wrong while sending your feedback. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForAnother = () => {
    setContent('');
    setSubmittedFeedback(null);
  };

  if (!room) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto">
          <AlertCircle className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-bold text-ink-primary">Room Not Found</h2>
        <p className="text-xs text-ink-secondary">
          Room identifier "<span className="font-mono text-ink-primary">{roomId}</span>" does not exist.
        </p>
        <Button variant="secondary" size="sm" onClick={() => onNavigate('landing')}>
          Return Home
        </Button>
      </div>
    );
  }

  if (!room.isActive) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 rounded bg-[#121418] border border-white/[0.1] flex items-center justify-center text-ink-muted mx-auto">
          <Lock className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-bold text-ink-primary">Room Closed</h2>
        <p className="text-xs text-ink-secondary">
          The creator of "{room.title}" has closed this room to new submissions.
        </p>
        <Button variant="secondary" size="sm" onClick={() => onNavigate('landing')}>
          Return Home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      {/* Header bar */}
      <div className="space-y-1">
        <div className="text-xs font-mono text-botchain uppercase tracking-wider">
          Give anonymous feedback
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink-primary">
          {room.title}
        </h1>
        <p className="text-sm text-ink-secondary mt-1">
          {room.question}
        </p>
      </div>

      {/* Main Form Container */}
      <div className="bg-[#121418] border border-white/[0.1] rounded-lg p-6 sm:p-7 space-y-6">
        {submittedFeedback ? (
          /* Post-submission Success Receipt */
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-botchain">
                <Check className="w-4 h-4 text-botchain" />
                <span>CONFIRMED ON-CHAIN</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-ink-primary">
                Feedback sent.
              </h2>
              <p className="text-xs text-ink-secondary">
                Your response was recorded with zero personal or wallet data exposed.
              </p>
            </div>

            {/* Receipt Box */}
            <div className="bg-[#0A0B0D] border border-white/[0.08] rounded p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-ink-secondary">Pseudonym:</span>
                <AnonymousIdentityBadge anonymousId={submittedFeedback.anonymousId} size="sm" />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-ink-secondary">Category:</span>
                <span className="text-ink-primary capitalize">{submittedFeedback.category}</span>
              </div>

              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                <VerificationBadge
                  onClick={() => setInspectorOpen(true)}
                  networkName="BOTChain"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              {room.settings.allowMultiple && (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleResetForAnother}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Send Another Feedback
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onNavigate('landing')}
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          /* Submission Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Anonymous Identity Box */}
            <div className="p-3.5 bg-[#0A0B0D] border border-white/[0.08] rounded flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-ink-muted uppercase">Your Pseudonym:</span>
                  <AnonymousIdentityBadge
                    anonymousId={anonymousId}
                    onRegenerate={handleRegenerateIdentity}
                    size="sm"
                  />
                </div>
                <p className="text-[11px] text-ink-muted">
                  Hidden from creator. Generated specifically for this room.
                </p>
              </div>
            </div>

            {/* Category Selector */}
            {room.settings.categories && room.settings.categories.length > 1 && (
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-ink-secondary">
                  Feedback Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {room.settings.categories.map(cat => {
                    const isSelected = category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`p-2 rounded text-xs font-medium text-center transition-colors capitalize ${
                          isSelected
                            ? 'bg-white/[0.1] text-ink-primary border border-white/[0.25]'
                            : 'bg-[#0A0B0D] border border-white/[0.08] text-ink-secondary hover:text-ink-primary'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Feedback Content Textarea */}
            <div className="space-y-1.5">
              <Textarea
                label="Your Feedback"
                placeholder="Write your honest, candid feedback here..."
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={5}
                required
                characterCount={content.length}
                maxCharacters={1000}
              />
            </div>

            {/* Live SHA-256 Digest Preview */}
            {liveHash && (
              <div className="px-3 py-2 bg-[#0A0B0D] border border-white/[0.06] rounded text-[11px] font-mono text-ink-muted flex items-center justify-between gap-2">
                <span className="shrink-0 text-ink-secondary">Payload Digest:</span>
                <span className="truncate text-ink-primary">{liveHash}</span>
              </div>
            )}

            {/* Submit CTA */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                size="md"
                isLoading={isSubmitting}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Send anonymously
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Verification Inspector Modal */}
      {submittedFeedback && (
        <VerificationInspectorModal
          feedback={submittedFeedback}
          isOpen={inspectorOpen}
          onClose={() => setInspectorOpen(false)}
        />
      )}
    </div>
  );
};
