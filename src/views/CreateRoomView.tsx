import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { FeedbackCategory, FeedbackRoom } from '../types';
import { storageService } from '../services/storage';
import { botchainService } from '../services/botchain';
import { useToast } from '../components/ui/Toast';
import { QrCodeModal } from '../components/feedback/QrCodeModal';
import { ArrowLeft, ArrowRight, Check, Copy, ExternalLink, QrCode, Clock } from 'lucide-react';

interface CreateRoomViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const CreateRoomView: React.FC<CreateRoomViewProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [allowMultiple, setAllowMultiple] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<FeedbackCategory[]>([
    'positive',
    'constructive',
    'question',
  ]);
  const [expirationHours, setExpirationHours] = useState<number>(0);

  // Completed Room State
  const [createdRoom, setCreatedRoom] = useState<FeedbackRoom | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const toggleCategory = (cat: FeedbackCategory) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length === 1) {
        showToast('At least one category is required', 'error');
        return;
      }
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!title.trim()) {
        showToast('Please enter what you want feedback on', 'error');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!question.trim()) {
        showToast('Please enter a specific question for your audience', 'error');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      handleCreateRoom();
    }
  };

  const handleCreateRoom = async () => {
    setIsSubmitting(true);
    try {
      let walletState = botchainService.getWalletState();
      if (!walletState.isConnected || !walletState.address) {
        walletState = await botchainService.connectWallet();
      }

      const creatorAddress = walletState.address || '0x3F2B771e8921B73e481F0e99B19C9194291FD6e1';

      const room = await storageService.createRoom({
        title,
        question,
        creatorAddress,
        allowMultiple,
        categories: selectedCategories,
        expirationHours: expirationHours > 0 ? expirationHours : undefined,
      });

      setCreatedRoom(room);
      setCurrentStep(4);
      showToast('Feedback room deployed on-chain', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create room', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getShareableUrl = (roomId: string) => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      return `${origin}/#room=${roomId}`;
    }
    return `https://anonbot.app/f/${roomId}`;
  };

  const handleCopyLink = () => {
    if (!createdRoom) return;
    const url = getShareableUrl(createdRoom.id);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    showToast('Feedback room link copied', 'info');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      {/* Progress Indicators */}
      <div>
        <div className="flex items-center justify-between text-xs font-mono text-ink-muted mb-2">
          <span>STEP 0{currentStep} / 04</span>
          <span>
            {currentStep === 1 && 'Topic'}
            {currentStep === 2 && 'Question'}
            {currentStep === 3 && 'Room Settings'}
            {currentStep === 4 && 'Room Ready'}
          </span>
        </div>
        <div className="w-full bg-[#121418] h-1 rounded overflow-hidden border border-white/[0.06]">
          <div
            className="bg-botchain h-full transition-all duration-200"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Wizard Box */}
      <div className="bg-[#121418] border border-white/[0.1] rounded-lg p-6 sm:p-8 space-y-6">
        {/* STEP 1: TOPIC */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-ink-primary">
                What do you want feedback on?
              </h2>
              <p className="text-xs text-ink-secondary">
                Give your feedback room a clear, recognizable name or topic.
              </p>
            </div>

            <Input
              label="Feedback Topic / Title"
              placeholder="e.g. Presentation on Q3 Architecture"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleNextStep()}
            />

            <div className="flex justify-between items-center pt-4 border-t border-white/[0.06]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('landing')}
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              >
                Cancel
              </Button>
              <Button
                size="md"
                onClick={handleNextStep}
                disabled={!title.trim()}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next Step
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: QUESTION */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-ink-primary">
                Ask a question
              </h2>
              <p className="text-xs text-ink-secondary">
                Prompt your audience with a direct question so they know what to focus on.
              </p>
            </div>

            <Textarea
              label="Room Question / Prompt"
              placeholder="e.g. What could I improve about the explanation?"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              autoFocus
              rows={4}
            />

            <div className="flex justify-between items-center pt-4 border-t border-white/[0.06]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep(1)}
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              >
                Back
              </Button>
              <Button
                size="md"
                onClick={handleNextStep}
                disabled={!question.trim()}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Configure Settings
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: SETTINGS */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-ink-primary">
                Room Settings
              </h2>
              <p className="text-xs text-ink-secondary">
                Configure response categories and submission options.
              </p>
            </div>

            {/* Allowed Categories */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-ink-secondary">
                Allowed Feedback Categories
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'positive', label: 'Positive' },
                  { id: 'constructive', label: 'Constructive' },
                  { id: 'question', label: 'Question' },
                ].map(cat => {
                  const isSelected = selectedCategories.includes(cat.id as FeedbackCategory);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id as FeedbackCategory)}
                      className={`p-2.5 rounded border text-xs font-medium text-center transition-colors flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-white/[0.1] border-white/[0.3] text-ink-primary'
                          : 'bg-[#0A0B0D] border-white/[0.08] text-ink-secondary hover:text-ink-primary'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-botchain" />}
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Multiple Responses Toggle */}
            <div className="p-3 bg-[#0A0B0D] border border-white/[0.08] rounded flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-ink-primary">Allow multiple responses</p>
                <p className="text-[11px] text-ink-secondary mt-0.5">
                  Participants can submit more than one feedback entry.
                </p>
              </div>
              <input
                type="checkbox"
                checked={allowMultiple}
                onChange={e => setAllowMultiple(e.target.checked)}
                className="w-4 h-4 rounded accent-botchain cursor-pointer"
              />
            </div>

            {/* Room Expiration */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-ink-secondary flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-botchain" />
                <span>Room Expiration</span>
              </label>
              <select
                value={expirationHours}
                onChange={e => setExpirationHours(Number(e.target.value))}
                className="w-full bg-[#0A0B0D] border border-white/[0.1] rounded px-3 py-2 text-xs text-ink-primary focus:outline-none focus:border-white/[0.25]"
              >
                <option value={0}>Never expire</option>
                <option value={24}>24 hours</option>
                <option value={72}>3 days (72 hours)</option>
                <option value={168}>7 days (168 hours)</option>
                <option value={720}>30 days (720 hours)</option>
              </select>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/[0.06]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep(2)}
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              >
                Back
              </Button>
              <Button
                size="md"
                onClick={handleNextStep}
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Deploy Room
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: PREVIEW & SHARE */}
        {currentStep === 4 && createdRoom && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="space-y-2">
              <div className="text-xs font-mono text-botchain flex items-center gap-1.5">
                <Check className="w-4 h-4 text-botchain" />
                <span>DEPLOYED ON-CHAIN</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-ink-primary">
                Your feedback room is ready.
              </h2>
              <p className="text-xs text-ink-secondary">
                Share this link with your audience to start collecting anonymous responses.
              </p>
            </div>

            {/* Room Summary Box */}
            <div className="bg-[#0A0B0D] border border-white/[0.08] rounded p-5 space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-botchain">
                  Room: {createdRoom.id}
                </span>
                <h3 className="text-base font-semibold text-ink-primary mt-0.5">{createdRoom.title}</h3>
                <p className="text-xs text-ink-secondary mt-1 italic">"{createdRoom.question}"</p>
              </div>

              {/* Shareable URL Bar */}
              <div className="pt-3 border-t border-white/[0.06]">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1.5">
                  Shareable Link
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#121418] border border-white/[0.1] rounded px-3 py-2 text-xs font-mono text-ink-primary truncate">
                    {getShareableUrl(createdRoom.id)}
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleCopyLink}
                    leftIcon={copiedLink ? <Check className="w-3.5 h-3.5 text-botchain" /> : <Copy className="w-3.5 h-3.5" />}
                  >
                    {copiedLink ? 'Copied' : 'Copy'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowQrModal(true)}
                    title="Show QR Code"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                variant="primary"
                onClick={() => onNavigate('submit', { roomId: createdRoom.id })}
                rightIcon={<ExternalLink className="w-4 h-4" />}
              >
                Open Room (Submitter View)
              </Button>
              <Button
                variant="secondary"
                onClick={() => onNavigate('room-results', { roomId: createdRoom.id })}
              >
                View Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Share Modal */}
      {createdRoom && (
        <QrCodeModal
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
          url={getShareableUrl(createdRoom.id)}
          roomTitle={createdRoom.title}
        />
      )}
    </div>
  );
};
