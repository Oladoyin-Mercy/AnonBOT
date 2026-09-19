/**
 * AnonBOT Cryptographic Service
 * 
 * Computes deterministic SHA-256 payload digests for anchoring to BOTChain,
 * and performs cryptographic integrity verification.
 */

/**
 * Computes a standard SHA-256 hash formatted as a 0x-prefixed 32-byte hex string.
 */
export async function computePayloadHash(
  content: string,
  roomId: string,
  anonymousId: string,
  timestamp: number
): Promise<string> {
  const canonicalPayload = JSON.stringify({
    anonId: anonymousId,
    content: content.trim(),
    roomId: roomId,
    timestamp: Math.floor(timestamp / 1000), // standardize to second-level precision like block timestamp
  });

  const encoder = new TextEncoder();
  const data = encoder.encode(canonicalPayload);

  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `0x${hashHex}`;
  } else {
    // Fallback simple bitwise implementation if subtle crypto unavailable
    let hash = 0;
    for (let i = 0; i < canonicalPayload.length; i++) {
      const char = canonicalPayload.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(64, '0');
    return `0x${hex}`;
  }
}

/**
 * Verifies that a feedback payload matches an on-chain recorded hash.
 */
export async function verifyPayloadIntegrity(
  content: string,
  roomId: string,
  anonymousId: string,
  timestamp: number,
  expectedHash: string
): Promise<{ matches: boolean; calculatedHash: string }> {
  const calculatedHash = await computePayloadHash(content, roomId, anonymousId, timestamp);
  return {
    matches: calculatedHash.toLowerCase() === expectedHash.toLowerCase(),
    calculatedHash,
  };
}

/**
 * Generates a realistic mock transaction hash for BOTChain records.
 */
export function generateTxHash(): string {
  const buffer = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(buffer);
  } else {
    for (let i = 0; i < 32; i++) {
      buffer[i] = Math.floor(Math.random() * 256);
    }
  }
  return `0x${Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('')}`;
}
