import { AnonymousFeedback, FeedbackCategory, FeedbackRoom, OnChainVerification } from '../types';
import { botchainService } from './botchain';
import { computePayloadHash } from './crypto';

const ROOMS_STORAGE_KEY = 'anonbot_rooms_v3';
const FEEDBACK_STORAGE_KEY = 'anonbot_feedback_v3';

const INITIAL_ROOMS: FeedbackRoom[] = [
  {
    id: 'presentation-7x2k',
    title: 'Product Keynote & Architecture',
    question: 'What could I improve about my presentation?',
    creatorAddress: '0x3F2B771e8921B73e481F0e99B19C9194291FD6e1',
    createdAt: Date.now() - 3600000 * 4,
    isActive: true,
    responseCount: 1,
    settings: {
      allowMultiple: true,
      categories: ['positive', 'constructive', 'question'],
      requireProofVerification: true,
    },
  },
];

const INITIAL_FEEDBACK: AnonymousFeedback[] = [
  {
    id: 'demo-1',
    roomId: 'presentation-7x2k',
    anonymousId: 'ANON-7F3A91',
    content: 'Your presentation was clear, but the introduction could be shorter.',
    category: 'positive',
    createdAt: Date.now() - 45 * 60 * 1000,
    verification: {
      network: 'BOTChain Testnet',
      contractAddress: '0x7B891A4089c16Fe9e18b6dB390F8e3a2414A0b88',
      transactionHash: '0x8f4c28a9d31e9c5b248e3a70f612d4a5c9b8e7f123456789abcdef0123456789',
      blockNumber: 14892318,
      blockTimestamp: Date.now() - 45 * 60 * 1000,
      payloadHash: '0x3a9f1b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a',
      gasUsed: 49120,
      verified: true,
      status: 'confirmed',
    },
  },
];

export class StorageService {
  private static instance: StorageService;
  private changeListeners: (() => void)[] = [];

  private constructor() {
    this.initSeedData();
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private initSeedData() {
    if (typeof window === 'undefined') return;
    const existingRoomsRaw = localStorage.getItem(ROOMS_STORAGE_KEY);
    if (!existingRoomsRaw) {
      localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(INITIAL_ROOMS));
    } else {
      try {
        const parsed: FeedbackRoom[] = JSON.parse(existingRoomsRaw);
        if (!parsed.some(r => r.id === 'presentation-7x2k')) {
          parsed.unshift(INITIAL_ROOMS[0]);
          localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(parsed));
        }
      } catch {}
    }

