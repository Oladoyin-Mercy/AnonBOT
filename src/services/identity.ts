/**
 * AnonBOT Anonymous Identity Engine
 * 
 * Generates and securely manages room-scoped pseudonymous identifiers (e.g. "ANON-7F3A91").
 * Guarantees:
 * - Scoped per room: Different rooms yield distinct anonymous pseudonyms.
 * - Non-sequential & unpredictable: Generated via cryptographic entropy.
 * - Local-first persistence: Retains room identity across reloads without exposing wallet/profile.
 */

const STORAGE_PREFIX = 'anonbot_identity_';

/**
 * Generates a random, high-entropy anonymous pseudonym.
 * Format: ANON-[6 hex characters] (e.g. "ANON-7F3A91")
 */
export function generateAnonymousId(): string {
  // Use crypto.getRandomValues for high entropy
  const buffer = new Uint8Array(3);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(buffer);
  } else {
    for (let i = 0; i < 3; i++) {
      buffer[i] = Math.floor(Math.random() * 256);
    }
  }

  const hex = Array.from(buffer)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();

  return `ANON-${hex}`;
}

/**
 * Retrieves the stored anonymous identity for a specific room, or generates and saves a new one.
 * @param roomId The room identifier
 * @returns The anonymous identifier string (e.g. "ANON-7F3A91")
 */
export function getOrCreateRoomIdentity(roomId: string): string {
  if (typeof window === 'undefined') {
    return generateAnonymousId();
  }

  const key = `${STORAGE_PREFIX}${roomId}`;
  const existingId = localStorage.getItem(key);

  if (existingId && existingId.startsWith('ANON-')) {
    return existingId;
  }

  const newId = generateAnonymousId();
  localStorage.setItem(key, newId);
  return newId;
}

/**
 * Regenerates a new anonymous identity for the specified room.
 * @param roomId The room identifier
 * @returns The new anonymous identifier
 */
export function regenerateRoomIdentity(roomId: string): string {
  const newId = generateAnonymousId();
  if (typeof window !== 'undefined') {
    const key = `${STORAGE_PREFIX}${roomId}`;
    localStorage.setItem(key, newId);
  }
  return newId;
}

/**
 * Clears the stored anonymous identity for a room.
 */
export function clearRoomIdentity(roomId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`${STORAGE_PREFIX}${roomId}`);
  }
}
