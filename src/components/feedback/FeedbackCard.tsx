import React, { useState } from 'react';
import { AnonymousFeedback } from '../../types';
import { AnonymousIdentityBadge } from './AnonymousIdentityBadge';
import { Badge } from '../ui/Badge';
import { VerificationBadge } from './VerificationBadge';
import { VerificationInspectorModal } from './VerificationInspectorModal';

interface FeedbackCardProps {
  feedback: AnonymousFeedback;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({ feedback }) => {
  const [showInspector, setShowInspector] = useState(false);

  const getCategoryVariant = (category: string) => {
    switch (category) {
      case 'positive':
        return 'positive';
      case 'constructive':
        return 'constructive';
      case 'question':
        return 'question';
      default:
        return 'default';
    }
  };

  const formatRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'yesterday';
    return `${days}d ago`;
  };

  return (
    <>
      <div className="bg-panel border border-panel-border rounded-lg p-5 transition-all duration-150 hover:border-panel-border-focus flex flex-col justify-between gap-4">
        {/* Header: Anonymous ID + Category & Timestamp */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2.5">
            <AnonymousIdentityBadge anonymousId={feedback.anonymousId} size="sm" />
            <Badge variant={getCategoryVariant(feedback.category)} size="sm">
              {feedback.category.charAt(0).toUpperCase() + feedback.category.slice(1)}
            </Badge>
          </div>
          <span className="text-xs text-ink-muted font-mono" title={new Date(feedback.createdAt).toLocaleString()}>
            {formatRelativeTime(feedback.createdAt)}
          </span>
        </div>

        {/* Content body */}
        <div className="text-sm text-ink-primary font-sans leading-relaxed whitespace-pre-wrap">
          "{feedback.content}"
        </div>

        {/* Footer: On-chain verification state */}
        <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
          <VerificationBadge
            onClick={() => setShowInspector(true)}
            networkName="BOTChain"
          />
        </div>
      </div>

      <VerificationInspectorModal
        feedback={feedback}
        isOpen={showInspector}
        onClose={() => setShowInspector(false)}
      />
    </>
  );
};
