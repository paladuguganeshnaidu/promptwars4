// Operations repository: reads the live operational picture from Firestore
// and advances the simulated crowd-telemetry feed. The simulator stands in
// for real gate/turnstile sensors — swapping it for a sensor ingest keeps
// every read path unchanged (see docs/decisions.md). Pure density logic
// lives in crowd.ts.
//
// If Firestore is unavailable (API disabled, permission denied, etc.),
// operations fall back to mock data so the dashboard remains functional.
import { FieldValue, type QueryDocumentSnapshot } from '@google-cloud/firestore';
import type { z } from 'zod';

import { TELEMETRY_REFILL_MAX_GROWTH } from '../../config/constants.js';
import { COLLECTIONS, getFirestore, SUSTAINABILITY_DOC_ID, isFirestoreAvailable, markFirestoreUnavailable } from '../../lib/firestore.js';
import { logger } from '../../lib/logger.js';
import { getMockSnapshot } from '../../lib/mock-data.js';
import { nextOccupancy, toZoneOccupancy } from './crowd.js';
import { incidentSchema, sustainabilityMetricsSchema, zoneRecordSchema } from './schemas.js';
import { BASELINE_INCIDENTS, BASELINE_SUSTAINABILITY, BASELINE_ZONES } from './seed-data.js';
import type { OpsSnapshot } from './types.js';

/**
 * Parses Firestore documents against a schema, skipping (and logging) any
 * that fail — a corrupt document must never take down the snapshot pipeline.
 */
function parseDocuments<T>(schema: z.ZodType<T>, documents: QueryDocumentSnapshot[]): T[] {
  return documents.flatMap((document) => {
    const parsed = schema.safeParse(document.data());
    if (!parsed.success) {
      logger.warn({ id: document.id }, 'Skipping malformed operations document');
      return [];
    }
    return [parsed.data];
  });
}

/** Seeds baseline zones, incidents and sustainability if the DB is empty. */
export async function ensureSeeded(): Promise<void> {
  if (!isFirestoreAvailable()) {
    logger.info('Firestore unavailable; skipping seeding (mock data will be used)');
    return;
  }

  try {
    const db = getFirestore();
    const existing = await db.collection(COLLECTIONS.zones).limit(1).get();
    if (!existing.empty) {
      return;
    }
    const batch = db.batch();
    for (const zone of BASELINE_ZONES) {
      batch.set(db.collection(COLLECTIONS.zones).doc(zone.id), zone);
    }
    for (const incident of BASELINE_INCIDENTS) {
      batch.set(db.collection(COLLECTIONS.incidents).doc(incident.id), incident);
    }
    batch.set(
      db.collection(COLLECTIONS.sustainability).doc(SUSTAINABILITY_DOC_ID),
      BASELINE_SUSTAINABILITY,
    );
    await batch.commit();
    logger.info('Seeded baseline operations data into Firestore');
  } catch (error: unknown) {
    const errorCode = (error as { code?: string }).code;
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorCode === 'PERMISSION_DENIED' || errorMessage.includes('disabled')) {
      markFirestoreUnavailable(errorMessage);
    } else {
      logger.error({ err: error }, 'Seeding failed');
      throw error;
    }
  }
}

/** Reads the current operational snapshot from Firestore, or mock data if unavailable. */
export async function getSnapshot(): Promise<OpsSnapshot> {
  if (!isFirestoreAvailable()) {
    logger.debug('Firestore unavailable; returning mock snapshot');
    return getMockSnapshot();
  }

  try {
    const db = getFirestore();
    const [zonesSnap, incidentsSnap, sustainabilitySnap] = await Promise.all([
      db.collection(COLLECTIONS.zones).get(),
      db.collection(COLLECTIONS.incidents).get(),
      db.collection(COLLECTIONS.sustainability).doc(SUSTAINABILITY_DOC_ID).get(),
    ]);

    const zones = parseDocuments(zoneRecordSchema, zonesSnap.docs)
      .map(toZoneOccupancy)
      .sort((a, b) => b.densityPct - a.densityPct);
    const incidents = parseDocuments(incidentSchema, incidentsSnap.docs).sort((a, b) =>
      b.reportedAt.localeCompare(a.reportedAt),
    );
    const parsedSustainability = sustainabilityMetricsSchema.safeParse(sustainabilitySnap.data());
    const sustainability = parsedSustainability.success
      ? parsedSustainability.data
      : BASELINE_SUSTAINABILITY;

    return { zones, incidents, sustainability, generatedAt: new Date().toISOString() };
  } catch (error: unknown) {
    const errorCode = (error as { code?: string }).code;
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorCode === 'PERMISSION_DENIED' || errorMessage.includes('disabled')) {
      markFirestoreUnavailable(errorMessage);
      return getMockSnapshot();
    }

    logger.error({ err: error }, 'Failed to read operations snapshot');
    throw error;
  }
}

/**
 * Advances the simulated telemetry feed one tick: nudges every zone's
 * occupancy and grows the water-refill sustainability counter.
 *
 * @param random - Injectable source of randomness for deterministic tests.
 */
export async function advanceTelemetry(random: () => number = Math.random): Promise<void> {
  if (!isFirestoreAvailable()) {
    logger.debug('Firestore unavailable; skipping telemetry tick');
    return;
  }

  try {
    const db = getFirestore();
    const zonesSnap = await db.collection(COLLECTIONS.zones).get();
    if (zonesSnap.empty) {
      return;
    }
    const batch = db.batch();
    for (const doc of zonesSnap.docs) {
      const zone = zoneRecordSchema.safeParse(doc.data());
      if (!zone.success) {
        logger.warn({ id: doc.id }, 'Skipping malformed zone during telemetry tick');
        continue;
      }
      batch.update(doc.ref, { occupancy: nextOccupancy(zone.data, random) });
    }
    const refillGrowth = Math.round(random() * TELEMETRY_REFILL_MAX_GROWTH);
    batch.set(
      db.collection(COLLECTIONS.sustainability).doc(SUSTAINABILITY_DOC_ID),
      { waterRefillCount: FieldValue.increment(refillGrowth) },
      { merge: true },
    );
    await batch.commit();
  } catch (error: unknown) {
    const errorCode = (error as { code?: string }).code;
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorCode === 'PERMISSION_DENIED' || errorMessage.includes('disabled')) {
      markFirestoreUnavailable(errorMessage);
    } else {
      logger.error({ err: error }, 'Telemetry tick failed');
      throw error;
    }
  }
}