    const existingFeedbackRaw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!existingFeedbackRaw) {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(INITIAL_FEEDBACK));
    } else {
      try {
        const parsed: AnonymousFeedback[] = JSON.parse(existingFeedbackRaw);
        if (!parsed.some(f => f.id === INITIAL_FEEDBACK[0].id)) {
          parsed.unshift(INITIAL_FEEDBACK[0]);
          localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(parsed));
        }
      } catch {}
    }
  }

  public subscribe(listener: () => void): () => void {
    this.changeListeners.push(listener);
    return () => {
      this.changeListeners = this.changeListeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.changeListeners.forEach(l => l());
  }

  public getRooms(): FeedbackRoom[] {
    if (typeof window === 'undefined') return INITIAL_ROOMS;
    try {
      const raw = localStorage.getItem(ROOMS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : INITIAL_ROOMS;
    } catch {
      return INITIAL_ROOMS;
    }
  }

  public getRoomById(roomId: string): FeedbackRoom | null {
    const rooms = this.getRooms();
    return rooms.find(r => r.id.toLowerCase() === roomId.toLowerCase()) || null;
  }

  public async createRoom(params: {
    title: string;
    question: string;
    creatorAddress: string;
    allowMultiple: boolean;
    categories: FeedbackCategory[];
    expirationHours?: number;
  }): Promise<FeedbackRoom> {
    const cleanTitle = params.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 16);
    
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const roomId = `${cleanTitle || 'room'}-${randomSuffix}`;

    const now = Date.now();
    const durationSeconds = params.expirationHours && params.expirationHours > 0
      ? params.expirationHours * 3600
      : 0;
    const expiresAt = durationSeconds > 0 ? now + durationSeconds * 1000 : undefined;

    await botchainService.anchorRoomCreation({
      roomId,
      title: params.title.trim(),
      question: params.question.trim(),
      durationSeconds,
      allowMultiple: params.allowMultiple,
    });

    const newRoom: FeedbackRoom = {
      id: roomId,
      title: params.title.trim(),
      question: params.question.trim(),
      creatorAddress: params.creatorAddress,
      createdAt: now,
      expiresAt: expiresAt,
      isActive: true,
      settings: {
        allowMultiple: params.allowMultiple,
        categories: params.categories.length > 0 ? params.categories : ['positive', 'constructive', 'question'],
        expirationHours: params.expirationHours,
        requireProofVerification: true,
      },
      responseCount: 0,
    };

    const rooms = this.getRooms();
    rooms.unshift(newRoom);
    if (typeof window !== 'undefined') {
      localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms));
    }

    this.notify();
    return newRoom;
  }

  public toggleRoomStatus(roomId: string): boolean {
    const rooms = this.getRooms();
    const room = rooms.find(r => r.id.toLowerCase() === roomId.toLowerCase());
    if (!room) return false;

    room.isActive = !room.isActive;
    if (typeof window !== 'undefined') {
      localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms));
    }
    this.notify();
    return room.isActive;
  }

  public getAllFeedback(): AnonymousFeedback[] {
    if (typeof window === 'undefined') return INITIAL_FEEDBACK;
    try {
      const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      return raw ? JSON.parse(raw) : INITIAL_FEEDBACK;
    } catch {
      return INITIAL_FEEDBACK;
    }
  }

  public getFeedbackForRoom(roomId: string): AnonymousFeedback[] {
    const all = this.getAllFeedback();
    return all.filter(f => f.roomId.toLowerCase() === roomId.toLowerCase());
  }

  public async submitFeedback(params: {
    roomId: string;
    anonymousId: string;
    content: string;
    category: FeedbackCategory;
  }): Promise<AnonymousFeedback> {
    const room = this.getRoomById(params.roomId);
    if (!room) throw new Error('Feedback room not found');
    if (!room.isActive) throw new Error('This feedback room is closed');
    if (room.expiresAt && Date.now() > room.expiresAt) throw new Error('This feedback room has expired');

    const timestamp = Date.now();
    
    const payloadHash = await computePayloadHash(
      params.content,
      params.roomId,
      params.anonymousId,
      timestamp
    );

    const verification = await botchainService.anchorFeedbackToBotchain({
      roomId: params.roomId,
      anonymousId: params.anonymousId,
      payloadHash,
      category: params.category,
      timestamp,
    });

    const newFeedback: AnonymousFeedback = {
      id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      roomId: params.roomId,
      anonymousId: params.anonymousId,
      content: params.content.trim(),
      category: params.category,
      createdAt: timestamp,
      verification,
    };

    const allFeedback = this.getAllFeedback();
    allFeedback.unshift(newFeedback);

    const rooms = this.getRooms();
    const targetRoom = rooms.find(r => r.id.toLowerCase() === params.roomId.toLowerCase());
    if (targetRoom) {
      targetRoom.responseCount = (targetRoom.responseCount || 0) + 1;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(allFeedback));
      localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms));
    }

    this.notify();
    return newFeedback;
  }

  public exportFeedback(roomId: string, format: 'json' | 'csv'): string {
    const feedbackList = this.getFeedbackForRoom(roomId);
    const room = this.getRoomById(roomId);

    if (format === 'json') {
      return JSON.stringify({
        room: room,
        exportTimestamp: new Date().toISOString(),
        verifiedOn: 'BOTChain Testnet',
        responses: feedbackList.map(f => ({
          anonymousId: f.anonymousId,
          category: f.category,
          content: f.content,
          submittedAt: new Date(f.createdAt).toISOString(),
          transactionHash: f.verification.transactionHash,
          blockNumber: f.verification.blockNumber,
          payloadHash: f.verification.payloadHash,
        })),
      }, null, 2);
    } else {
      const headers = ['Anonymous ID', 'Category', 'Feedback', 'Submitted Date', 'Tx Hash', 'Block Number', 'Payload Hash'];
      const rows = feedbackList.map(f => [
        `"${f.anonymousId}"`,
        `"${f.category}"`,
        `"${f.content.replace(/"/g, '""')}"`,
        `"${new Date(f.createdAt).toISOString()}"`,
        `"${f.verification.transactionHash}"`,
        `"${f.verification.blockNumber}"`,
        `"${f.verification.payloadHash}"`,
      ]);
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }
  }
}

export const storageService = StorageService.getInstance();
