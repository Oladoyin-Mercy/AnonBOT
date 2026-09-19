import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Modal } from '../ui/Modal';
import { Copy, Check, QrCode as QrIcon } from 'lucide-react';
import { useToast } from '../ui/Toast';
import { Button } from '../ui/Button';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  roomTitle: string;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  url,
  roomTitle,
}) => {
  const { showToast } = useToast();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (url && isOpen) {
      QRCode.toDataURL(url, {
        width: 280,
        margin: 2,
        color: {
          dark: '#0A0B0D',
          light: '#F3F4F6',
        },
      })
        .then(data => setQrDataUrl(data))
        .catch(err => console.error('Failed to generate QR code', err));
    }
  }, [url, isOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    showToast('Feedback room link copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm"
      title={
        <div className="flex items-center gap-2">
          <QrIcon className="w-5 h-5 text-botchain" />
          <span className="font-semibold text-ink-primary">Share Feedback Room</span>
        </div>
      }
      description={`Scan to submit anonymous feedback to "${roomTitle}"`}
    >
      <div className="flex flex-col items-center justify-center space-y-4 py-2">
        {/* QR Code Canvas */}
        <div className="p-3 bg-ink-primary rounded-lg border border-white/20 shadow-md">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="Room QR Code" className="w-56 h-56 rounded" />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-ink-muted text-xs">
              Generating QR Code...
            </div>
          )}
        </div>

        {/* URL Pill */}
        <div className="w-full bg-canvas border border-panel-border rounded-md px-3 py-2 text-xs font-mono text-ink-secondary flex items-center justify-between gap-2 overflow-hidden">
          <span className="truncate">{url}</span>
          <button
            onClick={handleCopy}
            className="p-1 hover:text-ink-primary text-ink-muted transition-colors shrink-0"
            title="Copy URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-botchain" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <Button
          onClick={handleCopy}
          variant="secondary"
          className="w-full"
          leftIcon={copied ? <Check className="w-4 h-4 text-botchain" /> : <Copy className="w-4 h-4" />}
        >
          {copied ? 'Copied Link' : 'Copy Feedback Link'}
        </Button>
      </div>
    </Modal>
  );
};
