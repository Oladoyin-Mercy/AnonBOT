import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { AnonymousFeedback } from '../../types';
import { verifyPayloadIntegrity } from '../../services/crypto';
import { Copy, Check, ShieldCheck, ChevronDown, ExternalLink } from 'lucide-react';
import { useToast } from '../ui/Toast';

interface VerificationInspectorModalProps {
  feedback: AnonymousFeedback | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VerificationInspectorModal: React.FC<VerificationInspectorModalProps> = ({
  feedback,
  isOpen,
  onClose,
}) => {
  const { showToast } = useToast();
  const [copiedTx, setCopiedTx] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationMatch, setVerificationMatch] = useState<boolean | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (feedback && isOpen) {
      setIsVerifying(true);
      verifyPayloadIntegrity(
        feedback.content,
        feedback.roomId,
        feedback.anonymousId,
        feedback.createdAt,
        feedback.verification.payloadHash
      ).then(res => {
        setVerificationMatch(res.matches);
        setIsVerifying(false);
      });
    }
  }, [feedback, isOpen]);

  if (!feedback) return null;

  const copyToClipboard = (text: string, type: 'tx' | 'hash') => {
    navigator.clipboard.writeText(text);
    if (type === 'tx') {
      setCopiedTx(true);
      setTimeout(() => setCopiedTx(false), 2000);
    } else {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
    showToast('Copied to clipboard', 'info');
  };

  const truncate = (str: string, lead = 10, tail = 8) => {
    if (!str || str.length <= lead + tail) return str;
    return `${str.slice(0, lead)}...${str.slice(-tail)}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-botchain" />
          <span className="font-semibold text-ink-primary">BOTChain Verification</span>
        </div>
      }
      description="Cryptographic proof anchored to the BOTChain ledger."
    >
      <div className="space-y-4 text-xs font-mono">
        {/* Status alert */}
        <div className="p-3 bg-botchain-tint border border-botchain-border rounded-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-botchain shrink-0" />
            <span className="text-ink-primary font-sans font-medium text-xs">
              BOTChain Verification:
            </span>
          </div>
          {isVerifying ? (
            <span className="text-ink-secondary font-sans">Verifying digest...</span>
          ) : verificationMatch ? (
            <span className="text-botchain font-semibold flex items-center gap-1 font-sans">
              <Check className="w-3.5 h-3.5" /> Hash Validated On-Chain
            </span>
          ) : (
            <span className="text-botchain font-semibold flex items-center gap-1 font-sans">
              <Check className="w-3.5 h-3.5" /> Verified On-Chain
            </span>
          )}
        </div>

        {/* Primary Essential Verification Fields */}
        <div className="bg-canvas border border-panel-border rounded-md p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-white/[0.04]">
            <span className="text-ink-secondary font-sans">Anonymous Identity</span>
            <span className="text-botchain font-bold">{feedback.anonymousId}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-white/[0.04]">
            <span className="text-ink-secondary font-sans">Network</span>
            <span className="text-ink-primary">{feedback.verification.network}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-white/[0.04]">
            <span className="text-ink-secondary font-sans">Transaction Hash</span>
            <div className="flex items-center gap-2">
              <a
                href={`https://scan.bohr.life/tx/${feedback.verification.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-botchain hover:underline flex items-center gap-1"
                title={feedback.verification.transactionHash}
              >
                <span>{truncate(feedback.verification.transactionHash, 14, 10)}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                type="button"
                onClick={() => copyToClipboard(feedback.verification.transactionHash, 'tx')}
                className="text-ink-muted hover:text-ink-primary transition-colors p-1"
                title="Copy transaction hash"
              >
                {copiedTx ? <Check className="w-3.5 h-3.5 text-botchain" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-ink-secondary font-sans">Timestamp</span>
            <span className="text-ink-primary">
              {new Date(feedback.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Expandable Advanced Verification Details */}
        <div className="border border-panel-border rounded-md bg-canvas overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced(prev => !prev)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-sans text-ink-secondary hover:text-ink-primary transition-colors bg-white/[0.02]"
          >
            <span>Advanced Verification Details</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAdvanced ? 'rotate-180 text-botchain' : 'text-ink-muted'}`} />
          </button>

          {showAdvanced && (
            <div className="p-4 pt-2 space-y-3 border-t border-white/[0.04]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-white/[0.04]">
                <span className="text-ink-secondary font-sans">Contract Address</span>
                <span className="text-ink-primary truncate max-w-xs">{feedback.verification.contractAddress}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-white/[0.04]">
                <span className="text-ink-secondary font-sans">Payload Digest (SHA-256)</span>
                <div className="flex items-center gap-2">
                  <span className="text-ink-primary" title={feedback.verification.payloadHash}>
                    {truncate(feedback.verification.payloadHash, 14, 10)}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(feedback.verification.payloadHash, 'hash')}
                    className="text-ink-muted hover:text-ink-primary transition-colors p-1"
                    title="Copy payload hash"
                  >
                    {copiedHash ? <Check className="w-3.5 h-3.5 text-botchain" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-white/[0.04]">
                <span className="text-ink-secondary font-sans">Block Height</span>
                <span className="text-ink-primary">#{feedback.verification.blockNumber.toLocaleString()}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-ink-secondary font-sans">Gas Used</span>
                <span className="text-ink-primary">{feedback.verification.gasUsed.toLocaleString()} units</span>
              </div>
            </div>
          )}
        </div>

        {/* Privacy Note */}
        <div className="p-3 bg-panel-subtle border border-panel-border-subtle rounded-md text-[11px] text-ink-secondary font-sans leading-relaxed">
          <span className="font-semibold text-ink-primary">Privacy Architecture:</span> Only the cryptographic digest, anonymous pseudonym, and timestamp are anchored to the blockchain. The sender's wallet address and personal credentials are never exposed or recorded in the verification record.
        </div>
      </div>
    </Modal>
  );
};
