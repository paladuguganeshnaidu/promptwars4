// Firestore access with graceful degradation. The client is created once at
// module scope and reused across requests; on Cloud Run it authenticates via
// the service account. If the Firestore API is disabled, operations fall back
// to mock data instead of crashing the server.
import { Firestore } from '@google-cloud/firestore';

import { logger } from './logger.js';

/** Firestore collection names used by the operations feature. */
export const COLLECTIONS = {
  zones: 'zones',
  incidents: 'incidents',
  sustainability: 'sustainability',
} as const;

/** Document id of the single sustainability metrics document. */
export const SUSTAINABILITY_DOC_ID = 'current';

let client: Firestore | undefined;
let isAvailable = true;

/** Returns true if Firestore API is available, false if disabled or unreachable. */
export function isFirestoreAvailable(): boolean {
  return isAvailable;
}

/**
 * Returns the shared Firestore client, creating it on first use.
 * Throws if Firestore API is unavailable.
 */
export function getFirestore(): Firestore {
  if (!isAvailable) {
    throw new Error('Firestore API is not available (disabled or permission denied)');
  }
  if (client === undefined) {
    try {
      client = new Firestore();
    } catch (error: unknown) {
      logger.error({ err: error }, 'Failed to create Firestore client');
      isAvailable = false;
      throw error;
    }
  }
  return client;
}

/**
 * Marks Firestore as unavailable due to API being disabled or permission denied.
 * This is called during initialization if Firestore operations fail due to
 * missing API enablement or credentials.
 */
export function markFirestoreUnavailable(reason: string): void {
  isAvailable = false;
  logger.warn({ reason }, 'Firestore API unavailable; operations will use mock data');
}
