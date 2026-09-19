export type FeedbackCategory = 'positive' | 'constructive' | 'question' | 'general';

export interface RoomSettings {
  allowMultiple: boolean;
  categories: FeedbackCategory[];
  expirationHours?: number; // 0 or undefined for never
  requireProofVerification: boolean;
}

export interface FeedbackRoom {
  id: string; // e.g. "presentation-7x2k"
  title: string;
  question: string;
  creatorAddress: string;
  createdAt: number; // unix timestamp in ms
  expiresAt?: number; // unix timestamp in ms
  isActive: boolean;
  settings: RoomSettings;
  responseCount: number;
}

export interface OnChainVerification {
  network: string; // "BOTChain Mainnet" | "BOTChain Testnet"
  contractAddress: string;
  transactionHash: string;
  blockNumber: number;
  blockTimestamp: number;
  payloadHash: string; // 0x... sha256
  gasUsed: number;
  verified: boolean;
  status: 'confirmed' | 'pending' | 'failed';
}

export interface AnonymousFeedback {
  id: string; // unique feedback uuid
  roomId: string;
  anonymousId: string; // e.g. "ANON-7F3A91"
  content: string;
  category: FeedbackCategory;
  createdAt: number;
  verification: OnChainVerification;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  networkName: string;
  isConnecting: boolean;
  error: string | null;
}

export interface VerificationResult {
  isValid: boolean;
  computedHash: string;
  onChainHash: string;
  blockNumber: number;
  blockTimestamp: number;
  anonymousId: string;
  roomId: string;
}
