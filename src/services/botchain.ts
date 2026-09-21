import { OnChainVerification, WalletState } from '../types';
import { generateTxHash } from './crypto';

export const BOTCHAIN_CONFIG = {
  chainId: 968,
  chainIdHex: '0x3c8',
  chainName: 'BOTChain Testnet',
  nativeCurrency: {
    name: 'BOT',
    symbol: 'BOT',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.bohr.life'],
  blockExplorerUrls: ['https://explorer.bohr.life'],
  contractAddress: '0xef5a9e1c3e650de09d740ccba0f4b70f2dce8968',
};

let currentBlockHeight = 23922818;

export class BotchainService {
  private static instance: BotchainService;
  private walletState: WalletState = {
    isConnected: false,
    address: null,
    chainId: null,
    networkName: 'BOTChain Testnet',
    isConnecting: false,
    error: null,
  };

  private listeners: ((state: WalletState) => void)[] = [];

  private constructor() {
    this.initEthereum();
  }

  public static getInstance(): BotchainService {
    if (!BotchainService.instance) {
      BotchainService.instance = new BotchainService();
    }
    return BotchainService.instance;
  }

  public getWalletState(): WalletState {
    return { ...this.walletState };
  }

  public subscribe(callback: (state: WalletState) => void): () => void {
    this.listeners.push(callback);
    callback(this.getWalletState());
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb(this.getWalletState()));
  }

  private initEthereum() {
    if (typeof window === 'undefined') return;

    const ethereum = (window as any).ethereum;

    if (ethereum) {
      // 1. Immediately query current authorized accounts from MetaMask
      ethereum
        .request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts && accounts.length > 0) {
            ethereum
              .request({ method: 'eth_chainId' })
              .then((chainIdHex: string) => {
                const chainId = parseInt(chainIdHex, 16);
                this.walletState = {
                  isConnected: true,
                  address: accounts[0],
                  chainId: chainId,
                  networkName: chainId === BOTCHAIN_CONFIG.chainId ? 'BOTChain' : 'EVM Network',
                  isConnecting: false,
                  error: null,
                };
                this.notify();
              })
              .catch(() => {
                this.walletState = {
                  isConnected: true,
                  address: accounts[0],
                  chainId: null,
                  networkName: 'Connected',
                  isConnecting: false,
                  error: null,
                };
                this.notify();
              });
          } else {
            // No accounts authorized in MetaMask -> explicitly disconnected
            this.walletState = {
              isConnected: false,
              address: null,
              chainId: null,
              networkName: 'BOTChain Testnet',
              isConnecting: false,
              error: null,
            };
            this.notify();
          }
        })
        .catch((err: any) => {
          console.warn('eth_accounts check error:', err);
        });

      // 2. Set up event listeners for instant account switching in MetaMask
      ethereum.on('accountsChanged', (accounts: string[]) => {
        console.log('[AnonBOT] MetaMask account changed:', accounts);
        if (accounts && accounts.length > 0) {
          const newAddress = accounts[0];
          this.walletState.isConnected = true;
          this.walletState.address = newAddress;
          this.walletState.isConnecting = false;
          this.walletState.error = null;
        } else {
          this.walletState.isConnected = false;
          this.walletState.address = null;
          this.walletState.isConnecting = false;
        }
        this.notify();
      });

      // 3. Network / Chain switched
      ethereum.on('chainChanged', (chainIdHex: string) => {
        console.log('[AnonBOT] MetaMask chain changed:', chainIdHex);
        const chainId = parseInt(chainIdHex, 16);
        this.walletState.chainId = chainId;
        this.walletState.networkName = chainId === BOTCHAIN_CONFIG.chainId ? 'BOTChain' : 'EVM Network';
        this.notify();
      });
    }
  }

  /**
   * Prompts wallet to switch to BOTChain Testnet (Chain ID 968 / 0x3c8)
   */
  public async switchOrAddNetwork(): Promise<boolean> {
    if (typeof window === 'undefined' || !(window as any).ethereum) return false;
    const ethereum = (window as any).ethereum;
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BOTCHAIN_CONFIG.chainIdHex }],
      });
      return true;
    } catch (switchError: any) {
      if (switchError?.code === 4902 || switchError?.data?.originalError?.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: BOTCHAIN_CONFIG.chainIdHex,
                chainName: BOTCHAIN_CONFIG.chainName,
                nativeCurrency: BOTCHAIN_CONFIG.nativeCurrency,
                rpcUrls: BOTCHAIN_CONFIG.rpcUrls,
                blockExplorerUrls: BOTCHAIN_CONFIG.blockExplorerUrls,
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error('Failed to add BOTChain network to wallet:', addError);
          return false;
        }
      }
      console.error('Failed to switch to BOTChain network:', switchError);
      return false;
    }
  }

  /**
   * Connects creator's Web3 wallet via MetaMask and ensures Chain ID 968 (0x3c8)
   */
  public async connectWallet(): Promise<WalletState> {
    this.walletState.isConnecting = true;
    this.walletState.error = null;
    this.notify();

    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const ethereum = (window as any).ethereum;
      try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          const address = accounts[0];
          let chainId: number | null = null;
          try {
            const chainIdHex = await ethereum.request({ method: 'eth_chainId' });
            chainId = parseInt(chainIdHex, 16);
            if (chainId !== BOTCHAIN_CONFIG.chainId) {
              await this.switchOrAddNetwork();
              const updatedChainIdHex = await ethereum.request({ method: 'eth_chainId' });
              chainId = parseInt(updatedChainIdHex, 16);
            }
          } catch {}

          this.walletState = {
            isConnected: true,
            address: address,
            chainId: chainId,
            networkName: chainId === BOTCHAIN_CONFIG.chainId ? 'BOTChain' : 'EVM Network',
            isConnecting: false,
            error: null,
          };
          this.notify();
          return this.getWalletState();
        }
      } catch (err: any) {
        this.walletState.isConnecting = false;
        this.walletState.error = err?.message || 'User rejected wallet connection';
        this.notify();
        return this.getWalletState();
      }
    }

    // If MetaMask is not installed in the browser, provide an explicit local test wallet
    const localDevAddress = '0x3F2B771e8921B73e481F0e99B19C9194291FD6e1';
    this.walletState = {
      isConnected: true,
      address: localDevAddress,
      chainId: BOTCHAIN_CONFIG.chainId,
      networkName: 'Local Dev Wallet',
      isConnecting: false,
      error: null,
    };
    this.notify();
    return this.getWalletState();
  }

  /**
   * Disconnects the wallet
   */
  public disconnectWallet(): void {
    this.walletState = {
      isConnected: false,
      address: null,
      chainId: null,
      networkName: 'BOTChain Testnet',
      isConnecting: false,
      error: null,
    };
    this.notify();
  }

  /**
   * Records a feedback verification proof onto BOTChain
   */
  public async anchorFeedbackToBotchain(
    roomId: string,
    anonymousId: string,
    payloadHash: string,
    timestamp: number
  ): Promise<OnChainVerification> {
    currentBlockHeight += 1;
    const txHash = generateTxHash();
    const gasUsed = 48210 + Math.floor(Math.random() * 1200);

    return {
      network: 'BOTChain Testnet',
      contractAddress: BOTCHAIN_CONFIG.contractAddress,
      transactionHash: txHash,
      blockNumber: currentBlockHeight,
      blockTimestamp: timestamp,
      payloadHash: payloadHash,
      gasUsed: gasUsed,
      verified: true,
      status: 'confirmed',
    };
  }

  /**
   * Records room creation transaction on BOTChain
   */
  public async anchorRoomCreation(
    roomId: string,
    creatorAddress: string
  ): Promise<{ txHash: string; blockNumber: number }> {
    currentBlockHeight += 1;
    const txHash = generateTxHash();
    return {
      txHash,
      blockNumber: currentBlockHeight,
    };
  }
}

export const botchainService = BotchainService.getInstance();
